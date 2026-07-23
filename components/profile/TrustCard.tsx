import type { ChoiUser } from "@/utils/users";
import { getConfirmedDealsCount } from "@/utils/deals";
import { TrustStatus } from "@/components/trust/TrustStatus";
import type { ReviewStats } from "@/lib/data/reviews";
import { getAccountAgeMonths } from "@/utils/profileDate";
import { calculateTrustTemperature } from "@/utils/trustTemperature";

type TrustCardProps = {
  user: ChoiUser;
  reviewStats?: ReviewStats;
};

export function TrustCard({ user, reviewStats }: TrustCardProps) {
  const confirmedDealsCount = getConfirmedDealsCount(user.id);
  const trustTemperature = calculateTrustTemperature(user, reviewStats);

  return (
    <section className="rounded-[24px] bg-white p-6 shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-leaf">
        Доверие Choi
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-ink">Статус участника</h2>

      <div className="mt-5">
        <TrustStatus
          variant="card"
          addressType={user.addressMode}
          signals={{
            confirmedDealsCount,
            positiveReviewCount: reviewStats?.positive ?? 0,
            negativeReviewCount: reviewStats?.negative ?? 0,
            complaints: user.complaints,
            accountAgeMonths: getAccountAgeMonths(user)
          }}
        />
      </div>

      <dl className="mt-5 grid gap-3 text-sm">
        <div className="rounded-2xl bg-mist p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <dt className="text-ink/52">Температура доверия</dt>
              <dd className="mt-1 text-lg font-semibold text-ink">
                {Math.round(trustTemperature.value)}° · {trustTemperature.label}
              </dd>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-leaf shadow-sm">
              Choi
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-leaf transition-all"
              style={{ width: `${trustTemperature.value}%` }}
            />
          </div>
          <p className="mt-3 text-sm leading-5 text-ink/62">{trustTemperature.description}</p>
        </div>
        <div className="rounded-2xl bg-mist p-4">
          <dt className="text-ink/52">Телефон</dt>
          <dd className="mt-1 text-lg font-semibold text-ink">
            {user.phoneVerified ? "Подтверждён" : "Не подтверждён"}
          </dd>
        </div>
      </dl>

      <p className="mt-5 text-sm leading-6 text-ink/62">
        Статус учитывает завершённые сделки, отзывы после встреч, возраст аккаунта,
        жалобы и отмены. Число сделок больше не является главным показателем доверия.
      </p>
    </section>
  );
}
