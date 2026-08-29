"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export function LinkPanel({
  sessionId,
  joinCode,
  linkRevoked,
}: {
  sessionId: Id<"sessions">;
  joinCode: string;
  linkRevoked: boolean;
}) {
  const setLinkRevoked = useMutation(api.sessions.setLinkRevoked);

  return (
    <section className="rounded-2xl border border-ink-200 bg-white p-5">
      <h2 className="font-medium">Enlace para los candidatos</h2>
      <p className="mt-2 font-mono text-body-sm text-ink-700">/join/{joinCode}</p>
      <p className="mt-2 text-body-sm text-ink-500">
        {linkRevoked
          ? "Revocado: nadie más puede entrar. Quienes ya entraron siguen dentro."
          : "Activo. Compártelo con los candidatos."}
      </p>
      <button
        type="button"
        onClick={() => setLinkRevoked({ sessionId, revoked: !linkRevoked })}
        className="mt-3 rounded-md border border-ink-200 px-3 py-1.5 text-body-sm font-medium hover:bg-iris-50"
      >
        {linkRevoked ? "Reactivar el enlace" : "Revocar el enlace"}
      </button>
    </section>
  );
}
