import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireCandidate, requireInterviewer } from "./lib/auth";

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
    const existing = await ctx.db
      .query("participants")
      .withIndex("by_session", (q) => q.eq("sessionId", session._id))
      .collect();
    if (existing.length >= session.maxCandidates) throw new Error("Sesión llena");

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

/** Estado propio del candidato + estado de la sesión. Nunca datos de pares. */
export const me = query({
  args: { joinToken: v.string() },
  handler: async (ctx, { joinToken }) => {
    const { participant, session } = await requireCandidate(ctx, joinToken);
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
    const participants = await ctx.db
      .query("participants")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .collect();
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
