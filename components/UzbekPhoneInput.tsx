"use client";

export function normalizeUzbekPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  const localDigits = digits.startsWith("998") ? digits.slice(3) : digits;
  const trimmedLocalDigits = localDigits.slice(0, 9);

  return trimmedLocalDigits.length === 9 ? `+998${trimmedLocalDigits}` : "";
}

export function getUzbekLocalDigits(value: string) {
  const digits = value.replace(/\D/g, "");
  const localDigits = digits.startsWith("998") ? digits.slice(3) : digits;

  return localDigits.slice(0, 9);
}

export function isValidUzbekPhone(value: string) {
  return /^\+998\d{9}$/.test(value);
}

export function formatUzbekPhone(value: string) {
  const localDigits = getUzbekLocalDigits(value);
  const first = localDigits.slice(0, 2);
  const second = localDigits.slice(2, 5);
  const third = localDigits.slice(5, 7);
  const fourth = localDigits.slice(7, 9);

  return [first, second, third, fourth].filter(Boolean).join(" ");
}

type UzbekPhoneInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
};

export function UzbekPhoneInput({
  value,
  onChange,
  disabled,
  error
}: UzbekPhoneInputProps) {
  const displayValue = formatUzbekPhone(value);

  return (
    <div>
      <div className="mt-2 flex h-14 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm focus-within:ring-2 focus-within:ring-leaf focus-within:ring-offset-2">
        <div className="grid h-full place-items-center border-r border-ink/10 bg-mist px-4 text-base font-semibold text-ink">
          +998
        </div>
        <input
          value={displayValue}
          disabled={disabled}
          inputMode="numeric"
          maxLength={12}
          onChange={(event) => {
            const localDigits = event.target.value.replace(/\D/g, "").slice(0, 9);
            onChange(localDigits.length > 0 ? `+998${localDigits}` : "");
          }}
          className="h-full min-w-0 flex-1 bg-white px-4 text-base font-medium text-ink placeholder:text-ink/35 focus:outline-none disabled:cursor-not-allowed disabled:bg-mist/70"
          placeholder="90 123 45 67"
        />
      </div>
      {error ? <p className="mt-2 text-sm font-medium text-coral">{error}</p> : null}
    </div>
  );
}
