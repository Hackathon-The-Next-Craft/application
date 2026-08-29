"use client";

import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";

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
      className="flex flex-col gap-6 rounded-2xl border border-ink-200 bg-white p-6"
    >
      <div>
        <h2 className="font-display text-subtitle text-ink-900">Nueva sesión</h2>
        <p className="mt-1 max-w-[62ch] text-body-sm text-ink-500">
          Con esto queda en borrador. Los retos se preparan después, antes de
          publicar el enlace.
        </p>
      </div>

      <Field
        label="Título"
        name="title"
        required
        placeholder="Entrevista Frontend — agosto"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Rol" name="role" required placeholder="Frontend Engineer" />

        <Select label="Seniority" name="seniority" defaultValue="mid">
          <option value="junior">Junior</option>
          <option value="mid">Mid</option>
          <option value="senior">Senior</option>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
        <Field
          label="Tecnologías"
          name="technologies"
          placeholder="React, TypeScript, CSS"
          hint="Separadas por comas."
        />

        <Field
          label="Duración"
          name="durationMinutes"
          type="number"
          required
          min={5}
          max={180}
          defaultValue={45}
          hint="Minutos, entre 5 y 180."
          className="tabular"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-fail-bg bg-fail-bg px-3 py-2.5 text-body-sm text-fail-text"
        >
          {error}
        </p>
      )}

      <div className="flex items-center gap-2 border-t border-ink-200 pt-5">
        <p className="flex-1 text-caption text-ink-500">
          Hasta tres candidatos por sesión. Nadie puede entrar hasta que
          publiques el enlace.
        </p>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Creando…" : "Crear sesión"}
        </Button>
      </div>
    </form>
  );
}
