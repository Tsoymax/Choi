import { MapPin, Truck } from "lucide-react";
import type { District } from "./types";

type DistrictFilterProps = {
  districts: District[];
  activeDistrict: string;
  onDistrictChange: (districtId: string) => void;
};

export function DistrictFilter({
  districts,
  activeDistrict,
  onDistrictChange
}: DistrictFilterProps) {
  return (
    <aside className="h-fit rounded-3xl border border-ink/10 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/55">
        District
      </h3>
      <div className="mt-4 grid gap-2">
        <DistrictButton
          active={activeDistrict === "all"}
          label="Anywhere"
          onClick={() => onDistrictChange("all")}
        />
        {districts.map((district) => (
          <DistrictButton
            key={district.id}
            active={activeDistrict === district.id}
            label={district.label}
            onClick={() => onDistrictChange(district.id)}
          />
        ))}
      </div>

      <div className="mt-6 rounded-2xl bg-mist p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Truck size={17} />
          Smart delivery
        </div>
        <p className="mt-2 text-sm leading-6 text-ink/62">
          Choi groups orders by neighborhood so local sellers can deliver faster
          with fewer handoffs.
        </p>
      </div>
    </aside>
  );
}

type DistrictButtonProps = {
  active: boolean;
  label: string;
  onClick: () => void;
};

function DistrictButton({ active, label, onClick }: DistrictButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`focus-ring flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold ${
        active ? "bg-ink text-white" : "bg-white text-ink hover:bg-mist"
      }`}
    >
      {label}
      <MapPin size={16} />
    </button>
  );
}
