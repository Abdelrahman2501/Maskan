#!/usr/bin/env node
// PLAT-007: fail if any source file outside globals.css contains a raw hex color.
// Escape hatch for unavoidable literals (e.g. metadata themeColor): put
// `token-lint-allow` in a comment on the same line.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("../src", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const EXEMPT = new Set(["app/globals.css"]);
const HEX = /#(?:[0-9a-fA-F]{3,4}){1,2}\b/;
const EXTENSIONS = /\.(tsx?|jsx?|css)$/;

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) yield* walk(path);
    else if (EXTENSIONS.test(entry)) yield path;
  }
}

const violations = [];
for (const file of walk(ROOT)) {
  const rel = relative(ROOT, file).replaceAll("\\", "/");
  if (EXEMPT.has(rel)) continue;
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, i) => {
      if (HEX.test(line) && !line.includes("token-lint-allow")) {
        violations.push(`src/${rel}:${i + 1}: ${line.trim()}`);
      }
    });
}

if (violations.length) {
  console.error("Raw hex colors found. Use design tokens from globals.css instead:\n");
  console.error(violations.join("\n"));
  process.exit(1);
}
console.log("Token check passed: no raw hex colors outside globals.css.");
