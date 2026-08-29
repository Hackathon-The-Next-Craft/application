"use client";

import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";

type Valor = "advance" | "hold" | "reject";

const OPCIONES: { valor: Valor; label: string }[] = [
  { valor: "advance", label: "Avanza" },
  { valor: "hold", label: "En espera" },
  { valor: "reject", label: "No avanza" },
];

const ETIQUETA: Record<Valor, string> = {
  advance: "Avanza",
  hold: "En espera",
  reject: "No avanza",
};

/** FR-18 / PRD §11.3: la decisión es humana y queda auditada. La IA no decide. */
export function DecisionPanel({
  sessionId,
  reportId,
  decision,
}: {
  sessionId: Id<"sessions">;
  reportId: Id<"reports">;
  decision: Doc<"reports">["decision"];
}) {
  const setDecision = useMutation(api.reports.setDecision);
  const [elegida, setElegida] = useState<Valor | null>(decision?.value ?? null);
  const [comentario, setComentario] = useState(decision?.comment ?? "");
  const [guardando, setGuardando] = useState(false);

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5">
      <h2 className="font-medium">Tu decisión</h2>
      <p className="mt-1 text-sm text-zinc-500">
        La decides tú, no la IA. Queda registrada con tu nombre y la hora.
      </p>

      {decision && (
        <p className="mt-3 rounded-md bg-zinc-100 px-3 py-2 text-sm">
          Registrada: <strong>{ETIQUETA[decision.value]}</strong> ·{" "}
          {new Date(decision.at).toLocaleString("es")}
          {decision.comment ? ` · "${decision.comment}"` : ""}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {OPCIONES.map((opcion) => (
          <button
            key={opcion.valor}
            type="button"
            onClick={() => setElegida(opcion.valor)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              elegida === opcion.valor
                ? "bg-zinc-900 text-white"
                : "border border-zinc-300 hover:bg-zinc-100"
            }`}
          >
            {opcion.label}
          </button>
        ))}
      </div>

      <textarea
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        rows={2}
        placeholder="Por qué (opcional)"
        className="mt-3 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
      />

      <button
        type="button"
        disabled={elegida === null || guardando}
        onClick={async () => {
          if (elegida === null) return;
          setGuardando(true);
          try {
            await setDecision({
              sessionId,
              reportId,
              value: elegida,
              comment: comentario.trim() === "" ? undefined : comentario.trim(),
            });
          } finally {
            setGuardando(false);
          }
        }}
        className="mt-3 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
      >
        {guardando ? "Guardando…" : decision ? "Actualizar decisión" : "Registrar decisión"}
      </button>
    </section>
  );
}
