Spark CS – Claude Backend

This is a minimal Express backend that safely proxies requests to Claude (Anthropic) so your API key never touches the client.

Setup
1) In this folder, copy .env.example to .env and set ANTHROPIC_API_KEY.
2) Install deps: npm i
3) Run dev server: npm run dev (defaults to http://localhost:8787)

Security notes
- Never commit .env. The key is read server-side only.
- CORS is restricted to http://localhost:5173 by default. Override with CORS_ORIGIN in .env.
- This server validates incoming payloads with Zod to limit surface area.

API
POST /api/claude/chat
Body JSON:
{
  "model": "claude-3-5-sonnet-latest",     // optional, default used if omitted
  "messages": [ { "role": "user", "content": "Hello" } ],
  "max_tokens": 1024,                      // optional
  "system": "You are a helpful assistant"  // optional
}

Response: { id, model, content, usage }

Health
GET /health -> { ok: true }
