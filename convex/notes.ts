import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireInterviewer } from "./lib/auth";

/** FR-15. Privadas: no existe ninguna función de candidato que las lea. */
export const add = mutation({
  args: {
    sessionId: v.id("sessions"),
    participantId: v.id("participants"),
    text: v.string(),
  },
  handler: async (ctx, { sessionId, participantId, text }) => {
    const { userId } = await requireInterviewer(ctx, sessionId);
    const now = Date.now();
    await ctx.db.insert("notes", {
      sessionId, participantId, interviewerId: userId, text, anchorAt: now,
    });
    await ctx.db.insert("events", {
      sessionId, participantId, actorId: userId,
      type: "note.added", at: now, payload: { text },
    });
  },
});

/** FR-14. Registrar una ayuda brindada — queda en timeline y reporte. */
export const logHelpGiven = mutation({
  args: {
    sessionId: v.id("sessions"),
    participantId: v.id("participants"),
    description: v.string(),
  },
  handler: async (ctx, { sessionId, participantId, description }) => {
    const { userId } = await requireInterviewer(ctx, sessionId);
    await ctx.db.insert("events", {
      sessionId, participantId, actorId: userId,
      type: "help.given", at: Date.now(), payload: { description },
    });
  },
});

export const listForParticipant = query({
  args: { sessionId: v.id("sessions"), participantId: v.id("participants") },
  handler: async (ctx, { sessionId, participantId }) => {
    await requireInterviewer(ctx, sessionId);
    return await ctx.db
      .query("notes")
      .withIndex("by_participant", (q) => q.eq("participantId", participantId))
      .collect();
  },
});
