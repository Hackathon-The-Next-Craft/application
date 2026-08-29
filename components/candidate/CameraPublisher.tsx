"use client";

import { useAction } from "convex/react";
import {
  LiveKitRoom,
  VideoTrack,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { useEffect, useState } from "react";
import { api } from "@/convex/_generated/api";

/**
 * Publica la cámara del candidato. Nada más.
 *
 * `audio={false}` no es un detalle de estilo: el micrófono es de Vapi. Si esto
 * publicara audio, los dos SDKs capturarían el micro a la vez y habría eco.
 * El servidor además solo firma tokens con permiso de cámara, así que aunque
 * alguien cambie esta línea, LiveKit rechaza el audio.
 *
 * Muestra su propia imagen. No es cosmético: si el candidato no se ve, no
 * tiene forma de saber si la cámara quedó tapada, apagada o apuntando al
 * techo, y se entera cuando ya no importa. Es lo mismo que hace cualquier
 * videollamada antes de entrar.
 *
 * A los demás candidatos no los ve nunca: su token no permite suscribirse.
 */
export function CameraPublisher({ joinToken }: { joinToken: string }) {
  const pedirToken = useAction(api.media.candidateToken);
  const [cred, setCred] = useState<{ token: string; url: string } | null>(null);
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    let vigente = true;
    pedirToken({ joinToken })
      .then((r) => vigente && setCred({ token: r.token, url: r.url }))
      .catch(() => vigente && setFallo(true));
    return () => {
      vigente = false;
    };
  }, [joinToken, pedirToken]);

  // La cámara nunca bloquea la entrevista: si no hay consentimiento o LiveKit
  // no está configurado, el candidato sigue trabajando igual.
  if (fallo || !cred) return null;

  return (
    <LiveKitRoom
      token={cred.token}
      serverUrl={cred.url}
      connect
      video
      audio={false}
      onError={() => setFallo(true)}
    >
      <VistaPropia />
    </LiveKitRoom>
  );
}

/**
 * Su propia cámara. Va dentro del LiveKitRoom, así que el contexto existe y
 * useTracks es seguro aquí.
 *
 * onlySubscribed: false porque su propia pista es local — nunca se suscribe a
 * ella, y con el valor por defecto no aparecería.
 */
function VistaPropia() {
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: false });
  const propia = tracks.find((t) => t.participant.isLocal);
  if (!propia) return null;

  return (
    <figure className="overflow-hidden rounded-2xl border border-ink-200 bg-ink-900">
      <VideoTrack
        trackRef={propia}
        // Espejo: uno espera verse como en un espejo, no invertido.
        className="aspect-video w-full -scale-x-100 object-cover"
      />
      <figcaption className="border-t border-ink-200 bg-white px-3 py-2 text-meta text-ink-500">
        Así te ve quien te entrevista. Tu imagen no se analiza ni se graba.
      </figcaption>
    </figure>
  );
}
