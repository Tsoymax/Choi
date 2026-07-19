"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import type { Language } from "@/components/i18n";
import { ListingCard } from "@/components/ListingCard";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { TrustCard } from "@/components/profile/TrustCard";
import { ReportModal } from "@/components/reports/ReportModal";
import { ReviewSummary } from "@/components/reviews/ReviewSummary";
import { getReviewStatsForUser, type ReviewStats } from "@/lib/data/reviews";
import { hasSupabaseBrowserEnv } from "@/lib/auth/client";
import { createClient } from "@/utils/supabase/client";
import type { Listing } from "@/utils/listings";
import { getAllListings } from "@/utils/listings";
import type { ChoiUser } from "@/utils/users";
import { getUserById } from "@/utils/users";

type PublicProfileScreenProps = {
  userId: string;
};

export function PublicProfileScreen({ userId }: PublicProfileScreenProps) {
  const [language, setLanguage] = useState<Language>("ru");
  const [query, setQuery] = useState("");
  const [user, setUser] = useState<ChoiUser | undefined>(() => getUserById(userId));
  const [listings, setListings] = useState<Listing[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats>({
    total: 0,
    positive: 0,
    negative: 0,
    topTags: [],
    recentComments: []
  });

  useEffect(() => {
    setUser(getUserById(userId));
    setListings(getAllListings());
  }, [userId]);

  useEffect(() => {
    let mounted = true;

    async function loadReviewStats() {
      if (!hasSupabaseBrowserEnv()) {
        return;
      }

      const supabase = createClient();
      const stats = await getReviewStatsForUser(supabase, userId);

      if (mounted) {
        setReviewStats(stats);
      }
    }

    void loadReviewStats();

    return () => {
      mounted = false;
    };
  }, [userId]);

  const activeListings = useMemo(
    () =>
      listings.filter((listing) => {
        const status = listing.status ?? "active";
        return listing.sellerId === userId && (status === "active" || status === "reserved");
      }),
    [listings, userId]
  );

  if (!user) {
    return (
      <main className="min-h-screen bg-[#f7f5ef]">
        <Header
          language={language}
          onLanguageChange={setLanguage}
          query={query}
          onQueryChange={setQuery}
        />
        <section className="mx-auto max-w-3xl px-4 py-10">
          <div className="rounded-[24px] bg-white p-8 text-center shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
            <h1 className="text-3xl font-semibold text-ink">Профиль не найден</h1>
            <Link
              href="/"
              className="focus-ring mt-6 inline-flex h-12 items-center rounded-full bg-leaf px-6 text-sm font-semibold text-white"
            >
              На главную
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f5ef]">
      <Header
        language={language}
        onLanguageChange={setLanguage}
        query={query}
        onQueryChange={setQuery}
      />

      <section className="mx-auto max-w-[1504px] px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="focus-ring mb-6 inline-flex h-11 items-center gap-2 rounded-full border border-ink/10 bg-white px-5 text-sm font-semibold text-ink shadow-sm transition hover:border-leaf/30"
        >
          <ArrowLeft size={17} />
          На главную
        </Link>

        <div className="grid items-start gap-8 lg:grid-cols-[420px_1fr]">
          <div className="space-y-6">
            <ProfileHeader
              user={user}
              listingsCount={activeListings.length}
              reviewStats={reviewStats}
            />
            <TrustCard user={user} publicView reviewStats={reviewStats} />
            <ReviewSummary stats={reviewStats} />
            <div className="rounded-[24px] bg-white p-5 shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
              <ReportModal
                targetType="user"
                reportedUserId={userId}
                triggerLabel="Пожаловаться на пользователя"
              />
            </div>
          </div>

          <section className="rounded-[24px] bg-white p-5 shadow-[0_18px_60px_rgba(24,32,29,0.08)] sm:p-6">
            <h2 className="text-2xl font-semibold text-ink">Активные объявления</h2>
            {activeListings.length > 0 ? (
              <div className="mt-6 grid gap-5 xl:grid-cols-2">
                {activeListings.map((listing) => (
                  <ListingCard key={listing.id} product={listing} language="ru" />
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-[24px] bg-mist p-8 text-center">
                <p className="font-semibold text-ink">Активных объявлений пока нет</p>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
