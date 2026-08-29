import { v } from "convex/values";
import { action, internalMutation, mutation, query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { requireInterviewer } from "./lib/auth";

export const listForSession = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
    await requireInterviewer(ctx, sessionId);
    return await ctx.db
      .query("challenges")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .collect();
  },
});

/**
 * FR-06. La IA PROPONE; no publica. El resultado entra como published: false
 * y el entrevistador lo edita antes de que ningún candidato lo vea.
 */
export const generate = action({
  args: { sessionId: v.id("sessions"), prompt: v.string(), count: v.number() },
  handler: async (ctx, { sessionId, prompt, count }): Promise<null> => {
    // Una action no tiene ctx.db: la verificación se delega a una internalQuery,
    // que sí recibe la identidad del usuario. Va ANTES de llamar al modelo para
    // no gastar una llamada de API en alguien que no es dueño de la sesión.
    await ctx.runQuery(internal.sessions.assertInterviewer, { sessionId });

    const drafts = await ctx.runAction(internal.ai.generateChallenge.run, {
      prompt, count,
    });
    await ctx.runMutation(internal.challenges.insertDrafts, { sessionId, drafts });
    return null;
  },
});

export const insertDrafts = internalMutation({
  args: { sessionId: v.id("sessions"), drafts: v.array(v.any()) },
  handler: async (ctx, { sessionId, drafts }) => {
    for (const [i, d] of drafts.entries()) {
      await ctx.db.insert("challenges", {
        sessionId,
        order: i,
        title: d.title,
        statement: d.statement,
        language: d.language,
        starterCode: d.starterCode,
        entryPoint: d.entryPoint,
        timeLimitMinutes: d.timeLimitMinutes ?? 30,
        rubric: d.rubric ?? [],
        criticalAspects: d.criticalAspects ?? [],
        tests: d.tests ?? [],
        referenceSolution: d.referenceSolution,
        interviewerGuide: d.interviewerGuide,
        published: false,           // FR-07
        generatedBy: d.promptVersion,
      });
    }
  },
});

export const update = mutation({
  args: { challengeId: v.id("challenges"), patch: v.any() },
  handler: async (ctx, { challengeId, patch }) => {
    const challenge = await ctx.db.get(challengeId);
    if (!challenge) throw new Error("Reto no encontrado");
    await requireInterviewer(ctx, challenge.sessionId);
    await ctx.db.patch(challengeId, patch);
  },
});

export const publish = mutation({
  args: { challengeId: v.id("challenges"), published: v.boolean() },
  handler: async (ctx, { challengeId, published }) => {
    const challenge = await ctx.db.get(challengeId);
    if (!challenge) throw new Error("Reto no encontrado");
    await requireInterviewer(ctx, challenge.sessionId);
    await ctx.db.patch(challengeId, { published });
  },
});

/**
 * Bloqueada si algún candidato ya abrió el reto: borrarlo ahí dejaría su
 * workspace apuntando a un challengeId inexistente, y su código y sus
 * ejecuciones son evidencia del reporte. Despublicar es la salida segura.
 */
export const remove = mutation({
  args: { challengeId: v.id("challenges") },
  handler: async (ctx, { challengeId }) => {
    const challenge = await ctx.db.get(challengeId);
    if (!challenge) throw new Error("Reto no encontrado");
    await requireInterviewer(ctx, challenge.sessionId);

    const abierto = await ctx.db
      .query("workspaces")
      .withIndex("by_session", (q) => q.eq("sessionId", challenge.sessionId))
      .filter((q) => q.eq(q.field("challengeId"), challengeId))
      .take(1);
    if (abierto.length > 0) {
      throw new Error(
        "No se puede borrar: al menos un candidato ya abrió este reto. Despublícalo en su lugar.",
      );
    }

    await ctx.db.delete(challengeId);
  },
});
