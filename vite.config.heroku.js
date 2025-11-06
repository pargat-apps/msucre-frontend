import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Heroku Configuration - Use this for Heroku deployment
export default defineConfig({
  plugins: [react()],
  base: '/', // Root path for Heroku
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        }
      }
    }
  }
});

