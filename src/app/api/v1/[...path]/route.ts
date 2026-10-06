import { handleApiGet, methodNotAllowed, type ApiResult } from "@/lib/publicApi";

// Public read-only API. Endpoints and schemas: src/lib/openapi.ts, served at /openapi.json.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
};

const send = ({ status, body }: ApiResult) =>
  Response.json(body, {
    status,
    headers: {
      ...CORS,
      "Cache-Control": status === 200 ? "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400" : "no-store",
    },
  });

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(request: Request, { params }: Ctx) {
  const { path } = await params;
  return send(handleApiGet(path, new URL(request.url).searchParams));
}

const notAllowed = (request: Request) => {
  const res = send(methodNotAllowed(request.method));
  res.headers.set("Allow", "GET, OPTIONS");
  return res;
};

export { notAllowed as POST, notAllowed as PUT, notAllowed as PATCH, notAllowed as DELETE };

export function OPTIONS() {
  return new Response(null, { status: 204, headers: { ...CORS, "Access-Control-Max-Age": "86400" } });
}
