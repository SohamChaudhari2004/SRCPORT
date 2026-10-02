import { handleMcp } from "@/lib/mcp";
import { clientIp, createLimiter } from "@/lib/rateLimit";

// Read-only MCP server over Streamable HTTP (stateless, JSON responses). See src/lib/mcp.ts.

const limiter = createLimiter({ windowMs: 60_000, max: 60 });

const headers = { "Content-Type": "application/json", "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*" };

export async function POST(request: Request) {
  const wait = limiter.take(clientIp(request));
  if (wait) {
    return Response.json(
      { jsonrpc: "2.0", id: null, error: { code: -32000, message: "Rate limit exceeded" } },
      { status: 429, headers: { ...headers, "Retry-After": String(wait) } },
    );
  }

  const body = await request.json().catch(() => undefined);
  if (body === undefined) {
    return Response.json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }, { status: 400, headers });
  }

  const replies = (Array.isArray(body) ? body : [body]).map(handleMcp).filter((r) => r !== null);
  // Only notifications or responses: acknowledge with no body.
  if (!replies.length) return new Response(null, { status: 202, headers });
  return Response.json(Array.isArray(body) ? replies : replies[0], { headers });
}

// No server-initiated stream: this server never sends requests or notifications.
export function GET() {
  return new Response("This MCP server accepts POST requests only (Streamable HTTP, JSON responses).", {
    status: 405,
    headers: { Allow: "POST, OPTIONS", "Content-Type": "text/plain; charset=utf-8" },
  });
}

export function DELETE() {
  return new Response(null, { status: 405, headers: { Allow: "POST, OPTIONS" } });
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Protocol-Version, Mcp-Session-Id",
      "Access-Control-Max-Age": "86400",
    },
  });
}
