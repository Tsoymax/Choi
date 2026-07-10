export type Category = {
  id: string;
  label: string;
  description: string;
};

export type District = {
  id: string;
  label: string;
};

export type Product = {
  id: string;
  title: string;
  seller: string;
  category: string;
  district: string;
  price: number;
  rating: number;
  reviews: number;
  badge: string;
  palette: string;
};
