"use client";

import { EyeOff, Trash2 } from "lucide-react";
import { formatReviewTag, type AdminReviewRow } from "@/lib/data/reviews";

export type ReviewActionRequest = {
  type: "review";
  id: string;
  action: "hide" | "delete";
  title: string;
  description: string;
  confirmLabel: string;
  danger?: boolean;
};

type ReviewsTableProps = {
  reviews: AdminReviewRow[];
  onAction: (request: ReviewActionRequest) => void;
};

export function ReviewsTable({ reviews, onAction }: ReviewsTableProps) {
  return (
    <section className="rounded-[24px] bg-white p-5 shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
      <div className="mb-5">
        <p className="text-sm font-semibold text-leaf">Отзывы</p>
        <h2 className="mt-1 text-2xl font-semibold text-ink">Модерация отзывов</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-ink/50">
            <tr>
              <th className="px-3 py-3">От кого</th>
              <th className="px-3 py-3">Кому</th>
              <th className="px-3 py-3">Тип</th>
              <th className="px-3 py-3">Теги</th>
              <th className="px-3 py-3">Комментарий</th>
              <th className="px-3 py-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => {
              const isHidden = Boolean(review.is_hidden || review.hidden_at);

              return (
                <tr key={review.id} className="border-t border-ink/8 align-top">
                  <td className="px-3 py-4 font-semibold text-ink">
                    {review.profiles_reviewer?.name ?? review.reviewer_id.slice(0, 8)}
                  </td>
                  <td className="px-3 py-4 font-semibold text-ink">
                    {review.profiles_reviewed?.name ?? review.reviewed_user_id.slice(0, 8)}
                  </td>
                  <td className="px-3 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        review.rating_type === "positive"
                          ? "bg-leaf/10 text-leaf"
                          : "bg-[#fff2ef] text-coral"
                      }`}
                    >
                      {review.rating_type === "positive" ? "Положительный" : "Негативный"}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-ink/66">
                    {(review.deal_review_tags ?? [])
                      .map((tag) => formatReviewTag(tag.tag))
                      .join(", ") || "—"}
                  </td>
                  <td className="max-w-[260px] px-3 py-4 text-ink/66">
                    {review.comment || "—"}
                    {isHidden ? (
                      <span className="mt-2 block text-xs font-semibold text-coral">
                        Скрыт
                      </span>
                    ) : null}
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex flex-wrap gap-2">
                      {!isHidden ? (
                        <button
                          type="button"
                          onClick={() =>
                            onAction({
                              type: "review",
                              id: review.id,
                              action: "hide",
                              title: "Скрыть отзыв?",
                              description:
                                "Отзыв перестанет отображаться в публичном профиле.",
                              confirmLabel: "Скрыть"
                            })
                          }
                          className="focus-ring inline-flex h-9 items-center gap-2 rounded-full border border-ink/10 px-3 text-xs font-semibold text-ink"
                        >
                          <EyeOff size={15} />
                          Скрыть
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() =>
                          onAction({
                            type: "review",
                            id: review.id,
                            action: "delete",
                            title: "Удалить отзыв?",
                            description: "Это действие нельзя отменить.",
                            confirmLabel: "Удалить",
                            danger: true
                          })
                        }
                        className="focus-ring inline-flex h-9 items-center gap-2 rounded-full border border-coral/20 px-3 text-xs font-semibold text-coral"
                      >
                        <Trash2 size={15} />
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
