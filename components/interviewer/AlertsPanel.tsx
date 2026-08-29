"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";

const TIPO: Record<Doc<"alerts">["type"], string> = {
  inactivity: "Inactividad",
  repeated_error: "Error repetido",
  env_failure: "Fallo de entorno",
  help_requested: "Pidió ayuda",
};

function hora(at: number) {
  return new Date(at).toLocaleTimeString("es", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AlertsPanel({
  sessionId,
  nombrePorParticipante,
  onEnfocar,
}: {
  sessionId: Id<"sessions">;
  nombrePorParticipante: Map<string, string>;
  onEnfocar: (participantId: Id<"participants">) => void;
}) {
  const alertas = useQuery(api.alerts.listForSession, { sessionId });
  const acknowledge = useMutation(api.alerts.acknowledge);

  return (
    <aside className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold tracking-tight">Alertas</h2>

      {alertas === undefined ? (
        <div className="h-24 animate-pulse rounded-lg border border-zinc-200 bg-white" />
      ) : alertas.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-4 text-sm text-zinc-500">
          Sin alertas por ahora.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {alertas.map((alerta) => {
            const atendida = alerta.acknowledgedAt !== undefined;
            return (
              <li
                key={alerta._id}
                className={`rounded-lg border p-3 ${
                  atendida
                    ? "border-zinc-200 bg-zinc-50 text-zinc-500"
                    : "border-amber-300 bg-amber-50"
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-medium">
                    {TIPO[alerta.type]}
                  </span>
                  <span className="text-xs text-zinc-500">{hora(alerta.at)}</span>
                </div>

                <p className="mt-1 text-sm font-medium">
                  {nombrePorParticipante.get(alerta.participantId) ?? "Candidato"}
                </p>
                {/* La razón viene legible desde el backend; se muestra tal cual. */}
                <p className="mt-0.5 text-sm">{alerta.reason}</p>

                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => onEnfocar(alerta.participantId)}
                    className="rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium hover:bg-zinc-100"
                  >
                    Enfocar
                  </button>
                  {!atendida && (
                    <button
                      type="button"
                      onClick={() => acknowledge({ sessionId, alertId: alerta._id })}
                      className="rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium hover:bg-zinc-100"
                    >
                      Marcar como vista
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
