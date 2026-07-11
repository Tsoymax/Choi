export type Category = {
  id: string;
  label: string;
  description: string;
  labelRu?: string;
  labelUz?: string;
  descriptionRu?: string;
  descriptionUz?: string;
};

export type District = {
  id: string;
  label: string;
  labelRu?: string;
  labelUz?: string;
};

export type Product = {
  id: string;
  title: string;
  seller: string;
  titleRu?: string;
  titleUz?: string;
  category: string;
  district: string;
  price: number;
  currency?: "uzs" | "usd";
  negotiable?: boolean;
  rating: number;
  reviews: number;
  image: string;
  badgeRu?: string;
  badgeUz?: string;
};
