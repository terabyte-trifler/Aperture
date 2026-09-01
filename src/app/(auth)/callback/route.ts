import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** OAuth callback. Exchanges the code for a session, then routes by
 *  onboarding state rather than dropping everyone on the dashboard. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (!code) return NextResponse.redirect(`${origin}/login?error=missing_code`);

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(`${origin}/login?error=exchange_failed`);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${origin}/login`);

  const { data: profile } = await supabase
    .from("profiles").select("onboarding_step").eq("id", user.id).single();

  if (profile?.onboarding_step) return NextResponse.redirect(`${origin}/onboarding`);
  return NextResponse.redirect(`${origin}${next ?? "/dashboard"}`);
}
