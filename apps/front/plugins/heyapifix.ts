import { resolve } from 'node:path';
import process from 'node:process';
import { existsSync, mkdirSync } from 'node:fs';
import { readdir, rename, rm } from 'node:fs/promises';
import type { Plugin } from 'vite';

interface MoveConfig {
   src: string;
   dest: string;
}

/**
 * Vite plugin to move files from source to destination directories
 * Only runs during development mode
 */
export function FixDir(config: MoveConfig[] = []): Plugin {
   const defaultConfig: MoveConfig[] = [
      { src: './src/client/client/fetch', dest: './src/client/client' },
      { src: './src/client/core/core', dest: './src/client/core' },
   ];

   const moves = config.length ? config : defaultConfig;

   const moveFiles = async (): Promise<void> => {
      await Promise.all(
         moves.map(async ({ src, dest }) => {
            const srcDir = resolve(process.cwd(), src);
            const destDir = resolve(process.cwd(), dest);

            if (!existsSync(srcDir)) return Promise.resolve();

            existsSync(destDir) || mkdirSync(destDir, { recursive: true });

            return await readdir(srcDir)
               .then((files) => files.filter(Boolean))
               .then((files) =>
                  Promise.all(
                     files.map(async (file) => {
                        const srcPath = resolve(srcDir, file);
                        const destPath = resolve(destDir, file);
                        return await (
                           existsSync(destPath) ? rm(destPath) : Promise.resolve()
                        )
                           .then(() => rename(srcPath, destPath))
                           .then(() => console.log(`[DEV] Moved: ${file} (${src} → ${dest})`));
                     }),
                  )
               )
               .then(() => rm(srcDir, { recursive: true }))
               .then(() => console.log(`[DEV] Cleaned up ${src}`))
               .catch((error) => console.error(`[DEV] Error moving files from ${src}:`, error));
         }),
      );
   };

   return {
      name: 'heyapi-fix',
      apply: 'serve' as const,
      buildStart: moveFiles,
      handleHotUpdate: (ctx) => {
         if (moves.some(({ src }) => ctx.file.includes(src.replace('./', '')))) {
            setTimeout(moveFiles, 100);
         }
      },
   };
}
