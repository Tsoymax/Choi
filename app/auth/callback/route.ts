import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectTo = new URL("/profile", requestUrl.origin);
  const errorRedirect = new URL("/login", requestUrl.origin);
  errorRedirect.searchParams.set("error", "email_confirmation_failed");

  if (!code) {
    return NextResponse.redirect(errorRedirect);
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(errorRedirect);
  }

  return NextResponse.redirect(redirectTo);
}
