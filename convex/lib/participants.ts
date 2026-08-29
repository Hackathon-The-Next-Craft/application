import { Id } from "../_generated/dataModel";
import { QueryCtx, MutationCtx } from "../_generated/server";

/**
 * Participantes que siguen en la sesión.
 *
 * Existe porque el filtro `presence !== "removed"` se olvidó dos veces: en el
 * cupo que ve el candidato y en el cron de alertas. Cualquier código que
 * cuente, liste o recorra participantes debe pasar por aquí — si necesitas
 * incluir a los retirados, consulta la tabla explícitamente y deja dicho por qué.
 */
export async function activeParticipants(
  ctx: QueryCtx | MutationCtx,
  sessionId: Id<"sessions">,
) {
  const all = await ctx.db
    .query("participants")
    .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
    .collect();
  return all.filter((p) => p.presence !== "removed");
}
