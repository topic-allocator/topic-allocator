import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/app',
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:7071/',
      },
    },
  },
  resolve: {
    alias: {
      '@api': path.resolve(__dirname, '../server/src/handlers/api'),
      '@': path.resolve(__dirname, './src'),
      '@server': path.resolve(__dirname, '../server/src'),
    },
  },
});
