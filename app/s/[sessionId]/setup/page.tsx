"use client";

import Link from "next/link";
import { use } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { SessionControls } from "@/components/interviewer/SessionControls";
import { AppHeader } from "@/components/ui/AppHeader";
import { Button } from "@/components/ui/Button";
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
};

function hora(at: number) {
  return new Date(at).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
}

export default function SetupPage({ params }: PageProps<"/s/[sessionId]/setup">) {
  const { sessionId } = use(params);
  const id = sessionId as Id<"sessions">;

  const session = useQuery(api.sessions.get, { sessionId: id });
  const participantes = useQuery(api.participants.listForSession, { sessionId: id });
  const retos = useQuery(api.challenges.listForSession, { sessionId: id });
  const setLinkRevoked = useMutation(api.sessions.setLinkRevoked);

  const listos = (participantes ?? []).filter((p) => p.presence === "ready").length;

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader
        actions={session && <SessionControls sessionId={id} status={session.status} />}
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

      <main className="mx-auto grid w-full max-w-[1080px] flex-1 gap-6 p-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-6">
          {/* Enlace de la sesión */}
          <section className="rounded-2xl border border-ink-200 bg-white p-6">
            <h2 className="font-display text-subtitle text-ink-900">
              Enlace de la sesión
            </h2>

            {session === undefined ? (
              <div className="mt-4 h-10 animate-pulse rounded-md bg-ink-100" />
            ) : (
              <>
                <div className="mt-4 flex items-center gap-2.5">
                  <p className="tabular flex h-10 flex-1 items-center rounded-md border border-ink-200 bg-ink-25 px-3 font-mono text-code text-ink-900">
                    /join/{session.joinCode}
                  </p>
                  <Button
                    type="button"
                    variant={session.linkRevoked ? "primary" : "ghost"}
                    onClick={() =>
                      setLinkRevoked({ sessionId: id, revoked: !session.linkRevoked })
                    }
                  >
                    {session.linkRevoked ? "Volver a habilitar" : "Revocar"}
                  </Button>
                </div>

                {session.linkRevoked ? (
                  <p className="mt-3 rounded-lg border border-ink-200 border-l-[3px] border-l-stuck bg-white px-4 py-2.5 text-body-sm text-ink-900">
                    El enlace está revocado: nadie más puede entrar. Quien ya esté
                    dentro sigue conectado.
                  </p>
                ) : (
                  <p className="mt-3 text-body-sm text-ink-500">
                    Cada candidato entra con su propio token. Revocar impide nuevos
                    ingresos; quien ya esté dentro sigue conectado.
                  </p>
                )}
              </>
            )}
          </section>

          {/* Candidatos en el lobby */}
          <section className="rounded-2xl border border-ink-200 bg-white">
            <div className="flex items-center gap-3 border-b border-ink-200 px-6 py-4">
              <h2 className="flex-1 font-display text-subtitle text-ink-900">
                Candidatos en el lobby
              </h2>
              {participantes !== undefined && session && (
                <span className="tabular font-mono text-meta text-ink-500">
                  {listos} de {session.maxCandidates} listos
                </span>
              )}
            </div>

            {participantes === undefined ? (
              <div className="h-24 animate-pulse bg-ink-25" />
            ) : participantes.length === 0 ? (
              <p className="px-6 py-10 text-center text-body-sm text-ink-500">
                Todavía no ha entrado nadie. Comparte el enlace de arriba.
              </p>
            ) : (
              <ul>
                {participantes.map((p) => {
                  const micFallo = p.deviceCheck !== undefined && !p.deviceCheck.micOk;
                  const listo = p.presence === "ready";
                  return (
                    <li
                      key={p._id}
                      className={`flex items-start gap-4 border-b border-ink-200 px-6 py-4 last:border-b-0 ${
                        micFallo ? "bg-stuck-bg" : ""
                      }`}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-iris-200 bg-iris-100 font-sans text-[13px] font-semibold text-iris-700">
                        {p.displayName.slice(0, 2).toUpperCase()}
                      </span>

                      <div className="w-40 shrink-0">
                        <p className="truncate text-body-sm font-semibold text-ink-900">
                          {p.displayName}
                        </p>
                        <p className="tabular font-mono text-meta text-ink-500">
                          {PRESENCIA[p.presence]}
                        </p>
                      </div>

                      <div className="flex-1">
                        {micFallo ? (
                          <>
                            <p className="text-body-sm font-semibold text-stuck-text">
                              No pudo usar el micrófono
                            </p>
                            <p className="mt-1 text-body-sm text-ink-500">
                              {p.deviceCheck?.error ??
                                "El navegador no dejó abrir el dispositivo."}
                            </p>
                          </>
                        ) : (
                          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                            <span className="text-body-sm text-ink-500">
                              {p.deviceCheck?.micOk
                                ? "Micrófono probado"
                                : "Micrófono sin probar"}
                            </span>
                            <span className="text-body-sm text-ink-500">
                              {p.consent.audio ? "Consintió audio" : "Sin audio"}
                            </span>
                            <span className="text-body-sm text-ink-500">
                              {p.consent.transcript
                                ? "Consintió transcripción"
                                : "Sin transcripción"}
                            </span>
                          </div>
                        )}
                        <p className="tabular mt-1 font-mono text-meta text-ink-400">
                          última actividad {hora(p.lastActivityAt)}
                        </p>
                      </div>

                      <Chip tone={listo ? "advance" : micFallo ? "stuck" : "neutral"}>
                        {listo ? "Listo" : micFallo ? "No listo" : "En espera"}
                      </Chip>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        {/* Qué se publicará */}
        <aside className="flex flex-col gap-6">
          <section className="rounded-2xl border border-ink-200 bg-white p-6">
            <h2 className="font-display text-subtitle text-ink-900">
              Qué se publicará
            </h2>

            {retos === undefined ? (
              <div className="mt-4 h-20 animate-pulse rounded-lg bg-ink-100" />
            ) : retos.length === 0 ? (
              <p className="mt-3 text-body-sm text-ink-500">
                Todavía no hay retos para esta sesión. Sin al menos uno publicado,
                los candidatos entran a una sala vacía.
              </p>
            ) : (
              <ul className="mt-4 flex flex-col gap-2.5">
                {[...retos]
                  .sort((a, b) => a.order - b.order)
                  .map((reto) => (
                    <li
                      key={reto._id}
                      className="flex gap-3 rounded-lg border border-ink-200 p-3"
                    >
                      <span className="tabular flex h-6 w-6 shrink-0 items-center justify-center rounded-xs bg-iris-100 font-mono text-meta font-bold text-iris-700">
                        {reto.order}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-body-sm font-medium text-ink-900">
                          {reto.title}
                        </p>
                        <p className="tabular mt-0.5 font-mono text-meta text-ink-500">
                          {reto.language} · {reto.timeLimitMinutes} min ·{" "}
                          {reto.tests.filter((t) => !t.hidden).length} tests públicos
                        </p>
                      </div>
                      {!reto.published && <Chip tone="stuck">Borrador</Chip>}
                    </li>
                  ))}
              </ul>
            )}

            <p className="mt-4 text-body-sm text-ink-500">
              Todos los candidatos reciben el mismo set, cada uno en su propio
              entorno aislado.
            </p>
          </section>

          <p className="text-caption text-ink-400">
            Los candidatos no se ven ni se oyen entre sí en ningún momento de la
            sesión.
          </p>
        </aside>
      </main>
    </div>
  );
}
