"use client";

import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";

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

  return (
    <div className="rounded-md border border-zinc-200 p-4">
      <h3 className="text-sm font-medium">Micrófono</h3>

      {status === "ok" ? (
        <p className="mt-1 text-sm text-green-700">
          Listo. Tu micrófono responde.
        </p>
      ) : status === "error" ? (
        <p className="mt-1 text-sm text-red-700">
          No pudimos usar tu micrófono. {detail}
        </p>
      ) : (
        <p className="mt-1 text-sm text-zinc-500">
          Compruébalo antes de que empiece la entrevista.
        </p>
      )}

      <button
        type="button"
        onClick={probar}
        disabled={status === "testing"}
        className="mt-3 rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 disabled:opacity-50"
      >
        {status === "testing"
          ? "Comprobando…"
          : status === "idle"
            ? "Probar micrófono"
            : "Probar de nuevo"}
      </button>
    </div>
  );
}
