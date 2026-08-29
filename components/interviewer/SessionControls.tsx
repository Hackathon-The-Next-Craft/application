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
  draft: [{ label: "Abrir la sala de espera", destino: "ready" }],
  // "Iniciar sesión" sonaba a login. Y ya no es un paso redundante:
  // abrir la sala deja entrar al lobby, esto arranca la prueba.
  ready: [{ label: "Comenzar la prueba", destino: "live" }],
  live: [
    { label: "Pausar", destino: "paused" },
    { label: "Cerrar", destino: "closing", confirmar: CERRAR },
  ],
  paused: [
    { label: "Reanudar", destino: "live" },
    { label: "Cerrar", destino: "closing", confirmar: CERRAR },
  ],
  // Ninguna: el PRD §5.3 pone a "Cerrada" en manos del SISTEMA, no del
  // entrevistador. "Finalizando" dura lo que tardan los reportes, y cuando el
  // último termina la sesión se cierra sola (convex/reports.ts). Pedir una
  // segunda confirmación aquí era pedirle a una persona que hiciera de reloj.
  closing: [],
  closed: [],
};

export function SessionControls({
  sessionId,
  status,
  retosPublicados,
}: {
  sessionId: Id<"sessions">;
  status: Status;
  /**
   * Retos publicados de la sesión. Bloquea "Comenzar la prueba" en 0 — el
   * backend igual lo rechaza (convex/sessions.ts), pero sin esto el botón
   * dejaba entrar a un candidato a una sala sin nada que resolver.
   * `undefined` (todavía cargando) no bloquea, para no parpadear.
   */
  retosPublicados?: number;
}) {
  const setStatus = useMutation(api.sessions.setStatus);
  const [confirmando, setConfirmando] = useState<Destino | null>(null);
  const [pendiente, setPendiente] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acciones = ACCIONES[status];
  if (acciones.length === 0) {
    return (
      <p className="text-body-sm text-ink-500">
        {status === "closing"
          ? "Finalizando: generando los reportes. La sesión se cerrará sola."
          : "La sesión está cerrada."}
      </p>
    );
  }

  async function aplicar(destino: Destino) {
    setPendiente(true);
    setError(null);
    try {
      await setStatus({ sessionId, status: destino });
      setConfirmando(null);
    } catch (caught) {
      // setStatus valida el ciclo de vida (api-contract.md). Si otra pestaña
      // ya cambió el estado, este panel está desactualizado y hay que decirlo.
      setError(
        caught instanceof Error
          ? caught.message
          : "No se pudo cambiar el estado de la sesión.",
      );
    } finally {
      setPendiente(false);
    }
  }

  const enConfirmacion = acciones.find((a) => a.destino === confirmando);
  const bloqueaComenzar =
    status === "ready" && retosPublicados !== undefined && retosPublicados === 0;

  return (
    <>
    {/* Modal y no un aviso en línea: cerrar corta la sesión para todos y no
        tiene vuelta atrás. Merece detener lo que estabas haciendo, y sobre
        todo no aparecer justo donde acabas de hacer clic. */}
    {enConfirmacion && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-6"
        onClick={() => setConfirmando(null)}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirmar-titulo"
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[420px] rounded-2xl border border-ink-200 bg-white p-6 shadow-lg"
        >
          <h2
            id="confirmar-titulo"
            className="font-display text-subtitle text-ink-900"
          >
            {enConfirmacion.confirmar?.pregunta}
          </h2>
          <p className="mt-2 text-body-sm text-ink-500">
            Los candidatos perderán el acceso y se generarán los reportes. No se
            puede deshacer.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmando(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={pendiente}
              onClick={() => aplicar(enConfirmacion.destino)}
            >
              {enConfirmacion.confirmar?.boton}
            </Button>
          </div>
        </div>
      </div>
    )}

    <div className="flex flex-wrap items-center gap-2">
      {error && (
        <p role="alert" className="rounded-md border border-fail-bg bg-fail-bg px-3 py-1.5 text-body-sm text-fail-text">
          {error}
        </p>
      )}
      {acciones.map((accion) => {
        const bloqueada = accion.destino === "live" && bloqueaComenzar;
        return (
          <Button
            key={accion.destino}
            type="button"
            variant={accion.confirmar ? "ghost" : "primary"}
            disabled={pendiente || bloqueada}
            title={
              bloqueada
                ? "Publica al menos un reto para poder comenzar la prueba"
                : undefined
            }
            onClick={() =>
              accion.confirmar
                ? setConfirmando(accion.destino)
                : aplicar(accion.destino)
            }
          >
            {accion.label}
          </Button>
        );
      })}
    </div>
    </>
  );
}
