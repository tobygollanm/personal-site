import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Use '/' for local dev, '/personal-site/' for production builds (GitHub Pages)
  base: command === 'build' ? '/personal-site/' : '/',
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
