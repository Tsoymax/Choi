import type { SupabaseClient } from "@supabase/supabase-js";
import type { Product } from "@/components/types";

export type ListingRow = {
  id: string;
  user_id: string;
  category: string;
  title: string;
  description: string;
  price: number | null;
  currency: string;
  negotiable: boolean | null;
  district: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type ListingImageRow = {
  id: string;
  listing_id: string;
  image_url: string;
  position: number | null;
  is_primary: boolean | null;
  created_at: string | null;
};

export type ListingAttributeRow = {
  id: string;
  listing_id: string;
  attribute_key: string;
  attribute_value: string;
  created_at: string | null;
};

export type ListingWithRelations = ListingRow & {
  listing_images?: ListingImageRow[] | null;
  listing_attributes?: ListingAttributeRow[] | null;
  profiles?: { name: string | null } | null;
};

export type CreateListingInput = {
  userId: string;
  category: string;
  title: string;
  description: string;
  price: number | null;
  currency: "uzs" | "usd";
  negotiable: boolean;
  district: string;
  latitude?: number;
  longitude?: number;
  images: string[];
};

export type UpdateListingInput = {
  category: string;
  title: string;
  description: string;
  price: number | null;
  currency: "uzs" | "usd";
  negotiable: boolean;
  district: string;
  latitude?: number | null;
  longitude?: number | null;
};

export type UpdateListingImageInput = {
  id?: string;
  imageUrl: string;
  position: number;
  isPrimary: boolean;
};

export type ListingProduct = Product & {
  description?: string;
  phone?: string;
  images?: string[];
  attributes?: Record<string, string>;
};

type SupabaseErrorLike = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

function logListingDebug(
  scope: string,
  details: Record<string, unknown>,
  error?: unknown
) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  const supabaseError = error as SupabaseErrorLike | undefined;
  console.info(`[Choi listings:${scope}]`, {
    ...details,
    errorCode: supabaseError?.code,
    errorMessage: supabaseError?.message
  });
}

export function mapListingRowToProduct(listing: ListingWithRelations): ListingProduct {
  const images = [...(listing.listing_images ?? [])].sort(
    (first, second) => (first.position ?? 0) - (second.position ?? 0)
  );
  const primaryImage =
    images.find((image) => image.is_primary)?.image_url ??
    images[0]?.image_url ??
    "/mascot.svg";

  return {
    id: listing.id,
    title: listing.title,
    titleRu: listing.title,
    titleUz: listing.title,
    seller: listing.profiles?.name ?? "Choi user",
    sellerId: listing.user_id,
    category: listing.category,
    district: listing.district,
    price: listing.price ?? 0,
    currency: listing.currency === "usd" ? "usd" : "uzs",
    negotiable: listing.negotiable ?? false,
    latitude: listing.latitude ?? undefined,
    longitude: listing.longitude ?? undefined,
    rating: 5,
    reviews: 0,
    image: primaryImage,
    status:
      listing.status === "reserved" ||
      listing.status === "sold" ||
      listing.status === "archived" ||
      listing.status === "hidden" ||
      listing.status === "blocked"
        ? listing.status
        : "active",
    createdAt: listing.created_at ?? undefined,
    description: listing.description,
    phone: listing.phone ?? "",
    images: images.length ? images.map((image) => image.image_url) : [primaryImage],
    attributes: (listing.listing_attributes ?? []).reduce<Record<string, string>>(
      (acc, attribute) => {
        acc[attribute.attribute_key] = attribute.attribute_value;
        return acc;
      },
      {}
    ),
    badgeRu: "Сегодня",
    badgeUz: "Bugun"
  };
}

export async function getActiveListings(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("listings")
    .select("*, listing_images(*), listing_attributes(*), profiles!listings_user_id_fkey(name)")
    .in("status", ["active", "reserved"])
    .order("created_at", { ascending: false });

  if (error) {
    logListingDebug("getActiveListings_relation", { count: 0 }, error);
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("listings")
      .select("*")
      .in("status", ["active", "reserved"])
      .order("created_at", { ascending: false });

    if (fallbackError) {
      logListingDebug("getActiveListings", { count: 0 }, fallbackError);
      return [];
    }

    logListingDebug("getActiveListings_fallback", {
      count: fallbackData?.length ?? 0,
      listings: fallbackData?.map((listing) => ({
        id: listing.id,
        userId: listing.user_id,
        status: listing.status
      }))
    });

    return (fallbackData ?? []) as ListingWithRelations[];
  }

  logListingDebug("getActiveListings", {
    count: data?.length ?? 0,
    listings: data?.map((listing) => ({
      id: listing.id,
      userId: listing.user_id,
      status: listing.status
    }))
  });

  return (data ?? []) as ListingWithRelations[];
}

export async function getListingsByUserId(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("listings")
    .select("*, listing_images(*), listing_attributes(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    logListingDebug("getListingsByUserId", { currentUserId: userId, count: 0 }, error);
    return [];
  }

  logListingDebug("getListingsByUserId", {
    currentUserId: userId,
    count: data?.length ?? 0
  });

  return (data ?? []) as ListingWithRelations[];
}

