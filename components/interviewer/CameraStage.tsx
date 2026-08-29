"use client";

import { useAction } from "convex/react";
import {
  LiveKitRoom,
  VideoTrack,
  useMaybeRoomContext,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { useEffect, useState, type ReactNode } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

/**
 * Envuelve el mosaico para que las tarjetas puedan mostrar video.
 *
 * El entrevistador se suscribe a todos los candidatos y no publica nada — su
 * token no se lo permite. Tampoco se renderiza audio: el canal de voz es Vapi.
 *
 * Uso:
 *   <CameraStage sessionId={sessionId}>
 *     ...las tarjetas del mosaico...
 *   </CameraStage>
 *
 * y dentro de cada tarjeta: <CandidateVideo participantId={p._id} />
 */
export function CameraStage({
  sessionId,
  children,
}: {
  sessionId: Id<"sessions">;
  children: ReactNode;
}) {
  const pedirToken = useAction(api.media.interviewerToken);
  const [cred, setCred] = useState<{ token: string; url: string } | null>(null);
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    let vigente = true;
    pedirToken({ sessionId })
      .then((r) => vigente && setCred({ token: r.token, url: r.url }))
      .catch(() => vigente && setFallo(true));
    return () => {
      vigente = false;
    };
  }, [sessionId, pedirToken]);

  // Sin video el mosaico sigue funcionando: el código en vivo y las alertas
  // son lo que sostiene la pantalla, la cámara es un extra.
  if (fallo || !cred) return <>{children}</>;

  return (
    <LiveKitRoom
      token={cred.token}
      serverUrl={cred.url}
      connect
      video={false}
      audio={false}
      onError={() => setFallo(true)}
    >
      {children}
    </LiveKitRoom>
  );
}

/**
 * El recuadro de un candidato. Devuelve null si no está publicando —porque no
 * dio consentimiento de cámara, o porque aún no conecta— así que la tarjeta
 * debe seguir siendo legible sin él.
 *
 * El guardia de contexto NO es decorativo: useTracks necesita una sala, y
 * useRoomContext LANZA si no la encuentra. Como CameraStage renderiza a sus
 * hijos sin sala mientras pide el token —y para siempre si LiveKit no está
 * configurado— sin este guardia el mosaico entero revienta en el primer
 * render. La cámara tiene que poder faltar sin llevarse la pantalla.
 */
export function CandidateVideo(props: {
  participantId: Id<"participants">;
  className?: string;
}) {
  const room = useMaybeRoomContext();
  if (!room) return null;
  return <TrackDeCandidato {...props} />;
}

function TrackDeCandidato({
  participantId,
  className,
}: {
  participantId: Id<"participants">;
  className?: string;
}) {
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: true });
  // La identidad la firma el servidor en el token; el cliente no puede mentir.
  const suyo = tracks.find(
    (t) => t.participant.identity === `participant_${participantId}`,
  );
  if (!suyo) return null;
  return (
    <VideoTrack
      trackRef={suyo}
      className={className ?? "aspect-video w-full rounded-md object-cover"}
    />
  );
}
