import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': { target: process.env.VITE_PROXY_TARGET || 'http://127.0.0.1:5000', changeOrigin: true },
    },
  },
  resolve: {
    alias: {
      react: path.resolve('node_modules/react'),
      'react-dom': path.resolve('node_modules/react-dom'),
      'react/jsx-runtime': path.resolve('node_modules/react/jsx-runtime'),
      'react-dom/client': path.resolve('node_modules/react-dom/client'),
    },
  },
})
