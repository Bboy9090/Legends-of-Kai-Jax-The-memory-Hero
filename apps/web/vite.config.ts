import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  base: "/game/",
  resolve: {
    extensions: [".mjs", ".js", ".mts", ".ts", ".jsx", ".tsx", ".json"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@beast-kin/engine": path.resolve(__dirname, "../../packages/engine/src"),
      "@beast-kin/characters": path.resolve(__dirname, "../../packages/characters/src"),
      "@beast-kin/shared": path.resolve(__dirname, "../../packages/shared/src"),
    },
  },
  server: {
    port: 5000,
    host: "0.0.0.0",
    allowedHosts: true,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, "index.html"),
        combat: path.resolve(__dirname, "combat-demo.html"),
        mission: path.resolve(__dirname, "mission-demo.html"),
        ashblock: path.resolve(__dirname, "ashblock-slice.html"),
      },
    },
  },
  assetsInclude: ["**/*.gltf", "**/*.glb", "**/*.mp3", "**/*.ogg", "**/*.wav"],
});
