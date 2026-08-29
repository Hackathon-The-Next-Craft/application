import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc, Id } from "../_generated/dataModel";
import { QueryCtx, MutationCtx } from "../_generated/server";

type Ctx = QueryCtx | MutationCtx;

/** El entrevistador dueño de la sesión. Toda función de entrevistador pasa por aquí. */
export async function requireInterviewer(ctx: Ctx, sessionId: Id<"sessions">) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("No autenticado");
  const session = await ctx.db.get(sessionId);
  if (!session) throw new Error("Sesión no encontrada");
  if (session.interviewerId !== userId) throw new Error("No autorizado");
  return { userId, session };
}

/**
 * Resuelve al candidato desde su joinToken, sin juzgar su estado.
 * Úsalo solo donde el candidato necesita VER en qué situación está.
 */
export async function resolveCandidate(ctx: Ctx, joinToken: string) {
  const participant = await ctx.db
    .query("participants")
    .withIndex("by_joinToken", (q) => q.eq("joinToken", joinToken))
    .unique();
  if (!participant) throw new Error("Token de acceso inválido");
  const session = await ctx.db.get(participant.sessionId);
  if (!session) throw new Error("Sesión no encontrada");
  return { participant, session };
}

/**
 * Resuelve al candidato y exige que siga activo. PRD FR-03 / §9.3: el
 * aislamiento se garantiza AQUÍ, en el servidor — nunca escondiendo cosas
 * en la UI. Un participante retirado conserva su token pero ya no escribe.
 */
export async function requireCandidate(ctx: Ctx, joinToken: string) {
  const { participant, session } = await resolveCandidate(ctx, joinToken);
  if (participant.presence === "removed") {
    throw new Error("El entrevistador te retiró de la sesión");
  }
  return { participant, session };
}

/** Un candidato solo puede tocar workspaces propios. */
export function assertOwnsWorkspace(
  participant: Doc<"participants">,
  workspace: Doc<"workspaces">,
) {
  if (workspace.participantId !== participant._id) throw new Error("No autorizado");
}
