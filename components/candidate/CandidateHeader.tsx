import { Logo } from "@/components/ui/Logo";

/** Cabecera de 56 px, compartida por todas las pantallas del candidato: es
 * la primera vez (y la única) que ve la marca antes de entrar a la sala. */
export function CandidateHeader({ contexto }: { contexto?: string }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-5 border-b border-ink-200 bg-white px-8">
      <Logo size={24} className="text-ink-900" />
      {contexto && (
        <>
          <span className="h-6 w-px bg-ink-200" />
          <span className="truncate text-body-sm text-ink-500">{contexto}</span>
        </>
      )}
    </header>
  );
}
