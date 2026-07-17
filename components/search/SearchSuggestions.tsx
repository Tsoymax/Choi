import { Clock, TrendingUp } from "lucide-react";
import { popularSearches } from "@/utils/search";

type SearchSuggestionsProps = {
  history: string[];
  onSelect: (query: string) => void;
  onClearHistory?: () => void;
};

export function SearchSuggestions({
  history,
  onSelect,
  onClearHistory
}: SearchSuggestionsProps) {
  return (
    <div className="mt-5 grid gap-3 lg:grid-cols-2">
      {history.length > 0 ? (
        <section className="rounded-[24px] bg-white p-4 shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-ink/68">
              <Clock size={16} className="text-leaf" />
              Последние поиски
            </h2>
            {onClearHistory ? (
              <button
                type="button"
                onClick={onClearHistory}
                className="focus-ring rounded-full px-3 py-1 text-xs font-semibold text-leaf hover:bg-mist"
              >
                Очистить
              </button>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {history.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onSelect(item)}
                className="focus-ring rounded-full bg-mist px-3 py-2 text-sm font-semibold text-ink hover:bg-[#e4eee7]"
              >
                {item}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-[24px] bg-white p-4 shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
        <h2 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-ink/68">
          <TrendingUp size={16} className="text-leaf" />
          Популярные запросы
        </h2>
        <div className="flex flex-wrap gap-2">
          {popularSearches.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onSelect(item)}
              className="focus-ring rounded-full bg-mist px-3 py-2 text-sm font-semibold text-ink hover:bg-[#e4eee7]"
            >
              {item}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
