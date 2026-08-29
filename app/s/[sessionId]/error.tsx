"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

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
    <main className="mx-auto w-full max-w-lg flex-1 p-8">
      <div className="rounded-2xl border border-ink-200 bg-white p-6">
        <h1 className="font-display text-subtitle text-ink-900">
          {sinAcceso ? "No puedes ver esta sesión" : "Algo salió mal"}
        </h1>
        <p className="mt-2 text-body-sm text-ink-500">
          {sinAcceso
            ? "La sesión no existe, o pertenece a otra cuenta de entrevistador."
            : error.message}
        </p>
        <div className="mt-5 flex gap-2">
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-iris-600 px-5 font-sans text-[15px] font-semibold leading-[18px] text-white transition-colors duration-[120ms] hover:bg-iris-700"
          >
            Mis sesiones
          </Link>
          {!sinAcceso && (
            <Button type="button" variant="ghost" size="lg" onClick={retry}>
              Reintentar
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
