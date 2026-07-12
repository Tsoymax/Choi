"use client";

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { createClient } from "@/utils/supabase/client";

export function hasSupabaseBrowserEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

export async function getCurrentUser() {
  if (!hasSupabaseBrowserEnv()) {
    return null;
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return data.user ?? null;
}

export async function requireCurrentUser(
  router: AppRouterInstance,
  nextPath: string
) {
  if (!hasSupabaseBrowserEnv()) {
    return { id: "prototype-user" };
  }

  const user = await getCurrentUser();

  if (user) {
    return user;
  }

  router.push(`/login?next=${encodeURIComponent(nextPath)}` as never);
  return null;
}
