"use client";

import type { ReportReason } from "@/lib/data/reports";

type Reason = {
  id: ReportReason | string;
  label: string;
};

type ReportReasonSelectProps = {
  reasons: readonly Reason[];
  value: string;
  onChange: (reason: string) => void;
};

export function ReportReasonSelect({
  reasons,
  value,
  onChange
}: ReportReasonSelectProps) {
  return (
    <div className="grid gap-2">
      {reasons.map((reason) => (
        <button
          key={reason.id}
          type="button"
          onClick={() => onChange(reason.id)}
          className={`focus-ring flex min-h-11 items-center justify-between rounded-2xl border px-4 text-left text-sm font-semibold transition ${
            value === reason.id
              ? "border-leaf bg-mist text-leaf"
              : "border-ink/10 bg-white text-ink hover:border-leaf/30"
          }`}
        >
          {reason.label}
          <span
            className={`h-3 w-3 rounded-full border ${
              value === reason.id ? "border-leaf bg-leaf" : "border-ink/20"
            }`}
            aria-hidden
          />
        </button>
      ))}
    </div>
  );
}
