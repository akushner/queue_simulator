import path from "node:path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [    react({
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
    }),],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/start': 'http://127.0.0.1:8000',
      '/stop': 'http://127.0.0.1:8000',
      '/reset': 'http://127.0.0.1:8000',
      '/config': 'http://127.0.0.1:8000',
      '/ws': {
        target: 'ws://127.0.0.1:8000',
        ws: true,
      },
    },
  },
})
