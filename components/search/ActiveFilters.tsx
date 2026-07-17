import { X } from "lucide-react";
import {
  getActiveFilterChips,
  type SearchFiltersState
} from "@/utils/search";

type ActiveFiltersProps = {
  filters: SearchFiltersState;
  onRemove: (key: keyof SearchFiltersState) => void;
  onReset: () => void;
};

export function ActiveFilters({ filters, onRemove, onReset }: ActiveFiltersProps) {
  const chips = getActiveFilterChips(filters);

  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 rounded-[24px] bg-white p-4 shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-ink/62">Активные фильтры</p>
        <button
          type="button"
          onClick={onReset}
          className="focus-ring rounded-full px-3 py-1 text-sm font-semibold text-leaf hover:bg-mist"
        >
          Очистить фильтры
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={() => onRemove(chip.key)}
            className="focus-ring inline-flex items-center gap-2 rounded-full bg-mist px-3 py-2 text-sm font-semibold text-ink transition hover:bg-[#e4eee7]"
          >
            {chip.label}
            <X size={14} />
          </button>
        ))}
      </div>
    </div>
  );
}
