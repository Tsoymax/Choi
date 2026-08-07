import Image from "next/image";
import { ImageIcon, MapPin } from "lucide-react";
import { tashkentDistricts } from "./sellData";

type ListingPreviewProps = {
  title: string;
  category: string;
  attributes?: Record<string, string>;
  price: string;
  currency: "uzs" | "usd";
  negotiable: boolean;
  district: string;
  image?: string;
};

function formatPreviewPrice(price: string, currency: "uzs" | "usd", negotiable: boolean) {
  if (negotiable) {
    return "Договорная";
  }

  if (!price) {
    return "Цена";
  }

  const amount = Number(price);
  if (currency === "uzs") {
    return `${new Intl.NumberFormat("ru-RU").format(amount)} сум`;
  }

  return `$${new Intl.NumberFormat("en-US").format(amount)}`;
}

function formatMileage(value?: string) {
  if (!value) {
    return "";
  }

  const amount = Number(value);
  const formatted = Number.isFinite(amount)
    ? new Intl.NumberFormat("ru-RU").format(amount)
    : value;

  return `${formatted} км`;
}

function formatAutoMeta(attributes?: Record<string, string>) {
  if (!attributes) {
    return "";
  }

  const releaseDate = [attributes.year, attributes.month].filter(Boolean).join("/");

  return [releaseDate, formatMileage(attributes.mileage), attributes.fuel]
    .filter(Boolean)
    .join(" · ");
}

export function ListingPreview({
  title,
  category,
  attributes = {},
  price,
  currency,
  negotiable,
  district,
  image
}: ListingPreviewProps) {
  const districtLabel =
    tashkentDistricts.find((item) => item.id === district)?.label ?? "Район";
  const autoMeta = category === "auto" ? formatAutoMeta(attributes) : "";

  return (
    <aside className="sticky top-28 rounded-[24px] bg-white p-5 shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
      <p className="mb-4 text-sm font-semibold text-ink/58">
        Так будет выглядеть ваше объявление
      </p>
      <article className="overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-sm">
        <div className="relative aspect-[4/3] bg-mist">
          {image ? (
            <Image
              src={image}
              alt="Главное фото объявления"
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center text-ink/35">
              <ImageIcon size={44} />
            </div>
          )}
        </div>
        <div className="p-5">
          <h3 className="text-lg font-semibold leading-tight text-ink">
            {title || "Название объявления"}
          </h3>
          {autoMeta ? (
            <p className="mt-2 line-clamp-2 break-words text-sm font-medium text-ink/45 [overflow-wrap:anywhere]">
              {autoMeta}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
            <strong className="break-words text-xl font-semibold text-ink [overflow-wrap:anywhere]">
              {formatPreviewPrice(price, currency, negotiable)}
            </strong>
            {category === "auto" && attributes.color ? (
              <span className="break-words text-sm font-medium text-ink/45 [overflow-wrap:anywhere]">
                ● {attributes.color}
              </span>
            ) : null}
          </div>
          <p className="mt-4 inline-flex items-center gap-2 text-sm text-ink/58">
            <MapPin size={16} />
            {districtLabel}
          </p>
        </div>
      </article>
    </aside>
  );
}
