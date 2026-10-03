import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  // One .env at the repository root for the API and the site: VITE_* values there (VITE_ENABLED_LOCALES,
  // VITE_GA_ID) reach the build, in development and in deploy/install.sh alike.
  envDir: fileURLToPath(new URL('../..', import.meta.url)),
  plugins: [tailwindcss(), reactRouter()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: { proxy: { '/api': 'http://127.0.0.1:3000', '/media': 'http://127.0.0.1:3000', '/feed': 'http://127.0.0.1:3000' } },
});
