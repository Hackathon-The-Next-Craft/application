import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireCandidate, requireInterviewer, resolveCandidate } from "./lib/auth";

const NOTICE_VERSION = "2026-08-29";

/** FR-03 + §11.1. Devuelve el joinToken UNA vez; el cliente lo guarda. */
export const join = mutation({
  args: {
    joinCode: v.string(),
    displayName: v.string(),
    consentAudio: v.boolean(),
    consentTranscript: v.boolean(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_joinCode", (q) => q.eq("joinCode", args.joinCode))
      .unique();
    if (!session || session.linkRevoked) throw new Error("Enlace no válido");

    // PRD §13.3: el audio es parte de la dinámica de la entrevista, así que su
    // consentimiento es obligatorio. La transcripción sigue siendo opt-in.
    if (!args.consentAudio) {
      throw new Error(
        "Para participar es necesario aceptar el uso de audio durante la entrevista",
      );
    }

    // Los retirados no ocupan cupo: si no, un candidato que limpió su navegador
    // dejaría la sala llena de fantasmas y sin forma de recuperarla.
    const active = (
      await ctx.db
        .query("participants")
        .withIndex("by_session", (q) => q.eq("sessionId", session._id))
        .collect()
    ).filter((p) => p.presence !== "removed");
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
  args: { joinToken: v.string(), micOk: v.boolean(), error: v.optional(v.string()) },
  handler: async (ctx, { joinToken, micOk, error }) => {
    const { participant } = await requireCandidate(ctx, joinToken);
    await ctx.db.patch(participant._id, {
      presence: micOk ? "ready" : "lobby",
      deviceCheck: { micOk, error },
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
    const participants = (
      await ctx.db
        .query("participants")
        .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
        .collect()
    ).filter((p) => p.presence !== "removed");
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
