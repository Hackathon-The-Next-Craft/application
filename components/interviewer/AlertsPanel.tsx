"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/Button";

const TIPO: Record<Doc<"alerts">["type"], string> = {
  inactivity: "Inactividad",
  repeated_error: "Error repetido",
  env_failure: "Fallo de entorno",
  help_requested: "Pidió ayuda",
};

// §6: el filete izquierdo de 3 px lleva el color del estado que disparó la alerta.
const FILETE: Record<Doc<"alerts">["type"], string> = {
  inactivity: "border-l-stuck",
  repeated_error: "border-l-stuck",
  env_failure: "border-l-fail",
  help_requested: "border-l-explore",
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
      <h2 className="font-display text-subtitle text-ink-900">Alertas</h2>

      {alertas === undefined ? (
        <div className="h-24 animate-pulse rounded-2xl border border-ink-200 bg-white" />
      ) : alertas.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-ink-300 bg-white p-6 text-center text-body-sm text-ink-500">
          Sin alertas por ahora.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {alertas.map((alerta) => {
            const atendida = alerta.acknowledgedAt !== undefined;
            return (
              <li
                key={alerta._id}
                className={`rounded-lg border border-l-[3px] bg-white px-4 py-3.5 ${
                  atendida
                    ? "border-ink-200 border-l-ink-300 opacity-60"
                    : `border-ink-200 ${FILETE[alerta.type]}`
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-mono text-label uppercase text-ink-500">
                    {TIPO[alerta.type]}
                  </span>
                  <span className="tabular font-mono text-meta text-ink-500">
                    {hora(alerta.at)}
                  </span>
                </div>

                <p className="mt-1.5 text-body-sm font-semibold text-ink-900">
                  {nombrePorParticipante.get(alerta.participantId) ?? "Candidato"}
                </p>
                {/* La razón viene legible desde el backend; se muestra tal cual. */}
                <p className="mt-0.5 text-body-sm text-ink-500">{alerta.reason}</p>

                <div className="mt-3 flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={atendida ? "ghost" : "primary"}
                    onClick={() => onEnfocar(alerta.participantId)}
                  >
                    Enfocar
                  </Button>
                  {!atendida && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => acknowledge({ sessionId, alertId: alerta._id })}
                    >
                      Marcar como vista
                    </Button>
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
