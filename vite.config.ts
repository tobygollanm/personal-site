import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Use '/' for local dev and production (custom domain serves from root)
  // If you need to support both custom domain and github.io/personal-site/, 
  // we'd need runtime detection, but custom domain should use '/'
  base: '/',
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
}))
