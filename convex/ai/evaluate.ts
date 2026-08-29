"use node";
import { v } from "convex/values";
import { internalAction } from "../_generated/server";

/**
 * ── PROPIEDAD: ALEJANDRO ─────────────────────────────────────────────────────
 * Recibe el timeline completo de un candidato y devuelve el reporte.
 *
 * REGLA INNEGOCIABLE (PRD FR-17 / §7.4): cada finding lleva evidenceEventIds
 * no vacío, o confidence: "low". Sin recomendación de contratación. Sin inferir
 * atributos protegidos, emociones ni personalidad.
 */
export const run = internalAction({
  args: {
    challenges: v.array(v.any()),
    events: v.array(v.any()),
    notes: v.array(v.any()),
    finalCode: v.array(v.any()),
  },
  handler: async (_ctx, _args): Promise<any> => {
    // TODO(alejandro)
    return {
      summary: "Reporte placeholder",
      criteriaResults: [],
      findings: [],
      followUpQuestions: [],
      limitations: "Generado por stub, sin análisis real.",
    };
  },
});
