import fs from "fs";
import path from "path";
import { GalleryItem } from "./types";

const galleryPath = path.join(process.cwd(), "public", "gallery", "gallery.json");

const fallbackData: GalleryItem[] = [
  {
    id: "sample-1",
    src: "/gallery/sample-01.png",
    title: "Soft Neon Alley",
    tags: ["city", "neon", "night"],
    prompt: "soft neon alley, rainy street, cinematic lighting",
    negativePrompt: "lowres, blurry, oversaturated",
    model: "sdxl-base",
    loras: ["neon-vibe:0.8"],
    steps: 30,
    cfg: 7,
    sampler: "DPM++ 2M Karras",
    seed: 123456,
    size: "1024x1024",
    createdAt: "2025-01-03"
  },
  {
    id: "sample-2",
    src: "/gallery/sample-02.png",
    title: "Quiet Morning",
    tags: ["portrait", "soft", "film"],
    prompt: "quiet morning portrait, warm window light, film grain",
    negativePrompt: "harsh shadows, extra limbs",
    model: "sd15",
    loras: ["film-grain:0.6"],
    steps: 24,
    cfg: 6,
    sampler: "Euler a",
    seed: 98765,
    size: "768x1024",
    createdAt: "2025-01-02"
  }
];

function normalizeItem(item: Partial<GalleryItem>, index: number): GalleryItem {
  return {
    id: item.id ?? `item-${index + 1}`,
    src: item.src ?? "",
    title: item.title,
    tags: item.tags ?? [],
    prompt: item.prompt ?? "",
    negativePrompt: item.negativePrompt,
    model: item.model,
    loras: item.loras,
    steps: item.steps,
    cfg: item.cfg,
    sampler: item.sampler,
    seed: item.seed,
    size: item.size,
    createdAt: item.createdAt
  };
}

export function getGalleryData(): GalleryItem[] {
  try {
    const raw = fs.readFileSync(galleryPath, "utf-8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return fallbackData;
    }
    return parsed.map((item, index) => normalizeItem(item, index));
  } catch {
    return fallbackData;
  }
}
