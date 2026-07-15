import type { SupabaseClient } from "@supabase/supabase-js";

export type ListingAttributeRow = {
  id: string;
  listing_id: string;
  attribute_key: string;
  attribute_value: string;
  created_at: string | null;
};

export type ListingAttributeInput = {
  key: string;
  value: string;
};

export function normalizeAttributeValues(values: Record<string, string>) {
  return Object.entries(values)
    .map(([key, value]) => ({
      key,
      value: value.trim()
    }))
    .filter((attribute) => attribute.value.length > 0);
}

export function rowsToAttributeValues(rows: ListingAttributeRow[] = []) {
  return rows.reduce<Record<string, string>>((acc, row) => {
    acc[row.attribute_key] = row.attribute_value;
    return acc;
  }, {});
}

export async function getListingAttributes(
  supabase: SupabaseClient,
  listingId: string
) {
  const { data, error } = await supabase
    .from("listing_attributes")
    .select("*")
    .eq("listing_id", listingId)
    .order("created_at", { ascending: true });

  if (error) {
    return [];
  }

  return (data ?? []) as ListingAttributeRow[];
}

export async function saveListingAttributes(
  supabase: SupabaseClient,
  listingId: string,
  attributes: ListingAttributeInput[]
) {
  if (attributes.length === 0) {
    return { error: null };
  }

  const { error } = await supabase.from("listing_attributes").insert(
    attributes.map((attribute) => ({
      listing_id: listingId,
      attribute_key: attribute.key,
      attribute_value: attribute.value
    }))
  );

  return { error };
}

export async function deleteListingAttributes(
  supabase: SupabaseClient,
  listingId: string
) {
  const { error } = await supabase
    .from("listing_attributes")
    .delete()
    .eq("listing_id", listingId);

  return { error };
}

export async function updateListingAttributes(
  supabase: SupabaseClient,
  listingId: string,
  attributes: ListingAttributeInput[]
) {
  const deleteResult = await deleteListingAttributes(supabase, listingId);

  if (deleteResult.error) {
    return deleteResult;
  }

  return saveListingAttributes(supabase, listingId, attributes);
}
