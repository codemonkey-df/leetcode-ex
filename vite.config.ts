import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
    },
  },
  define: {
    'import.meta.env': {
      VITE_LLM_API_BASE: JSON.stringify(process.env.VITE_LLM_API_BASE || 'http://192.168.1.201:7654/v1'),
      VITE_LLM_API_KEY: JSON.stringify(process.env.VITE_LLM_API_KEY || 'lxc-pretbc'),
      VITE_LLM_MODEL: JSON.stringify(process.env.VITE_LLM_MODEL || 'openai/gemma-3n')
    }
  }
});
