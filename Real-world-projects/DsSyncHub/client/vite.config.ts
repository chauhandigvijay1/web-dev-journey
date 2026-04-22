import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes('node_modules')) {
            return undefined
          }

          const groups: Array<[string, string[]]> = [
            ['react-vendor', ['react', 'react-dom', 'react-router-dom']],
            ['state-vendor', ['@reduxjs/toolkit', 'react-redux']],
            ['forms-vendor', ['react-hook-form', '@hookform/resolvers', 'zod']],
            ['socket-vendor', ['socket.io-client']],
            ['icon-vendor', ['lucide-react']],
          ]

          for (const [chunkName, packages] of groups) {
            if (
              packages.some(
                (pkg) =>
                  id.includes(`/node_modules/${pkg}/`) || id.includes(`\\node_modules\\${pkg}\\`),
              )
            ) {
              return chunkName
            }
          }

          return 'vendor'
        },
      },
    },
  },
})
