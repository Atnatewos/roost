// apps/web/vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Vite configuration for ROOST frontend.
 * Configures the dev server proxy, build settings, and resolve aliases
 * for clean imports across the monorepo.
 */
export default defineConfig({
  plugins: [react()],

  // Resolve aliases for clean imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@roost/config': path.resolve(__dirname, '../../packages/config'),
    },
  },

  // Dev server configuration
  server: {
    port: parseInt(process.env.VITE_PORT || '5173', 10),

    // Proxy API requests to the backend during development
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV === 'development',
    // Code splitting for vendor libraries
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['axios'],
        },
      },
    },
  },
});