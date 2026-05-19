/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  optimizeDeps: {
    include: [
      '@justreadcomics/common',
      '@justreadcomics/common/dist/const',
      '@justreadcomics/common/dist/types/queue',
      '@justreadcomics/common/dist/types/series',
      '@justreadcomics/common/dist/types/services',
    ],
  },
  build: {
    commonjsOptions: {
      include: [/@justreadcomics\/common/, /node_modules/],
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/index.tsx',
        'src/setupTests.ts',
        'src/__tests__/**',
      ],
    },
  },
});
