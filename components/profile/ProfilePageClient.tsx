"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import type { Language } from "@/components/i18n";
import { DealHistory } from "@/components/profile/DealHistory";
import { MyListings } from "@/components/profile/MyListings";
import { ProfileEditModal } from "@/components/profile/ProfileEditModal";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { TrustCard } from "@/components/profile/TrustCard";
import { createClient } from "@/utils/supabase/client";
import { hasSupabaseBrowserEnv } from "@/lib/auth/client";
import { LISTINGS_EVENT } from "@/utils/listings";
import {
  USER_EVENT,
  type ChoiUser,
  getCurrentUser,
  getCurrentUserListingsCount
} from "@/utils/users";
import { profileToChoiUser, updateCurrentProfile } from "@/lib/data/profiles";
import { getReviewStatsForUser, type ReviewStats } from "@/lib/data/reviews";

type ProfilePageClientProps = {
  initialUser: ChoiUser;
  isSupabaseUser: boolean;
};

export function ProfilePageClient({
  initialUser,
  isSupabaseUser
}: ProfilePageClientProps) {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("ru");
  const [query, setQuery] = useState("");
  const [user, setUser] = useState<ChoiUser>(initialUser);
  const [listingsCount, setListingsCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [reviewStats, setReviewStats] = useState<ReviewStats>({
    total: 0,
    positive: 0,
    negative: 0,
    topTags: [],
    recentComments: []
  });

  useEffect(() => {
    const syncProfile = () => {
      if (!isSupabaseUser) {
        setUser(getCurrentUser());
      }

      setListingsCount(getCurrentUserListingsCount());
    };

    syncProfile();
    window.addEventListener(USER_EVENT, syncProfile);
    window.addEventListener(LISTINGS_EVENT, syncProfile);
    window.addEventListener("storage", syncProfile);

    return () => {
      window.removeEventListener(USER_EVENT, syncProfile);
      window.removeEventListener(LISTINGS_EVENT, syncProfile);
      window.removeEventListener("storage", syncProfile);
    };
  }, [isSupabaseUser]);

  useEffect(() => {
    let mounted = true;

    async function loadReviewStats() {
      if (!hasSupabaseBrowserEnv() || !user.id) {
        return;
      }

      const supabase = createClient();
      const stats = await getReviewStatsForUser(supabase, user.id);

      if (mounted) {
        setReviewStats(stats);
      }
    }

    void loadReviewStats();

    return () => {
      mounted = false;
    };
  }, [user.id]);

  async function saveSupabaseProfile(input: {
    name: string;
    district: string;
    addressMode: "aka" | "opa";
  }) {
    const { profile, error } = await updateCurrentProfile({
      name: input.name,
      district: input.district || null,
      addressType: input.addressMode
    });

    if (error || !profile) {
      throw error ?? new Error("Не удалось сохранить профиль.");
    }

    const nextUser = profileToChoiUser(profile);
    setSavedMessage("Профиль сохранён");
    window.dispatchEvent(new Event(USER_EVENT));
    window.setTimeout(() => setSavedMessage(""), 2800);

    return nextUser;
  }

  async function signOut() {
    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/" as never);
    router.refresh();
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
        <div className="mb-8">
          <h1 className="text-4xl font-semibold tracking-normal text-ink sm:text-5xl">
            Профиль
          </h1>
          <p className="mt-3 text-lg text-ink/62">
            Ваше доверие, объявления и настройки Choi
          </p>
          {savedMessage ? (
            <p className="mt-4 inline-flex rounded-full bg-mist px-4 py-2 text-sm font-semibold text-leaf">
              {savedMessage}
            </p>
          ) : null}
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[420px_1fr]">
          <div className="space-y-6">
            <ProfileHeader
              user={user}
              listingsCount={listingsCount}
              isCurrentUser
              reviewStats={reviewStats}
              onEdit={() => setIsEditing(true)}
            />
            <TrustCard user={user} reviewStats={reviewStats} />
            {isSupabaseUser ? (
              <button
                type="button"
                onClick={signOut}
                disabled={isSigningOut}
                className="focus-ring h-12 w-full rounded-full border border-ink/10 bg-white px-5 text-sm font-semibold text-ink shadow-sm transition hover:border-leaf/30 disabled:cursor-wait disabled:opacity-70"
              >
                {isSigningOut ? "Выходим..." : "Выйти"}
              </button>
            ) : null}
          </div>
          <div className="space-y-6">
            <MyListings />
            <DealHistory userId={user.id} />
          </div>
        </div>
      </section>

      {isEditing ? (
        <ProfileEditModal
          user={user}
          onClose={() => setIsEditing(false)}
          onSave={setUser}
          onSaveProfile={isSupabaseUser ? saveSupabaseProfile : undefined}
        />
      ) : null}
    </main>
  );
}
