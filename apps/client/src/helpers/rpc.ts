import { createORPCClient, onError } from '@orpc/client';
import type { JsonifiedClient } from '@orpc/openapi-client';
import { contract } from '@openmario/server/contracts';
import type { ContractRouterClient } from '@orpc/contract';
import { OpenAPILink } from '@orpc/openapi-client/fetch';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';

const link = new OpenAPILink(contract, {
   url: `${window.location.origin}/api`,
   interceptors: [
      onError((error: unknown) => {
         // Ignore AbortError - it's expected when queries are cancelled during navigation
         if (error instanceof Error && error.name === 'AbortError') {
            return;
         }
         console.error('oRPC Error:', error);
      })
   ]
});

// Create a type-safe client using the contract
const openapiClient: JsonifiedClient<ContractRouterClient<typeof contract>> =
   createORPCClient(link);
export const orpc = createTanstackQueryUtils(openapiClient);

// Export types for convenience
export type { InferClientInputs, InferClientOutputs } from '@orpc/client';
