"use client";

import type { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

const USER_CACHE_TTL_MS = 10_000;

let cachedUser: User | null = null;
let cachedAt = 0;
let userRequest: Promise<User | null> | null = null;

export function hasSupabaseBrowserEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

export function clearCachedAuthUser() {
  cachedUser = null;
  cachedAt = 0;
  userRequest = null;
}

export async function getCachedAuthUser() {
  if (!hasSupabaseBrowserEnv()) {
    return null;
  }

  const now = Date.now();
  if (cachedUser && now - cachedAt < USER_CACHE_TTL_MS) {
    return cachedUser;
  }

  if (userRequest) {
    return userRequest;
  }

  userRequest = createClient()
    .auth.getUser()
    .then(({ data, error }) => {
      if (error) {
        return null;
      }

      cachedUser = data.user ?? null;
      cachedAt = Date.now();
      return cachedUser;
    })
    .finally(() => {
      userRequest = null;
    });

  return userRequest;
}
