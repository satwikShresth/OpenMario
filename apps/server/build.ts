import { build } from 'bun';
import { join } from 'node:path';

const result = await build({
   entrypoints: [join(__dirname, 'src', 'index.ts')],
   outdir: join(__dirname, 'dist'),
   target: 'bun',
   format: 'esm',
   minify: true,
   packages: 'bundle',
   env: 'disable',
   drop: ['debugger'],
   sourcemap: true
});

if (!result.success) {
   console.error('Build failed');
   for (const log of result.logs) {
      console.error(log);
   }
   process.exit(1);
}

console.log('Build successful:');
for (const output of result.outputs) {
   const size = (output.size / 1024).toFixed(2);
   console.log(`  ${output.path} (${size} KB)`);
}
