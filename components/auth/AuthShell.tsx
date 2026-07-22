import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <main className="min-h-screen bg-[#f7f5ef] px-4 py-3 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex max-w-[1180px] items-start justify-center lg:min-h-[calc(100vh-48px)] lg:items-center">
        <div className="grid w-full gap-5 lg:grid-cols-[0.9fr_1fr] lg:items-center lg:gap-8">
          <section className="hidden rounded-[24px] bg-[#fff8ec] p-8 shadow-[0_18px_60px_rgba(24,32,29,0.08)] sm:p-10 lg:block">
            <Link
              href="/"
              className="inline-flex cursor-pointer items-center transition hover:opacity-85"
              aria-label="Choi home"
            >
              <Image src="/logo.svg" alt="Choi" width={180} height={72} priority />
            </Link>
            <h1 className="mt-10 text-4xl font-semibold leading-tight text-ink sm:text-5xl">
              Всё начинается рядом.
            </h1>
            <p className="mt-5 max-w-md text-lg leading-8 text-ink/64">
              Войдите в Choi, чтобы сохранять объявления, писать продавцам и
              публиковать свои товары рядом с домом.
            </p>
          </section>

          <section className="rounded-[24px] bg-white p-5 shadow-[0_18px_60px_rgba(24,32,29,0.08)] sm:p-8">
            <Link
              href="/"
              className="mb-5 inline-flex cursor-pointer items-center transition hover:opacity-85 lg:hidden"
              aria-label="Choi home"
            >
              <Image src="/logo.svg" alt="Choi" width={132} height={53} priority />
            </Link>
            <div className="mb-5 sm:mb-7">
              <h2 className="text-2xl font-semibold text-ink sm:text-3xl">{title}</h2>
              <p className="mt-2 text-base text-ink/58">{subtitle}</p>
            </div>
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}
