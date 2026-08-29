import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// Estados de sesión — PRD §5.3
export const sessionStatus = v.union(
  v.literal("draft"),     // Borrador
  v.literal("ready"),     // Lista (link habilitado, lobby abierto)
  v.literal("live"),      // En vivo
  v.literal("paused"),    // Pausada
  v.literal("closing"),   // Finalizando (análisis en curso)
  v.literal("closed"),    // Cerrada
);

// Clasificación operativa de progreso — PRD §7.3. Nunca inferencia psicológica.
export const progressState = v.union(
  v.literal("idle"),        // aún no empieza
  v.literal("advancing"),   // Avanza
  v.literal("exploring"),   // Explorando
  v.literal("stuck"),       // Atascado
  v.literal("env_failure"), // Fallo de entorno
  v.literal("finished"),    // Finalizado
);

export const eventType = v.union(
  v.literal("participant.joined"),
  v.literal("participant.left"),
  v.literal("participant.removed"),
  v.literal("participant.ready"),
  v.literal("session.started"),
  v.literal("session.paused"),
  v.literal("session.resumed"),
  v.literal("session.closed"),
  v.literal("code.checkpoint"),   // snapshot consolidado del editor
  v.literal("code.run"),          // ejecución + salida
  v.literal("test.result"),       // tests pasados/fallidos
  v.literal("challenge.switched"),
  v.literal("challenge.submitted"),
  v.literal("help.requested"),    // el candidato pide ayuda
  v.literal("help.given"),        // el entrevistador registra una ayuda
  v.literal("note.added"),
  v.literal("state.changed"),     // cambio de progressState, con razón legible
);

