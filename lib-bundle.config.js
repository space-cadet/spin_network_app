import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'lib/index.ts'),
      name: 'SpinNetwork',
      formats: ['es', 'umd'],
      fileName: (format) => `spin-network.${format}.js`
    },
    outDir: 'dist/lib',
    emptyOutDir: false,  // Don't empty dist directory
    sourcemap: true,
    rollupOptions: {
      external: ['mathjs'],
      output: {
        globals: {
          mathjs: 'math'
        },
        exports: 'named',
        format: 'umd',
        inlineDynamicImports: true
      }
    },
    minify: false
  }
});