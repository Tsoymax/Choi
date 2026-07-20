"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, LocateFixed, MapPin } from "lucide-react";
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
  const rootRef = useRef<HTMLDivElement>(null);
  const currentDistrict =
    districtCoordinates.find((item) => item.id === district) ?? districtCoordinates[0];

  useEffect(() => {
    if (!open) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    function closeOnPageClick(event: PointerEvent) {
      const target = event.target as Node | null;

      if (!target || rootRef.current?.contains(target)) {
        return;
      }

      setOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnPageClick, true);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnPageClick, true);
    };
  }, [open]);

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
    <div ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`focus-ring inline-flex shrink-0 items-center gap-2 rounded-full border border-ink/10 bg-white font-semibold text-ink shadow-sm transition hover:border-leaf/30 ${
          compact ? "h-10 px-3 text-sm" : "h-12 px-4 text-base"
        }`}
        aria-expanded={open}
      >
        <MapPin size={compact ? 16 : 19} className="text-leaf" />
        <span className="max-w-[180px] truncate">{currentDistrict.name}</span>
        <ChevronDown
          size={16}
          className={`text-ink/45 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+10px)] z-50 w-[min(92vw,360px)] rounded-[24px] border border-ink/10 bg-white p-3 shadow-[0_18px_60px_rgba(24,32,29,0.16)]">
          {onUseGps ? (
            <button
              type="button"
              onClick={useGps}
              disabled={gpsLoading}
              className="focus-ring mb-3 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-leaf px-4 text-sm font-semibold text-white shadow-lg shadow-leaf/20 transition hover:bg-[#3f6d4d] disabled:cursor-wait disabled:opacity-70"
            >
              <LocateFixed size={17} />
              {gpsLoading
                ? "Определяем..."
                : gpsActive
                  ? "Моё местоположение включено"
                  : "Использовать моё местоположение"}
            </button>
          ) : null}

          <div className="grid max-h-[360px] gap-2 overflow-y-auto pr-1">
            {districtCoordinates.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => void selectDistrict(item.id)}
                className={`focus-ring flex min-h-11 items-center justify-between rounded-2xl border px-4 text-left text-sm font-semibold transition ${
                  item.id === district
                    ? "border-leaf bg-mist text-leaf"
                    : "border-ink/10 bg-white text-ink hover:border-leaf/30 hover:bg-mist/60"
                }`}
              >
                <span className="min-w-0 truncate">{item.name}</span>
                {item.id === district ? <span className="h-2 w-2 rounded-full bg-leaf" /> : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
