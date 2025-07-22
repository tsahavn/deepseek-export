import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    minify: false,
    rollupOptions: {
      input: {
        'content': resolve(__dirname, 'src/content/content.ts'),
        'background': resolve(__dirname, 'src/background/background.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'background' ? '[name].js' : 'content/[name].js';
        },
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
});