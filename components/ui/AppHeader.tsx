"use client";

// Barra superior del entrevistador. Altura 56 px (§5), logo a la izquierda y
// la salida de sesión a la derecha. La comparten todas las pantallas del panel.

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";

export function AppHeader({
  /** Contexto entre el logo y las acciones: migas, título de sesión, estado. */
  children,
  /** Acciones propias de la pantalla, a la izquierda de "Salir". */
  actions,
}: {
  children?: ReactNode;
  actions?: ReactNode;
}) {
  const { signOut } = useAuthActions();
  const router = useRouter();

  return (
    <header className="flex h-14 shrink-0 items-center gap-5 border-b border-ink-200 bg-white px-8">
      <Logo size={24} className="text-ink-900" />
      {children && (
        <>
          <span className="h-6 w-px bg-ink-200" />
          {children}
        </>
      )}
      <div className="flex-1" />
      {actions}
      <button
        type="button"
        onClick={async () => {
          await signOut();
          router.push("/signin");
        }}
        className="text-body-sm text-ink-500 underline underline-offset-4 hover:text-iris-600"
      >
        Salir
      </button>
    </header>
  );
}
