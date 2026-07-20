import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { ensureProfileForUser } from "@/lib/data/profiles";

type SupabaseErrorLike = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
};

function logCallbackError(scope: string, error: unknown) {
  if (!error || process.env.NODE_ENV === "production") {
    return;
  }

  const supabaseError = error as SupabaseErrorLike;
  console.error(`[Choi auth:${scope}]`, {
    message: supabaseError.message,
    code: supabaseError.code,
    details: supabaseError.details,
    hint: supabaseError.hint
  });
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectTo = new URL("/profile", requestUrl.origin);
  const errorRedirect = new URL("/login", requestUrl.origin);
  errorRedirect.searchParams.set("error", "email_confirmation_failed");
  const confirmedLoginRedirect = new URL("/login", requestUrl.origin);
  confirmedLoginRedirect.searchParams.set("confirmed", "1");

  if (!code) {
    return NextResponse.redirect(errorRedirect);
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    logCallbackError("exchangeCodeForSession", error);
    return NextResponse.redirect(confirmedLoginRedirect);
  }

  const { data, error: userError } = await supabase.auth.getUser();

  if (userError || !data.user) {
    logCallbackError("getUser", userError);
    return NextResponse.redirect(confirmedLoginRedirect);
  }

  const { error: profileError } = await ensureProfileForUser(supabase, data.user);

  if (profileError) {
    logCallbackError("ensureProfile", profileError);
  }

  return NextResponse.redirect(redirectTo);
}
