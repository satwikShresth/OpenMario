import { generateTenantToken } from 'meilisearch/token';
import { type Key, MeiliSearch } from 'meilisearch';
import { env } from '@env';

class MeilisearchService {
   public client: MeiliSearch;
   private apiKey: Key | null = null;

   constructor(host: string | null, masterKey: string | null) {
      if (!host || !masterKey) {
         throw new Error('Host and master key must not be null');
      }
      this.client = new MeiliSearch({
         host,
         apiKey: masterKey
      });
      this.initialize();
   }

   public async initialize(): Promise<void> {
      if (this.apiKey) {
         return;
      }

      // Create a permanent read-only API key with access to all indexes
      this.apiKey = await this.client
         .createKey({
            description: 'Read-only API key for tenant tokens',
            actions: ['search', 'documents.get', 'indexes.get'],
            indexes: ['*'],
            expiresAt: null
         })
         .catch(error => {
            console.error('Failed to create read-only API key:', error);
            console.error('Failed to create read-only API key:', {
               error: error.message,
               name: error.name,
               status: error.status, // HTTP code if available
               body: error.body || 'No body' // Raw response if exposed
            });
            throw error;
         });

      console.log('Created read-only API key:', this.apiKey.key);
      console.log('Read-only API key UID:', this.apiKey.uid);
   }

   public async getTenantToken(
      tenantId: string = 'default'
   ): Promise<string | null> {
      if (!this.apiKey) {
         await this.initialize();
         if (!this.apiKey) {
            throw new Error('Failed to initialize API key');
         }
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getMinutes() + 120);

      return await generateTenantToken({
         apiKey: this.apiKey.key,
         apiKeyUid: this.apiKey.uid,
         expiresAt,
         searchRules: { '*': {} }
      }).catch(error => {
         console.error(
            `Failed to generate tenant token for ${tenantId}:`,
            error
         );
         return null;
      });
   }
}

export const meilisearchService = new MeilisearchService(
   env.MEILI_HOST,
   env.MEILI_MASTER_KEY
);

export default MeilisearchService;
