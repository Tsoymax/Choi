import { MapPin, Search } from "lucide-react";

type SearchBarProps = {
  query: string;
  districtLabel: string;
  placeholder: string;
  onQueryChange: (query: string) => void;
};

export function SearchBar({
  query,
  districtLabel,
  placeholder,
  onQueryChange
}: SearchBarProps) {
  return (
    <div className="mt-7 flex min-h-16 w-full max-w-[560px] items-center rounded-full border border-ink/10 bg-white px-5 shadow-[0_14px_36px_rgba(24,32,29,0.12)]">
      <div className="hidden items-center gap-2 border-r border-ink/10 pr-5 text-sm font-semibold text-ink sm:flex">
        <MapPin size={20} />
        {districtLabel}
      </div>
      <label className="flex min-w-0 flex-1 items-center gap-3 px-0 sm:px-5">
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          className="w-full bg-transparent text-base font-medium text-ink placeholder:text-ink/40 focus:outline-none"
          placeholder={placeholder}
        />
      </label>
      <button className="focus-ring grid h-12 w-12 shrink-0 place-items-center rounded-full bg-leaf text-white transition hover:bg-[#3f6d4d]">
        <Search size={22} />
      </button>
    </div>
  );
}
