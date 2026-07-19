"use client";

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { logProfileDebug } from "@/lib/data/profiles";
import { getCachedAuthUser, hasSupabaseBrowserEnv } from "./clientUser";

export { clearCachedAuthUser, hasSupabaseBrowserEnv } from "./clientUser";

export async function getCurrentUser() {
  if (!hasSupabaseBrowserEnv()) {
    return null;
  }

  try {
    return await getCachedAuthUser();
  } catch (error) {
    logProfileDebug("client_auth_get_user", null, error);
    return null;
  }
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
