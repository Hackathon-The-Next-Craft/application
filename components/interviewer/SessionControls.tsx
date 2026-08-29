"use client";

import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/Button";

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
    return <p className="text-body-sm text-ink-500">La sesión está cerrada.</p>;
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
      <div className="flex items-center gap-3 rounded-lg border border-ink-200 border-l-[3px] border-l-fail bg-white px-4 py-2.5">
        <span className="text-body-sm text-ink-900">
          {enConfirmacion.confirmar?.pregunta}
        </span>
        <Button
          type="button"
          variant="danger"
          disabled={pendiente}
          onClick={() => aplicar(enConfirmacion.destino)}
        >
          {enConfirmacion.confirmar?.boton}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setConfirmando(null)}>
          Cancelar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {acciones.map((accion) => (
        <Button
          key={accion.destino}
          type="button"
          variant={accion.confirmar ? "ghost" : "primary"}
          disabled={pendiente}
          onClick={() =>
            accion.confirmar
              ? setConfirmando(accion.destino)
              : aplicar(accion.destino)
          }
        >
          {accion.label}
        </Button>
      ))}
    </div>
  );
}
