"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, Plus, Search, User } from "lucide-react";
import { useEffect, useState } from "react";
import { CHAT_EVENT, getUnreadConversationCount } from "@/utils/chat";

type NavItem = {
  label: string;
  href: string;
  key: "home" | "search" | "sell" | "chat" | "profile";
  icon: typeof Home;
};

const navItems: NavItem[] = [
  { label: "Главная", href: "/", key: "home", icon: Home },
  { label: "Поиск", href: "/search", key: "search", icon: Search },
  { label: "Продать", href: "/sell", key: "sell", icon: Plus },
  { label: "Чаты", href: "/chat", key: "chat", icon: MessageCircle },
  { label: "Профиль", href: "/profile", key: "profile", icon: User }
];

function isActivePath(pathname: string, key: NavItem["key"]) {
  if (key === "home") {
    return pathname === "/";
  }

  if (key === "chat") {
    return pathname === "/chat";
  }

  if (key === "profile") {
    return pathname === "/profile" || pathname.startsWith("/profile/");
  }

  return pathname === `/${key}` || pathname.startsWith(`/${key}/`);
}

export function MobileBottomNav() {
  const pathname = usePathname() ?? "/";
  const [unreadCount, setUnreadCount] = useState(0);

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

  if (pathname.startsWith("/chat/")) {
    return null;
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-ink/10 bg-white/95 px-3 pt-2 shadow-[0_-14px_38px_rgba(24,32,29,0.12)] backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 8px)" }}
      aria-label="Мобильная навигация"
    >
      <div className="mx-auto grid max-w-md grid-cols-5 items-end gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActivePath(pathname, item.key);
          const isSell = item.key === "sell";

          if (isSell) {
            return (
              <Link
                key={item.key}
                href={item.href as never}
                className="focus-ring flex min-h-[60px] flex-col items-center justify-end gap-1 rounded-2xl text-[11px] font-semibold text-leaf"
                aria-current={active ? "page" : undefined}
              >
                <span className="grid h-12 w-12 -translate-y-1 place-items-center rounded-full bg-leaf text-white shadow-lg shadow-leaf/25 transition">
                  <Icon size={24} strokeWidth={2.4} />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.key}
              href={item.href as never}
              className={`focus-ring relative flex min-h-[60px] flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-semibold transition ${
                active ? "text-leaf" : "text-ink/55 hover:text-ink"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <span className="relative grid h-7 w-7 place-items-center">
                <Icon size={22} strokeWidth={active ? 2.5 : 2.1} />
                {item.key === "chat" && unreadCount > 0 ? (
                  <span className="absolute -right-2 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-leaf px-1 text-[10px] font-bold leading-none text-white shadow-sm">
                    {unreadCount}
                  </span>
                ) : null}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
