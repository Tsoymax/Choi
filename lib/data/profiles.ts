import type { SupabaseClient } from "@supabase/supabase-js";
import type { ChoiUser } from "@/utils/users";
import { createClient } from "@/utils/supabase/client";

type AuthUserLike = {
  id: string;
  user_metadata?: {
    name?: string;
    full_name?: string;
  };
  email?: string;
};

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

export type ProfileResult = {
  profile: ProfileRow | null;
  error: unknown | null;
};

function logProfileError(error: unknown) {
  if (typeof window !== "undefined" && error) {
    console.error("[Choi profile]", error);
  }
}

function getNameFromUser(user: AuthUserLike) {
  return (
    user.user_metadata?.name?.trim() ||
    user.user_metadata?.full_name?.trim() ||
    ""
  );
}

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
    logProfileError(error);
    return null;
  }

  return data;
}

export async function getProfileByIdWithError(
  supabase: SupabaseClient,
  id: string
): Promise<ProfileResult> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle<ProfileRow>();

  if (error) {
    logProfileError(error);
    return { profile: null, error };
  }

  return { profile: data, error: null };
}

export async function ensureProfileForUser(
  supabase: SupabaseClient,
  user: AuthUserLike
): Promise<ProfileResult> {
  const existing = await getProfileByIdWithError(supabase, user.id);

  if (existing.error) {
    return existing;
  }

  const metadataName = getNameFromUser(user);

  if (existing.profile) {
    if (!existing.profile.name && metadataName) {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          name: metadataName,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id)
        .select()
        .single<ProfileRow>();

      if (error) {
        logProfileError(error);
        return { profile: existing.profile, error };
      }

      return { profile: data, error: null };
    }

    return existing;
  }

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        name: metadataName,
        address_type: "aka",
        district: null,
        phone: null
      },
      { onConflict: "id" }
    )
    .select()
    .single<ProfileRow>();

  if (error) {
    logProfileError(error);
    return { profile: null, error };
  }

  return { profile: data, error: null };
}

export async function updateProfile(
  supabase: SupabaseClient,
  id: string,
  input: ProfileUpdateInput
) {
  const updates: Record<string, string | boolean | null> = {
    name: input.name,
    district: input.district,
    address_type: input.addressType,
    updated_at: new Date().toISOString()
  };

  if ("phone" in input) {
    updates.phone = input.phone ?? null;
    updates.phone_verified = false;
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
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
    logProfileError(error);
    return { profile: null, error };
  }

  return getProfileByIdWithError(supabase, data.user.id);
}

export async function ensureCurrentProfile() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    logProfileError(error);
    return { profile: null, error };
  }

  return ensureProfileForUser(supabase, data.user);
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
    district: profile.district ?? "",
    phone: profile.phone ?? undefined,
    avatar: profile.avatar_url ?? undefined,
    joinedAt: profile.created_at ? new Date(profile.created_at).getFullYear() : 2026,
    phoneVerified: Boolean(profile.phone_verified),
    successfulDeals: profile.successful_deals ?? 0,
    complaints: profile.complaints ?? 0,
    addressMode: profile.address_type === "opa" ? "opa" : "aka"
  };
}
