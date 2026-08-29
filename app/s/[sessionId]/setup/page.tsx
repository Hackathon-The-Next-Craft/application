"use client";

import Link from "next/link";
import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ChallengeEditor } from "@/components/interviewer/ChallengeEditor";
import { GenerateChallenges } from "@/components/interviewer/GenerateChallenges";
import { LinkPanel } from "@/components/interviewer/LinkPanel";

export default function SetupPage({ params }: PageProps<"/s/[sessionId]/setup">) {
  const sessionId = use(params).sessionId as Id<"sessions">;

  const session = useQuery(api.sessions.get, { sessionId });
  const challenges = useQuery(api.challenges.listForSession, { sessionId });

  const publicados = (challenges ?? []).filter((c) => c.published).length;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 p-6">
      <Link
        href="/dashboard"
        className="text-sm text-zinc-500 underline underline-offset-4 hover:text-zinc-900"
      >
        ← Mis sesiones
      </Link>

      {session === undefined ? (
        <div className="mt-6 h-32 animate-pulse rounded-lg border border-zinc-200 bg-white" />
      ) : (
        <>
          <header className="mt-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {session.title}
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                {session.role} · {session.seniority} · {session.durationMinutes} min
              </p>
            </div>
            <Link
              href={`/s/${sessionId}/live`}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
            >
              Ver en vivo →
            </Link>
          </header>

          <div className="mt-6 flex flex-col gap-6">
            <LinkPanel
              sessionId={sessionId}
              joinCode={session.joinCode}
              linkRevoked={session.linkRevoked}
            />

            <GenerateChallenges sessionId={sessionId} />

            <section className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between">
                <h2 className="font-medium">Retos</h2>
                {challenges !== undefined && challenges.length > 0 && (
                  <span className="text-sm text-zinc-500">
                    {publicados} de {challenges.length} publicados
                  </span>
                )}
              </div>

              {challenges === undefined ? (
                <div className="h-24 animate-pulse rounded-lg border border-zinc-200 bg-white" />
              ) : challenges.length === 0 ? (
                <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
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
                <p className="rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  Ningún reto está publicado todavía, así que los candidatos no
                  ven nada en su sala.
                </p>
              )}
            </section>
          </div>
        </>
      )}
    </main>
  );
}
