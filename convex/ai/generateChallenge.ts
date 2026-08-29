"use node";
import { v } from "convex/values";
import { z } from "zod";
import { internalAction } from "../_generated/server";
import { PROMPT_VERSION, generateJson } from "./gemini";

/**
 * Genera borradores de reto a partir del prompt del entrevistador.
 *
 * No toca la base de datos: devuelve los borradores y `challenges.insertDrafts`
 * los guarda con `published: false`. El entrevistador los edita y aprueba antes
 * de que ningún candidato los vea (PRD FR-06/FR-07).
 */

const Challenge = z.object({
  title: z.string().describe("Título corto del reto"),
  statement: z
    .string()
    .describe("Enunciado en markdown: problema, ejemplos y restricciones"),
  // Solo JavaScript: lib/runner todavía no ejecuta Python, y un reto en Python
  // deja al candidato sin poder ejecutar nada. Volver a abrirlo cuando exista
  // el runner de Pyodide.
  language: z.literal("javascript"),
  starterCode: z
    .string()
    .describe("Código inicial con la firma de la función, sin resolver nada"),
  entryPoint: z
    .string()
    .describe("Nombre exacto de la función que el runner debe invocar"),
  timeLimitMinutes: z.number().int().min(10).max(60),
  rubric: z
    .array(
      z.object({
        criterion: z.string(),
        weight: z.number().min(0).max(1),
        observableSignals: z
          .array(z.string())
          .describe("Señales verificables en el código o los tests"),
      }),
    )
    .min(2)
    .max(4),
  criticalAspects: z
    .array(z.string())
    .min(3)
    .max(5)
    .describe("Condiciones técnicas verificables que la solución debe demostrar"),
  tests: z
    .array(
      z.object({
        name: z.string(),
        input: z.string().describe("JSON del ÚNICO argumento de la función"),
        expected: z.string().describe("JSON del valor de retorno esperado"),
        hidden: z.boolean(),
      }),
    )
    .min(4)
    .max(8),
  referenceSolution: z.string(),
  interviewerGuide: z
    .string()
    .describe("Preguntas de profundización y qué cuenta como pista vs. resolver"),
});

const Output = z.object({ challenges: z.array(Challenge).min(1).max(2) });

const SYSTEM = `Diseñas pruebas de live coding para entrevistas técnicas.

Reglas:
- El reto debe resolverse dentro del límite de tiempo indicado. Prefiere un
  problema pequeño y bien acotado antes que uno ambicioso a medias.
- La rúbrica usa criterios observables en el código, la ejecución o la
  explicación. Nunca criterios vagos como "buena actitud" o "es proactivo".
- Los aspectos críticos deben poder verificarse con un test o leyendo el código.
- Incluye casos normales, de borde y de error. Marca hidden: true en los que no
  debe ver el candidato, y que esos no revelen la solución.
- starterCode da la firma y nada más: no resuelve ni insinúa la solución.
- Escribe todo en español, salvo el código y los identificadores.

Contrato con el ejecutor de código, sin excepciones:
- El reto es en JavaScript. La solución es UNA función que recibe EXACTAMENTE
  un argumento y devuelve un valor. Nada de leer stdin ni imprimir resultados.
- entryPoint es el nombre exacto de esa función, tal como aparece en starterCode.
- En cada test, input es el JSON de ese único argumento y expected es el JSON
  del valor devuelto. Ambos deben poder pasar por JSON.parse sin fallar.
  Ejemplo: input "[3,1,2]", expected "[1,2,3]".
- starterCode debe exportar la función con module.exports.`;

export const run = internalAction({
  args: { prompt: v.string(), count: v.number() },
  handler: async (_ctx, { prompt, count }): Promise<any[]> => {
    const n = Math.min(Math.max(count, 1), 2);
    const result = await generateJson({
      schema: Output,
      system: SYSTEM,
      temperature: 0.7, // algo de variedad: no queremos el mismo reto siempre
      prompt: [
        `Genera ${n} reto(s) de live coding.`,
        "",
        "Pedido del entrevistador:",
        prompt,
      ].join("\n"),
    });

    return result.challenges.slice(0, n).map((c) => ({
      ...c,
      promptVersion: PROMPT_VERSION,
    }));
  },
});
