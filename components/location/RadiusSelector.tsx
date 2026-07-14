"use client";

import type { DistanceRadius } from "@/lib/location/distance";
import { distanceRadiusOptions } from "@/lib/location/distance";

type RadiusSelectorProps = {
  value: DistanceRadius;
  onChange: (value: DistanceRadius) => void;
};

export function RadiusSelector({ value, onChange }: RadiusSelectorProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-ink/62">Искать рядом</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as DistanceRadius)}
        className="focus-ring h-12 w-full rounded-full border border-ink/10 bg-white px-4 text-sm font-semibold text-ink shadow-sm"
      >
        {distanceRadiusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

