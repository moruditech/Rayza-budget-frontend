import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  resolve: {
    // @budget-app/shared is not a real installed dependency: it's missing
    // from package.json, and there's no root package.json/workspaces
    // config to symlink packages/shared into node_modules. Netlify's
    // install also runs inside apps/web, so even a workspace link
    // wouldn't reach here. Point the bare specifier straight at the
    // package's ESM source instead of relying on module resolution.
    alias: {
      '@budget-app/shared': fileURLToPath(
        new URL('../../packages/shared/src/index.mjs', import.meta.url)
      ),
    },
  },

  server: {
    port: 5173,
    // Proxy /api calls to the Express backend so we avoid CORS in dev.
    // The Axios base URL (VITE_API_URL) still works without this, but the
    // proxy removes the need for the API to allow http://localhost:5173 in
    // development when the cookie flag is SameSite=Strict.
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
