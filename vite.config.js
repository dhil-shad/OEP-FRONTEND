import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// User activity update

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false, // fallback to another port if 5173 is busy? Or strictPort: true if the user really wants it ONLY on 5173. Let's use strictPort: false but define port 5173.
  }
})
