import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Datos de demo para no desarrollar contra una pantalla vacía.
 *
 * Crea una sesión EN VIVO con un reto publicado y tres candidatos en estados
 * distintos, con timeline de eventos y alertas coherentes. Es lo que alimenta
 * el mosaico mientras Anjali lo construye.
 *
 * Habilitar una sola vez por deployment:
 *   npx convex env set ALLOW_SEED true
 *
 * Correr:
 *   npx convex run seed:demo '{}'                        # nuevo entrevistador ficticio
 *   npx convex run seed:demo '{"email":"tu@correo.com"}' # lo cuelga de TU cuenta
 *   npx convex run seed:clear '{}'                       # borra todo lo sembrado
 */

const SEED_PREFIX = "[SEED]";

function assertSeedAllowed() {
  if (process.env.ALLOW_SEED !== "true") {
    throw new Error(
      "Seed deshabilitado. Actívalo con: npx convex env set ALLOW_SEED true",
    );
  }
}

const STARTER = `// Agrupa los eventos por día (YYYY-MM-DD) en orden cronológico.
function groupByDay(events) {
  // tu código aquí
}

module.exports = { groupByDay };
`;

// Código verosímil por candidato: cada uno está en un punto distinto.
const CODE_ANA = `function groupByDay(events) {
  const out = {};
  for (const e of events) {
    const day = new Date(e.timestamp).toISOString().slice(0, 10);
    (out[day] ||= []).push(e);
  }
  for (const day of Object.keys(out)) {
    out[day].sort((a, b) => a.timestamp - b.timestamp);
  }
  return out;
}

module.exports = { groupByDay };
`;

const CODE_BETO = `function groupByDay(events) {
  // ¿uso reduce o un for normal? probemos reduce
  return events.reduce((acc, e) => {
    const day = e.timestamp.split("T")[0];
    acc[day] = acc[day] || [];
    acc[day].push(e);
    return acc;
  }, {});
}

module.exports = { groupByDay };
`;

const CODE_CARLA = `function groupByDay(events) {
  const out = {};
  events.forEach(e => {
    const day = new Date(e.timestamp).toISODate();
    out[day].push(e);
  });
  return out;
}

module.exports = { groupByDay };
`;

const CARLA_ERROR = "TypeError: Cannot read properties of undefined (reading 'push')";

