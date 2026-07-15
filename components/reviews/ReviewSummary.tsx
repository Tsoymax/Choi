import type { ReviewStats } from "@/lib/data/reviews";

type ReviewSummaryProps = {
  stats: ReviewStats;
};

export function ReviewSummary({ stats }: ReviewSummaryProps) {
  return (
    <section className="rounded-[24px] bg-white p-6 shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-leaf">
        Отзывы после сделок
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-ink">Чаще всего отмечают</h2>

      {stats.topTags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {stats.topTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-leaf/10 px-3 py-1 text-sm font-semibold text-leaf"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-ink/58">
          Отзывы появятся после завершённых сделок.
        </p>
      )}

      {stats.recentComments.length > 0 ? (
        <div className="mt-6 space-y-3">
          <h3 className="font-semibold text-ink">Последние отзывы</h3>
          {stats.recentComments.map((review) => (
            <blockquote
              key={review.id}
              className="rounded-2xl bg-mist p-4 text-sm leading-6 text-ink/74"
            >
              {review.comment}
            </blockquote>
          ))}
        </div>
      ) : null}
    </section>
  );
}
