"use client";

import { Heart, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import type { Listing } from "@/utils/listings";
import { getDistrictLabel, getSellerTrust } from "@/utils/listings";

type SellerCardProps = {
  listing: Listing;
};

export function SellerCard({ listing }: SellerCardProps) {
  const trust = getSellerTrust(listing.seller);
  const phone = listing.phone ?? "+998901112233";

  return (
    <aside className="rounded-[24px] bg-white p-6 shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
      <div className="flex items-start gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-mist text-xl font-semibold text-leaf">
          {listing.seller.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-ink">{listing.seller}</h2>
          <p className="mt-1 text-sm text-ink/58">{getDistrictLabel(listing.district)}</p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-mist p-4">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-leaf">
          <ShieldCheck size={18} />
          Уровень доверия Choi
        </p>
        <p className="mt-2 text-2xl font-semibold text-ink">{trust.level}</p>
        <p className="mt-1 text-sm text-ink/58">{trust.since}</p>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl border border-ink/10 p-4">
          <dt className="text-ink/52">Объявлений</dt>
          <dd className="mt-1 text-lg font-semibold text-ink">{trust.listings}</dd>
        </div>
        <div className="rounded-2xl border border-ink/10 p-4">
          <dt className="text-ink/52">Телефон</dt>
          <dd className="mt-1 text-sm font-semibold text-leaf">подтвержден</dd>
        </div>
      </dl>

      <div className="mt-6 grid gap-3">
        <button
          type="button"
          onClick={() => alert("Чат скоро будет доступен")}
          className="focus-ring inline-flex h-14 items-center justify-center gap-2 rounded-full bg-leaf px-5 text-base font-semibold text-white shadow-lg shadow-leaf/20 transition hover:bg-[#3f6d4d]"
        >
          <MessageCircle size={20} />
          Написать
        </button>
        <a
          href={`tel:${phone}`}
          className="focus-ring inline-flex h-14 items-center justify-center gap-2 rounded-full border border-ink/10 bg-white px-5 text-base font-semibold text-ink shadow-sm transition hover:border-leaf/30"
        >
          <Phone size={20} />
          Позвонить
        </a>
        <button
          type="button"
          className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-full bg-mist px-5 text-sm font-semibold text-ink transition hover:bg-[#e4eee7]"
        >
          <Heart size={18} />
          В избранное
        </button>
      </div>
    </aside>
  );
}
