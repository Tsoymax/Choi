export type DistrictCoordinate = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

export const defaultDistrictId = "yunusabad";

export const districtCoordinates: DistrictCoordinate[] = [
  { id: "yunusabad", name: "Юнусабад", latitude: 41.3668, longitude: 69.2886 },
  { id: "chilanzar", name: "Чиланзар", latitude: 41.2856, longitude: 69.2038 },
  { id: "mirabad", name: "Мирабад", latitude: 41.2964, longitude: 69.2858 },
  { id: "shaykhantakhur", name: "Шайхантахур", latitude: 41.3265, longitude: 69.2364 },
  { id: "yakkasaray", name: "Яккасарай", latitude: 41.2854, longitude: 69.2552 },
  { id: "almazar", name: "Алмазар", latitude: 41.3527, longitude: 69.2067 },
  { id: "sergeli", name: "Сергелийский район", latitude: 41.2268, longitude: 69.2197 },
  { id: "uchtepa", name: "Учтепа", latitude: 41.3006, longitude: 69.1766 },
  { id: "yashnabad", name: "Яшнабад", latitude: 41.2918, longitude: 69.3412 },
  { id: "bektemir", name: "Бектемир", latitude: 41.2087, longitude: 69.3348 }
];

export function getDistrictCoordinate(districtId?: string | null) {
  return (
    districtCoordinates.find((district) => district.id === districtId) ??
    districtCoordinates.find((district) => district.id === defaultDistrictId)!
  );
}

