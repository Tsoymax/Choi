"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Archive,
  CheckCircle2,
  Edit3,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  Trash2,
  X
} from "lucide-react";
import type { Listing, ListingStatus } from "@/utils/listings";
import {
  LISTINGS_EVENT,
  deleteStoredListing,
  updateStoredListingStatus
} from "@/utils/listings";
import { hasSupabaseBrowserEnv } from "@/lib/auth/client";
import {
  deleteListing as deleteRemoteListing,
  updateListingStatus
} from "@/lib/data/listings";
import { createClient } from "@/utils/supabase/client";

type ListingManagementProps = {
  listing: Listing;
};

const statusLabels: Record<ListingStatus, string> = {
  active: "В продаже",
  reserved: "Забронировано",
  sold: "Продано",
  archived: "В архиве",
  hidden: "Скрыто модератором",
  blocked: "Заблокировано"
};

export function ListingManagement({ listing }: ListingManagementProps) {
  const router = useRouter();
  const [status, setStatus] = useState<ListingStatus>(listing.status ?? "active");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const isRemoteListing = hasSupabaseBrowserEnv() && !listing.id.startsWith("local-");
  const isFinalStatus = status === "sold" || status === "archived";

  async function changeStatus(nextStatus: ListingStatus) {
    setError("");
    setIsBusy(true);

    if (isRemoteListing) {
      const supabase = createClient();
      const result = await updateListingStatus(supabase, listing.id, nextStatus);

      if (result.error) {
        setError("Не удалось изменить статус объявления.");
        setIsBusy(false);
        return;
      }

      window.dispatchEvent(new Event(LISTINGS_EVENT));
      router.refresh();
    } else {
      updateStoredListingStatus(listing.id, nextStatus);
    }

    setStatus(nextStatus);
    setIsBusy(false);
  }

  async function deleteListing() {
    setError("");
    setIsBusy(true);

    if (isRemoteListing) {
      const supabase = createClient();
      const result = await deleteRemoteListing(supabase, listing.id);

      if (result.error) {
        setError("Не удалось удалить объявление.");
        setIsBusy(false);
        setDeleteModalOpen(false);
        return;
      }

      window.dispatchEvent(new Event(LISTINGS_EVENT));
      router.push("/profile" as never);
      router.refresh();
      return;
    }

    deleteStoredListing(listing.id);
    router.push("/profile" as never);
  }

  return (
    <section className="rounded-[24px] bg-white p-5 shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-ink">Управление объявлением</h2>
          <p className="mt-1 text-sm font-semibold text-leaf">{statusLabels[status]}</p>
        </div>
        <PackageCheck className="text-leaf" size={22} />
      </div>

      {isFinalStatus ? (
        <div className="mt-5 rounded-2xl bg-mist p-4 text-sm font-semibold text-ink/68">
          Завершённое объявление находится в истории. Его нельзя вернуть в продажу.
        </div>
      ) : null}

      <div className="mt-5 grid gap-2">
        <Link
          href={`/listing/${listing.id}/edit` as never}
          className={`focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-full bg-mist px-4 text-sm font-semibold text-ink transition hover:bg-[#e4eee7] ${
            isFinalStatus ? "pointer-events-none opacity-55" : ""
          }`}
          aria-disabled={isFinalStatus}
        >
          <Edit3 size={16} />
          Редактировать
        </Link>

        {status === "reserved" ? (
          <button
            type="button"
            disabled={isBusy}
            onClick={() => changeStatus("active")}
            className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-full border border-ink/10 bg-white px-4 text-sm font-semibold text-ink transition hover:border-leaf/30 disabled:opacity-60"
          >
            <RotateCcw size={16} />
            Снова в продаже
          </button>
        ) : null}

        {status === "active" ? (
          <button
            type="button"
            disabled={isBusy}
            onClick={() => changeStatus("reserved")}
            className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-full bg-leaf px-4 text-sm font-semibold text-white shadow-lg shadow-leaf/20 transition hover:bg-[#3f6d4d] disabled:opacity-60"
          >
            <ShieldCheck size={16} />
            Назначить время
          </button>
        ) : null}

        {status === "active" || status === "reserved" ? (
          <button
            type="button"
            disabled={isBusy}
            onClick={() => changeStatus("archived")}
            className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#6fa17a] px-4 text-sm font-semibold text-white shadow-lg shadow-leaf/14 transition hover:bg-[#5f946b] disabled:opacity-60"
          >
            <CheckCircle2 size={17} />
            Продать
          </button>
        ) : null}

        {status === "active" || status === "reserved" ? (
          <button
            type="button"
            disabled={isBusy}
            onClick={() => changeStatus("archived")}
            className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#fff2ef] px-4 text-sm font-semibold text-coral transition hover:bg-[#ffe4dc] disabled:opacity-60"
          >
            <Archive size={16} />
            Архивировать
          </button>
        ) : null}

        <button
          type="button"
          disabled={isBusy}
          onClick={() => setDeleteModalOpen(true)}
          className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#ef2b18] px-4 text-sm font-semibold text-white shadow-lg shadow-[#ef2b18]/18 transition hover:bg-[#d91f10] disabled:opacity-60"
        >
          <Trash2 size={16} />
          Удалить
        </button>
      </div>

      {error ? (
        <p className="mt-4 rounded-2xl bg-[#fff2ef] p-4 text-sm font-semibold text-coral">
          {error}
        </p>
      ) : null}

      {deleteModalOpen ? (
        <div className="fixed inset-0 z-50 bg-ink/30 p-4 backdrop-blur-sm">
          <div className="mx-auto mt-28 max-w-md rounded-[28px] bg-white p-6 shadow-[0_24px_80px_rgba(24,32,29,0.24)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-ink">Удалить объявление?</h2>
                <p className="mt-2 text-sm text-ink/58">Это действие нельзя отменить</p>
              </div>
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="focus-ring grid h-10 w-10 place-items-center rounded-full bg-mist text-ink"
                aria-label="Закрыть"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                disabled={isBusy}
                onClick={deleteListing}
                className="focus-ring h-12 rounded-full bg-coral px-4 text-sm font-semibold text-white transition hover:bg-[#d95a49] disabled:opacity-60"
              >
                Удалить
              </button>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => setDeleteModalOpen(false)}
                className="focus-ring h-12 rounded-full bg-mist px-4 text-sm font-semibold text-ink disabled:opacity-60"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
