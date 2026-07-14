import { cookies } from "next/headers";
import { ListingDetail } from "@/components/listing/ListingDetail";
import { createClient } from "@/utils/supabase/server";
import {
  getListingById,
  mapListingRowToProduct
} from "@/lib/data/listings";

export const dynamic = "force-dynamic";

type ListingPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = await params;
  let initialListing = null;
  let currentUserId = "";

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const [{ data: userData }, remoteListing] = await Promise.all([
      supabase.auth.getUser(),
      getListingById(supabase, id)
    ]);

    currentUserId = userData.user?.id ?? "";
    initialListing = remoteListing ? mapListingRowToProduct(remoteListing) : null;
  }

  return (
    <ListingDetail
      listingId={id}
      initialListing={initialListing}
      initialCurrentUserId={currentUserId}
    />
  );
}
