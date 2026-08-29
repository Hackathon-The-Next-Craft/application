"use node";
import { v } from "convex/values";
import { TrackSource } from "@livekit/protocol";
import { AccessToken } from "livekit-server-sdk";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Tokens de video para LiveKit.
 *
 * LiveKit lleva ÚNICAMENTE la cámara. El micrófono es de Vapi, y esa frontera
 * se impone en el servidor con canPublishSources: si un cliente intentara
 * publicar audio aquí, LiveKit lo rechaza. Sin eso, los dos SDKs capturarían el
 * micro a la vez y habría eco.
 *
 * El aislamiento del PRD FR-03 también vive en el token, no en la UI:
 *   candidato    -> publica cámara, NO se suscribe a nada (no ve a sus pares)
 *   entrevistador-> no publica, se suscribe a todos
 *
 * Configuración (una sola vez por deployment):
 *   npx convex env set LIVEKIT_API_KEY <key>
 *   npx convex env set LIVEKIT_API_SECRET <secret>
 *   npx convex env set LIVEKIT_URL wss://<tu-proyecto>.livekit.cloud
 */

const TTL_SECONDS = 60 * 60 * 4;

function config() {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const url = process.env.LIVEKIT_URL;
  if (!apiKey || !apiSecret || !url) {
    throw new Error(
      "Falta configurar LiveKit. Requiere LIVEKIT_API_KEY, LIVEKIT_API_SECRET y LIVEKIT_URL en el deployment.",
    );
  }
  return { apiKey, apiSecret, url };
}

/** Una sala por sesión. */
function roomName(sessionId: string) {
  return `session_${sessionId}`;
}

type MediaToken = { token: string; url: string; room: string };

async function mint(
  identity: string,
  name: string,
  room: string,
  grants: { canPublish: boolean; canSubscribe: boolean },
): Promise<MediaToken> {
  const { apiKey, apiSecret, url } = config();
  const at = new AccessToken(apiKey, apiSecret, {
    identity,
    name,
    ttl: TTL_SECONDS,
  });
  at.addGrant({
    roomJoin: true,
    room,
    canPublish: grants.canPublish,
    canSubscribe: grants.canSubscribe,
    // Cámara y nada más. Ni micrófono ni pantalla compartida.
    canPublishSources: [TrackSource.CAMERA],
    canPublishData: false,
  });
  return { token: await at.toJwt(), url, room };
}

/**
 * Token del candidato. Publica su cámara y no se suscribe a nadie: no puede
 * ver ni oír a los demás candidatos aunque manipule el cliente.
 */
export const candidateToken = action({
  args: { joinToken: v.string() },
  handler: async (ctx, { joinToken }): Promise<MediaToken> => {
    const info = await ctx.runQuery(internal.participants.forMedia, { joinToken });
    if (!info.cameraConsent) {
      throw new Error("El candidato no aceptó el uso de cámara");
    }
    return await mint(
      `participant_${info.participantId}`,
      info.displayName,
      roomName(info.sessionId),
      { canPublish: true, canSubscribe: false },
    );
  },
});

/** Token del entrevistador. Observa a todos y no publica nada. */
export const interviewerToken = action({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }): Promise<MediaToken> => {
    await ctx.runQuery(internal.sessions.assertInterviewer, { sessionId });
    // Identidad única por conexión, no por sesión. LiveKit expulsa al
    // participante anterior cuando entra otro con la misma identidad, así que
    // con un identificador fijo el mosaico y la pantalla de foco abiertos a la
    // vez se echaban el uno al otro. El entrevistador no publica nada, así que
    // tener varias conexiones observando no molesta a nadie.
    return await mint(
      `interviewer_${sessionId}_${crypto.randomUUID().slice(0, 8)}`,
      "Entrevistador",
      roomName(sessionId),
      { canPublish: false, canSubscribe: true },
    );
  },
});
