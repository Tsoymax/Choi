type PriceFieldProps = {
  price: string;
  currency: "uzs" | "usd";
  negotiable: boolean;
  rentalUnit?: string;
  isRental?: boolean;
  error?: string;
  onPriceChange: (value: string) => void;
  onCurrencyChange: (currency: "uzs" | "usd") => void;
  onNegotiableChange: (value: boolean) => void;
  onRentalUnitChange?: (value: string) => void;
};

export function PriceField({
  price,
  currency,
  negotiable,
  rentalUnit = "day",
  isRental = false,
  error,
  onPriceChange,
  onCurrencyChange,
  onNegotiableChange,
  onRentalUnitChange
}: PriceFieldProps) {
  const rentalUnits = [
    { value: "day", label: "сутки" },
    { value: "per-day", label: "день" },
    { value: "hour", label: "час" }
  ];

  return (
    <div id="sell-field-price" className="scroll-mt-28">
      <span className="text-sm font-semibold text-ink">
        {isRental ? "Цена аренды" : "Цена"}
        {isRental || !negotiable ? <span className="text-coral">*</span> : null}
      </span>
      <div className="mt-2 grid gap-3 sm:grid-cols-[1fr_auto]">
        <input
          value={price}
          disabled={!isRental && negotiable}
          inputMode="numeric"
          onChange={(event) => onPriceChange(event.target.value.replace(/[^\d]/g, "").slice(0, 15))}
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
      {isRental ? (
        <div className="mt-3">
          <p className="text-sm font-semibold text-ink">Период аренды</p>
          <div className="mt-2 inline-flex flex-wrap gap-2 rounded-2xl border border-ink/10 bg-white p-1.5 shadow-sm">
            {rentalUnits.map((unit) => (
              <button
                key={unit.value}
                type="button"
                onClick={() => onRentalUnitChange?.(unit.value)}
                className={`focus-ring h-10 rounded-xl px-4 text-sm font-semibold transition ${
                  rentalUnit === unit.value
                    ? "bg-leaf text-white"
                    : "text-ink hover:bg-mist"
                }`}
              >
                За {unit.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <label className="mt-3 inline-flex items-center gap-3 text-sm font-medium text-ink">
          <input
            type="checkbox"
            checked={negotiable}
            onChange={(event) => onNegotiableChange(event.target.checked)}
            className="h-5 w-5 rounded border-ink/20 accent-leaf"
          />
          Договорная
        </label>
      )}
      {error ? <p className="mt-2 text-sm font-medium text-coral">{error}</p> : null}
    </div>
  );
}
