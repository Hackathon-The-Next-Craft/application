"use client";

import Link from "next/link";
import { use, useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { DecisionPanel } from "@/components/interviewer/DecisionPanel";
import { EvidenceList } from "@/components/interviewer/EvidenceList";

const ESTADO: Record<Doc<"reports">["status"], string> = {
  pending: "En cola",
  generating: "Generando…",
  done: "Listo",
  failed: "Falló",
};

const VEREDICTO: Record<"met" | "partial" | "not_observed", { label: string; clase: string }> = {
  met: { label: "Cumple", clase: "bg-advance-bg text-advance-text" },
  partial: { label: "Parcial", clase: "bg-stuck-bg text-stuck-text" },
  not_observed: { label: "No observado", clase: "bg-ink-100 text-ink-700" },
};

const CONFIANZA: Record<"low" | "medium" | "high", string> = {
  low: "confianza baja",
  medium: "confianza media",
  high: "confianza alta",
};

export default function ReportPage({
  params,
}: PageProps<"/s/[sessionId]/report/[participantId]">) {
  const { sessionId: rawSession, participantId: rawParticipant } = use(params);
  const sessionId = rawSession as Id<"sessions">;
  const participantId = rawParticipant as Id<"participants">;

  const report = useQuery(api.reports.forParticipant, { sessionId, participantId });
  const generate = useAction(api.reports.generate);
  const [generando, setGenerando] = useState(false);
  const [abierto, setAbierto] = useState<number | null>(null);

  async function generar() {
    setGenerando(true);
    try {
      await generate({ sessionId, participantId });
    } finally {
      setGenerando(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 p-6">
      <Link
        href={`/s/${sessionId}/live`}
        className="text-body-sm text-ink-500 underline underline-offset-4 hover:text-iris-600"
      >
        ← Volver a la sesión
      </Link>

      <h1 className="mt-4 font-display text-title text-ink-900">
        Reporte del candidato
      </h1>

      {report === undefined ? (
        <div className="mt-6 h-48 animate-pulse rounded-2xl border border-ink-200 bg-white" />
      ) : report === null ? (
        <div className="mt-6 rounded-2xl border border-ink-200 bg-white p-6">
          <p className="text-body-sm text-ink-500">
            Todavía no hay reporte para este candidato.
          </p>
          <button
            type="button"
            onClick={generar}
            disabled={generando}
            className="mt-4 rounded-md bg-iris-600 px-4 py-2 text-body-sm font-medium text-white hover:bg-iris-700 disabled:opacity-50"
          >
            {generando ? "Generando…" : "Generar reporte"}
          </button>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-6">
          <section className="rounded-2xl border border-ink-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span
                className={`rounded-full px-2.5 py-1 text-meta font-medium ${
                  report.status === "done"
                    ? "bg-advance-bg text-advance-text"
                    : report.status === "failed"
                      ? "bg-fail-bg text-fail-text"
                      : "bg-explore-bg text-explore-text"
                }`}
              >
                {ESTADO[report.status]}
              </span>
              {report.status !== "generating" && (
                <button
                  type="button"
                  onClick={generar}
                  disabled={generando}
                  className="rounded-md border border-ink-200 px-3 py-1.5 text-body-sm font-medium hover:bg-iris-50 disabled:opacity-50"
                >
                  {generando ? "Generando…" : "Regenerar"}
                </button>
              )}
            </div>

            {/* La IA escribe por partes; el useQuery lo va mostrando solo. */}
            {report.summary ? (
              <p className="mt-4 text-body-sm leading-relaxed">{report.summary}</p>
            ) : (
              <p className="mt-4 text-body-sm text-ink-500">
                {report.status === "generating"
                  ? "El análisis se está escribiendo. Aparece aquí conforme llega."
                  : "Sin resumen."}
              </p>
            )}
          </section>

          {report.criteriaResults && report.criteriaResults.length > 0 && (
            <section className="rounded-2xl border border-ink-200 bg-white p-5">
              <h2 className="font-medium">Criterios</h2>
              <ul className="mt-3 flex flex-col gap-3">
                {report.criteriaResults.map((criterio, i) => (
                  <li key={i}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-body-sm font-medium">{criterio.criterion}</span>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-meta font-medium ${VEREDICTO[criterio.verdict].clase}`}
                      >
                        {VEREDICTO[criterio.verdict].label}
                      </span>
                    </div>
                    <p className="mt-1 text-body-sm text-ink-500">{criterio.rationale}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {report.findings && report.findings.length > 0 && (
            <section className="rounded-2xl border border-ink-200 bg-white p-5">
              <h2 className="font-medium">Hallazgos</h2>
              <p className="mt-1 text-body-sm text-ink-500">
                Cada hallazgo enlaza los eventos que lo sostienen. Ábrelo para
                ver la evidencia real.
              </p>
              <ul className="mt-3 flex flex-col gap-3">
                {report.findings.map((hallazgo, i) => (
                  <li key={i} className="rounded-md border border-ink-200 p-3">
                    <p className="text-body-sm">{hallazgo.text}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <span
                        className={`text-meta ${
                          hallazgo.confidence === "low"
                            ? "text-stuck-text"
                            : "text-ink-500"
                        }`}
                      >
                        {CONFIANZA[hallazgo.confidence]}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAbierto(abierto === i ? null : i)}
                        className="text-meta underline underline-offset-4 hover:text-iris-600"
                      >
                        {abierto === i
                          ? "Ocultar evidencia"
                          : `Ver evidencia (${hallazgo.evidenceEventIds.length})`}
                      </button>
                    </div>
                    {abierto === i && (
                      <EvidenceList
                        sessionId={sessionId}
                        eventIds={hallazgo.evidenceEventIds}
                      />
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {report.followUpQuestions && report.followUpQuestions.length > 0 && (
            <section className="rounded-2xl border border-ink-200 bg-white p-5">
              <h2 className="font-medium">Preguntas de seguimiento</h2>
              <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-body-sm">
                {report.followUpQuestions.map((pregunta, i) => (
                  <li key={i}>{pregunta}</li>
                ))}
              </ul>
            </section>
          )}

          {report.limitations && (
            <section className="rounded-2xl border border-stuck bg-stuck-bg p-5">
              <h2 className="font-medium text-stuck-text">Límites de este análisis</h2>
              <p className="mt-2 text-body-sm text-stuck-text">{report.limitations}</p>
            </section>
          )}

          <DecisionPanel
            sessionId={sessionId}
            reportId={report._id}
            decision={report.decision}
          />
        </div>
      )}
    </main>
  );
}
