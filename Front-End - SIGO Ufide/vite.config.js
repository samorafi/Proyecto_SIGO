import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [{ find: "@", replacement: "/src" }],
  },
  server: {
    port: 5173, 
    proxy: {
      "/api": {
        target: "https://host.docker.internal:7287",
        changeOrigin: true,
        secure: false, 
      },
    },
  }
});
