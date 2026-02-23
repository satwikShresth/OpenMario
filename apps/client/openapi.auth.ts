import { createClient } from '@hey-api/openapi-ts';

createClient({
   input: {
      path: 'http://localhost:5173/api/auth/open-api/generate-schema',
      watch: true
   }, // sign up at app.heyapi.dev
   output: {
      path: 'src/clients/auth',
      postProcess: [
         {
            command: 'bun',
            args: ['fmt']
         }
      ]
   },
   plugins: [
      {
         name: '@hey-api/sdk'
      },
      {
         name: '@hey-api/client-fetch',
         runtimeConfigPath: '@/clients/auth.config.ts'
      },
      'zod'
   ]
});
