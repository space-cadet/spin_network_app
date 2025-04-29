import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    emptyOutDir: true,
    outDir: 'dist',
    assetsDir: 'assets',
    cssCodeSplit: true,
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari13'],
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three')) return 'vendor-three';
            if (id.includes('cytoscape')) return 'vendor-cytoscape';
            if (id.includes('react')) return 'vendor-react';
            return 'vendor';
          }
        }
      }
    },
    copyPublicDir: true,
    sourcemap: true
  }
});
