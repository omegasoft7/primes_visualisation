import { defineConfig } from 'vite';

export default defineConfig({
  base: '/primes_visualisation/',
  server: {
    port: 3000,
    open: true,
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
  },
  optimizeDeps: {
    exclude: ['prime-wasm'],
  },
});
