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
        weight: z
          .number()
          .min(0)
          .max(100)
          .describe("Peso en porcentaje. Los pesos del reto suman 100"),
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

type Rubrica = z.infer<typeof Challenge>["rubric"];

/**
 * Los pesos de la rúbrica son porcentajes que suman 100: es lo que valida y
 * muestra el editor de retos. El modelo los devolvía como fracciones (0.5,
 * 0.3, 0.2), así que la pantalla los sumaba en 1 y pintaba "1%" en rojo, con
 * el check de "los pesos suman 100%" sin marcar hasta corregirlos a mano.
 *
 * Reescalamos aquí en vez de confiar solo en el prompt: también endereza los
 * pesos que suman 90 o 105, que es la otra forma de llegar al mismo rojo.
 */
function enPorcentajes(rubric: Rubrica): Rubrica {
  const total = rubric.reduce((suma, r) => suma + r.weight, 0);

  // Sin señal que reescalar: reparto parejo antes que dejar la rúbrica en cero.
  if (total <= 0) {
    const base = Math.floor(100 / rubric.length);
    return rubric.map((r, i) => ({
      ...r,
      weight: i === 0 ? 100 - base * (rubric.length - 1) : base,
    }));
  }

  const escalados = rubric.map((r) => ({
    ...r,
    weight: Math.round((r.weight / total) * 100),
  }));

  // Redondear cada peso por separado deja la suma en 99 o 101. La diferencia
  // va al criterio de mayor peso, donde menos se nota.
  const suma = escalados.reduce((acc, r) => acc + r.weight, 0);
  if (suma !== 100) {
    let mayor = 0;
    for (let i = 1; i < escalados.length; i++) {
      if (escalados[i].weight > escalados[mayor].weight) mayor = i;
    }
    escalados[mayor].weight += 100 - suma;
  }

  return escalados;
}

const SYSTEM = `Diseñas pruebas de live coding para entrevistas técnicas.

Reglas:
- El reto debe resolverse dentro del límite de tiempo indicado. Prefiere un
  problema pequeño y bien acotado antes que uno ambicioso a medias.
- La rúbrica usa criterios observables en el código, la ejecución o la
  explicación. Nunca criterios vagos como "buena actitud" o "es proactivo".
- Los pesos de la rúbrica son porcentajes enteros y suman exactamente 100.
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
      rubric: enPorcentajes(c.rubric),
      promptVersion: PROMPT_VERSION,
    }));
  },
});
