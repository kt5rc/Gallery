"use client";

import { useState } from "react";
import { GalleryItem } from "@/lib/types";

type ImageModalProps = {
  item: GalleryItem;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
};

const detailFields: Array<{
  key: keyof GalleryItem;
  label: string;
}> = [
  { key: "model", label: "Model" },
  { key: "loras", label: "Loras" },
  { key: "steps", label: "Steps" },
  { key: "cfg", label: "CFG" },
  { key: "sampler", label: "Sampler" },
  { key: "seed", label: "Seed" },
  { key: "size", label: "Size" },
  { key: "createdAt", label: "Created" }
];

export default function ImageModal({ item, onClose, isFavorite, onToggleFavorite }: ImageModalProps) {
  const [hasError, setHasError] = useState(false);
  const showPlaceholder = !item.src || hasError;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-line bg-ink p-6 shadow-card"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-haze">
              Detail
            </p>
            <h2 className="mt-2 font-display text-3xl text-mist">
              {item.title ? item.title : "Untitled"}
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onToggleFavorite}
              className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
                isFavorite
                  ? "border-accent bg-accent/20"
                  : "border-line hover:border-accent hover:bg-accent/10"
              }`}
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
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-line px-3 py-1 text-xs text-haze transition hover:border-mist"
            >
              Close
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="overflow-hidden rounded-2xl border border-line bg-slate/70">
            <div className="aspect-[4/5] w-full">
              {showPlaceholder ? (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate to-ink text-xs text-haze">
                  No image
                </div>
              ) : (
                <img
                  src={item.src}
                  alt={item.title ?? "Gallery image"}
                  className="h-full w-full object-cover"
                  onError={() => setHasError(true)}
                />
              )}
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-line px-3 py-1 text-xs text-haze"
                >
                  {tag}
                </span>
              ))}
            </div>

            <section className="flex flex-col gap-2">
              <h3 className="text-xs uppercase tracking-[0.2em] text-haze">
                Prompt
              </h3>
              <p className="whitespace-pre-wrap text-sm text-mist">
                {item.prompt || "Prompt not set yet."}
              </p>
            </section>

            <section className="flex flex-col gap-2">
              <h3 className="text-xs uppercase tracking-[0.2em] text-haze">
                Negative Prompt
              </h3>
              <p className="whitespace-pre-wrap text-sm text-haze">
                {item.negativePrompt || "None"}
              </p>
            </section>

            <section className="flex flex-col gap-2">
              <h3 className="text-xs uppercase tracking-[0.2em] text-haze">
                Details
              </h3>
              <div className="grid gap-2">
                {detailFields.map((field) => {
                  const value = item[field.key];
                  if (value === undefined || value === null) {
                    return null;
                  }
                  const displayValue = Array.isArray(value)
                    ? value.join(", ")
                    : value;
                  return (
                    <div
                      key={field.key}
                      className="flex items-center justify-between gap-3 border-b border-line/70 pb-2 text-sm text-mist"
                    >
                      <span className="text-haze">{field.label}</span>
                      <span className="text-right">{displayValue}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
