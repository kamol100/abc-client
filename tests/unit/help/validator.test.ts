import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

function run(root: string): { status: number; output: string } {
  try {
    const output = execFileSync("node", ["scripts/check-help-content.mjs", "--root", root], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    return { status: 0, output };
  } catch (error) {
    const failed = error as { status?: number; stdout?: string; stderr?: string };
    return { status: failed.status ?? 1, output: `${failed.stdout ?? ""}${failed.stderr ?? ""}` };
  }
}

function writePair(root: string, revision = "1") {
  for (const locale of ["en", "bn"]) {
    mkdirSync(path.join(root, locale, "support"), { recursive: true });
    writeFileSync(path.join(root, locale, "support/sample.md"), [
      "---",
      `title: ${locale} sample`,
      "summary: Sample summary",
      "keywords:",
      "  - sample",
      `language: ${locale}`,
      `translated_from_revision: "${revision}"`,
      "---",
      "A safe sentence.",
    ].join("\n"));
  }
}

function catalog(extra = ""): string {
  return `
    export const HELP_ARTICLES = [{
      id: "support.sample",
      slug: "support/sample",
      kind: "guide",
      audience: "staff",
      requiredAll: [],
      requiredAny: [],
      baseline: true,
      routePatterns: ["/support"],
      relatedIds: [],
      sortOrder: 1,
      sourceRevision: "1",
      publication: "published",
      file: "support/sample.md",
      ${extra}
    }];
  `;
}

describe("help content validator", () => {
  it("accepts the published articles", () => {
    const result = run(path.join(process.cwd(), "content/help"));
    expect(result.status, result.output).toBe(0);
  });

  it("fails broken fixtures", () => {
    const duplicate = mkdtempSync(path.join(tmpdir(), "help-dup-"));
    writePair(duplicate);
    writeFileSync(path.join(duplicate, "catalog.ts"), `
      const article = ${catalog().replace("export const HELP_ARTICLES = ", "")};
      export const HELP_ARTICLES = [article[0], { ...article[0] }];
    `);
    expect(run(duplicate).output).toContain("duplicated");

    const missing = mkdtempSync(path.join(tmpdir(), "help-bn-"));
    writePair(missing);
    writeFileSync(path.join(missing, "catalog.ts"), catalog());
    writeFileSync(path.join(missing, "bn/support/sample.md"), "");
    expect(run(missing).output).toMatch(/missing front matter|empty article body/);

    const stale = mkdtempSync(path.join(tmpdir(), "help-stale-"));
    writePair(stale, "1");
    writeFileSync(path.join(stale, "bn/support/sample.md"), readFileSync(path.join(stale, "bn/support/sample.md"), "utf8").replace("\"1\"", "\"0\""));
    writeFileSync(path.join(stale, "catalog.ts"), catalog());
    expect(run(stale).output).toContain("revision is stale");

    const unknown = mkdtempSync(path.join(tmpdir(), "help-perm-"));
    writePair(unknown);
    writeFileSync(path.join(unknown, "catalog.ts"), catalog("requiredAll: [\"not.a.permission\"], baseline: false, feature: \"clients\","));
    expect(run(unknown).output).toContain("unknown permission not.a.permission");

    const video = mkdtempSync(path.join(tmpdir(), "help-video-"));
    writePair(video);
    writeFileSync(path.join(video, "catalog.ts"), catalog("videos: { en: \"javascript:\" },"));
    expect(run(video).output).toContain("unsafe en video id");

    const unsafe = mkdtempSync(path.join(tmpdir(), "help-url-"));
    writePair(unsafe);
    writeFileSync(path.join(unsafe, "en/support/sample.md"), readFileSync(path.join(unsafe, "en/support/sample.md"), "utf8") + "\n[click](javascript:alert(1))\n");
    writeFileSync(path.join(unsafe, "catalog.ts"), catalog());
    expect(run(unsafe).output).toContain("unsafe markup");

    const related = mkdtempSync(path.join(tmpdir(), "help-related-"));
    writePair(related);
    writeFileSync(path.join(related, "catalog.ts"), catalog("relatedIds: [\"support.missing\"],"));
    expect(run(related).output).toContain("related support.missing is missing");

    const route = mkdtempSync(path.join(tmpdir(), "help-route-"));
    writePair(route);
    writeFileSync(path.join(route, "catalog.ts"), catalog().replace("\"/support\"", "\"../support\""));
    expect(run(route).output).toContain("invalid route");
  });
});
