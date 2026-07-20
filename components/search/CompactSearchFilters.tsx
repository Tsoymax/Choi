"use client";

import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { sellCategories, tashkentDistricts } from "@/components/sell/sellData";
import { distanceRadiusOptions } from "@/lib/location/distance";
import type { SearchFiltersState } from "@/utils/search";
import { SearchFiltersFields } from "./SearchFilters";

type CompactSearchFiltersProps = {
  filters: SearchFiltersState;
  onChange: (patch: Partial<SearchFiltersState>) => void;
  onReset: () => void;
};

type Option = {
  value: string;
  label: string;
};

function hasExtraFilters(filters: SearchFiltersState) {
  return Boolean(
    filters.category ||
      filters.subcategory ||
      filters.district ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.currency ||
      filters.distanceRadius !== "all" ||
      filters.onlyWithPhoto ||
      filters.onlyNew ||
      filters.onlyBargain ||
      !filters.onlyActive ||
      filters.negotiable ||
      filters.brand ||
      filters.model ||
      filters.yearFrom ||
      filters.yearTo ||
      filters.mileageFrom ||
      filters.mileageTo ||
      filters.transmission ||
      filters.fuel ||
      filters.drive ||
      filters.body ||
      filters.engine ||
      filters.color ||
      filters.exchange ||
      filters.dealType ||
      filters.rooms ||
      filters.areaFrom ||
      filters.areaTo ||
      filters.floor ||
      filters.renovation ||
      filters.furniture ||
      filters.parking ||
      filters.condition ||
      filters.memory ||
      filters.warranty ||
      filters.gender ||
      filters.size
  );
}

function ChipSelect({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative shrink-0">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="focus-ring h-11 appearance-none rounded-full border border-ink/10 bg-white px-4 pr-10 text-sm font-semibold text-ink shadow-sm transition hover:border-leaf/35 hover:bg-mist"
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        size={16}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink/55"
      />
    </label>
  );
}

export function CompactSearchFilters({
  filters,
  onChange,
  onReset
}: CompactSearchFiltersProps) {
  const [open, setOpen] = useState(false);
  const hasFilters = hasExtraFilters(filters);

  return (
    <div className="mb-6">
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="focus-ring inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-ink/10 bg-white px-4 text-sm font-semibold text-ink shadow-sm transition hover:border-leaf/35 hover:bg-mist"
        >
          <SlidersHorizontal size={17} />
          Фильтры
        </button>

        <ChipSelect
          label="Категория"
          value={filters.category}
          options={sellCategories.map((category) => ({
            value: category.id,
            label: category.label
          }))}
          onChange={(category) => onChange({ category })}
        />

        <ChipSelect
          label="Район"
          value={filters.district}
          options={tashkentDistricts.map((district) => ({
            value: district.id,
            label: district.label
          }))}
          onChange={(district) => onChange({ district })}
        />

        <ChipSelect
          label="Рядом"
          value={filters.distanceRadius === "all" ? "" : filters.distanceRadius}
          options={distanceRadiusOptions
            .filter((option) => option.value !== "all")
            .map((option) => ({
              value: option.value,
              label: option.label
            }))}
          onChange={(distanceRadius) =>
            onChange({
              distanceRadius: (distanceRadius || "all") as SearchFiltersState["distanceRadius"]
            })
          }
        />

        <button
          type="button"
          onClick={() => onChange({ onlyWithPhoto: !filters.onlyWithPhoto })}
          className={`focus-ring h-11 shrink-0 rounded-full border px-4 text-sm font-semibold shadow-sm transition ${
            filters.onlyWithPhoto
              ? "border-leaf bg-leaf text-white"
              : "border-ink/10 bg-white text-ink hover:border-leaf/35 hover:bg-mist"
          }`}
        >
          С фото
        </button>

        <button
          type="button"
          onClick={() => onChange({ onlyBargain: !filters.onlyBargain })}
          className={`focus-ring h-11 shrink-0 rounded-full border px-4 text-sm font-semibold shadow-sm transition ${
            filters.onlyBargain
              ? "border-leaf bg-leaf text-white"
              : "border-ink/10 bg-white text-ink hover:border-leaf/35 hover:bg-mist"
          }`}
        >
          Торг
        </button>

        {hasFilters ? (
          <button
            type="button"
            onClick={onReset}
            className="focus-ring h-11 shrink-0 rounded-full border border-transparent bg-mist px-4 text-sm font-semibold text-leaf transition hover:bg-leaf/10"
          >
            Сбросить
          </button>
        ) : null}
      </div>

      {open ? (
        <div className="mt-3 max-w-3xl rounded-[24px] border border-ink/8 bg-white p-4 shadow-[0_18px_60px_rgba(24,32,29,0.08)] sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-ink">Фильтры</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="focus-ring grid h-9 w-9 place-items-center rounded-full bg-mist text-ink"
              aria-label="Закрыть фильтры"
            >
              <X size={17} />
            </button>
          </div>
          <SearchFiltersFields filters={filters} onChange={onChange} />
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onReset}
              className="focus-ring h-11 rounded-full border border-ink/10 bg-white px-5 text-sm font-semibold text-ink"
            >
              Сбросить
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="focus-ring h-11 rounded-full bg-leaf px-5 text-sm font-semibold text-white shadow-lg shadow-leaf/20"
            >
              Показать результаты
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
