import { contracts } from '@/contracts';
import { OpenAPIGenerator } from '@orpc/openapi';
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4'; // <-- zod v4

export const specs = await new OpenAPIGenerator({
   schemaConverters: [new ZodToJsonSchemaConverter()]
}).generate(contracts, {
   info: {
      title: 'Openmario',
      version: '1.0.0'
   },
   servers: [
      { url: 'http://localhost:3000/api', description: 'Development server' },
      { url: '/api', description: 'Production (relative)' }
   ]
});
