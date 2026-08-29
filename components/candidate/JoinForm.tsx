"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { saveToken } from "@/lib/candidateToken";

function Aviso({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6">
      <h2 className="font-medium">{title}</h2>
      <p className="mt-2 text-sm text-zinc-500">{detail}</p>
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
    return <div className="h-48 animate-pulse rounded-lg border border-zinc-200 bg-white" />;
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
    <div className="rounded-lg border border-zinc-200 bg-white p-6">
      <h1 className="text-2xl font-semibold tracking-tight">{info.title}</h1>
      <p className="mt-1 text-sm text-zinc-500">
        {info.role} · {info.durationMinutes} minutos
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Tu nombre</span>
          <input
            name="displayName"
            required
            autoComplete="name"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
          />
          <span className="text-xs text-zinc-500">
            Es el nombre que verá quien te entrevista.
          </span>
        </label>

        <fieldset className="flex flex-col gap-2 rounded-md border border-zinc-200 p-4">
          <legend className="px-1 text-sm font-medium">Permisos</legend>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" name="consentAudio" className="mt-1" />
            <span>Acepto que se capture mi audio durante la entrevista.</span>
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" name="consentTranscript" className="mt-1" />
            <span>Acepto que se genere una transcripción de lo que diga.</span>
          </label>
          <p className="mt-1 text-xs text-zinc-500">
            Tu código y tus ejecuciones se registran de todas formas: son el objeto
            de la evaluación.
          </p>
        </fieldset>

        {error && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          {pending ? "Entrando…" : "Entrar a la sala de espera"}
        </button>
      </form>
    </div>
  );
}
