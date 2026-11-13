import type { HelpLocale } from "@/content/help/catalog";

export interface HelpFrontMatter {
  title: string;
  summary: string;
  keywords: string[];
  language: HelpLocale;
  translatedFromRevision: string;
  body: string;
}

const KEYS = new Set(["title", "summary", "keywords", "language", "translated_from_revision"]);

function unquote(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length >= 2 && trimmed.startsWith("\"") && trimmed.endsWith("\"")) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export function parseHelpFrontMatter(source: string): HelpFrontMatter | { error: string } {
  if (!source.startsWith("---\n")) return { error: "missing front matter" };
  const end = source.indexOf("\n---\n", 4);
  if (end < 0) return { error: "unclosed front matter" };
  const raw = source.slice(4, end).split("\n");
  const body = source.slice(end + "\n---\n".length).trim();
  if (!body) return { error: "empty article body" };

  const values = new Map<string, string | string[]>();
  for (let index = 0; index < raw.length; index += 1) {
    const line = raw[index];
    if (line.trim() === "") return { error: "blank line in front matter" };
    const list = line.match(/^ {2}- (.+)$/);
    if (list) return { error: "keyword outside a list" };
    const field = line.match(/^([a-z_]+):(?: (.*))?$/);
    if (!field) return { error: "invalid front matter line" };
    const key = field[1];
    if (!KEYS.has(key) || values.has(key)) return { error: `invalid front matter key ${key}` };
    if (key === "keywords") {
      if (field[2] !== undefined && field[2] !== "") return { error: "keywords must be a list" };
      const keywords: string[] = [];
      while (index + 1 < raw.length && raw[index + 1].startsWith("  - ")) {
        index += 1;
        const item = unquote(raw[index].slice(4));
        if (!item || item.includes("\n")) return { error: "empty keyword" };
        keywords.push(item);
      }
      if (keywords.length === 0) return { error: "keywords are required" };
      values.set(key, keywords);
      continue;
    }
    if (field[2] === undefined || field[2].trim() === "") return { error: `${key} is required` };
    values.set(key, unquote(field[2]));
  }

  const title = values.get("title");
  const summary = values.get("summary");
  const keywords = values.get("keywords");
  const language = values.get("language");
  const translatedFromRevision = values.get("translated_from_revision");
  if (typeof title !== "string" || typeof summary !== "string" || !Array.isArray(keywords)) {
    return { error: "incomplete front matter" };
  }
  if (language !== "en" && language !== "bn") return { error: "language must be en or bn" };
  if (typeof translatedFromRevision !== "string" || translatedFromRevision === "") {
    return { error: "translated_from_revision is required" };
  }
  return { title, summary, keywords, language, translatedFromRevision, body };
}
