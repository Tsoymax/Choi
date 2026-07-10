import Image from "next/image";
import { Heart, UserRound } from "lucide-react";

export function Header() {
  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
      <a href="#" className="flex items-center gap-3" aria-label="Choi home">
        <span className="flex h-12 w-[136px] items-center rounded-full bg-white px-3 shadow-soft sm:w-[154px]">
          <Image src="/logo.svg" alt="" width={120} height={48} priority />
        </span>
        <span className="hidden sm:block">
          <span className="block text-xl font-semibold tracking-normal">Choi</span>
          <span className="block text-xs font-medium uppercase tracking-[0.18em] text-leaf">
            Local market
          </span>
        </span>
      </a>

      <nav className="hidden items-center gap-7 text-sm font-medium text-ink/70 md:flex">
        <a className="hover:text-ink" href="#discover">
          Discover
        </a>
        <a className="hover:text-ink" href="#categories">
          Categories
        </a>
        <a className="hover:text-ink" href="#sellers">
          Sellers
        </a>
      </nav>

      <div className="flex items-center gap-2">
        <button className="focus-ring grid h-11 w-11 place-items-center rounded-full border border-ink/10 bg-white text-ink shadow-sm">
          <Heart size={19} />
        </button>
        <button className="focus-ring hidden h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white shadow-soft sm:flex">
          <UserRound size={18} />
          Sign in
        </button>
      </div>
    </header>
  );
}
