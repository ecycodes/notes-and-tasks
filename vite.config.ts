import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // This maps "@/..." imports to "src/..." at build time.
      // It must mirror the "paths" entry in tsconfig.app.json.
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
