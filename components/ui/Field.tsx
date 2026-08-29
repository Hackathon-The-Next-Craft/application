// Campo de formulario del sistema §6: alto 40, padding 12, radio 8,
// borde hairline que pasa a iris en foco. Etiqueta → campo: 6 px.
// Campo → texto de ayuda: 6 px.

import type { InputHTMLAttributes, ReactNode } from "react";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  /** Se pinta a la derecha de la etiqueta: un enlace de ayuda, por ejemplo. */
  labelAside?: ReactNode;
  /** Texto de ayuda bajo el campo. */
  hint?: string;
};

export function Field({ label, labelAside, hint, className, ...props }: FieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center">
        <span className="flex-1 text-caption font-medium text-ink-900">{label}</span>
        {labelAside}
      </span>
      <input
        {...props}
        className={
          "h-10 w-full rounded-md border border-ink-200 bg-white px-3 text-body-sm text-ink-900 " +
          "placeholder:text-ink-400 outline-none " +
          "transition-colors duration-[120ms] ease-[cubic-bezier(.2,.7,.3,1)] " +
          "focus:border-iris-600 aria-invalid:border-fail " +
          (className ?? "")
        }
      />
      {hint && <span className="text-caption text-ink-500">{hint}</span>}
    </label>
  );
}
