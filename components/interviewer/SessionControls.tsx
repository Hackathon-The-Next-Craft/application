"use client";

import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";

type Status = Doc<"sessions">["status"];
// setStatus no acepta "draft": una sesión no vuelve a borrador.
type Destino = Exclude<Status, "draft">;

type Accion = {
  label: string;
  destino: Destino;
  confirmar?: { pregunta: string; boton: string };
};

const CERRAR = {
  pregunta: "Cerrar corta la sesión para todos los candidatos. ¿Seguro?",
  boton: "Sí, cerrar",
};

const ACCIONES: Record<Status, Accion[]> = {
  draft: [{ label: "Habilitar el link", destino: "ready" }],
  ready: [{ label: "Iniciar sesión", destino: "live" }],
  live: [
    { label: "Pausar", destino: "paused" },
    { label: "Cerrar", destino: "closing", confirmar: CERRAR },
  ],
  paused: [
    { label: "Reanudar", destino: "live" },
    { label: "Cerrar", destino: "closing", confirmar: CERRAR },
  ],
  // También pide confirmación, y no por simetría: al aplicar "Cerrar" el
  // estado pasa a "closing" y este botón se dibuja donde acaba de estar el de
  // confirmar. Sin esta segunda pregunta, un doble clic cierra la sesión de
  // corrido y no hay vuelta atrás.
  closing: [
    {
      label: "Marcar como cerrada",
      destino: "closed",
      confirmar: {
        pregunta: "La sesión quedará cerrada definitivamente. ¿Seguro?",
        boton: "Sí, cerrarla",
      },
    },
  ],
  closed: [],
};

export function SessionControls({
  sessionId,
  status,
}: {
  sessionId: Id<"sessions">;
  status: Status;
}) {
  const setStatus = useMutation(api.sessions.setStatus);
  const [confirmando, setConfirmando] = useState<Destino | null>(null);
  const [pendiente, setPendiente] = useState(false);

  const acciones = ACCIONES[status];
  if (acciones.length === 0) {
    return <p className="text-sm text-zinc-500">La sesión está cerrada.</p>;
  }

  async function aplicar(destino: Destino) {
    setPendiente(true);
    try {
      await setStatus({ sessionId, status: destino });
      setConfirmando(null);
    } finally {
      setPendiente(false);
    }
  }

  const enConfirmacion = acciones.find((a) => a.destino === confirmando);
  if (enConfirmacion) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-700">
          {enConfirmacion.confirmar?.pregunta}
        </span>
        <button
          type="button"
          disabled={pendiente}
          onClick={() => aplicar(enConfirmacion.destino)}
          className="rounded-md bg-red-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-50"
        >
          {enConfirmacion.confirmar?.boton}
        </button>
        <button
          type="button"
          onClick={() => setConfirmando(null)}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {acciones.map((accion) => (
        <button
          key={accion.destino}
          type="button"
          disabled={pendiente}
          onClick={() =>
            accion.confirmar
              ? setConfirmando(accion.destino)
              : aplicar(accion.destino)
          }
          className={
            accion.confirmar
              ? "rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 disabled:opacity-50"
              : "rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
          }
        >
          {accion.label}
        </button>
      ))}
    </div>
  );
}
