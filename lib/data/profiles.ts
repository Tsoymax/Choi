import type { SupabaseClient } from "@supabase/supabase-js";
import type { ChoiUser } from "@/utils/users";
import { createClient } from "@/utils/supabase/client";

export type ProfileRow = {
  id: string;
  name: string;
  district: string | null;
  address_type: "aka" | "opa" | string | null;
  phone: string | null;
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
  phone?: string | null;
};

export async function getProfileById(supabase: SupabaseClient, id: string): Promise<ProfileRow | null>;
export async function getProfileById(id: string): Promise<ProfileRow | null>;
export async function getProfileById(
  supabaseOrId: SupabaseClient | string,
  maybeId?: string
) {
  const supabase = typeof supabaseOrId === "string" ? createClient() : supabaseOrId;
  const id = typeof supabaseOrId === "string" ? supabaseOrId : maybeId;

  if (!id) {
    return null;
  }

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
      address_type: input.addressType,
      phone: input.phone ?? null,
      phone_verified: false
    })
    .eq("id", id)
    .select()
    .single<ProfileRow>();

  if (error) {
    throw error;
  }

  return data;
}

export async function getCurrentProfile() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return { profile: null, error };
  }

  const profile = await getProfileById(supabase, data.user.id);
  return { profile, error: null };
}

export async function updateCurrentProfile(input: ProfileUpdateInput) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return {
      profile: null,
      error: error ?? new Error("Пользователь не авторизован")
    };
  }

  try {
    const profile = await updateProfile(supabase, data.user.id, input);
    return { profile, error: null };
  } catch (updateError) {
    return { profile: null, error: updateError };
  }
}

export function profileToChoiUser(profile: ProfileRow): ChoiUser {
  return {
    id: profile.id,
    name: profile.name,
    city: "Ташкент",
    district: profile.district ?? "yunusabad",
    phone: profile.phone ?? undefined,
    avatar: profile.avatar_url ?? undefined,
    joinedAt: profile.created_at ? new Date(profile.created_at).getFullYear() : 2026,
    phoneVerified: Boolean(profile.phone_verified),
    successfulDeals: profile.successful_deals ?? 0,
    complaints: profile.complaints ?? 0,
    addressMode: profile.address_type === "opa" ? "opa" : "aka"
  };
}
