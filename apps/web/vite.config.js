import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
    plugins: [react()],
    esbuild: { drop: ["console", "debugger"] },
    build: {
        outDir: "dist",
        emptyOutDir: true,
    },
    server: {
        port: 5000,
        host: "0.0.0.0",
        allowedHosts: true,
    },
});
