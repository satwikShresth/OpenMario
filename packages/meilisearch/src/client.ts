import { MeiliSearch, type Key } from 'meilisearch';
import { generateTenantToken } from 'meilisearch/token';

export type MeilisearchService = {
   client: MeiliSearch;
   getTenantToken: (tenantId?: string) => Promise<string>;
};

export async function createMeilisearchService(
   host: string,
   masterKey: string
): Promise<MeilisearchService> {
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

   return {
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
}
