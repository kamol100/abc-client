import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const backend = path.resolve(process.cwd(), "../isp-backend");
const seederPath = path.join(backend, "database/seeders/Project/PermissionSeeder.php");
const supportPath = path.join(backend, "app/Services/PlatformSupport/PlatformSupportPermissions.php");
const outputPath = path.join(process.cwd(), "content/help/permission-catalog.json");

let seeder = "";
let support = "";
try {
  seeder = readFileSync(seederPath, "utf8");
  support = readFileSync(supportPath, "utf8");
} catch {
  console.error("Could not read the backend permission sources. Expected the isp-backend checkout beside shadcn-client.");
  process.exit(1);
}

const method = seeder.slice(seeder.indexOf("function getAllPermissions"));
const bodyStart = method.indexOf("return [");
const bodyEnd = method.indexOf("];", bodyStart);
const body = method.slice(bodyStart, bodyEnd);
const names = new Set();
for (const match of body.matchAll(/'([a-z0-9]+(?:[._-][a-z0-9]+)*)'/g)) names.add(match[1]);
for (const match of support.matchAll(/public const [A-Z0-9_]+ = '([a-z0-9]+(?:[.-][a-z0-9]+)*)';/g)) {
  names.add(match[1]);
}

const catalog = {
  source: [
    "isp-backend/database/seeders/Project/PermissionSeeder.php",
    "isp-backend/app/Services/PlatformSupport/PlatformSupportPermissions.php",
  ],
  review_owner: "Whoever adds or renames a backend route permission reviews this file before a help article uses that name.",
  update_command: "node scripts/export-help-permission-catalog.mjs",
  permissions: [...names].sort(),
};

writeFileSync(outputPath, `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`wrote ${catalog.permissions.length} permissions to content/help/permission-catalog.json`);
