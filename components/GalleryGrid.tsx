"use client";

import { useEffect, useMemo, useState } from "react";
import { filterGallery, getTagCounts } from "@/lib/filter";
import { GalleryItem } from "@/lib/types";
import GalleryFilters from "./GalleryFilters";
import ImageCard from "./ImageCard";
import ImageModal from "./ImageModal";

type GalleryGridProps = {
  items: GalleryItem[];
};

export default function GalleryGrid({ items }: GalleryGridProps) {
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  const tagCounts = useMemo(() => getTagCounts(items), [items]);
  const filteredItems = useMemo(
    () => filterGallery(items, query, selectedTags),
    [items, query, selectedTags]
  );

  useEffect(() => {
    if (!activeItem) {
      return;
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveItem(null);
      }
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [activeItem]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  return (
    <section className="flex flex-col gap-6">
      <GalleryFilters
        query={query}
        onQueryChange={setQuery}
        tags={tagCounts}
        selectedTags={selectedTags}
        onToggleTag={toggleTag}
        totalCount={items.length}
        filteredCount={filteredItems.length}
      />

      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-line bg-slate/70 p-10 text-center text-sm text-haze">
          No images match the current filters.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <ImageCard key={item.id} item={item} onSelect={setActiveItem} />
          ))}
        </div>
      )}

      {activeItem ? (
        <ImageModal item={activeItem} onClose={() => setActiveItem(null)} />
      ) : null}
    </section>
  );
}
