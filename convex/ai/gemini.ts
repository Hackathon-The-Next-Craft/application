"use node";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

/**
 * Único punto donde hablamos con el modelo.
 *
 * Todo pasa por aquí para que la salida esté SIEMPRE validada: le pasamos el
 * esquema a Gemini para que devuelva JSON con la forma correcta, y además lo
 * verificamos con Zod al recibirlo. Un reto malformado rompe una entrevista en
 * vivo, así que preferimos fallar aquí que a mitad de una sesión.
 */

/**
 * En orden de preferencia. El primero se satura seguido y devuelve 503; en vez
 * de tumbar una entrevista en vivo, bajamos al siguiente. Todos manejan JSON
 * estructurado, así que el contrato de salida no cambia.
 */
export const MODELS = [
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
];
export const PROMPT_VERSION = "gemini-flash/v1";

/**
 * 503 y 5xx son saturación pasajera: esperar un momento suele bastar.
 *
 * 429 NO. Es cuota agotada, y en el plan gratuito es por DÍA y por modelo (20
 * peticiones). Reintentar ahí es contraproducente por partida doble: no se va
 * a arreglar en 800ms, y cada intento fallido sigue contando contra la cuota.
 * Antes 429 estaba aquí dentro, así que un solo reporte podía quemar nueve
 * peticiones agotando la cuota más rápido. Ahora salta directo al siguiente
 * modelo, que tiene su propia cuota independiente.
 */
const REINTENTABLES = [500, 502, 503, 504];
const SIN_CUOTA = 429;
const MAX_ATTEMPTS = 3;

function statusOf(error: unknown): number | null {
  const message = error instanceof Error ? error.message : String(error);
  const match = message.match(/"code"\s*:\s*(\d{3})/);
  return match ? Number(match[1]) : null;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function generateJson<T extends z.ZodType>(opts: {
  schema: T;
  prompt: string;
  system?: string;
  temperature?: number;
}): Promise<z.infer<T>> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Falta GEMINI_API_KEY. Configúrala con: npx convex env set GEMINI_API_KEY <key>",
    );
  }

  // Gemini no acepta la clave $schema que Zod agrega por defecto.
  const jsonSchema = z.toJSONSchema(opts.schema) as Record<string, unknown>;
  delete jsonSchema.$schema;

  const ai = new GoogleGenAI({ apiKey });
  let usedModel: string | undefined;

  let text: string | undefined;
  let lastError: unknown;
  const sinCuota: string[] = [];

  outer: for (const model of MODELS) {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: opts.prompt,
          config: {
            systemInstruction: opts.system,
            temperature: opts.temperature ?? 0.4,
            responseMimeType: "application/json",
            responseJsonSchema: jsonSchema,
          },
        });
        text = response.text;
        usedModel = model;
        break outer;
      } catch (error) {
        lastError = error;
        const status = statusOf(error);
        // Cuota agotada en este modelo: al siguiente, sin esperar ni reintentar.
        if (status === SIN_CUOTA) {
          sinCuota.push(model);
          break;
        }
        // Un error que no es de saturación (key inválida, esquema rechazado)
        // se propaga tal cual: reintentarlo solo pierde tiempo.
        if (status === null || !REINTENTABLES.includes(status)) throw error;
        if (attempt < MAX_ATTEMPTS) await sleep(400 * 2 ** (attempt - 1));
      }
    }
    // Este modelo está saturado: probamos el siguiente.
  }
  if (text === undefined) {
    // Un volcado de ApiError no le dice nada a quien lee el reporte.
    if (sinCuota.length === MODELS.length) {
      throw new Error(
        "Se agotó la cuota diaria de la API de Gemini en todos los modelos " +
          "disponibles. El plan gratuito permite 20 peticiones por día y por " +
          "modelo. Hay que activar facturación en la API key, o esperar a que " +
          "se reinicie la cuota.",
      );
    }
    throw lastError ?? new Error("No se pudo obtener respuesta de ningún modelo");
  }
  if (!text) throw new Error("El modelo devolvió una respuesta vacía");

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`El modelo no devolvió JSON válido: ${text.slice(0, 200)}`);
  }

  // No confiamos en que el modelo respetó el esquema: lo comprobamos.
  const result = opts.schema.safeParse(parsed);
  if (!result.success) {
    throw new Error(
      `La salida del modelo no cumple el esquema: ${result.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ")}`,
    );
  }
  return result.data;
}
