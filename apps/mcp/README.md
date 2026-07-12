# OpenMario MCP Server

Remote Model Context Protocol server for AI clients (Cursor, Claude, etc.) at **`https://mcp.openmario.com/mcp`**.

**Install UI:** [https://openmario.com/mcp](https://openmario.com/mcp)  
**Agent index:** [https://openmario.com/llms.txt](https://openmario.com/llms.txt) (also `/llm.txt`)

## What it exposes

| Kind | Capabilities |
|------|----------------|
| **Tools (read)** | Hybrid search + detail for sections, professors, companies, salaries, reviews, autocomplete |
| **Tools (write)** | Salary submit **only** via DrexelOne rankings/offers screenshot OCR |
| **Resources** | `openmario://docs/*`, `openmario://course/{id}`, `professor/{id}`, `company/{id}` |
| **Prompts** | `compare-companies`, `plan-course-path`, `find-coop-by-budget`, `career-elective-advice`, `submit-salary-from-screenshot` — all require OpenMario markdown links for entities |

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
MCP: `http://localhost:3100/mcp`

### Cursor remote MCP config

```json
{
  "mcpServers": {
    "openmario": {
      "url": "http://localhost:3100/mcp"
    }
  }
}
```

Production:

```json
{
  "mcpServers": {
    "openmario": {
      "url": "https://mcp.openmario.com/mcp"
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

## Salary write gate

1. `parse_offers_screenshot` — base64 PNG/JPEG/WebP of DrexelOne rankings/offers + coop context  
2. `submit_salaries_from_offers` — `parse_token` (or same screenshot again)

Free-form salary create is intentionally not exposed.

## Deploy notes

1. Run `apps/mcp` as its own process (Compose service recommended).
2. Point DNS `mcp.openmario.com` at your reverse proxy.
3. Proxy HTTPS → `http://mcp:3100` (path `/mcp` and `/health`).
4. Set `MCP_ALLOWED_HOSTS=mcp.openmario.com` and `NODE_ENV=production`.

Example Caddy snippet:

```
mcp.openmario.com {
  reverse_proxy mcp:3100
}
```

## Smoke test

```bash
bunx @modelcontextprotocol/inspector http://localhost:3100/mcp
```
