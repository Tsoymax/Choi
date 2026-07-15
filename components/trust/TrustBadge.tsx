import { TrustStatus } from "@/components/trust/TrustStatus";
import type { TrustAddressType } from "@/lib/trust/calculateTrustStatus";
import type { TrustSignals } from "@/lib/trust/getTrustLevel";

type TrustBadgeProps = {
  confirmedDealsCount: number;
  addressType?: TrustAddressType;
  signals?: Partial<Omit<TrustSignals, "confirmedDealsCount">>;
  compact?: boolean;
};

export function TrustBadge({
  confirmedDealsCount,
  addressType,
  signals,
  compact
}: TrustBadgeProps) {
  return (
    <TrustStatus
      compact={compact}
      addressType={addressType}
      signals={{
        confirmedDealsCount,
        ...signals
      }}
    />
  );
}
