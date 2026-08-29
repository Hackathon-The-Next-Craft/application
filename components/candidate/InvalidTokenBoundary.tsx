"use client";

import { Component, type ReactNode } from "react";

// `useQuery` lanza los errores del servidor durante el render, y
// `participants.me` hace throw ante un joinToken desconocido. Sin este
// boundary, un token viejo en localStorage deja la pantalla en blanco.
const INVALID_TOKEN = "Token de acceso inválido";
const RETIRADO = "El entrevistador te retiró de la sesión";

type Props = {
  children: ReactNode;
  /**
   * Descarta el token guardado y devuelve al formulario. Se dispara desde el
   * botón, no al capturar: el candidato pierde su lugar en el lobby, así que
   * merece leer por qué antes de que la pantalla cambie sola.
   */
  onDiscardToken: () => void;
};

type State = { message: string | null };

export function PanelRetirado() {
  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-6">
      <h2 className="font-display text-subtitle text-ink-900">El entrevistador te retiró de la sesión</h2>
      <p className="mt-2 text-body-sm text-ink-500">
        Tu trabajo quedó guardado. Si crees que fue un error, escríbele a quien
        te compartió el enlace.
      </p>
    </div>
  );
}

export class InvalidTokenBoundary extends Component<Props, State> {
  state: State = { message: null };

  static getDerivedStateFromError(error: unknown): State {
    return { message: error instanceof Error ? error.message : String(error) };
  }

  render() {
    const { message } = this.state;
    if (message === null) return this.props.children;

    const fueRetirado = message.includes(RETIRADO);
    const isInvalidToken = !fueRetirado && message.includes(INVALID_TOKEN);

    if (fueRetirado) {
      return <PanelRetirado />;
    }

    return (
      <div className="rounded-2xl border border-ink-200 bg-white p-6">
        <h2 className="font-display text-subtitle text-ink-900">
          {isInvalidToken
            ? "Tu acceso a esta sesión ya no es válido"
            : "Algo salió mal"}
        </h2>
        <p className="mt-2 text-body-sm text-ink-500">
          {isInvalidToken
            ? "Puede que hayas limpiado los datos del navegador, o que estés entrando desde otro dispositivo. Vuelve a entrar con tu nombre; avísale al entrevistador de que reingresaste."
            : message}
        </p>
        <button
          type="button"
          onClick={() => {
            if (isInvalidToken) {
              this.props.onDiscardToken();
            } else {
              this.setState({ message: null });
              window.location.reload();
            }
          }}
          className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-iris-600 px-5 font-sans text-[15px] font-semibold leading-[18px] text-white transition-colors duration-[120ms] hover:bg-iris-700"
        >
          {isInvalidToken ? "Volver a entrar" : "Reintentar"}
        </button>
      </div>
    );
  }
}
