import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SellForm } from "@/components/sell/SellForm";
import { getCurrentProfileResult } from "@/lib/auth/server";
import { getSupabaseErrorInfo, type ProfileRow } from "@/lib/data/profiles";

export default async function SellPage() {
  const hasSupabaseEnv = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );

  if (hasSupabaseEnv) {
    const profileResult = await getCurrentProfileResult();

    if (profileResult.status === "unauthenticated") {
      redirect("/login?next=/sell");
    }

    if (profileResult.status === "profile_error") {
      const errorInfo = getSupabaseErrorInfo(profileResult.error);

      return (
        <main className="min-h-screen bg-[#f7f5ef]">
          <header className="border-b border-ink/5 bg-white/92 backdrop-blur-xl">
            <div className="mx-auto flex h-24 max-w-[1504px] items-center justify-between px-4 sm:px-6 lg:px-8">
              <Link
                href="/"
                className="flex cursor-pointer items-center transition hover:opacity-85"
                aria-label="Choi home"
              >
                <Image src="/logo.svg" alt="Choi" width={180} height={72} priority />
              </Link>
            </div>
          </header>
          <section className="mx-auto max-w-2xl px-4 py-12 text-center sm:px-6 lg:px-8">
            <div className="rounded-[24px] bg-white p-8 shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
              <h1 className="text-3xl font-semibold text-ink">Не удалось загрузить профиль</h1>
              <p className="mt-3 text-ink/62">Попробуйте обновить страницу или войти снова.</p>
              {process.env.NODE_ENV !== "production" ? (
                <p className="mt-3 text-xs font-semibold text-coral">
                  Error code: {errorInfo?.code ?? "unknown"}
                </p>
              ) : null}
            </div>
          </section>
        </main>
      );
    }

    return <SellPageShell profile={profileResult.profile} />;
  }

  return <SellPageShell profile={null} />;
}

function SellPageShell({
  profile
}: {
  profile: ProfileRow | null;
}) {
  return (
    <main className="min-h-screen bg-[#f7f5ef]">
      <header className="border-b border-ink/5 bg-white/92 backdrop-blur-xl">
        <div className="mx-auto flex h-24 max-w-[1504px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex cursor-pointer items-center transition hover:opacity-85"
            aria-label="Choi home"
          >
            <Image src="/logo.svg" alt="Choi" width={180} height={72} priority />
          </Link>
          <Link
            href="/"
            className="focus-ring inline-flex h-12 items-center gap-2 rounded-full border border-ink/10 bg-white px-5 text-sm font-semibold text-ink shadow-sm transition hover:border-leaf/30"
          >
            <ArrowLeft size={18} />
            На главную
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-[1504px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold tracking-normal text-ink sm:text-5xl">
            Подать объявление
          </h1>
          <p className="mt-3 text-lg text-ink/62">
            Расскажите, что хотите продать
          </p>
        </div>

        <SellForm initialProfile={profile} />
      </section>
    </main>
  );
}
