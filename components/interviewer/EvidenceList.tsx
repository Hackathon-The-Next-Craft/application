"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const TIPO: Record<string, string> = {
  "participant.joined": "Entró a la sesión",
  "participant.left": "Salió",
  "participant.ready": "Se marcó listo",
  "session.started": "Sesión iniciada",
  "session.paused": "Sesión pausada",
  "session.resumed": "Sesión reanudada",
  "session.closed": "Sesión cerrada",
  "code.checkpoint": "Guardó código",
  "code.run": "Ejecutó",
  "test.result": "Resultado de tests",
  "challenge.switched": "Cambió de reto",
  "challenge.submitted": "Envió su solución",
  "help.requested": "Pidió ayuda",
  "help.given": "Se le dio ayuda",
  "note.added": "Nota del entrevistador",
  "state.changed": "Cambio de estado",
};

function hora(at: number) {
  return new Date(at).toLocaleTimeString("es", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * FR-17: ningún hallazgo se afirma sin poder probarlo. Este componente resuelve
 * los evidenceEventIds contra los eventos reales. Se monta solo al desplegar un
 * hallazgo, así que la query no corre hasta que hace falta.
 */
export function EvidenceList({
  sessionId,
  eventIds,
}: {
  sessionId: Id<"sessions">;
  eventIds: Id<"events">[];
}) {
  const eventos = useQuery(api.reports.evidence, { sessionId, eventIds });

  if (eventos === undefined) {
    return <div className="mt-2 h-16 animate-pulse rounded-md bg-zinc-100" />;
  }

  if (eventos.length === 0) {
    return (
      <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
        Este hallazgo cita evidencia que ya no se puede resolver. Trátalo con
        cautela.
      </p>
    );
  }

  return (
    <ul className="mt-2 flex flex-col gap-2">
      {eventos.map((evento) =>
        evento === null ? null : (
          <li key={evento._id} className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs font-medium">
                {TIPO[evento.type] ?? evento.type}
              </span>
              <span className="text-xs text-zinc-500">{hora(evento.at)}</span>
            </div>
            <pre className="mt-1 max-h-40 overflow-auto font-mono text-xs leading-relaxed text-zinc-700">
              {JSON.stringify(evento.payload, null, 2)}
            </pre>
          </li>
        ),
      )}
    </ul>
  );
}
