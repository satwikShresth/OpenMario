import type { Plugin } from 'vite';
import { readMigrationFiles } from 'drizzle-orm/migrator';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

export function compileMigrations(): Plugin {
   return {
      name: 'compile-migrations',
      buildStart() {
         // Compile migrations at the start of build
         try {
            const migrations = readMigrationFiles({
               migrationsFolder: './src/db/drizzle/'
            });

            writeFileSync(
               join(process.cwd(), 'src/db/migrations.json'),
               JSON.stringify(migrations, null, 2),
               'utf-8'
            );

            console.log(
               '[vite-plugin] ✓ Migrations compiled to migrations.json'
            );
         } catch (error) {
            console.error(
               '[vite-plugin] ✗ Failed to compile migrations:',
               error
            );
            throw error;
         }
      },
      configureServer(server) {
         // Also compile on dev server start
         const compile = () => {
            try {
               const migrations = readMigrationFiles({
                  migrationsFolder: './src/db/drizzle/'
               });

               writeFileSync(
                  join(process.cwd(), 'src/db/migrations.json'),
                  JSON.stringify(migrations, null, 2),
                  'utf-8'
               );

               console.log('[vite-plugin] ✓ Migrations compiled');
            } catch (error) {
               console.error(
                  '[vite-plugin] ✗ Failed to compile migrations:',
                  error
               );
            }
         };

         // Compile on server start
         compile();

         // Watch for changes to migration files
         server.watcher.add('src/db/drizzle/*.sql');
         server.watcher.on('change', path => {
            if (path.includes('src/db/drizzle/') && path.endsWith('.sql')) {
               console.log(
                  '[vite-plugin] Migration file changed, recompiling...'
               );
               compile();
            }
         });
      }
   };
}
