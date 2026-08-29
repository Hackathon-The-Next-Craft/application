"use client";

import { use } from "react";

// Placeholder de la rama 2: el lobby redirige aquí cuando la sesión pasa a
// "live". La sala real (Monaco, autosave, runner) es la rama 4.
export default function RoomPage({ params }: PageProps<"/join/[code]/room">) {
  const { code } = use(params);

  return (
    <main className="mx-auto w-full max-w-lg flex-1 p-6">
      <div className="rounded-lg border border-zinc-200 bg-white p-6">
        <h1 className="text-2xl font-semibold tracking-tight">La sesión empezó</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Sala del candidato: rama 4. Código de acceso{" "}
          <span className="font-mono">{code}</span>.
        </p>
      </div>
    </main>
  );
}
