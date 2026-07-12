import { ListingCard } from "@/components/ListingCard";
import type { Listing } from "@/utils/listings";
import { SearchEmptyState } from "./SearchEmptyState";

type SearchResultsProps = {
  listings: Listing[];
  onReset: () => void;
};

export function SearchResults({ listings, onReset }: SearchResultsProps) {
  if (listings.length === 0) {
    return <SearchEmptyState onReset={onReset} />;
  }

  return (
    <div className="grid gap-5 min-[420px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {listings.map((listing) => (
        <ListingCard key={listing.id} product={listing} language="ru" />
      ))}
    </div>
  );
}
