import { assertNonNegativeNumber } from "./errors";

export type GfrStage = "G1" | "G2" | "G3a" | "G3b" | "G4" | "G5";
export type AlbuminuriaStage = "A1" | "A2" | "A3";

/** Urutan stage G dari yang paling baik ke paling berat (dipakai untuk membandingkan). */
export const GFR_STAGE_ORDER: readonly GfrStage[] = ["G1", "G2", "G3a", "G3b", "G4", "G5"];

/**
 * Batas bawah tiap kategori GFR (mL/menit/1,73 m²).
 * G1 ≥ 90 · G2 60–89 · G3a 45–59 · G3b 30–44 · G4 15–29 · G5 < 15
 *
 * Sumber: KDIGO 2012 & KDIGO 2024 Clinical Practice Guideline for the
 * Evaluation and Management of CKD (kategori GFR).
 * PERLU DIVERIFIKASI tenaga kesehatan.
 */
export const GFR_STAGE_LOWER_BOUNDS = {
  G1: 90,
  G2: 60,
  G3a: 45,
  G3b: 30,
  G4: 15,
} as const;

/**
 * Batas kategori albuminuria berdasarkan ACR (mg/g).
 * A1 < 30 · A2 30–300 · A3 > 300
 *
 * Sumber: KDIGO 2012 & KDIGO 2024 (kategori albuminuria).
 * PERLU DIVERIFIKASI tenaga kesehatan.
 */
export const ALBUMINURIA_BOUNDS_MG_G = {
  /** ACR mulai dari nilai ini masuk A2. */
  A2_MIN: 30,
  /** ACR di ATAS nilai ini masuk A3 (300 masih A2). */
  A2_MAX: 300,
} as const;

/**
 * Menentukan kategori GFR (G1–G5) dari nilai eGFR.
 *
 * Batas memakai interval setengah terbuka, mis. G2 = 60 ≤ eGFR < 90,
 * sehingga nilai desimal seperti 89,6 tetap masuk G2.
 * Untuk konsistensi dengan angka yang dilihat pengguna, kirim nilai eGFR
 * yang sudah dibulatkan (`roundEgfrForDisplay`).
 */
export function gfrStage(egfr: number): GfrStage {
  assertNonNegativeNumber(egfr, "eGFR");

  if (egfr >= GFR_STAGE_LOWER_BOUNDS.G1) return "G1";
  if (egfr >= GFR_STAGE_LOWER_BOUNDS.G2) return "G2";
  if (egfr >= GFR_STAGE_LOWER_BOUNDS.G3a) return "G3a";
  if (egfr >= GFR_STAGE_LOWER_BOUNDS.G3b) return "G3b";
  if (egfr >= GFR_STAGE_LOWER_BOUNDS.G4) return "G4";
  return "G5";
}

/** Menentukan kategori albuminuria (A1–A3) dari ACR dalam mg/g. */
export function albuminuriaStage(acrMgG: number): AlbuminuriaStage {
  assertNonNegativeNumber(acrMgG, "ACR (mg/g)");

  if (acrMgG < ALBUMINURIA_BOUNDS_MG_G.A2_MIN) return "A1";
  if (acrMgG <= ALBUMINURIA_BOUNDS_MG_G.A2_MAX) return "A2";
  return "A3";
}

/** Mengembalikan true jika stage `current` lebih berat daripada `previous`. */
export function isGfrStageWorse(current: GfrStage, previous: GfrStage): boolean {
  return GFR_STAGE_ORDER.indexOf(current) > GFR_STAGE_ORDER.indexOf(previous);
}
