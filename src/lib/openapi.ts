/**
 * OpenAPI 3.1 description of the public API (src/lib/publicApi.ts) and the MCP endpoint.
 * Served at /openapi.json. Tests check every documented GET path against the handlers.
 */
import { seo } from "@/data/seo";
import { site } from "@/data/profile";
import { categories, servicesUrl, solutions } from "@/data/services";
import { projectViews } from "@/lib/derive";

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const json = (schema: unknown, description: string) => ({ description, content: { "application/json": { schema } } });
const errors = {
  "404": { $ref: "#/components/responses/NotFound" },
  "405": { $ref: "#/components/responses/MethodNotAllowed" },
};
const url = { type: "string", format: "uri" };
const nullableUrl = { type: ["string", "null"], format: "uri" };
const strings = { type: "array", items: { type: "string" } };

const slugParam = (name: string, examples: string[]) => ({
  name: "slug",
  in: "path",
  required: true,
  description: `${name} slug, as returned by the list endpoint.`,
  schema: { type: "string", pattern: "^[a-z0-9-]+$", examples },
});

const readOnlyHeaders = { "x-read-only": true };

/** Builds the OpenAPI document. `primary` is listed first in `servers` (the host that served it). */
export function openApiDocument(primary: string = seo.url) {
  const servers = [primary, ...[seo.url, servicesUrl].filter((u) => u !== primary)].map((u) => ({
    url: u,
    description: u === servicesUrl ? "Freelance solutions site" : "Portfolio site",
  }));

  return {
    openapi: "3.1.0",
    info: {
      title: `${site.name} API`,
      version: "1.0.0",
      summary: `Read-only data about ${site.name}: profile, projects, live demos and freelance solutions.`,
      description: [
        `Public JSON API for ${site.name}, an ${site.role} in ${site.location} who builds AI products and freelance software solutions for businesses.`,
        "",
        "Use it to look up the profile, portfolio projects with case studies, live AI demos, and the solutions available for clients (AI chatbots, AI-powered CRM, ERP, voice agents, automation, websites and more).",
        "",
        "No authentication. Read-only: every operation is a GET except the MCP endpoint. Responses are cached for up to an hour.",
        "Errors always return JSON: `{ \"error\": { \"code\", \"message\", \"hint\", \"docs\" } }`.",
      ].join("\n"),
      contact: { name: site.name, email: site.email, url: servicesUrl },
      "x-guidance":
        "Call listSolutions to see what can be built for a business, then getSolution for details. Call getProfile and listProjects to answer questions about the builder. To start a project, email the contact address.",
    },
    servers,
    externalDocs: { description: "Guide for AI agents (llms.txt)", url: `${servicesUrl}/llms.txt` },
    tags: [
      { name: "Solutions", description: "Freelance solutions that can be built for a business." },
      { name: "Profile", description: "Who builds them." },
      { name: "Projects", description: "Portfolio projects and case studies." },
      { name: "Demos", description: "Live AI demos." },
      { name: "MCP", description: "Model Context Protocol server with the same data as tools." },
    ],
    paths: {
      "/api/v1/solutions": {
        get: {
          operationId: "listSolutions",
          summary: "List solutions",
          description:
            "Lists every solution that can be built for a business, such as AI chatbots, AI-powered CRM, ERP systems, voice agents and immersive websites. Filter by category.",
          tags: ["Solutions"],
          parameters: [
            {
              name: "category",
              in: "query",
              required: false,
              description: "Only return solutions in this category.",
              schema: { type: "string", enum: categories },
            },
          ],
          responses: {
            "200": json(ref("SolutionList"), "Solutions, optionally filtered by category."),
            "400": { $ref: "#/components/responses/InvalidParameter" },
            ...errors,
          },
          ...readOnlyHeaders,
        },
      },
      "/api/v1/solutions/{slug}": {
        get: {
          operationId: "getSolution",
          summary: "Get a solution",
          description: "Full details of one solution: the problem it solves, what gets built, the business impact, suitable industries and how to enquire.",
          tags: ["Solutions"],
          parameters: [slugParam("Solution", solutions.slice(0, 3).map((s) => s.slug))],
          responses: { "200": json(ref("Solution"), "The solution."), ...errors },
          ...readOnlyHeaders,
        },
      },
      "/api/v1/profile": {
        get: {
          operationId: "getProfile",
          summary: "Get profile",
          description: `Profile of ${site.name}: role, company, location, time zone, contact email and links.`,
          tags: ["Profile"],
          responses: { "200": json(ref("Profile"), "The profile."), ...errors },
          ...readOnlyHeaders,
        },
      },
      "/api/v1/projects": {
        get: {
          operationId: "listProjects",
          summary: "List projects",
          description: "Lists every portfolio project with links to source code, live demos and case studies.",
          tags: ["Projects"],
          responses: { "200": json(ref("ProjectList"), "All projects."), ...errors },
          ...readOnlyHeaders,
        },
      },
      "/api/v1/projects/{slug}": {
        get: {
          operationId: "getProject",
          summary: "Get a project",
          description: "One project, including its full case study (overview, features, how it works, stack) when one exists.",
          tags: ["Projects"],
          parameters: [slugParam("Project", projectViews.slice(0, 3).map((p) => p.slug))],
          responses: { "200": json(ref("Project"), "The project."), ...errors },
          ...readOnlyHeaders,
        },
      },
      "/api/v1/demos": {
        get: {
          operationId: "listDemos",
          summary: "List live demos",
          description: "Live AI demos that can be tried in a browser, with what each one runs on.",
          tags: ["Demos"],
          responses: { "200": json(ref("DemoList"), "All demos."), ...errors },
          ...readOnlyHeaders,
        },
      },
      "/mcp": {
        post: {
          operationId: "callMcp",
          summary: "MCP server (JSON-RPC 2.0)",
          description:
            "Model Context Protocol server over Streamable HTTP, stateless, JSON responses. Supports initialize, ping, tools/list and tools/call. Add this URL as a remote MCP server in an MCP client instead of calling it by hand.",
          tags: ["MCP"],
          requestBody: {
            required: true,
            content: { "application/json": { schema: ref("JsonRpcRequest") } },
          },
          responses: {
            "200": json(ref("JsonRpcResponse"), "JSON-RPC response."),
            "202": { description: "Accepted (notification, no response body)." },
            "400": json(ref("JsonRpcResponse"), "Parse error."),
            "429": json(ref("JsonRpcResponse"), "Rate limit exceeded (60 requests per minute per IP)."),
          },
        },
      },
    },
    components: {
      schemas: {
        Error: {
          type: "object",
          required: ["error"],
          properties: {
            error: {
              type: "object",
              required: ["code", "message", "hint", "docs"],
              properties: {
                code: { type: "string", enum: ["not_found", "invalid_parameter", "method_not_allowed"], description: "Stable machine-readable code." },
                message: { type: "string", description: "What went wrong." },
                hint: { type: "string", description: "How to fix the request." },
                docs: { ...url, description: "Link to this document." },
              },
            },
          },
        },
        SolutionSummary: {
          type: "object",
          required: ["slug", "title", "category", "tagline", "url"],
          properties: {
            slug: { type: "string" },
            title: { type: "string" },
            category: { type: "string", enum: categories },
            tagline: { type: "string", description: "The business outcome in one line." },
            url: { ...url, description: "Web page for the solution." },
          },
        },
        SolutionList: {
          type: "object",
          required: ["categories", "solutions"],
          properties: {
            categories: { type: "array", items: { type: "string", enum: categories } },
            solutions: { type: "array", items: ref("SolutionSummary") },
          },
        },
        Solution: {
          allOf: [
            ref("SolutionSummary"),
            {
              type: "object",
              required: ["problem", "features", "impact", "industries", "video", "enquire"],
              properties: {
                problem: { type: "string" },
                features: { ...strings, description: "What gets built." },
                impact: { ...strings, description: "What changes for the business." },
                industries: { ...strings, description: "Industries it suits." },
                video: {
                  oneOf: [
                    { type: "null" },
                    { type: "object", required: ["src", "poster"], properties: { src: url, poster: url } },
                  ],
                },
                enquire: { type: "string", description: "mailto link to start a conversation about this solution." },
              },
            },
          ],
        },
        Profile: {
          type: "object",
          required: ["name", "role", "company", "location", "timeZone", "email", "summary", "links"],
          properties: {
            name: { type: "string" },
            role: { type: "string" },
            company: { type: "string" },
            location: { type: "string" },
            timeZone: { type: "string", description: "IANA time zone." },
            email: { type: "string", format: "email" },
            summary: { type: "string" },
            links: { type: "object", additionalProperties: url },
          },
        },
        ProjectSummary: {
          type: "object",
          required: ["slug", "title", "description", "category", "featured", "sourceUrl", "liveUrl", "caseStudyUrl"],
          properties: {
            slug: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            category: { type: "string" },
            featured: { type: "boolean" },
            sourceUrl: nullableUrl,
            liveUrl: nullableUrl,
            caseStudyUrl: nullableUrl,
          },
        },
        ProjectList: {
          type: "object",
          required: ["projects"],
          properties: { projects: { type: "array", items: ref("ProjectSummary") } },
        },
        Project: {
          allOf: [
            ref("ProjectSummary"),
            {
              type: "object",
              required: ["caseStudy"],
              properties: {
                caseStudy: {
                  oneOf: [
                    { type: "null" },
                    {
                      type: "object",
                      required: ["tagline", "overview", "features", "howItWorks", "stack"],
                      properties: {
                        tagline: { type: "string" },
                        overview: strings,
                        features: {
                          type: "array",
                          items: { type: "object", required: ["title", "body"], properties: { title: { type: "string" }, body: { type: "string" } } },
                        },
                        howItWorks: strings,
                        stack: strings,
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
        Demo: {
          type: "object",
          required: ["slug", "title", "description", "runsOnDevice", "url", "details"],
          properties: {
            slug: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            runsOnDevice: { type: "boolean", description: "True when inference runs in the visitor's browser." },
            url,
            details: { type: "object", additionalProperties: { type: "string" } },
          },
        },
        DemoList: {
          type: "object",
          required: ["demos"],
          properties: { demos: { type: "array", items: ref("Demo") } },
        },
        JsonRpcRequest: {
          type: "object",
          required: ["jsonrpc", "method"],
          properties: {
            jsonrpc: { const: "2.0" },
            id: { type: ["string", "integer", "null"] },
            method: { type: "string", examples: ["initialize", "tools/list", "tools/call"] },
            params: { type: "object" },
          },
        },
        JsonRpcResponse: {
          type: "object",
          required: ["jsonrpc"],
          properties: {
            jsonrpc: { const: "2.0" },
            id: { type: ["string", "integer", "null"] },
            result: {},
            error: {
              type: "object",
              required: ["code", "message"],
              properties: { code: { type: "integer" }, message: { type: "string" } },
            },
          },
        },
      },
      responses: {
        NotFound: json(ref("Error"), "Unknown endpoint or slug."),
        InvalidParameter: json(ref("Error"), "A parameter has an invalid value."),
        MethodNotAllowed: json(ref("Error"), "Only GET is supported."),
      },
    },
  };
}
