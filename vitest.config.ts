import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'graphify-out', 'design-previews-*'],
  },
  resolve: {
    alias: {
      // mirror tsconfig paths: "@/*" → project root
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
});
