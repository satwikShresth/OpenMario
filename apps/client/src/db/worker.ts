import { PGlite } from '@electric-sql/pglite';
import { worker } from '@electric-sql/pglite/worker';

worker({
   async init(options) {
      const client = new PGlite({
         dataDir: options.dataDir!
      });
      return client;
   }
});
