import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

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
    cssCodeSplit: true,
    target: 'esnext',
    chunkSizeWarningLimit: 500, // Increase the warning limit (in kB)
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Split node_modules into vendor chunk
          if (id.includes('node_modules')) {
            // Further split large libraries into separate chunks
            if (id.includes('three')) return 'vendor-three';
            if (id.includes('cytoscape')) return 'vendor-cytoscape';
            if (id.includes('react')) return 'vendor-react';
            // All other dependencies go into the general vendor chunk
            return 'vendor';
          }
        }
      }
    }
  }
})
