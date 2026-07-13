import { MapPin, ShieldCheck } from "lucide-react";
import type { ChoiUser } from "@/utils/users";
import { getDistrictLabel } from "@/utils/listings";
import { getTrustLevel } from "@/utils/trust";
import { TrustBadge } from "./TrustBadge";

type ProfileHeaderProps = {
  user: ChoiUser;
  listingsCount: number;
  isCurrentUser?: boolean;
  onEdit?: () => void;
};

export function ProfileHeader({
  user,
  listingsCount,
  isCurrentUser,
  onEdit
}: ProfileHeaderProps) {
  const trustLevel = getTrustLevel(user);

  return (
    <section className="rounded-[24px] bg-white p-6 shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="grid h-24 w-24 shrink-0 place-items-center rounded-[28px] bg-mist text-4xl font-semibold text-leaf">
          {user.avatar ? null : user.name.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-ink">{user.name}</h1>
              <div className="mt-3">
                <TrustBadge level={trustLevel} />
              </div>
            </div>
            {isCurrentUser ? (
              <button
                type="button"
                onClick={onEdit}
                className="focus-ring h-11 rounded-full border border-ink/10 bg-white px-5 text-sm font-semibold text-ink shadow-sm transition hover:border-leaf/30"
              >
                Редактировать профиль
              </button>
            ) : null}
          </div>

          <div className="mt-5 grid gap-3 text-sm text-ink/62 sm:grid-cols-2">
            <p className="inline-flex items-center gap-2">
              <MapPin size={17} className="text-leaf" />
              {user.district ? getDistrictLabel(user.district) : "Район не указан"}, {user.city}
            </p>
            <p className="inline-flex items-center gap-2">
              <ShieldCheck size={17} className="text-leaf" />
              На Choi с {user.joinedAt} года
            </p>
            <p className="font-semibold text-ink">{listingsCount} объявлений</p>
          </div>
        </div>
      </div>
    </section>
  );
}
