import type { CasoDePrueba, ResultadoDeEjecucion } from "./types";

/**
 * Presupuesto por ejecución. Si el candidato escribe un bucle infinito, el
 * worker no vuelve nunca: matarlo desde fuera es la única salida.
 */
const LIMITE_MS = 5_000;

export async function ejecutarEnElNavegador({
  language,
  code,
  entryPoint,
  tests,
}: {
  language: "javascript" | "python";
  code: string;
  entryPoint: string;
  tests: CasoDePrueba[];
}): Promise<ResultadoDeEjecucion> {
  if (language === "python") {
    // La generación fija javascript justamente para que esto no ocurra en una
    // sesión real. Ver lib/runner/PENDIENTE-python.md.
    return {
      stdout: "",
      stderr:
        "El runtime de Python todavía no está conectado. Por ahora solo se pueden ejecutar retos en JavaScript.",
      passed: 0,
      total: tests.length,
      durationMs: 0,
    };
  }

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
