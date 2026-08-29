"use client";

import Link from "next/link";
import { use, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { AlertsPanel } from "@/components/interviewer/AlertsPanel";
import { Countdown } from "@/components/interviewer/Countdown";
import { FocusPanel } from "@/components/interviewer/FocusPanel";
import { ParticipantCard } from "@/components/interviewer/ParticipantCard";
import { SessionControls } from "@/components/interviewer/SessionControls";
import { AppHeader, NAV_LINK } from "@/components/ui/AppHeader";
import { Chip, type Tone } from "@/components/ui/Chip";

const ESTADO: Record<Doc<"sessions">["status"], string> = {
  draft: "Borrador",
  ready: "Lista",
  live: "En vivo",
  paused: "Pausada",
  closing: "Finalizando",
  closed: "Cerrada",
};

const ESTADO_TONO: Record<Doc<"sessions">["status"], Tone> = {
  draft: "neutral",
  ready: "advance",
  live: "fail",
  paused: "stuck",
  closing: "explore",
  closed: "neutral",
};

export default function LivePage({ params }: PageProps<"/s/[sessionId]/live"> ) {
  const sessionId = use(params).sessionId as Id<"sessions">;

  // Un solo useQuery alimenta todo el mosaico, como pide frontend.md.
  // Reactivo: el código de los candidatos cambia solo, sin polling.
  const session = useQuery(api.sessions.get, { sessionId });
  const participantes = useQuery(api.participants.listForSession, { sessionId });
  const challenges = useQuery(api.challenges.listForSession, { sessionId });
  const [enfocado, setEnfocado] = useState<Id<"participants"> | null>(null);

  const nombrePorParticipante = new Map(
    (participantes ?? []).map((p) => [p._id as string, p.displayName]),
  );
  const nombreEnfocado =
    enfocado === null ? null : (nombrePorParticipante.get(enfocado) ?? "Candidato");

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader
        actions={
          session && (
            <div className="flex items-center gap-4">
              {session.status === "live" && <Countdown endsAt={session.endsAt} />}
              <SessionControls sessionId={sessionId} status={session.status} />
            </div>
          )
        }
      >
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/dashboard"
            className={`shrink-0 ${NAV_LINK}`}
          >
            Sesiones
          </Link>
          <span className="text-ink-400">/</span>
          <div className="min-w-0">
            <p className="truncate text-body-sm font-semibold text-ink-900">
              {session?.title ?? "…"}
            </p>
            {session && (
              <p className="tabular truncate font-mono text-meta text-ink-500">
                {(participantes ?? []).length} candidatos ·{" "}
                {(challenges ?? []).length} retos · {session.durationMinutes} min
              </p>
            )}
          </div>
          {session && (
            <Chip tone={ESTADO_TONO[session.status]} dot={session.status === "live"}>
              {ESTADO[session.status]}
            </Chip>
          )}
        </div>
      </AppHeader>

      <div className="grid flex-1 gap-6 p-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <main className="flex flex-col gap-6">
          {participantes === undefined ? (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <li
                  key={i}
                  className="h-80 animate-pulse rounded-2xl border border-ink-200 bg-white"
                />
              ))}
            </ul>
          ) : participantes.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink-300 bg-white px-8 py-16 text-center">
              <h2 className="font-display text-subtitle text-ink-900">
                Todavía no ha entrado nadie
              </h2>
              <p className="max-w-[46ch] text-body-sm text-ink-500">
                Comparte este enlace con los candidatos. Cada uno entra a su
                propio entorno, aislado de los demás.
              </p>
              <p className="tabular mt-1 rounded-md border border-ink-200 bg-ink-25 px-3 py-2 font-mono text-code text-ink-900">
                /join/{session?.joinCode ?? "…"}
              </p>
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {participantes.map((participante) => (
                <ParticipantCard
                  key={participante._id}
                  participante={participante}
                  enfocado={enfocado === participante._id}
                  onEnfocar={() =>
                    setEnfocado(
                      enfocado === participante._id ? null : participante._id,
                    )
                  }
                />
              ))}
            </ul>
          )}

          {enfocado !== null && nombreEnfocado !== null && (
            <FocusPanel
              sessionId={sessionId}
              participantId={enfocado}
              nombre={nombreEnfocado}
              onCerrar={() => setEnfocado(null)}
            />
          )}
        </main>

        <AlertsPanel
          sessionId={sessionId}
          nombrePorParticipante={nombrePorParticipante}
          onEnfocar={setEnfocado}
        />
      </div>
    </div>
  );
}
