import type { SupabaseClient } from "@supabase/supabase-js";
import type { ChoiUser } from "@/utils/users";

export type ProfileRow = {
  id: string;
  name: string;
  district: string | null;
  address_type: "aka" | "opa" | string | null;
  avatar_url: string | null;
  successful_deals: number | null;
  complaints: number | null;
  phone_verified: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export type ProfileUpdateInput = {
  name: string;
  district: string | null;
  addressType: "aka" | "opa";
};

export async function getProfileById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle<ProfileRow>();

  if (error) {
    return null;
  }

  return data;
}

export async function updateProfile(
  supabase: SupabaseClient,
  id: string,
  input: ProfileUpdateInput
) {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      name: input.name,
      district: input.district,
      address_type: input.addressType
    })
    .eq("id", id)
    .select()
    .single<ProfileRow>();

  if (error) {
    throw error;
  }

  return data;
}

export function profileToChoiUser(profile: ProfileRow): ChoiUser {
  return {
    id: profile.id,
    name: profile.name,
    city: "Ташкент",
    district: profile.district ?? "yunusabad",
    avatar: profile.avatar_url ?? undefined,
    joinedAt: profile.created_at ? new Date(profile.created_at).getFullYear() : 2026,
    phoneVerified: Boolean(profile.phone_verified),
    successfulDeals: profile.successful_deals ?? 0,
    complaints: profile.complaints ?? 0,
    addressMode: profile.address_type === "opa" ? "opa" : "aka"
  };
}
