import { createORPCClient, onError } from '@orpc/client';
import { contracts } from '@openmario/contracts';
import type { ContractRouterClient } from '@orpc/contract';
import { OpenAPILink } from '@orpc/openapi-client/fetch';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';
import { env } from '@env';

const link = new OpenAPILink(contracts, {
   url: env.VITE_SERVER_URL,
   interceptors: [
      onError(error => {
         if (error instanceof Error && error.name === 'AbortError') {
            return;
         }
         console.error('oRPC Error:', error);
      })
   ]
});

const openapiClient: ContractRouterClient<typeof contracts> =
   createORPCClient(link);
export const orpc = createTanstackQueryUtils(openapiClient);

// Export types for convenience
export type { InferClientInputs, InferClientOutputs } from '@orpc/client';
