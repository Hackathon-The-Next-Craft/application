/**
 * Contrato de ejecución en el navegador.
 *
 * Documentado en docs/api-contract.md — no se deduce del código. La solución
 * es siempre una función con exactamente un argumento que devuelve un valor:
 * nada de leer stdin ni imprimir.
 *
 *   entryPoint  Nombre exacto de la función a invocar. Viene del campo
 *               `entryPoint` del reto; NO se adivina leyendo el starterCode.
 *   input       JSON del único argumento.  "[3,1,2]"
 *   expected    JSON del valor de retorno esperado.  "[1,2,3]"
 *   igualdad    Comparación profunda, con las claves de los objetos ordenadas.
 */

export type CasoDePrueba = {
  name: string;
  input: string;
  expected: string;
};

export type ResultadoDeCaso = {
  name: string;
  passed: boolean;
  /** Texto legible: es lo que acaba en el stdout que lee el entrevistador. */
  detail: string;
};

export type PeticionDeEjecucion = {
  code: string;
  entryPoint: string;
  tests: CasoDePrueba[];
};

/** Coincide con los argumentos de workspaces.recordRun. */
export type ResultadoDeEjecucion = {
  stdout: string;
  stderr: string;
  passed: number;
  total: number;
  durationMs: number;
};
