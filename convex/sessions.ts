import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internalQuery, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireInterviewer } from "./lib/auth";
import { activeParticipants } from "./lib/participants";

/**
 * Ciclo de vida del PRD §5.3. Sin esto setStatus aceptaba cualquier salto —
 * de borrador a cerrada, o de cerrada de vuelta a en vivo— y una UI con el
 * estado desactualizado podía cerrar una sesión sin querer.
 */
const TRANSICIONES: Record<string, string[]> = {
  draft: ["ready", "closed"],
  ready: ["live", "closed"],
  live: ["paused", "closing"],
  paused: ["live", "closing"],
  closing: ["closed"],
  closed: [],
};

function makeJoinCode() {
  return Math.random().toString(36).slice(2, 10);
}

// ── Entrevistador ────────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    title: v.string(),
    role: v.string(),
    seniority: v.string(),
    technologies: v.array(v.string()),
    durationMinutes: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");
    return await ctx.db.insert("sessions", {
      ...args,
      interviewerId: userId,
      maxCandidates: 3,
      status: "draft",
      joinCode: makeJoinCode(),
      linkRevoked: false,
      stuckThresholdSec: 90,
    });
  },
});

/**
 * Guard para actions. Una action no tiene ctx.db, pero su identidad sí llega
 * a runQuery, así que la verificación se hace aquí y la action solo la invoca.
 */
export const assertInterviewer = internalQuery({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
    await requireInterviewer(ctx, sessionId);
    return true;
  },
});

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("sessions")
      .withIndex("by_interviewer", (q) => q.eq("interviewerId", userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
    const { session } = await requireInterviewer(ctx, sessionId);
    return session;
  },
});

/** FR-05. Cambia el estado y deja rastro en el timeline. */
export const setStatus = mutation({
  args: {
    sessionId: v.id("sessions"),
    status: v.union(
      v.literal("ready"), v.literal("live"), v.literal("paused"),
      v.literal("closing"), v.literal("closed"),
    ),
  },
  handler: async (ctx, { sessionId, status }) => {
    const { userId, session } = await requireInterviewer(ctx, sessionId);

    if (!TRANSICIONES[session.status].includes(status)) {
      throw new Error(
        `Transición no permitida: ${session.status} -> ${status}`,
      );
    }

    const now = Date.now();
    await ctx.db.patch(sessionId, {
      status,
      startedAt: status === "live" && !session.startedAt ? now : session.startedAt,
      endsAt:
        status === "live" && !session.endsAt
          ? now + session.durationMinutes * 60_000
          : session.endsAt,
    });
    const map = {
      live: "session.started", paused: "session.paused",
      closed: "session.closed", closing: "session.closed", ready: "session.started",
    } as const;
    await ctx.db.insert("events", {
      sessionId, actorId: userId, type: map[status], at: now, payload: { status },
    });
    // Solo en "closing": es el estado que el PRD §5.3 define como "se bloquean
    // cambios, se consolidan eventos y comienza el análisis". Disparar también
    // en "closed" duplicaba todo, porque cerrar pasa por los dos estados: eran
    // dos generaciones por candidato compitiendo por la misma fila, al doble de
    // costo. Como la tabla de transiciones obliga a pasar por "closing" antes
    // de "closed", aquí no se pierde ningún caso.
    if (status === "closing") {
      for (const p of await activeParticipants(ctx, sessionId)) {
        await ctx.scheduler.runAfter(0, internal.reports.generateInternal, {
          sessionId,
          participantId: p._id,
        });
      }
    }
  },
});

/** FR-02. Un link revocado no admite ingresos nuevos. */
export const setLinkRevoked = mutation({
  args: { sessionId: v.id("sessions"), revoked: v.boolean() },
  handler: async (ctx, { sessionId, revoked }) => {
    await requireInterviewer(ctx, sessionId);
    await ctx.db.patch(sessionId, { linkRevoked: revoked });
  },
});

/**
 * Borra la sesión y todo lo que cuelga de ella. No hay papelera: los eventos,
 * el código y los informes se van con ella, así que la UI confirma antes.
 *
 * Se bloquea mientras está en vivo o pausada: hay candidatos dentro y
 * quedarían con la pantalla rota a media prueba. Hay que cerrarla primero.
 */
export const remove = mutation({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
    const { session } = await requireInterviewer(ctx, sessionId);
    if (session.status === "live" || session.status === "paused") {
      throw new Error("Cierra la sesión antes de eliminarla");
    }

    // Mismo barrido que seed.clear: primero los hijos, la sesión al final.
    for (const table of [
      "participants",
      "challenges",
      "workspaces",
      "events",
      "alerts",
      "notes",
      "reports",
    ] as const) {
      const rows = await ctx.db
        .query(table)
        .filter((q) => q.eq(q.field("sessionId"), sessionId))
        .collect();
      for (const row of rows) await ctx.db.delete(row._id);
    }

    await ctx.db.delete(sessionId);
  },
});

// ── Candidato (público, sin auth) ────────────────────────────────────────────

/** Lo que ve la página /join/[code] antes de que exista un participante. */
export const publicInfo = query({
  args: { joinCode: v.string() },
  handler: async (ctx, { joinCode }) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_joinCode", (q) => q.eq("joinCode", joinCode))
      .unique();
    if (!session || session.linkRevoked) return null;
    // Los retirados no ocupan cupo. Si se cuentan aquí, el candidato ve
    // "sala llena" aunque join sí lo dejaría entrar.
    const count = (await activeParticipants(ctx, session._id)).length;
    // Nunca exponer interviewerId, retos sin publicar ni otros candidatos.
    return {
      title: session.title,
      role: session.role,
      durationMinutes: session.durationMinutes,
      status: session.status,
      full: count >= session.maxCandidates,
    };
  },
});
