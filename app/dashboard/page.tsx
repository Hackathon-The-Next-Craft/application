"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { NewSessionForm } from "@/components/interviewer/NewSessionForm";
import { SessionCard } from "@/components/interviewer/SessionCard";

export default function DashboardPage() {
  const { signOut } = useAuthActions();
  const router = useRouter();
  const { isLoading: authLoading } = useConvexAuth();
  const [creating, setCreating] = useState(false);

  // Reactivo: cuando `create` inserta, esta lista se actualiza sola.
  const sessions = useQuery(api.sessions.listMine);

  // `listMine` devuelve [] si el usuario aún no está autenticado en Convex.
  // Sin esta guarda se vería un "no tienes sesiones" falso durante el arranque.
  const loading = authLoading || sessions === undefined;

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4">
        <span className="font-semibold tracking-tight">LiveRoom AI</span>
        <button
          type="button"
          onClick={async () => {
            await signOut();
            router.push("/signin");
          }}
          className="text-sm text-zinc-500 underline underline-offset-4 hover:text-zinc-900"
        >
          Salir
        </button>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Mis sesiones</h1>
          {!creating && (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
            >
              Nueva sesión
            </button>
          )}
        </div>

        {creating && (
          <div className="mt-6">
            <NewSessionForm onCancel={() => setCreating(false)} />
          </div>
        )}

        <div className="mt-6">
          {loading ? (
            <ul className="flex flex-col gap-3" aria-busy="true">
              {[0, 1].map((i) => (
                <li
                  key={i}
                  className="h-24 animate-pulse rounded-lg border border-zinc-200 bg-white"
                />
              ))}
            </ul>
          ) : sessions.length === 0 ? (
            <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
              Todavía no tienes sesiones. Crea la primera.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {sessions.map((session) => (
                <SessionCard key={session._id} session={session} />
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
