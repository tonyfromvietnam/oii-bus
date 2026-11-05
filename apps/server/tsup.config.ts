import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node22",
  platform: "node",
  sourcemap: true,
  clean: true,
  // Gói workspace xuất thẳng TypeScript nguồn → bundle vào để chạy được bằng node.
  noExternal: [/^@oii-bus\//],
});
