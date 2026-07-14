import type { ChoiUser } from "@/utils/users";
import { getConfirmedDealsCount } from "@/utils/deals";
import { getTrustLevel, getTrustProgressPercent } from "@/lib/trust/getTrustLevel";

type TrustProgressProps = {
  user: ChoiUser;
};

export function TrustProgress({ user }: TrustProgressProps) {
  const confirmedDealsCount = getConfirmedDealsCount(user.id);
  const level = getTrustLevel(confirmedDealsCount);
  const percent = getTrustProgressPercent(confirmedDealsCount);

  return (
    <div>
      <div className="h-3 overflow-hidden rounded-full bg-mist">
        <div
          className="h-full rounded-full bg-leaf transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-3 text-sm font-medium text-ink/62">
        {level.nextLevel
          ? `До уровня «${level.nextLevel.name}» осталось ${level.dealsUntilNextLevel} сделки`
          : "Вы достигли высшего уровня доверия Choi"}
      </p>
    </div>
  );
}
