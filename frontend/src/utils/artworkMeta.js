/** Artist: prefer API-flattened `artistName`, else nested artistId */
export function artistLabel(art) {
  if (art?.artistName && String(art.artistName).trim()) {
    return String(art.artistName).trim();
  }
  const u = art?.artistId;
  if (!u || typeof u !== "object") return "";
  return (u.username || u.email || "").trim();
}

/** Title: prefer API `artworkTitle`, else `title` */
export function artworkTitle(art) {
  const fromApi = art?.artworkTitle;
  if (typeof fromApi === "string" && fromApi.trim()) return fromApi.trim();
  const t = art?.title;
  return typeof t === "string" && t.trim() ? t.trim() : "Untitled";
}
