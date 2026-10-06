import { openApiDocument } from "@/lib/openapi";
import { seo } from "@/data/seo";
import { servicesUrl } from "@/data/services";

// OpenAPI 3.1 document for the public API. The host that serves it is listed first in `servers`.
export function GET(request: Request) {
  const host = request.headers.get("host") ?? "";
  const primary = host.startsWith("services.") ? servicesUrl : seo.url;
  return Response.json(openApiDocument(primary), {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=300, s-maxage=3600",
    },
  });
}
