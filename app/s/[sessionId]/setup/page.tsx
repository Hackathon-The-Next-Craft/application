"use client";

import Link from "next/link";
import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

// Placeholder de la rama 1: `sessions.create` navega aquí y sin esto sería un 404.
// La pantalla real (generar / editar / publicar retos) es la rama 5.
export default function SetupPage({
  params,
}: PageProps<"/s/[sessionId]/setup">) {
  const { sessionId } = use(params);
  const session = useQuery(api.sessions.get, {
    sessionId: sessionId as Id<"sessions">,
  });

  return (
    <main className="mx-auto w-full max-w-[1080px] flex-1 p-8">
      <Link
        href="/dashboard"
        className="text-body-sm text-ink-500 underline underline-offset-4 hover:text-iris-600"
      >
        ← Mis sesiones
      </Link>

      {session === undefined ? (
        <div className="mt-6 h-32 animate-pulse rounded-2xl border border-ink-200 bg-white" />
      ) : (
        <div className="mt-6 rounded-2xl border border-ink-200 bg-white p-6">
          <h1 className="font-display text-title text-ink-900">
            {session.title}
          </h1>
          <p className="mt-1 text-body-sm text-ink-500">
            {session.role} · {session.seniority} · {session.durationMinutes} min
          </p>
          <p className="mt-4 text-body-sm text-ink-900">
            Código de acceso:{" "}
            <span className="tabular font-mono text-code text-ink-900">{session.joinCode}</span>
          </p>
          <Link
            href={`/s/${sessionId}/live`}
            className="mt-4 inline-block text-body-sm text-iris-600 underline underline-offset-4 hover:text-iris-700"
          >
            Ver la sesión en vivo →
          </Link>
          <p className="mt-6 border-t border-ink-200 pt-4 text-body-sm text-ink-500">
            Preparación de retos: rama 5.
          </p>
        </div>
      )}
    </main>
  );
}
