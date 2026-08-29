import { v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";
import { requireCandidate, requireInterviewer, resolveCandidate } from "./lib/auth";
import { activeParticipants } from "./lib/participants";
import { ESTADOS_QUE_ADMITEN } from "./sessions";

const NOTICE_VERSION = "2026-08-29";

/** FR-03 + §11.1. Devuelve el joinToken UNA vez; el cliente lo guarda. */
export const join = mutation({
  args: {
    joinCode: v.string(),
    displayName: v.string(),
    consentAudio: v.boolean(),
    consentTranscript: v.boolean(),
    consentCamera: v.boolean(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_joinCode", (q) => q.eq("joinCode", args.joinCode))
      .unique();
    if (!session || session.linkRevoked) throw new Error("Enlace no válido");

    // Sin esto, un candidato entraba a una sesión en borrador: el reto todavía
    // no estaba aprobado y el entrevistador ni sabía que había alguien dentro.
    if (!ESTADOS_QUE_ADMITEN.includes(session.status)) {
      throw new Error(
        session.status === "draft"
          ? "La sesión todavía no está abierta. Espera a que el entrevistador te avise."
          : "Esta sesión ya terminó.",
      );
    }

    // Los tres son condición de entrada, no preferencias.
    //
    // El PRD §11.1 pide consentimiento granular, y lo sigue siendo: se explica
    // cada cosa por separado y hay que aceptarla explícitamente. Lo que cambia
    // es que ninguna es opcional, y §11.1 contempla exactamente eso —"si una
    // organización requiere audio para su proceso, la condición se debe
    // comunicar antes de la sesión"—. Por eso la pantalla las presenta como
    // condiciones y no como casillas sueltas: sin cámara el entrevistador no ve
    // a quien entrevista, y sin transcripción el razonamiento hablado no cuenta
    // como evidencia y el reporte queda cojo.
    const faltantes = [
      !args.consentAudio && "audio",
      !args.consentCamera && "cámara",
      !args.consentTranscript && "transcripción",
    ].filter(Boolean);
    if (faltantes.length > 0) {
      throw new Error(
        `Para participar hay que aceptar: ${faltantes.join(", ")}.`,
      );
    }

    // Los retirados no ocupan cupo: si no, un candidato que limpió su navegador
    // dejaría la sala llena de fantasmas y sin forma de recuperarla.
    const active = await activeParticipants(ctx, session._id);
    if (active.length >= session.maxCandidates) throw new Error("Sesión llena");

    const joinToken = crypto.randomUUID();
    const now = Date.now();
    const participantId = await ctx.db.insert("participants", {
      sessionId: session._id,
      displayName: args.displayName,
      joinToken,
      presence: "lobby",
      consent: {
        audio: args.consentAudio,
        transcript: args.consentTranscript,
        camera: args.consentCamera,
        acceptedAt: now,
        noticeVersion: NOTICE_VERSION,
      },
      progress: "idle",
      progressReason: "Aún no inicia la sesión",
      lastActivityAt: now,
    });
    await ctx.db.insert("events", {
      sessionId: session._id, participantId, type: "participant.joined",
      at: now, payload: { displayName: args.displayName },
    });
    return { joinToken, participantId, sessionId: session._id };
  },
});

/**
 * Estado propio del candidato + estado de la sesión. Nunca datos de pares.
 * Usa el resolver laxo a propósito: si lo retiraron, la UI necesita poder
 * decírselo en vez de mostrarle un error genérico.
 */
export const me = query({
  args: { joinToken: v.string() },
  handler: async (ctx, { joinToken }) => {
    const { participant, session } = await resolveCandidate(ctx, joinToken);
    return {
      participant,
      session: { _id: session._id, status: session.status, title: session.title, endsAt: session.endsAt },
    };
  },
});

export const setReady = mutation({
  args: {
    joinToken: v.string(),
    micOk: v.boolean(),
    cameraOk: v.boolean(),
    error: v.optional(v.string()),
  },
  handler: async (ctx, { joinToken, micOk, cameraOk, error }) => {
    const { participant } = await requireCandidate(ctx, joinToken);
    // Listo solo si los dos responden: ahora ambos son necesarios.
    await ctx.db.patch(participant._id, {
      presence: micOk && cameraOk ? "ready" : "lobby",
      deviceCheck: { micOk, cameraOk, error },
    });
  },
});

/** FR-13. El candidato levanta la mano. */
export const requestHelp = mutation({
  args: { joinToken: v.string(), message: v.optional(v.string()) },
  handler: async (ctx, { joinToken, message }) => {
    const { participant, session } = await requireCandidate(ctx, joinToken);
    const now = Date.now();
    await ctx.db.insert("events", {
      sessionId: session._id, participantId: participant._id,
      type: "help.requested", at: now, payload: { message },
    });
    await ctx.db.insert("alerts", {
      sessionId: session._id, participantId: participant._id,
      type: "help_requested",
      reason: message ?? `${participant.displayName} pidió ayuda`,
      at: now,
    });
  },
});

// ── Vista del entrevistador ──────────────────────────────────────────────────

/** El mosaico. Un solo useQuery alimenta toda la pantalla /live. */
export const listForSession = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
    await requireInterviewer(ctx, sessionId);
    const participants = await activeParticipants(ctx, sessionId);
    return await Promise.all(
      participants.map(async (p) => {
        const workspaces = await ctx.db
          .query("workspaces")
          .withIndex("by_participant", (q) => q.eq("participantId", p._id))
          .collect();
        const active = workspaces.sort((a, b) => b.updatedAt - a.updatedAt)[0] ?? null;
        // joinToken NO se filtra al panel.
        const { joinToken: _omit, ...safe } = p;
        return {
          ...safe,
          currentCode: active?.code ?? "",
          lastRun: active?.lastRun ?? null,
          currentChallengeId: active?.challengeId ?? null,
        };
      }),
    );
  },
});

/**
 * Retira a un participante de la sesión. Es la salida para el caso en que un
 * candidato pierde su token y vuelve a entrar: su fila vieja queda huérfana
 * ocupando cupo, y nadie más podía liberarla.
 *
 * No se borra la fila. Sus eventos son la evidencia del reporte y borrarlos
 * sería destruir el historial de la sesión.
 *
 * Deliberadamente NO existe un "reconectar por nombre": eso le entregaría el
 * workspace de un candidato a cualquiera que escriba su nombre en el formulario.
 */
export const remove = mutation({
  args: {
    sessionId: v.id("sessions"),
    participantId: v.id("participants"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { sessionId, participantId, reason }) => {
    const { userId } = await requireInterviewer(ctx, sessionId);
    const participant = await ctx.db.get(participantId);
    if (!participant || participant.sessionId !== sessionId) {
      throw new Error("Participante no encontrado");
    }
    await ctx.db.patch(participantId, {
      presence: "removed",
      progressReason: reason ?? "Retirado por el entrevistador",
    });
    await ctx.db.insert("events", {
      sessionId,
      participantId,
      actorId: userId,
      type: "participant.removed",
      at: Date.now(),
      payload: { displayName: participant.displayName, reason },
    });
  },
});

/** Para convex/media.ts: una action no tiene ctx.db y necesita resolver el token. */
export const forMedia = internalQuery({
  args: { joinToken: v.string() },
  handler: async (ctx, { joinToken }) => {
    const { participant, session } = await requireCandidate(ctx, joinToken);
    return {
      participantId: participant._id,
      sessionId: session._id,
      displayName: participant.displayName,
      cameraConsent: participant.consent.camera === true,
    };
  },
});
