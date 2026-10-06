import { describe, expect, it } from "vitest";
import { handleMcp, mcpTools, MCP_PROTOCOL_VERSIONS } from "@/lib/mcp";
import { MCP_TOOL_NAMES } from "@/data/pages";
import { POST, GET } from "@/app/mcp/route";
import { GET as serverCard } from "@/app/.well-known/mcp.json/route";
import { seo } from "@/data/seo";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Reply = { result?: any; error?: any } | null;

const rpc = (method: string, params?: Record<string, unknown>, id = 1) =>
  handleMcp({ jsonrpc: "2.0", id, method, params }) as Reply;

const post = (body: unknown, raw = false) =>
  POST(
    new Request("https://x/mcp", {
      method: "POST",
      headers: { "content-type": "application/json", "x-real-ip": `test-${Math.random()}` },
      body: raw ? (body as string) : JSON.stringify(body),
    }),
  );

describe("MCP server", () => {
  it("negotiates the protocol version", () => {
    expect(rpc("initialize", { protocolVersion: "2025-06-18" })!.result.protocolVersion).toBe("2025-06-18");
    expect(rpc("initialize", { protocolVersion: "1999-01-01" })!.result.protocolVersion).toBe(MCP_PROTOCOL_VERSIONS[0]);
    expect(rpc("initialize")!.result.capabilities).toEqual({ tools: { listChanged: false } });
  });

  it("lists read-only tools that match the developer docs", () => {
    const tools = rpc("tools/list")!.result.tools;
    expect(tools.map((t: { name: string }) => t.name)).toEqual(MCP_TOOL_NAMES);
    for (const t of tools) {
      expect(t.inputSchema.type).toBe("object");
      expect(t.annotations.readOnlyHint).toBe(true);
    }
  });

  it("calls tools", () => {
    const ok = rpc("tools/call", { name: "get_project", arguments: { slug: "stock-ai" } })!.result;
    expect(ok.isError).toBe(false);
    expect(ok.content[0].text).toContain("# Stock AI");
    const bad = rpc("tools/call", { name: "get_project", arguments: { slug: "nope" } })!.result;
    expect(bad.isError).toBe(true);
    for (const name of MCP_TOOL_NAMES.filter((n) => n !== "get_project")) {
      expect(rpc("tools/call", { name })!.result.content[0].text.length, name).toBeGreaterThan(100);
    }
  });

  it("follows JSON-RPC error and notification rules", () => {
    expect(rpc("nope")!.error.code).toBe(-32601);
    expect(rpc("tools/call", { name: "nope" })!.error.code).toBe(-32602);
    expect((handleMcp({ method: "ping", id: 1 }) as Reply)!.error.code).toBe(-32600);
    expect(handleMcp({ jsonrpc: "2.0", method: "notifications/initialized" })).toBeNull();
    expect(rpc("ping")!.result).toEqual({});
  });

  it("serves Streamable HTTP over POST", async () => {
    const res = await post({ jsonrpc: "2.0", id: 7, method: "ping" });
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/json");
    expect(await res.json()).toEqual({ jsonrpc: "2.0", id: 7, result: {} });

    expect((await post({ jsonrpc: "2.0", method: "notifications/initialized" })).status).toBe(202);
    const batch = await post([
      { jsonrpc: "2.0", id: 1, method: "ping" },
      { jsonrpc: "2.0", method: "notifications/initialized" },
    ]);
    expect(await batch.json()).toHaveLength(1);
    expect((await post("{not json", true)).status).toBe(400);
    expect(GET().status).toBe(405);
  });

  it("publishes a discovery manifest", async () => {
    const body = await serverCard().json();
    expect(body.transport).toEqual({ type: "streamable-http", endpoint: `${seo.url}/mcp` });
    expect(body.tools).toHaveLength(mcpTools.length);
    expect(body.serverInfo.name).toBeTruthy();
  });
});
