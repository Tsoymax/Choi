import type { ChoiUser } from "@/utils/users";
import type { ReviewStats } from "@/lib/data/reviews";

export type TrustTemperature = {
  value: number;
  label: string;
  description: string;
};

export function calculateTrustTemperature(
  user: ChoiUser,
  reviewStats?: Pick<ReviewStats, "positive" | "negative">
): TrustTemperature {
  const positiveReviews = reviewStats?.positive ?? 0;
  const negativeReviews = reviewStats?.negative ?? 0;
  const deals = user.successfulDeals ?? 0;
  const complaints = user.complaints ?? 0;

  const value = Math.max(
    0,
    Math.min(
      100,
      72 +
        Math.min(deals, 20) * 0.7 +
        Math.min(positiveReviews, 20) * 1.1 +
        (user.phoneVerified ? 6 : 0) -
        negativeReviews * 6 -
        complaints * 12
    )
  );

  if (value >= 90) {
    return {
      value,
      label: "Очень тёплое доверие",
      description: "Профиль выглядит надёжно: хорошие сделки и спокойная история."
    };
  }

  if (value >= 75) {
    return {
      value,
      label: "Тёплое доверие",
      description: "Хороший уровень для локальных сделок рядом."
    };
  }

  if (value >= 55) {
    return {
      value,
      label: "Нужно больше истории",
      description: "Профилю помогут подтверждённый телефон и завершённые сделки."
    };
  }

  return {
    value,
    label: "Остывает",
    description: "Есть сигналы, которые требуют осторожности и проверки."
  };
}
