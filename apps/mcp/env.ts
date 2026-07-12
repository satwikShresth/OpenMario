import { createEnv } from '@t3-oss/env-core';
import { config } from '@dotenvx/dotenvx';
import { join, dirname } from 'node:path';
import { z } from 'zod';

config({ path: join(dirname(dirname(__dirname)), '.env'), quiet: true });

export const env = createEnv({
   server: {
      MCP_PORT: z.coerce.number().optional().default(3100),
      NODE_ENV: z
         .enum(['development', 'staging', 'production'])
         .default('development'),
      DATABASE_URL: z.url(),
      MEILI_HOST: z.url(),
      MEILI_MASTER_KEY: z.string(),
      /** When set, hybrid search uses OpenAI embeddings via Meilisearch embedders */
      OPENAI_API_KEY: z.string().optional(),
      MCP_ALLOWED_HOSTS: z
         .string()
         .optional()
         .default('localhost,127.0.0.1,mcp.openmario.com'),
      MCP_MAX_IMAGE_BYTES: z.coerce.number().optional().default(8_000_000),
      MCP_SEARCH_LIMIT: z.coerce.number().optional().default(20)
   },
   clientPrefix: 'VITE_',
   client: {},
   runtimeEnv: process.env,
   emptyStringAsUndefined: true,
   skipValidation: process.env.SKIP_ENV_VALIDATION === 'true',
   onValidationError: issues => {
      const errorDetails = issues
         .map(issue => `  • ${issue?.path!.join('.')}: ${issue.message}`)
         .join('\n');
      throw new Error(`Invalid environment variables:\n${errorDetails}`);
   },
   onInvalidAccess: () => {
      throw new Error(
         'Attempted to access a server-side environment variable on the client'
      );
   }
});
