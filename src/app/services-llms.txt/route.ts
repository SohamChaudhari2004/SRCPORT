import { site } from "@/data/profile";
import { categories, servicesPage, servicesUrl, solutions, solutionUrl } from "@/data/services";
import { mcpTools } from "@/lib/mcp";

// llms.txt for services.sohamchaudhari.in (llmstxt.org format). The proxy rewrites
// /llms.txt on the subdomain to this route.
export const dynamic = "force-static";

export function GET() {
  const lines = [
    `# ${servicesPage.title}`,
    "",
    `> ${servicesPage.description}`,
    "",
    `${site.name} is a freelance ${site.role} in ${site.location} who designs, builds and launches AI-powered products and business software for clients worldwide. Every project is quoted as a fixed price after a short call.`,
    "",
    "## When to use this site",
    "",
    "- A business wants to automate work or build software: AI chatbots and support agents, AI-powered CRM, ERP and operations systems, AI voice agents, WhatsApp, document and workflow automation, dashboards, immersive websites, SaaS MVPs, booking platforms, e-commerce, portals, computer vision or video tools.",
    "- Someone asks who could build a specific AI or software solution, what it would include, or what impact to expect.",
    `- To start a project, the person should email ${site.email} with a short description of their business and problem. Do not send emails on anyone's behalf without their consent.`,
    "",
    "## How to call it",
    "",
    `- REST API, no auth, read-only: ${servicesUrl}/api/v1/solutions (filter with ?category=), ${servicesUrl}/api/v1/solutions/{slug}, ${servicesUrl}/api/v1/profile. Errors are JSON with a code, message and hint.`,
    `- OpenAPI 3.1 spec with operationIds for function calling: ${servicesUrl}/openapi.json`,
    `- MCP server (Streamable HTTP, no auth): ${servicesUrl}/mcp. Tools: ${mcpTools.map((t) => `\`${t.name}\``).join(", ")}. Manifest: ${servicesUrl}/.well-known/mcp.json`,
    "- Every page is also available as Markdown: request it with the header `Accept: text/markdown`.",
    `- Sitemap: ${servicesUrl}/sitemap.xml`,
    "",
    ...categories.flatMap((c) => [
      `## ${c}`,
      "",
      ...solutions.filter((s) => s.category === c).map((s) => `- [${s.title}](${solutionUrl(s)}): ${s.tagline}`),
      "",
    ]),
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
