"use client";

import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "@/convex/_generated/api";
import { PanelRetirado } from "./InvalidTokenBoundary";
import { CandidateHeader } from "./CandidateHeader";
import { DeviceCheck } from "./DeviceCheck";
import { Chip, type Tone } from "@/components/ui/Chip";

type SessionStatus = "draft" | "ready" | "live" | "paused" | "closing" | "closed";

const ESPERA: Record<Exclude<SessionStatus, "live">, string> = {
  draft: "El entrevistador todavía está preparando la sesión.",
  ready: "Todo listo. Empieza en cuanto el entrevistador lo indique.",
  paused: "La sesión está en pausa. No cierres esta pestaña.",
  closing: "La sesión terminó. Se está generando el análisis.",
  closed: "La sesión terminó. Ya puedes cerrar esta pestaña.",
};

const ESTADO_TONO: Record<SessionStatus, Tone> = {
  draft: "neutral",
  ready: "advance",
  live: "fail",
  paused: "stuck",
  closing: "explore",
  closed: "neutral",
};

const ESTADO_LABEL: Record<SessionStatus, string> = {
  draft: "Preparando",
  ready: "Lista",
  live: "En vivo",
  paused: "Pausada",
  closing: "Finalizando",
  closed: "Cerrada",
};

export function Lobby({ code, joinToken }: { code: string; joinToken: string }) {
  // Reactivo: cuando el entrevistador inicia la sesión, esto llega solo.
  const state = useQuery(api.participants.me, { joinToken });
  const router = useRouter();

  const status = state?.session.status;
  const presencia = state?.participant.presence;
  useEffect(() => {
    // A un retirado no se le manda a la sala: allí `mine` lanza y solo vería
    // un rebote antes del mismo mensaje.
    if (status === "live" && presencia !== "removed") {
      router.replace(`/join/${code}/room`);
    }
  }, [status, presencia, code, router]);

  if (state === undefined) {
    return (
      <div className="flex flex-1 flex-col">
        <CandidateHeader />
        <main className="mx-auto w-full max-w-[640px] flex-1 px-6 py-12">
          <div className="h-64 animate-pulse rounded-2xl border border-ink-200 bg-white" />
        </main>
      </div>
    );
  }

  const { participant, session } = state;

  // participants.me resuelve al retirado en vez de lanzar, justamente para
  // poder decírselo en vez de dejarlo esperando en un lobby que ya no existe.
  if (participant.presence === "removed") {
    return <PanelRetirado />;
  }

  const listo = participant.presence === "ready";

  return (
    <div className="flex flex-1 flex-col">
      <CandidateHeader contexto={session.title} />

      {/* Antes era una sola tarjeta larga con todo apilado adentro: el
          estado de la sesión y la prueba de cámara/micrófono son cosas
          distintas y cada una merece su propia tarjeta, no un párrafo
          suelto seguido de otro bloque anidado. */}
      <main className="mx-auto flex w-full max-w-[640px] flex-1 flex-col gap-5 px-6 py-12">
        <div>
          <h1 className="font-display text-title text-ink-900">{session.title}</h1>
          <p className="mt-1 text-body-sm text-ink-500">
            Entras como{" "}
            <span className="font-medium text-ink-900">{participant.displayName}</span>
          </p>
        </div>

        <section className="flex items-center gap-3 rounded-2xl border border-ink-200 bg-white p-5">
          <Chip tone={ESTADO_TONO[session.status]} dot>
            {ESTADO_LABEL[session.status]}
          </Chip>
          <p className="text-body-sm text-ink-900">
            {session.status === "live"
              ? "La sesión empezó. Llevándote a la sala…"
              : ESPERA[session.status]}
          </p>
        </section>

        <DeviceCheck joinToken={joinToken} deviceCheck={participant.deviceCheck} />

        {!listo && (
          <p className="text-body-sm text-ink-500">
            Prueba tu cámara y tu micrófono para marcarte como listo.
          </p>
        )}
      </main>
    </div>
  );
}
