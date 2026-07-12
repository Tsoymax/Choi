import { sellCategories, tashkentDistricts } from "@/components/sell/sellData";
import type { SearchFiltersState } from "@/utils/search";

type SearchFiltersProps = {
  filters: SearchFiltersState;
  onChange: (patch: Partial<SearchFiltersState>) => void;
  onReset: () => void;
};

export function SearchFiltersFields({ filters, onChange }: Omit<SearchFiltersProps, "onReset">) {
  return (
    <div className="space-y-5">
      <label className="block">
        <span className="text-sm font-semibold text-ink">Категория</span>
        <select
          value={filters.category}
          onChange={(event) => onChange({ category: event.target.value })}
          className="focus-ring mt-2 h-12 w-full rounded-2xl border border-ink/10 bg-white px-4 text-sm font-semibold text-ink shadow-sm"
        >
          <option value="">Все категории</option>
          {sellCategories.map((category) => (
            <option key={category.id} value={category.label}>
              {category.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-ink">Район</span>
        <select
          value={filters.district}
          onChange={(event) => onChange({ district: event.target.value })}
          className="focus-ring mt-2 h-12 w-full rounded-2xl border border-ink/10 bg-white px-4 text-sm font-semibold text-ink shadow-sm"
        >
          <option value="">Весь Ташкент</option>
          {tashkentDistricts.map((district) => (
            <option key={district.id} value={district.label}>
              {district.label}
            </option>
          ))}
        </select>
      </label>

      <div>
        <span className="text-sm font-semibold text-ink">Цена</span>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <input
            value={filters.minPrice}
            onChange={(event) => onChange({ minPrice: event.target.value.replace(/[^\d]/g, "") })}
            inputMode="numeric"
            placeholder="от"
            className="focus-ring h-12 rounded-2xl border border-ink/10 bg-white px-4 text-sm font-semibold text-ink shadow-sm"
          />
          <input
            value={filters.maxPrice}
            onChange={(event) => onChange({ maxPrice: event.target.value.replace(/[^\d]/g, "") })}
            inputMode="numeric"
            placeholder="до"
            className="focus-ring h-12 rounded-2xl border border-ink/10 bg-white px-4 text-sm font-semibold text-ink shadow-sm"
          />
        </div>
      </div>

      <label className="block">
        <span className="text-sm font-semibold text-ink">Валюта</span>
        <select
          value={filters.currency}
          onChange={(event) => onChange({ currency: event.target.value as SearchFiltersState["currency"] })}
          className="focus-ring mt-2 h-12 w-full rounded-2xl border border-ink/10 bg-white px-4 text-sm font-semibold text-ink shadow-sm"
        >
          <option value="">Любая</option>
          <option value="uzs">сум</option>
          <option value="usd">доллар США</option>
        </select>
      </label>

      <div className="space-y-3">
        <label className="flex items-center gap-3 text-sm font-semibold text-ink">
          <input
            type="checkbox"
            checked={filters.onlyWithPhoto}
            onChange={(event) => onChange({ onlyWithPhoto: event.target.checked })}
            className="h-5 w-5 rounded border-ink/20 accent-leaf"
          />
          Только с фото
        </label>
        <label className="flex items-center gap-3 text-sm font-semibold text-ink">
          <input
            type="checkbox"
            checked={filters.negotiable}
            onChange={(event) => onChange({ negotiable: event.target.checked })}
            className="h-5 w-5 rounded border-ink/20 accent-leaf"
          />
          Цена договорная
        </label>
      </div>
    </div>
  );
}

export function SearchFilters({ filters, onChange, onReset }: SearchFiltersProps) {
  return (
    <aside className="hidden rounded-[24px] bg-white p-5 shadow-[0_18px_60px_rgba(24,32,29,0.08)] lg:block">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-ink">Фильтры</h2>
        <button
          type="button"
          onClick={onReset}
          className="focus-ring rounded-full px-3 py-1 text-sm font-semibold text-leaf hover:bg-mist"
        >
          Сбросить
        </button>
      </div>
      <SearchFiltersFields filters={filters} onChange={onChange} />
    </aside>
  );
}
