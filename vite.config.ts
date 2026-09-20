import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// base './' → relative asset paths, so the build works from any GitHub Pages
// sub-path (https://<user>.github.io/<repo>/) without extra config.
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      // NEONDECK's barrel re-exports optional 3D components that import the
      // three.js peer deps. Stub them so the barrel resolves and the unused
      // 3D components are tree-shaken — keeps the bundle free of three.js.
      '@react-three/fiber': fileURLToPath(
        new URL('./src/stubs/react-three-fiber.ts', import.meta.url),
      ),
      '@react-three/drei': fileURLToPath(
        new URL('./src/stubs/react-three-drei.ts', import.meta.url),
      ),
    },
  },
  build: {
    target: 'es2020',
    // Keep the bundle lean for Pages hosting.
    cssCodeSplit: false,
    reportCompressedSize: false,
  },
});
