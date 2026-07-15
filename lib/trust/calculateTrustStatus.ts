export type TrustStatusKey =
  | "yangi"
  | "aka"
  | "akajon"
  | "ishonchli"
  | "ustoz"
  | "ustozi_choi";

export type TrustAddressType = "aka" | "opa";

export type TrustStatusSignals = {
  addressType?: TrustAddressType;
  confirmedDealsCount?: number;
  positiveReviewCount?: number;
  negativeReviewCount?: number;
  accountAgeMonths?: number;
  complaints?: number;
  cancellationCount?: number;
  moderationBlocks?: number;
};

export type TrustStatus = {
  key: TrustStatusKey;
  displayName: string;
  statusOrder: number;
  score: number;
};

const statusThresholds: Array<{
  key: TrustStatusKey;
  minScore: number;
  statusOrder: number;
}> = [
  { key: "yangi", minScore: 0, statusOrder: 1 },
  { key: "aka", minScore: 12, statusOrder: 2 },
  { key: "akajon", minScore: 30, statusOrder: 3 },
  { key: "ishonchli", minScore: 48, statusOrder: 4 },
  { key: "ustoz", minScore: 76, statusOrder: 5 },
  { key: "ustozi_choi", minScore: 116, statusOrder: 6 }
];

export function getTrustStatusName(
  key: TrustStatusKey,
  addressType: TrustAddressType = "aka"
) {
  if (key === "yangi") return "Янги";
  if (key === "aka") return addressType === "opa" ? "Опа" : "Ака";
  if (key === "akajon") return addressType === "opa" ? "Опажон" : "Акажон";
  if (key === "ishonchli") return "Ишончли";
  if (key === "ustoz") return "Устоз";
  return "Устози Choi";
}

export function calculateTrustScore(signals: TrustStatusSignals) {
  const confirmedDeals = Math.max(0, signals.confirmedDealsCount ?? 0);
  const positiveReviews = Math.max(0, signals.positiveReviewCount ?? 0);
  const negativeReviews = Math.max(0, signals.negativeReviewCount ?? 0);
  const accountAgeMonths = Math.max(0, signals.accountAgeMonths ?? 0);
  const complaints = Math.max(0, signals.complaints ?? 0);
  const cancellations = Math.max(0, signals.cancellationCount ?? 0);
  const moderationBlocks = Math.max(0, signals.moderationBlocks ?? 0);

  return Math.max(
    0,
    Math.round(
      confirmedDeals * 1.7 +
        positiveReviews * 3 +
        Math.min(accountAgeMonths, 36) * 0.35 -
        negativeReviews * 5 -
        complaints * 14 -
        cancellations * 3 -
        moderationBlocks * 22
    )
  );
}

export function calculateTrustStatus(signals: TrustStatusSignals): TrustStatus {
  const score = calculateTrustScore(signals);
  const addressType = signals.addressType ?? "aka";
  let availableStatuses = statusThresholds;

  if (
    (signals.complaints ?? 0) > 2 ||
    (signals.negativeReviewCount ?? 0) >= 5 ||
    (signals.moderationBlocks ?? 0) > 0
  ) {
    availableStatuses = statusThresholds.filter((status) =>
      ["yangi", "aka"].includes(status.key)
    );
  }

  const currentIndex = availableStatuses.findLastIndex(
    (status) => score >= status.minScore
  );
  const status = availableStatuses[Math.max(0, currentIndex)];

  return {
    key: status.key,
    displayName: getTrustStatusName(status.key, addressType),
    statusOrder: status.statusOrder,
    score
  };
}

export function getNextTrustStatus(statusKey: TrustStatusKey) {
  const index = statusThresholds.findIndex((status) => status.key === statusKey);
  return statusThresholds[index + 1] ?? null;
}
