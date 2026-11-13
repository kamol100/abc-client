import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { validateHelpTree } from "../lib/help/validate.ts";

const args = process.argv.slice(2);

function flag(name, fallback) {
  const index = args.indexOf(name);
  if (index < 0) return fallback;
  const value = args[index + 1];
  if (!value) {
    console.error(`missing value for ${name}`);
    process.exit(1);
  }
  return value;
}

const root = path.resolve(flag("--root", path.join(process.cwd(), "content/help")));
const permissionsPath = path.resolve(flag("--permissions", path.join(process.cwd(), "content/help/permission-catalog.json")));
const catalog = await import(pathToFileURL(path.join(root, "catalog.ts")).href);
const permissionFile = JSON.parse(readFileSync(permissionsPath, "utf8"));
const names = Array.isArray(permissionFile.permissions) ? permissionFile.permissions : [];
const errors = validateHelpTree({
  articles: catalog.HELP_ARTICLES,
  root,
  permissions: new Set(names),
});

if (errors.length > 0) {
  for (const error of errors) console.error(error);
  process.exit(1);
}

const count = Array.isArray(catalog.HELP_ARTICLES) ? catalog.HELP_ARTICLES.length : 0;
console.log(`help content ok (${count} articles)`);
