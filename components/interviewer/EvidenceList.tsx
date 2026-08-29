"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { EVENT_LABEL } from "./eventLabels";

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
    return <div className="mt-2 h-16 animate-pulse rounded-md bg-ink-100" />;
  }

  if (eventos.length === 0) {
    return (
      <p className="mt-2 rounded-md bg-stuck-bg px-3 py-2 text-body-sm text-stuck-text">
        Este hallazgo cita evidencia que ya no se puede resolver. Trátalo con
        cautela.
      </p>
    );
  }

  return (
    <ul className="mt-2 flex flex-col gap-2">
      {eventos.map((evento) =>
        evento === null ? null : (
          <li key={evento._id} className="rounded-md border border-ink-200 bg-ink-25 p-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-meta font-medium">
                {EVENT_LABEL[evento.type] ?? evento.type}
              </span>
              <span className="text-meta text-ink-500">{hora(evento.at)}</span>
            </div>
            <pre className="mt-1 max-h-40 overflow-auto font-mono text-meta leading-relaxed text-ink-700">
              {JSON.stringify(evento.payload, null, 2)}
            </pre>
          </li>
        ),
      )}
    </ul>
  );
}
