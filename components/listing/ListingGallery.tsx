"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type ListingGalleryProps = {
  images: string[];
  title: string;
};

export function ListingGallery({ images, title }: ListingGalleryProps) {
  const safeImages = images.length ? images : ["/images/choi-teapot.png"];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = safeImages[activeIndex] ?? safeImages[0];
  const hasMultipleImages = safeImages.length > 1;

  const showPreviousImage = () => {
    setActiveIndex((current) =>
      current === 0 ? safeImages.length - 1 : current - 1
    );
  };

  const showNextImage = () => {
    setActiveIndex((current) =>
      current === safeImages.length - 1 ? 0 : current + 1
    );
  };

  return (
    <section className="rounded-[24px] bg-white p-3 shadow-[0_18px_60px_rgba(24,32,29,0.08)] sm:p-4">
      <div className="relative h-[320px] overflow-hidden rounded-[22px] bg-mist sm:h-[440px] lg:h-[560px]">
        <Image
          src={activeImage}
          alt={title}
          fill
          priority
          unoptimized={activeImage.startsWith("data:")}
          className="object-contain"
          sizes="(max-width: 1024px) 100vw, 58vw"
        />

        {hasMultipleImages ? (
          <>
            <button
              type="button"
              onClick={showPreviousImage}
              className="focus-ring absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-leaf text-white shadow-lg shadow-leaf/25 transition hover:bg-[#3f6d4d] sm:grid"
              aria-label="Предыдущее фото"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={showNextImage}
              className="focus-ring absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-leaf text-white shadow-lg shadow-leaf/25 transition hover:bg-[#3f6d4d] sm:grid"
              aria-label="Следующее фото"
            >
              <ChevronRight size={22} />
            </button>
            <div className="absolute bottom-3 right-3 rounded-full bg-ink/72 px-3 py-1 text-xs font-semibold text-white">
              {activeIndex + 1} / {safeImages.length}
            </div>
          </>
        ) : null}
      </div>

      <div className="mt-3 flex snap-x gap-3 overflow-x-auto pb-1">
        {safeImages.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`focus-ring relative h-16 w-20 shrink-0 snap-start overflow-hidden rounded-2xl border bg-mist transition sm:h-20 sm:w-24 ${
              activeIndex === index ? "border-leaf ring-2 ring-leaf/20" : "border-ink/10"
            }`}
            aria-label={`Открыть фото ${index + 1}`}
          >
            <Image
              src={image}
              alt={`${title} ${index + 1}`}
              fill
              unoptimized={image.startsWith("data:")}
              className="object-cover"
              sizes="96px"
            />
          </button>
        ))}
      </div>
    </section>
  );
}
