import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { getProfileById, type ProfileRow } from "@/lib/data/profiles";

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
    return null;
  }

  return data.user ?? null;
}

export async function getCurrentProfile(): Promise<ProfileRow | null> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  return getProfileById(supabase, user.id);
}
