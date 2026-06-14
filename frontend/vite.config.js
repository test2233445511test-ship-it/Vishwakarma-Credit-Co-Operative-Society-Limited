import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@clerk/clerk-react': path.resolve(__dirname, './src/context/MockClerkProvider.jsx')
    }
  },
  server: {
    port: 5173
  }
})
