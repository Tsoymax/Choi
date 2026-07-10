import type { Language } from "./i18n";
import { translations } from "./i18n";

type FooterProps = {
  language: Language;
};

export function Footer({ language }: FooterProps) {
  const t = translations[language];

  return (
    <footer className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 text-sm text-ink/58 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
      <p>{t.footer}</p>
      <div className="flex gap-5">
        <a className="hover:text-ink" href="#discover">
          {t.browse}
        </a>
        <a className="hover:text-ink" href="#categories">
          {t.categories}
        </a>
        <a className="hover:text-ink" href="#sellers">
          {t.sellers}
        </a>
      </div>
    </footer>
  );
}
