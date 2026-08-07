"use client";

import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { sellCategories, tashkentDistricts } from "@/components/sell/sellData";
import {
  getAttributeGroups,
  type ListingAttributeField
} from "@/data/listingAttributeConfig";
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

function cleanNumber(value: string, allowDecimal = false) {
  return value.replace(allowDecimal ? /[^\d.]/g : /\D/g, "");
}

function optionsFor(field?: ListingAttributeField, values?: Record<string, string>) {
  return field?.getOptions?.(values ?? {}) ?? field?.options ?? [];
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

function CompactSelectControl({
  label,
  value,
  options,
  placeholder = "Все объявления",
  onChange
}: {
  label: string;
  value: string;
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="min-w-0">
      <span className="mb-1.5 block text-sm font-medium text-ink/78">{label}</span>
      <span className="relative block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="focus-ring h-12 w-full appearance-none rounded-xl border border-transparent bg-white px-3 pr-9 text-sm font-semibold text-ink shadow-sm transition hover:border-leaf/25"
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          size={17}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink/70"
        />
      </span>
    </label>
  );
}

function CompactInputControl({
  label,
  value,
  placeholder,
  onChange,
  numeric = false,
  decimal = false
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  numeric?: boolean;
  decimal?: boolean;
}) {
  return (
    <label className="min-w-0">
      <span className="mb-1.5 block text-sm font-medium text-ink/78">{label}</span>
      <input
        value={value}
        onChange={(event) =>
          onChange(numeric ? cleanNumber(event.target.value, decimal) : event.target.value)
        }
        inputMode={numeric ? "numeric" : undefined}
        placeholder={placeholder}
        className="focus-ring h-12 w-full rounded-xl border border-transparent bg-white px-3 text-sm font-semibold text-ink shadow-sm transition placeholder:text-ink/45 hover:border-leaf/25"
      />
    </label>
  );
}

function SliderRangeControl({
  label,
  from,
  to,
  min,
  max,
  step,
  unit,
  formatValue,
  onFrom,
  onTo
}: {
  label: string;
  from: string;
  to: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
  formatValue?: (value: number) => string;
  onFrom: (value: string) => void;
  onTo: (value: string) => void;
}) {
  const currentFrom = Number(from || min);
  const currentTo = Number(to || max);
  const safeFrom = Math.min(Math.max(currentFrom, min), currentTo);
  const safeTo = Math.max(Math.min(currentTo, max), safeFrom);
  const range = max - min;
  const fromPercent = range > 0 ? ((safeFrom - min) / range) * 100 : 0;
  const toPercent = range > 0 ? ((safeTo - min) / range) * 100 : 100;
  const display = (value: number) => {
    const formatted = formatValue ? formatValue(value) : value.toLocaleString("ru-RU");
    return unit ? `${formatted} ${unit}` : formatted;
  };

  function updateFrom(value: number) {
    const next = Math.min(value, safeTo);
    onFrom(next <= min ? "" : String(next));
  }

  function updateTo(value: number) {
    const next = Math.max(value, safeFrom);
    onTo(next >= max ? "" : String(next));
  }

  function updateFromInput(value: string) {
    const cleaned = cleanNumber(value);
    if (!cleaned) {
      onFrom("");
      return;
    }

    updateFrom(Number(cleaned));
  }

  function updateToInput(value: string) {
    const cleaned = cleanNumber(value);
    if (!cleaned) {
      onTo("");
      return;
    }

    updateTo(Number(cleaned));
  }

  return (
    <div className="min-w-0 rounded-xl bg-white p-3 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="text-sm font-medium text-ink/78">{label}</span>
        <span className="text-right text-xs font-semibold text-leaf">
          {display(safeFrom)} - {display(safeTo)}
        </span>
      </div>
      <div className="relative h-9">
        <div
          className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full"
          style={{
            background: `linear-gradient(to right, rgba(20, 31, 27, 0.12) 0%, rgba(20, 31, 27, 0.12) ${fromPercent}%, #4f8762 ${fromPercent}%, #4f8762 ${toPercent}%, rgba(20, 31, 27, 0.12) ${toPercent}%, rgba(20, 31, 27, 0.12) 100%)`
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={safeFrom}
          onChange={(event) => updateFrom(Number(event.target.value))}
          className="pointer-events-none absolute inset-x-0 top-1/2 h-2 w-full -translate-y-1/2 appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-leaf [&::-moz-range-thumb]:shadow-md [&::-webkit-slider-runnable-track]:appearance-none [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-leaf [&::-webkit-slider-thumb]:shadow-md"
          aria-label={`${label} от`}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={safeTo}
          onChange={(event) => updateTo(Number(event.target.value))}
          className="pointer-events-none absolute inset-x-0 top-1/2 h-2 w-full -translate-y-1/2 appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-leaf [&::-moz-range-thumb]:shadow-md [&::-webkit-slider-runnable-track]:appearance-none [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-leaf [&::-webkit-slider-thumb]:shadow-md"
          aria-label={`${label} до`}
        />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <input
          value={from}
          onChange={(event) => updateFromInput(event.target.value)}
          inputMode="numeric"
          placeholder="От"
          className="focus-ring h-10 min-w-0 rounded-lg border border-ink/10 bg-mist/70 px-3 text-sm font-semibold text-ink placeholder:text-ink/45"
          aria-label={`${label} от вручную`}
        />
        <input
          value={to}
          onChange={(event) => updateToInput(event.target.value)}
          inputMode="numeric"
          placeholder="До"
          className="focus-ring h-10 min-w-0 rounded-lg border border-ink/10 bg-mist/70 px-3 text-sm font-semibold text-ink placeholder:text-ink/45"
          aria-label={`${label} до вручную`}
        />
      </div>
    </div>
  );
}

function ToggleControl({
  label,
  checked,
  onChange
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex h-12 items-center gap-3 rounded-xl bg-white px-3 text-sm font-semibold text-ink shadow-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 rounded border-ink/25 accent-leaf"
      />
      <span className="truncate">{label}</span>
    </label>
  );
}

function AutoCompactFilters({
  filters,
  onChange,
  onReset,
  onClose
}: CompactSearchFiltersProps & { onClose: () => void }) {
  const fieldByKey = useMemo(() => {
    const fields = getAttributeGroups("auto").flatMap((group) => group.fields);
    return new Map(fields.map((field) => [field.key, field]));
  }, []);

  const modelOptions = optionsFor(fieldByKey.get("model"), { brand: filters.brand });

  return (
    <div className="mt-3 rounded-[24px] border border-ink/8 bg-[#f1f3f2] p-4 shadow-[0_18px_60px_rgba(24,32,29,0.08)] sm:p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <ToggleControl
          label="Только с фото"
          checked={filters.onlyWithPhoto}
          onChange={(onlyWithPhoto) => onChange({ onlyWithPhoto })}
        />
        <button
          type="button"
          onClick={onClose}
          className="focus-ring grid h-10 w-10 place-items-center rounded-full bg-white text-ink shadow-sm"
          aria-label="Закрыть фильтры"
        >
          <X size={18} />
        </button>
      </div>

      <h2 className="mb-4 text-2xl font-semibold text-ink">Фильтры</h2>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <CompactSelectControl
          label="Категория"
          value={filters.category}
          options={sellCategories.map((category) => ({
            value: category.id,
            label: category.label
          }))}
          onChange={(category) => onChange({ category })}
        />
        <CompactSelectControl
          label="Марка"
          value={filters.brand}
          options={optionsFor(fieldByKey.get("brand"))}
          onChange={(brand) => onChange({ brand, model: "" })}
        />
        <CompactSelectControl
          label="Модель"
          value={filters.model}
          options={modelOptions}
          placeholder={filters.brand ? "Все модели" : "Сначала марка"}
          onChange={(model) => onChange({ model })}
        />
        <SliderRangeControl
          label="Цена"
          from={filters.minPrice}
          to={filters.maxPrice}
          min={0}
          max={1000000000}
          step={1000000}
          unit={filters.currency === "usd" ? "$" : "сум"}
          onFrom={(minPrice) => onChange({ minPrice })}
          onTo={(maxPrice) => onChange({ maxPrice })}
        />
        <SliderRangeControl
          label="Пробег"
          from={filters.mileageFrom}
          to={filters.mileageTo}
          min={0}
          max={500000}
          step={5000}
          unit="км"
          onFrom={(mileageFrom) => onChange({ mileageFrom })}
          onTo={(mileageTo) => onChange({ mileageTo })}
        />
        <SliderRangeControl
          label="Год выпуска"
          from={filters.yearFrom}
          to={filters.yearTo}
          min={1980}
          max={2026}
          step={1}
          onFrom={(yearFrom) => onChange({ yearFrom })}
          onTo={(yearTo) => onChange({ yearTo })}
        />
        <CompactSelectControl
          label="Вид топлива"
          value={filters.fuel}
          options={optionsFor(fieldByKey.get("fuel"))}
          onChange={(fuel) => onChange({ fuel })}
        />
        <CompactSelectControl
          label="Коробка передач"
          value={filters.transmission}
          options={optionsFor(fieldByKey.get("transmission"))}
          onChange={(transmission) => onChange({ transmission })}
        />
        <CompactSelectControl
          label="Привод"
          value={filters.drive}
          options={optionsFor(fieldByKey.get("drive"))}
          onChange={(drive) => onChange({ drive })}
        />
        <CompactInputControl
          label="Объем двигателя"
          value={filters.engine}
          placeholder="От:"
          numeric
          decimal
          onChange={(engine) => onChange({ engine })}
        />
        <CompactInputControl
          label="Цвет"
          value={filters.color}
          placeholder="Все объявления"
          onChange={(color) => onChange({ color })}
        />
        <CompactSelectControl
          label="Обмен"
          value={filters.exchange}
          options={optionsFor(fieldByKey.get("exchange"))}
          onChange={(exchange) => onChange({ exchange })}
        />
        <ToggleControl
          label="Только с торгом"
          checked={filters.onlyBargain}
          onChange={(onlyBargain) => onChange({ onlyBargain })}
        />
        <ToggleControl
          label="Только активные"
          checked={filters.onlyActive}
          onChange={(onlyActive) => onChange({ onlyActive })}
        />
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={onReset}
          className="focus-ring rounded-full px-4 py-2 text-sm font-semibold text-leaf transition hover:bg-white"
        >
          Сбросить фильтры
        </button>
      </div>
    </div>
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
        filters.category === "auto" ? (
          <AutoCompactFilters
            filters={filters}
            onChange={onChange}
            onReset={onReset}
            onClose={() => setOpen(false)}
          />
        ) : (
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
        )
      ) : null}
    </div>
  );
}
