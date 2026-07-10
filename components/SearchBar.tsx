import { ArrowRight, Search } from "lucide-react";

type SearchBarProps = {
  query: string;
  onQueryChange: (query: string) => void;
};

export function SearchBar({ query, onQueryChange }: SearchBarProps) {
  return (
    <div className="mt-8 grid gap-3 rounded-2xl border border-white/70 bg-white/88 p-3 shadow-soft backdrop-blur sm:grid-cols-[1fr_auto]">
      <label className="flex min-h-14 items-center gap-3 rounded-xl bg-mist px-4 text-ink/72">
        <Search size={20} />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          className="w-full bg-transparent text-base text-ink placeholder:text-ink/45 focus:outline-none"
          placeholder="Search fashion, home, skincare..."
        />
      </label>
      <a
        className="focus-ring inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-coral px-6 font-semibold text-white"
        href="#discover"
      >
        Browse
        <ArrowRight size={18} />
      </a>
    </div>
  );
}
