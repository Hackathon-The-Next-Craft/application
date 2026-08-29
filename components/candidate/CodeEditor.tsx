"use client";

import Editor from "@monaco-editor/react";
import { useMutation } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

/** api-contract.md §2: debounce de 400ms. Jamás una mutation por tecla. */
const DEBOUNCE_MS = 400;

type Estado = "guardado" | "escribiendo" | "guardando";

/**
 * Montar este componente con `key={workspaceId}`: al cambiar de reto se
 * remonta, y el efecto de limpieza vuelca lo que quedara pendiente en el
 * workspace correcto. Sin eso, el último tecleo antes de cambiar de pestaña se
 * guardaría en el reto equivocado, o se perdería.
 */
export function CodeEditor({
  joinToken,
  workspaceId,
  codigoInicial,
  language,
  bloqueado,
  onCodigoCambia,
}: {
  joinToken: string;
  workspaceId: Id<"workspaces">;
  codigoInicial: string;
  language: "javascript" | "python";
  bloqueado: boolean;
  onCodigoCambia: (codigo: string) => void;
}) {
  const save = useMutation(api.workspaces.save);
  const [estado, setEstado] = useState<Estado>("guardado");

  const temporizador = useRef<number | null>(null);
  const sinGuardar = useRef<string | null>(null);

  // Refs para que el cleanup no dependa de valores capturados en el render.
  const saveRef = useRef(save);
  saveRef.current = save;

  useEffect(() => {
    return () => {
      if (temporizador.current !== null) window.clearTimeout(temporizador.current);
      if (sinGuardar.current !== null) {
        void saveRef.current({ joinToken, workspaceId, code: sinGuardar.current });
      }
    };
  }, [joinToken, workspaceId]);

  function alCambiar(valor: string | undefined) {
    const codigo = valor ?? "";
    onCodigoCambia(codigo);
    sinGuardar.current = codigo;
    setEstado("escribiendo");

    if (temporizador.current !== null) window.clearTimeout(temporizador.current);
    temporizador.current = window.setTimeout(async () => {
      setEstado("guardando");
      try {
        await save({ joinToken, workspaceId, code: codigo });
        sinGuardar.current = null;
        setEstado("guardado");
      } catch {
        // Se reintenta con el siguiente tecleo; no interrumpimos al candidato.
        setEstado("escribiendo");
      }
    }, DEBOUNCE_MS);
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-zinc-200 px-3 py-2">
        <span className="text-xs font-medium text-zinc-500">{language}</span>
        <span className="text-xs text-zinc-500">
          {bloqueado
            ? "Sesión en pausa: no se guardan cambios"
            : estado === "guardado"
              ? "Guardado"
              : estado === "guardando"
                ? "Guardando…"
                : "Sin guardar"}
        </span>
      </div>
      <Editor
        height="420px"
        defaultLanguage={language}
        defaultValue={codigoInicial}
        onChange={alCambiar}
        options={{
          readOnly: bloqueado,
          minimap: { enabled: false },
          fontSize: 13,
          scrollBeyondLastLine: false,
          tabSize: 2,
        }}
        loading={
          <div className="flex h-full items-center justify-center text-sm text-zinc-500">
            Cargando el editor…
          </div>
        }
      />
    </div>
  );
}
