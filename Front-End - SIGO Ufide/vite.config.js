import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

const certKeyPath = path.resolve(__dirname, "certs/localhost+3-key.pem");
const certPath = path.resolve(__dirname, "certs/localhost+3.pem");
const certsExist = fs.existsSync(certKeyPath) && fs.existsSync(certPath);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [{ find: "@", replacement: "/src" }],
  },
  server: {
    host: "0.0.0.0",
    port: 5173,

    // HTTPS solo si existen los certificados locales (mkcert).
    // Los compañeros sin certs arrancarán en HTTP sin errores.
    ...(certsExist && {
      https: {
        key: fs.readFileSync(certKeyPath),
        cert: fs.readFileSync(certPath),
      },
    }),

    proxy: {
      "/api": {
        target: "https://127.0.0.1:7287",
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: "localhost",
      },
    },
  },
});