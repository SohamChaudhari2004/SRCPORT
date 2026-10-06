# sohamchaudhari

Command-line access to [Soham Chaudhari](https://sohamchaudhari.in)'s public API: the freelance AI and software solutions on [services.sohamchaudhari.in](https://services.sohamchaudhari.in), plus profile, projects and live AI demos.

```bash
npx sohamchaudhari solutions
npx sohamchaudhari solutions --category "AI assistants"
npx sohamchaudhari solution ai-crm
npx sohamchaudhari profile
npx sohamchaudhari projects
npx sohamchaudhari project stock-ai
npx sohamchaudhari demos
npx sohamchaudhari contact
```

Add `--json` to any command for the raw API response, which is handy in scripts and for AI agents.

No dependencies; requires Node.js 18 or newer. The API is described by an OpenAPI 3.1 document at https://services.sohamchaudhari.in/openapi.json, and is also available as an MCP server at https://services.sohamchaudhari.in/mcp.

Set `SOHAM_API_URL` to point at another deployment, for example `http://localhost:3000`.
