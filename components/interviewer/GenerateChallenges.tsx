"use client";

import { useAction } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { GeneratingProgress } from "./GeneratingProgress";

export function GenerateChallenges({ sessionId }: { sessionId: Id<"sessions"> }) {
  // Es un `action`, no una mutation: tarda y NO es reactivo. Escribe en la
  // base y el resultado nos llega por el useQuery de la lista.
  const generate = useAction(api.challenges.generate);
  const [pendiente, setPendiente] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);
    setPendiente(true);
    try {
      await generate({
        sessionId,
        prompt: String(formData.get("prompt")),
        count: Number(formData.get("count")),
      });
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "No se pudo generar el reto.",
      );
    } finally {
      setPendiente(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-2xl border border-ink-200 bg-white p-5"
    >
      <h2 className="font-medium">Generar retos con IA</h2>

      {/* Oculta, no desmonta: son inputs no controlados (se leen por
          FormData al enviar), así que si falla la generación y esto vuelve
          a mostrarse, lo que el entrevistador había escrito sigue ahí. */}
      <div className={pendiente ? "hidden" : "flex flex-col gap-3"}>
        <p className="text-body-sm text-ink-500">
          La IA propone; tú editas y publicas. Nada de esto es visible para el
          candidato hasta que lo publiques.
        </p>

        <label className="flex flex-col gap-1.5">
          <span className="text-body-sm font-medium">Qué quieres evaluar</span>
          <textarea
            name="prompt"
            required
            rows={3}
            placeholder="Manipulación de arreglos y casos borde, nivel mid, sin librerías externas."
            className="rounded-md border border-ink-200 px-3 py-2 text-body-sm outline-none focus:border-iris-600"
          />
        </label>

        <label className="flex items-center gap-2">
          <span className="text-body-sm font-medium">Cuántos problemas</span>
          <input
            name="count"
            type="number"
            min={1}
            max={3}
            defaultValue={1}
            className="w-20 rounded-md border border-ink-200 px-3 py-2 text-body-sm outline-none focus:border-iris-600"
          />
        </label>

        {error && (
          <p role="alert" className="rounded-md bg-fail-bg px-3 py-2 text-body-sm text-fail-text">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="self-start rounded-md bg-iris-600 px-4 py-2 text-body-sm font-medium text-white hover:bg-iris-700"
        >
          Generar con IA
        </button>
      </div>

      {pendiente && (
        <div className="flex flex-col items-center gap-5 py-6 text-center">
          <span className="relative flex h-10 w-10 items-center justify-center">
            <span className="absolute inset-0 rounded-full border-[3px] border-iris-100" />
            <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-iris-600" />
          </span>
          <div>
            <p className="font-medium text-ink-900">Generando con IA…</p>
            <p className="mt-1 text-body-sm text-ink-500">
              Puede tardar unos segundos.
            </p>
          </div>
          <div className="w-full max-w-xs text-left">
            <GeneratingProgress />
          </div>
        </div>
      )}
    </form>
  );
}
