import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProfileRow } from "@/lib/data/profiles";

export type UserRole = "user" | "moderator" | "admin";

export function normalizeRole(role?: string | null): UserRole {
  return role === "moderator" || role === "admin" ? role : "user";
}

export async function getCurrentUserRole(supabase: SupabaseClient) {
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return { user: null, role: "user" as UserRole, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userData.user.id)
    .maybeSingle<ProfileRow>();

  return {
    user: userData.user,
    role: normalizeRole(profile?.role),
    profile: profile ?? null
  };
}

export async function requireModerator(supabase: SupabaseClient) {
  const result = await getCurrentUserRole(supabase);
  const allowed = result.role === "moderator" || result.role === "admin";
  return { ...result, allowed };
}
