"use client";

import Link from "next/link";
import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Countdown } from "@/components/interviewer/Countdown";
import { NotesPanel } from "@/components/interviewer/NotesPanel";
import { ProgressBadge, PROGRESS_TONE } from "@/components/interviewer/ProgressBadge";
import { SessionControls } from "@/components/interviewer/SessionControls";
import { Timeline } from "@/components/interviewer/Timeline";
import { WorkspacePanel } from "@/components/interviewer/WorkspacePanel";
import { AppHeader, NAV_LINK } from "@/components/ui/AppHeader";

const DOT_TONE: Record<string, string> = {
  advance: "bg-advance",
  explore: "bg-explore",
  stuck: "bg-stuck",
  fail: "bg-fail",
  done: "bg-done",
  neutral: "bg-ink-300",
  brand: "bg-iris-600",
};

function iniciales(nombre: string) {
  return nombre.slice(0, 2).toUpperCase();
}

/** Pantalla 8: foco en un candidato. Entrar aquí no interrumpe a los demás. */
export default function WorkspaceFocoPage({
  params,
}: PageProps<"/s/[sessionId]/live/[participantId]">) {
  const { sessionId: rawSession, participantId: rawParticipant } = use(params);
  const sessionId = rawSession as Id<"sessions">;
  const participantId = rawParticipant as Id<"participants">;

  const session = useQuery(api.sessions.get, { sessionId });
  const participantes = useQuery(api.participants.listForSession, { sessionId });
  const challenges = useQuery(api.challenges.listForSession, { sessionId });

  const actual = participantes?.find((p) => p._id === participantId);

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
          <Link href={`/s/${sessionId}/live`} className={`shrink-0 ${NAV_LINK}`}>
            ← Mosaico
          </Link>
          <span className="text-ink-400">/</span>
          {actual ? (
            <div className="flex min-w-0 items-center gap-2.5">
              <h1 className="truncate text-body-sm font-semibold text-ink-900">
                {actual.displayName}
              </h1>
              <ProgressBadge progress={actual.progress} />
              <span className="tabular truncate font-mono text-meta text-ink-500">
                {actual.progressReason}
              </span>
            </div>
          ) : (
            <p className="text-body-sm text-ink-500">…</p>
          )}
        </div>
      </AppHeader>

      {participantes !== undefined && actual === undefined ? (
        <main className="mx-auto w-full max-w-[560px] flex-1 p-8 text-center">
          <p className="mt-8 text-body-sm text-ink-500">
            No encontramos a este candidato en la sesión — puede que lo hayan
            retirado.
          </p>
          <Link
            href={`/s/${sessionId}/live`}
            className="mt-3 inline-block text-body-sm text-iris-600 underline underline-offset-4"
          >
            Volver al mosaico
          </Link>
        </main>
      ) : (
        <div className="grid flex-1 grid-cols-[88px_minmax(0,1fr)_360px] gap-6 p-6 min-h-0">
          {/* Sala: cambiar de candidato no interrumpe a nadie */}
          <nav className="flex flex-col items-center gap-2 rounded-2xl border border-ink-200 bg-white py-4">
            <span className="mb-1 font-mono text-label uppercase text-ink-400">Sala</span>
            {participantes === undefined
              ? [0, 1, 2].map((i) => (
                  <div key={i} className="h-16 w-16 animate-pulse rounded-xl bg-ink-100" />
                ))
              : participantes.map((p) => {
                  const esActual = p._id === participantId;
                  return (
                    <Link
                      key={p._id}
                      href={`/s/${sessionId}/live/${p._id}`}
                      className={`flex w-[68px] flex-col items-center gap-1.5 rounded-xl border px-1 py-2.5 transition-colors duration-[120ms] ${
                        esActual
                          ? "border-iris-200 bg-iris-100"
                          : "border-transparent hover:bg-ink-50"
                      }`}
                    >
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-full font-sans text-[12px] font-semibold ${
                          esActual
                            ? "bg-iris-600 text-white"
                            : "border border-iris-200 bg-iris-100 text-iris-700"
                        }`}
                      >
                        {iniciales(p.displayName)}
                      </span>
                      <span
                        className={`max-w-full truncate text-[12px] font-medium ${
                          esActual ? "text-iris-700" : "text-ink-500"
                        }`}
                      >
                        {p.displayName.split(" ")[0]}
                      </span>
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${DOT_TONE[PROGRESS_TONE[p.progress]]}`}
                      />
                    </Link>
                  );
                })}
          </nav>

          {challenges === undefined ? (
            <div className="h-96 animate-pulse rounded-2xl border border-ink-200 bg-white" />
          ) : (
            <WorkspacePanel
              sessionId={sessionId}
              participantId={participantId}
              challenges={challenges}
            />
          )}

          <aside className="flex flex-col gap-6 overflow-auto rounded-2xl border border-ink-200 bg-white p-5">
            <section className="flex flex-col gap-3">
              <h2 className="font-display text-body font-semibold text-ink-900">
                Nota privada
              </h2>
              <NotesPanel sessionId={sessionId} participantId={participantId} />
            </section>

            <section className="flex flex-col gap-3 border-t border-ink-200 pt-5">
              <h2 className="font-display text-body font-semibold text-ink-900">
                Línea de tiempo
              </h2>
              <Timeline sessionId={sessionId} participantId={participantId} />
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}
