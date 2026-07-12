"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown, Heart, MapPin, MessageCircle, Plus, Search } from "lucide-react";
import type { Language } from "./i18n";
import { translations } from "./i18n";
import { FAVORITES_EVENT, getFavoriteIds } from "@/utils/favorites";
import { CHAT_EVENT, getUnreadConversationCount } from "@/utils/chat";

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
  const t = translations[language];
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const syncFavoriteCount = () => setFavoriteCount(getFavoriteIds().length);

    syncFavoriteCount();
    window.addEventListener(FAVORITES_EVENT, syncFavoriteCount);
    window.addEventListener("storage", syncFavoriteCount);

    return () => {
      window.removeEventListener(FAVORITES_EVENT, syncFavoriteCount);
      window.removeEventListener("storage", syncFavoriteCount);
    };
  }, []);

  useEffect(() => {
    const syncUnreadCount = () => setUnreadCount(getUnreadConversationCount());

    syncUnreadCount();
    window.addEventListener(CHAT_EVENT, syncUnreadCount);
    window.addEventListener("storage", syncUnreadCount);

    return () => {
      window.removeEventListener(CHAT_EVENT, syncUnreadCount);
      window.removeEventListener("storage", syncUnreadCount);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-ink/5 bg-white/92 backdrop-blur-xl">
      <div className="mx-auto flex h-24 w-full max-w-[1504px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <a href="#" className="flex shrink-0 items-center" aria-label="Choi home">
          <Image src="/logo.svg" alt="Choi" width={180} height={72} priority />
        </a>

        <button className="focus-ring hidden h-14 shrink-0 items-center gap-2 rounded-full border border-ink/10 bg-white px-5 text-base font-semibold text-ink shadow-sm md:flex">
          <MapPin size={21} />
          Ташкент
          <ChevronDown size={17} />
        </button>

        <label className="hidden h-14 min-w-0 flex-1 items-center gap-3 rounded-full border border-ink/10 bg-white px-6 shadow-sm lg:flex">
          <Search size={22} className="text-ink/45" />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            className="w-full bg-transparent text-base font-medium text-ink placeholder:text-ink/40 focus:outline-none"
            placeholder={t.searchPlaceholder}
          />
        </label>

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
            className="focus-ring relative grid h-12 w-12 place-items-center rounded-full text-ink hover:bg-mist"
            aria-label="Сообщения"
          >
            <MessageCircle size={25} />
            {unreadCount > 0 ? (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-leaf px-1 text-[11px] font-semibold leading-none text-white shadow-sm">
                {unreadCount}
              </span>
            ) : null}
          </Link>
          <button className="focus-ring hidden h-12 items-center px-3 text-base font-semibold text-ink md:flex">
            {t.signIn}
          </button>
          <Link
            href="/sell"
            className="focus-ring inline-flex h-14 items-center gap-2 rounded-full bg-leaf px-4 text-sm font-semibold text-white shadow-lg shadow-leaf/20 transition hover:bg-[#3f6d4d] sm:px-6 sm:text-base"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">{t.postListing}</span>
            <span className="sm:hidden">{t.sell}</span>
          </Link>
          <button
            onClick={() => onLanguageChange(language === "ru" ? "uz" : "ru")}
            className="focus-ring inline-flex h-14 items-center gap-2 rounded-full border border-ink/10 bg-white px-4 text-sm font-semibold uppercase text-ink shadow-sm sm:px-5"
          >
            {language === "ru" ? "РУ" : "UZ"}
            <ChevronDown size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
