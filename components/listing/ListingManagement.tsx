"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, MoreHorizontal, PackageCheck, X } from "lucide-react";
import type { Listing } from "@/utils/listings";
import { updateStoredListingStatus } from "@/utils/listings";
import {
  createDealForListing,
  getDealInterlocutors,
  type DealInterlocutor
} from "@/utils/deals";
import { getDistrictLabel } from "@/utils/listings";

type ListingManagementProps = {
  listing: Listing;
};

export function ListingManagement({ listing }: ListingManagementProps) {
  const [dealSheetOpen, setDealSheetOpen] = useState(false);
  const interlocutors = useMemo(() => getDealInterlocutors(listing.id), [listing.id]);
  const status = listing.status ?? "active";

  function markSold(buyer?: DealInterlocutor | null) {
    createDealForListing(listing, buyer ?? null);
    setDealSheetOpen(false);
  }

  return (
    <section className="rounded-[24px] bg-white p-5 shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-ink">Управление объявлением</h2>
          {status === "reserved" ? (
            <p className="mt-1 text-sm font-semibold text-leaf">Договорились</p>
          ) : null}
        </div>
        <PackageCheck className="text-leaf" size={22} />
      </div>

      <div className="mt-5 grid gap-2">
        <Link
          href={`/sell?editId=${listing.id}`}
          className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-full bg-mist px-4 text-sm font-semibold text-ink transition hover:bg-[#e4eee7]"
        >
          <MoreHorizontal size={16} />
          Редактировать
        </Link>

        {status === "reserved" ? (
          <button
            type="button"
            onClick={() => updateStoredListingStatus(listing.id, "active")}
            className="focus-ring h-11 rounded-full border border-ink/10 bg-white px-4 text-sm font-semibold text-ink transition hover:border-leaf/30"
          >
            Снова в продаже
          </button>
        ) : (
          <button
            type="button"
            onClick={() => updateStoredListingStatus(listing.id, "reserved")}
            className="focus-ring h-11 rounded-full border border-ink/10 bg-white px-4 text-sm font-semibold text-ink transition hover:border-leaf/30"
          >
            Забронировать
          </button>
        )}

        <button
          type="button"
          onClick={() => setDealSheetOpen(true)}
          className="focus-ring h-12 rounded-full bg-leaf px-4 text-sm font-semibold text-white shadow-lg shadow-leaf/20 transition hover:bg-[#3f6d4d]"
        >
          Продано
        </button>

        <button
          type="button"
          onClick={() => updateStoredListingStatus(listing.id, "archived")}
          className="focus-ring h-11 rounded-full bg-[#fff2ef] px-4 text-sm font-semibold text-coral transition hover:bg-[#ffe4dc]"
        >
          Снять с публикации
        </button>
      </div>

      {dealSheetOpen ? (
        <div className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm">
          <div className="absolute inset-x-0 bottom-0 max-h-[86vh] overflow-y-auto rounded-t-[28px] bg-white p-5 shadow-[0_-18px_60px_rgba(24,32,29,0.18)] sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:max-w-[520px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[28px]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-ink">Получилось продать? ☕</h2>
                <p className="mt-1 text-sm text-ink/58">
                  Выберите человека, с которым состоялась сделка
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDealSheetOpen(false)}
                className="focus-ring grid h-10 w-10 place-items-center rounded-full bg-mist text-ink"
                aria-label="Закрыть"
              >
                <X size={18} />
              </button>
            </div>

            {interlocutors.length > 0 ? (
              <div className="mt-5 space-y-2">
                {interlocutors.map((buyer) => (
                  <button
                    type="button"
                    key={buyer.id}
                    onClick={() => markSold(buyer)}
                    className="focus-ring flex w-full items-center gap-3 rounded-2xl border border-ink/10 bg-white p-3 text-left transition hover:border-leaf/30"
                  >
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-mist text-base font-semibold text-leaf">
                      {buyer.displayName.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink">{buyer.displayName}</p>
                      <p className="text-sm text-ink/58">{getDistrictLabel(buyer.district)}</p>
                    </div>
                    <Check className="text-leaf" size={18} />
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl bg-mist p-4">
                <p className="font-semibold text-ink">Продали через Choi?</p>
                <p className="mt-1 text-sm text-ink/58">
                  По этому объявлению пока нет диалогов. Можно отметить продажу другому человеку.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => markSold(null)}
              className="focus-ring mt-5 h-12 w-full rounded-full border border-ink/10 bg-white px-4 text-sm font-semibold text-ink transition hover:border-leaf/30"
            >
              Продал другому человеку
            </button>
            <button
              type="button"
              onClick={() => setDealSheetOpen(false)}
              className="focus-ring mt-2 h-12 w-full rounded-full bg-mist px-4 text-sm font-semibold text-ink"
            >
              Отмена
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

