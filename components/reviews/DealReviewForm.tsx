"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, MessageSquareHeart } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import {
  negativeReviewTags,
  positiveReviewTags,
  submitDealReview,
  type ReviewType
} from "@/lib/data/reviews";

type DealReviewFormProps = {
  dealId: string;
  reviewedUserId: string;
  reviewedUserName: string;
  onSubmitted?: () => void;
};

export function DealReviewForm({
  dealId,
  reviewedUserId,
  reviewedUserName,
  onSubmitted
}: DealReviewFormProps) {
  const [ratingType, setRatingType] = useState<ReviewType>("positive");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const tags = useMemo(
    () => ratingType === "positive" ? positiveReviewTags : negativeReviewTags,
    [ratingType]
  );

  function toggleTag(tag: string) {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag]
    );
  }

  async function handleSubmit() {
    if (selectedTags.length === 0) {
      setError("Выберите хотя бы одну карточку отзыва.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const supabase = createClient();
    const { error: submitError } = await submitDealReview(supabase, {
      dealId,
      reviewedUserId,
      ratingType,
      comment,
      tags: selectedTags
    });

    if (submitError) {
      setError("Не удалось отправить отзыв. Возможно, вы уже оставили отзыв.");
      setIsSubmitting(false);
      return;
    }

    setSubmitted(true);
    setIsSubmitting(false);
    onSubmitted?.();
  }

  if (submitted) {
    return (
      <div className="rounded-[20px] border border-leaf/15 bg-leaf/10 p-4 text-leaf">
        <div className="flex items-center gap-2 font-semibold">
          <CheckCircle2 size={18} />
          Спасибо!
        </div>
        <p className="mt-1 text-sm text-ink/68">
          Ваш отзыв помогает сделать Choi безопаснее.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[20px] border border-ink/10 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-leaf/10 text-leaf">
          <MessageSquareHeart size={19} />
        </div>
        <div>
          <p className="font-semibold text-ink">Оставьте отзыв</p>
          <p className="text-sm text-ink/58">Как прошла сделка с {reviewedUserName}?</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            setRatingType("positive");
            setSelectedTags([]);
          }}
          className={`focus-ring h-11 rounded-full text-sm font-semibold transition ${
            ratingType === "positive"
              ? "bg-leaf text-white"
              : "border border-ink/10 bg-white text-ink"
          }`}
        >
          Положительный
        </button>
        <button
          type="button"
          onClick={() => {
            setRatingType("negative");
            setSelectedTags([]);
          }}
          className={`focus-ring h-11 rounded-full text-sm font-semibold transition ${
            ratingType === "negative"
              ? "bg-ink text-white"
              : "border border-ink/10 bg-white text-ink"
          }`}
        >
          Негативный
        </button>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => toggleTag(tag)}
            className={`focus-ring min-h-11 rounded-2xl border px-3 py-2 text-left text-sm font-semibold transition ${
              selectedTags.includes(tag)
                ? "border-leaf bg-leaf/10 text-leaf"
                : "border-ink/10 bg-mist/60 text-ink hover:border-leaf/30"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-semibold text-ink">Комментарий</span>
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value.slice(0, 300))}
          maxLength={300}
          placeholder="Можно оставить пару слов о сделке"
          className="mt-2 min-h-24 w-full resize-none rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-leaf"
        />
        <span className="mt-1 block text-right text-xs text-ink/45">
          {comment.length}/300
        </span>
      </label>

      {error ? <p className="mt-2 text-sm font-semibold text-red-600">{error}</p> : null}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="focus-ring mt-4 h-11 w-full rounded-full bg-leaf px-5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-55"
      >
        {isSubmitting ? "Отправляем..." : "Отправить отзыв"}
      </button>
    </div>
  );
}
