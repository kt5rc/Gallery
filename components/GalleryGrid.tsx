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
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("gallery-favorites");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setFavorites(new Set(parsed));
      } catch (error) {
        console.error("Failed to parse favorites:", error);
      }
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("gallery-favorites", JSON.stringify(Array.from(favorites)));
  }, [favorites]);

  const tagCounts = useMemo(() => getTagCounts(items), [items]);
  const filteredItems = useMemo(() => {
    let result = filterGallery(items, query, selectedTags);
    if (showFavoritesOnly) {
      result = result.filter((item) => favorites.has(item.id));
    }
    return result;
  }, [items, query, selectedTags, showFavoritesOnly, favorites]);

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

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
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
        showFavoritesOnly={showFavoritesOnly}
        onToggleFavoritesOnly={() => setShowFavoritesOnly(!showFavoritesOnly)}
        favoritesCount={favorites.size}
      />

      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-line bg-slate/70 p-10 text-center text-sm text-haze">
          No images match the current filters.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <ImageCard
              key={item.id}
              item={item}
              onSelect={setActiveItem}
              isFavorite={favorites.has(item.id)}
              onToggleFavorite={() => toggleFavorite(item.id)}
            />
          ))}
        </div>
      )}

      {activeItem ? (
        <ImageModal
          item={activeItem}
          onClose={() => setActiveItem(null)}
          isFavorite={favorites.has(activeItem.id)}
          onToggleFavorite={() => toggleFavorite(activeItem.id)}
        />
      ) : null}
    </section>
  );
}
