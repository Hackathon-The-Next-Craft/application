// Logo de Multix. Medidas fijadas en el sistema de diseño §5: viewBox 40,
// trazo 3, nodo de radio 4.5 en los recorridos y = 10 / 20 / 30.
// El nodo es siempre iris; pintarlo con un color de estado está prohibido.

type LogoProps = {
  /** Altura del símbolo en px. Mínimo 20 según §5. */
  size?: number;
  /** Muestra el nombre junto al símbolo. */
  withWordmark?: boolean;
  className?: string;
};

export function Logo({ size = 24, withWordmark = true, className }: LogoProps) {
  return (
    <div
      className={`flex items-center ${className ?? ""}`}
      // Separación símbolo ↔ palabra: 0.29 × altura del símbolo (§5).
      style={{ gap: withWordmark ? Math.round(size * 0.29) : 0 }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        role="img"
        aria-label="Multix"
      >
        <path
          d="M5 10H17C23.5 10 24 20 30 20"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path d="M5 20H30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path
          d="M5 30H17C23.5 30 24 20 30 20"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="31.5" cy="20" r="4.5" className="fill-iris-600" />
      </svg>
      {withWordmark && (
        <span
          className="font-display font-extrabold tracking-[-0.035em]"
          style={{ fontSize: Math.round(size * 0.76) }}
        >
          Multix
        </span>
      )}
    </div>
  );
}
