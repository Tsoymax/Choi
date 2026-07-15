import { Coffee } from "lucide-react";
import { getTrustLevel, type TrustSignals } from "@/lib/trust/getTrustLevel";

type TrustBadgeProps = {
  confirmedDealsCount: number;
  signals?: Partial<Omit<TrustSignals, "confirmedDealsCount">>;
  compact?: boolean;
};

export function TrustBadge({ confirmedDealsCount, signals, compact }: TrustBadgeProps) {
  const level = getTrustLevel({
    confirmedDealsCount,
    ...signals
  });

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-leaf/15 bg-mist font-semibold text-leaf ${
        compact ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm"
      }`}
    >
      <Coffee size={compact ? 14 : 17} />
      {level.name}
    </span>
  );
}
