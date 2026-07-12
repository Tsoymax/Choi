import { Leaf } from "lucide-react";

type SearchEmptyStateProps = {
  onReset: () => void;
};

export function SearchEmptyState({ onReset }: SearchEmptyStateProps) {
  return (
    <section className="rounded-[24px] bg-white p-8 text-center shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
      <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-mist text-2xl">
        <Leaf className="text-leaf" size={28} />
      </div>
      <h2 className="text-3xl font-semibold text-ink">Ничего не нашли</h2>
      <p className="mt-3 text-lg text-ink/62">
        Попробуйте изменить запрос или сбросить фильтры
      </p>
      <button
        type="button"
        onClick={onReset}
        className="focus-ring mt-7 h-14 rounded-full bg-leaf px-7 text-base font-semibold text-white shadow-lg shadow-leaf/20 transition hover:bg-[#3f6d4d]"
      >
        Сбросить фильтры
      </button>
    </section>
  );
}
