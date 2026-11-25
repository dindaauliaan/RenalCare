import { describe, expect, it } from "vitest";
import { translateSupabaseAuthError } from "./errors";
import { getFirstName, getInitials, isProfileOnboarded } from "./profile";
import { calculateAgeFromBirthDate, loginSchema, onboardingSchema, registerSchema } from "./schemas";

describe("loginSchema", () => {
  it("menerima email dan kata sandi valid", () => {
    const parsed = loginSchema.safeParse({
      email: "  pasien@example.com ",
      password: "secret123",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.email).toBe("pasien@example.com");
    }
  });

  it("menolak email kosong atau tidak valid", () => {
    expect(loginSchema.safeParse({ email: "", password: "secret123" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "bukan-email", password: "secret123" }).success).toBe(
      false
    );
  });

  it("menolak kata sandi kurang dari 6 karakter", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "123" }).success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("menerima pendaftaran valid dengan persetujuan dicentang", () => {
    const parsed = registerSchema.safeParse({
      email: "baru@example.com",
      password: "password123",
      confirmPassword: "password123",
      consent: true,
    });
    expect(parsed.success).toBe(true);
  });

  it("menolak jika konfirmasi kata sandi berbeda", () => {
    const parsed = registerSchema.safeParse({
      email: "baru@example.com",
      password: "password123",
      confirmPassword: "password999",
      consent: true,
    });
    expect(parsed.success).toBe(false);
  });

  it("menolak jika checkbox persetujuan tidak dicentang", () => {
    const parsed = registerSchema.safeParse({
      email: "baru@example.com",
      password: "password123",
      confirmPassword: "password123",
      consent: false,
    });
    expect(parsed.success).toBe(false);
  });
});

describe("onboardingSchema", () => {
  it("menerima profil dewasa valid", () => {
    const parsed = onboardingSchema.safeParse({
      fullName: "Siti Aminah",
      birthDate: "1975-05-10",
      sex: "female",
      mode: "ckd",
    });
    expect(parsed.success).toBe(true);
  });

  it("menolak usia di bawah 18 tahun", () => {
    const currentYear = new Date().getFullYear();
    const parsed = onboardingSchema.safeParse({
      fullName: "Anak Uji",
      birthDate: `${currentYear - 12}-01-01`,
      sex: "male",
      mode: "post_aki",
    });
    expect(parsed.success).toBe(false);
  });

  it("menolak tanggal kalender tidak valid", () => {
    expect(calculateAgeFromBirthDate("1990-02-31")).toBeNull();
  });
});

describe("translateSupabaseAuthError", () => {
  it("menerjemahkan kredensial salah ke Bahasa Indonesia", () => {
    expect(translateSupabaseAuthError("Invalid login credentials")).toContain(
      "Email atau kata sandi salah"
    );
  });

  it("menerjemahkan email sudah terdaftar", () => {
    expect(translateSupabaseAuthError("User already registered")).toContain("sudah terdaftar");
  });

  it("memberi fallback ramah untuk error tak dikenal", () => {
    expect(translateSupabaseAuthError("Some unknown error")).toContain("Terjadi kendala");
  });
});

describe("profile helpers", () => {
  it("menentukan status onboarding dengan tepat", () => {
    expect(isProfileOnboarded(null)).toBe(false);
    expect(
      isProfileOnboarded({
        full_name: "Budi",
        birth_date: null,
        sex: null,
        mode: "ckd",
      })
    ).toBe(false);
    expect(
      isProfileOnboarded({
        full_name: "Budi Santoso",
        birth_date: "1966-01-01",
        sex: "male",
        mode: "ckd",
      })
    ).toBe(true);
  });

  it("membuat inisial dan nama depan", () => {
    expect(getInitials("Budi Santoso", "budi@mail.com")).toBe("BS");
    expect(getInitials("Siti", "siti@mail.com")).toBe("SI");
    expect(getInitials(null, "andi@mail.com")).toBe("AN");
    expect(getFirstName("Budi Santoso", "budi@mail.com")).toBe("Budi");
    expect(getFirstName(null, "andi@mail.com")).toBe("andi");
  });
});
