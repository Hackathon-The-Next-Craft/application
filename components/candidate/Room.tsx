"use client";

import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { CodeEditor } from "./CodeEditor";
import { RunPanel } from "./RunPanel";

export function Room({ code, joinToken }: { code: string; joinToken: string }) {
  const datos = useQuery(api.workspaces.mine, { joinToken });
  const ensure = useMutation(api.workspaces.ensure);
  const router = useRouter();

  const [retoActivo, setRetoActivo] = useState<Id<"challenges"> | null>(null);
  const [codigo, setCodigo] = useState("");
  // Evita disparar `ensure` en bucle mientras el query todavía no refleja el alta.
  const yaPedidos = useRef(new Set<string>());

  // `mine` devuelve null si la sesión no está en curso: de vuelta al lobby.
  useEffect(() => {
    if (datos === null) router.replace(`/join/${code}`);
  }, [datos, code, router]);

  const retos = datos?.challenges ?? [];
  const seleccionado = retoActivo ?? retos[0]?._id ?? null;

  useEffect(() => {
    if (!datos || seleccionado === null) return;
    if (datos.workspaces.some((w) => w.challengeId === seleccionado)) return;
    if (yaPedidos.current.has(seleccionado)) return;
    yaPedidos.current.add(seleccionado);
    void ensure({ joinToken, challengeId: seleccionado });
  }, [datos, seleccionado, ensure, joinToken]);

  if (datos === undefined) {
    return <div className="h-96 animate-pulse rounded-lg border border-zinc-200 bg-white" />;
  }
  if (datos === null) {
    return <p className="text-sm text-zinc-500">La sesión no está en curso. Volviendo…</p>;
  }
  if (retos.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-6">
        <h1 className="font-medium">Todavía no hay retos publicados</h1>
        <p className="mt-2 text-sm text-zinc-500">
          El entrevistador los publica desde su panel. Esta pantalla se actualiza
          sola en cuanto aparezcan.
        </p>
      </div>
    );
  }

  const reto = retos.find((r) => r._id === seleccionado) ?? retos[0];
  const workspace = datos.workspaces.find((w) => w.challengeId === reto._id) ?? null;

  return (
    <div className="flex flex-col gap-4">
      {datos.paused && (
        <p className="rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-900">
          El entrevistador puso la sesión en pausa. Tus cambios no se guardan
          hasta que la reanude.
        </p>
      )}

      {retos.length > 1 && (
        <nav className="flex flex-wrap gap-2">
          {retos.map((r) => (
            <button
              key={r._id}
              type="button"
              onClick={() => setRetoActivo(r._id)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                r._id === reto._id
                  ? "bg-zinc-900 text-white"
                  : "border border-zinc-300 hover:bg-zinc-100"
              }`}
            >
              {r.title}
            </button>
          ))}
        </nav>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <section className="rounded-lg border border-zinc-200 bg-white p-5">
          <h1 className="text-lg font-semibold tracking-tight">{reto.title}</h1>
          <p className="mt-1 text-xs text-zinc-500">
            {reto.timeLimitMinutes} minutos sugeridos
          </p>
          {/* El enunciado viene en markdown; se muestra tal cual, sin librería. */}
          <pre className="mt-4 whitespace-pre-wrap font-sans text-sm leading-relaxed text-zinc-800">
            {reto.statement}
          </pre>

          {reto.tests.length > 0 && (
            <div className="mt-5 border-t border-zinc-200 pt-4">
              <h2 className="text-sm font-medium">Tests visibles</h2>
              <ul className="mt-2 flex flex-col gap-1 text-xs text-zinc-600">
                {reto.tests.map((t) => (
                  <li key={t.name} className="font-mono">
                    {t.name}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-zinc-500">
                Hay tests adicionales que no se muestran.
              </p>
            </div>
          )}
        </section>

        <section className="flex flex-col rounded-lg border border-zinc-200 bg-white">
          {workspace === null ? (
            <div className="flex h-96 items-center justify-center text-sm text-zinc-500">
              Preparando tu espacio de trabajo…
            </div>
          ) : (
            <>
              <CodeEditor
                // Remonta al cambiar de reto: el cleanup vuelca lo pendiente
                // en el workspace correcto.
                key={workspace._id}
                joinToken={joinToken}
                workspaceId={workspace._id}
                codigoInicial={workspace.code}
                language={reto.language}
                bloqueado={datos.paused}
                onCodigoCambia={setCodigo}
              />
              <RunPanel
                joinToken={joinToken}
                workspaceId={workspace._id}
                language={reto.language}
                codigo={codigo || workspace.code}
                entryPoint={reto.entryPoint}
                tests={reto.tests}
                yaEnviado={workspace.submittedAt !== undefined}
                bloqueado={datos.paused}
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
