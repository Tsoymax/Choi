import { redirect } from "next/navigation";
import Link from "next/link";
import { ProfilePageClient } from "@/components/profile/ProfilePageClient";
import { ensureCurrentProfile, getCurrentUser } from "@/lib/auth/server";
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

  const { profile, error } = await ensureCurrentProfile();

  if (error) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f5ef] px-4">
        <section className="max-w-lg rounded-[24px] bg-white p-8 text-center shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
          <h1 className="text-3xl font-semibold text-ink">Не удалось загрузить профиль</h1>
          <p className="mt-3 text-ink/62">
            Попробуйте обновить страницу или войти снова.
          </p>
          <Link
            href="/login?next=/profile"
            className="focus-ring mt-6 inline-flex h-12 items-center rounded-full bg-leaf px-6 text-sm font-semibold text-white"
          >
            Войти снова
          </Link>
        </section>
      </main>
    );
  }

  const initialUser = profile ? profileToChoiUser(profile) : userToFallbackProfile(user);

  return <ProfilePageClient initialUser={initialUser} isSupabaseUser />;
}
