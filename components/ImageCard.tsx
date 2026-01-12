"use client";

import { useState } from "react";
import { GalleryItem } from "@/lib/types";

type ImageCardProps = {
  item: GalleryItem;
  onSelect: (item: GalleryItem) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
};

export default function ImageCard({ item, onSelect, isFavorite, onToggleFavorite }: ImageCardProps) {
  const [hasError, setHasError] = useState(false);
  const showPlaceholder = !item.src || hasError;

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className="group flex h-full flex-col gap-3 rounded-2xl border border-line bg-slate/70 p-3 text-left transition hover:border-mist"
    >
      <div className="relative overflow-hidden rounded-xl bg-ink/70">
        <div className="aspect-[4/5] w-full">
          {showPlaceholder ? (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate to-ink text-xs text-haze">
              No image
            </div>
          ) : (
            <img
              src={item.src}
              alt={item.title ?? "Gallery image"}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              loading="lazy"
              onError={() => setHasError(true)}
            />
          )}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-line bg-ink/80 backdrop-blur-sm transition hover:border-accent hover:bg-accent/20"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <svg
            className={`h-4 w-4 transition ${isFavorite ? "fill-accent text-accent" : "fill-none text-haze"}`}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-mist">
            {item.title ? item.title : "Untitled"}
          </p>
          <span className="text-[11px] text-haze">{item.size ?? "-"}</span>
        </div>
        <p className="text-xs leading-snug text-haze">
          {item.prompt ? item.prompt : "Prompt not set yet."}
        </p>
        <div className="mt-auto flex flex-wrap gap-1">
          {item.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-line px-2 py-0.5 text-[10px] text-haze"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
