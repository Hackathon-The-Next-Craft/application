/**
 * Deduce qué función tiene que llamar el runner.
 *
 * Esto es un parche: lo correcto sería un campo `entryPoint` en la tabla
 * `challenges`, acordado entre Salim (schema) y Alejandro (el generador). Se
 * deduce del `starterCode` porque es el único sitio donde hoy aparece el
 * nombre, y porque el reto siempre define ahí la función a implementar.
 *
 * Devuelve null si no encuentra nada: el runner reporta el problema en vez de
 * fallar en silencio.
 */
export function deducirEntryPoint(
  starterCode: string,
  language: "javascript" | "python",
): string | null {
  if (language === "python") {
    return primerGrupo(starterCode, /^\s*def\s+([A-Za-z_]\w*)\s*\(/m);
  }

  // El starter de JS exporta lo que hay que implementar.
  return (
    primerGrupo(starterCode, /module\.exports\s*=\s*\{\s*([A-Za-z_$][\w$]*)/) ??
    primerGrupo(starterCode, /module\.exports\s*=\s*([A-Za-z_$][\w$]*)\s*;/) ??
    primerGrupo(starterCode, /^\s*(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/m) ??
    primerGrupo(starterCode, /^\s*(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\(/m)
  );
}

function primerGrupo(texto: string, patron: RegExp): string | null {
  const m = texto.match(patron);
  return m ? m[1] : null;
}

/** Un nombre que no sea identificador válido rompería el eval del worker. */
export function esIdentificadorValido(nombre: string): boolean {
  return /^[A-Za-z_$][\w$]*$/.test(nombre);
}
