"use client";

import { useAction } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

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
        <span className="text-body-sm font-medium">Cuántos</span>
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
        disabled={pendiente}
        className="self-start rounded-md bg-iris-600 px-4 py-2 text-body-sm font-medium text-white hover:bg-iris-700 disabled:opacity-50"
      >
        {pendiente ? "Generando… (tarda unos segundos)" : "Generar con IA"}
      </button>
    </form>
  );
}
