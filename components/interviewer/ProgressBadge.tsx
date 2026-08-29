import type { Doc } from "@/convex/_generated/dataModel";

type Progress = Doc<"participants">["progress"];

// PRD FR-10/FR-13 y api-contract.md §4: el color acompaña al texto, nunca lo
// sustituye. Un semáforo amarillo no le dice al entrevistador qué hacer.
const ESTILO: Record<Progress, { label: string; chip: string; dot: string }> = {
  idle: { label: "Sin empezar", chip: "bg-zinc-100 text-zinc-700", dot: "bg-zinc-400" },
  advancing: { label: "Avanza", chip: "bg-green-100 text-green-800", dot: "bg-green-500" },
  exploring: { label: "Explorando", chip: "bg-blue-100 text-blue-800", dot: "bg-blue-500" },
  stuck: { label: "Atascado", chip: "bg-amber-100 text-amber-900", dot: "bg-amber-500" },
  env_failure: { label: "Fallo de entorno", chip: "bg-red-100 text-red-800", dot: "bg-red-500" },
  finished: { label: "Finalizado", chip: "bg-purple-100 text-purple-800", dot: "bg-purple-500" },
};

export function ProgressBadge({ progress }: { progress: Progress }) {
  const { label, chip, dot } = ESTILO[progress];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${chip}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden="true" />
      {label}
    </span>
  );
}
