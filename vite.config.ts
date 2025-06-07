import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import generouted from '@generouted/tanstack-react-router'
import path from 'path'

export default defineConfig({ 
  plugins: [react(), generouted()],
  resolve: {
    alias: {
      '@/components': path.resolve(__dirname, './src/components'),
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    allowedHosts: ['eventr.cmdpr.dev'],
  },
})
