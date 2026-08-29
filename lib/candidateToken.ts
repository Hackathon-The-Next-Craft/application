/**
 * Identidad del candidato. api-contract.md §1: el joinToken se guarda bajo
 * `liveroom:token:<joinCode>` y viaja en CADA llamada de candidato. Si se
 * pierde, el candidato queda fuera de la sesión — no hay forma de recuperarlo.
 */

const key = (joinCode: string) => `liveroom:token:${joinCode}`;

// localStorage puede lanzar (modo privado, cookies bloqueadas) y no existe
// durante el render del servidor. Todo acceso va envuelto.

export function readToken(joinCode: string): string | null {
  try {
    return window.localStorage.getItem(key(joinCode));
  } catch {
    return null;
  }
}

export function saveToken(joinCode: string, joinToken: string): boolean {
  try {
    window.localStorage.setItem(key(joinCode), joinToken);
    return true;
  } catch {
    return false;
  }
}

export function clearToken(joinCode: string): void {
  try {
    window.localStorage.removeItem(key(joinCode));
  } catch {
    // Si no se puede borrar, el boundary igual muestra el error al candidato.
  }
}
