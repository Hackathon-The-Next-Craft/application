import Link from "next/link";
import type { Doc } from "@/convex/_generated/dataModel";
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
const PRIMARY_ACTION: Record<Status, { label: string; href: (id: string) => string }> = {
  draft: { label: "Continuar", href: (id) => `/s/${id}/setup` },
  ready: { label: "Abrir sala", href: (id) => `/s/${id}/setup` },
  live: { label: "Volver al panel", href: (id) => `/s/${id}/live` },
  paused: { label: "Volver al panel", href: (id) => `/s/${id}/live` },
  closing: { label: "Ver cierre", href: (id) => `/s/${id}/live` },
  closed: { label: "Ver informes", href: (id) => `/s/${id}/live` },
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
  const primary = PRIMARY_ACTION[session.status];
  const secondaryHref =
    primary.href(session._id) === `/s/${session._id}/setup`
      ? `/s/${session._id}/live`
      : `/s/${session._id}/setup`;

  return (
    <li className="grid grid-cols-[1fr_140px_180px_120px_170px] items-center gap-4 border-b border-ink-200 px-5 py-4 last:border-b-0 hover:bg-ink-25">
      <div className="min-w-0">
        <h3 className="truncate text-body-sm font-semibold text-ink-900">
          {session.title}
        </h3>
        <p className="mt-0.5 truncate text-meta text-ink-500">
          {session.role} · {session.seniority} · {session.durationMinutes} min
          {session.technologies.length > 0 && ` · ${session.technologies.join(", ")}`}
        </p>
      </div>

      <Chip tone={STATUS_TONE[session.status]} dot={session.status === "live"}>
        {STATUS_LABEL[session.status]}
      </Chip>

      <div className="min-w-0">
        <p className="tabular truncate font-mono text-meta text-ink-500">
          {session.joinCode}
        </p>
        {session.linkRevoked && (
          <p className="mt-0.5 text-meta text-stuck-text">enlace revocado</p>
        )}
      </div>

      <p className="tabular text-meta text-ink-500">{formatDate(session._creationTime)}</p>

      <div className="flex items-center justify-end gap-3">
        <Link
          href={secondaryHref}
          className="text-meta text-ink-500 underline underline-offset-4 hover:text-iris-600"
        >
          {secondaryHref.endsWith("/live") ? "En vivo" : "Preparar"}
        </Link>
        <Link
          href={primary.href(session._id)}
          className="inline-flex h-9 items-center justify-center rounded-md border border-ink-200 px-3.5 font-sans text-[13px] font-semibold leading-4 text-iris-600 transition-colors duration-[120ms] hover:border-iris-200 hover:bg-iris-50"
        >
          {primary.label}
        </Link>
      </div>
    </li>
  );
}
