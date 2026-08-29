import type { Doc } from "@/convex/_generated/dataModel";

const STATUS_LABEL: Record<Doc<"sessions">["status"], string> = {
  draft: "Borrador",
  ready: "Lista",
  live: "En vivo",
  paused: "Pausada",
  closing: "Finalizando",
  closed: "Cerrada",
};

const STATUS_STYLE: Record<Doc<"sessions">["status"], string> = {
  draft: "bg-zinc-100 text-zinc-700",
  ready: "bg-blue-100 text-blue-800",
  live: "bg-green-100 text-green-800",
  paused: "bg-amber-100 text-amber-800",
  closing: "bg-purple-100 text-purple-800",
  closed: "bg-zinc-200 text-zinc-600",
};

export function SessionCard({ session }: { session: Doc<"sessions"> }) {
  return (
    <li className="flex items-start justify-between gap-4 rounded-lg border border-zinc-200 bg-white p-4">
      <div className="min-w-0">
        <h3 className="truncate font-medium">{session.title}</h3>
        <p className="mt-0.5 text-sm text-zinc-500">
          {session.role} · {session.seniority} · {session.durationMinutes} min
        </p>
        {session.technologies.length > 0 && (
          <p className="mt-1 text-sm text-zinc-500">
            {session.technologies.join(", ")}
          </p>
        )}
        <p className="mt-2 text-xs text-zinc-400">
          Código de acceso:{" "}
          <span className="font-mono text-zinc-600">{session.joinCode}</span>
          {session.linkRevoked && " · link revocado"}
        </p>
      </div>
      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[session.status]}`}
      >
        {STATUS_LABEL[session.status]}
      </span>
    </li>
  );
}
