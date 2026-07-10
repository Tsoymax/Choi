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
    <div className="mx-auto mt-10 flex min-h-20 w-full max-w-3xl items-center gap-4 rounded-full border-2 border-white/80 bg-[#17191f] p-3 text-white shadow-2xl shadow-black/30">
      <div className="hidden items-center gap-2 border-r border-white/18 px-4 text-sm font-semibold text-white/88 sm:flex">
        <MapPin size={18} />
        {districtLabel}
      </div>
      <label className="flex flex-1 items-center gap-3 px-2">
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          className="w-full bg-transparent text-lg font-medium text-white placeholder:text-white/55 focus:outline-none sm:text-2xl"
          placeholder={placeholder}
        />
      </label>
      <button className="focus-ring grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white/12 text-white hover:bg-white/18">
        <Search size={24} />
      </button>
    </div>
  );
}
