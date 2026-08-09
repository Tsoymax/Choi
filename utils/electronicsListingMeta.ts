export function getElectronicsListingTitle(attributes?: Record<string, string>) {
  const brand = attributes?.brand?.trim();
  const model = attributes?.model?.trim();

  return [brand, model].filter(Boolean).join(" ") || "Электроника";
}

export function formatElectronicsListingMeta(attributes?: Record<string, string>) {
  if (!attributes) {
    return "";
  }

  return [attributes.memory, attributes.condition]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(" · ");
}
