"use client";

import { Component, type ReactNode } from "react";

/**
 * `useQuery` lanza los errores del servidor durante el render. Para piezas
 * accesorias de la pantalla (no el contenido principal), un fallo ahí no
 * debe tumbar toda la página: mejor que esa pieza simplemente no aparezca.
 */
export class QuietBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? null;
    return this.props.children;
  }
}
