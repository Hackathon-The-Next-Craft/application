"use client";

import { use, useEffect, useState } from "react";
import { InvalidTokenBoundary } from "@/components/candidate/InvalidTokenBoundary";
import { JoinForm } from "@/components/candidate/JoinForm";
import { Lobby } from "@/components/candidate/Lobby";
import { clearToken, readToken } from "@/lib/candidateToken";

export default function JoinPage({ params }: PageProps<"/join/[code]">) {
  const { code } = use(params);

  // undefined = todavía no leímos localStorage (no existe en el servidor),
  // null = no hay token guardado. Son distintos: sin esta distinción se
  // muestra el formulario por un frame a quien ya estaba en el lobby.
  const [joinToken, setJoinToken] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    setJoinToken(readToken(code));
  }, [code]);

  return (
    <main className="mx-auto w-full max-w-lg flex-1 p-6">
      {joinToken === undefined ? (
        <div className="h-48 animate-pulse rounded-lg border border-zinc-200 bg-white" />
      ) : joinToken === null ? (
        <JoinForm code={code} onJoined={setJoinToken} />
      ) : (
        <InvalidTokenBoundary
          // Remonta el boundary al cambiar de token, para que no se quede
          // mostrando el error de un token ya descartado.
          key={joinToken}
          onDiscardToken={() => {
            clearToken(code);
            setJoinToken(null);
          }}
        >
          <Lobby code={code} joinToken={joinToken} />
        </InvalidTokenBoundary>
      )}
    </main>
  );
}
