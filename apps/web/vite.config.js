import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  // Force Vite's esbuild pre-bundler to process @budget-app/shared.
  // Without this, Vite may skip the workspace symlink and fail to resolve
  // the CJS exports when the web app imports them as ESM.
  optimizeDeps: {
    include: ['@budget-app/shared'],
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
