/**
 * Lógica pura del runner: sin `self`, sin DOM. Vive aparte del worker para
 * poder ejercitarla fuera del navegador — es la parte que decide si un test
 * pasa, y equivocarse aquí significa evaluar mal a un candidato.
 */
import type { CasoDePrueba, ResultadoDeCaso } from "./types";

/** Ordena las claves para que la comparación no dependa del orden. */
export function canonico(valor: unknown): unknown {
  if (Array.isArray(valor)) return valor.map(canonico);
  if (valor !== null && typeof valor === "object") {
    return Object.fromEntries(
      Object.keys(valor as Record<string, unknown>)
        .sort()
        .map((k) => [k, canonico((valor as Record<string, unknown>)[k])]),
    );
  }
  return valor;
}

export function iguales(a: unknown, b: unknown): boolean {
  return JSON.stringify(canonico(a)) === JSON.stringify(canonico(b));
}

export function representar(valor: unknown): string {
  try {
    return JSON.stringify(valor) ?? String(valor);
  } catch {
    return String(valor);
  }
}

/**
 * Resuelve la función a ejecutar. Acepta las dos formas que aparecen en los
 * retos: declararla suelta, o exportarla con module.exports.
 */
export function resolverFuncion(
  code: string,
  entryPoint: string,
): (...args: unknown[]) => unknown {
  const modulo: { exports: unknown } = { exports: {} };
  const fabrica = new Function(
    "module",
    "exports",
    `${code}\n;try { return typeof ${entryPoint} === "function" ? ${entryPoint} : undefined; } catch (_) { return undefined; }`,
  );
  const directa = fabrica(modulo, modulo.exports) as unknown;

  const exportado = modulo.exports as Record<string, unknown> | undefined;
  const candidata =
    (typeof directa === "function" ? directa : undefined) ??
    (typeof exportado?.[entryPoint] === "function" ? exportado[entryPoint] : undefined) ??
    (typeof modulo.exports === "function" ? modulo.exports : undefined);

  if (typeof candidata !== "function") {
    throw new Error(
      `No se encontró la función "${entryPoint}". Defínela o expórtala con module.exports.`,
    );
  }
  return candidata as (...args: unknown[]) => unknown;
}

export function ejecutarCaso(
  fn: (...args: unknown[]) => unknown,
  test: CasoDePrueba,
): ResultadoDeCaso {
  const esperaExcepcion = test.expected.trim() === "throws";

  let argumento: unknown;
  try {
    argumento = JSON.parse(test.input);
  } catch {
    // Pasa con los datos del seed, cuyos inputs son "[...]" literal.
    return {
      name: test.name,
      passed: false,
      detail: `no se pudo leer el input como JSON: ${test.input}`,
    };
  }

  let esperado: unknown;
  if (!esperaExcepcion) {
    try {
      esperado = JSON.parse(test.expected);
    } catch {
      return {
        name: test.name,
        passed: false,
        detail: `no se pudo leer el expected como JSON: ${test.expected}`,
      };
    }
  }

  try {
    const obtenido = fn(argumento);
    if (esperaExcepcion) {
      return { name: test.name, passed: false, detail: "se esperaba una excepción" };
    }
    return iguales(obtenido, esperado)
      ? { name: test.name, passed: true, detail: "" }
      : {
          name: test.name,
          passed: false,
          detail: `esperaba ${representar(esperado)}, obtuvo ${representar(obtenido)}`,
        };
  } catch (caught) {
    const mensaje = caught instanceof Error ? caught.message : String(caught);
    return esperaExcepcion
      ? { name: test.name, passed: true, detail: "" }
      : { name: test.name, passed: false, detail: `lanzó: ${mensaje}` };
  }
}
