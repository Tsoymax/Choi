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

export function getAutoFuel(attributes?: Record<string, string>) {
  return (
    attributes?.fuel?.trim() ||
    attributes?.fuelType?.trim() ||
    attributes?.fuel_type?.trim() ||
    ""
  );
}

export function formatAutoListingMeta(attributes?: Record<string, string>) {
  if (!attributes) {
    return "";
  }

  const releaseDate = [attributes.year, attributes.month].filter(Boolean).join("/");

  return [releaseDate, formatMileage(attributes.mileage), getAutoFuel(attributes)]
    .filter(Boolean)
    .join(" · ");
}
