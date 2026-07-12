"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import type { SearchFiltersState } from "@/utils/search";
import { SearchFiltersFields } from "./SearchFilters";

type MobileFiltersProps = {
  filters: SearchFiltersState;
  onChange: (patch: Partial<SearchFiltersState>) => void;
  onReset: () => void;
};

export function MobileFilters({ filters, onChange, onReset }: MobileFiltersProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="focus-ring inline-flex h-12 items-center gap-2 rounded-full border border-ink/10 bg-white px-5 text-sm font-semibold text-ink shadow-sm lg:hidden"
      >
        <SlidersHorizontal size={18} />
        Фильтры
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm lg:hidden">
          <div className="absolute inset-x-0 bottom-0 max-h-[86vh] overflow-y-auto rounded-t-[28px] bg-white p-5 shadow-[0_-18px_60px_rgba(24,32,29,0.18)]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-ink">Фильтры</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="focus-ring grid h-10 w-10 place-items-center rounded-full bg-mist text-ink"
                aria-label="Закрыть фильтры"
              >
                <X size={18} />
              </button>
            </div>
            <SearchFiltersFields filters={filters} onChange={onChange} />
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onReset}
                className="focus-ring h-12 rounded-full border border-ink/10 bg-white text-sm font-semibold text-ink"
              >
                Сбросить
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="focus-ring h-12 rounded-full bg-leaf text-sm font-semibold text-white shadow-lg shadow-leaf/20"
              >
                Показать результаты
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
