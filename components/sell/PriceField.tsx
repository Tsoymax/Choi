type PriceFieldProps = {
  price: string;
  currency: "uzs" | "usd";
  negotiable: boolean;
  error?: string;
  onPriceChange: (value: string) => void;
  onCurrencyChange: (currency: "uzs" | "usd") => void;
  onNegotiableChange: (value: boolean) => void;
};

export function PriceField({
  price,
  currency,
  negotiable,
  error,
  onPriceChange,
  onCurrencyChange,
  onNegotiableChange
}: PriceFieldProps) {
  return (
    <div id="sell-field-price" className="scroll-mt-28">
      <span className="text-sm font-semibold text-ink">
        Цена {!negotiable ? <span className="text-coral">*</span> : null}
      </span>
      <div className="mt-2 grid gap-3 sm:grid-cols-[1fr_auto]">
        <input
          value={price}
          disabled={negotiable}
          inputMode="numeric"
          onChange={(event) => onPriceChange(event.target.value.replace(/[^\d]/g, ""))}
          className="focus-ring h-14 rounded-2xl border border-ink/10 bg-white px-4 text-base font-medium text-ink shadow-sm disabled:bg-mist disabled:text-ink/45"
          placeholder="Введите цену"
        />
        <div className="flex rounded-2xl border border-ink/10 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => onCurrencyChange("uzs")}
            className={`focus-ring rounded-xl px-4 text-sm font-semibold transition ${
              currency === "uzs" ? "bg-leaf text-white" : "text-ink hover:bg-mist"
            }`}
          >
            сум
          </button>
          <button
            type="button"
            onClick={() => onCurrencyChange("usd")}
            className={`focus-ring rounded-xl px-4 text-sm font-semibold transition ${
              currency === "usd" ? "bg-leaf text-white" : "text-ink hover:bg-mist"
            }`}
          >
            доллар США
          </button>
        </div>
      </div>
      <label className="mt-3 inline-flex items-center gap-3 text-sm font-medium text-ink">
        <input
          type="checkbox"
          checked={negotiable}
          onChange={(event) => onNegotiableChange(event.target.checked)}
          className="h-5 w-5 rounded border-ink/20 accent-leaf"
        />
        Договорная
      </label>
      {error ? <p className="mt-2 text-sm font-medium text-coral">{error}</p> : null}
    </div>
  );
}
