/**
 * Layout raiz: <html>, <body>, fontes, CSS global, CSS do KaTeX e título da aba do navegador.
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";

// Fontes Geist (texto) e Geist Mono (números dos resultados), expostas como variáveis CSS.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Título e descrição da página (aba do navegador e buscadores).
export const metadata: Metadata = {
  title: "Calculadora de Estatística Aplicada",
  description: "Intervalos de confiança, tamanho da amostra, correlação de Pearson e regressão linear com resolução passo a passo.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      // O script abaixo pode adicionar a classe "dark" antes do React carregar; isto evita o aviso.
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Aplica o tema salvo antes da renderização, evitando o "piscar" de cor */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
