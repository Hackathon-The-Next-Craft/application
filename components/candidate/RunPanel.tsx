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
    <section className="flex flex-col gap-3 border-t border-zinc-200 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={ejecutar}
          disabled={ejecutando || bloqueado}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          {ejecutando ? "Ejecutando…" : "Ejecutar"}
        </button>

        {yaEnviado ? (
          <span className="text-sm text-purple-800">Ya enviaste este reto.</span>
        ) : confirmandoEnvio ? (
          <span className="flex items-center gap-2 text-sm">
            ¿Enviar y dar el reto por terminado?
            <button
              type="button"
              onClick={async () => {
                await submit({ joinToken, workspaceId });
                setConfirmandoEnvio(false);
              }}
              className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700"
            >
              Sí, enviar
            </button>
            <button
              type="button"
              onClick={() => setConfirmandoEnvio(false)}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100"
            >
              Cancelar
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmandoEnvio(true)}
            disabled={bloqueado}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 disabled:opacity-50"
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
          className="ml-auto rounded-md border border-amber-400 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100"
        >
          {ayudaPedida ? "Ayuda pedida ✓" : "Pedir ayuda"}
        </button>
      </div>

      {resultado && (
        <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
          <p className="text-sm font-medium">
            {resultado.total > 0
              ? `${resultado.passed}/${resultado.total} tests · ${resultado.durationMs} ms`
              : `Sin tests visibles · ${resultado.durationMs} ms`}
          </p>
          {resultado.stdout && (
            <pre className="mt-2 max-h-48 overflow-auto font-mono text-xs leading-relaxed text-zinc-800">
              {resultado.stdout}
            </pre>
          )}
          {resultado.stderr && (
            <pre className="mt-2 max-h-48 overflow-auto rounded-md bg-red-50 p-2 font-mono text-xs leading-relaxed text-red-800">
              {resultado.stderr}
            </pre>
          )}
        </div>
      )}
    </section>
  );
}
