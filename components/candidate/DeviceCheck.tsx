"use client";

import { useMutation } from "convex/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";

type Estado = "idle" | "pidiendo" | "probando" | "listo" | "error";

/**
 * Prueba de cámara y micrófono antes de entrar.
 *
 * Un botón que dice "listo" no prueba nada: el candidato descubre que estaba
 * en silencio o con la cámara tapada cuando ya empezó la entrevista. Aquí se
 * ve a sí mismo y ve su propia voz moverse, que es la única comprobación que
 * de verdad convence.
 *
 * Los dos permisos se piden juntos, en una sola llamada, para que el navegador
 * muestre un único diálogo en vez de dos seguidos.
 */
export function DeviceCheck({
  joinToken,
  deviceCheck,
}: {
  joinToken: string;
  deviceCheck: Doc<"participants">["deviceCheck"];
}) {
  const setReady = useMutation(api.participants.setReady);

  const [estado, setEstado] = useState<Estado>(() =>
    deviceCheck?.micOk && deviceCheck?.cameraOk ? "listo" : "idle",
  );
  const [detalle, setDetalle] = useState<string | null>(deviceCheck?.error ?? null);
  const [oyoAlgo, setOyoAlgo] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const barraRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);

  const soltar = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    void audioCtxRef.current?.close();
    audioCtxRef.current = null;
  }, []);

  // Soltar los dispositivos al desmontar: si no, el indicador de grabación del
  // navegador se queda encendido durante toda la espera.
  useEffect(() => soltar, [soltar]);

  async function probar() {
    setEstado("pidiendo");
    setDetalle(null);
    setOyoAlgo(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;

      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const datos = new Uint8Array(analyser.frequencyBinCount);

      // El nivel se escribe directo en el DOM, no en estado: son 60 medidas
      // por segundo y re-renderizar en cada una no tendría ningún sentido.
      const medir = () => {
        analyser.getByteTimeDomainData(datos);
        let suma = 0;
        for (const v of datos) {
          const d = (v - 128) / 128;
          suma += d * d;
        }
        const rms = Math.sqrt(suma / datos.length);
        const pct = Math.min(100, Math.round(rms * 320));
        if (barraRef.current) barraRef.current.style.width = `${pct}%`;
        if (pct > 12) setOyoAlgo(true);
        rafRef.current = requestAnimationFrame(medir);
      };
      medir();

      setEstado("probando");
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "No se pudo abrir la cámara o el micrófono";
      soltar();
      await setReady({ joinToken, micOk: false, cameraOk: false, error: message });
      setDetalle(message);
      setEstado("error");
    }
  }

  async function confirmar() {
    soltar();
    await setReady({ joinToken, micOk: true, cameraOk: true });
    setEstado("listo");
  }

  const filete =
    estado === "listo"
      ? "border-l-advance"
      : estado === "error"
        ? "border-l-fail"
        : "border-l-ink-300";

  return (
    <div className={`rounded-lg border border-l-[3px] border-ink-200 bg-white p-4 ${filete}`}>
      <div className="flex items-center gap-3">
        <h3 className="flex-1 text-body-sm font-semibold text-ink-900">
          Cámara y micrófono
        </h3>
        {estado === "listo" && <Chip tone="advance">Listo</Chip>}
        {estado === "error" && <Chip tone="fail">No disponible</Chip>}
      </div>

      {estado === "idle" && (
        <p className="mt-1.5 text-body-sm text-ink-500">
          Los dos son necesarios para la entrevista. Compruébalos antes de empezar.
        </p>
      )}

      {estado === "error" && (
        <p className="mt-1.5 text-body-sm text-fail-text">
          No pudimos usarlos. {detalle} Revisa los permisos del navegador y vuelve
          a intentarlo.
        </p>
      )}

      {estado === "listo" && (
        <p className="mt-1.5 text-body-sm text-advance-text">
          Todo responde. Ya puedes esperar a que empiece.
        </p>
      )}

      {/* El vídeo se mantiene montado mientras se prueba: si se desmontara,
          la referencia se perdería y el stream se quedaría sin destino. */}
      {estado === "probando" && (
        <div className="mt-3 flex flex-col gap-3">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="aspect-video w-full -scale-x-100 rounded-lg bg-ink-900 object-cover"
          />

          <div>
            {/* El texto es la señal accesible; la barra es su versión visual.
                Un medidor que cambia 60 veces por segundo solo sería ruido
                para un lector de pantalla. */}
            <p role="status" className="text-meta text-ink-500">
              {oyoAlgo ? "Te estamos oyendo." : "Di algo para probar el micrófono."}
            </p>
            <div
              aria-hidden
              className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-ink-100"
            >
              <div
                ref={barraRef}
                className={`h-full w-0 rounded-full transition-[width] duration-75 ${
                  oyoAlgo ? "bg-advance" : "bg-ink-300"
                }`}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" onClick={confirmar} disabled={!oyoAlgo}>
              Me veo y se me oye
            </Button>
            {!oyoAlgo && (
              <span className="text-meta text-ink-500">
                Habla un momento para poder continuar.
              </span>
            )}
          </div>
        </div>
      )}

      {estado !== "probando" && (
        <Button
          type="button"
          variant="ghost"
          onClick={probar}
          disabled={estado === "pidiendo"}
          className="mt-3"
        >
          {estado === "pidiendo"
            ? "Pidiendo permiso…"
            : estado === "idle"
              ? "Probar cámara y micrófono"
              : "Probar de nuevo"}
        </Button>
      )}
    </div>
  );
}
