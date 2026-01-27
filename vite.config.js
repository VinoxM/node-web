import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import rollupNodePolyFill from 'rollup-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  server: {
    // accept remote host access.
    host: true,
    allowedHosts: true
  },
  plugins: [
    vue()
  ],
  define: {
    // global: {}
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      events: 'rollup-plugin-node-polyfills/polyfills/events',
      buffer: 'rollup-plugin-node-polyfills/polyfills/buffer-es6'
    },
  },
  build: {
    outDir: '/mnt/data/.deploy/node-web/anime-edit',
    rollupOptions: {
      plugins: [
        // Enable rollup polyfills plugin used during production bundling
        rollupNodePolyFill()
      ]
    }
  }
})
