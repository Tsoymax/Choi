"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { AdminData } from "@/lib/data/admin";
import {
  moderateListing,
  moderateReport,
  moderateUser
} from "@/lib/data/reports";
import { deleteReview, hideReview } from "@/lib/data/reviews";
import { createClient } from "@/utils/supabase/client";
import { AdminListingsTable, type ListingActionRequest } from "@/components/admin/AdminListingsTable";
import { AdminSidebar, type AdminTab } from "@/components/admin/AdminSidebar";
import { AdminUsersTable, type UserActionRequest } from "@/components/admin/AdminUsersTable";
import { ModerationActionModal } from "@/components/admin/ModerationActionModal";
import { ReportsTable, type ReportActionRequest } from "@/components/admin/ReportsTable";
import { ReviewsTable, type ReviewActionRequest } from "@/components/admin/ReviewsTable";

type AdminActionRequest =
  | ReportActionRequest
  | ListingActionRequest
  | UserActionRequest
  | ReviewActionRequest;

type AdminDashboardProps = {
  data: AdminData;
  currentRole: string;
};

export function AdminDashboard({ data, currentRole }: AdminDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("reports");
  const [actionRequest, setActionRequest] = useState<AdminActionRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const counts = useMemo(
    () => ({
      reports: data.reports.filter((report) => report.status !== "resolved").length,
      listings: data.listings.length,
      users: data.profiles.length,
      reviews: data.reviews.length
    }),
    [data]
  );

  async function confirmAction(note: string) {
    if (!actionRequest) {
      return;
    }

    setError("");
    setLoading(true);
    const supabase = createClient();

    const result =
      actionRequest.type === "report"
        ? await moderateReport(
            supabase,
            actionRequest.id,
            actionRequest.action,
            note
          )
        : actionRequest.type === "listing"
          ? await moderateListing(
              supabase,
              actionRequest.id,
              actionRequest.action,
              note
            )
          : actionRequest.type === "user"
            ? await moderateUser(
                supabase,
                actionRequest.id,
                actionRequest.action,
                note
              )
            : actionRequest.action === "hide"
              ? await hideReview(supabase, actionRequest.id, note)
              : await deleteReview(supabase, actionRequest.id);

    setLoading(false);

    if (result.error) {
      setError("Не удалось выполнить действие. Проверьте права модератора и SQL 013.");
      return;
    }

    setActionRequest(null);
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#f7f5ef] px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1504px]">
        <div className="mb-7 flex flex-col justify-between gap-4 rounded-[28px] bg-white p-6 shadow-[0_18px_60px_rgba(24,32,29,0.08)] md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold text-leaf">Choi Admin</p>
            <h1 className="mt-1 text-3xl font-semibold text-ink">Модерация и жалобы</h1>
            <p className="mt-2 text-sm text-ink/58">
              Роль: {currentRole}. Жалобы, объявления и ограничения профилей.
            </p>
          </div>
          <div className="rounded-full bg-mist px-4 py-2 text-sm font-semibold text-leaf">
            Только для moderator/admin
          </div>
        </div>

        {error ? (
          <div className="mb-5 rounded-2xl bg-[#fff2ef] p-4 text-sm font-semibold text-coral">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <AdminSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            counts={counts}
          />
          <div>
            {activeTab === "reports" ? (
              <ReportsTable
                reports={data.reports}
                listings={data.listings}
                profiles={data.profiles}
                onAction={setActionRequest}
              />
            ) : null}

            {activeTab === "listings" ? (
              <AdminListingsTable
                listings={data.listings}
                profiles={data.profiles}
                onAction={setActionRequest}
              />
            ) : null}

            {activeTab === "users" ? (
              <AdminUsersTable
                profiles={data.profiles}
                onAction={setActionRequest}
              />
            ) : null}

            {activeTab === "reviews" ? (
              <ReviewsTable
                reviews={data.reviews}
                onAction={setActionRequest}
              />
            ) : null}
          </div>
        </div>
      </section>

      <ModerationActionModal
        open={Boolean(actionRequest)}
        title={actionRequest?.title ?? ""}
        description={actionRequest?.description ?? ""}
        confirmLabel={actionRequest?.confirmLabel ?? "Сохранить"}
        danger={actionRequest?.danger}
        loading={loading}
        onCancel={() => setActionRequest(null)}
        onConfirm={confirmAction}
      />
    </main>
  );
}
