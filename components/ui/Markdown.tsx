"use client";

// El enunciado de un reto llega en markdown (así lo genera la IA y así lo
// edita el entrevistador). Antes se mostraba tal cual dentro de un <pre>,
// así que el candidato veía los propios "###" y "```" en pantalla. Esto lo
// parsea y pinta cada elemento con los tokens de Multix, en vez de usar las
// clases genéricas de un plugin de "prose".

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const componentes: Components = {
  h1: ({ children }) => (
    <h1 className="mt-5 font-display text-subtitle text-ink-900 first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-5 font-display text-body font-semibold text-ink-900 first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-4 text-body-sm font-semibold text-ink-900 first:mt-0">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mt-2.5 text-body-sm leading-relaxed text-ink-800 first:mt-0">{children}</p>
  ),
  strong: ({ children }) => <strong className="font-semibold text-ink-900">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => (
    <ul className="mt-2.5 flex list-disc flex-col gap-1.5 pl-5 text-body-sm text-ink-800">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-2.5 flex list-decimal flex-col gap-1.5 pl-5 text-body-sm text-ink-800">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-iris-600 underline underline-offset-2 hover:text-iris-700"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-5 border-ink-200" />,
  blockquote: ({ children }) => (
    <blockquote className="mt-2.5 border-l-[3px] border-l-ink-200 pl-3 text-body-sm text-ink-500">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="mt-2.5 overflow-x-auto rounded-md border border-ink-200">
      <table className="w-full text-body-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-ink-200 bg-ink-25 px-3 py-1.5 text-left font-mono text-label uppercase text-ink-500">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-ink-100 px-3 py-1.5 text-ink-800 last:border-b-0">
      {children}
    </td>
  ),
  code: ({ className, children }) => {
    // Un bloque ```fenced``` trae "language-xxx" en el className; el inline
    // `así` no trae ninguno. Es la única forma de distinguirlos aquí.
    if (/language-/.test(className ?? "")) {
      return <code className={className}>{children}</code>;
    }
    return (
      <code className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-[13px] text-ink-800">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="mt-2.5 overflow-x-auto rounded-lg bg-ink-900 p-3.5 font-mono text-[13px] leading-relaxed text-white">
      {children}
    </pre>
  ),
};

export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={componentes}>
      {children}
    </ReactMarkdown>
  );
}
