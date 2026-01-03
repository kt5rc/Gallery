import { TagCount } from "@/lib/filter";

type GalleryFiltersProps = {
  query: string;
  onQueryChange: (value: string) => void;
  tags: TagCount[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  totalCount: number;
  filteredCount: number;
};

export default function GalleryFilters({
  query,
  onQueryChange,
  tags,
  selectedTags,
  onToggleTag,
  totalCount,
  filteredCount
}: GalleryFiltersProps) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-line bg-slate/70 p-5 shadow-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-haze">
          <span className="text-mist">{filteredCount}</span>
          <span>of</span>
          <span>{totalCount}</span>
          <span>images</span>
        </div>
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search title or prompt"
          className="w-full rounded-xl border border-line bg-ink/70 px-4 py-2 text-sm text-mist outline-none transition focus:border-accent sm:w-72"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.length === 0 ? (
          <span className="text-xs text-haze">No tags yet</span>
        ) : (
          tags.map((tag) => {
            const isActive = selectedTags.includes(tag.tag);
            return (
              <button
                key={tag.tag}
                type="button"
                onClick={() => onToggleTag(tag.tag)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  isActive
                    ? "border-accent bg-accent/20 text-mist"
                    : "border-line bg-ink/60 text-haze hover:border-mist"
                }`}
              >
                {tag.tag}
                <span className="ml-1 text-[10px] text-haze">
                  {tag.count}
                </span>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}
