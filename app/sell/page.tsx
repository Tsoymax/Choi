import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { SellForm } from "@/components/sell/SellForm";

export default function SellPage() {
  return (
    <main className="min-h-screen bg-[#f7f5ef]">
      <header className="border-b border-ink/5 bg-white/92 backdrop-blur-xl">
        <div className="mx-auto flex h-24 max-w-[1504px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center" aria-label="Choi home">
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

        <SellForm />
      </section>
    </main>
  );
}
