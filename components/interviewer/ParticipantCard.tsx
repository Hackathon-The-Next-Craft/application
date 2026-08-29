"use client";

import type { FunctionReturnType } from "convex/server";
import type { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { ProgressBadge } from "./ProgressBadge";

// El tipo sale del backend: si Salim cambia listForSession, esto deja de compilar.
export type ParticipanteEnVivo = FunctionReturnType<
  typeof api.participants.listForSession
>[number];

const PRESENCIA: Record<Doc<"participants">["presence"], string> = {
  invited: "Invitado, aún no entra",
  lobby: "En la sala de espera",
  ready: "Listo",
  live: "Conectado",
  disconnected: "Desconectado",
};

function hora(at: number) {
  return new Date(at).toLocaleTimeString("es", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function ParticipantCard({
  participante,
  enfocado,
  onEnfocar,
}: {
  participante: ParticipanteEnVivo;
  enfocado: boolean;
  onEnfocar: () => void;
}) {
  const { lastRun } = participante;

  return (
    <li
      className={`flex flex-col rounded-lg border bg-white p-4 ${
        enfocado ? "border-zinc-900 ring-1 ring-zinc-900" : "border-zinc-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-medium">{participante.displayName}</h3>
          <p className="mt-0.5 text-xs text-zinc-500">
            {PRESENCIA[participante.presence]}
          </p>
        </div>
        <ProgressBadge progress={participante.progress} />
      </div>

      {/* El punto del producto: la razón legible, no solo el color. */}
      <p className="mt-3 text-sm font-medium text-zinc-900">
        {participante.progressReason}
      </p>

      <p className="mt-1 text-xs text-zinc-500">
        {lastRun
          ? `Tests ${lastRun.passed}/${lastRun.total} · última ejecución ${hora(lastRun.at)}`
          : "Todavía no ejecuta nada"}
      </p>

      <pre className="mt-3 h-40 overflow-auto rounded-md bg-zinc-50 p-3 font-mono text-xs leading-relaxed text-zinc-800">
        {participante.currentCode || "// sin código todavía"}
      </pre>

      <button
        type="button"
        onClick={onEnfocar}
        className="mt-3 self-start rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100"
      >
        {enfocado ? "Enfocado" : "Enfocar"}
      </button>
    </li>
  );
}
