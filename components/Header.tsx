"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Heart, MessageCircle, Plus, Search } from "lucide-react";
import type { Language } from "./i18n";
import { translations } from "./i18n";
import { FAVORITES_EVENT, getFavoriteIdsAsync } from "@/utils/favorites";
import { USER_EVENT, getCurrentUser as getFallbackCurrentUser } from "@/utils/users";
import { useUnreadChatCount } from "@/lib/chat/useUnreadChatCount";
import { clearCachedAuthUser, getCurrentUser, hasSupabaseBrowserEnv } from "@/lib/auth/client";
import { ensureProfileForUser, type ProfileRow } from "@/lib/data/profiles";
import { createClient } from "@/utils/supabase/client";
import { DistrictSelector } from "@/components/location/DistrictSelector";
import { DealNotificationModal } from "@/components/deals/DealNotificationModal";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import {
  LOCATION_EVENT,
  loadHomeDistrict,
  saveHomeDistrict
} from "@/lib/location/currentLocation";

type HeaderProps = {
  language: Language;
  onLanguageChange: (language: Language) => void;
  query: string;
  onQueryChange: (query: string) => void;
};

export function Header({
  language,
  onLanguageChange,
  query,
  onQueryChange
}: HeaderProps) {
  const router = useRouter();
  const t = translations[language];
  const [favoriteCount, setFavoriteCount] = useState(0);
  const unreadCount = useUnreadChatCount();
  const [currentUser, setCurrentUser] = useState<{ name: string } | null>(null);
  const [homeDistrict, setHomeDistrict] = useState("yunusabad");
  const [currentProfile, setCurrentProfile] = useState<ProfileRow | null>(null);

  useEffect(() => {
    const syncFavoriteCount = () => {
      void getFavoriteIdsAsync().then((ids) => setFavoriteCount(ids.length));
    };

    syncFavoriteCount();
    window.addEventListener(FAVORITES_EVENT, syncFavoriteCount);
    window.addEventListener("storage", syncFavoriteCount);

    return () => {
      window.removeEventListener(FAVORITES_EVENT, syncFavoriteCount);
      window.removeEventListener("storage", syncFavoriteCount);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const syncCurrentUser = async () => {
      if (!hasSupabaseBrowserEnv()) {
        setCurrentUser(getFallbackCurrentUser());
        return;
      }

      const supabase = createClient();
      const user = await getCurrentUser();

      if (!mounted) {
        return;
      }

      if (!user) {
        setCurrentUser(null);
        return;
      }

      const { profile, error } = await ensureProfileForUser(supabase, user);

      if (!mounted) {
        return;
      }

      if (error) {
        setCurrentUser({
          name:
            user.user_metadata?.name ??
            user.user_metadata?.full_name ??
            user.email?.split("@")[0] ??
            "Choi"
        });
        return;
      }

      setCurrentUser({
        name:
          profile?.name ??
          user.user_metadata?.name ??
          user.email?.split("@")[0] ??
          "Choi"
      });
    };

    const supabase = hasSupabaseBrowserEnv() ? createClient() : null;
    const authSubscription = supabase?.auth.onAuthStateChange(() => {
      clearCachedAuthUser();
      void syncCurrentUser();
    });

    void syncCurrentUser();
    window.addEventListener(USER_EVENT, syncCurrentUser);
    window.addEventListener("storage", syncCurrentUser);

    return () => {
      mounted = false;
      authSubscription?.data.subscription.unsubscribe();
      window.removeEventListener(USER_EVENT, syncCurrentUser);
      window.removeEventListener("storage", syncCurrentUser);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function syncLocation() {
      const result = await loadHomeDistrict();

      if (!mounted) {
        return;
      }

      setHomeDistrict(result.district);
      setCurrentProfile(result.profile);
    }

    void syncLocation();
    window.addEventListener(LOCATION_EVENT, syncLocation);
    window.addEventListener("storage", syncLocation);

    return () => {
      mounted = false;
      window.removeEventListener(LOCATION_EVENT, syncLocation);
      window.removeEventListener("storage", syncLocation);
    };
  }, []);

  async function changeDistrict(nextDistrict: string) {
    setHomeDistrict(nextDistrict);
    const result = await saveHomeDistrict(nextDistrict, currentProfile);
    setCurrentProfile(result.profile);
  }

  function openSearch() {
    const params = new URLSearchParams();
    if (query.trim()) {
      params.set("q", query.trim());
    }
    params.set("district", homeDistrict);

    router.push(`/search${params.toString() ? `?${params}` : ""}` as never);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink/5 bg-white/92 backdrop-blur-xl">
      <DealNotificationModal />
      <div className="mx-auto flex min-h-24 w-full max-w-[1504px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8 xl:flex-nowrap">
        <Link
          href="/"
          className="flex shrink-0 cursor-pointer items-center transition hover:opacity-85"
          aria-label="Choi home"
        >
          <Image src="/logo.svg" alt="Choi" width={180} height={72} priority />
        </Link>

        <div className="md:hidden">
          <DistrictSelector
            district={homeDistrict}
            compact
            onDistrictChange={changeDistrict}
          />
        </div>

        <div className="hidden md:block">
          <DistrictSelector
            district={homeDistrict}
            onDistrictChange={changeDistrict}
          />
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            openSearch();
          }}
          className="order-last hidden h-12 w-full min-w-0 items-center gap-3 rounded-full border border-ink/10 bg-white px-5 shadow-sm md:flex xl:order-none xl:h-14 xl:w-auto xl:flex-1 xl:px-6"
        >
          <Search size={22} className="text-ink/45" />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            className="w-full bg-transparent text-base font-medium text-ink placeholder:text-ink/40 focus:outline-none"
            placeholder={t.searchPlaceholder}
          />
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-4">
          <Link
            href="/favorites"
            className="focus-ring relative grid h-12 w-12 place-items-center rounded-full text-ink hover:bg-mist"
            aria-label="Избранное"
          >
            <Heart size={25} />
            {favoriteCount > 0 ? (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-leaf px-1 text-[11px] font-semibold leading-none text-white shadow-sm">
                {favoriteCount}
              </span>
            ) : null}
          </Link>
          <Link
            href="/chat"
            className="focus-ring relative hidden h-12 w-12 place-items-center rounded-full text-ink hover:bg-mist md:grid"
            aria-label="Сообщения"
          >
            <MessageCircle size={25} />
            {unreadCount > 0 ? (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-leaf px-1 text-[11px] font-semibold leading-none text-white shadow-sm">
                {unreadCount}
              </span>
            ) : null}
          </Link>
          <NotificationBell />
          <Link
            href={(currentUser ? "/profile" : "/login") as never}
            className="focus-ring hidden h-12 items-center gap-2 rounded-full bg-mist px-2 text-base font-semibold text-ink transition hover:bg-[#e4eee7] md:flex xl:px-3"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-leaf text-sm font-semibold text-white">
              {(currentUser?.name ?? "В").slice(0, 1).toUpperCase()}
            </span>
            <span className="hidden lg:inline">{currentUser?.name ?? "Вход"}</span>
          </Link>
          <Link
            href="/sell"
            className="focus-ring hidden h-12 items-center gap-2 rounded-full bg-leaf px-4 text-sm font-semibold text-white shadow-lg shadow-leaf/20 transition hover:bg-[#3f6d4d] md:inline-flex xl:h-14 xl:px-6 xl:text-base"
          >
            <Plus size={20} />
            <span className="hidden xl:inline">{t.postListing}</span>
            <span className="xl:hidden">{t.sell}</span>
          </Link>
          <button
            onClick={() => onLanguageChange(language === "ru" ? "uz" : "ru")}
            className="focus-ring hidden h-12 items-center gap-2 rounded-full border border-ink/10 bg-white px-4 text-sm font-semibold uppercase text-ink shadow-sm lg:inline-flex xl:h-14 xl:px-5"
          >
            {language === "ru" ? "РУ" : "UZ"}
            <ChevronDown size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
