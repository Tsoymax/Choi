import categories from "@/data/categories.json";
import products from "@/data/products.json";
import { MarketplaceExperience } from "@/components/MarketplaceExperience";

export default function Home() {
  return (
    <MarketplaceExperience
      categories={categories}
      products={products}
    />
  );
}
