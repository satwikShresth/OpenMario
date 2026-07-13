import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { env } from '@env';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { createOpenMarioMcpServer } from './server';

const allowedHosts = env.MCP_ALLOWED_HOSTS.split(',')
   .map(h => h.trim())
   .filter(Boolean);

async function handleMcp(c: {
   req: { raw: Request };
}) {
   const server = createOpenMarioMcpServer();
   const transport = new WebStandardStreamableHTTPServerTransport({
      enableJsonResponse: true,
      allowedHosts,
      enableDnsRebindingProtection: env.NODE_ENV === 'production'
   });

   await server.connect(transport);

   try {
      return await transport.handleRequest(c.req.raw);
   } finally {
      await transport.close().catch(() => undefined);
      await server.close().catch(() => undefined);
   }
}

const app = new Hono({ strict: false })
   .use('*', logger())
   .use(
      '*',
      cors({
         origin: '*',
         allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
         allowHeaders: [
            'Content-Type',
            'Accept',
            'mcp-session-id',
            'Last-Event-ID',
            'Mcp-Protocol-Version'
         ],
         exposeHeaders: ['mcp-session-id']
      })
   )
   .get('/health', c =>
      c.json({
         status: 'ok',
         application: 'openmario-mcp',
         transport: 'streamable-http',
         endpoint: '/'
      })
   )
   // Primary endpoint is the host root; /mcp kept as a compatibility alias.
   .all('/', handleMcp)
   .all('/mcp', handleMcp);

export default {
   port: env.MCP_PORT,
   fetch: app.fetch
};

console.log(
   `OpenMario MCP listening on http://localhost:${env.MCP_PORT}/ (health: /health)`
);
