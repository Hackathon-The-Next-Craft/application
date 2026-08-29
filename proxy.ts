import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

// Next 16 renombró `middleware.ts` a `proxy.ts` (ver
// node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md).

const isSignInPage = createRouteMatcher(["/signin"]);

// Pantallas de entrevistador. /join/[code] queda fuera a propósito: el
// candidato no tiene cuenta, entra con joinToken.
const isInterviewerRoute = createRouteMatcher(["/dashboard(.*)", "/s/(.*)"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  if (isSignInPage(request) && (await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/dashboard");
  }
  if (isInterviewerRoute(request) && !(await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/signin");
  }
});

export const config = {
  // Todo menos los estáticos de Next. El proxy también tiene que correr sobre
  // /api/auth: ahí es donde Convex Auth escribe la cookie de sesión.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
