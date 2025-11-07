// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   base: '/msucre-frontend/', // GitHub Pages base path
//   server: {
//     port: 3000,
//     proxy: {
//       '/api': {
//         target: 'http://localhost:5000',
//         changeOrigin: true
//       }
//     }
//   }
// });

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages configuration (default)
export default defineConfig({
  plugins: [react()],
  base: '/msucre-frontend/', // GitHub Pages base path
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

