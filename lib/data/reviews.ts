import type { SupabaseClient } from "@supabase/supabase-js";

export type ReviewType = "positive" | "negative";

export type ReviewTagOption = {
  id: string;
  label: string;
  type: ReviewType;
};

export const positiveReviewTags: ReviewTagOption[] = [
  { id: "polite", label: "🤝 Вежливый", type: "positive" },
  { id: "quick_reply", label: "💬 Быстро отвечает", type: "positive" },
  { id: "as_described", label: "📦 Всё соответствует описанию", type: "positive" },
  { id: "on_time", label: "⏰ Пунктуальный", type: "positive" },
  { id: "smooth_deal", label: "👍 Сделка прошла отлично", type: "positive" },
  { id: "easy_to_agree", label: "⚡ Быстро договорились", type: "positive" }
];

export const negativeReviewTags: ReviewTagOption[] = [
  { id: "no_show", label: "Не пришёл", type: "negative" },
  { id: "no_reply", label: "Не отвечал", type: "negative" },
  { id: "not_as_described", label: "Описание не совпало", type: "negative" },
  { id: "cancelled_without_notice", label: "Отменил встречу", type: "negative" },
  { id: "rude", label: "Невежлив", type: "negative" }
];

export const reviewTagLabels = [...positiveReviewTags, ...negativeReviewTags].reduce<
  Record<string, string>
>((labels, tag) => {
  labels[tag.id] = tag.label;
  return labels;
}, {});

export function formatReviewTag(tag: string) {
  return reviewTagLabels[tag] ?? tag;
}

export type DealReviewRow = {
  id: string;
  deal_id: string;
  reviewer_id: string;
  reviewed_user_id: string;
  rating_type: ReviewType;
  comment: string | null;
  created_at: string | null;
  is_hidden?: boolean | null;
  hidden_at?: string | null;
  deleted_at?: string | null;
  deal_review_tags?: Array<{ tag: string }> | null;
};

export type AdminReviewRow = DealReviewRow & {
  profiles_reviewed?: { name: string | null } | null;
  profiles_reviewer?: { name: string | null } | null;
  moderated_at?: string | null;
  moderation_reason?: string | null;
};

export type ReviewStats = {
  total: number;
  positive: number;
  negative: number;
  topTags: string[];
  recentComments: DealReviewRow[];
};

export async function getReviewByDealAndReviewer(
  supabase: SupabaseClient,
  dealId: string,
  reviewerId: string
) {
  const { data, error } = await supabase
    .from("deal_reviews")
    .select("*, deal_review_tags(tag)")
    .eq("deal_id", dealId)
    .eq("reviewer_id", reviewerId)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data as DealReviewRow | null;
}

export async function submitDealReview(
  supabase: SupabaseClient,
  input: {
    dealId: string;
    reviewedUserId: string;
    ratingType: ReviewType;
    comment: string;
    tags: string[];
  }
) {
  const { data, error } = await supabase.rpc("submit_deal_review", {
    p_deal_id: input.dealId,
    p_reviewed_user_id: input.reviewedUserId,
    p_rating_type: input.ratingType,
    p_comment: input.comment,
    p_tags: input.tags
  });

  return { review: data as DealReviewRow | null, error };
}

export async function getReviewStatsForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<ReviewStats> {
  const { data, error } = await supabase
    .from("deal_reviews")
    .select("*, deal_review_tags(tag)")
    .eq("reviewed_user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      total: 0,
      positive: 0,
      negative: 0,
      topTags: [],
      recentComments: []
    };
  }

  const reviews = ((data ?? []) as DealReviewRow[]).filter(
    (review) => !review.is_hidden && !review.hidden_at && !review.deleted_at
  );
  const tagCounts = new Map<string, number>();

  reviews.forEach((review) => {
    if (review.rating_type !== "positive") {
      return;
    }

    review.deal_review_tags?.forEach((item) => {
      tagCounts.set(item.tag, (tagCounts.get(item.tag) ?? 0) + 1);
    });
  });

  const topTags = [...tagCounts.entries()]
    .sort((first, second) => second[1] - first[1])
    .slice(0, 4)
    .map(([tag]) => formatReviewTag(tag));

  return {
    total: reviews.length,
    positive: reviews.filter((review) => review.rating_type === "positive").length,
    negative: reviews.filter((review) => review.rating_type === "negative").length,
    topTags,
    recentComments: reviews
      .filter((review) => review.rating_type === "positive" && review.comment)
      .slice(0, 5)
  };
}

export async function getAdminReviews(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("deal_reviews")
    .select(
      "*, deal_review_tags(tag), profiles_reviewed:profiles!deal_reviews_reviewed_user_id_fkey(name), profiles_reviewer:profiles!deal_reviews_reviewer_id_fkey(name)"
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  return { reviews: (data ?? []) as AdminReviewRow[], error };
}

export async function hideReview(
  supabase: SupabaseClient,
  reviewId: string,
  reason: string
) {
  return supabase
    .from("deal_reviews")
    .update({
      is_hidden: true,
      hidden_at: new Date().toISOString(),
      moderated_at: new Date().toISOString(),
      moderation_reason: reason || "Скрыто модератором"
    })
    .eq("id", reviewId);
}

export async function deleteReview(supabase: SupabaseClient, reviewId: string) {
  return supabase.from("deal_reviews").delete().eq("id", reviewId);
}
