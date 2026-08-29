import { v } from "convex/values";
import { action, internalAction, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requireInterviewer } from "./lib/auth";

export const forParticipant = query({
  args: { sessionId: v.id("sessions"), participantId: v.id("participants") },
  handler: async (ctx, { sessionId, participantId }) => {
    await requireInterviewer(ctx, sessionId);
    return await ctx.db
      .query("reports")
      .withIndex("by_participant", (q) => q.eq("participantId", participantId))
      .unique();
  },
});

/** FR-17: la UI resuelve estos ids para mostrar la evidencia clickeable. */
export const evidence = query({
  args: { sessionId: v.id("sessions"), eventIds: v.array(v.id("events")) },
  handler: async (ctx, { sessionId, eventIds }) => {
    await requireInterviewer(ctx, sessionId);
    const events = await Promise.all(eventIds.map((id) => ctx.db.get(id)));
    return events.filter((e) => e && e.sessionId === sessionId);
  },
});

/**
 * Generación del reporte. Escribe por partes (pending -> generating -> done),
 * así la UI lo ve aparecer con un useQuery normal, sin streaming.
 */
async function generateFor(
  ctx: any,
  sessionId: Id<"sessions">,
  participantId: Id<"participants">,
) {
  const reportId = await ctx.runMutation(internal.reports.upsertPending, {
    sessionId,
    participantId,
  });
  try {
    const input = await ctx.runQuery(internal.reports.gatherInput, {
      sessionId,
      participantId,
    });
    const result = await ctx.runAction(internal.ai.evaluate.run, input);
    await ctx.runMutation(internal.reports.finish, { reportId, result });
  } catch (error) {
    // Un reporte fallido no puede quedarse en "generating" para siempre: el
    // entrevistador tiene que ver que algo salió mal y poder reintentar.
    await ctx.runMutation(internal.reports.fail, {
      reportId,
      message: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/** La dispara el scheduler al cerrar la sesión: corre sin usuario autenticado. */
export const generateInternal = internalAction({
  args: { sessionId: v.id("sessions"), participantId: v.id("participants") },
  handler: async (ctx, { sessionId, participantId }): Promise<null> => {
    await generateFor(ctx, sessionId, participantId);
    return null;
  },
});

/** Reintento manual desde la UI. Aquí sí hay usuario, así que se verifica. */
export const generate = action({
  args: { sessionId: v.id("sessions"), participantId: v.id("participants") },
  handler: async (ctx, { sessionId, participantId }): Promise<null> => {
    await ctx.runQuery(internal.sessions.assertInterviewer, { sessionId });
    await generateFor(ctx, sessionId, participantId);
    return null;
  },
});

export const upsertPending = internalMutation({
  args: { sessionId: v.id("sessions"), participantId: v.id("participants") },
  handler: async (ctx, { sessionId, participantId }) => {
    const existing = await ctx.db
      .query("reports")
      .withIndex("by_participant", (q) => q.eq("participantId", participantId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { status: "generating" });
      return existing._id;
    }
    return await ctx.db.insert("reports", {
      sessionId, participantId, status: "generating",
    });
  },
});

/** Interna: junta todo el material del candidato para la IA. Nunca pública —
 * devuelve notas privadas y el timeline completo. */
export const gatherInput = internalQuery({
  args: { sessionId: v.id("sessions"), participantId: v.id("participants") },
  handler: async (ctx, { sessionId, participantId }) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_participant", (q) => q.eq("participantId", participantId))
      .collect();
    const challenges = await ctx.db
      .query("challenges")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .collect();
    const notes = await ctx.db
      .query("notes")
      .withIndex("by_participant", (q) => q.eq("participantId", participantId))
      .collect();
    const finalCode = await ctx.db
      .query("workspaces")
      .withIndex("by_participant", (q) => q.eq("participantId", participantId))
      .collect();
    return { events, challenges, notes, finalCode };
  },
});

export const finish = internalMutation({
  args: { reportId: v.id("reports"), result: v.any() },
  handler: async (ctx, { reportId, result }) => {
    await ctx.db.patch(reportId, { status: "done", ...result });
  },
});

export const fail = internalMutation({
  args: { reportId: v.id("reports"), message: v.string() },
  handler: async (ctx, { reportId, message }) => {
    await ctx.db.patch(reportId, {
      status: "failed",
      limitations: `No se pudo generar el reporte: ${message}`,
    });
  },
});

/** FR-18. La decisión es humana y queda auditada. */
export const setDecision = mutation({
  args: {
    sessionId: v.id("sessions"),
    reportId: v.id("reports"),
    value: v.union(v.literal("advance"), v.literal("hold"), v.literal("reject")),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, { sessionId, reportId, value, comment }) => {
    await requireInterviewer(ctx, sessionId);
    const userId = (await getAuthUserId(ctx))!;
    await ctx.db.patch(reportId, {
      decision: { value, by: userId, at: Date.now(), comment },
    });
  },
});
