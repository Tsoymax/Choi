import { ChevronDown } from "lucide-react";
import { getSubcategories, getSubcategoryId } from "./sellData";

type SubcategorySelectProps = {
  category: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

export function SubcategorySelect({
  category,
  value,
  error,
  onChange
}: SubcategorySelectProps) {
  const subcategories = getSubcategories(category);

  if (!category || subcategories.length === 0) {
    return null;
  }

  const selectedValue = getSubcategoryId(category, value);

  return (
    <label id="sell-field-subcategory" className="block scroll-mt-28">
      <span className="text-sm font-semibold text-ink">
        Подкатегория <span className="text-coral">*</span>
      </span>
      <span className="relative mt-2 block">
        <select
          value={selectedValue}
          onChange={(event) => onChange(event.target.value)}
          className="focus-ring h-14 w-full appearance-none rounded-2xl border border-ink/10 bg-white px-4 pr-11 text-base font-medium text-ink shadow-sm"
        >
          <option value="">Выберите подкатегорию</option>
          {subcategories.map((subcategory) => (
            <option key={subcategory.id} value={subcategory.id}>
              {subcategory.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={18}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink/45"
        />
      </span>
      {error ? <span className="mt-2 block text-sm font-medium text-coral">{error}</span> : null}
    </label>
  );
}
