import { createEnv } from '@t3-oss/env-core';
import { config } from '@dotenvx/dotenvx';
import { join, dirname } from 'node:path';
import { z } from 'zod';

config({ path: join(dirname(dirname(__dirname)), '.env') });

export const env = createEnv({
   server: {
      DATABASE_URL: z.url()
   },
   clientPrefix: 'VITE_',
   client: {},
   runtimeEnv: process.env,
   emptyStringAsUndefined: true,
   skipValidation: process.env.SKIP_ENV_VALIDATION === 'true',
   onValidationError: issues => {
      const errorDetails = issues
         .map(issue => `  • ${issue.path?.join('.') ?? '?'}: ${issue.message}`)
         .join('\n');

      throw new Error(`Invalid environment variables:\n${errorDetails}`);
   },
   onInvalidAccess: _ => {
      throw new Error(
         '❌ Attempted to access a server-side environment variable on the client'
      );
   }
});
