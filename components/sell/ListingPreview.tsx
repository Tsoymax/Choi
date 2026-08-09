import Image from "next/image";
import { ImageIcon, MapPin } from "lucide-react";
import { formatAutoListingMeta } from "@/utils/autoListingMeta";
import { getCarColorStyle, getCarColorTextStyle } from "@/utils/carColors";
import { formatElectronicsListingMeta } from "@/utils/electronicsListingMeta";
import { formatRealEstateListingMeta } from "@/utils/realEstateListingMeta";
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
  const autoMeta = category === "auto" ? formatAutoListingMeta(attributes) : "";
  const realEstateMeta =
    category === "real-estate" ? formatRealEstateListingMeta(attributes) : "";
  const electronicsMeta =
    category === "electronics" ? formatElectronicsListingMeta(attributes) : "";
  const listingMeta = autoMeta || realEstateMeta || electronicsMeta;
  const displayColor =
    category === "auto" || category === "electronics" ? attributes.color : "";

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
          {listingMeta ? (
            <p className="mt-2 line-clamp-2 break-words text-[15px] font-semibold leading-snug text-ink [overflow-wrap:anywhere]">
              {listingMeta}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
            <strong className="break-words text-xl font-semibold text-ink [overflow-wrap:anywhere]">
              {formatPreviewPrice(price, currency, negotiable)}
            </strong>
            {displayColor ? (
              <span
                className="inline-flex min-w-0 items-center gap-1.5 break-words text-sm font-semibold [overflow-wrap:anywhere]"
                style={{ color: getCarColorTextStyle(displayColor) }}
              >
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 shrink-0 rounded-full border border-ink/10 shadow-sm"
                  style={{ background: getCarColorStyle(displayColor) }}
                />
                {displayColor}
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
