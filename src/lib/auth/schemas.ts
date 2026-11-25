import { z } from "zod";
import { MAX_REASONABLE_AGE_YEARS, MIN_ADULT_AGE_YEARS } from "@/lib/clinical";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email wajib diisi.")
    .email("Format email tidak valid."),
  password: z
    .string()
    .min(1, "Kata sandi wajib diisi.")
    .min(6, "Kata sandi minimal 6 karakter."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, "Email wajib diisi.")
      .email("Format email tidak valid."),
    password: z
      .string()
      .min(6, "Kata sandi minimal 6 karakter.")
      .max(72, "Kata sandi maksimal 72 karakter."),
    confirmPassword: z.string().min(1, "Konfirmasi kata sandi wajib diisi."),
    consent: z.boolean().refine((val) => val === true, {
      message: "Anda harus menyetujui ketentuan penyimpanan data dan disclaimer.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak sama.",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export function calculateAgeFromBirthDate(birthDateStr: string, today = new Date()): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDateStr);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const birthDate = new Date(year, month - 1, day);
  if (
    birthDate.getFullYear() !== year ||
    birthDate.getMonth() !== month - 1 ||
    birthDate.getDate() !== day
  ) {
    return null;
  }

  let age = today.getFullYear() - year;
  const monthDiff = today.getMonth() - (month - 1);
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < day)) {
    age--;
  }
  return age;
}

export const onboardingSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Nama lengkap minimal 2 karakter.")
    .max(100, "Nama lengkap maksimal 100 karakter."),
  birthDate: z
    .string()
    .min(1, "Tanggal lahir wajib diisi.")
    .refine((val) => {
      const age = calculateAgeFromBirthDate(val);
      return age !== null && age >= 0 && age <= MAX_REASONABLE_AGE_YEARS;
    }, "Tanggal lahir tidak valid.")
    .refine((val) => {
      const age = calculateAgeFromBirthDate(val);
      return age !== null && age >= MIN_ADULT_AGE_YEARS;
    }, `Rumus eGFR CKD-EPI 2021 ditujukan untuk usia dewasa (minimal ${MIN_ADULT_AGE_YEARS} tahun).`),
  sex: z.enum(["female", "male"], {
    message: "Pilih jenis kelamin terlebih dahulu.",
  }),
  mode: z.enum(["ckd", "post_aki"], {
    message: "Pilih mode pemantauan terlebih dahulu.",
  }),
});

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;
