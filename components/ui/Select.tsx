// Desplegable con la misma geometría que Field (§6): alto 40, radio 8,
// borde hairline que pasa a iris en foco. La flecha se dibuja aparte porque
// la nativa no se puede alinear a la rejilla.

import type { ReactNode, SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  hint?: string;
  children: ReactNode;
};

export function Select({ label, hint, className, children, ...props }: SelectProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-caption font-medium text-ink-900">{label}</span>
      <span className="relative flex items-center">
        <select
          {...props}
          className={
            "h-10 w-full appearance-none rounded-md border border-ink-200 bg-white pl-3 pr-9 " +
            "text-body-sm text-ink-900 outline-none " +
            "transition-colors duration-[120ms] ease-[cubic-bezier(.2,.7,.3,1)] " +
            "focus:border-iris-600 " +
            (className ?? "")
          }
        >
          {children}
        </select>
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="pointer-events-none absolute right-3 text-ink-400"
          aria-hidden
        >
          <path d="M4 6.5L8 10.5l4-4" />
        </svg>
      </span>
      {hint && <span className="text-caption text-ink-500">{hint}</span>}
    </label>
  );
}
