import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { migrate, db } from '@/db';
import { termsCollection } from '@/helpers';
import { terms } from '@/db/schema';

type MigrationStatus = 'pending' | 'initializing' | 'completed' | 'error';

interface MigrationContextType {
  status: MigrationStatus;
  error: Error | null;
}

const MigrationContext = createContext<MigrationContextType>({
  status: 'pending',
  error: null,
});

export const useMigration = () => useContext(MigrationContext);

interface MigrationProviderProps {
  children: ReactNode;
}

export function MigrationProvider({ children }: MigrationProviderProps) {
  const [status, setStatus] = useState<MigrationStatus>('pending');
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function performMigration(retryCount = 0): Promise<void> {
      if (!isMounted) return;

      try {
        setStatus('initializing');
        await migrate();

        if (!isMounted) return;

        await db
          .insert(terms)
          .values([
            { term: 'Spring', year: 2025, isActive: false },
            { term: 'Summer', year: 2025, isActive: false },
            { term: 'Fall', year: 2025, isActive: false },
            { term: 'Winter', year: 2025, isActive: false }
          ])
          .onConflictDoNothing();

        if (!isMounted) return;

        await termsCollection.preload();

        if (isMounted) {
          setStatus('completed');
        }
      } catch (err) {
        if (!isMounted) return;

        console.error('[PGlite] Migration failed:', err);

        if (retryCount < 1) {
          console.log('[PGlite] Clearing database and retrying...');

          try {
            // Clear the IndexedDB database
            const dbName = 'openmario-data';
            const deleteRequest = indexedDB.deleteDatabase(dbName);

            await new Promise((resolve, reject) => {
              deleteRequest.onsuccess = () => {
                console.log('[PGlite] Database cleared successfully');
                resolve(undefined);
              };
              deleteRequest.onerror = () => {
                reject(new Error('Failed to clear database'));
              };
              deleteRequest.onblocked = () => {
                console.warn('[PGlite] Database deletion blocked, forcing close...');
                // Force a page reload to close all connections
                window.location.reload();
              };
            });

            // Reload the page to reinitialize with fresh database
            window.location.reload();
          } catch (clearError) {
            console.error('[PGlite] Failed to clear database:', clearError);
            setError(err as Error);
            setStatus('error');
          }
        } else {
          setError(err as Error);
          setStatus('error');
        }
      }
    }

    // Start migration in background
    performMigration();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <MigrationContext.Provider value={{ status, error }}>
      {children}
    </MigrationContext.Provider>
  );
}

