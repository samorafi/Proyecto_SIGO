import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [{ find: "@", replacement: "/src" }],
  },
  server: {
    host: "0.0.0.0",
    port: 5173,

    https: {
      key: fs.readFileSync(path.resolve(__dirname, "certs/localhost+3-key.pem")),
      cert: fs.readFileSync(path.resolve(__dirname, "certs/localhost+3.pem")),
    },

    proxy: {
      "/api": {
        target: "https://host.docker.internal:7287",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});