import type { NextConfig } from "next";

// No GitHub Pages o site fica em /<repositório>; o workflow informa o caminho em BASE_PATH.
const basePath = process.env.BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // Gera um site estático na pasta `out/` (GitHub Pages não executa servidor Node).
  output: "export",
  basePath,
  images: { unoptimized: true },
  // Ícone "N" do modo dev no canto direito: no esquerdo ele cobria o rodapé da barra lateral.
  devIndicators: { position: "bottom-right" },
  experimental: {
    agentFeedback: true,
  },
  // cacheComponents e partialPrefetching ficam desligados: dependem de renderização
  // parcial no servidor (PPR), que não existe em um site estático.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
