import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const serverEntry = resolve(root, "dist/server/index.js");
const original = await import(`${pathToFileURL(serverEntry).href}?export=${Date.now()}`);

const response = await original.default.fetch(
  new Request("https://ong-trum-tu-ban.invalid/", {
    headers: { accept: "text/html,application/xhtml+xml" },
  }),
  {},
  undefined,
);

if (!response.ok) {
  throw new Error(`Không thể prerender trang chủ: HTTP ${response.status}`);
}

const html = await response.text();
if (!html.includes("ÔNG TRÙM") && !html.includes("Ông Trùm")) {
  throw new Error("Trang prerender không chứa nội dung game.");
}

await writeFile(resolve(root, "dist/client/index.html"), html, "utf8");

const staticWorker = `
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let response = await env.ASSETS.fetch(request);
    if (response.status === 404 && request.headers.get("accept")?.includes("text/html")) {
      const fallback = new Request(new URL("/index.html", url), { headers: request.headers });
      response = await env.ASSETS.fetch(fallback);
    }
    return response;
  }
};
`;

await writeFile(serverEntry, staticWorker.trimStart(), "utf8");

const wranglerPath = resolve(root, "dist/server/wrangler.json");
const wrangler = JSON.parse(await readFile(wranglerPath, "utf8"));
wrangler.main = "index.js";
wrangler.compatibility_flags = [];
wrangler.assets = { directory: "../client", binding: "ASSETS" };
await writeFile(wranglerPath, JSON.stringify(wrangler), "utf8");

console.log("Static-first artifact ready: index.html + asset worker");

