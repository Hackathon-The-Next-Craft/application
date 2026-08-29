// Chip de estado del sistema §6: alto 22, padding 8, radio completo,
// mono 10 px en mayúsculas con tracking +10 %.
// Regla §4: ningún estado se comunica solo por color, siempre lleva su
// etiqueta de texto. El punto es un refuerzo, nunca el único indicio.

import type { ReactNode } from "react";

export type Tone =
  | "advance"
  | "explore"
  | "stuck"
  | "fail"
  | "done"
  | "neutral"
  | "brand";

const tones: Record<Tone, string> = {
  advance: "bg-advance-bg text-advance-text",
  explore: "bg-explore-bg text-explore-text",
  stuck: "bg-stuck-bg text-stuck-text",
  fail: "bg-fail-bg text-fail-text",
  done: "bg-done-bg text-done-text",
  neutral: "bg-ink-100 text-ink-600",
  brand: "bg-iris-100 text-iris-700",
};

const dots: Record<Tone, string> = {
  advance: "bg-advance",
  explore: "bg-explore",
  stuck: "bg-stuck",
  fail: "bg-fail",
  done: "bg-done",
  neutral: "bg-ink-400",
  brand: "bg-iris-600",
};

export function Chip({
  tone = "neutral",
  dot = false,
  children,
  className,
}: {
  tone?: Tone;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex h-[22px] items-center gap-1.5 rounded-full px-2 font-mono text-chip uppercase ${tones[tone]} ${className ?? ""}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dots[tone]}`} />}
      {children}
    </span>
  );
}
