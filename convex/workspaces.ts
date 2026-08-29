import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertOwnsWorkspace, requireCandidate, requireInterviewer } from "./lib/auth";
import { classify } from "./lib/progress";

/** Retos publicados + código propio. Único punto de lectura del candidato. */
export const mine = query({
  args: { joinToken: v.string() },
  handler: async (ctx, { joinToken }) => {
    const { participant, session } = await requireCandidate(ctx, joinToken);
    if (session.status !== "live" && session.status !== "paused") return null;

    const challenges = (
      await ctx.db.query("challenges")
        .withIndex("by_session", (q) => q.eq("sessionId", session._id)).collect()
    )
      .filter((c) => c.published)                       // FR-07
      .sort((a, b) => a.order - b.order)
      .map(({ referenceSolution, interviewerGuide, tests, ...c }) => ({
        ...c,
        // FR-08: los tests ocultos no revelan la solución.
        tests: tests.filter((t) => !t.hidden),
      }));

    const workspaces = await ctx.db
      .query("workspaces")
      .withIndex("by_participant", (q) => q.eq("participantId", participant._id))
      .collect();

    return { challenges, workspaces, paused: session.status === "paused" };
  },
});

/** Crea el workspace la primera vez que el candidato abre un reto. */
export const ensure = mutation({
  args: { joinToken: v.string(), challengeId: v.id("challenges") },
  handler: async (ctx, { joinToken, challengeId }) => {
    const { participant, session } = await requireCandidate(ctx, joinToken);
    const existing = await ctx.db
      .query("workspaces")
      .withIndex("by_participant_challenge", (q) =>
        q.eq("participantId", participant._id).eq("challengeId", challengeId))
      .unique();
    if (existing) return existing._id;
    const challenge = await ctx.db.get(challengeId);
    if (!challenge || challenge.sessionId !== session._id || !challenge.published) {
      throw new Error("Reto no disponible");
    }
    return await ctx.db.insert("workspaces", {
      sessionId: session._id,
      participantId: participant._id,
      challengeId,
      code: challenge.starterCode,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Autosave. Anjali llama esto con debounce ~400ms, NO por tecla.
 * Guarda snapshot + un checkpoint consolidado en events (PRD §8.1).
 */
export const save = mutation({
  args: { joinToken: v.string(), workspaceId: v.id("workspaces"), code: v.string() },
  handler: async (ctx, { joinToken, workspaceId, code }) => {
    const { participant, session } = await requireCandidate(ctx, joinToken);
    if (session.status === "paused" || session.status === "closed") return;
    const ws = await ctx.db.get(workspaceId);
    if (!ws) throw new Error("Workspace no encontrado");
    assertOwnsWorkspace(participant, ws);

    const now = Date.now();
    await ctx.db.patch(workspaceId, { code, updatedAt: now });
    await ctx.db.patch(participant._id, { lastActivityAt: now });
    await ctx.db.insert("events", {
      sessionId: session._id, participantId: participant._id,
      type: "code.checkpoint", at: now,
      payload: { workspaceId, chars: code.length },
    });
    await classify(ctx, participant._id);
  },
});

/**
 * El código se ejecuta en el NAVEGADOR del candidato (Pyodide / Web Worker).
 * Aquí solo se persiste el resultado como evidencia.
 * TODO(post-hackathon): mover a sandbox server-side (E2B/Judge0) — PRD §11.2.
 */
export const recordRun = mutation({
  args: {
    joinToken: v.string(),
    workspaceId: v.id("workspaces"),
    stdout: v.string(),
    stderr: v.string(),
    passed: v.number(),
    total: v.number(),
    durationMs: v.number(),
  },
  handler: async (ctx, { joinToken, workspaceId, ...run }) => {
    const { participant, session } = await requireCandidate(ctx, joinToken);
    const ws = await ctx.db.get(workspaceId);
    if (!ws) throw new Error("Workspace no encontrado");
    assertOwnsWorkspace(participant, ws);

    const now = Date.now();
    await ctx.db.patch(workspaceId, { lastRun: { at: now, ...run }, updatedAt: now });
    await ctx.db.patch(participant._id, { lastActivityAt: now });
    await ctx.db.insert("events", {
      sessionId: session._id, participantId: participant._id,
      type: "code.run", at: now, payload: { workspaceId, ...run },
    });
    await ctx.db.insert("events", {
      sessionId: session._id, participantId: participant._id,
      type: "test.result", at: now + 1,
      payload: { workspaceId, passed: run.passed, total: run.total },
    });
    await classify(ctx, participant._id);
  },
});

export const submit = mutation({
  args: { joinToken: v.string(), workspaceId: v.id("workspaces") },
  handler: async (ctx, { joinToken, workspaceId }) => {
    const { participant, session } = await requireCandidate(ctx, joinToken);
    const ws = await ctx.db.get(workspaceId);
    if (!ws) throw new Error("Workspace no encontrado");
    assertOwnsWorkspace(participant, ws);
    const now = Date.now();
    await ctx.db.patch(workspaceId, { submittedAt: now });
    await ctx.db.insert("events", {
      sessionId: session._id, participantId: participant._id,
      type: "challenge.submitted", at: now, payload: { workspaceId },
    });
    await classify(ctx, participant._id);
  },
});

/** FR-11. Foco en un candidato: código completo + su última ejecución. */
export const focus = query({
  args: { sessionId: v.id("sessions"), participantId: v.id("participants") },
  handler: async (ctx, { sessionId, participantId }) => {
    await requireInterviewer(ctx, sessionId);
    return await ctx.db
      .query("workspaces")
      .withIndex("by_participant", (q) => q.eq("participantId", participantId))
      .collect();
  },
});