export async function getListingById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("listings")
    .select("*, listing_images(*), listing_attributes(*), profiles!listings_user_id_fkey(name)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    logListingDebug("getListingById_relation", { listingId: id }, error);
    const { data: fallbackListing, error: fallbackError } = await supabase
      .from("listings")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (fallbackError || !fallbackListing) {
      logListingDebug("getListingById", { listingId: id }, fallbackError);
      return null;
    }

    const [{ data: images }, { data: attributes }, { data: profile }] = await Promise.all([
      supabase
        .from("listing_images")
        .select("*")
        .eq("listing_id", fallbackListing.id)
        .order("position", { ascending: true }),
      supabase
        .from("listing_attributes")
        .select("*")
        .eq("listing_id", fallbackListing.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("profiles")
        .select("name")
        .eq("id", fallbackListing.user_id)
        .maybeSingle()
    ]);

    return {
      ...fallbackListing,
      listing_images: images ?? [],
      listing_attributes: attributes ?? [],
      profiles: profile ?? null
    } as ListingWithRelations;
  }

  logListingDebug("getListingById", {
    listingId: id,
    listingUserId: data?.user_id,
    status: data?.status
  });

  return data as ListingWithRelations | null;
}

export async function createListingWithImages(
  supabase: SupabaseClient,
  input: CreateListingInput
) {
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .insert({
      user_id: input.userId,
      category: input.category,
      title: input.title,
      description: input.description,
      price: input.price,
      currency: input.currency,
      negotiable: input.negotiable,
      district: input.district,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      phone: "",
      status: "active"
    })
    .select()
    .single();

  if (listingError || !listing) {
    logListingDebug(
      "createListing",
      {
        currentUserId: input.userId,
        status: "active"
      },
      listingError
    );
    return { listing: null, error: listingError };
  }

  logListingDebug("createListing", {
    listingId: listing.id,
    listingUserId: listing.user_id,
    currentUserId: input.userId,
    status: listing.status
  });

  if (input.images.length > 0) {
    const { error: imagesError } = await supabase.from("listing_images").insert(
      input.images.map((image, index) => ({
        listing_id: listing.id,
        image_url: image,
        position: index,
        is_primary: index === 0
      }))
    );

    if (imagesError) {
      logListingDebug(
        "createListingImages",
        {
          listingId: listing.id,
          listingUserId: listing.user_id,
          currentUserId: input.userId,
          status: listing.status,
          count: input.images.length
        },
        imagesError
      );
      return { listing, error: imagesError };
    }
  }

  return { listing, error: null };
}

export async function updateListing(
  supabase: SupabaseClient,
  id: string,
  input: UpdateListingInput
) {
  const { data, error } = await supabase
    .from("listings")
    .update({
      category: input.category,
      title: input.title,
      description: input.description,
      price: input.price,
      currency: input.currency,
      negotiable: input.negotiable,
      district: input.district,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    logListingDebug("updateListing", { listingId: id }, error);
  }

  return { listing: data as ListingRow | null, error };
}

function getOwnedStoragePath(listingId: string, imageUrl: string) {
  if (!imageUrl || imageUrl.startsWith("data:") || imageUrl.startsWith("/")) {
    return null;
  }

  try {
    const url = new URL(imageUrl);
    const marker = "/storage/v1/object/public/listing-images/";
    const markerIndex = url.pathname.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    const path = decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
    return path.startsWith(`${listingId}/`) ? path : null;
  } catch {
    return null;
  }
}

async function deleteListingStorageFiles(
  supabase: SupabaseClient,
  listingId: string,
  imageUrls: string[]
) {
  const paths = imageUrls
    .map((imageUrl) => getOwnedStoragePath(listingId, imageUrl))
    .filter((path): path is string => Boolean(path));

  if (paths.length === 0) {
    return null;
  }

  const { error } = await supabase.storage.from("listing-images").remove(paths);

  if (error) {
    logListingDebug("deleteListingStorageFiles", { listingId, count: paths.length }, error);
  }

  return error;
}

export async function syncListingImages(
  supabase: SupabaseClient,
  listingId: string,
  images: UpdateListingImageInput[],
  removedImages: ListingImageRow[]
) {
  const storageError = await deleteListingStorageFiles(
    supabase,
    listingId,
    removedImages.map((image) => image.image_url)
  );

  const removedIds = removedImages.map((image) => image.id);
  if (removedIds.length > 0) {
    const { error } = await supabase
      .from("listing_images")
      .delete()
      .in("id", removedIds);

    if (error) {
      logListingDebug("deleteListingImages", { listingId, count: removedIds.length }, error);
      return { error };
    }
  }

  const existingImages = images.filter((image) => image.id);
  for (const image of existingImages) {
    const { error } = await supabase
      .from("listing_images")
      .update({
        position: image.position,
        is_primary: image.isPrimary
      })
      .eq("id", image.id)
      .eq("listing_id", listingId);

    if (error) {
      logListingDebug("updateListingImage", { listingId, imageId: image.id }, error);
      return { error };
    }
  }

  const newImages = images.filter((image) => !image.id);
  if (newImages.length > 0) {
    const { error } = await supabase.from("listing_images").insert(
      newImages.map((image) => ({
        listing_id: listingId,
        image_url: image.imageUrl,
        position: image.position,
        is_primary: image.isPrimary
      }))
    );

    if (error) {
      logListingDebug("insertListingImages", { listingId, count: newImages.length }, error);
      return { error };
    }
  }

  return { error: storageError };
}

export async function updateListingStatus(
  supabase: SupabaseClient,
  id: string,
  status: "active" | "reserved" | "sold" | "archived" | "hidden" | "blocked"
) {
  const { data, error } = await supabase
    .from("listings")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    logListingDebug("updateListingStatus", { listingId: id, status }, error);
  }

  return { listing: data as ListingRow | null, error };
}

export async function deleteListing(supabase: SupabaseClient, id: string) {
  const listing = await getListingById(supabase, id);

  if (listing?.listing_images?.length) {
    await deleteListingStorageFiles(
      supabase,
      id,
      listing.listing_images.map((image) => image.image_url)
    );
  }

  const { error } = await supabase.from("listings").delete().eq("id", id);

  if (error) {
    logListingDebug("deleteListing", { listingId: id }, error);
  }

  return { error };
}
