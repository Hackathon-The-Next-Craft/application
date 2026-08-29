"use node";
import { v } from "convex/values";
import { z } from "zod";
import { internalAction } from "../_generated/server";
import { generateJson } from "./gemini";

/**
 * Genera el reporte de un candidato a partir de su sesión.
 *
 * Diseño clave: el modelo NUNCA ve ni inventa ids de Convex. Le pasamos los
 * eventos numerados y nos devuelve índices; nosotros los traducimos a ids
 * reales. Así es imposible que "cite" evidencia que no existe — que es
 * exactamente el modo en que este tipo de producto pierde la confianza del
 * entrevistador (PRD FR-17 / §7.4).
 */

const Output = z.object({
  summary: z.string().describe("Resumen ejecutivo, 3-5 frases"),
  criteriaResults: z.array(
    z.object({
      criterion: z.string(),
      verdict: z.enum(["met", "partial", "not_observed"]),
      rationale: z.string(),
    }),
  ),
  findings: z.array(
    z.object({
      text: z.string(),
      evidenceIndexes: z
        .array(z.number().int())
        .describe("Índices [n] de los eventos que sustentan este hallazgo"),
      confidence: z.enum(["low", "medium", "high"]),
    }),
  ),
  followUpQuestions: z.array(z.string()).max(5),
  limitations: z.string().describe("Qué no se pudo observar y por qué"),
});

const SYSTEM = `Analizas una entrevista técnica de live coding y produces un
informe para el entrevistador humano, que es quien decide.

Reglas innegociables:
- Cada hallazgo debe citar los índices de los eventos que lo sustentan. Si no
  puedes sustentarlo con evidencia, márcalo confidence: "low" y dilo.
- No recomiendes contratar ni rechazar. No des un puntaje único. El informe
  describe lo observado; la decisión es del entrevistador.
- No infieras personalidad, emociones, actitud, motivación ni ningún atributo
  protegido (género, edad, origen, acento, discapacidad). No los menciones.
- Distingue "no lo hizo" de "no se pudo observar". Un candidato que no llegó a
  un aspecto crítico por falta de tiempo no es lo mismo que uno que lo ignoró.
- Si hubo ayudas del entrevistador o fallos de entorno, tenlo en cuenta y dilo
  explícitamente en las limitaciones.
- Cuando haya transcripción, úsala como evidencia del razonamiento: explicar
  bien un enfoque que no se llegó a terminar es una señal real. Cita el
  contenido de lo que dijo, nunca su forma de hablar, su acento ni su fluidez.
- Escribe en español, salvo el código y los identificadores.`;

function renderEvent(e: any): string {
  const p = e.payload ?? {};
  switch (e.type) {
    case "code.run":
      return `ejecutó código — ${p.passed ?? 0}/${p.total ?? 0} tests${
        p.stderr ? `, error: ${String(p.stderr).slice(0, 160)}` : ""
      }`;
    case "test.result":
      return `resultado de tests: ${p.passed ?? 0}/${p.total ?? 0}`;
    case "code.checkpoint":
      return `editó el código (${p.chars ?? 0} caracteres)`;
    case "state.changed":
      return `estado -> ${p.state}: ${p.reason}`;
    case "help.requested":
      return `pidió ayuda${p.message ? `: ${p.message}` : ""}`;
    case "help.given":
      return `el entrevistador le ayudó: ${p.description ?? ""}`;
    case "note.added":
      return `nota del entrevistador: ${p.text ?? ""}`;
    case "challenge.submitted":
      return "envió su solución";
    case "voice.transcript":
      // Lo que el candidato dijo en voz alta. Es evidencia de su razonamiento,
      // no una muestra de su voz: se cita el contenido y nada más.
      return `${p.role === "user" ? "dijo" : "el entrevistador dijo"}: "${p.transcript ?? ""}"`;
    default:
      return e.type;
  }
}

export const run = internalAction({
  args: {
    challenges: v.array(v.any()),
    events: v.array(v.any()),
    notes: v.array(v.any()),
    finalCode: v.array(v.any()),
  },
  handler: async (_ctx, { challenges, events, notes, finalCode }): Promise<any> => {
    const ordered = [...events].sort((a, b) => a.at - b.at);
    const t0 = ordered[0]?.at ?? 0;

    const numbered = ordered.map((e, i) => {
      const mins = Math.round((e.at - t0) / 60000);
      return `[${i}] +${mins}min  ${renderEvent(e)}`;
    });

    const challenge = challenges[0];
    const prompt = [
      "## Reto",
      challenge?.statement ?? "(sin reto)",
      "",
      "### Aspectos críticos que debería demostrar",
      ...(challenge?.criticalAspects ?? []).map((a: string) => `- ${a}`),
      "",
      "### Rúbrica",
      ...(challenge?.rubric ?? []).map(
        (r: any) => `- ${r.criterion} (peso ${r.weight}): ${r.observableSignals?.join(", ")}`,
      ),
      "",
      "## Timeline de la sesión",
      "Cita estos índices como evidencia.",
      ...numbered,
      "",
      "## Código final del candidato",
      ...finalCode.map((w: any) => "```\n" + (w.code ?? "") + "\n```"),
      "",
      "## Notas privadas del entrevistador",
      ...(notes.length ? notes.map((n: any) => `- ${n.text}`) : ["(ninguna)"]),
    ].join("\n");

    const result = await generateJson({
      schema: Output,
      system: SYSTEM,
      temperature: 0.2, // un informe debe ser reproducible, no creativo
      prompt,
    });

    // Traducimos índices -> ids reales. Un índice inventado simplemente se cae,
    // y un hallazgo que se queda sin evidencia baja a confianza "low".
    const findings = result.findings.map((f) => {
      const evidenceEventIds = f.evidenceIndexes
        .filter((i) => i >= 0 && i < ordered.length)
        .map((i) => ordered[i]._id);
      return {
        text: f.text,
        evidenceEventIds,
        confidence: evidenceEventIds.length === 0 ? ("low" as const) : f.confidence,
      };
    });

    return {
      summary: result.summary,
      criteriaResults: result.criteriaResults,
      findings,
      followUpQuestions: result.followUpQuestions,
      limitations: result.limitations,
    };
  },
});
