"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export function FocusPanel({
  sessionId,
  participantId,
  nombre,
  onCerrar,
}: {
  sessionId: Id<"sessions">;
  participantId: Id<"participants">;
  nombre: string;
  onCerrar: () => void;
}) {
  const workspaces = useQuery(api.workspaces.focus, { sessionId, participantId });

  // focus devuelve un workspace por reto; interesa el que tocó más recientemente.
  const activo =
    workspaces === undefined
      ? undefined
      : [...workspaces].sort((a, b) => b.updatedAt - a.updatedAt)[0];

  return (
    <section className="rounded-lg border border-zinc-900 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-medium">Foco: {nombre}</h2>
        <button
          type="button"
          onClick={onCerrar}
          className="text-sm text-zinc-500 underline underline-offset-4 hover:text-zinc-900"
        >
          Quitar foco
        </button>
      </div>

      {workspaces === undefined ? (
        <div className="mt-4 h-48 animate-pulse rounded-md bg-zinc-100" />
      ) : activo === undefined ? (
        <p className="mt-4 text-sm text-zinc-500">
          Este candidato todavía no abrió ningún reto.
        </p>
      ) : (
        <>
          <pre className="mt-4 max-h-96 overflow-auto rounded-md bg-zinc-50 p-3 font-mono text-xs leading-relaxed text-zinc-800">
            {activo.code || "// sin código todavía"}
          </pre>

          {activo.lastRun ? (
            <div className="mt-4 text-sm">
              <p className="font-medium">
                Última ejecución: {activo.lastRun.passed}/{activo.lastRun.total} tests
                {" · "}
                {activo.lastRun.durationMs} ms
              </p>
              {activo.lastRun.stdout && (
                <pre className="mt-2 max-h-40 overflow-auto rounded-md bg-zinc-50 p-3 font-mono text-xs text-zinc-800">
                  {activo.lastRun.stdout}
                </pre>
              )}
              {activo.lastRun.stderr && (
                <pre className="mt-2 max-h-40 overflow-auto rounded-md bg-red-50 p-3 font-mono text-xs text-red-800">
                  {activo.lastRun.stderr}
                </pre>
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-zinc-500">Todavía no ejecuta nada.</p>
          )}

          {activo.submittedAt !== undefined && (
            <p className="mt-3 text-sm text-purple-800">Ya envió su solución.</p>
          )}
        </>
      )}
    </section>
  );
}
