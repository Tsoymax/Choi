export function Footer() {
  return (
    <footer className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 text-sm text-ink/58 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
      <p>Choi v0.1 - curated local marketplace prototype.</p>
      <div className="flex gap-5">
        <a className="hover:text-ink" href="#discover">
          Browse
        </a>
        <a className="hover:text-ink" href="#categories">
          Categories
        </a>
        <a className="hover:text-ink" href="#sellers">
          Sellers
        </a>
      </div>
    </footer>
  );
}
