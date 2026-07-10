import Image from "next/image";
import { Sparkles } from "lucide-react";
import { SearchBar } from "./SearchBar";

type HeroProps = {
  query: string;
  onQueryChange: (query: string) => void;
};

const stats = [
  ["2.4k", "local listings"],
  ["42 min", "avg delivery"],
  ["4.9", "seller rating"]
];

export function Hero({ query, onQueryChange }: HeroProps) {
  return (
    <section className="relative mx-auto max-w-7xl px-4 pb-12 pt-4 sm:px-6 lg:px-8">
      <div className="relative min-h-[590px] overflow-hidden rounded-[2rem] bg-[#eef5f0] shadow-soft">
        <Image
          src="/images/choi-hero.png"
          alt="Curated products in a bright neighborhood marketplace setting"
          fill
          priority
          className="hero-image-mask object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#f7f5ef] via-[#f7f5ef]/92 to-transparent" />

        <div className="relative z-10 flex min-h-[590px] max-w-2xl flex-col justify-between p-6 sm:p-10 lg:p-14">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-leaf/20 bg-white/82 px-4 py-2 text-sm font-semibold text-leaf shadow-sm backdrop-blur">
            <Sparkles size={16} />
            Curated picks from nearby makers
          </div>

          <div className="py-12">
            <h1 className="max-w-xl text-5xl font-semibold leading-[1.02] tracking-normal text-ink sm:text-6xl lg:text-7xl">
              Choi
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-ink/72 sm:text-xl">
              Shop verified local finds, compare delivery windows, and follow
              neighborhood sellers in one calm, fast marketplace.
            </p>
            <SearchBar query={query} onQueryChange={onQueryChange} />
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            {stats.map(([value, label]) => (
              <div key={label} className="rounded-2xl bg-white/86 p-4 shadow-sm backdrop-blur">
                <strong className="block text-2xl font-semibold text-ink">{value}</strong>
                <span className="mt-1 block text-ink/58">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
