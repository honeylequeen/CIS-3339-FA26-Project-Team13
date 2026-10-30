import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // '@' points to src/. fileURLToPath builds the path correctly on Windows, macOS and Linux.
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // Assets are loaded from the site root (/assets/...). Change this only if the
  // app is hosted in a sub-folder, e.g. base: '/dataplatform/'.
  base: '/'
})
