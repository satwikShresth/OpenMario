import { MeiliSearch, type SearchParams } from 'meilisearch';
import {
   INDEX_NAMES,
   type IndexName,
   type SectionDocument,
   type ProfessorDocument,
   type CompanyDocument,
   type SubmissionDocument
} from '@openmario/meilisearch';
import { env } from '@env';

export type SearchMode = 'hybrid' | 'keyword' | 'semantic';

export type HybridSearchOptions = {
   q: string;
   filter?: string;
   limit?: number;
   offset?: number;
   sort?: string[];
   mode?: SearchMode;
};

let client: MeiliSearch | undefined;

export function getMeili(): MeiliSearch {
   if (!client) {
      client = new MeiliSearch({
         host: env.MEILI_HOST,
         apiKey: env.MEILI_MASTER_KEY
      });
   }
   return client;
}

function semanticRatio(mode: SearchMode = 'hybrid'): number {
   if (mode === 'keyword') return 0;
   if (mode === 'semantic') return 1;
   return 0.5;
}

function buildSearchParams(
   options: HybridSearchOptions,
   withHybrid: boolean
): SearchParams {
   const mode = options.mode ?? 'hybrid';
   const params: SearchParams = {
      limit: Math.min(
         options.limit ?? env.MCP_SEARCH_LIMIT,
         env.MCP_SEARCH_LIMIT
      ),
      offset: options.offset ?? 0
   };

   if (options.filter) params.filter = options.filter;
   if (options.sort) params.sort = options.sort;
   if (withHybrid) {
      params.hybrid = {
         embedder: 'default',
         semanticRatio: semanticRatio(mode)
      };
   }

   return params;
}

async function searchIndex<T extends Record<string, any>>(
   index: IndexName,
   options: HybridSearchOptions
) {
   const mode = options.mode ?? 'hybrid';

   try {
      return await getMeili()
         .index<T>(index)
         .search(options.q, buildSearchParams(options, mode !== 'keyword'));
   } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (/Blocked|Cloudflare|403|Unexpected identifier/i.test(message)) {
         throw new Error(
            `Meilisearch unreachable at ${env.MEILI_HOST} (${message}). Check network / WAF allowlist for the MCP host.`
         );
      }
      if (mode !== 'keyword' && /embedder|hybrid|vector/i.test(message)) {
         return await getMeili()
            .index<T>(index)
            .search(options.q, buildSearchParams(options, false));
      }
      throw error;
   }
}

export const searchSections = (opts: HybridSearchOptions) =>
   searchIndex<SectionDocument>(INDEX_NAMES.sections, opts);

export const searchProfessors = (opts: HybridSearchOptions) =>
   searchIndex<ProfessorDocument>(INDEX_NAMES.professors, opts);

export const searchCompanies = (opts: HybridSearchOptions) =>
   searchIndex<CompanyDocument>(INDEX_NAMES.companies, opts);

export const searchSubmissions = (opts: HybridSearchOptions) =>
   searchIndex<SubmissionDocument>(INDEX_NAMES.submissions, opts);
