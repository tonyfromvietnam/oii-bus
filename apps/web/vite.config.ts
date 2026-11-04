import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
  build: { target: "es2022", sourcemap: true },
});
