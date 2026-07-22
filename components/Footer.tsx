import type { Language } from "./i18n";

type FooterProps = {
  language: Language;
};

export function Footer({ language: _language }: FooterProps) {
  return (
    <footer className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 text-sm text-ink/58 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
      <p>CHOI-локальный маркетплейс для Ташкента</p>
    </footer>
  );
}
