import {
  calculateTrustScore,
  calculateTrustStatus,
  getNextTrustStatus,
  getTrustStatusName,
  type TrustAddressType,
  type TrustStatusKey,
  type TrustStatusSignals
} from "@/lib/trust/calculateTrustStatus";

export type TrustLevelKey = TrustStatusKey;

export type TrustSignals = {
  confirmedDealsCount: number;
  positiveReviewCount?: number;
  negativeReviewCount?: number;
  accountAgeMonths?: number;
  complaints?: number;
  cancellationCount?: number;
  moderationBlocks?: number;
  addressType?: TrustAddressType;
};

export type TrustLevel = {
  key: TrustLevelKey;
  name: string;
  minScore: number;
  nextLevel: { key: TrustLevelKey; name: string; minScore: number } | null;
  dealsUntilNextLevel: number;
  score: number;
};

const minScores: Record<TrustLevelKey, number> = {
  yangi: 0,
  aka: 12,
  akajon: 30,
  ishonchli: 48,
  ustoz: 76,
  ustozi_choi: 116
};

function normalizeSignals(input: number | TrustSignals): TrustStatusSignals {
  if (typeof input === "number") {
    return { confirmedDealsCount: input };
  }

  return input;
}

export function getTrustScore(input: number | TrustSignals) {
  return calculateTrustScore(normalizeSignals(input));
}

export function getTrustLevel(input: number | TrustSignals): TrustLevel {
  const signals = normalizeSignals(input);
  const status = calculateTrustStatus(signals);
  const next = getNextTrustStatus(status.key);

  return {
    key: status.key,
    name: status.displayName,
    minScore: minScores[status.key],
    nextLevel: next
      ? {
          key: next.key,
          name: getTrustStatusName(next.key, signals.addressType),
          minScore: next.minScore
        }
      : null,
    dealsUntilNextLevel: 0,
    score: status.score
  };
}

export function getTrustProgressPercent(input: number | TrustSignals) {
  const level = getTrustLevel(input);

  if (!level.nextLevel) {
    return 100;
  }

  const span = level.nextLevel.minScore - level.minScore;
  const progress = level.score - level.minScore;

  return Math.min(100, Math.max(0, Math.round((progress / span) * 100)));
}