export const demo = mutation({
  args: { email: v.optional(v.string()) },
  handler: async (ctx, { email }) => {
    assertSeedAllowed();

    // El entrevistador: quien llama si está autenticado, si no el del email,
    // y como último recurso uno ficticio (sirve para ver datos, no para login).
    let interviewerId: Id<"users"> | null = await getAuthUserId(ctx);
    if (!interviewerId && email) {
      const found = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), email))
        .first();
      interviewerId = found?._id ?? null;
    }
    if (!interviewerId) {
      interviewerId = await ctx.db.insert("users", {
        name: `${SEED_PREFIX} Entrevistador demo`,
        email: email ?? "demo@liveroom.test",
      });
    }

    const now = Date.now();
    const startedAt = now - 18 * 60_000; // la sesión lleva 18 minutos

    const sessionId = await ctx.db.insert("sessions", {
      interviewerId,
      title: `${SEED_PREFIX} Frontend Engineer — React`,
      role: "Frontend Engineer",
      seniority: "mid",
      technologies: ["JavaScript", "React"],
      durationMinutes: 45,
      maxCandidates: 3,
      status: "live",
      joinCode: "demo1234",
      linkRevoked: false,
      startedAt,
      endsAt: startedAt + 45 * 60_000,
      stuckThresholdSec: 90,
    });

    const challengeId = await ctx.db.insert("challenges", {
      sessionId,
      order: 0,
      title: "Agrupar eventos por día",
      statement: [
        "Dado un arreglo de eventos con un campo `timestamp` (ISO 8601),",
        "devuelve un objeto que agrupe los eventos por día `YYYY-MM-DD`.",
        "",
        "Dentro de cada día, los eventos deben quedar en orden cronológico.",
        "",
        "**Restricciones:** sin librerías externas. Considera el caso de un",
        "arreglo vacío y el de timestamps inválidos.",
      ].join("\n"),
      language: "javascript",
      starterCode: STARTER,
      timeLimitMinutes: 30,
      rubric: [
        {
          criterion: "Corrección",
          weight: 0.4,
          observableSignals: ["Tests pasados", "Maneja arreglo vacío"],
        },
        {
          criterion: "Manejo de casos borde",
          weight: 0.3,
          observableSignals: ["Timestamps inválidos", "Días sin eventos"],
        },
        {
          criterion: "Claridad del código",
          weight: 0.3,
          observableSignals: ["Nombres explícitos", "Sin lógica duplicada"],
        },
      ],
      criticalAspects: [
        "Agrupa correctamente por día en UTC",
        "Ordena cronológicamente dentro de cada grupo",
        "No revienta con un arreglo vacío",
        "Reconoce timestamps inválidos en vez de propagarlos",
      ],
      tests: [
        { name: "agrupa dos días", input: "[...]", expected: "{...}", hidden: false },
        { name: "arreglo vacío", input: "[]", expected: "{}", hidden: false },
        { name: "orden dentro del día", input: "[...]", expected: "{...}", hidden: false },
        { name: "timestamp inválido", input: "[...]", expected: "throws", hidden: true },
        { name: "cruce de medianoche UTC", input: "[...]", expected: "{...}", hidden: true },
        { name: "1000 eventos", input: "[...]", expected: "{...}", hidden: true },
      ],
      referenceSolution: CODE_ANA,
      interviewerGuide:
        "Si resuelve rápido, pregunta por zonas horarias y por el costo de ordenar.",
      published: true,
      generatedBy: "seed-v1",
    });

    // ── Los tres candidatos, cada uno en un estado distinto del clasificador ──
    const people = [
      {
        name: "Ana Torres",
        code: CODE_ANA,
        progress: "advancing" as const,
        reason: "Pasó 4/6 tests",
        idleMs: 4_000,
        run: { stdout: "4 passed, 2 failed", stderr: "", passed: 4, total: 6, durationMs: 142 },
      },
      {
        name: "Beto Ramírez",
        code: CODE_BETO,
        progress: "exploring" as const,
        reason: "Editando sin ejecutar todavía",
        idleMs: 12_000,
        run: null,
      },
      {
        name: "Carla Méndez",
        code: CODE_CARLA,
        progress: "stuck" as const,
        reason: `Mismo error en 3 ejecuciones seguidas: ${CARLA_ERROR}`,
        // Por debajo del umbral de inactividad a propósito: así la razón que
        // muestra el panel es el error repetido, que es la señal interesante.
        idleMs: 40_000,
        run: { stdout: "", stderr: CARLA_ERROR, passed: 0, total: 6, durationMs: 88 },
      },
    ];

    const participantIds: Id<"participants">[] = [];

    for (const p of people) {
      const joinedAt = startedAt + 30_000;
      const participantId = await ctx.db.insert("participants", {
        sessionId,
        displayName: p.name,
        joinToken: crypto.randomUUID(),
        presence: "live",
        consent: {
          audio: true,
          transcript: false,
          acceptedAt: joinedAt,
          noticeVersion: "2026-08-29",
        },
        deviceCheck: { micOk: true },
        progress: p.progress,
        progressReason: p.reason,
        lastActivityAt: now - p.idleMs,
      });
      participantIds.push(participantId);

      await ctx.db.insert("workspaces", {
        sessionId,
        participantId,
        challengeId,
        code: p.code,
        lastRun: p.run ? { at: now - p.idleMs, ...p.run } : undefined,
        updatedAt: now - p.idleMs,
      });

      // Timeline: entrada, edición, y ejecuciones si las hubo.
      await ctx.db.insert("events", {
        sessionId, participantId, type: "participant.joined",
        at: joinedAt, payload: { displayName: p.name },
      });
      for (let i = 1; i <= 4; i++) {
        await ctx.db.insert("events", {
          sessionId, participantId, type: "code.checkpoint",
          at: joinedAt + i * 90_000,
          payload: { chars: Math.round(p.code.length * (i / 4)) },
        });
      }
      if (p.run) {
        // Carla repite el mismo error tres veces: eso es lo que la marca atascada.
        const runs = p.progress === "stuck" ? 3 : 1;
        for (let i = 0; i < runs; i++) {
          const at = now - p.idleMs - (runs - 1 - i) * 45_000;
          await ctx.db.insert("events", {
            sessionId, participantId, type: "code.run", at, payload: p.run,
          });
          await ctx.db.insert("events", {
            sessionId, participantId, type: "test.result", at: at + 1,
            payload: { passed: p.run.passed, total: p.run.total },
          });
        }
      }
      await ctx.db.insert("events", {
        sessionId, participantId, type: "state.changed",
        at: now - p.idleMs + 2, payload: { state: p.progress, reason: p.reason },
      });
    }

    // Alertas coherentes con lo anterior.
    await ctx.db.insert("alerts", {
      sessionId,
      participantId: participantIds[2],
      type: "repeated_error",
      reason: `Carla Méndez: ${CARLA_ERROR} en 3 ejecuciones seguidas`,
      at: now - 40_000,
    });
    await ctx.db.insert("alerts", {
      sessionId,
      participantId: participantIds[1],
      type: "help_requested",
      reason: "Beto Ramírez pidió ayuda: ¿los timestamps vienen siempre en UTC?",
      at: now - 15_000,
    });

    // Una nota privada, para que la pantalla de reporte tenga qué mostrar.
    await ctx.db.insert("notes", {
      sessionId,
      participantId: participantIds[0],
      interviewerId,
      text: "Explicó bien por qué ordena dentro de cada grupo. Profundizar en zonas horarias.",
      anchorAt: now - 120_000,
    });

    return {
      sessionId,
      joinCode: "demo1234",
      interviewerUrl: `/s/${sessionId}/live`,
      candidateUrl: "/join/demo1234",
      participants: participantIds.length,
    };
  },
});

/** Borra únicamente lo sembrado (sesiones con el prefijo [SEED]) y sus hijos. */
export const clear = mutation({
  args: {},
  handler: async (ctx) => {
    assertSeedAllowed();
    const sessions = (await ctx.db.query("sessions").collect()).filter((s) =>
      s.title.startsWith(SEED_PREFIX),
    );

    let deleted = 0;
    for (const session of sessions) {
      for (const table of ["participants", "challenges", "workspaces", "events", "alerts", "notes"] as const) {
        const rows = await ctx.db
          .query(table)
          .filter((q) => q.eq(q.field("sessionId"), session._id))
          .collect();
        for (const row of rows) {
          await ctx.db.delete(row._id);
          deleted++;
        }
      }
      const reports = await ctx.db
        .query("reports")
        .withIndex("by_session", (q) => q.eq("sessionId", session._id))
        .collect();
      for (const r of reports) {
        await ctx.db.delete(r._id);
        deleted++;
      }
      await ctx.db.delete(session._id);
      deleted++;
    }
    return { sessions: sessions.length, rowsDeleted: deleted };
  },
});
