import { deducirEntryPoint, esIdentificadorValido } from "./entryPoint";
import type { CasoDePrueba, ResultadoDeEjecucion } from "./types";

/**
 * Presupuesto por ejecución. Si el candidato escribe un bucle infinito, el
 * worker no vuelve nunca: matarlo desde fuera es la única salida.
 */
const LIMITE_MS = 5_000;

export async function ejecutarEnElNavegador({
  language,
  code,
  starterCode,
  tests,
}: {
  language: "javascript" | "python";
  code: string;
  starterCode: string;
  tests: CasoDePrueba[];
}): Promise<ResultadoDeEjecucion> {
  if (language === "python") {
    // Pendiente: Pyodide. Ver PENDIENTE-python.md en esta carpeta.
    return {
      stdout: "",
      stderr:
        "El runtime de Python todavía no está conectado. Por ahora solo se pueden ejecutar retos en JavaScript.",
      passed: 0,
      total: tests.length,
      durationMs: 0,
    };
  }

  const deducido = deducirEntryPoint(starterCode, language);
  const entryPoint =
    deducido !== null && esIdentificadorValido(deducido) ? deducido : null;

  const inicio = performance.now();
  const worker = new Worker(new URL("./javascript.worker.ts", import.meta.url));

  return new Promise<ResultadoDeEjecucion>((resolve) => {
    const temporizador = setTimeout(() => {
      worker.terminate();
      resolve({
        stdout: "",
        stderr: `La ejecución superó ${LIMITE_MS / 1000}s y se detuvo. ¿Hay un bucle que no termina?`,
        passed: 0,
        total: tests.length,
        durationMs: Math.round(performance.now() - inicio),
      });
    }, LIMITE_MS);

    worker.onmessage = (event: MessageEvent<ResultadoDeEjecucion>) => {
      clearTimeout(temporizador);
      worker.terminate();
      resolve(event.data);
    };

    worker.onerror = (event) => {
      clearTimeout(temporizador);
      worker.terminate();
      resolve({
        stdout: "",
        stderr: event.message || "El worker falló al arrancar.",
        passed: 0,
        total: tests.length,
        durationMs: Math.round(performance.now() - inicio),
      });
    };

    worker.postMessage({ code, entryPoint, tests });
  });
}