export default defineSchema({
  ...authTables, // entrevistadores. Los candidatos NO son users: entran por joinToken.

  sessions: defineTable({
    interviewerId: v.id("users"),
    title: v.string(),
    role: v.string(),              // "Frontend Engineer"
    seniority: v.string(),         // "junior" | "mid" | "senior"
    technologies: v.array(v.string()),
    durationMinutes: v.number(),
    maxCandidates: v.number(),     // <= 3 en MVP
    status: sessionStatus,
    joinCode: v.string(),          // segmento público de la URL /join/[joinCode]
    linkRevoked: v.boolean(),
    startedAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
    // Umbral de inactividad para alertas de "Atascado", en segundos.
    stuckThresholdSec: v.number(),
  })
    .index("by_interviewer", ["interviewerId"])
    .index("by_joinCode", ["joinCode"]),

  participants: defineTable({
    sessionId: v.id("sessions"),
    displayName: v.string(),
    // Secreto por candidato. Se guarda en su navegador y viaja en CADA
    // query/mutation de candidato. Es la única prueba de identidad — nunca
    // confiar en un participantId enviado por el cliente sin validar esto.
    joinToken: v.string(),
    presence: v.union(
      v.literal("invited"),
      v.literal("lobby"),
      v.literal("ready"),
      v.literal("live"),
      v.literal("disconnected"),
      // El entrevistador lo sacó. No se borra la fila: sus eventos son la
      // evidencia del reporte. Deja de contar para el cupo y sale del mosaico.
      v.literal("removed"),
    ),
    consent: v.object({
      audio: v.boolean(),
      transcript: v.boolean(),
      // Opcional a propósito: ausente significa NO consentido. La cámara se
      // añadió después, y los participantes que ya existían nunca la aceptaron.
      camera: v.optional(v.boolean()),
      acceptedAt: v.optional(v.number()),
      noticeVersion: v.string(),   // prueba de consentimiento — PRD §11.1
    }),
    deviceCheck: v.optional(v.object({
      micOk: v.boolean(),
      cameraOk: v.optional(v.boolean()),
      error: v.optional(v.string()),
    })),
    // Estado derivado por el clasificador; se recalcula, no lo escribe el cliente.
    progress: progressState,
    progressReason: v.string(),    // razón legible — obligatoria, PRD FR-10/FR-13
    lastActivityAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_joinToken", ["joinToken"]),

  challenges: defineTable({
    sessionId: v.id("sessions"),
    order: v.number(),
    title: v.string(),
    statement: v.string(),         // markdown
    language: v.union(v.literal("python"), v.literal("javascript")),
    starterCode: v.string(),
    // Nombre de la función que el runner debe invocar. Es un contrato con
    // lib/runner: sin esto, el frontend tiene que adivinarlo leyendo el
    // starterCode con una regex, y un cambio de prompt lo rompe en silencio.
    entryPoint: v.string(),
    timeLimitMinutes: v.number(),
    rubric: v.array(v.object({
      criterion: v.string(),
      weight: v.number(),
      observableSignals: v.array(v.string()),
    })),
    criticalAspects: v.array(v.string()),   // 3-5 condiciones verificables
    tests: v.array(v.object({
      name: v.string(),
      input: v.string(),
      expected: v.string(),
      hidden: v.boolean(),
    })),
    referenceSolution: v.optional(v.string()), // nunca se envía al candidato
    interviewerGuide: v.optional(v.string()),
    published: v.boolean(),        // FR-07: sin esto, el candidato no lo ve
    generatedBy: v.optional(v.string()), // versión de prompt usada
  }).index("by_session", ["sessionId"]),

  workspaces: defineTable({
    sessionId: v.id("sessions"),
    participantId: v.id("participants"),
    challengeId: v.id("challenges"),
    code: v.string(),              // snapshot actual (autosave con debounce)
    lastRun: v.optional(v.object({
      at: v.number(),
      stdout: v.string(),
      stderr: v.string(),
      passed: v.number(),
      total: v.number(),
      durationMs: v.number(),
    })),
    submittedAt: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_participant", ["participantId"])
    .index("by_participant_challenge", ["participantId", "challengeId"]),

  // Append-only. Alimenta timeline, alertas y evidencia del reporte.
  events: defineTable({
    sessionId: v.id("sessions"),
    participantId: v.optional(v.id("participants")),
    actorId: v.optional(v.id("users")),   // presente si lo originó el entrevistador
    type: eventType,
    at: v.number(),                       // timestamp de SERVIDOR, no del cliente
    payload: v.any(),                     // TODO: tipar por evento si sobra tiempo
    // Id del evento en el proveedor externo (Vapi). Permite deduplicar cuando
    // el webhook reintenta: el mismo trozo de audio no debe entrar dos veces.
    providerEventId: v.optional(v.string()),
  })
    .index("by_session", ["sessionId", "at"])
    .index("by_participant", ["participantId", "at"])
    .index("by_providerEventId", ["providerEventId"]),

  alerts: defineTable({
    sessionId: v.id("sessions"),
    participantId: v.id("participants"),
    type: v.union(
      v.literal("inactivity"),
      v.literal("repeated_error"),
      v.literal("env_failure"),
      v.literal("help_requested"),
    ),
    reason: v.string(),            // texto que lee el entrevistador
    at: v.number(),
    acknowledgedAt: v.optional(v.number()),
  }).index("by_session", ["sessionId", "at"]),

  notes: defineTable({
    sessionId: v.id("sessions"),
    participantId: v.id("participants"),
    interviewerId: v.id("users"),
    text: v.string(),
    anchorAt: v.number(),          // instante de la sesión al que ancla
  }).index("by_participant", ["participantId"]),

  reports: defineTable({
    sessionId: v.id("sessions"),
    participantId: v.id("participants"),
    // La IA escribe aquí por partes; la UI lo lee reactivamente y "streamea" gratis.
    status: v.union(
      v.literal("pending"),
      v.literal("generating"),
      v.literal("done"),
      v.literal("failed"),
    ),
    summary: v.optional(v.string()),
    criteriaResults: v.optional(v.array(v.object({
      criterion: v.string(),
      verdict: v.union(v.literal("met"), v.literal("partial"), v.literal("not_observed")),
      rationale: v.string(),
    }))),
    findings: v.optional(v.array(v.object({
      text: v.string(),
      // FR-17: todo hallazgo enlaza evidencia, o se marca baja confianza.
      evidenceEventIds: v.array(v.id("events")),
      confidence: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    }))),
    followUpQuestions: v.optional(v.array(v.string())),
    limitations: v.optional(v.string()),
    // Decisión humana — auditada. La IA nunca decide (PRD §11.3).
    decision: v.optional(v.object({
      value: v.union(v.literal("advance"), v.literal("hold"), v.literal("reject")),
      by: v.id("users"),
      at: v.number(),
      comment: v.optional(v.string()),
    })),
  })
    .index("by_session", ["sessionId"])
    .index("by_participant", ["participantId"]),
});
