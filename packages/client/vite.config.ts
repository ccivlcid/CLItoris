import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 7878,
    strictPort: true, // 7878 사용 중이면 다른 포트로 넘어가지 않고 에러
    proxy: {
      "/api": {
        target: "http://localhost:3771",
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: "localhost",
      },
      "/uploads": {
        target: "http://localhost:3771",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
