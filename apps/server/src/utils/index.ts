import { contract } from '@/contracts';
import { OpenAPIGenerator } from '@orpc/openapi';
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4'; // <-- zod v4

export const specs = await new OpenAPIGenerator({
   schemaConverters: [new ZodToJsonSchemaConverter()]
}).generate(contract, {
   info: {
      title: 'Openmario',
      version: '1.0.0'
   },
   servers: [{ url: '/api' } /** Should use absolute URLs in production */]
});
export * from './queryHelpers';
