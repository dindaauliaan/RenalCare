import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isProfileOnboarded } from "@/lib/auth/profile";
import type { Database } from "@/types/database";

const PUBLIC_PATHS = ["/login", "/daftar", "/tanda-bahaya", "/privasi", "/syarat"];
const AUTH_ONLY_PAGES = ["/login", "/daftar"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

function isAuthPage(pathname: string): boolean {
  return AUTH_ONLY_PAGES.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

function redirectWithCookies(
  targetUrl: URL,
  sourceResponse: NextResponse
): NextResponse {
  const redirectResponse = NextResponse.redirect(targetUrl);
  sourceResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });
  return redirectResponse;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Lewati refresh sesi jika variabel environment belum diisi atau masih berupa placeholder
  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.includes("YOUR_PROJECT_REF") ||
    supabaseAnonKey === "YOUR_SUPABASE_ANON_KEY"
  ) {
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // PENTING: Jangan menghapus pemanggilan auth.getUser().
  // Pemanggilan ini memvalidasi dan me-refresh token sesi auth pengguna di server.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Halaman darurat dan dokumen legal draf HARUS selalu dapat diakses tanpa login dan tanpa terblokir onboarding
  if (
    pathname === "/tanda-bahaya" ||
    pathname.startsWith("/tanda-bahaya/") ||
    pathname === "/privasi" ||
    pathname.startsWith("/privasi/") ||
    pathname === "/syarat" ||
    pathname.startsWith("/syarat/")
  ) {
    return supabaseResponse;
  }

  if (!user) {
    if (!isPublicPath(pathname)) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("next", pathname);
      return redirectWithCookies(loginUrl, supabaseResponse);
    }
    return supabaseResponse;
  }

  // Pengguna sudah login: cek kelengkapan profil onboarding di tabel profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, birth_date, sex, mode")
    .eq("id", user.id)
    .maybeSingle();

  const onboarded = isProfileOnboarded(profile);

  if (!onboarded) {
    if (pathname !== "/onboarding") {
      const onboardingUrl = request.nextUrl.clone();
      onboardingUrl.pathname = "/onboarding";
      onboardingUrl.search = "";
      return redirectWithCookies(onboardingUrl, supabaseResponse);
    }
    return supabaseResponse;
  }

  // Pengguna sudah login & sudah onboarding: jangan biarkan tetap di /login, /daftar, atau /onboarding
  if (isAuthPage(pathname) || pathname === "/onboarding") {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    homeUrl.search = "";
    return redirectWithCookies(homeUrl, supabaseResponse);
  }

  return supabaseResponse;
}

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Cocokkan semua path request kecuali yang diawali dengan:
     * - _next/static (file statis)
     * - _next/image (optimasi gambar)
     * - favicon.ico (file ikon)
     * - file gambar statis (.svg, .png, .jpg, .jpeg, .gif, .webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
