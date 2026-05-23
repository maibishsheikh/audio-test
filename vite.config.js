import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/courses/grade-2-math/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion') || id.includes('react-dom') || id.includes('react/')) {
              return 'vendor';
            }
          }
        },
      },
    },
  },
  server: {
    proxy: {
      '/api/elevenlabs': 'http://localhost:3001',
    },
  },
});
