import Image from "next/image";
import Link from "next/link";
import { OfflineRetryButton } from "@/components/pwa/OfflineRetryButton";

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-cream px-4 py-12 text-ink">
      <section className="mx-auto flex max-w-xl flex-col items-center rounded-[28px] border border-ink/5 bg-white px-6 py-12 text-center shadow-xl shadow-ink/5">
        <Image
          src="/mascot.svg"
          alt="Choi"
          width={132}
          height={132}
          className="rounded-[28px]"
          priority
        />
        <p className="mt-7 text-sm font-bold uppercase tracking-[0.18em] text-leaf">
          Всё начинается рядом.
        </p>
        <h1 className="mt-3 text-3xl font-black text-ink">Нет подключения</h1>
        <p className="mt-3 max-w-sm text-base leading-7 text-ink/65">
          Мы сохранили базовые страницы Choi. Проверьте интернет и попробуйте снова.
        </p>
        <OfflineRetryButton />
        <Link
          href="/"
          className="focus-ring mt-3 rounded-full px-5 py-2 text-sm font-bold text-leaf transition hover:bg-mist"
        >
          На главную
        </Link>
      </section>
    </main>
  );
}
