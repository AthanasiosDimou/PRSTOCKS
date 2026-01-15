import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Only enable host when --host flag is passed
  const enableHost = process.argv.includes('--host');
  
  return {
    plugins: [react()],
    
    server: {
      port: 3000,
      host: enableHost, // Only allow external connections when --host is specified
    },
    
    optimizeDeps: {
      include: ['sql.js'],
      exclude: []
    },

    assetsInclude: ['**/*.wasm'],

    build: {
      rollupOptions: {
        external: [],
        output: {
          manualChunks: {
            'sql.js': ['sql.js']
          }
        }
      },
      // Copy WASM files
      copyPublicDir: true
    },    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@shared": path.resolve(__dirname, "./src/shared"),
        "@features": path.resolve(__dirname, "./src/features"),
        "@components": path.resolve(__dirname, "./src/components"),
        "@pages": path.resolve(__dirname, "./src/pages"),
        "@utils": path.resolve(__dirname, "./src/utils"),
        "@types": path.resolve(__dirname, "./src/types")
      }
    }
  };
});
