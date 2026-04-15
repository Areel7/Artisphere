const STORAGE_KEY = "artisphere:recently-viewed-artworks";
const MAX_VIEWED_ITEMS = 5;

const safeParse = (value) => {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const getRecentlyViewedArtworkIds = () => {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return safeParse(raw);
};

export const addRecentlyViewedArtworkId = (artworkId) => {
  if (typeof window === "undefined" || !artworkId) return;
  const current = getRecentlyViewedArtworkIds().filter((id) => id !== artworkId);
  const next = [artworkId, ...current].slice(0, MAX_VIEWED_ITEMS);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
};

/** Prefer local guest history first, then server list, dedupe and cap. */
export const mergeRecentlyViewedIds = (localFirst, serverAfter) => {
  const seen = new Set();
  const out = [];
  for (const id of [...localFirst, ...serverAfter]) {
    if (id == null) continue;
    const s = String(id);
    if (!s || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
    if (out.length >= MAX_VIEWED_ITEMS) break;
  }
  return out;
};

export const setRecentlyViewedArtworkIds = (ids) => {
  if (typeof window === "undefined") return;
  const next = mergeRecentlyViewedIds(Array.isArray(ids) ? ids : [], []);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
};
