"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import type { Language } from "@/components/i18n";
import { DealReviewForm } from "@/components/reviews/DealReviewForm";
import { createClient } from "@/utils/supabase/client";
import { getCurrentUser } from "@/lib/auth/client";
import { getDealById, type RemoteDealRow } from "@/lib/data/deals";
import { getProfileById, type ProfileRow } from "@/lib/data/profiles";
import { getReviewByDealAndReviewer } from "@/lib/data/reviews";

type DealReviewPageClientProps = {
  dealId: string;
};

export function DealReviewPageClient({ dealId }: DealReviewPageClientProps) {
  const [language, setLanguage] = useState<Language>("ru");
  const [query, setQuery] = useState("");
  const [deal, setDeal] = useState<RemoteDealRow | null>(null);
  const [reviewedProfile, setReviewedProfile] = useState<ProfileRow | null>(null);
  const [currentUserId, setCurrentUserId] = useState("");
  const [hasExistingReview, setHasExistingReview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadDeal() {
      const supabase = createClient();
      const user = await getCurrentUser();

      if (!user) {
        if (mounted) {
          setError("Войдите в профиль, чтобы оставить отзыв.");
          setIsLoading(false);
        }
        return;
      }

      const nextDeal = await getDealById(supabase, dealId);
      if (!nextDeal || nextDeal.status !== "confirmed") {
        if (mounted) {
          setError("Отзыв можно оставить только после подтверждённой сделки.");
          setIsLoading(false);
        }
        return;
      }

      const isSeller = user.id === nextDeal.seller_id;
      const isBuyer = user.id === nextDeal.buyer_id;

      if (!isSeller && !isBuyer) {
        if (mounted) {
          setError("Этот отзыв доступен только участникам сделки.");
          setIsLoading(false);
        }
        return;
      }

      const reviewedUserId = isSeller ? nextDeal.buyer_id : nextDeal.seller_id;
      if (!reviewedUserId) {
        if (mounted) {
          setError("Не удалось определить второго участника сделки.");
          setIsLoading(false);
        }
        return;
      }

      const [profile, existingReview] = await Promise.all([
        getProfileById(supabase, reviewedUserId),
        getReviewByDealAndReviewer(supabase, nextDeal.id, user.id)
      ]);

      if (mounted) {
        setCurrentUserId(user.id);
        setDeal(nextDeal);
        setReviewedProfile(profile);
        setHasExistingReview(Boolean(existingReview));
        setIsLoading(false);
      }
    }

    void loadDeal();

    return () => {
      mounted = false;
    };
  }, [dealId]);

  const reviewedUserId = useMemo(() => {
    if (!deal || !currentUserId) return "";
    return currentUserId === deal.seller_id ? deal.buyer_id ?? "" : deal.seller_id;
  }, [currentUserId, deal]);

  return (
    <main className="min-h-screen bg-[#f7f5ef]">
      <Header
        language={language}
        onLanguageChange={setLanguage}
        query={query}
        onQueryChange={setQuery}
      />

      <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/notifications"
          className="focus-ring mb-6 inline-flex h-11 items-center gap-2 rounded-full border border-ink/10 bg-white px-5 text-sm font-semibold text-ink shadow-sm transition hover:border-leaf/30"
        >
          <ArrowLeft size={17} />
          К уведомлениям
        </Link>

        <div className="rounded-[24px] bg-white p-5 shadow-[0_18px_60px_rgba(24,32,29,0.08)] sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-leaf">
            Отзыв после сделки
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">
            Как прошла сделка?
          </h1>
          <p className="mt-3 text-ink/62">
            Отзыв помогает Choi точнее считать доверие и быстрее замечать проблемы.
          </p>

          <div className="mt-6">
            {isLoading ? (
              <div className="rounded-[20px] bg-mist p-5 text-sm font-semibold text-ink/62">
                Загружаем сделку...
              </div>
            ) : error ? (
              <div className="rounded-[20px] bg-mist p-5">
                <p className="font-semibold text-ink">{error}</p>
                <Link
                  href="/"
                  className="focus-ring mt-4 inline-flex h-11 items-center rounded-full bg-leaf px-5 text-sm font-semibold text-white"
                >
                  Смотреть объявления
                </Link>
              </div>
            ) : submitted || hasExistingReview ? (
              <div className="rounded-[20px] border border-leaf/15 bg-leaf/10 p-5">
                <p className="text-lg font-semibold text-leaf">Спасибо!</p>
                <p className="mt-1 text-sm text-ink/68">
                  Ваш отзыв помогает сделать Choi безопаснее.
                </p>
                <Link
                  href="/profile"
                  className="focus-ring mt-4 inline-flex h-11 items-center rounded-full bg-leaf px-5 text-sm font-semibold text-white"
                >
                  Открыть профиль
                </Link>
              </div>
            ) : deal && reviewedUserId ? (
              <DealReviewForm
                dealId={deal.id}
                reviewedUserId={reviewedUserId}
                reviewedUserName={reviewedProfile?.name ?? "участником сделки"}
                onSubmitted={() => setSubmitted(true)}
              />
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
