import path from "path";
import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";

/** biar /admin (tanpa .html) kebuka juga pas `npm run dev` & `npm run preview` */
const adminRoute = (): Plugin => {
  const rewrite = (req: { url?: string }, _res: unknown, next: () => void) => {
    if (req.url && /^\/admin\/?(\?.*)?$/.test(req.url)) {
      req.url = req.url.replace(/^\/admin\/?/, "/admin.html");
    }
    next();
  };
  return {
    name: "admin-route",
    configureServer(server) {
      server.middlewares.use(rewrite);
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite);
    },
  };
};

export default defineConfig({
  plugins: [react(), adminRoute()],

  server: {
    port: 3000,
    host: "0.0.0.0",
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  // dua halaman: website utama + /admin.
  // Library Supabase cuma ikut ke bundle admin, jadi halaman utama tetap enteng.
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        admin: path.resolve(__dirname, "admin.html"),
      },
    },
  },
});
