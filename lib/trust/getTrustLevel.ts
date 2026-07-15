export type TrustLevelKey =
  | "yangi"
  | "aka"
  | "akajon"
  | "ishonchli"
  | "ustoz"
  | "ustozi_choi";

export type TrustSignals = {
  confirmedDealsCount: number;
  positiveReviewCount?: number;
  negativeReviewCount?: number;
  accountAgeMonths?: number;
  complaints?: number;
  cancellationCount?: number;
};

export type TrustLevel = {
  key: TrustLevelKey;
  name: string;
  minScore: number;
  nextLevel: { key: TrustLevelKey; name: string; minScore: number } | null;
  dealsUntilNextLevel: number;
  score: number;
};

const trustLevels: Array<{ key: TrustLevelKey; name: string; minScore: number }> = [
  { key: "yangi", name: "Янги", minScore: 0 },
  { key: "aka", name: "Ака / Опа", minScore: 12 },
  { key: "akajon", name: "Акажон / Опажон", minScore: 28 },
  { key: "ishonchli", name: "Ишончли", minScore: 45 },
  { key: "ustoz", name: "Устоз", minScore: 70 },
  { key: "ustozi_choi", name: "Устози Choi", minScore: 110 }
];

function normalizeSignals(input: number | TrustSignals): TrustSignals {
  if (typeof input === "number") {
    return { confirmedDealsCount: input };
  }

  return input;
}

export function getTrustScore(input: number | TrustSignals) {
  const signals = normalizeSignals(input);
  const deals = Math.max(0, signals.confirmedDealsCount);
  const positiveReviews = Math.max(0, signals.positiveReviewCount ?? 0);
  const negativeReviews = Math.max(0, signals.negativeReviewCount ?? 0);
  const accountAgeMonths = Math.max(0, signals.accountAgeMonths ?? 0);
  const complaints = Math.max(0, signals.complaints ?? 0);
  const cancellations = Math.max(0, signals.cancellationCount ?? 0);

  return Math.max(
    0,
    Math.round(
      deals * 2 +
        positiveReviews * 1.5 +
        Math.min(accountAgeMonths, 36) * 0.25 -
        complaints * 15 -
        negativeReviews * 4 -
        cancellations * 2
    )
  );
}

export function getTrustLevel(input: number | TrustSignals): TrustLevel {
  const signals = normalizeSignals(input);
  const score = getTrustScore(signals);
  let availableLevels = trustLevels;

  if ((signals.complaints ?? 0) > 2 || (signals.negativeReviewCount ?? 0) >= 5) {
    availableLevels = trustLevels.filter((level) =>
      ["yangi", "aka"].includes(level.key)
    );
  }

  const currentIndex = availableLevels.findLastIndex((level) => score >= level.minScore);
  const level = availableLevels[Math.max(0, currentIndex)];
  const nextLevel = availableLevels[currentIndex + 1] ?? null;

  return {
    ...level,
    nextLevel,
    score,
    dealsUntilNextLevel: nextLevel
      ? Math.max(
          0,
          Math.ceil((nextLevel.minScore - score) / 2)
        )
      : 0
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
