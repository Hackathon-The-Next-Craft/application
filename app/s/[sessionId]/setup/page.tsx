"use client";

import Link from "next/link";
import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { ChallengeEditor } from "@/components/interviewer/ChallengeEditor";
import { GenerateChallenges } from "@/components/interviewer/GenerateChallenges";
import { LinkPanel } from "@/components/interviewer/LinkPanel";
import { SessionControls } from "@/components/interviewer/SessionControls";
import { AppHeader } from "@/components/ui/AppHeader";
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

const PRESENCIA: Record<Doc<"participants">["presence"], string> = {
  invited: "Invitado, aún no entra",
  lobby: "En la sala de espera",
  ready: "Listo",
  live: "Conectado",
  disconnected: "Desconectado",
  removed: "Retirado de la sesión",
};

function hora(at: number) {
  return new Date(at).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
}

export default function SetupPage({ params }: PageProps<"/s/[sessionId]/setup">) {
  const sessionId = use(params).sessionId as Id<"sessions">;

  const session = useQuery(api.sessions.get, { sessionId });
  const challenges = useQuery(api.challenges.listForSession, { sessionId });
  const participantes = useQuery(api.participants.listForSession, { sessionId });

  const publicados = (challenges ?? []).filter((c) => c.published).length;
  const listos = (participantes ?? []).filter((p) => p.presence === "ready").length;

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader
        actions={
          session && <SessionControls sessionId={sessionId} status={session.status} />
        }
      >
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/dashboard"
            className="shrink-0 text-body-sm text-ink-500 underline underline-offset-4 hover:text-iris-600"
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
                {session.role} · {session.seniority} · {session.durationMinutes} min
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

      {session === undefined ? (
        <main className="mx-auto w-full max-w-[1080px] flex-1 p-8">
          <div className="h-32 animate-pulse rounded-2xl border border-ink-200 bg-white" />
        </main>
      ) : (
        <main className="mx-auto grid w-full max-w-[1080px] flex-1 gap-6 p-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex flex-col gap-6">
            <LinkPanel
              sessionId={sessionId}
              joinCode={session.joinCode}
              linkRevoked={session.linkRevoked}
            />

            <GenerateChallenges sessionId={sessionId} />

            <section className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-subtitle text-ink-900">Retos</h2>
                {challenges !== undefined && challenges.length > 0 && (
                  <span className="tabular font-mono text-meta text-ink-500">
                    {publicados} de {challenges.length} publicados
                  </span>
                )}
              </div>

              {challenges === undefined ? (
                <div className="h-24 animate-pulse rounded-2xl border border-ink-200 bg-white" />
              ) : challenges.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-ink-300 bg-white p-8 text-center text-body-sm text-ink-500">
                  Todavía no hay retos. Genera el primero con IA y edítalo antes
                  de publicarlo.
                </p>
              ) : (
                [...challenges]
                  .sort((a, b) => a.order - b.order)
                  .map((challenge) => (
                    <ChallengeEditor key={challenge._id} challenge={challenge} />
                  ))
              )}

              {challenges !== undefined && challenges.length > 0 && publicados === 0 && (
                <p className="rounded-lg border border-ink-200 border-l-[3px] border-l-stuck bg-white px-4 py-3 text-body-sm text-ink-900">
                  Ningún reto está publicado todavía, así que los candidatos no
                  ven nada en su sala.
                </p>
              )}
            </section>
          </div>

          {/* Quién ha llegado ya. Los datos salen de participants.listForSession,
              la misma consulta que alimenta el mosaico en vivo. */}
          <aside className="flex flex-col gap-6">
            <section className="rounded-2xl border border-ink-200 bg-white">
              <div className="flex items-center gap-3 border-b border-ink-200 px-5 py-4">
                <h2 className="flex-1 font-display text-subtitle text-ink-900">
                  En el lobby
                </h2>
                {participantes !== undefined && (
                  <span className="tabular font-mono text-meta text-ink-500">
                    {listos} de {session.maxCandidates} listos
                  </span>
                )}
              </div>

              {participantes === undefined ? (
                <div className="h-24 animate-pulse bg-ink-25" />
              ) : participantes.length === 0 ? (
                <p className="px-5 py-8 text-center text-body-sm text-ink-500">
                  Todavía no ha entrado nadie. Comparte el enlace de arriba.
                </p>
              ) : (
                <ul>
                  {participantes.map((p) => {
                    const micFallo =
                      p.deviceCheck !== undefined && !p.deviceCheck.micOk;
                    const listo = p.presence === "ready";
                    return (
                      <li
                        key={p._id}
                        className={`flex flex-col gap-2 border-b border-ink-200 px-5 py-4 last:border-b-0 ${
                          micFallo ? "bg-stuck-bg" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-iris-200 bg-iris-100 font-sans text-[12px] font-semibold text-iris-700">
                            {p.displayName.slice(0, 2).toUpperCase()}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-body-sm font-semibold text-ink-900">
                              {p.displayName}
                            </p>
                            <p className="tabular truncate font-mono text-meta text-ink-500">
                              {PRESENCIA[p.presence]} · {hora(p.lastActivityAt)}
                            </p>
                          </div>
                          <Chip tone={listo ? "advance" : micFallo ? "stuck" : "neutral"}>
                            {listo ? "Listo" : micFallo ? "No listo" : "Espera"}
                          </Chip>
                        </div>

                        {micFallo ? (
                          <p className="text-body-sm text-stuck-text">
                            No pudo usar el micrófono.{" "}
                            {p.deviceCheck?.error ??
                              "El navegador no dejó abrir el dispositivo."}
                          </p>
                        ) : (
                          <p className="text-caption text-ink-500">
                            {p.consent.audio ? "Consintió audio" : "Sin audio"}
                            {" · "}
                            {p.consent.transcript
                              ? "consintió transcripción"
                              : "sin transcripción"}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <p className="text-caption text-ink-400">
              Los candidatos no se ven ni se oyen entre sí en ningún momento de la
              sesión.
            </p>
          </aside>
        </main>
      )}
    </div>
  );
}
