"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, ShieldCheck } from "lucide-react";
import type { Listing } from "@/utils/listings";
import { getDistrictLabel } from "@/utils/listings";
import { FAVORITES_EVENT, isFavoriteAsync, isUuid, toggleFavoriteAsync } from "@/utils/favorites";
import { createConversation } from "@/utils/chat";
import { hasSupabaseBrowserEnv, requireCurrentUser } from "@/lib/auth/client";
import { createConversation as createRemoteConversation } from "@/lib/data/conversations";
import { createClient } from "@/utils/supabase/client";
import { getUserById } from "@/utils/users";
import { getConfirmedDealsCount } from "@/utils/deals";
import { TrustStatus } from "@/components/trust/TrustStatus";
import { ReportModal } from "@/components/reports/ReportModal";
import { getReviewStatsForUser, type ReviewStats } from "@/lib/data/reviews";
import { getProfileById, type ProfileRow } from "@/lib/data/profiles";

type SellerCardProps = {
  listing: Listing;
};

const monthNames = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря"
];

function formatJoinedDate(createdAt?: string | null, fallbackYear = 2026) {
  if (createdAt) {
    const date = new Date(createdAt);

    if (!Number.isNaN(date.getTime())) {
      return `На Choi с ${monthNames[date.getMonth()]} ${date.getFullYear()} года`;
    }
  }

  return `На Choi с ${fallbackYear} года`;
}

function getAccountAgeMonths(createdAt?: string | null, fallbackYear = 2026) {
  const start = createdAt ? new Date(createdAt) : new Date(fallbackYear, 0, 1);

  if (Number.isNaN(start.getTime())) {
    return 0;
  }

  const now = new Date();
  return Math.max(
    0,
    (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth()
  );
}

export function SellerCard({ listing }: SellerCardProps) {
  const router = useRouter();
  const sellerId = listing.sellerId ?? "seller-akmal";
  const sellerUser = getUserById(sellerId);
  const confirmedDealsCount = getConfirmedDealsCount(sellerId);
  const [favorite, setFavorite] = useState(false);
  const [sellerProfile, setSellerProfile] = useState<ProfileRow | null>(null);
  const [reviewStats, setReviewStats] = useState<ReviewStats>({
    total: 0,
    positive: 0,
    negative: 0,
    topTags: [],
    recentComments: []
  });

  useEffect(() => {
    const syncFavorite = () => {
      void isFavoriteAsync(listing.id).then(setFavorite);
    };

    syncFavorite();
    window.addEventListener(FAVORITES_EVENT, syncFavorite);
    window.addEventListener("storage", syncFavorite);

    return () => {
      window.removeEventListener(FAVORITES_EVENT, syncFavorite);
      window.removeEventListener("storage", syncFavorite);
    };
  }, [listing.id]);

  useEffect(() => {
    let mounted = true;

    async function loadReviewStats() {
      if (!hasSupabaseBrowserEnv() || !sellerId || !isUuid(sellerId)) {
        return;
      }

      const supabase = createClient();
      const [profile, stats] = await Promise.all([
        getProfileById(supabase, sellerId),
        getReviewStatsForUser(supabase, sellerId)
      ]);

      if (mounted) {
        setSellerProfile(profile);
        setReviewStats(stats);
      }
    }

    void loadReviewStats();

    return () => {
      mounted = false;
    };
  }, [sellerId]);

  const sellerAddressType =
    sellerProfile?.address_type === "opa" || sellerProfile?.address_type === "aka"
      ? sellerProfile.address_type
      : sellerUser?.addressMode ?? "aka";
  const sellerJoinedText = formatJoinedDate(
    sellerProfile?.created_at,
    sellerUser?.joinedAt ?? 2026
  );
  const accountAgeMonths = getAccountAgeMonths(
    sellerProfile?.created_at,
    sellerUser?.joinedAt ?? 2026
  );

  return (
    <aside className="rounded-[24px] bg-white p-6 shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
      <Link
        href={`/profile/${sellerId}`}
        className="focus-ring flex items-start gap-4 rounded-2xl transition hover:bg-mist/60"
      >
        <div className="grid h-14 w-14 place-items-center rounded-full bg-mist text-xl font-semibold text-leaf">
          {listing.seller.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-ink">{listing.seller}</h2>
          <p className="mt-1 text-sm text-ink/58">{getDistrictLabel(listing.district)}</p>
        </div>
      </Link>

      <Link href={`/profile/${sellerId}`} className="focus-ring mt-5 block rounded-2xl bg-mist p-4">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-leaf">
          <ShieldCheck size={18} />
          Статус доверия Choi
        </p>
        <div className="mt-3">
          <TrustStatus
            addressType={sellerAddressType}
            signals={{
              confirmedDealsCount,
              positiveReviewCount: reviewStats.positive,
              negativeReviewCount: reviewStats.negative,
              complaints: sellerUser?.complaints ?? 0,
              accountAgeMonths
            }}
          />
        </div>
        <p className="mt-2 text-sm text-ink/58">{sellerJoinedText}</p>
      </Link>

      <div className="mt-6 grid gap-3">
        <button
          type="button"
          onClick={async () => {
            const user = await requireCurrentUser(router, `/listing/${listing.id}`);

            if (!user) {
              return;
            }

            if (hasSupabaseBrowserEnv() && listing.sellerId) {
              try {
                const supabase = createClient();
                const conversation = await createRemoteConversation(
                  supabase,
                  listing.id,
                  user.id,
                  listing.sellerId
                );
                router.push(`/chat/${conversation.id}` as never);
                return;
              } catch {
                // Локальные тестовые объявления продолжают работать через fallback-чат.
              }
            }

            const conversation = createConversation(listing);
            router.push(`/chat/${conversation.id}` as never);
          }}
          className="focus-ring inline-flex h-14 items-center justify-center gap-2 rounded-full bg-leaf px-5 text-base font-semibold text-white shadow-lg shadow-leaf/20 transition hover:bg-[#3f6d4d]"
        >
          <MessageCircle size={20} />
          Назначить встречу
        </button>
        <button
          type="button"
          onClick={async () => {
            const user = await requireCurrentUser(router, `/listing/${listing.id}`);

            if (!user) {
              return;
            }

            const nextFavorite = !favorite;
            setFavorite(nextFavorite);
            await toggleFavoriteAsync(listing.id);
          }}
          className={`focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition ${
            favorite ? "bg-leaf text-white" : "bg-mist text-ink hover:bg-[#e4eee7]"
          }`}
        >
          <Heart size={18} className={favorite ? "fill-white" : ""} />
          В избранное
        </button>
        <ReportModal
          targetType="listing"
          listingId={listing.id}
          reportedUserId={listing.sellerId ?? null}
          triggerLabel="Пожаловаться"
        />
      </div>
    </aside>
  );
}
