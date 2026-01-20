import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/lib.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'dayjs'],
  // Copy CSS file to dist
  onSuccess: 'cp src/styles.css dist/styles.css',
});
