import type { Doc } from "@/convex/_generated/dataModel";

/** Etiquetas legibles de eventType — compartidas por EvidenceList y Timeline. */
export const EVENT_LABEL: Record<Doc<"events">["type"], string> = {
  "participant.joined": "Entró a la sesión",
  "participant.left": "Salió",
  "participant.removed": "Retirado de la sesión",
  "participant.ready": "Se marcó listo",
  "session.started": "Sesión iniciada",
  "session.paused": "Sesión pausada",
  "session.resumed": "Sesión reanudada",
  "session.closed": "Sesión cerrada",
  "code.checkpoint": "Guardó código",
  "code.run": "Ejecutó",
  "test.result": "Resultado de tests",
  "challenge.switched": "Cambió de reto",
  "challenge.submitted": "Envió su solución",
  "help.requested": "Pidió ayuda",
  "help.given": "Se le dio ayuda",
  "note.added": "Nota del entrevistador",
  "state.changed": "Cambio de estado",
  "voice.transcript": "Dijo en voz alta",
};
