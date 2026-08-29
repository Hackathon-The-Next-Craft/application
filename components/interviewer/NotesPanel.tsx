"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/Button";

function hora(at: number) {
  return new Date(at).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
}

/**
 * FR-14/FR-15. El candidato nunca ve esto: no existe ninguna función de
 * candidato que lea `notes`, y "ayuda brindada" solo queda como evento del
 * timeline/reporte, nunca visible en su sala.
 */
export function NotesPanel({
  sessionId,
  participantId,
}: {
  sessionId: Id<"sessions">;
  participantId: Id<"participants">;
}) {
  const notas = useQuery(api.notes.listForParticipant, { sessionId, participantId });
  const addNote = useMutation(api.notes.add);
  const logHelp = useMutation(api.notes.logHelpGiven);

  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState<"nota" | "ayuda" | null>(null);

  async function guardar() {
    if (!texto.trim()) return;
    setEnviando("nota");
    try {
      await addNote({ sessionId, participantId, text: texto.trim() });
      setTexto("");
    } finally {
      setEnviando(null);
    }
  }

  async function marcarAyuda() {
    setEnviando("ayuda");
    try {
      await logHelp({
        sessionId,
        participantId,
        description: texto.trim() || "Ayuda brindada",
      });
      setTexto("");
    } finally {
      setEnviando(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Qué le dijiste, qué preguntó, qué le costó…"
        rows={4}
        className="w-full resize-none rounded-md border border-ink-200 bg-white p-3 text-body-sm text-ink-900 placeholder:text-ink-400 focus:border-iris-600 focus:outline-none"
      />
      <div className="flex gap-2">
        <Button
          type="button"
          variant="ghost"
          className="flex-1"
          disabled={enviando !== null}
          onClick={marcarAyuda}
        >
          Marcar ayuda brindada
        </Button>
        <Button
          type="button"
          disabled={enviando !== null || !texto.trim()}
          onClick={guardar}
        >
          Guardar
        </Button>
      </div>
      <p className="text-caption text-ink-400">
        Las notas y las ayudas quedan en el informe. El candidato no las ve.
      </p>

      <div className="mt-1 flex flex-col gap-2">
        {notas === undefined ? (
          <div className="h-16 animate-pulse rounded-lg bg-ink-100" />
        ) : (
          notas
            .slice()
            .sort((a, b) => b.anchorAt - a.anchorAt)
            .map((nota) => (
              <div key={nota._id} className="rounded-md border border-ink-200 bg-white p-3">
                <p className="text-body-sm text-ink-900">{nota.text}</p>
                <p className="tabular mt-1 font-mono text-meta text-ink-400">
                  {hora(nota.anchorAt)}
                </p>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
