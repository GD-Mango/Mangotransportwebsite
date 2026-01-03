import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true, // Expose to network for mobile testing
  },
  build: {
    // Generate source maps for production debugging
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React - changes rarely, cache long
          'vendor-react': ['react', 'react-dom'],
          // UI library components - moderate change frequency
          'vendor-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-popover',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-switch',
            '@radix-ui/react-tooltip',
          ],
          // Heavy charting library - load separately
          'vendor-charts': ['recharts'],
          // PDF generation - only needed when printing
          'vendor-pdf': ['jspdf', 'html2canvas'],
          // Date utilities
          'vendor-date': ['date-fns'],
          // State management
          'vendor-state': ['zustand'],
        },
      },
    },
    // Enable modulepreload polyfill for older browsers
    modulePreload: {
      polyfill: true,
    },
  },
})
