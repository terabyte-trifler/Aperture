import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/env";

const PROTECTED = ["/dashboard", "/onboarding", "/settings", "/inbox", "/owner"];
const ADMIN = "/admin";

const isProtected = (path: string) => PROTECTED.some((p) => path.startsWith(p));

function toLogin(request: NextRequest, path: string) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", path);
  return NextResponse.redirect(url);
}

/**
 * Auth guard.
 *
 * This runs on very nearly every request, which makes its failure modes the
 * whole site's failure modes. Two rules follow from that:
 *
 *   1. Never throw. A missing Supabase URL or an unreachable auth server must
 *      not turn the public marketing site — which needs no database at all —
 *      into a 500 on every route.
 *   2. When the answer is unknown, fail closed. If we cannot establish who the
 *      caller is, they do not get past a protected route. Public pages carry
 *      no secrets and are served as normal.
 */
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // No credentials configured: the public site still works, everything
  // behind auth is treated as signed out.
  if (!isSupabaseConfigured()) {
    if (isProtected(path)) return toLogin(request, path);
    if (path.startsWith(ADMIN)) {
      return NextResponse.rewrite(new URL("/404", request.url));
    }
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list: { name: string; value: string; options?: CookieOptions }[]) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // getUser() revalidates against Supabase. Never trust getSession() here.
  // A network failure or a paused project must not take the site down, so an
  // unanswerable question is treated as "not signed in".
  let user = null;
  try {
    ({
      data: { user },
    } = await supabase.auth.getUser());
  } catch {
    user = null;
  }

  if (!user && isProtected(path)) return toLogin(request, path);

  // Middleware is a redirect convenience only. Every admin handler
  // re-checks is_staff() server-side — see SRS threat T-3.
  if (path.startsWith(ADMIN) && !user) {
    return NextResponse.rewrite(new URL("/404", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|webp)$).*)"],
};
