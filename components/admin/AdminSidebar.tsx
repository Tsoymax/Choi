"use client";

import { Flag, ShieldAlert, Store, Users } from "lucide-react";

export type AdminTab = "reports" | "listings" | "users";

type AdminSidebarProps = {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  counts: {
    reports: number;
    listings: number;
    users: number;
  };
};

const tabs = [
  { id: "reports", label: "Жалобы", icon: Flag },
  { id: "listings", label: "Объявления", icon: Store },
  { id: "users", label: "Пользователи", icon: Users }
] as const;

export function AdminSidebar({ activeTab, onTabChange, counts }: AdminSidebarProps) {
  return (
    <aside className="rounded-[24px] bg-white p-3 shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
      <div className="mb-3 flex items-center gap-2 px-3 py-2 text-sm font-semibold text-leaf">
        <ShieldAlert size={18} />
        Модерация
      </div>
      <div className="grid gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`focus-ring flex h-12 items-center justify-between rounded-2xl px-4 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? "bg-mist text-leaf"
                  : "text-ink/66 hover:bg-mist/70"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <Icon size={17} />
                {tab.label}
              </span>
              <span className="rounded-full bg-white px-2 py-1 text-xs text-ink/60 shadow-sm">
                {counts[tab.id]}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
