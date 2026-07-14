"use client";

import type { ProfileRow } from "@/lib/data/profiles";
import type { ReportRow } from "@/lib/data/reports";
import { getReportReasonLabel } from "@/lib/data/reports";
import type { AdminListingRow } from "@/lib/data/admin";

type ReportDetailsProps = {
  report: ReportRow;
  listing?: AdminListingRow;
  reporter?: ProfileRow;
  reportedUser?: ProfileRow;
};

export function ReportDetails({
  report,
  listing,
  reporter,
  reportedUser
}: ReportDetailsProps) {
  return (
    <div className="mt-4 rounded-2xl bg-mist p-4 text-sm">
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <p className="text-ink/50">Причина</p>
          <p className="mt-1 font-semibold text-ink">
            {getReportReasonLabel(report.reason)}
          </p>
        </div>
        <div>
          <p className="text-ink/50">Статус</p>
          <p className="mt-1 font-semibold text-ink">{report.status}</p>
        </div>
        <div>
          <p className="text-ink/50">Отправил</p>
          <p className="mt-1 font-semibold text-ink">
            {reporter?.name ?? report.reporter_id}
          </p>
        </div>
        <div>
          <p className="text-ink/50">Цель</p>
          <p className="mt-1 font-semibold text-ink">
            {listing?.title ?? reportedUser?.name ?? "Профиль или объявление"}
          </p>
        </div>
      </div>
      {report.comment ? (
        <div className="mt-4">
          <p className="text-ink/50">Комментарий пользователя</p>
          <p className="mt-1 whitespace-pre-wrap font-medium text-ink">
            {report.comment}
          </p>
        </div>
      ) : null}
      {report.moderator_note ? (
        <div className="mt-4">
          <p className="text-ink/50">Комментарий модератора</p>
          <p className="mt-1 whitespace-pre-wrap font-medium text-ink">
            {report.moderator_note}
          </p>
        </div>
      ) : null}
    </div>
  );
}
