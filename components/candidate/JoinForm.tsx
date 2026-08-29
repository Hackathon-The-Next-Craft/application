"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { saveToken } from "@/lib/candidateToken";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Logo } from "@/components/ui/Logo";

function Aviso({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-6">
      <h2 className="font-display text-subtitle text-ink-900">{title}</h2>
      <p className="mt-2 text-body-sm text-ink-500">{detail}</p>
    </div>
  );
}

export function JoinForm({
  code,
  onJoined,
}: {
  code: string;
  onJoined: (joinToken: string) => void;
}) {
  const info = useQuery(api.sessions.publicInfo, { joinCode: code });
  const join = useMutation(api.participants.join);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setError(null);
    setPending(true);
    try {
      const { joinToken } = await join({
        joinCode: code,
        displayName: String(formData.get("displayName")).trim(),
        consentAudio: formData.get("consentAudio") === "on",
        consentTranscript: formData.get("consentTranscript") === "on",
      });
      // Si el guardado falla, el candidato pierde el acceso al recargar.
      if (!saveToken(code, joinToken)) {
        setError(
          "Entraste, pero el navegador no dejó guardar tu acceso. No cierres ni recargues esta pestaña.",
        );
      }
      onJoined(joinToken);
    } catch (caught) {
      // El servidor distingue "Enlace no válido" de "Sesión llena".
      setError(
        caught instanceof Error ? caught.message : "No se pudo entrar a la sesión.",
      );
      setPending(false);
    }
  }

  if (info === undefined) {
    return <div className="h-48 animate-pulse rounded-2xl border border-ink-200 bg-white" />;
  }

  if (info === null) {
    return (
      <Aviso
        title="Este enlace no es válido"
        detail="Puede que el entrevistador lo haya revocado, o que la dirección esté mal escrita. Pídele un enlace nuevo."
      />
    );
  }

  if (info.full) {
    return (
      <Aviso
        title="La sala está llena"
        detail={`"${info.title}" ya tiene todos los lugares ocupados. Avísale al entrevistador.`}
      />
    );
  }

  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-8">
      <Logo size={24} className="mb-8 text-ink-900" />

      <h1 className="font-display text-title text-ink-900">{info.title}</h1>
      <p className="tabular mt-1 font-mono text-meta text-ink-500">
        {info.role} · {info.durationMinutes} minutos
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <Field
          label="Tu nombre"
          name="displayName"
          required
          autoComplete="name"
          hint="Es el nombre que verá quien te entrevista."
        />

        <fieldset className="flex flex-col gap-3 rounded-lg border border-ink-200 p-4">
          <legend className="px-1 font-mono text-label uppercase text-ink-500">
            Permisos
          </legend>
          <label className="flex items-start gap-2.5 text-body-sm text-ink-900">
            <input
              type="checkbox"
              name="consentAudio"
              className="mt-0.5 h-4 w-4 shrink-0 accent-iris-600"
            />
            <span>Acepto que se capture mi audio durante la entrevista.</span>
          </label>
          <label className="flex items-start gap-2.5 text-body-sm text-ink-900">
            <input
              type="checkbox"
              name="consentTranscript"
              className="mt-0.5 h-4 w-4 shrink-0 accent-iris-600"
            />
            <span>Acepto que se genere una transcripción de lo que diga.</span>
          </label>
          <p className="text-caption text-ink-500">
            Tu código y tus ejecuciones se registran de todas formas: son el objeto
            de la evaluación.
          </p>
        </fieldset>

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-fail-bg bg-fail-bg px-3 py-2.5 text-body-sm text-fail-text"
          >
            {error}
          </p>
        )}

        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Entrando…" : "Entrar a la sala de espera"}
        </Button>
      </form>
    </div>
  );
}
