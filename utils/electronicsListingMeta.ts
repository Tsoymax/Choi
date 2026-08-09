export function getElectronicsListingTitle(attributes?: Record<string, string>) {
  return attributes?.model?.trim() || attributes?.brand?.trim() || "Электроника";
}

export function formatElectronicsListingMeta(attributes?: Record<string, string>) {
  if (!attributes) {
    return "";
  }

  return [attributes.brand, attributes.model, attributes.memory, attributes.condition]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(" · ");
}
