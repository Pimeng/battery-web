import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { changelogPlugin } from "./scripts/vite-plugin-changelog"

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), changelogPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
