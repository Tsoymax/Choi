"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { hasSupabaseBrowserEnv } from "@/lib/auth/client";

export function ProfileErrorActions() {
  const router = useRouter();

  async function signOutAndLogin() {
    if (hasSupabaseBrowserEnv()) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }

    router.push("/login?next=/profile" as never);
    router.refresh();
  }

  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
      <button
        type="button"
        onClick={() => router.refresh()}
        className="focus-ring inline-flex h-12 items-center justify-center rounded-full bg-leaf px-6 text-sm font-semibold text-white"
      >
        Попробовать снова
      </button>
      <button
        type="button"
        onClick={signOutAndLogin}
        className="focus-ring inline-flex h-12 items-center justify-center rounded-full border border-ink/10 bg-white px-6 text-sm font-semibold text-ink"
      >
        Войти снова
      </button>
    </div>
  );
}

