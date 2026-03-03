import { MeiliSearch, type Key } from 'meilisearch';
import { generateTenantToken } from 'meilisearch/token';

export type MeilisearchService = {
   client: MeiliSearch;
   getTenantToken: (tenantId?: string) => Promise<string>;
};

let _instance: MeilisearchService | undefined;

export async function createMeilisearchService(
   host: string,
   masterKey: string
): Promise<MeilisearchService> {
   if (_instance) return _instance;
   const client = new MeiliSearch({ host, apiKey: masterKey });

   let apiKey: Key | null = null;

   const getOrCreateApiKey = async (): Promise<Key> => {
      if (apiKey) return apiKey;

      apiKey = await client.createKey({
         description: 'Read-only API key for tenant tokens',
         actions: ['search', 'documents.get', 'indexes.get'],
         indexes: ['*'],
         expiresAt: null
      });

      return apiKey;
   };

   await getOrCreateApiKey();

   _instance = {
      client,
      getTenantToken: async (_tenantId = 'default') => {
         const key = await getOrCreateApiKey();

         const expiresAt = new Date();
         expiresAt.setMinutes(expiresAt.getMinutes() + 120);

         return generateTenantToken({
            apiKey: key.key,
            apiKeyUid: key.uid,
            expiresAt,
            searchRules: { '*': {} }
         });
      }
   };

   return _instance;
}
