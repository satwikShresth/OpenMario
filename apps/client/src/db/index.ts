import { PGliteWorker } from '@electric-sql/pglite/worker';
import * as schema from './schema';
import { live } from '@electric-sql/pglite/live';
import { drizzle } from 'drizzle-orm/pglite';
import type { MigrationConfig } from 'drizzle-orm/migrator';
import migrations from './migrations.json';

if (import.meta.env.DEV) {
   import('./reset');
}

export const client = await PGliteWorker.create(
   new Worker(new URL('./worker.ts', import.meta.url), {
      type: 'module'
   }),
   {
      dataDir: 'idb://openmario-data',
      extensions: { live }
   }
);

export const db = drizzle({ client: client as any, schema });

// @ts-expect-error - dialect and session exist but aren't in public types
await db.dialect
   // @ts-expect-error - dialect and session exist but aren't in public types
   .migrate(migrations, db.session, {
      migrationsTable: '__drizzle_migrations'
   } satisfies Omit<MigrationConfig, 'migrationsFolder'>)
   .then(() =>
      console.log('[PGlite] ✓ Database migrations applied successfully')
   )
   .catch((error: any) => {
      console.error('[PGlite] ✗ Migration failed:', error);
      throw error;
   });
