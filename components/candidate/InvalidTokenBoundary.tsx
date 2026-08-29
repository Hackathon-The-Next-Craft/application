"use client";

import { Component, type ReactNode } from "react";

// `useQuery` lanza los errores del servidor durante el render, y
// `participants.me` hace throw ante un joinToken desconocido. Sin este
// boundary, un token viejo en localStorage deja la pantalla en blanco.
const INVALID_TOKEN = "Token de acceso inválido";

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

export class InvalidTokenBoundary extends Component<Props, State> {
  state: State = { message: null };

  static getDerivedStateFromError(error: unknown): State {
    return { message: error instanceof Error ? error.message : String(error) };
  }

  render() {
    const { message } = this.state;
    if (message === null) return this.props.children;

    const isInvalidToken = message.includes(INVALID_TOKEN);
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="font-medium">
          {isInvalidToken
            ? "Tu acceso a esta sesión ya no es válido"
            : "Algo salió mal"}
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
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
          className="mt-4 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          {isInvalidToken ? "Volver a entrar" : "Reintentar"}
        </button>
      </div>
    );
  }
}
