import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import {
  ensureProfileForUser,
  getSupabaseErrorInfo,
  getProfileByIdWithError,
  logProfileDebug,
  type ProfileRow
} from "@/lib/data/profiles";

type SupabaseErrorLike = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
};

function logServerProfileError(scope: string, error: unknown) {
  if (!error || process.env.NODE_ENV === "production") {
    return;
  }

  const supabaseError = error as SupabaseErrorLike;
  console.error(`[Choi profile:${scope}]`, {
    message: supabaseError.message,
    code: supabaseError.code,
    details: supabaseError.details,
    hint: supabaseError.hint
  });
}

export type CurrentUserResult =
  | { status: "success"; user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>; error: null }
  | { status: "unauthenticated"; user: null; error: unknown | null };

export type CurrentProfileResult =
  | { status: "success"; user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>; profile: ProfileRow; error: null }
  | { status: "unauthenticated"; user: null; profile: null; error: unknown | null }
  | { status: "profile_error"; user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>> | null; profile: null; error: unknown };

export async function getCurrentUser() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    return null;
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    logServerProfileError("getCurrentUser", error);
    return null;
  }

  return data.user ?? null;
}

export async function getCurrentUserResult(): Promise<CurrentUserResult> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    return { status: "unauthenticated", user: null, error: null };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    logProfileDebug("server_auth_get_user", null, error);
    return { status: "unauthenticated", user: null, error };
  }

  if (!data.user) {
    return { status: "unauthenticated", user: null, error: null };
  }

  return { status: "success", user: data.user, error: null };
}

export async function getCurrentProfile(): Promise<ProfileRow | null> {
  const result = await getCurrentProfileResult();

  if (result.status !== "success") {
    return null;
  }

  return result.profile;
}

export async function getCurrentProfileResult(): Promise<CurrentProfileResult> {
  const userResult = await getCurrentUserResult();

  if (userResult.status === "unauthenticated") {
    return {
      status: "unauthenticated",
      user: null,
      profile: null,
      error: userResult.error
    };
  }

  const user = userResult.user;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { profile, error } = await getProfileByIdWithError(supabase, user.id);

  if (error) {
    logProfileDebug("server_profile_select", user.id, error);
    return { status: "profile_error", user, profile: null, error };
  }

  if (profile) {
    return { status: "success", user, profile, error: null };
  }

  const ensured = await ensureProfileForUser(supabase, user);
  if (ensured.error) {
    logProfileDebug("server_profile_upsert", user.id, ensured.error);
    return { status: "profile_error", user, profile: null, error: ensured.error };
  }

  if (!ensured.profile) {
    const missingProfileError = new Error("Profile upsert returned no profile");
    logProfileDebug("server_profile_upsert_empty", user.id, missingProfileError);
    return { status: "profile_error", user, profile: null, error: missingProfileError };
  }

  return { status: "success", user, profile: ensured.profile, error: null };
}

export async function ensureCurrentProfile(): Promise<{
  profile: ProfileRow | null;
  error: unknown | null;
}> {
  const user = await getCurrentUser();

  if (!user) {
    return { profile: null, error: null };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const result = await ensureProfileForUser(supabase, user);

  if (result.error) {
    logServerProfileError("ensureCurrentProfile", result.error);
  }

  return result;
}
