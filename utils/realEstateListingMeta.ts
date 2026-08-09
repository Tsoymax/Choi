function formatRooms(value?: string) {
  if (!value) {
    return "";
  }

  const rooms = Number(value);

  if (!Number.isFinite(rooms) || rooms <= 0) {
    return "";
  }

  return `${Math.round(rooms)}-комнатная квартира`;
}

function formatArea(value?: string) {
  if (!value) {
    return "";
  }

  const area = Number(value);
  const displayValue = Number.isFinite(area)
    ? new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(area)
    : value;

  return `${displayValue} м²`;
}

function formatFloor(floor?: string, floorsTotal?: string) {
  if (!floor && !floorsTotal) {
    return "";
  }

  if (floor && floorsTotal) {
    return `${floor}/${floorsTotal} этаж`;
  }

  return floor ? `${floor} этаж` : `${floorsTotal} этажность`;
}

export function getRealEstateListingTitle(attributes?: Record<string, string>) {
  return formatRooms(attributes?.rooms) || "Недвижимость";
}

export function formatRealEstateListingMeta(attributes?: Record<string, string>) {
  if (!attributes) {
    return "";
  }

  return [formatArea(attributes.area), formatFloor(attributes.floor, attributes.floors_total)]
    .filter(Boolean)
    .join(" · ");
}
