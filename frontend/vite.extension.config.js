import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Separate build target for the Chrome extension popup — a small React
// app that reuses this project's existing dependencies (React, Tailwind,
// Framer Motion, Lucide) but builds to its own output folder so it can
// be loaded directly as an unpacked extension.
export default defineConfig({
  root: "extension-src",
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "../extension",
    emptyOutDir: false,
    rollupOptions: {
      input: "popup.html",
    },
  },
});
