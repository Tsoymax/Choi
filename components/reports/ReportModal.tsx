"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Flag, X } from "lucide-react";
import { hasSupabaseBrowserEnv, requireCurrentUser } from "@/lib/auth/client";
import {
  listingReportReasons,
  submitReport,
  userReportReasons
} from "@/lib/data/reports";
import { createClient } from "@/utils/supabase/client";
import { ReportReasonSelect } from "@/components/reports/ReportReasonSelect";

type ReportModalProps = {
  targetType: "listing" | "user";
  listingId?: string | null;
  reportedUserId?: string | null;
  triggerLabel?: string;
  compact?: boolean;
};

export function ReportModal({
  targetType,
  listingId,
  reportedUserId,
  triggerLabel = "Пожаловаться",
  compact = false
}: ReportModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reasons = targetType === "listing" ? listingReportReasons : userReportReasons;

  async function handleSubmit() {
    setError("");

    if (!reason) {
      setError("Выберите причину жалобы.");
      return;
    }

    const user = await requireCurrentUser(router, pathname || "/");

    if (!user) {
      return;
    }

    if (!hasSupabaseBrowserEnv()) {
      setError("Жалобы работают после подключения Supabase.");
      return;
    }

    if (reportedUserId && user.id === reportedUserId) {
      setError("На свой профиль нельзя отправить жалобу.");
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();
    const result = await submitReport(supabase, {
      listingId: targetType === "listing" ? listingId : null,
      reportedUserId,
      reason,
      comment
    });

    setIsSubmitting(false);

    if (result.error) {
      if (
        result.error.message?.toLowerCase().includes("duplicate") ||
        result.error.message?.toLowerCase().includes("unique")
      ) {
        setError("Вы уже отправили жалобу. Мы ее проверим.");
        return;
      }

      setError("Не удалось отправить жалобу. Попробуйте еще раз.");
      return;
    }

    setSuccess(true);
  }

  function close() {
    setOpen(false);
    setReason("");
    setComment("");
    setError("");
    setSuccess(false);
    setIsSubmitting(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          compact
            ? "focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-full bg-mist px-4 text-sm font-semibold text-ink/70 transition hover:bg-[#e4eee7]"
            : "focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-full border border-ink/10 bg-white px-5 text-sm font-semibold text-ink/70 transition hover:border-coral/30 hover:text-coral"
        }
      >
        <Flag size={17} />
        {triggerLabel}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[70] overflow-y-auto bg-ink/35 p-4 backdrop-blur-sm">
          <div className="mx-auto flex max-h-[calc(100vh-2rem)] max-w-lg flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_24px_90px_rgba(24,32,29,0.24)] sm:my-10">
            <div className="shrink-0 px-6 pt-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="inline-flex items-center gap-2 rounded-full bg-[#fff2ef] px-3 py-1 text-xs font-semibold text-coral">
                    <AlertTriangle size={14} />
                    Модерация Choi
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold text-ink">
                    {targetType === "listing"
                      ? "Пожаловаться на объявление"
                      : "Пожаловаться на пользователя"}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-ink/58">
                    Расскажите, что случилось. Мы проверим жалобу и при необходимости
                    скроем объявление или ограничим профиль.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="focus-ring grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mist text-ink"
                  aria-label="Закрыть"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {success ? (
              <div className="m-6 rounded-[22px] bg-mist p-5 text-center">
                <CheckCircle2 className="mx-auto text-leaf" size={34} />
                <h3 className="mt-3 text-xl font-semibold text-ink">
                  Спасибо. Мы проверим информацию.
                </h3>
                <button
                  type="button"
                  onClick={close}
                  className="focus-ring mt-5 h-11 rounded-full bg-leaf px-6 text-sm font-semibold text-white"
                >
                  Готово
                </button>
              </div>
            ) : (
              <>
                <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-4 pt-6">
                  <ReportReasonSelect
                    reasons={reasons}
                    value={reason}
                    onChange={setReason}
                  />

                  <label className="mt-5 block">
                    <span className="text-sm font-semibold text-ink">Комментарий</span>
                    <textarea
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      maxLength={500}
                      rows={4}
                      placeholder="Можно добавить детали. Например, что именно кажется подозрительным."
                      className="mt-2 w-full resize-none rounded-2xl border border-ink/10 bg-white p-4 text-sm text-ink shadow-sm outline-none transition focus:border-leaf"
                    />
                  </label>

                  {error ? (
                    <p className="mt-4 rounded-2xl bg-[#fff2ef] p-3 text-sm font-semibold text-coral">
                      {error}
                    </p>
                  ) : null}
                </div>

                <div className="grid shrink-0 gap-2 border-t border-ink/10 bg-white p-6 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                    className="focus-ring h-12 rounded-full bg-leaf px-5 text-sm font-semibold text-white shadow-lg shadow-leaf/20 transition hover:bg-[#3f6d4d] disabled:opacity-60"
                  >
                    {isSubmitting ? "Отправляем..." : "Отправить жалобу"}
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={close}
                    className="focus-ring h-12 rounded-full bg-mist px-5 text-sm font-semibold text-ink disabled:opacity-60"
                  >
                    Отмена
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
