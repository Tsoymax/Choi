import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { RoleGuard } from "@/components/admin/RoleGuard";
import { requireModerator } from "@/lib/auth/roles";
import { createClient } from "@/utils/supabase/server";
import {
  getSupabaseErrorInfo,
  logProfileDebug,
  type ProfileRow
} from "@/lib/data/profiles";

export const dynamic = "force-dynamic";

type StepResult = {
  ok: boolean;
  errorCode?: string | null;
  errorMessage?: string | null;
  errorDetails?: string | null;
  errorHint?: string | null;
};

function errorToStep(error: unknown): StepResult {
  const info = getSupabaseErrorInfo(error);
  return {
    ok: !error,
    errorCode: info?.code ?? null,
    errorMessage: info?.message ?? null,
    errorDetails: info?.details ?? null,
    errorHint: info?.hint ?? null
  };
}

function Row({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="grid gap-1 border-b border-ink/8 py-3 sm:grid-cols-[240px_1fr]">
      <dt className="font-semibold text-ink/62">{label}</dt>
      <dd className="break-words font-mono text-sm text-ink">{value ?? "null"}</dd>
    </div>
  );
}

function StepCard({ title, result }: { title: string; result: StepResult }) {
  return (
    <section className="rounded-[24px] bg-white p-5 shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      <dl className="mt-3">
        <Row label="ok" value={result.ok ? "yes" : "no"} />
        <Row label="error code" value={result.errorCode} />
        <Row label="error message" value={result.errorMessage} />
        <Row label="error details" value={result.errorDetails} />
        <Row label="error hint" value={result.errorHint} />
      </dl>
    </section>
  );
}

export default async function DebugAuthPage() {
  const hasSupabaseEnv = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );

  let hasUser = false;
  let userId: string | null = null;
  let email: string | null = null;
  let profileFound = false;
  let profileId: string | null = null;
  let profileName: string | null = null;
  let district: string | null = null;
  let authStep: StepResult = { ok: false, errorMessage: "Supabase env is not configured" };
  let profileSelectStep: StepResult = { ok: false, errorMessage: "Auth user is missing" };
  let profileUpsertStep: StepResult = { ok: true, errorMessage: "Skipped: profile exists or auth user missing" };

  if (hasSupabaseEnv) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const access = await requireModerator(supabase);

    if (!access.user) {
      redirect("/login?next=/debug/auth");
    }

    if (!access.allowed) {
      return (
        <RoleGuard
          title="Debug закрыт"
          message="Диагностика Choi доступна только модераторам и администраторам."
        />
      );
    }

    const { data: authData, error: authError } = await supabase.auth.getUser();
    authStep = errorToStep(authError);
    hasUser = Boolean(authData.user);
    userId = authData.user?.id ?? null;
    email = authData.user?.email ?? null;

    if (authError) {
      logProfileDebug("debug_auth_get_user", null, authError);
    }

    if (authData.user) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authData.user.id)
        .maybeSingle<ProfileRow>();

      profileSelectStep = errorToStep(profileError);

      if (profileError) {
        logProfileDebug("debug_profile_select", authData.user.id, profileError);
      }

      profileFound = Boolean(profile);
      profileId = profile?.id ?? null;
      profileName = profile?.name ?? null;
      district = profile?.district ?? null;

      if (!profile && !profileError) {
        const name =
          authData.user.user_metadata?.name ??
          authData.user.user_metadata?.full_name ??
          authData.user.email?.split("@")[0] ??
          "Пользователь";
        const { data: upsertedProfile, error: upsertError } = await supabase
          .from("profiles")
          .upsert(
            {
              id: authData.user.id,
              name,
              district: null,
              address_type: "aka"
            },
            { onConflict: "id" }
          )
          .select()
          .single<ProfileRow>();

        profileUpsertStep = errorToStep(upsertError);

        if (upsertError) {
          logProfileDebug("debug_profile_upsert", authData.user.id, upsertError);
        }

        profileFound = Boolean(upsertedProfile);
        profileId = upsertedProfile?.id ?? profileId;
        profileName = upsertedProfile?.name ?? profileName;
        district = upsertedProfile?.district ?? district;
      }
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f5ef] px-4 py-8 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <h1 className="text-4xl font-semibold">Choi auth debug</h1>
          <p className="mt-2 text-ink/62">
            Safe diagnostics only. Tokens, secrets and passwords are not displayed.
          </p>
        </header>

        <section className="rounded-[24px] bg-white p-5 shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
          <h2 className="text-xl font-semibold text-ink">Environment</h2>
          <dl className="mt-3">
            <Row label="Supabase configured" value={hasSupabaseEnv ? "yes" : "no"} />
          </dl>
        </section>

        <section className="rounded-[24px] bg-white p-5 shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
          <h2 className="text-xl font-semibold text-ink">Auth</h2>
          <dl className="mt-3">
            <Row label="hasUser" value={hasUser ? "yes" : "no"} />
            <Row label="userId" value={userId} />
            <Row label="email" value={email} />
          </dl>
        </section>

        <section className="rounded-[24px] bg-white p-5 shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
          <h2 className="text-xl font-semibold text-ink">Profile</h2>
          <dl className="mt-3">
            <Row label="profileFound" value={profileFound ? "yes" : "no"} />
            <Row label="profileId" value={profileId} />
            <Row label="profileName" value={profileName} />
            <Row label="district" value={district} />
          </dl>
        </section>

        <div className="grid gap-5 lg:grid-cols-3">
          <StepCard title="A. auth.getUser()" result={authStep} />
          <StepCard title="B. profiles maybeSingle()" result={profileSelectStep} />
          <StepCard title="C. own profile upsert" result={profileUpsertStep} />
        </div>
      </div>
    </main>
  );
}
