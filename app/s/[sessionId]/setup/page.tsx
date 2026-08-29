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
    <main className="mx-auto w-full max-w-3xl flex-1 p-6">
      <Link
        href="/dashboard"
        className="text-sm text-zinc-500 underline underline-offset-4 hover:text-zinc-900"
      >
        ← Mis sesiones
      </Link>

      {session === undefined ? (
        <div className="mt-6 h-32 animate-pulse rounded-lg border border-zinc-200 bg-white" />
      ) : session === null ? (
        <p className="mt-6 text-sm text-zinc-500">Esa sesión no existe.</p>
      ) : (
        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            {session.title}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {session.role} · {session.seniority} · {session.durationMinutes} min
          </p>
          <p className="mt-4 text-sm">
            Código de acceso:{" "}
            <span className="font-mono text-zinc-600">{session.joinCode}</span>
          </p>
          <p className="mt-6 border-t border-zinc-200 pt-4 text-sm text-zinc-500">
            Preparación de retos: rama 5.
          </p>
        </div>
      )}
    </main>
  );
}
