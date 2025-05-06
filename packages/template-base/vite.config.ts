import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'TemplateBase',
      fileName: 'index'
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@template-core'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@template-core': 'TemplateCore'
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});