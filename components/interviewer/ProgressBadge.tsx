import type { Doc } from "@/convex/_generated/dataModel";
import { Chip, type Tone } from "@/components/ui/Chip";

type Progress = Doc<"participants">["progress"];

// PRD FR-10/FR-13 y api-contract.md §4: el color acompaña al texto, nunca lo
// sustituye. Un semáforo amarillo no le dice al entrevistador qué hacer.
const ESTILO: Record<Progress, { label: string; tone: Tone }> = {
  idle: { label: "Sin empezar", tone: "neutral" },
  advancing: { label: "Avanza", tone: "advance" },
  exploring: { label: "Explorando", tone: "explore" },
  stuck: { label: "Atascado", tone: "stuck" },
  env_failure: { label: "Fallo de entorno", tone: "fail" },
  finished: { label: "Finalizado", tone: "done" },
};

export function ProgressBadge({ progress }: { progress: Progress }) {
  const { label, tone } = ESTILO[progress];
  return (
    <Chip tone={tone} dot className="shrink-0">
      {label}
    </Chip>
  );
}

export const PROGRESS_TONE: Record<Progress, Tone> = {
  idle: "neutral",
  advancing: "advance",
  exploring: "explore",
  stuck: "stuck",
  env_failure: "fail",
  finished: "done",
};
