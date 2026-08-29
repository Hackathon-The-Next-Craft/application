"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Chip } from "@/components/ui/Chip";

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
    <section className="rounded-2xl border border-iris-600 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-subtitle text-ink-900">Foco: {nombre}</h2>
        <button
          type="button"
          onClick={onCerrar}
          className="text-body-sm text-ink-500 underline underline-offset-4 hover:text-iris-600"
        >
          Quitar foco
        </button>
      </div>

      {workspaces === undefined ? (
        <div className="mt-4 h-48 animate-pulse rounded-lg bg-ink-100" />
      ) : activo === undefined ? (
        <p className="mt-4 text-body-sm text-ink-500">
          Este candidato todavía no abrió ningún reto.
        </p>
      ) : (
        <>
          <pre className="mt-4 max-h-96 overflow-auto rounded-lg border border-ink-200 bg-ink-25 p-3 font-mono text-code text-ink-900">
            {activo.code || "// sin código todavía"}
          </pre>

          {activo.lastRun ? (
            <div className="mt-4">
              <p className="tabular font-mono text-meta text-ink-500">
                Última ejecución: {activo.lastRun.passed}/{activo.lastRun.total} tests
                {" · "}
                {activo.lastRun.durationMs} ms
              </p>
              {activo.lastRun.stdout && (
                <pre className="mt-2 max-h-40 overflow-auto rounded-lg border border-ink-200 bg-ink-25 p-3 font-mono text-code text-ink-900">
                  {activo.lastRun.stdout}
                </pre>
              )}
              {activo.lastRun.stderr && (
                <pre className="mt-2 max-h-40 overflow-auto rounded-lg border border-fail-bg bg-fail-bg p-3 font-mono text-code text-fail-text">
                  {activo.lastRun.stderr}
                </pre>
              )}
            </div>
          ) : (
            <p className="mt-4 text-body-sm text-ink-500">Todavía no ejecuta nada.</p>
          )}

          {activo.submittedAt !== undefined && (
            <Chip tone="done" className="mt-3">
              Ya envió su solución
            </Chip>
          )}
        </>
      )}
    </section>
  );
}
