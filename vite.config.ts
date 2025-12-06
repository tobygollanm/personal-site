import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/personal-site/', // Base path for GitHub Pages (matches repo name)
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild', // Faster default minifier
  },
  assetsInclude: ['**/*.mp4', '**/*.jpg', '**/*.png'],
})
