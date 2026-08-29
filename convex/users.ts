import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";

/** El entrevistador de la sesión actual, para mostrar su cuenta en el header. */
export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;
    return { email: user.email ?? null, name: user.name ?? null };
  },
});
