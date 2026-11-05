import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig(({ mode }) => {
  // `--mode standalone`: một file HTML duy nhất, vào thẳng phố offline (prototype/staging tĩnh).
  // `--mode artifact`: như standalone nhưng JS/CSS là file riêng (app.js, app.css) — an toàn hơn khi
  // trang được nhúng vào khung HTML của nơi khác (script inline khổng lồ trong <body> bị trình duyệt làm hỏng).
  const artifact = mode === "artifact";
  const standalone = mode === "standalone" || artifact;
  return {
    plugins: [react(), tailwindcss(), ...(standalone && !artifact ? [viteSingleFile()] : [])],
    base: artifact ? "./" : "/",
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
      outDir: artifact ? "dist-artifact" : standalone ? "dist-standalone" : "dist",
      ...(artifact
        ? {
            rollupOptions: {
              output: { inlineDynamicImports: true, entryFileNames: "app.js", assetFileNames: "app.[ext]" },
            },
          }
        : {}),
    },
  };
});
