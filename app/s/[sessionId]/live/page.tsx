"use client";

import Link from "next/link";
import { use, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { AlertsPanel } from "@/components/interviewer/AlertsPanel";
import { FocusPanel } from "@/components/interviewer/FocusPanel";
import { ParticipantCard } from "@/components/interviewer/ParticipantCard";
import { SessionControls } from "@/components/interviewer/SessionControls";

const ESTADO: Record<Doc<"sessions">["status"], string> = {
  draft: "Borrador",
  ready: "Lista",
  live: "En vivo",
  paused: "Pausada",
  closing: "Finalizando",
  closed: "Cerrada",
};

export default function LivePage({ params }: PageProps<"/s/[sessionId]/live"> ) {
  const sessionId = use(params).sessionId as Id<"sessions">;

  // Un solo useQuery alimenta todo el mosaico, como pide frontend.md.
  // Reactivo: el código de los candidatos cambia solo, sin polling.
  const session = useQuery(api.sessions.get, { sessionId });
  const participantes = useQuery(api.participants.listForSession, { sessionId });
  const [enfocado, setEnfocado] = useState<Id<"participants"> | null>(null);

  const nombrePorParticipante = new Map(
    (participantes ?? []).map((p) => [p._id as string, p.displayName]),
  );
  const nombreEnfocado =
    enfocado === null ? null : (nombrePorParticipante.get(enfocado) ?? "Candidato");

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 bg-white px-6 py-4">
        <div className="min-w-0">
          <Link
            href="/dashboard"
            className="text-sm text-zinc-500 underline underline-offset-4 hover:text-zinc-900"
          >
            ← Mis sesiones
          </Link>
          <h1 className="mt-1 truncate text-xl font-semibold tracking-tight">
            {session?.title ?? "…"}
          </h1>
        </div>

        {session && (
          <div className="flex items-center gap-4">
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
              {ESTADO[session.status]}
            </span>
            <SessionControls sessionId={sessionId} status={session.status} />
          </div>
        )}
      </header>

      <div className="grid flex-1 gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <main className="flex flex-col gap-6">
          {participantes === undefined ? (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <li
                  key={i}
                  className="h-80 animate-pulse rounded-lg border border-zinc-200 bg-white"
                />
              ))}
            </ul>
          ) : participantes.length === 0 ? (
            <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
              Todavía no ha entrado nadie. Comparte el link{" "}
              <span className="font-mono">/join/{session?.joinCode ?? "…"}</span>.
            </p>
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
