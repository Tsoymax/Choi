import { redirect } from "next/navigation";
import { ProfilePageClient } from "@/components/profile/ProfilePageClient";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth/server";
import { profileToChoiUser } from "@/lib/data/profiles";
import { defaultCurrentUser, type ChoiUser } from "@/utils/users";

function userToFallbackProfile(user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>): ChoiUser {
  return {
    ...defaultCurrentUser,
    id: user.id,
    name: user.user_metadata?.name ?? user.email?.split("@")[0] ?? "Choi",
    phoneVerified: Boolean(user.phone)
  };
}

export default async function ProfilePage() {
  const hasSupabaseEnv = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );

  if (!hasSupabaseEnv) {
    return <ProfilePageClient initialUser={defaultCurrentUser} isSupabaseUser={false} />;
  }

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/profile");
  }

  const profile = await getCurrentProfile();
  const initialUser = profile ? profileToChoiUser(profile) : userToFallbackProfile(user);

  return <ProfilePageClient initialUser={initialUser} isSupabaseUser />;
}
