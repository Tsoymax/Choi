import {
  calculateTrustStatus,
  getTrustStatusName,
  type TrustAddressType,
  type TrustStatusKey,
  type TrustStatusSignals
} from "@/lib/trust/calculateTrustStatus";

type TrustStatusProps = {
  name?: string;
  addressType?: TrustAddressType;
  statusKey?: TrustStatusKey;
  signals?: TrustStatusSignals;
  variant?: "inline" | "badge" | "card";
  compact?: boolean;
  className?: string;
};

export function TrustStatus({
  name,
  addressType = "aka",
  statusKey,
  signals,
  variant = "badge",
  compact,
  className = ""
}: TrustStatusProps) {
  const status = calculateTrustStatus({ ...signals, addressType });
  const label = statusKey
    ? getTrustStatusName(statusKey, addressType)
    : status.displayName;
  const display = name ? `${name} · ${label}` : label;

  if (variant === "inline") {
    return (
      <span className={`font-semibold text-leaf ${className}`}>
        {display}
      </span>
    );
  }

  if (variant === "card") {
    return (
      <div className={`rounded-2xl bg-mist p-4 ${className}`}>
        <p className="text-sm text-ink/52">Статус доверия Choi</p>
        <p className="mt-1 text-lg font-semibold text-leaf">{display}</p>
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border border-leaf/15 bg-mist font-semibold text-leaf ${
        compact ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm"
      } ${className}`}
    >
      {display}
    </span>
  );
}
