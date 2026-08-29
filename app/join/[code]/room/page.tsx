"use client";

import { use } from "react";

// Placeholder de la rama 2: el lobby redirige aquí cuando la sesión pasa a
// "live". La sala real (Monaco, autosave, runner) es la rama 4.
export default function RoomPage({ params }: PageProps<"/join/[code]/room">) {
  const { code } = use(params);

  return (
    <main className="mx-auto w-full max-w-lg flex-1 p-8">
      <div className="rounded-2xl border border-ink-200 bg-white p-8">
        <h1 className="font-display text-title text-ink-900">La sesión empezó</h1>
        <p className="mt-2 text-body-sm text-ink-500">
          Sala del candidato: rama 4. Código de acceso{" "}
          <span className="font-mono text-code text-ink-900">{code}</span>.
        </p>
      </div>
    </main>
  );
}
