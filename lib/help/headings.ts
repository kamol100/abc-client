export interface HelpHeading {
  id: string;
  level: 2 | 3;
  text: string;
}

export function helpHeadingId(text: string, counts: Map<string, number>): string {
  const base = text
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase("en-US")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{M}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "section";
  const seen = counts.get(base) ?? 0;
  counts.set(base, seen + 1);
  return seen === 0 ? base : `${base}-${seen + 1}`;
}

export function helpHeadings(markdown: string): HelpHeading[] {
  const counts = new Map<string, number>();
  const headings: HelpHeading[] = [];
  for (const line of markdown.split("\n")) {
    const match = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (!match) continue;
    const level = match[1].length === 2 ? 2 : 3;
    const text = match[2].replace(/[*_`]/g, "").trim();
    if (!text) continue;
    headings.push({ level, text, id: helpHeadingId(text, counts) });
  }
  return headings;
}
