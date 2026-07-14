import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Choi",
    short_name: "Choi",
    description: "Локальный маркетплейс Узбекистана. Всё начинается рядом.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f7f5ef",
    theme_color: "#4f815c",
    orientation: "portrait-primary",
    lang: "ru",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png"
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  };
}
