import type { ChoiUser } from "@/utils/users";
import { getTrustProgress } from "@/utils/trust";

type TrustProgressProps = {
  user: ChoiUser;
};

export function TrustProgress({ user }: TrustProgressProps) {
  const progress = getTrustProgress(user);

  return (
    <div>
      <div className="h-3 overflow-hidden rounded-full bg-mist">
        <div
          className="h-full rounded-full bg-leaf transition-all"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
      <p className="mt-3 text-sm font-medium text-ink/62">{progress.text}</p>
    </div>
  );
}
