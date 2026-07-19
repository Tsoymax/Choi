import type { SearchSort } from "@/utils/search";

type SortSelectProps = {
  value: SearchSort;
  onChange: (value: SearchSort) => void;
};

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink">Сортировка</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as SearchSort)}
        className="focus-ring mt-2 h-12 w-full rounded-2xl border border-ink/10 bg-white px-4 text-sm font-semibold text-ink shadow-sm"
      >
        <option value="default">По умолчанию</option>
        <option value="newest">Сначала новые</option>
        <option value="cheap">Сначала дешёвые</option>
        <option value="expensive">Сначала дорогие</option>
        <option value="nearby">Ближе к вам</option>
      </select>
    </label>
  );
}
