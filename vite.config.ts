import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      host: true,
    },
    define: {
      "process.env": Object.fromEntries(
        Object.entries(env).filter(([key]) => key.startsWith("VITE_")),
      ),
    },
    build: {
      rollupOptions: {
        treeshake: false,
      },
    },
  };
});
