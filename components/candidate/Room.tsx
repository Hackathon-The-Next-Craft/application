"use client";

import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Markdown } from "@/components/ui/Markdown";
import { CodeEditor } from "./CodeEditor";
import { RunPanel } from "./RunPanel";
import { CameraPublisher } from "@/components/candidate/CameraPublisher";

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
    return <div className="h-96 animate-pulse rounded-2xl border border-ink-200 bg-white" />;
  }
  if (datos === null) {
    return <p className="text-body-sm text-ink-500">La sesión no está en curso. Volviendo…</p>;
  }
  if (retos.length === 0) {
    return (
      <div className="rounded-2xl border border-ink-200 bg-white p-6">
        <h1 className="font-medium">Todavía no hay retos publicados</h1>
        <p className="mt-2 text-body-sm text-ink-500">
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
        <p className="rounded-md bg-stuck-bg px-4 py-3 text-body-sm text-stuck-text">
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
              className={`rounded-md px-3 py-1.5 text-body-sm font-medium ${
                r._id === reto._id
                  ? "bg-iris-600 text-white"
                  : "border border-ink-200 hover:bg-iris-50"
              }`}
            >
              {r.title}
            </button>
          ))}
        </nav>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
        {/* Publica su cámara si la aceptó, y le muestra su propia imagen.
            El micrófono no es suyo — ese lo lleva Vapi. */}
        <CameraPublisher joinToken={joinToken} />
        <section className="rounded-2xl border border-ink-200 bg-white p-5">
          <h1 className="font-display text-subtitle text-ink-900">{reto.title}</h1>
          <p className="mt-1 text-meta text-ink-500">
            {reto.timeLimitMinutes} minutos sugeridos
          </p>
          <div className="mt-4">
            <Markdown>{reto.statement}</Markdown>
          </div>

          {reto.tests.length > 0 && (
            <div className="mt-5 border-t border-ink-200 pt-4">
              <h2 className="text-body-sm font-medium">Tests visibles</h2>
              <ul className="mt-2 flex flex-col gap-1 text-meta text-ink-500">
                {reto.tests.map((t) => (
                  <li key={t.name} className="font-mono">
                    {t.name}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-meta text-ink-500">
                Hay tests adicionales que no se muestran.
              </p>
            </div>
          )}
        </section>
        </div>

        <section className="flex flex-col rounded-2xl border border-ink-200 bg-white">
          {workspace === null ? (
            <div className="flex h-96 items-center justify-center text-body-sm text-ink-500">
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
