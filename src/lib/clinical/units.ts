import { assertNonNegativeNumber, ClinicalInputError } from "./errors";

/*
 * Konversi satuan sesuai pilihan dropdown di /prototype (form Tambah Hasil Lab):
 *   - Kreatinin : "mg/dL" | "µmol/L"
 *   - Ureum     : "mg/dL (urea)" | "mg/dL (BUN)" | "mmol/L"
 *   - ACR       : "mg/g" | "mg/mmol"
 *
 * Faktor konversi ini adalah fakta kimia (berat molekul), bukan ambang klinis,
 * tetapi tetap PERLU DIVERIFIKASI terhadap satuan yang dipakai laboratorium pasien.
 */

export type CreatinineUnit = "mg/dL" | "µmol/L";
export type UreaUnit = "mg/dL (urea)" | "mg/dL (BUN)" | "mmol/L";
export type AcrUnit = "mg/g" | "mg/mmol";

export const CREATININE_UNITS: readonly CreatinineUnit[] = ["mg/dL", "µmol/L"];
export const UREA_UNITS: readonly UreaUnit[] = ["mg/dL (urea)", "mg/dL (BUN)", "mmol/L"];
export const ACR_UNITS: readonly AcrUnit[] = ["mg/g", "mg/mmol"];

/**
 * 1 mg/dL kreatinin = 88,4 µmol/L (berat molekul kreatinin 113,12 g/mol).
 * Sumber: KDIGO 2012/2024 (tabel konversi satuan), NKF.
 */
export const CREATININE_UMOL_L_PER_MG_DL = 88.4;

/**
 * 1 mg/mmol ACR = 8,84 mg/g (1 mmol kreatinin = 113,12 mg → 1000/113,12 ≈ 8,84).
 * Sumber: KDIGO 2012/2024 (kategori albuminuria: 30 mg/g ≈ 3 mg/mmol).
 */
export const ACR_MG_G_PER_MG_MMOL = 8.84;

/** Berat molekul urea CO(NH₂)₂ ≈ 60,06 g/mol. */
export const UREA_MOLAR_MASS_G_MOL = 60.06;
/** Berat 2 atom nitrogen dalam satu molekul urea ≈ 2 × 14,007 = 28,014 g/mol. */
export const UREA_NITROGEN_MOLAR_MASS_G_MOL = 28.014;

/**
 * Turunan dari berat molekul:
 *   urea (mmol/L) × 6,006  = urea (mg/dL)
 *   urea (mmol/L) × 2,8014 = BUN  (mg/dL)
 *   urea (mg/dL) ÷ 2,144   = BUN  (mg/dL)
 * (faktor 10 berasal dari L → dL.)
 */
export const UREA_MG_DL_PER_MMOL_L = UREA_MOLAR_MASS_G_MOL / 10;
export const BUN_MG_DL_PER_MMOL_L = UREA_NITROGEN_MOLAR_MASS_G_MOL / 10;

function assertUnit<T extends string>(unit: unknown, allowed: readonly T[], label: string): asserts unit is T {
  if (!allowed.includes(unit as T)) {
    throw new ClinicalInputError(`Satuan ${label} tidak dikenal: "${String(unit)}".`);
  }
}

/** Konversi kreatinin antara mg/dL dan µmol/L. */
export function convertCreatinine(value: number, from: CreatinineUnit, to: CreatinineUnit): number {
  assertNonNegativeNumber(value, "Kreatinin");
  assertUnit(from, CREATININE_UNITS, "kreatinin");
  assertUnit(to, CREATININE_UNITS, "kreatinin");
  if (from === to) return value;
  return from === "µmol/L"
    ? value / CREATININE_UMOL_L_PER_MG_DL
    : value * CREATININE_UMOL_L_PER_MG_DL;
}

/** Konversi ureum antara mg/dL (urea), mg/dL (BUN), dan mmol/L — lewat mmol/L sebagai satuan perantara. */
export function convertUrea(value: number, from: UreaUnit, to: UreaUnit): number {
  assertNonNegativeNumber(value, "Ureum");
  assertUnit(from, UREA_UNITS, "ureum");
  assertUnit(to, UREA_UNITS, "ureum");
  if (from === to) return value;

  const toMmolL: Record<UreaUnit, number> = {
    "mmol/L": 1,
    "mg/dL (urea)": 1 / UREA_MG_DL_PER_MMOL_L,
    "mg/dL (BUN)": 1 / BUN_MG_DL_PER_MMOL_L,
  };
  const mmolL = value * toMmolL[from];
  return mmolL / toMmolL[to];
}

/** Konversi ACR antara mg/mmol dan mg/g. */
export function convertAcr(value: number, from: AcrUnit, to: AcrUnit): number {
  assertNonNegativeNumber(value, "ACR");
  assertUnit(from, ACR_UNITS, "ACR");
  assertUnit(to, ACR_UNITS, "ACR");
  if (from === to) return value;
  return from === "mg/mmol" ? value * ACR_MG_G_PER_MG_MMOL : value / ACR_MG_G_PER_MG_MMOL;
}

/** Pintasan: kreatinin dalam satuan apa pun → mg/dL (satuan input `calculateEgfr`). */
export function toCreatinineMgDl(value: number, unit: CreatinineUnit): number {
  return convertCreatinine(value, unit, "mg/dL");
}

/** Pintasan: ACR dalam satuan apa pun → mg/g (satuan input `albuminuriaStage`). */
export function toAcrMgG(value: number, unit: AcrUnit): number {
  return convertAcr(value, unit, "mg/g");
}
