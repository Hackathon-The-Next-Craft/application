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
    // Sin ancho máximo aquí: cada estado compone su propia página, porque el
    // formulario de acceso ocupa toda la pantalla y el lobby no.
    <div className="flex flex-1 flex-col">
      {joinToken === undefined ? (
        <div className="mx-auto w-full max-w-[840px] px-6 py-12">
          <div className="h-48 animate-pulse rounded-2xl border border-ink-200 bg-white" />
        </div>
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
    </div>
  );
}
