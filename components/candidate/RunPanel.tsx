"use client";

import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ejecutarEnElNavegador } from "@/lib/runner";
import type { CasoDePrueba, ResultadoDeEjecucion } from "@/lib/runner/types";

export function RunPanel({
  joinToken,
  workspaceId,
  language,
  codigo,
  starterCode,
  tests,
  yaEnviado,
  bloqueado,
}: {
  joinToken: string;
  workspaceId: Id<"workspaces">;
  language: "javascript" | "python";
  codigo: string;
  starterCode: string;
  tests: CasoDePrueba[];
  yaEnviado: boolean;
  bloqueado: boolean;
}) {
  const recordRun = useMutation(api.workspaces.recordRun);
  const submit = useMutation(api.workspaces.submit);
  const requestHelp = useMutation(api.participants.requestHelp);

  const [resultado, setResultado] = useState<ResultadoDeEjecucion | null>(null);
  const [ejecutando, setEjecutando] = useState(false);
  const [ayudaPedida, setAyudaPedida] = useState(false);
  const [confirmandoEnvio, setConfirmandoEnvio] = useState(false);

  async function ejecutar() {
    setEjecutando(true);
    try {
      // Corre en el navegador; Convex solo guarda la evidencia del resultado.
      const salida = await ejecutarEnElNavegador({
        language,
        code: codigo,
        starterCode,
        tests,
      });
      setResultado(salida);
      await recordRun({ joinToken, workspaceId, ...salida });
    } finally {
      setEjecutando(false);
    }
  }

  return (
    <section className="flex flex-col gap-3 border-t border-ink-200 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={ejecutar}
          disabled={ejecutando || bloqueado}
          className="rounded-md bg-iris-600 px-4 py-2 text-body-sm font-medium text-white hover:bg-iris-700 disabled:opacity-50"
        >
          {ejecutando ? "Ejecutando…" : "Ejecutar"}
        </button>

        {yaEnviado ? (
          <span className="text-body-sm text-done-text">Ya enviaste este reto.</span>
        ) : confirmandoEnvio ? (
          <span className="flex items-center gap-2 text-body-sm">
            ¿Enviar y dar el reto por terminado?
            <button
              type="button"
              onClick={async () => {
                await submit({ joinToken, workspaceId });
                setConfirmandoEnvio(false);
              }}
              className="rounded-md bg-iris-600 px-3 py-1.5 text-body-sm font-medium text-white hover:bg-iris-700"
            >
              Sí, enviar
            </button>
            <button
              type="button"
              onClick={() => setConfirmandoEnvio(false)}
              className="rounded-md border border-ink-200 px-3 py-1.5 text-body-sm font-medium hover:bg-iris-50"
            >
              Cancelar
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmandoEnvio(true)}
            disabled={bloqueado}
            className="rounded-md border border-ink-200 px-4 py-2 text-body-sm font-medium hover:bg-iris-50 disabled:opacity-50"
          >
            Enviar
          </button>
        )}

        <button
          type="button"
          onClick={async () => {
            await requestHelp({ joinToken });
            setAyudaPedida(true);
          }}
          className="ml-auto rounded-md border border-stuck bg-stuck-bg px-4 py-2 text-body-sm font-medium text-stuck-text hover:bg-stuck-bg"
        >
          {ayudaPedida ? "Ayuda pedida ✓" : "Pedir ayuda"}
        </button>
      </div>

      {resultado && (
        <div className="rounded-md border border-ink-200 bg-ink-25 p-3">
          <p className="text-body-sm font-medium">
            {resultado.total > 0
              ? `${resultado.passed}/${resultado.total} tests · ${resultado.durationMs} ms`
              : `Sin tests visibles · ${resultado.durationMs} ms`}
          </p>
          {resultado.stdout && (
            <pre className="mt-2 max-h-48 overflow-auto font-mono text-meta leading-relaxed text-ink-800">
              {resultado.stdout}
            </pre>
          )}
          {resultado.stderr && (
            <pre className="mt-2 max-h-48 overflow-auto rounded-md bg-fail-bg p-2 font-mono text-meta leading-relaxed text-fail-text">
              {resultado.stderr}
            </pre>
          )}
        </div>
      )}
    </section>
  );
}
