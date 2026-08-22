import { createEnv } from '@t3-oss/env-core';
import { config } from '@dotenvx/dotenvx';
import { join, dirname } from 'node:path';
import { z } from 'zod';

config({ path: join(dirname(dirname(__dirname)), '.env'), quiet: true });

export const env = createEnv({
   server: {
      PORT: z.coerce.number().optional().default(3001),
      NODE_ENV: z
         .enum(['development', 'staging', 'production'])
         .default('development'),
      DATABASE_URL: z.url(),
      MEILI_HOST: z.url(),
      MEILI_MASTER_KEY: z.string(),
      BETTER_AUTH_SECRET: z.string(),
      BETTER_AUTH_BASE_URL: z.url(),
      /** Comma-separated list of allowed CORS origins */
      CORS_ORIGINS: z
         .string()
         .optional()
         .default(
            'http://localhost:5173,http://localhost:3001,https://openmario.com,https://www.openmario.com,https://staging.openmario.com'
         )
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
   onInvalidAccess: _ => {
      throw new Error(
         '❌ Attempted to access a server-side environment variable on the client'
      );
   }
});
