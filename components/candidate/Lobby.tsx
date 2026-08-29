"use client";

import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "@/convex/_generated/api";
import { Logo } from "@/components/ui/Logo";
import { MicCheck } from "./MicCheck";

type SessionStatus = "draft" | "ready" | "live" | "paused" | "closing" | "closed";

const ESPERA: Record<Exclude<SessionStatus, "live">, string> = {
  draft: "El entrevistador todavía está preparando la sesión.",
  ready: "Todo listo. Empieza en cuanto el entrevistador lo indique.",
  paused: "La sesión está en pausa. No cierres esta pestaña.",
  closing: "La sesión terminó. Se está generando el análisis.",
  closed: "La sesión terminó. Ya puedes cerrar esta pestaña.",
};

export function Lobby({ code, joinToken }: { code: string; joinToken: string }) {
  // Reactivo: cuando el entrevistador inicia la sesión, esto llega solo.
  const state = useQuery(api.participants.me, { joinToken });
  const router = useRouter();

  const status = state?.session.status;
  useEffect(() => {
    if (status === "live") router.replace(`/join/${code}/room`);
  }, [status, code, router]);

  if (state === undefined) {
    return <div className="h-64 animate-pulse rounded-2xl border border-ink-200 bg-white" />;
  }

  const { participant, session } = state;
  const listo = participant.presence === "ready";

  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-8">
      <Logo size={24} className="mb-8 text-ink-900" />

      <h1 className="font-display text-title text-ink-900">{session.title}</h1>
      <p className="mt-1 text-body-sm text-ink-500">
        Entras como{" "}
        <span className="font-semibold text-ink-900">{participant.displayName}</span>
      </p>

      <p className="mt-6 rounded-lg border border-ink-200 bg-ink-25 px-4 py-3 text-body-sm text-ink-900">
        {session.status === "live"
          ? "La sesión empezó. Llevándote a la sala…"
          : ESPERA[session.status]}
      </p>

      <div className="mt-6">
        <MicCheck joinToken={joinToken} deviceCheck={participant.deviceCheck} />
      </div>

      <p className="mt-4 text-body-sm text-ink-500">
        {listo
          ? "Estás marcado como listo."
          : "Prueba tu micrófono para marcarte como listo."}
      </p>
    </div>
  );
}
