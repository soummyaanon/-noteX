import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import commonjs from '@rollup/plugin-commonjs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    commonjs() // Add the CommonJS plugin to handle CommonJS modules
  ],
  build: {
    outDir: 'dist', // Ensure the output directory is set to 'dist'
    commonjsOptions: {
      include: [/node_modules/], // Include node_modules in the CommonJS options
    },
  },
  resolve: {
    alias: {
      '@': '/src', // Optional: Set up path alias for easier imports
    },
  },
  optimizeDeps: {
    include: ['long'], // Ensure 'long' is included in the dependency optimization
  }
});