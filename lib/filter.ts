import { GalleryItem } from "./types";

export type TagCount = {
  tag: string;
  count: number;
};

export function filterGallery(
  items: GalleryItem[],
  query: string,
  selectedTags: string[]
): GalleryItem[] {
  const normalized = query.trim().toLowerCase();
  return items.filter((item) => {
    const matchesQuery =
      normalized.length === 0 ||
      item.prompt.toLowerCase().includes(normalized) ||
      (item.title ?? "").toLowerCase().includes(normalized);

    const matchesTags =
      selectedTags.length === 0 ||
      item.tags.some((tag) => selectedTags.includes(tag));

    return matchesQuery && matchesTags;
  });
}

export function getTagCounts(items: GalleryItem[]): TagCount[] {
  const counts = new Map<string, number>();
  items.forEach((item) => {
    item.tags.forEach((tag) => {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    });
  });
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}
