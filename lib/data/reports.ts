import type { SupabaseClient } from "@supabase/supabase-js";

export type ReportStatus = "open" | "reviewing" | "resolved" | "rejected";
export type ReportReason =
  | "fraud"
  | "prohibited_item"
  | "wrong_information"
  | "duplicate"
  | "offensive"
  | "already_sold"
  | "spam"
  | "suspicious_account"
  | "rules_violation"
  | "other";

export type ReportRow = {
  id: string;
  reporter_id: string;
  listing_id: string | null;
  reported_user_id: string | null;
  reason: string;
  comment: string | null;
  status: ReportStatus;
  moderator_note: string | null;
  reviewed_by: string | null;
  created_at: string;
  reviewed_at: string | null;
};

export type SubmitReportInput = {
  listingId?: string | null;
  reportedUserId?: string | null;
  reason: ReportReason | string;
  comment?: string;
};

export type ModerationAction =
  | "reviewing"
  | "resolve_report"
  | "reject_report"
  | "hide_listing"
  | "block_listing"
  | "restore_listing"
  | "delete_listing"
  | "warn_user"
  | "temporary_block_user"
  | "block_user"
  | "unblock_user";

export const listingReportReasons = [
  { id: "fraud", label: "Мошенничество" },
  { id: "prohibited_item", label: "Запрещенный товар" },
  { id: "wrong_information", label: "Неверная информация" },
  { id: "duplicate", label: "Дубликат объявления" },
  { id: "offensive", label: "Оскорбительное содержание" },
  { id: "already_sold", label: "Товар уже продан" },
  { id: "other", label: "Другая причина" }
] as const;

export const userReportReasons = [
  { id: "fraud", label: "Мошенничество" },
  { id: "spam", label: "Спам" },
  { id: "offensive", label: "Оскорбления" },
  { id: "suspicious_account", label: "Подозрительный аккаунт" },
  { id: "rules_violation", label: "Нарушение правил" },
  { id: "other", label: "Другая причина" }
] as const;

export function getReportReasonLabel(reason: string) {
  return (
    [...listingReportReasons, ...userReportReasons].find((item) => item.id === reason)
      ?.label ?? reason
  );
}

export async function submitReport(supabase: SupabaseClient, input: SubmitReportInput) {
  const { data, error } = await supabase.rpc("submit_report", {
    p_listing_id: input.listingId ?? null,
    p_reported_user_id: input.reportedUserId ?? null,
    p_reason: input.reason,
    p_comment: input.comment ?? null
  });

  return { report: data as ReportRow | null, error };
}

export async function getReports(supabase: SupabaseClient, status?: ReportStatus | "all") {
  let query = supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  return { reports: (data ?? []) as ReportRow[], error };
}

export async function moderateReport(
  supabase: SupabaseClient,
  reportId: string,
  action: ModerationAction,
  note: string
) {
  const { data, error } = await supabase.rpc("moderate_report", {
    p_report_id: reportId,
    p_action: action,
    p_note: note || null
  });

  return { report: data as ReportRow | null, error };
}

export async function moderateListing(
  supabase: SupabaseClient,
  listingId: string,
  action: Extract<
    ModerationAction,
    "hide_listing" | "block_listing" | "restore_listing" | "delete_listing"
  >,
  note: string
) {
  const { data, error } = await supabase.rpc("moderate_listing", {
    p_listing_id: listingId,
    p_action: action,
    p_note: note || null
  });

  return { listing: data, error };
}

export async function moderateUser(
  supabase: SupabaseClient,
  userId: string,
  action: Extract<
    ModerationAction,
    "warn_user" | "temporary_block_user" | "block_user" | "unblock_user"
  >,
  note: string
) {
  const { data, error } = await supabase.rpc("moderate_user", {
    p_user_id: userId,
    p_action: action,
    p_note: note || null
  });

  return { profile: data, error };
}
