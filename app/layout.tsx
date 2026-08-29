import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ConvexClientProvider } from "./ConvexClientProvider";
import "./globals.css";

// Las tres familias del sistema de diseño y su trabajo: display para
// titulares, Inter para todo lo que se lee en frases, mono para lo
// verificable (hora, ID, test, evento).
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Multix",
  description: "Entrevistas técnicas en vivo con acompañamiento de IA.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  // El provider de servidor lee la cookie de sesión (la escribe proxy.ts) y se
  // la pasa al cliente. Sin este par, useQuery se queda en undefined para siempre.
  return (
    <ConvexAuthNextjsServerProvider>
      <html
        lang="es"
        className={`${bricolage.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-ink-50 text-ink-900">
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
