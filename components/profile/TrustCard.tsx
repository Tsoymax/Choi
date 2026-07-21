import type { ChoiUser } from "@/utils/users";
import { getConfirmedDealsCount } from "@/utils/deals";
import { TrustStatus } from "@/components/trust/TrustStatus";
import type { ReviewStats } from "@/lib/data/reviews";
import { getAccountAgeMonths } from "@/utils/profileDate";

type TrustCardProps = {
  user: ChoiUser;
  publicView?: boolean;
  reviewStats?: ReviewStats;
};

export function TrustCard({ user, publicView, reviewStats }: TrustCardProps) {
  const confirmedDealsCount = getConfirmedDealsCount(user.id);

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
          <dt className="text-ink/52">Телефон</dt>
          <dd className="mt-1 text-lg font-semibold text-ink">
            {user.phoneVerified ? "Подтверждён" : "Не подтверждён"}
          </dd>
        </div>
        <div className="rounded-2xl bg-mist p-4">
          <dt className="text-ink/52">Проверки</dt>
          <dd className="mt-1 text-lg font-semibold text-ink">
            {publicView
              ? user.complaints === 0
                ? "Нарушений не обнаружено"
                : "Есть проверки"
              : user.complaints === 0
                ? "Нет жалоб"
                : "Есть жалобы"}
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
