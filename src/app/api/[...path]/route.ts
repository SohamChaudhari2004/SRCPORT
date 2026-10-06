import { unknownRoute } from "@/lib/publicApi";

// Any /api path without its own route gets a JSON 404 instead of an HTML page.

type Ctx = { params: Promise<{ path: string[] }> };

async function handler(_request: Request, { params }: Ctx) {
  const { path } = await params;
  const { status, body } = unknownRoute(path);
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*" } });
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
