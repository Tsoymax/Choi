import { Award, BadgeCheck, Coffee, Leaf, Sprout } from "lucide-react";
import type { TrustLevel } from "@/utils/trust";

type TrustBadgeProps = {
  level: TrustLevel;
  compact?: boolean;
};

export function TrustBadge({ level, compact }: TrustBadgeProps) {
  const Icon =
    level.symbol === "sprout"
      ? Sprout
      : level.symbol === "leaf"
        ? Leaf
        : level.symbol === "teacup"
          ? Coffee
          : level.symbol === "medal"
            ? Award
            : BadgeCheck;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-leaf/15 bg-mist text-leaf ${
        compact ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm"
      } font-semibold`}
    >
      <Icon size={compact ? 14 : 18} />
      {level.label}
    </span>
  );
}
