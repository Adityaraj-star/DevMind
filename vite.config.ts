import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],

    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },

    build: {
        // Minimum JS syntax to target — modern browsers only, no IE polyfills
        target: 'es2020',

        // Generate source maps for production debugging.
        // They go in the dist folder alongside the bundles.
        sourcemap: true,

        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules/d3') || id.includes('node_modules/d3-')) {
                        return 'd3-vendor'
                    }

                    if (
                        id.includes('node_modules/react/') ||
                        id.includes('node_modules/react-dom/') ||
                        id.includes('node_modules/react-router') ||
                        id.includes('node_modules/scheduler/')
                    ) {
                        return 'react-vendor'
                    }

                    if (id.includes('node_modules/react-hook-form')) {
                        return 'form-vendor'
                    }
                },
            },
        },
    },
})
