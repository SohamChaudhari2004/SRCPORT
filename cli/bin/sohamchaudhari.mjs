#!/usr/bin/env node
// CLI for the public API described at https://services.sohamchaudhari.in/openapi.json.
// No dependencies; needs Node 18+ for fetch.

const BASE = (process.env.SOHAM_API_URL || "https://services.sohamchaudhari.in").replace(/\/+$/, "");

const HELP = `Usage: sohamchaudhari <command> [options]

Commands
  solutions [--category <name>]   List freelance solutions
  solution <slug>                 Show one solution
  profile                         Show the profile and contact details
  projects                        List portfolio projects
  project <slug>                  Show one project and its case study
  demos                           List live AI demos
  contact                         Print how to start a project

Options
  --json      Print the raw JSON response
  --help      Show this help
  --version   Show the version

Environment
  SOHAM_API_URL   API base URL (default ${BASE})`;

async function get(path) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, { headers: { Accept: "application/json" } });
  } catch {
    fail(`Could not reach ${BASE}. Check your connection.`);
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const e = body?.error;
    fail(e ? `${e.message}\n${e.hint}` : `Request failed with HTTP ${res.status}.`);
  }
  return body;
}

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

const bullet = (items) => items.map((i) => `  - ${i}`).join("\n");

const print = {
  solutions: (b) =>
    b.categories
      .map((c) => {
        const list = b.solutions.filter((s) => s.category === c);
        return list.length ? `${c}\n${list.map((s) => `  ${s.slug.padEnd(22)} ${s.title}\n  ${" ".repeat(22)} ${s.tagline}`).join("\n")}` : "";
      })
      .filter(Boolean)
      .join("\n\n"),
  solution: (s) =>
    [
      `${s.title} (${s.category})`,
      s.tagline,
      "",
      `Problem\n  ${s.problem}`,
      `What you get\n${bullet(s.features)}`,
      `Impact\n${bullet(s.impact)}`,
      `Great for: ${s.industries.join(", ")}`,
      "",
      `More: ${s.url}`,
      `Enquire: ${s.enquire.replace(/^mailto:/, "").split("?")[0]}`,
    ].join("\n"),
  profile: (p) =>
    [
      `${p.name}, ${p.role} at ${p.company}`,
      `${p.location} (${p.timeZone})`,
      `Email: ${p.email}`,
      "",
      p.summary,
      "",
      ...Object.entries(p.links).map(([k, v]) => `${k.padEnd(9)} ${v}`),
    ].join("\n"),
  projects: (b) =>
    b.projects.map((p) => `${p.featured ? "*" : " "} ${p.slug.padEnd(28)} ${p.title}`).join("\n") + "\n\n* featured",
  project: (p) =>
    [
      p.title,
      p.description,
      "",
      ...(p.caseStudy ? [p.caseStudy.tagline, "", ...p.caseStudy.overview, "", `Stack: ${p.caseStudy.stack.join(", ")}`, ""] : []),
      ...[["Source", p.sourceUrl], ["Live", p.liveUrl], ["Case study", p.caseStudyUrl]].filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`),
    ].join("\n"),
  demos: (b) => b.demos.map((d) => `${d.title}\n  ${d.description}\n  ${d.url}`).join("\n\n"),
};

async function main(argv) {
  const json = argv.includes("--json");
  const args = argv.filter((a) => a !== "--json");
  const [command, arg] = args;

  if (!command || command === "--help" || command === "help") return console.log(HELP);
  if (command === "--version") return console.log("1.0.0");

  const flag = (name) => {
    const i = args.indexOf(name);
    return i >= 0 ? args[i + 1] : undefined;
  };
  const need = (what) => arg || fail(`Missing ${what}. Run "sohamchaudhari ${command === "solution" ? "solutions" : "projects"}" to list them.`);

  let path;
  let render;
  switch (command) {
    case "solutions": {
      const category = flag("--category");
      path = `/api/v1/solutions${category ? `?category=${encodeURIComponent(category)}` : ""}`;
      render = print.solutions;
      break;
    }
    case "solution":
      path = `/api/v1/solutions/${encodeURIComponent(need("solution slug"))}`;
      render = print.solution;
      break;
    case "profile":
      path = "/api/v1/profile";
      render = print.profile;
      break;
    case "projects":
      path = "/api/v1/projects";
      render = print.projects;
      break;
    case "project":
      path = `/api/v1/projects/${encodeURIComponent(need("project slug"))}`;
      render = print.project;
      break;
    case "demos":
      path = "/api/v1/demos";
      render = print.demos;
      break;
    case "contact": {
      const p = await get("/api/v1/profile");
      return console.log(
        json
          ? JSON.stringify({ email: p.email, services: p.links.services }, null, 2)
          : `Start a project: email ${p.email} with a few lines about your business and the problem.\nSolutions: ${p.links.services}`,
      );
    }
    default:
      fail(`Unknown command "${command}".\n\n${HELP}`);
  }

  const body = await get(path);
  console.log(json ? JSON.stringify(body, null, 2) : render(body));
}

main(process.argv.slice(2));
