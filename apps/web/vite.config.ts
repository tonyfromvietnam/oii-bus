import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig(({ mode }) => {
  // `--mode standalone`: một file HTML duy nhất, vào thẳng phố offline (prototype/staging tĩnh).
  const standalone = mode === "standalone";
  return {
    plugins: [react(), tailwindcss(), ...(standalone ? [viteSingleFile()] : [])],
    define: standalone ? { "import.meta.env.VITE_STANDALONE": JSON.stringify("true") } : {},
    server: {
      port: 5173,
      proxy: {
        // Dev: web gọi /api/* → Fastify. Prod: cùng domain qua reverse proxy hoặc VITE_API_URL.
        "/api": {
          target: "http://localhost:2567",
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api/, ""),
        },
      },
    },
    build: {
      target: "es2022",
      sourcemap: !standalone,
      outDir: standalone ? "dist-standalone" : "dist",
    },
  };
});
