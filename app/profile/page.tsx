"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import type { Language } from "@/components/i18n";
import { MyListings } from "@/components/profile/MyListings";
import { ProfileEditModal } from "@/components/profile/ProfileEditModal";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { TrustCard } from "@/components/profile/TrustCard";
import {
  CURRENT_USER_ID,
  USER_EVENT,
  type ChoiUser,
  getCurrentUser,
  getCurrentUserListingsCount
} from "@/utils/users";
import { LISTINGS_EVENT } from "@/utils/listings";

export default function ProfilePage() {
  const [language, setLanguage] = useState<Language>("ru");
  const [query, setQuery] = useState("");
  const [user, setUser] = useState<ChoiUser>(() => getCurrentUser());
  const [listingsCount, setListingsCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const syncProfile = () => {
      setUser(getCurrentUser());
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
  }, []);

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
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[420px_1fr]">
          <div className="space-y-6">
            <ProfileHeader
              user={{ ...user, id: CURRENT_USER_ID }}
              listingsCount={listingsCount}
              isCurrentUser
              onEdit={() => setIsEditing(true)}
            />
            <TrustCard user={user} />
          </div>
          <MyListings />
        </div>
      </section>

      {isEditing ? (
        <ProfileEditModal
          user={user}
          onClose={() => setIsEditing(false)}
          onSave={setUser}
        />
      ) : null}
    </main>
  );
}
