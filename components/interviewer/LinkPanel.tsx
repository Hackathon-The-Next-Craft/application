"use client";

import { useMutation } from "convex/react";
import { useState } from "react";
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
  const [copiado, setCopiado] = useState(false);

  // El origen solo existe en el navegador, así que servidor y cliente pintan
  // cosas distintas. Se resuelve en el render en vez de en un efecto —un
  // setState dentro de useEffect provoca un render en cascada— y se marca la
  // diferencia como esperada. Así el enlace sirve igual en localhost que
  // desplegado, sin hardcodear ningún dominio.
  const url =
    typeof window === "undefined"
      ? `/join/${joinCode}`
      : `${window.location.origin}/join/${joinCode}`;

  async function copiar() {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/join/${joinCode}`,
      );
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Algunos navegadores lo bloquean sin gesto o sin https: el enlace sigue
      // visible y seleccionable, así que no hay nada que reparar.
    }
  }

  return (
    <section className="rounded-2xl border border-ink-200 bg-white p-5">
      <h2 className="font-medium">Enlace para los candidatos</h2>

      <p
        suppressHydrationWarning
        className="mt-2 break-all rounded-md border border-ink-200 bg-ink-25 px-3 py-2 font-mono text-code text-ink-900"
      >
        {url}
      </p>

      <p className="mt-2 text-body-sm text-ink-500">
        {linkRevoked
          ? "Revocado: nadie más puede entrar. Quienes ya entraron siguen dentro."
          : "Activo. Compártelo con los candidatos."}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={copiar}
          disabled={linkRevoked}
          className="rounded-md border border-ink-200 px-3 py-1.5 text-body-sm font-medium hover:bg-iris-50 disabled:opacity-50"
        >
          {copiado ? "Copiado" : "Copiar enlace"}
        </button>
        <button
          type="button"
          onClick={() => setLinkRevoked({ sessionId, revoked: !linkRevoked })}
          className="rounded-md border border-ink-200 px-3 py-1.5 text-body-sm font-medium hover:bg-iris-50"
        >
          {linkRevoked ? "Reactivar el enlace" : "Revocar el enlace"}
        </button>
      </div>
    </section>
  );
}
