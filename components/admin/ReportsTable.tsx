"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Eye, EyeOff, ShieldX, UserX, X } from "lucide-react";
import type { AdminListingRow } from "@/lib/data/admin";
import type { ProfileRow } from "@/lib/data/profiles";
import type { ModerationAction, ReportRow } from "@/lib/data/reports";
import { getReportReasonLabel } from "@/lib/data/reports";
import { ReportDetails } from "@/components/admin/ReportDetails";

export type ReportActionRequest = {
  type: "report";
  id: string;
  action: ModerationAction;
  title: string;
  description: string;
  confirmLabel: string;
  danger?: boolean;
};

type ReportsTableProps = {
  reports: ReportRow[];
  listings: AdminListingRow[];
  profiles: ProfileRow[];
  onAction: (request: ReportActionRequest) => void;
};

const statusLabels: Record<string, string> = {
  open: "Открыта",
  reviewing: "В работе",
  resolved: "Решена",
  rejected: "Отклонена"
};

export function ReportsTable({
  reports,
  listings,
  profiles,
  onAction
}: ReportsTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (reports.length === 0) {
    return (
      <div className="rounded-[24px] bg-white p-8 text-center shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
        <h2 className="text-2xl font-semibold text-ink">Жалоб пока нет</h2>
        <p className="mt-2 text-ink/58">Когда пользователи отправят жалобу, она появится здесь.</p>
      </div>
    );
  }

  return (
    <section className="rounded-[24px] bg-white p-4 shadow-[0_18px_60px_rgba(24,32,29,0.08)] sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-ink">Жалобы</h2>
          <p className="text-sm text-ink/58">Сначала новые. Все действия сохраняются в журнале.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {reports.map((report) => {
          const listing = listings.find((item) => item.id === report.listing_id);
          const reporter = profiles.find((item) => item.id === report.reporter_id);
          const reportedUser = profiles.find((item) => item.id === report.reported_user_id);
          const targetLabel = listing?.title ?? reportedUser?.name ?? "Цель не найдена";
          const isExpanded = expandedId === report.id;

          return (
            <article key={report.id} className="rounded-2xl border border-ink/10 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-mist px-3 py-1 text-xs font-semibold text-leaf">
                      {statusLabels[report.status] ?? report.status}
                    </span>
                    <span className="text-xs text-ink/45">
                      {new Date(report.created_at).toLocaleString("ru-RU")}
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-ink">{targetLabel}</h3>
                  <p className="mt-1 text-sm text-ink/58">
                    {getReportReasonLabel(report.reason)}
                  </p>
                  {listing ? (
                    <Link
                      href={`/listing/${listing.id}`}
                      className="mt-2 inline-flex text-sm font-semibold text-leaf hover:underline"
                    >
                      Открыть объявление
                    </Link>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : report.id)}
                    className="focus-ring inline-flex h-10 items-center gap-2 rounded-full bg-mist px-4 text-sm font-semibold text-ink"
                  >
                    <Eye size={16} />
                    Детали
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onAction({
                        type: "report",
                        id: report.id,
                        action: "reviewing",
                        title: "Взять жалобу в работу",
                        description: "Статус жалобы изменится на “В работе”.",
                        confirmLabel: "В работу"
                      })
                    }
                    className="focus-ring inline-flex h-10 items-center gap-2 rounded-full bg-mist px-4 text-sm font-semibold text-ink"
                  >
                    <Check size={16} />
                    В работу
                  </button>
                  {listing ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          onAction({
                            type: "report",
                            id: report.id,
                            action: "hide_listing",
                            title: "Скрыть объявление",
                            description: "Объявление пропадет из публичной ленты, но останется в базе.",
                            confirmLabel: "Скрыть"
                          })
                        }
                        className="focus-ring inline-flex h-10 items-center gap-2 rounded-full bg-mist px-4 text-sm font-semibold text-ink"
                      >
                        <EyeOff size={16} />
                        Скрыть
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onAction({
                            type: "report",
                            id: report.id,
                            action: "block_listing",
                            title: "Заблокировать объявление",
                            description: "Объявление получит статус blocked.",
                            confirmLabel: "Заблокировать",
                            danger: true
                          })
                        }
                        className="focus-ring inline-flex h-10 items-center gap-2 rounded-full bg-[#fff2ef] px-4 text-sm font-semibold text-coral"
                      >
                        <ShieldX size={16} />
                        Блок
                      </button>
                    </>
                  ) : null}
                  {reportedUser ? (
                    <button
                      type="button"
                      onClick={() =>
                        onAction({
                          type: "report",
                          id: report.id,
                          action: "temporary_block_user",
                          title: "Ограничить профиль на 7 дней",
                          description: "Пользователь получит временное ограничение.",
                          confirmLabel: "Ограничить",
                          danger: true
                        })
                      }
                      className="focus-ring inline-flex h-10 items-center gap-2 rounded-full bg-[#fff2ef] px-4 text-sm font-semibold text-coral"
                    >
                      <UserX size={16} />
                      7 дней
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() =>
                      onAction({
                        type: "report",
                        id: report.id,
                        action: "reject_report",
                        title: "Отклонить жалобу",
                        description: "Жалоба будет закрыта без санкций.",
                        confirmLabel: "Отклонить"
                      })
                    }
                    className="focus-ring inline-flex h-10 items-center gap-2 rounded-full border border-ink/10 px-4 text-sm font-semibold text-ink"
                  >
                    <X size={16} />
                    Отклонить
                  </button>
                </div>
              </div>

              {isExpanded ? (
                <ReportDetails
                  report={report}
                  listing={listing}
                  reporter={reporter}
                  reportedUser={reportedUser}
                />
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
