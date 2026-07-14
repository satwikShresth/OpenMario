# OpenMario MCP Server

Remote Model Context Protocol server for AI clients (Cursor, Claude, ChatGPT, etc.) at **`https://mcp.openmario.com`**.

**Install UI:** [https://openmario.com/mcp](https://openmario.com/mcp)  
**Agent index:** [https://openmario.com/llms.txt](https://openmario.com/llms.txt) (also `/llm.txt`)

## What it exposes

| Kind | Capabilities |
|------|----------------|
| **Tools (read)** | Hybrid search + detail for sections, professors, companies, salaries, reviews, autocomplete; plan-of-study + salary-report link generate/decode; form/plan guides |
| **Tools (write)** | None — MCP only generates clickable links; users confirm plans/salaries on the website |
| **HTTP (no MCP session)** | `POST /api/salary/report-link` — same encode as `generate_salary_report_link` |
| **Resources** | `openmario://docs/*`, `openmario://course/{id}`, `professor/{id}`, `company/{id}` |
| **Prompts** | `compare-companies`, `plan-course-path`, `find-coop-by-budget`, `career-elective-advice`, `build-plan-of-study`, `report-salaries` |

**Hono** + Bun (`export default { fetch }`) + MCP SDK `WebStandardStreamableHTTPServerTransport` (same pattern as the SDK’s Hono example).

## Local dev

```bash
# from repo root (requires DATABASE_URL, MEILI_HOST, MEILI_MASTER_KEY in .env)
bun run mcp:dev
```

### Production-style build

```bash
bun run mcp:build
bun run mcp:start   # runs apps/mcp/dist/index.js
```

Health: `http://localhost:3100/health`  
MCP: `http://localhost:3100/`  
Encode API: `POST http://localhost:3100/api/salary/report-link`

### Cursor remote MCP config

```json
{
  "mcpServers": {
    "openmario": {
      "url": "http://localhost:3100"
    }
  }
}
```

Production:

```json
{
  "mcpServers": {
    "openmario": {
      "url": "https://mcp.openmario.com"
    }
  }
}
```

## Hybrid / semantic search

Search tools default to Meilisearch **hybrid** mode. Configure embedders once:

```bash
# requires OPENAI_API_KEY
bun run meili:configure-embedders
```

Without embedders, tools automatically fall back to keyword search.

## Deploy notes

1. Run `apps/mcp` as its own process (Compose service recommended).
2. Point DNS `mcp.openmario.com` at your reverse proxy.
3. Proxy HTTPS → `http://mcp:3100` (MCP at `/`, encode API at `/api/salary/report-link`, plus `/health`).
4. Set `MCP_ALLOWED_HOSTS=mcp.openmario.com` and `NODE_ENV=production`.

Example Caddy snippet:

```
mcp.openmario.com {
  reverse_proxy mcp:3100
}
```

## Smoke test

```bash
bunx @modelcontextprotocol/inspector http://localhost:3100
```
