import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import rollupNodePolyFill from 'rollup-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  server: {
    // accept remote host access.
    allowedHosts: [
      "5173--main--code-cli--maou864--coder.vinoxm.cloud",
      "5173--main--code-cli--maou864--coder.vinoxm.art"
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  plugins: [
    vue(),
    vueDevTools(),
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
    outDir: '/mnt/data/.deploy/node-web/anime-view',
    rollupOptions: {
      plugins: [
        // Enable rollup polyfills plugin used during production bundling
        rollupNodePolyFill()
      ]
    }
  }
})
