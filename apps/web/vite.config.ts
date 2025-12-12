import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import glsl from "vite-plugin-glsl";

export default defineConfig({
  plugins: [
    react(),
    glsl(), // Add GLSL shader support
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@smash-heroes/engine": path.resolve(__dirname, "../../packages/engine/src"),
      "@smash-heroes/characters": path.resolve(__dirname, "../../packages/characters/src"),
      "@smash-heroes/shared": path.resolve(__dirname, "../../packages/shared/src"),
      "@smash-heroes/ui": path.resolve(__dirname, "../../packages/ui/src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  // Add support for large models and audio files
  assetsInclude: ["**/*.gltf", "**/*.glb", "**/*.mp3", "**/*.ogg", "**/*.wav"],
});
