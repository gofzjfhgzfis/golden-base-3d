import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so the built site works from any folder or sub-path (e.g. GitHub Pages).
  base: './',
  build: {
    target: 'es2020',
    // three.js is large by nature; the 3D scenes are already split into lazy chunks.
    chunkSizeWarningLimit: 900
  }
});
