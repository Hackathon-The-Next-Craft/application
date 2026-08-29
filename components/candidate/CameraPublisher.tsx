"use client";

import { useAction } from "convex/react";
import { LiveKitRoom } from "@livekit/components-react";
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
 * No renderiza nada visible: el candidato no necesita verse a sí mismo, y
 * tampoco puede ver a los demás (su token no permite suscribirse a nadie).
 *
 * TODO(anjali): si quieres un preview propio para que el candidato compruebe
 * que se le ve, envuelve esto y usa <ParticipantTile> dentro del LiveKitRoom.
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
    />
  );
}
