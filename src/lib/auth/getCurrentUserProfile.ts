import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";
import { getFirstName, getInitials, isProfileOnboarded } from "./profile";

export interface CurrentUserContext {
  userId: string;
  email: string;
  fullName: string;
  firstName: string;
  initials: string;
  mode: "ckd" | "post_aki" | null;
  onboarded: boolean;
  profile: Profile | null;
}

/**
 * Mengambil user aktif + baris tabel `profiles` sekali per request (di-memoize oleh React `cache`).
 * Mengembalikan `null` bila pengunjung belum login (mis. saat membuka `/tanda-bahaya`).
 */
export const getCurrentUserProfile = cache(
  async (): Promise<CurrentUserContext | null> => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    const email = user.email ?? "";
    const fullName = profile?.full_name?.trim() || email || "Pengguna RenalCare";

    return {
      userId: user.id,
      email,
      fullName,
      firstName: getFirstName(profile?.full_name, email),
      initials: getInitials(profile?.full_name, email),
      mode: profile?.mode ?? null,
      onboarded: isProfileOnboarded(profile),
      profile: profile ?? null,
    };
  }
);
