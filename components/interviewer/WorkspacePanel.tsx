"use client";

import { useQuery } from "convex/react";
import { useState } from "react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Chip } from "@/components/ui/Chip";

type Challenge = FunctionReturnType<typeof api.challenges.listForSession>[number];

function hora(at: number) {
  return new Date(at).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
}

/** Centro de la pantalla 8: el código del candidato, reto por reto. */
export function WorkspacePanel({
  sessionId,
  participantId,
  challenges,
}: {
  sessionId: Id<"sessions">;
  participantId: Id<"participants">;
  challenges: Challenge[];
}) {
  const workspaces = useQuery(api.workspaces.focus, { sessionId, participantId });
  const [seleccionado, setSeleccionado] = useState<Id<"challenges"> | null>(null);

  if (workspaces === undefined) {
    return <div className="h-96 animate-pulse rounded-2xl border border-ink-200 bg-white" />;
  }

  if (workspaces.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-ink-300 bg-white p-16 text-center">
        <p className="font-display text-subtitle text-ink-900">
          Todavía no abrió ningún reto
        </p>
        <p className="text-body-sm text-ink-500">
          En cuanto entre a un reto, su código aparece aquí en vivo.
        </p>
      </div>
    );
  }

  const ordenados = [...workspaces].sort((a, b) => {
    const oa = challenges.find((c) => c._id === a.challengeId)?.order ?? 0;
    const ob = challenges.find((c) => c._id === b.challengeId)?.order ?? 0;
    return oa - ob;
  });

  const activo =
    ordenados.find((w) => w.challengeId === seleccionado) ??
    [...ordenados].sort((a, b) => b.updatedAt - a.updatedAt)[0];

  const challenge = challenges.find((c) => c._id === activo.challengeId);

  return (
    <div className="flex flex-1 flex-col rounded-2xl border border-ink-200 bg-white">
      <div className="flex items-center gap-2 border-b border-ink-200 px-5 py-3">
        {ordenados.length > 1 ? (
          ordenados.map((w, i) => {
            const c = challenges.find((c) => c._id === w.challengeId);
            const esActivo = w.challengeId === activo.challengeId;
            return (
              <button
                key={w._id}
                type="button"
                onClick={() => setSeleccionado(w.challengeId)}
                className={`rounded-md px-2.5 py-1 text-body-sm font-medium transition-colors duration-[120ms] ${
                  esActivo
                    ? "bg-iris-100 text-iris-700"
                    : "text-ink-500 hover:bg-ink-50 hover:text-ink-900"
                }`}
              >
                Reto {i + 1} · {c?.title ?? "…"}
              </button>
            );
          })
        ) : (
          <span className="text-body-sm font-medium text-ink-900">
            {challenge?.title ?? "Reto"}
          </span>
        )}
        <div className="flex-1" />
        {activo.submittedAt !== undefined && <Chip tone="done">Ya envió su solución</Chip>}
      </div>

      <pre className="flex-1 overflow-auto p-5 font-mono text-code text-ink-900">
        {activo.code || "// sin código todavía"}
      </pre>

      <div className="border-t border-ink-200 bg-ink-25 px-5 py-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="mx-label font-mono text-label uppercase text-ink-500">
            Última ejecución
          </span>
          {activo.lastRun && (
            <span className="tabular font-mono text-meta text-ink-500">
              {hora(activo.lastRun.at)} · {activo.lastRun.durationMs} ms
            </span>
          )}
        </div>
        {activo.lastRun === undefined ? (
          <p className="text-body-sm text-ink-500">Todavía no ejecuta nada.</p>
        ) : (
          <>
            <p className="tabular font-mono text-body-sm text-ink-900">
              {activo.lastRun.passed}/{activo.lastRun.total} tests
            </p>
            {activo.lastRun.stdout && (
              <pre className="mt-2 max-h-32 overflow-auto rounded-md border border-ink-200 bg-white p-3 font-mono text-meta text-ink-700">
                {activo.lastRun.stdout}
              </pre>
            )}
            {activo.lastRun.stderr && (
              <pre className="mt-2 max-h-32 overflow-auto rounded-md border border-fail-bg bg-fail-bg p-3 font-mono text-meta text-fail-text">
                {activo.lastRun.stderr}
              </pre>
            )}
          </>
        )}
      </div>
    </div>
  );
}
