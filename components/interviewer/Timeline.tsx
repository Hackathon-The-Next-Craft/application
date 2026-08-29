"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { EVENT_LABEL } from "./eventLabels";

function hora(at: number) {
  return new Date(at).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
}

/** Línea de tiempo de un candidato — pantalla 8. Reactiva, sin polling. */
export function Timeline({
  sessionId,
  participantId,
}: {
  sessionId: Id<"sessions">;
  participantId: Id<"participants">;
}) {
  const eventos = useQuery(api.events.timeline, { sessionId, participantId, limit: 30 });

  return (
    <div className="flex flex-col gap-1 overflow-auto">
      {eventos === undefined ? (
        <div className="h-24 animate-pulse rounded-lg bg-ink-100" />
      ) : eventos.length === 0 ? (
        <p className="text-body-sm text-ink-500">Sin actividad todavía.</p>
      ) : (
        eventos.map((evento) => (
          <div
            key={evento._id}
            className="flex gap-3 border-b border-ink-100 py-2.5 last:border-b-0"
          >
            <span className="tabular w-10 shrink-0 font-mono text-meta text-ink-500">
              {hora(evento.at)}
            </span>
            <p className="flex-1 text-body-sm text-ink-700">
              {EVENT_LABEL[evento.type] ?? evento.type}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
