/**
 * Contrato de ejecución en el navegador.
 *
 * ⚠️ PROVISIONAL — falta acuerdo con Salim y Alejandro.
 *
 * `challenges.tests` trae `{ name, input, expected }` como strings, pero
 * nadie definió su formato ni qué función invocar. Mientras tanto, aquí se
 * asume:
 *
 *   input     JSON del ÚNICO argumento.  "[]" → f([])
 *   expected  JSON del valor de retorno esperado.
 *             El literal "throws" significa "debe lanzar".
 *   igualdad  Comparación profunda, con las claves de los objetos ordenadas.
 *
 * Lo que falta de verdad es un campo `entryPoint` en `challenges`. Mientras no
 * exista, se deduce del `starterCode` (ver entryPoint.ts).
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
  entryPoint: string | null;
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
