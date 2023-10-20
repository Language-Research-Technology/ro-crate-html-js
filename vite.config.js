import {fileURLToPath, URL} from 'node:url'

/// <reference types="vitest" />
import {defineConfig} from 'vite'
import {createHtmlPlugin} from 'vite-plugin-html'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import path from "path-browserify";

// https://vitejs.dev/config/
export default defineConfig(({mode}) => ({
  plugins: [
    // createHtmlPlugin({minify: true, entry: 'lib/entry.js'}),
    AutoImport({resolvers: []}),
    Components({resolvers: []}),
  ],
  server: {
    watch: {
      usePolling: true,
    }
  },
  optimizeDeps: {
    include: []
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./lib', import.meta.url)),
      path: "path-browserify", //TESTING THIS NOT SURE IF ITS A GOOD IDEA
    }
  },
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
  base: './',
  build: {
    rollupOptions: {
      output: {
        dir: './dist/',
        entryFileNames: 'ro-crate-dynamic.min.js',
        assetFileNames: 'plugin.css',
        chunkFileNames: "ro-crate-dynamic-chunks.js",
        manualChunks: undefined,
      }
    },
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    deps: {
      inline: []
    }
  }
}))
;
