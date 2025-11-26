import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';  // Official v4 plugin (your import works too)

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');  // Fixed: Use process.cwd() for consistency

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      tailwindcss({
        // Optional: Customize optimization (e.g., disable minify in dev for debugging)
        optimize: process.env.NODE_ENV === 'production' ? true : { minify: false },
      }),
    ],
    define: {
      // Your Gemini API env injection—correct!
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),  // Better: Points to src/ for @/components imports
      },
    },
    // Optional: Enforce Lightning CSS for v4's speed
    css: {
      transformer: 'lightningcss',
    },
  };
});