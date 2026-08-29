"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { InvalidTokenBoundary } from "@/components/candidate/InvalidTokenBoundary";
import { Room } from "@/components/candidate/Room";
import { clearToken, readToken } from "@/lib/candidateToken";

export default function RoomPage({ params }: PageProps<"/join/[code]/room">) {
  const { code } = use(params);

  // Mismo patrón que el lobby: localStorage no existe en el servidor.
  const [joinToken, setJoinToken] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    setJoinToken(readToken(code));
  }, [code]);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 p-6">
      {joinToken === undefined ? (
        <div className="h-96 animate-pulse rounded-2xl border border-ink-200 bg-white" />
      ) : joinToken === null ? (
        <div className="rounded-2xl border border-ink-200 bg-white p-6">
          <h1 className="font-medium">No tienes acceso a esta sala</h1>
          <p className="mt-2 text-body-sm text-ink-500">
            Entra primero con tu nombre desde el enlace de la entrevista.
          </p>
          <Link
            href={`/join/${code}`}
            className="mt-4 inline-block rounded-md bg-iris-600 px-4 py-2 text-body-sm font-medium text-white hover:bg-iris-700"
          >
            Ir a la entrada
          </Link>
        </div>
      ) : (
        <InvalidTokenBoundary
          key={joinToken}
          onDiscardToken={() => {
            clearToken(code);
            setJoinToken(null);
          }}
        >
          <Room code={code} joinToken={joinToken} />
        </InvalidTokenBoundary>
      )}
    </main>
  );
}
