import { assertFiniteNumber, assertPositiveNumber, ClinicalInputError } from "./errors";

export type Sex = "female" | "male";

export interface EgfrInput {
  /** Kreatinin serum dalam mg/dL (konversi dulu dengan units.ts bila dalam µmol/L). */
  creatinineMgDl: number;
  /** Usia dalam tahun (dewasa). */
  ageYears: number;
  sex: Sex;
}

/**
 * Koefisien persamaan CKD-EPI 2021 berbasis kreatinin (tanpa koefisien ras).
 *
 * Sumber: Inker LA, dkk. "New Creatinine- and Cystatin C-Based Equations to
 * Estimate GFR without Race." N Engl J Med 2021;385:1737-1749.
 * Direkomendasikan oleh NKF-ASN Task Force (2021) dan KDIGO 2024.
 *
 * PERLU DIVERIFIKASI tenaga kesehatan sebelum dipakai untuk keputusan klinis.
 */
export const CKD_EPI_2021 = {
  multiplier: 142,
  ageBase: 0.9938,
  femaleFactor: 1.012,
  exponentAboveKappa: -1.2,
  kappa: { female: 0.7, male: 0.9 },
  alpha: { female: -0.241, male: -0.302 },
} as const;

/**
 * CKD-EPI dikembangkan dan divalidasi untuk orang dewasa (≥ 18 tahun).
 * Anak-anak memerlukan persamaan lain (mis. CKiD/Schwartz).
 * Sumber: Inker LA, dkk. NEJM 2021; KDIGO 2024. PERLU DIVERIFIKASI tenaga kesehatan.
 */
export const MIN_ADULT_AGE_YEARS = 18;

/** Batas kewajaran input (mencegah salah ketik), BUKAN ambang klinis. */
export const MAX_REASONABLE_AGE_YEARS = 120;

function assertValidSex(sex: unknown): asserts sex is Sex {
  if (sex !== "female" && sex !== "male") {
    throw new ClinicalInputError('Jenis kelamin harus "female" atau "male".');
  }
}

/**
 * Menghitung eGFR (mL/menit/1,73 m²) dengan CKD-EPI 2021:
 *
 *   eGFR = 142 × min(Scr/κ, 1)^α × max(Scr/κ, 1)^(−1,200) × 0,9938^usia × (1,012 jika perempuan)
 *
 * Mengembalikan nilai presisi penuh (tidak dibulatkan) agar bisa disimpan
 * apa adanya. Gunakan `roundEgfrForDisplay` saat menampilkan ke pengguna.
 *
 * @throws {ClinicalInputError} bila kreatinin ≤ 0, usia < 18 / > 120, atau jenis kelamin tidak valid.
 */
export function calculateEgfr({ creatinineMgDl, ageYears, sex }: EgfrInput): number {
  assertPositiveNumber(creatinineMgDl, "Kreatinin (mg/dL)");
  assertFiniteNumber(ageYears, "Usia");
  assertValidSex(sex);

  if (ageYears < MIN_ADULT_AGE_YEARS) {
    throw new ClinicalInputError(
      `Rumus CKD-EPI 2021 hanya untuk usia dewasa (≥ ${MIN_ADULT_AGE_YEARS} tahun).`
    );
  }
  if (ageYears > MAX_REASONABLE_AGE_YEARS) {
    throw new ClinicalInputError(
      `Usia tidak wajar (maksimal ${MAX_REASONABLE_AGE_YEARS} tahun). Periksa kembali input.`
    );
  }

  const kappa = CKD_EPI_2021.kappa[sex];
  const alpha = CKD_EPI_2021.alpha[sex];
  const ratio = creatinineMgDl / kappa;

  const egfr =
    CKD_EPI_2021.multiplier *
    Math.pow(Math.min(ratio, 1), alpha) *
    Math.pow(Math.max(ratio, 1), CKD_EPI_2021.exponentAboveKappa) *
    Math.pow(CKD_EPI_2021.ageBase, ageYears) *
    (sex === "female" ? CKD_EPI_2021.femaleFactor : 1);

  return egfr;
}

/** Membulatkan eGFR ke bilangan bulat terdekat untuk ditampilkan (mis. 86,16 → 86). */
export function roundEgfrForDisplay(egfr: number): number {
  assertFiniteNumber(egfr, "eGFR");
  return Math.round(egfr);
}
