import type { Profile } from "@/types/database";

export type OnboardingCheckFields = Pick<
  Profile,
  "full_name" | "birth_date" | "sex" | "mode"
>;

/**
 * Pengguna dianggap selesai onboarding apabila profil dasar yang dibutuhkan
 * rumus eGFR (nama, tanggal lahir, jenis kelamin) dan mode pemantauan sudah terisi.
 */
export function isProfileOnboarded(
  profile: OnboardingCheckFields | null | undefined
): boolean {
  if (!profile) return false;
  return Boolean(
    profile.full_name?.trim() &&
      profile.birth_date &&
      (profile.sex === "female" || profile.sex === "male") &&
      (profile.mode === "ckd" || profile.mode === "post_aki")
  );
}

/** Mengambil inisial maksimal 2 huruf dari nama lengkap atau fallback email. */
export function getInitials(fullName?: string | null, email?: string | null): string {
  const cleanName = fullName?.trim();
  if (cleanName) {
    const parts = cleanName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return cleanName.slice(0, 2).toUpperCase();
  }

  const cleanEmail = email?.trim();
  if (cleanEmail) {
    return cleanEmail.slice(0, 2).toUpperCase();
  }

  return "RC";
}

/** Mengambil nama panggilan/depan untuk sapaan di Beranda. */
export function getFirstName(fullName?: string | null, email?: string | null): string {
  const cleanName = fullName?.trim();
  if (cleanName) {
    return cleanName.split(/\s+/)[0];
  }
  const cleanEmail = email?.trim();
  if (cleanEmail) {
    return cleanEmail.split("@")[0];
  }
  return "Pengguna";
}

export function formatIndonesianDateHeader(date = new Date()): string {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}
