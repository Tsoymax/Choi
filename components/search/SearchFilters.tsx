import { sellCategories, tashkentDistricts } from "@/components/sell/sellData";
import type { SearchFiltersState } from "@/utils/search";
import { distanceRadiusOptions } from "@/lib/location/distance";
import { getAttributeGroups, type ListingAttributeField } from "@/data/listingAttributeConfig";

type SearchFiltersProps = {
  filters: SearchFiltersState;
  onChange: (patch: Partial<SearchFiltersState>) => void;
  onReset: () => void;
};

export function SearchFiltersFields({ filters, onChange }: Omit<SearchFiltersProps, "onReset">) {
  const dynamicFields = getAttributeGroups(filters.category).flatMap((group) => group.fields);
  const fieldByKey = new Map(dynamicFields.map((field) => [field.key, field]));
  const carModelOptions = fieldByKey.get("model")?.getOptions?.({ brand: filters.brand }) ?? fieldByKey.get("model")?.options ?? [];

  function selectField(
    label: string,
    value: string,
    key: keyof SearchFiltersState,
    options: ListingAttributeField["options"],
    patch?: Partial<SearchFiltersState>
  ) {
    if (!options?.length) {
      return null;
    }

    return (
      <label className="block">
        <span className="text-sm font-semibold text-ink">{label}</span>
        <select
          value={value}
          onChange={(event) => onChange({ [key]: event.target.value, ...patch })}
          className="focus-ring mt-2 h-12 w-full rounded-2xl border border-ink/10 bg-white px-4 text-sm font-semibold text-ink shadow-sm"
        >
          <option value="">Любой</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  function textField(label: string, value: string, key: keyof SearchFiltersState, placeholder = "") {
    return (
      <label className="block">
        <span className="text-sm font-semibold text-ink">{label}</span>
        <input
          value={value}
          onChange={(event) => onChange({ [key]: event.target.value })}
          placeholder={placeholder}
          className="focus-ring mt-2 h-12 w-full rounded-2xl border border-ink/10 bg-white px-4 text-sm font-semibold text-ink shadow-sm"
        />
      </label>
    );
  }

  function numberField(label: string, value: string, key: keyof SearchFiltersState, placeholder = "") {
    return (
      <label className="block">
        <span className="text-sm font-semibold text-ink">{label}</span>
        <input
          value={value}
          onChange={(event) => onChange({ [key]: event.target.value.replace(/[^\d.]/g, "") })}
          inputMode="numeric"
          placeholder={placeholder}
          className="focus-ring mt-2 h-12 w-full rounded-2xl border border-ink/10 bg-white px-4 text-sm font-semibold text-ink shadow-sm"
        />
      </label>
    );
  }

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
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-ink">Подкатегория</span>
        <input
          value={filters.subcategory}
          onChange={(event) => onChange({ subcategory: event.target.value })}
          placeholder="Например, ремонт, мебель, запчасть"
          className="focus-ring mt-2 h-12 w-full rounded-2xl border border-ink/10 bg-white px-4 text-sm font-semibold text-ink shadow-sm"
        />
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
            <option key={district.id} value={district.id}>
              {district.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-ink">Расстояние</span>
        <select
          value={filters.distanceRadius}
          onChange={(event) =>
            onChange({ distanceRadius: event.target.value as SearchFiltersState["distanceRadius"] })
          }
          className="focus-ring mt-2 h-12 w-full rounded-2xl border border-ink/10 bg-white px-4 text-sm font-semibold text-ink shadow-sm"
        >
          {distanceRadiusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
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
        <label className="flex items-center gap-3 text-sm font-semibold text-ink">
          <input
            type="checkbox"
            checked={filters.onlyNew}
            onChange={(event) => onChange({ onlyNew: event.target.checked })}
            className="h-5 w-5 rounded border-ink/20 accent-leaf"
          />
          Только новые за 7 дней
        </label>
        <label className="flex items-center gap-3 text-sm font-semibold text-ink">
          <input
            type="checkbox"
            checked={filters.onlyBargain}
            onChange={(event) => onChange({ onlyBargain: event.target.checked })}
            className="h-5 w-5 rounded border-ink/20 accent-leaf"
          />
          Только с торгом
        </label>
        <label className="flex items-center gap-3 text-sm font-semibold text-ink">
          <input
            type="checkbox"
            checked={filters.onlyActive}
            onChange={(event) => onChange({ onlyActive: event.target.checked })}
            className="h-5 w-5 rounded border-ink/20 accent-leaf"
          />
          Только активные
        </label>
      </div>

      {filters.category === "auto" ? (
        <div className="space-y-4 rounded-[20px] border border-ink/10 bg-mist/50 p-4">
          <h3 className="font-semibold text-ink">Авто</h3>
          {selectField("Марка", filters.brand, "brand", fieldByKey.get("brand")?.options, { model: "" })}
          {selectField("Модель", filters.model, "model", carModelOptions)}
          <div className="grid grid-cols-2 gap-3">
            {numberField("Год от", filters.yearFrom, "yearFrom", "2020")}
            {numberField("Год до", filters.yearTo, "yearTo", "2026")}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {numberField("Пробег от", filters.mileageFrom, "mileageFrom")}
            {numberField("Пробег до", filters.mileageTo, "mileageTo")}
          </div>
          {selectField("Коробка", filters.transmission, "transmission", fieldByKey.get("transmission")?.options)}
          {selectField("Топливо", filters.fuel, "fuel", fieldByKey.get("fuel")?.options)}
          {selectField("Привод", filters.drive, "drive", fieldByKey.get("drive")?.options)}
          {selectField("Тип кузова", filters.body, "body", fieldByKey.get("body")?.options)}
          {textField("Объем двигателя", filters.engine, "engine", "2.5")}
          {textField("Цвет", filters.color, "color", "Белый")}
          {selectField("Обмен", filters.exchange, "exchange", fieldByKey.get("exchange")?.options)}
        </div>
      ) : null}

      {filters.category === "real-estate" ? (
        <div className="space-y-4 rounded-[20px] border border-ink/10 bg-mist/50 p-4">
          <h3 className="font-semibold text-ink">Недвижимость</h3>
          {selectField("Тип", filters.dealType, "dealType", fieldByKey.get("deal_type")?.options)}
          {numberField("Комнаты", filters.rooms, "rooms")}
          <div className="grid grid-cols-2 gap-3">
            {numberField("Площадь от", filters.areaFrom, "areaFrom")}
            {numberField("Площадь до", filters.areaTo, "areaTo")}
          </div>
          {numberField("Этаж", filters.floor, "floor")}
          {selectField("Ремонт", filters.renovation, "renovation", fieldByKey.get("renovation")?.options)}
          {selectField("Мебель", filters.furniture, "furniture", fieldByKey.get("furniture")?.options)}
          {selectField("Парковка", filters.parking, "parking", fieldByKey.get("parking")?.options)}
        </div>
      ) : null}

      {filters.category === "electronics" ? (
        <div className="space-y-4 rounded-[20px] border border-ink/10 bg-mist/50 p-4">
          <h3 className="font-semibold text-ink">Электроника</h3>
          {textField("Бренд", filters.brand, "brand", "Apple")}
          {textField("Модель", filters.model, "model", "iPhone")}
          {selectField("Состояние", filters.condition, "condition", fieldByKey.get("condition")?.options)}
          {textField("Память", filters.memory, "memory", "256 ГБ")}
          {selectField("Гарантия", filters.warranty, "warranty", fieldByKey.get("warranty")?.options)}
        </div>
      ) : null}

      {filters.category === "fashion" ? (
        <div className="space-y-4 rounded-[20px] border border-ink/10 bg-mist/50 p-4">
          <h3 className="font-semibold text-ink">Одежда</h3>
          {selectField("Пол", filters.gender, "gender", fieldByKey.get("gender")?.options)}
          {textField("Размер", filters.size, "size")}
          {textField("Бренд", filters.brand, "brand")}
          {textField("Цвет", filters.color, "color")}
          {textField("Состояние", filters.condition, "condition")}
        </div>
      ) : null}
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
