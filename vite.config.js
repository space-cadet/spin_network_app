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
    emptyOutDir: false,  // Changed to false to preserve existing files
    outDir: 'dist',
    assetsDir: 'assets',
    cssCodeSplit: true,
    
    // Browser compatibility targets
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari13'],
    
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 500,
    
    // Enable source maps for debugging
    sourcemap: true,
    
    // Copy public directory contents
    copyPublicDir: true,
    
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      },
      output: {
        // Chunk splitting configuration
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('three')) return 'vendor-three';
            if (id.includes('cytoscape')) return 'vendor-cytoscape';
            if (id.includes('react')) return 'vendor-react';
            return 'vendor';
          }
        }
      }
    }
  }
});