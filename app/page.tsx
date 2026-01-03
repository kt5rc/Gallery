import GalleryGrid from "@/components/GalleryGrid";
import { getGalleryData } from "@/lib/data";

export default function Home() {
  const items = getGalleryData();

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-3">
          <p className="text-sm uppercase tracking-[0.3em] text-haze">
            Local Gallery
          </p>
          <h1 className="font-display text-4xl text-mist sm:text-5xl">
            Gallery / Vibe
          </h1>
          <p className="max-w-2xl text-sm text-haze">
            Keep prompts, tags, and model notes close to the images. Everything
            stays on your machine.
          </p>
        </header>
        <GalleryGrid items={items} />
      </div>
    </main>
  );
}
