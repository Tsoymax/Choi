import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { ProfileOnboardingForm } from "@/components/onboarding/ProfileOnboardingForm";
import { getCurrentProfileResult } from "@/lib/auth/server";
import {
  getSafeProfileNext,
  isProfileOnboardingComplete
} from "@/lib/data/profiles";

type OnboardingPageProps = {
  searchParams?: Promise<{
    next?: string | string[];
  }>;
};

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const params = await searchParams;
  const rawNext = Array.isArray(params?.next) ? params?.next[0] : params?.next;
  const nextPath = getSafeProfileNext(rawNext);
  const profileResult = await getCurrentProfileResult();

  if (profileResult.status === "unauthenticated") {
    redirect(
      `/login?next=${encodeURIComponent(`/onboarding?next=${encodeURIComponent(nextPath)}`)}` as never
    );
  }

  if (profileResult.status === "profile_error") {
    redirect("/profile");
  }

  if (isProfileOnboardingComplete(profileResult.profile)) {
    redirect(nextPath as never);
  }

  return (
    <AuthShell
      title="Настройка профиля"
      subtitle="Выберите район и обращение, чтобы Choi показывал объявления рядом"
    >
      <ProfileOnboardingForm
        initialProfile={profileResult.profile}
        nextPath={nextPath}
      />
    </AuthShell>
  );
}
