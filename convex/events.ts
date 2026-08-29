import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireInterviewer } from "./lib/auth";

/** Timeline del entrevistador. Fuente de la evidencia del reporte. */
export const timeline = query({
  args: {
    sessionId: v.id("sessions"),
    participantId: v.optional(v.id("participants")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { sessionId, participantId, limit }) => {
    await requireInterviewer(ctx, sessionId);
    const q = participantId
      ? ctx.db.query("events").withIndex("by_participant", (x) => x.eq("participantId", participantId))
      : ctx.db.query("events").withIndex("by_session", (x) => x.eq("sessionId", sessionId));
    return await q.order("desc").take(limit ?? 100);
  },
});
