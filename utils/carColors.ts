const carColorStyles: Record<string, string> = {
  белый: "#f8f8f4",
  черный: "#111815",
  серый: "#8d9590",
  серебристый: "#c8d0cc",
  зеленый: "#4f875f",
  синий: "#24548f",
  голубой: "#5fa7d8",
  красный: "#b83a35",
  бордовый: "#7c2530",
  желтый: "#e0b836",
  оранжевый: "#d97a2b",
  коричневый: "#7a5136",
  бежевый: "#d8c7aa",
  золотой: "#c4a34d",
  фиолетовый: "#6c4d96",
  комбинированный:
    "linear-gradient(135deg, #111815 0 30%, #f8f8f4 30% 58%, #4f875f 58% 100%)"
};

function normalizeCarColor(color?: string) {
  return color?.trim().toLowerCase().replaceAll("ё", "е");
}

export function getCarColorStyle(color?: string) {
  const normalized = normalizeCarColor(color);
  return normalized ? carColorStyles[normalized] ?? "#8d9590" : "#8d9590";
}

export function getCarColorTextStyle(color?: string) {
  const normalized = normalizeCarColor(color);

  if (normalized === "белый" || normalized === "комбинированный") {
    return "#4f875f";
  }

  return getCarColorStyle(color);
}
