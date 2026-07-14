"use client";

import { createClient } from "@/utils/supabase/client";
import { hasSupabaseBrowserEnv } from "@/lib/auth/client";
import { getProfileByIdWithError } from "@/lib/data/profiles";

export async function debugAuthProfile() {
  if (process.env.NODE_ENV === "production" || !hasSupabaseBrowserEnv()) {
    return;
  }

  const supabase = createClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  const profileResult = userData.user
    ? await getProfileByIdWithError(supabase, userData.user.id)
    : { profile: null, error: null };
  const profileError = profileResult.error as
    | { code?: string; message?: string; details?: string; hint?: string }
    | null;

  console.info("[Choi auth debug]", {
    hasSession: Boolean(sessionData.session),
    authUserId: userData.user?.id ?? null,
    authEmail: userData.user?.email ?? null,
    userErrorCode: userError?.name ?? null,
    profileFound: Boolean(profileResult.profile),
    profileId: profileResult.profile?.id ?? null,
    profileErrorCode: profileError?.code ?? null
  });
}

