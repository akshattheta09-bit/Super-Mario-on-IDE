import { defineConfig } from 'vite';
import phaser from 'vite-plugin-phaser';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [phaser()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      input: 'src/main.ts'
    }
  },
  server: {
    port: 3000,
    open: true
  }
});