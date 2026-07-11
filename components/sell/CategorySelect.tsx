import { ChevronDown } from "lucide-react";
import { sellCategories } from "./sellData";

type CategorySelectProps = {
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

export function CategorySelect({ value, error, onChange }: CategorySelectProps) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink">Категория</span>
      <span className="relative mt-2 block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="focus-ring h-14 w-full appearance-none rounded-2xl border border-ink/10 bg-white px-4 pr-11 text-base font-medium text-ink shadow-sm"
        >
          <option value="">Выберите категорию</option>
          {sellCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
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
