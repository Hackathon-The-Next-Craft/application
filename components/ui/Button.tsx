// Botón del sistema §6. Tallas: sm 30 · md 36 (por defecto) · lg 44.
// El área táctil mínima de 44 px se resuelve con un pseudo-elemento en las
// tallas pequeñas, para no inflar la caja visible.

import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const base =
  "relative inline-flex items-center justify-center gap-2 font-sans font-semibold whitespace-nowrap " +
  "transition-colors duration-[120ms] ease-[cubic-bezier(.2,.7,.3,1)] " +
  "disabled:cursor-not-allowed disabled:bg-ink-200 disabled:text-ink-400 disabled:border-transparent " +
  // hit target de 44 px sin cambiar la caja visible
  "after:absolute after:inset-x-0 after:top-1/2 after:h-11 after:-translate-y-1/2 after:content-['']";

const variants: Record<Variant, string> = {
  primary: "bg-iris-600 text-white hover:bg-iris-700 active:bg-iris-800 border border-transparent",
  ghost: "bg-transparent text-iris-600 border border-ink-200 hover:bg-iris-50 hover:border-iris-200",
  danger: "bg-fail text-white hover:brightness-95 border border-transparent",
};

const sizes: Record<Size, string> = {
  sm: "h-[30px] px-3 rounded-sm text-[12px] leading-[14px]",
  md: "h-9 px-3.5 rounded-md text-[13px] leading-4",
  lg: "h-11 px-5 rounded-lg text-[15px] leading-[18px]",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className ?? ""}`}
    />
  );
}
