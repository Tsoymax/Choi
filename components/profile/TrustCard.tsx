import type { ChoiUser } from "@/utils/users";
import { getConfirmedDealsCount } from "@/utils/deals";
import { getTrustLevel } from "@/lib/trust/getTrustLevel";
import { TrustBadge } from "@/components/trust/TrustBadge";
import { TrustProgress } from "./TrustProgress";

type TrustCardProps = {
  user: ChoiUser;
  publicView?: boolean;
};

export function TrustCard({ user, publicView }: TrustCardProps) {
  const confirmedDealsCount = getConfirmedDealsCount(user.id);
  const trustLevel = getTrustLevel(confirmedDealsCount);

  return (
    <section className="rounded-[24px] bg-white p-6 shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-leaf">
            Доверие Choi
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Текущий уровень</h2>
        </div>
        <TrustBadge confirmedDealsCount={confirmedDealsCount} compact />
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-2xl bg-mist p-4">
          <dt className="text-ink/52">Текущий уровень</dt>
          <dd className="mt-1 text-lg font-semibold text-ink">{trustLevel.name}</dd>
        </div>
        <div className="rounded-2xl bg-mist p-4">
          <dt className="text-ink/52">Подтверждённых сделок</dt>
          <dd className="mt-1 text-lg font-semibold text-ink">{confirmedDealsCount}</dd>
        </div>
        <div className="rounded-2xl bg-mist p-4">
          <dt className="text-ink/52">Телефон подтвержден</dt>
          <dd className="mt-1 text-lg font-semibold text-ink">
            {user.phoneVerified ? "Да" : "Нет"}
          </dd>
        </div>
        <div className="rounded-2xl bg-mist p-4">
          <dt className="text-ink/52">{publicView ? "Статус" : "Жалоб"}</dt>
          <dd className="mt-1 text-lg font-semibold text-ink">
            {publicView
              ? user.complaints === 0
                ? "Нарушений не обнаружено"
                : "Есть проверки"
              : user.complaints}
          </dd>
        </div>
        <div className="rounded-2xl bg-mist p-4 sm:col-span-2">
          <dt className="text-ink/52">Дата регистрации</dt>
          <dd className="mt-1 text-lg font-semibold text-ink">{user.joinedAt}</dd>
        </div>
      </dl>

      {!publicView ? (
        <div className="mt-6">
          <TrustProgress user={user} />
        </div>
      ) : null}
    </section>
  );
}
