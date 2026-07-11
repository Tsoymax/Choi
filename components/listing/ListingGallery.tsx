"use client";

import Image from "next/image";
import { useState } from "react";

type ListingGalleryProps = {
  images: string[];
  title: string;
};

export function ListingGallery({ images, title }: ListingGalleryProps) {
  const safeImages = images.length ? images : ["/images/choi-teapot.png"];
  const [activeImage, setActiveImage] = useState(safeImages[0]);

  return (
    <section className="rounded-[24px] bg-white p-3 shadow-[0_18px_60px_rgba(24,32,29,0.08)] sm:p-4">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] bg-mist">
        <Image
          src={activeImage}
          alt={title}
          fill
          priority
          unoptimized={activeImage.startsWith("data:")}
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 58vw"
        />
      </div>

      <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
        {safeImages.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => setActiveImage(image)}
            className={`focus-ring relative h-20 w-24 shrink-0 overflow-hidden rounded-2xl border bg-mist transition ${
              activeImage === image ? "border-leaf ring-2 ring-leaf/20" : "border-ink/10"
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
