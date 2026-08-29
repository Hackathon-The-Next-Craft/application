"use client";

import Link from "next/link";
import { useMutation } from "convex/react";
import { useState } from "react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/Button";
import { ProgressBadge, PROGRESS_TONE } from "./ProgressBadge";

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
  // No debería verse en el mosaico: listForSession filtra a los retirados.
  removed: "Retirado de la sesión",
};

// §4: el estado va en el filete izquierdo de 3 px, nunca como fondo de la
// tarjeta entera — el panel no debe encenderse.
const FILETE: Record<(typeof PROGRESS_TONE)[keyof typeof PROGRESS_TONE], string> = {
  advance: "border-l-advance",
  explore: "border-l-explore",
  stuck: "border-l-stuck",
  fail: "border-l-fail",
  done: "border-l-done",
  neutral: "border-l-ink-300",
  brand: "border-l-iris-600",
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
  const remove = useMutation(api.participants.remove);
  const [confirmandoRetiro, setConfirmandoRetiro] = useState(false);

  return (
    <li
      className={`flex flex-col rounded-2xl border border-l-[3px] bg-white p-4 transition-shadow duration-[120ms] ${
        FILETE[PROGRESS_TONE[participante.progress]]
      } ${enfocado ? "border-iris-600 shadow-md" : "border-ink-200"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-body-sm font-semibold text-ink-900">
            {participante.displayName}
          </h3>
          <p className="mt-0.5 text-meta text-ink-500">
            {PRESENCIA[participante.presence]}
          </p>
        </div>
        <ProgressBadge progress={participante.progress} />
      </div>

      {/* El punto del producto: la razón legible, no solo el color. */}
      <p className="mt-3 text-body-sm font-medium text-ink-900">
        {participante.progressReason}
      </p>

      <p className="tabular mt-1 font-mono text-meta text-ink-500">
        {lastRun
          ? `Tests ${lastRun.passed}/${lastRun.total} · última ejecución ${hora(lastRun.at)}`
          : "Todavía no ejecuta nada"}
      </p>

      <pre className="mt-3 h-40 overflow-auto rounded-2xl border border-ink-200 bg-ink-25 p-3 font-mono text-code text-ink-900">
        {participante.currentCode || "// sin código todavía"}
      </pre>

      <div className="mt-3 flex items-center gap-3">
        <Button type="button" variant="ghost" onClick={onEnfocar}>
          {enfocado ? "Enfocado" : "Enfocar"}
        </Button>
        <Link
          href={`/s/${participante.sessionId}/report/${participante._id}`}
          className="text-body-sm text-ink-500 underline underline-offset-4 hover:text-iris-600"
        >
          Reporte
        </Link>
        <button
          type="button"
          onClick={() => setConfirmandoRetiro(true)}
          className="ml-auto text-body-sm text-ink-500 underline underline-offset-4 hover:text-fail-text"
        >
          Retirar
        </button>
      </div>

      {confirmandoRetiro && (
        <div className="mt-3 rounded-2xl border border-ink-200 border-l-[3px] border-l-fail bg-white p-3">
          <p className="text-body-sm text-ink-900">
            {participante.displayName} dejará de contar para el cupo y perderá
            el acceso. Su trabajo y sus eventos se conservan.
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() =>
                remove({
                  sessionId: participante.sessionId,
                  participantId: participante._id,
                })
              }
              className="inline-flex h-9 items-center justify-center rounded-md bg-fail px-3.5 font-sans text-[13px] font-semibold leading-4 text-white transition-colors duration-[120ms] hover:brightness-95"
            >
              Sí, retirar
            </button>
            <button
              type="button"
              onClick={() => setConfirmandoRetiro(false)}
              className="rounded-md border border-ink-200 bg-white px-3 py-1.5 text-body-sm font-medium hover:bg-iris-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
