"use client";

import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/convex/_generated/api";

const FIELD =
  "rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900";

export function NewSessionForm({ onCancel }: { onCancel: () => void }) {
  const createSession = useMutation(api.sessions.create);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setError(null);
    setPending(true);
    try {
      const sessionId = await createSession({
        title: String(formData.get("title")),
        role: String(formData.get("role")),
        seniority: String(formData.get("seniority")),
        technologies: String(formData.get("technologies"))
          .split(",")
          .map((tech) => tech.trim())
          .filter(Boolean),
        durationMinutes: Number(formData.get("durationMinutes")),
      });
      router.push(`/s/${sessionId}/setup`);
    } catch {
      setError("No se pudo crear la sesión. Intenta de nuevo.");
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-5"
    >
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Título</span>
        <input
          name="title"
          required
          placeholder="Entrevista Frontend — agosto"
          className={FIELD}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Rol</span>
          <input
            name="role"
            required
            placeholder="Frontend Engineer"
            className={FIELD}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Seniority</span>
          <select name="seniority" defaultValue="mid" className={FIELD}>
            <option value="junior">junior</option>
            <option value="mid">mid</option>
            <option value="senior">senior</option>
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Tecnologías</span>
        <input
          name="technologies"
          placeholder="React, TypeScript, CSS"
          className={FIELD}
        />
        <span className="text-xs text-zinc-500">Separadas por comas.</span>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Duración (minutos)</span>
        <input
          name="durationMinutes"
          type="number"
          required
          min={5}
          max={180}
          defaultValue={45}
          className={`${FIELD} w-32`}
        />
      </label>

      {error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          {pending ? "Creando…" : "Crear sesión"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
