import { ChevronDown } from "lucide-react";
import { tashkentDistricts } from "./sellData";

type LocationSelectProps = {
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

export function LocationSelect({ value, error, onChange }: LocationSelectProps) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink">Район</span>
      <span className="relative mt-2 block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="focus-ring h-14 w-full appearance-none rounded-2xl border border-ink/10 bg-white px-4 pr-11 text-base font-medium text-ink shadow-sm"
        >
          <option value="">Выберите район</option>
          {tashkentDistricts.map((district) => (
            <option key={district.id} value={district.id}>
              {district.label}
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
