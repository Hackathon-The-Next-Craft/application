import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { requireInterviewer } from "./lib/auth";
import { classify } from "./lib/progress";

export const listForSession = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
    await requireInterviewer(ctx, sessionId);
    return await ctx.db
      .query("alerts")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .order("desc")
      .take(50);
  },
});

export const acknowledge = mutation({
  args: { sessionId: v.id("sessions"), alertId: v.id("alerts") },
  handler: async (ctx, { sessionId, alertId }) => {
    await requireInterviewer(ctx, sessionId);
    await ctx.db.patch(alertId, { acknowledgedAt: Date.now() });
  },
});

/** Corre cada 20s. Reclasifica y emite alertas dedup por (candidato, tipo, ventana). */
export const sweepStuck = internalMutation({
  args: {},
  handler: async (ctx) => {
    const live = await ctx.db
      .query("sessions")
      .filter((q) => q.eq(q.field("status"), "live"))
      .collect();

    for (const session of live) {
      const participants = await ctx.db
        .query("participants")
        .withIndex("by_session", (q) => q.eq("sessionId", session._id))
        .collect();

      for (const p of participants) {
        await classify(ctx, p._id);
        const fresh = await ctx.db.get(p._id);
        if (!fresh || fresh.progress !== "stuck") continue;

        // Dedup: no repetir la misma alerta dentro de 3 minutos. PRD §8.1.
        const recent = await ctx.db
          .query("alerts")
          .withIndex("by_session", (q) =>
            q.eq("sessionId", session._id).gt("at", Date.now() - 180_000))
          .collect();
        if (recent.some((a) => a.participantId === p._id && a.type === "inactivity")) continue;

        await ctx.db.insert("alerts", {
          sessionId: session._id, participantId: p._id,
          type: "inactivity", reason: fresh.progressReason, at: Date.now(),
        });
      }
    }
  },
});
