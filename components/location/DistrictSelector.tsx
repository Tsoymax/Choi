"use client";

import { useState } from "react";
import { ChevronDown, LocateFixed, MapPin, X } from "lucide-react";
import { districtCoordinates } from "@/data/districtCoordinates";

type DistrictSelectorProps = {
  district: string;
  compact?: boolean;
  gpsActive?: boolean;
  onDistrictChange: (district: string) => void | Promise<void>;
  onUseGps?: () => void | Promise<void>;
};

export function DistrictSelector({
  district,
  compact,
  gpsActive,
  onDistrictChange,
  onUseGps
}: DistrictSelectorProps) {
  const [open, setOpen] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const currentDistrict =
    districtCoordinates.find((item) => item.id === district) ?? districtCoordinates[0];

  async function selectDistrict(nextDistrict: string) {
    await onDistrictChange(nextDistrict);
    setOpen(false);
  }

  async function useGps() {
    if (!onUseGps) {
      return;
    }

    setGpsLoading(true);
    try {
      await onUseGps();
      setOpen(false);
    } finally {
      setGpsLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`focus-ring inline-flex shrink-0 items-center gap-2 rounded-full border border-ink/10 bg-white font-semibold text-ink shadow-sm transition hover:border-leaf/30 ${
          compact ? "h-10 px-3 text-sm" : "h-12 px-4 text-base"
        }`}
      >
        <MapPin size={compact ? 16 : 19} className="text-leaf" />
        {currentDistrict.name}
        <ChevronDown size={16} className="text-ink/45" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm">
          <div className="absolute inset-x-0 bottom-0 max-h-[86vh] overflow-y-auto rounded-t-[28px] bg-white p-5 shadow-[0_-18px_60px_rgba(24,32,29,0.18)] sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:max-w-[520px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[28px]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-ink">Где вы находитесь?</h2>
                <p className="mt-1 text-sm text-ink/58">Покажем объявления рядом</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="focus-ring grid h-10 w-10 place-items-center rounded-full bg-mist text-ink"
                aria-label="Закрыть выбор района"
              >
                <X size={18} />
              </button>
            </div>

            {onUseGps ? (
              <button
                type="button"
                onClick={useGps}
                disabled={gpsLoading}
                className="focus-ring mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-leaf px-4 text-sm font-semibold text-white shadow-lg shadow-leaf/20 transition hover:bg-[#3f6d4d] disabled:cursor-wait disabled:opacity-70"
              >
                <LocateFixed size={18} />
                {gpsLoading
                  ? "Определяем..."
                  : gpsActive
                    ? "Используется моё местоположение"
                    : "Использовать моё местоположение"}
              </button>
            ) : null}

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {districtCoordinates.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => void selectDistrict(item.id)}
                  className={`focus-ring flex h-12 items-center justify-between rounded-2xl border px-4 text-left text-sm font-semibold transition ${
                    item.id === district
                      ? "border-leaf bg-mist text-leaf"
                      : "border-ink/10 bg-white text-ink hover:border-leaf/30"
                  }`}
                >
                  {item.name}
                  {item.id === district ? <span className="h-2 w-2 rounded-full bg-leaf" /> : null}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
