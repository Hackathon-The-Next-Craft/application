"use client";

// Barra superior del entrevistador. Altura 56 px (§5), logo a la izquierda y
// la salida de sesión a la derecha. La comparten todas las pantallas del panel.

import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { api } from "@/convex/_generated/api";
import { Logo } from "@/components/ui/Logo";
import { QuietBoundary } from "@/components/ui/QuietBoundary";

function initialsFrom(text: string) {
  const local = text.split("@")[0];
  const parts = local.split(/[.\-_ ]+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : local.slice(0, 2);
  return letters.toUpperCase();
}

/** Cuenta del entrevistador logueado, arriba a la derecha. */
function Account() {
  const viewer = useQuery(api.users.viewer);
  if (!viewer) return null;

  const label = viewer.name ?? viewer.email;
  if (!label) return null;

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-iris-100 font-mono text-chip font-semibold text-iris-700">
        {initialsFrom(label)}
      </span>
      <span className="hidden max-w-[180px] truncate text-body-sm text-ink-700 sm:inline">
        {label}
      </span>
    </div>
  );
}

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
      <QuietBoundary>
        <Account />
      </QuietBoundary>
      <span className="h-6 w-px bg-ink-200" />
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
