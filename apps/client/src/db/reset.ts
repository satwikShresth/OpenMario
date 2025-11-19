/**
 * Database Reset Utility
 *
 * Use this to clear the PGlite database when you need a fresh start.
 * This is useful during development when migrations get out of sync.
 *
 * Usage: Call resetDatabase() from browser console or import in your app
 */

export async function resetDatabase() {
   const dbName = 'idb://openmario-data';
   const dbNameStripped = dbName.replace('idb://', '');

   console.log('[PGlite Reset] Clearing database:', dbNameStripped);

   try {
      // Delete the IndexedDB database
      await new Promise<void>((resolve, reject) => {
         const request = indexedDB.deleteDatabase(dbNameStripped);

         request.onsuccess = () => {
            console.log('[PGlite Reset] ✓ Database cleared successfully');
            resolve();
         };

         request.onerror = () => {
            console.error('[PGlite Reset] ✗ Failed to clear database');
            reject(request.error);
         };

         request.onblocked = () => {
            console.warn(
               '[PGlite Reset] ! Database deletion blocked. Close all tabs using this database.'
            );
         };
      });

      console.log(
         '[PGlite Reset] Please refresh the page to reinitialize the database.'
      );
      return true;
   } catch (error) {
      console.error('[PGlite Reset] Error:', error);
      return false;
   }
}

// Make it available globally in development
if (import.meta.env.DEV) {
   (window as any).resetDatabase = resetDatabase;
   console.log(
      '[PGlite] Reset utility loaded. Call resetDatabase() to clear the database.'
   );
}
