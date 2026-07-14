import Link from "next/link";
import { ShieldAlert } from "lucide-react";

type RoleGuardProps = {
  title?: string;
  message?: string;
};

export function RoleGuard({
  title = "Доступ закрыт",
  message = "Эта страница доступна только модераторам Choi."
}: RoleGuardProps) {
  return (
    <main className="min-h-screen bg-[#f7f5ef] px-4 py-16">
      <section className="mx-auto max-w-xl rounded-[28px] bg-white p-8 text-center shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
        <ShieldAlert className="mx-auto text-coral" size={42} />
        <h1 className="mt-5 text-3xl font-semibold text-ink">{title}</h1>
        <p className="mt-3 text-ink/60">{message}</p>
        <Link
          href="/"
          className="focus-ring mt-7 inline-flex h-12 items-center rounded-full bg-leaf px-6 text-sm font-semibold text-white"
        >
          На главную
        </Link>
      </section>
    </main>
  );
}
