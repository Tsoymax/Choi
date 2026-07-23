import { redirect } from "next/navigation";
import Image from "next/image";
import { ProfileErrorActions } from "@/components/profile/ProfileErrorActions";
import { ProfilePageClient } from "@/components/profile/ProfilePageClient";
import { getCurrentProfileResult } from "@/lib/auth/server";
import {
  getOnboardingPath,
  getSupabaseErrorInfo,
  isProfileOnboardingComplete
} from "@/lib/data/profiles";
import { profileToChoiUser } from "@/lib/data/profiles";
import { defaultCurrentUser } from "@/utils/users";

function ProfileErrorScreen({ error }: { error: unknown }) {
  const errorInfo = getSupabaseErrorInfo(error);

  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f5ef] px-4">
      <section className="max-w-lg rounded-[24px] bg-white p-8 text-center shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
        <Image src="/images/choi-teapot.png" alt="Choi" width={80} height={80} className="mx-auto mb-5" />
        <h1 className="text-3xl font-semibold text-ink">Не удалось загрузить профиль</h1>
        <p className="mt-3 text-ink/62">
          Попробуйте обновить страницу или войти снова.
        </p>
        {process.env.NODE_ENV !== "production" ? (
          <p className="mt-3 text-xs font-semibold text-coral">
            Error code: {errorInfo?.code ?? "unknown"}
          </p>
        ) : null}
        <ProfileErrorActions />
      </section>
    </main>
  );
}

export default async function ProfilePage() {
  const hasSupabaseEnv = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );

  if (!hasSupabaseEnv) {
    return <ProfilePageClient initialUser={defaultCurrentUser} isSupabaseUser={false} />;
  }

  const profileResult = await getCurrentProfileResult();

  if (profileResult.status === "unauthenticated") {
    redirect("/login?next=/profile");
  }

  if (profileResult.status === "profile_error") {
    return <ProfileErrorScreen error={profileResult.error} />;
  }

  if (!isProfileOnboardingComplete(profileResult.profile)) {
    redirect(getOnboardingPath("/profile") as never);
  }

  const initialUser = profileToChoiUser(profileResult.profile);

  return <ProfilePageClient initialUser={initialUser} isSupabaseUser />;
}
