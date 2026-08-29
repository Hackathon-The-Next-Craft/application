"use client";

import Link from "next/link";

// Todas las funciones de entrevistador pasan por requireInterviewer, que hace
// throw ("No autenticado" / "No autorizado" / "Sesión no encontrada"), y
// useQuery relanza eso durante el render. Sin este archivo, abrir una sesión
// ajena o un id inventado deja la pantalla en blanco.
// Next 16: la prop es `retry`, no `reset`.
export default function SessionError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const sinAcceso =
    error.message.includes("No autorizado") ||
    error.message.includes("No autenticado") ||
    error.message.includes("Sesión no encontrada");

  return (
    <main className="mx-auto w-full max-w-lg flex-1 p-6">
      <div className="rounded-lg border border-zinc-200 bg-white p-6">
        <h1 className="font-medium">
          {sinAcceso ? "No puedes ver esta sesión" : "Algo salió mal"}
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          {sinAcceso
            ? "La sesión no existe, o pertenece a otra cuenta de entrevistador."
            : error.message}
        </p>
        <div className="mt-4 flex gap-2">
          <Link
            href="/dashboard"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Mis sesiones
          </Link>
          {!sinAcceso && (
            <button
              type="button"
              onClick={retry}
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100"
            >
              Reintentar
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
