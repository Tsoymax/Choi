export type AddressMode = "aka" | "opa";

export type TrustUser = {
  successfulDeals: number;
  complaints: number;
  addressMode?: AddressMode;
};

export type TrustLevel = {
  rank: 1 | 2 | 3 | 4 | 5;
  label: string;
  genericLabel: string;
  symbol: string;
  minDeals: number;
  nextMinDeals?: number;
};

const thresholds = [0, 3, 10, 30, 100];

function getLabel(rank: number, mode: AddressMode = "aka") {
  if (rank === 1) return "Янги";
  if (rank === 2) return mode === "opa" ? "Опа" : "Ака";
  if (rank === 3) return mode === "opa" ? "Опажон" : "Акажон";
  if (rank === 4) return "Устоз";
  return "Устози Choi";
}

function getGenericLabel(rank: number) {
  if (rank === 1) return "Янги";
  if (rank === 2) return "Ака / Опа";
  if (rank === 3) return "Акажон / Опажон";
  if (rank === 4) return "Устоз";
  return "Устози Choi";
}

function getSymbol(rank: number) {
  if (rank === 1) return "sprout";
  if (rank === 2) return "leaf";
  if (rank === 3) return "teacup";
  if (rank === 4) return "medal";
  return "ornament";
}

export function getTrustLevel(user: TrustUser): TrustLevel {
  let rank: TrustLevel["rank"] = 1;

  if (user.successfulDeals >= 100) rank = 5;
  else if (user.successfulDeals >= 30) rank = 4;
  else if (user.successfulDeals >= 10) rank = 3;
  else if (user.successfulDeals >= 3) rank = 2;

  if (user.complaints > 2 && rank > 2) {
    rank = 2;
  }

  return {
    rank,
    label: getLabel(rank, user.addressMode),
    genericLabel: getGenericLabel(rank),
    symbol: getSymbol(rank),
    minDeals: thresholds[rank - 1],
    nextMinDeals: thresholds[rank]
  };
}

export function getTrustProgress(user: TrustUser) {
  const level = getTrustLevel(user);

  if (!level.nextMinDeals) {
    return {
      level,
      percent: 100,
      remainingDeals: 0,
      text: "Вы достигли высшего уровня доверия Choi"
    };
  }

  const span = level.nextMinDeals - level.minDeals;
  const done = Math.max(0, user.successfulDeals - level.minDeals);
  const percent = Math.min(100, Math.round((done / span) * 100));
  const remainingDeals = Math.max(0, level.nextMinDeals - user.successfulDeals);
  const nextLevel = getLabel(level.rank + 1, user.addressMode);

  return {
    level,
    percent,
    remainingDeals,
    text: `Еще ${remainingDeals} успешные сделки до уровня ${nextLevel}`
  };
}
