import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    host: true, // Listen on all local IP addresses to ensure external mobile access works too
    proxy: {
      '/api': {
        target: 'http://180.235.121.253:8087',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/uploads': {
        target: 'http://180.235.121.253:8087/visionstone/uploads',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/uploads/, ''),
      }
    }
  }
})
