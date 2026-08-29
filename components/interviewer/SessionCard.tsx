"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/Button";
import { Chip, type Tone } from "@/components/ui/Chip";

type Status = Doc<"sessions">["status"];

const STATUS_LABEL: Record<Status, string> = {
  draft: "Borrador",
  ready: "Lista",
  live: "En vivo",
  paused: "Pausada",
  closing: "Finalizando",
  closed: "Cerrada",
};

// El sistema define los colores de estado para el candidato; aquí se reutilizan
// para el ciclo de vida de la sesión. "En vivo" va en rojo por la convención de
// directo, y es el único que lleva punto.
const STATUS_TONE: Record<Status, Tone> = {
  draft: "neutral",
  ready: "advance",
  live: "fail",
  paused: "stuck",
  closing: "explore",
  closed: "neutral",
};

// La acción que toca según dónde esté la sesión. La otra sigue disponible
// como enlace secundario: ninguna ruta deja de ser alcanzable.
// Las etiquetas son de una sola palabra a propósito: en dos cabían mal y el
// botón partía el texto en dos líneas.
const PRIMARY_ACTION: Record<Status, { label: string; href: (id: string) => string }> = {
  draft: { label: "Continuar", href: (id) => `/s/${id}/setup` },
  ready: { label: "Abrir", href: (id) => `/s/${id}/setup` },
  live: { label: "Panel", href: (id) => `/s/${id}/live` },
  paused: { label: "Panel", href: (id) => `/s/${id}/live` },
  closing: { label: "Panel", href: (id) => `/s/${id}/live` },
  closed: { label: "Informes", href: (id) => `/s/${id}/live` },
};

function formatDate(ms: number) {
  const date = new Date(ms);
  const today = new Date();
  const sameDay =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  return sameDay
    ? `Hoy, ${date.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}`
    : date.toLocaleDateString("es", { day: "numeric", month: "short" });
}

export function SessionCard({ session }: { session: Doc<"sessions"> }) {
  const eliminar = useMutation(api.sessions.remove);
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, setPendiente] = useState(false);

  const primary = PRIMARY_ACTION[session.status];
  const primaryHref = primary.href(session._id);
  const secondaryHref = primaryHref.endsWith("/setup")
    ? `/s/${session._id}/live`
    : `/s/${session._id}/setup`;
  // Con candidatos dentro no se puede borrar: hay que cerrarla primero.
  const enVivo = session.status === "live" || session.status === "paused";

  if (confirmando) {
    return (
      <li className="border-b border-ink-200 border-l-[3px] border-l-fail px-5 py-4 last:border-b-0">
        <div className="flex flex-wrap items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-body-sm font-semibold text-ink-900">
              ¿Eliminar «{session.title}»?
            </p>
            <p className="mt-0.5 max-w-[62ch] text-meta text-ink-500">
              Se borran también sus candidatos, retos, código, eventos e
              informes. No se puede deshacer.
            </p>
            {error && (
              <p role="alert" className="mt-1.5 text-meta text-fail-text">
                {error}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setConfirmando(false);
                setError(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={pendiente}
              onClick={async () => {
                setPendiente(true);
                setError(null);
                try {
                  await eliminar({ sessionId: session._id });
                  // No hace falta cerrar nada: la fila desaparece sola cuando
                  // la consulta reactiva se actualiza.
                } catch (caught) {
                  setError(
                    caught instanceof Error
                      ? caught.message
                      : "No se pudo eliminar.",
                  );
                  setPendiente(false);
                }
              }}
            >
              {pendiente ? "Eliminando…" : "Sí, eliminar"}
            </Button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto_128px_104px_auto] items-center gap-x-5 border-b border-ink-200 px-5 py-4 last:border-b-0 hover:bg-ink-25">
      <div className="min-w-0">
        <h3 className="truncate text-body-sm font-semibold text-ink-900">
          {session.title}
        </h3>
        <p className="mt-0.5 truncate text-meta text-ink-500">
          {session.role} · {session.seniority} · {session.durationMinutes} min
          {session.technologies.length > 0 && ` · ${session.technologies.join(", ")}`}
        </p>
      </div>

      {/* justify-self evita que el chip se estire hasta el ancho de su columna. */}
      <Chip
        tone={STATUS_TONE[session.status]}
        dot={session.status === "live"}
        className="justify-self-start"
      >
        {STATUS_LABEL[session.status]}
      </Chip>

      <div className="min-w-0">
        <p className="tabular truncate font-mono text-meta text-ink-500">
          {session.joinCode}
        </p>
        {session.linkRevoked && (
          <p className="text-meta text-stuck-text">revocado</p>
        )}
      </div>

      <p className="tabular truncate text-meta text-ink-500">
        {formatDate(session._creationTime)}
      </p>

      <div className="flex shrink-0 items-center gap-1">
        <Link
          href={secondaryHref}
          className="rounded-md px-2.5 py-1.5 text-meta whitespace-nowrap text-ink-500 underline underline-offset-4 hover:text-iris-600"
        >
          {secondaryHref.endsWith("/live") ? "En vivo" : "Preparar"}
        </Link>

        <Link
          href={primaryHref}
          className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-ink-200 px-3.5 font-sans text-[13px] font-semibold leading-4 text-iris-600 transition-colors duration-[120ms] hover:border-iris-200 hover:bg-iris-50"
        >
          {primary.label}
        </Link>

        <button
          type="button"
          onClick={() => setConfirmando(true)}
          disabled={enVivo}
          title={
            enVivo
              ? "Cierra la sesión antes de eliminarla"
              : `Eliminar ${session.title}`
          }
          aria-label={`Eliminar ${session.title}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-400 transition-colors duration-[120ms] hover:bg-fail-bg hover:text-fail-text disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink-400"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M2.5 4h11M6 4V2.75A.75.75 0 0 1 6.75 2h2.5a.75.75 0 0 1 .75.75V4" />
            <path d="M12.5 4l-.6 8.4a1 1 0 0 1-1 .93H5.1a1 1 0 0 1-1-.93L3.5 4" />
            <path d="M6.5 7v3.5M9.5 7v3.5" />
          </svg>
        </button>
      </div>
    </li>
  );
}
