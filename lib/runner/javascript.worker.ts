/// <reference lib="webworker" />
/**
 * Ejecuta el código del candidato fuera del hilo principal. El aislamiento no
 * es una medida de seguridad — el código es del propio candidato y corre en su
 * navegador — sino de supervivencia: un bucle infinito aquí se mata con
 * worker.terminate() sin colgar la pestaña. PRD §11.2 anota el sandbox real
 * server-side como trabajo post-hackathon.
 *
 * Toda la lógica de decisión vive en harness.ts, que se puede ejercitar fuera
 * del navegador. Aquí solo va el cableado de mensajes.
 */
import { ejecutarCaso, representar, resolverFuncion } from "./harness";
import type {
  PeticionDeEjecucion,
  ResultadoDeCaso,
  ResultadoDeEjecucion,
} from "./types";

self.onmessage = (event: MessageEvent<PeticionDeEjecucion>) => {
  const { code, entryPoint, tests } = event.data;
  const inicio = performance.now();
  const salida: string[] = [];
  const errores: string[] = [];
  const resultados: ResultadoDeCaso[] = [];

  // El console.log del candidato tiene que llegar al panel, no a la consola
  // del navegador donde nadie lo mira.
  const consolaOriginal = console.log;
  console.log = (...args: unknown[]) => {
    salida.push(
      args.map((a) => (typeof a === "string" ? a : representar(a))).join(" "),
    );
  };

  try {
    const fn = resolverFuncion(code, entryPoint);
    for (const test of tests) {
      resultados.push(ejecutarCaso(fn, test));
    }
  } catch (caught) {
    errores.push(
      caught instanceof Error ? (caught.stack ?? caught.message) : String(caught),
    );
  } finally {
    console.log = consolaOriginal;
  }

  for (const r of resultados) {
    salida.push(`${r.passed ? "✓" : "✗"} ${r.name}${r.detail ? ` — ${r.detail}` : ""}`);
  }

  const resultado: ResultadoDeEjecucion = {
    stdout: salida.join("\n"),
    stderr: errores.join("\n"),
    passed: resultados.filter((r) => r.passed).length,
    total: resultados.length,
    durationMs: Math.round(performance.now() - inicio),
  };
  self.postMessage(resultado);
};
