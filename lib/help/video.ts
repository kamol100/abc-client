const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

export interface HelpVideoEmbed {
  id: string;
  src: string;
}

export function helpVideoEmbed(id: string | null | undefined): HelpVideoEmbed | null {
  if (!id || !VIDEO_ID.test(id)) return null;
  const src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0`;
  if (/autoplay/i.test(src)) return null;
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return null;
  }
  if (url.origin !== "https://www.youtube-nocookie.com") return null;
  if (url.searchParams.has("autoplay")) return null;
  return { id, src: url.toString() };
}
