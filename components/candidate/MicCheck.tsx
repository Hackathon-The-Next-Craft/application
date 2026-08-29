"use client";

import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";

type Status = "idle" | "testing" | "ok" | "error";

export function MicCheck({
  joinToken,
  deviceCheck,
}: {
  joinToken: string;
  deviceCheck: Doc<"participants">["deviceCheck"];
}) {
  const setReady = useMutation(api.participants.setReady);
  // Al recargar, el resultado anterior ya vive en la base.
  const [status, setStatus] = useState<Status>(() =>
    deviceCheck === undefined ? "idle" : deviceCheck.micOk ? "ok" : "error",
  );
  const [detail, setDetail] = useState<string | null>(deviceCheck?.error ?? null);

  async function probar() {
    setStatus("testing");
    setDetail(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Soltar el micrófono en cuanto se comprueba: si no, queda ocupado y el
      // indicador de grabación del navegador se queda encendido en el lobby.
      stream.getTracks().forEach((track) => track.stop());
      await setReady({ joinToken, micOk: true });
      setStatus("ok");
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "No se pudo abrir el micrófono";
      await setReady({ joinToken, micOk: false, error: message });
      setDetail(message);
      setStatus("error");
    }
  }

  // §4: el estado va en el filete izquierdo, no como fondo de todo el bloque.
  const filete =
    status === "ok"
      ? "border-l-advance"
      : status === "error"
        ? "border-l-fail"
        : "border-l-ink-300";

  return (
    <div className={`rounded-lg border border-l-[3px] border-ink-200 bg-white p-4 ${filete}`}>
      <div className="flex items-center gap-3">
        <h3 className="flex-1 text-body-sm font-semibold text-ink-900">Micrófono</h3>
        {status === "ok" && <Chip tone="advance">Listo</Chip>}
        {status === "error" && <Chip tone="fail">No disponible</Chip>}
      </div>

      {status === "ok" ? (
        <p className="mt-1.5 text-body-sm text-advance-text">
          Listo. Tu micrófono responde.
        </p>
      ) : status === "error" ? (
        <p className="mt-1.5 text-body-sm text-fail-text">
          No pudimos usar tu micrófono. {detail}
        </p>
      ) : (
        <p className="mt-1.5 text-body-sm text-ink-500">
          Compruébalo antes de que empiece la entrevista.
        </p>
      )}

      <Button
        type="button"
        variant="ghost"
        onClick={probar}
        disabled={status === "testing"}
        className="mt-3"
      >
        {status === "testing"
          ? "Comprobando…"
          : status === "idle"
            ? "Probar micrófono"
            : "Probar de nuevo"}
      </Button>
    </div>
  );
}
