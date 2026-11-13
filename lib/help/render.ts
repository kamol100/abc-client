import MarkdownIt from "markdown-it";

const MEDIA = /^media\/([a-z0-9][a-z0-9._-]{0,80}\.(?:png|jpe?g|webp|gif))$/;
const UNSAFE_HTML = /<\s*script\b|javascript\s*:|data\s*:|vbscript\s*:|file\s*:|\son[a-z]+\s*=/i;

export function escapeHelpText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function isSafeHelpUrl(url: string): boolean {
  const trimmed = url.trim();
  if (trimmed === "" || trimmed.startsWith("//") || /[\u0000-\u001F]/.test(trimmed)) return false;
  if (trimmed.startsWith("#")) return !trimmed.includes(":");
  if (MEDIA.test(trimmed)) return true;
  if (trimmed.startsWith("/help/")) {
    return !trimmed.includes("..") && !trimmed.includes("\\") && !trimmed.includes(":");
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "https:" || parsed.protocol === "http:" || parsed.protocol === "mailto:";
  } catch {
    return false;
  }
}

function mediaFile(url: string): string | null {
  const match = MEDIA.exec(url.trim());
  if (!match || match[1].includes("..")) return null;
  return match[1];
}

function createParser() {
  const parser = new MarkdownIt({
    html: false,
    xhtmlOut: false,
    breaks: false,
    linkify: false,
    typographer: false,
  });
  parser.disable("linkify");
  parser.validateLink = isSafeHelpUrl;
  parser.renderer.rules.image = (tokens, index, _options, env) => {
    const token = tokens[index];
    const altText = token?.children?.map((child) => child.content).join("") || token?.content || "";
    const alt = escapeHelpText(String(altText));
    const articleId = typeof env?.articleId === "string" ? env.articleId : "";
    const file = mediaFile(String(token?.attrGet("src") ?? ""));
    if (!file || !/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/.test(articleId)) return alt;
    return `<img src="/api/help/media/${articleId}/${file}" alt="${alt}" />`;
  };
  return parser;
}

const parser = createParser();

export function renderHelpMarkdown(markdown: string, articleId: string, allowedSlugs: ReadonlyMap<string, string>): string {
  const linked = markdown.replace(
    /\[([^\]]*)\]\(help:([a-z0-9]+(?:[.-][a-z0-9]+)*)\)/g,
    (_match, label: string, id: string) => {
      const slug = allowedSlugs.get(id);
      if (!slug) return "";
      return `[${label}](/help/${slug})`;
    },
  ).replace(/(!?)\[([^\]]*)\]\(([^()\n]*(?:\([^()\n]*\)[^()\n]*)?)\)/g, (match, _bang: string, label: string, url: string) => {
    const target = url.trim();
    if (target.startsWith("media/") || target.startsWith("#") || target.startsWith("/help/") || isSafeHelpUrl(target)) {
      return match;
    }
    return label;
  });
  const html = parser.render(linked, { articleId });
  if (UNSAFE_HTML.test(html)) {
    throw new Error("help render rejected unsafe html");
  }
  return html;
}

export function helpPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_>`]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
