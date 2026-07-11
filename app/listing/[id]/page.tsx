import products from "@/data/products.json";
import type { Product } from "@/components/types";
import { ListingDetail } from "@/components/listing/ListingDetail";

export function generateStaticParams() {
  return (products as Product[]).map((product) => ({
    id: product.id
  }));
}

type ListingPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = await params;

  return <ListingDetail listingId={id} />;
}
