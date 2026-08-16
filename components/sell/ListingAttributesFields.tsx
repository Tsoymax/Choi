import { Minus, Plus } from "lucide-react";
import {
  getAttributeGroups,
  type ListingAttributeField
} from "@/data/listingAttributeConfig";

type ListingAttributesFieldsProps = {
  category: string;
  values: Record<string, string>;
  errors?: Record<string, string>;
  onChange: (key: string, value: string) => void;
};

function FieldControl({
  field,
  values,
  value,
  error,
  onChange
}: {
  field: ListingAttributeField;
  values: Record<string, string>;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const options = field.getOptions ? field.getOptions(values) : field.options;
  const isSelectDisabled = field.type === "select" && field.dependsOn && !values[field.dependsOn];
  const isDecimalNumber = field.type === "number" && (field.step ?? 1) < 1;
  const suggestionsId = `sell-field-attribute-${field.key}-suggestions`;

  function normalizeValue(nextValue: string) {
    if (field.type === "number") {
      const maxLength = field.maxLength ?? 12;

      if (!isDecimalNumber) {
        return nextValue.replace(/[^\d]/g, "").slice(0, maxLength);
      }

      const cleaned = nextValue.replace(/[^\d.,]/g, "").replace(",", ".");
      const [whole = "", ...fractionParts] = cleaned.split(".");
      const fraction = fractionParts.join("").slice(0, 1);
      const normalized =
        fractionParts.length > 0 ? `${whole.slice(0, 2)}.${fraction}` : whole.slice(0, 2);

      return normalized.slice(0, maxLength);
    }

    return nextValue.slice(0, 80);
  }

  function changeNumber(direction: -1 | 1) {
    const step = field.step ?? 1;
    const parsedValue = Number(value.replace(",", "."));
    const fallback = field.key === "year" ? new Date().getFullYear() : 0;
    const baseValue = Number.isFinite(parsedValue) && value ? parsedValue : fallback;
    let nextValue = baseValue + direction * step;

    if (typeof field.min === "number") {
      nextValue = Math.max(field.min, nextValue);
    }

    if (typeof field.max === "number") {
      nextValue = Math.min(field.max, nextValue);
    }

    const formattedValue =
      step < 1 ? nextValue.toFixed(1).replace(/\.0$/, "") : String(Math.round(nextValue));

    onChange(normalizeValue(formattedValue));
  }

  return (
    <label id={`sell-field-attribute-${field.key}`} className="block scroll-mt-28">
      <span className="text-sm font-semibold text-ink">
        {field.label}
        {field.required ? <span className="text-coral"> *</span> : null}
      </span>

      {field.type === "select" ? (
        <select
          value={value}
          disabled={Boolean(isSelectDisabled)}
          onChange={(event) => onChange(event.target.value)}
          className="focus-ring mt-2 h-14 w-full rounded-2xl border border-ink/10 bg-white px-4 text-base font-medium text-ink shadow-sm disabled:bg-mist disabled:text-ink/40"
        >
          <option value="">
            {isSelectDisabled ? "Сначала выберите марку" : "Выберите"}
          </option>
          {(options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : field.type === "number" && field.suggestions ? (
        <div className="relative mt-2">
          <input
            type="text"
            inputMode={isDecimalNumber ? "decimal" : "numeric"}
            list={suggestionsId}
            value={value}
            onChange={(event) => onChange(normalizeValue(event.target.value))}
            className="focus-ring h-14 w-full rounded-2xl border border-ink/10 bg-white px-4 pr-14 text-base font-medium text-ink shadow-sm placeholder:text-ink/38"
            placeholder={field.placeholder ?? "Выберите"}
          />
          <datalist id={suggestionsId}>
            {field.suggestions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </datalist>
          {field.unit ? (
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-ink/45">
              {field.unit}
            </span>
          ) : null}
        </div>
      ) : field.type === "number" ? (
        <div className="mt-2 grid grid-cols-[48px_minmax(0,1fr)_48px] overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm focus-within:ring-2 focus-within:ring-leaf/45">
          <button
            type="button"
            onClick={() => changeNumber(-1)}
            className="grid h-14 place-items-center border-r border-ink/10 text-leaf transition hover:bg-mist"
            aria-label="Уменьшить"
          >
            <Minus size={18} />
          </button>
          <div className="relative min-w-0">
            <input
              type="text"
              inputMode={isDecimalNumber ? "decimal" : "numeric"}
              value={value}
              onChange={(event) => onChange(normalizeValue(event.target.value))}
              className="h-14 w-full min-w-0 bg-white px-4 text-center text-base font-medium text-ink outline-none placeholder:text-ink/38"
              placeholder={field.placeholder ?? "Выберите"}
            />
            {field.unit ? (
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-ink/45">
                {field.unit}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => changeNumber(1)}
            className="grid h-14 place-items-center border-l border-ink/10 text-leaf transition hover:bg-mist"
            aria-label="Увеличить"
          >
            <Plus size={18} />
          </button>
        </div>
      ) : (
        <div className="relative mt-2">
          <input
            type="text"
            inputMode="text"
            value={value}
            onChange={(event) => onChange(normalizeValue(event.target.value))}
            className="focus-ring h-14 w-full rounded-2xl border border-ink/10 bg-white px-4 text-base font-medium text-ink shadow-sm"
            placeholder={field.placeholder}
          />
          {field.unit ? (
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-ink/45">
              {field.unit}
            </span>
          ) : null}
        </div>
      )}

      {error ? <span className="mt-2 block text-sm font-medium text-coral">{error}</span> : null}
    </label>
  );
}

export function ListingAttributesFields({
  category,
  values,
  errors = {},
  onChange
}: ListingAttributesFieldsProps) {
  const groups = getAttributeGroups(category, values.subcategory);

  if (!category || (category === "auto" && !values.subcategory) || groups.length === 0) {
    return null;
  }

  return (
    <div className="space-y-5 rounded-[20px] border border-ink/10 bg-mist/55 p-4 sm:p-5">
      <div>
        <h2 className="text-xl font-semibold text-ink">Характеристики</h2>
        <p className="mt-1 text-sm text-ink/58">
          Поля меняются автоматически в зависимости от категории.
        </p>
      </div>

      {groups.map((group) => (
        <div key={group.title} className="space-y-4">
          <h3 className="text-base font-semibold text-leaf">{group.title}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {group.fields.map((field) => (
              <FieldControl
                key={field.key}
                field={field}
                values={values}
                value={values[field.key] ?? ""}
                error={errors[field.key]}
                onChange={(value) => onChange(field.key, value)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
