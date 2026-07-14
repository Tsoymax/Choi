export type TrustLevelKey = "yangi" | "aka" | "akajon" | "amaki" | "dada" | "bobo";

export type TrustLevel = {
  key: TrustLevelKey;
  name: string;
  minDeals: number;
  nextLevel: { key: TrustLevelKey; name: string; minDeals: number } | null;
  dealsUntilNextLevel: number;
};

const trustLevels: Array<{ key: TrustLevelKey; name: string; minDeals: number }> = [
  { key: "yangi", name: "Янги", minDeals: 0 },
  { key: "aka", name: "Ака", minDeals: 3 },
  { key: "akajon", name: "Акажон", minDeals: 10 },
  { key: "amaki", name: "Амаки", minDeals: 25 },
  { key: "dada", name: "Дада", minDeals: 50 },
  { key: "bobo", name: "Бобо", minDeals: 100 }
];

export function getTrustLevel(confirmedDealsCount: number): TrustLevel {
  const safeCount = Math.max(0, confirmedDealsCount);
  const currentIndex = trustLevels.findLastIndex((level) => safeCount >= level.minDeals);
  const level = trustLevels[Math.max(0, currentIndex)];
  const nextLevel = trustLevels[currentIndex + 1] ?? null;

  return {
    ...level,
    nextLevel,
    dealsUntilNextLevel: nextLevel ? Math.max(0, nextLevel.minDeals - safeCount) : 0
  };
}

export function getTrustProgressPercent(confirmedDealsCount: number) {
  const level = getTrustLevel(confirmedDealsCount);

  if (!level.nextLevel) {
    return 100;
  }

  const span = level.nextLevel.minDeals - level.minDeals;
  const progress = confirmedDealsCount - level.minDeals;

  return Math.min(100, Math.max(0, Math.round((progress / span) * 100)));
}

