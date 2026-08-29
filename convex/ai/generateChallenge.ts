"use node";
import { v } from "convex/values";
import { internalAction } from "../_generated/server";

/**
 * ── PROPIEDAD: ALEJANDRO ─────────────────────────────────────────────────────
 * Contrato: recibe el prompt del entrevistador, devuelve N borradores de reto.
 * No toca la base de datos — de eso se encarga challenges.insertDrafts.
 *
 * Cada draft debe traer: title, statement (markdown), language ("python"|"javascript"),
 * starterCode, timeLimitMinutes, rubric[{criterion,weight,observableSignals[]}],
 * criticalAspects[] (3-5, verificables), tests[{name,input,expected,hidden}],
 * referenceSolution, interviewerGuide, promptVersion.
 *
 * Modelo sugerido: claude-opus-5 para generación, claude-sonnet-5 si hace falta rapidez.
 * Valida la salida antes de devolverla — un reto mal formado rompe la sesión en vivo.
 */
export const run = internalAction({
  args: { prompt: v.string(), count: v.number() },
  handler: async (_ctx, { prompt, count }): Promise<any[]> => {
    // TODO(alejandro): llamar a Anthropic con tool use / JSON estructurado y validar.
    return Array.from({ length: count }, (_, i) => ({
      title: `Reto ${i + 1} (placeholder)`,
      statement: `Generado desde: ${prompt}`,
      language: "python",
      starterCode: "def solve(x):\n    pass\n",
      timeLimitMinutes: 30,
      rubric: [],
      criticalAspects: [],
      tests: [],
      promptVersion: "stub-v0",
    }));
  },
});
