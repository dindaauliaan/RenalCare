import { assertPositiveNumber } from "./errors";
import { gfrStage, isGfrStageWorse, type GfrStage } from "./stages";

/*
 * Logika peringatan (alert). Aplikasi ini BUKAN alat diagnosis: peringatan
 * hanya mengarahkan pengguna untuk menghubungi tenaga kesehatan.
 * Semua ambang di bawah ini PERLU DIVERIFIKASI tenaga kesehatan.
 */

/**
 * Kalium ≥ 6,0 mmol/L dianggap kritis (hiperkalemia berat).
 *
 * Sumber: nilai yang dipakai di /prototype; sejalan dengan klasifikasi
 * hiperkalemia berat ≥ 6,0 mmol/L pada KDIGO Controversies Conference on
 * Potassium Homeostasis (Clase CM, dkk. Kidney Int 2020;97:42-61) dan
 * UK Kidney Association Clinical Practice Guideline: Hyperkalaemia (2023).
 *
 * PERLU DIVERIFIKASI tenaga kesehatan.
 */
export const POTASSIUM_CRITICAL_MMOL_L = 6.0;

/**
 * Tekanan darah kritis: sistolik ≥ 180 mmHg ATAU diastolik ≥ 120 mmHg.
 *
 * Sumber: nilai yang dipakai di /prototype; mengacu pada definisi
 * "hypertensive crisis" ACC/AHA 2017 (Whelton PK, dkk. Hypertension
 * 2018;71:e13-e115) yang menulis "> 180 dan/atau > 120". Di sini dipakai
 * "≥" (lebih waspada) sesuai spesifikasi aplikasi.
 *
 * PERLU DIVERIFIKASI tenaga kesehatan.
 */
export const BP_CRITICAL_SYSTOLIC_MMHG = 180;
export const BP_CRITICAL_DIASTOLIC_MMHG = 120;

/**
 * "Penurunan eGFR yang pasti" (certain drop) menurut KDIGO: stage G memburuk
 * DAN eGFR turun ≥ 25% dari nilai dasar (baseline).
 *
 * Sumber: KDIGO 2012 CKD Guideline, Rekomendasi 2.1.3 (definisi progresi).
 *
 * PERLU DIVERIFIKASI tenaga kesehatan.
 */
export const EGFR_SIGNIFICANT_DECLINE_PERCENT = 25;

/** True jika kalium berada di level kritis (≥ POTASSIUM_CRITICAL_MMOL_L). */
export function isPotassiumCritical(potassiumMmolL: number): boolean {
  assertPositiveNumber(potassiumMmolL, "Kalium (mmol/L)");
  return potassiumMmolL >= POTASSIUM_CRITICAL_MMOL_L;
}

export interface BloodPressureReading {
  systolic: number;
  diastolic: number;
}

/** True jika sistolik ≥ 180 ATAU diastolik ≥ 120 mmHg. */
export function isBloodPressureCritical({ systolic, diastolic }: BloodPressureReading): boolean {
  assertPositiveNumber(systolic, "Tekanan sistolik (mmHg)");
  assertPositiveNumber(diastolic, "Tekanan diastolik (mmHg)");
  return systolic >= BP_CRITICAL_SYSTOLIC_MMHG || diastolic >= BP_CRITICAL_DIASTOLIC_MMHG;
}

export interface EgfrChangeInput {
  /** eGFR hasil terbaru. */
  current: number;
  /** eGFR hasil sebelumnya (pembanding). */
  previous: number;
}

export interface EgfrChangeAssessment {
  /** True jika eGFR terbaru lebih rendah dari sebelumnya (berapa pun selisihnya). */
  declined: boolean;
  /** Selisih current − previous (negatif = turun). */
  absoluteChange: number;
  /** Perubahan dalam persen terhadap nilai sebelumnya (negatif = turun). */
  percentChange: number;
  previousStage: GfrStage;
  currentStage: GfrStage;
  /** True jika stage G berpindah ke kategori yang lebih berat. */
  stageWorsened: boolean;
  /** True jika memenuhi definisi KDIGO: stage memburuk DAN turun ≥ 25%. */
  significantDecline: boolean;
}

/**
 * Membandingkan eGFR terbaru dengan hasil sebelumnya.
 *
 * - `declined` dipakai untuk peringatan ringan seperti di prototype
 *   ("eGFR Anda menurun sejak hasil sebelumnya").
 * - `significantDecline` menandai penurunan yang memenuhi definisi KDIGO.
 *
 * Catatan: satu kali penurunan belum tentu berarti progresi penyakit
 * (bisa karena sakit akut, dehidrasi, atau variasi lab). Keputusan tetap di dokter.
 */
export function assessEgfrChange({ current, previous }: EgfrChangeInput): EgfrChangeAssessment {
  assertPositiveNumber(current, "eGFR terbaru");
  assertPositiveNumber(previous, "eGFR sebelumnya");

  const absoluteChange = current - previous;
  const percentChange = (absoluteChange / previous) * 100;
  const previousStage = gfrStage(previous);
  const currentStage = gfrStage(current);
  const stageWorsened = isGfrStageWorse(currentStage, previousStage);
  const significantDecline =
    stageWorsened && -percentChange >= EGFR_SIGNIFICANT_DECLINE_PERCENT;

  return {
    declined: absoluteChange < 0,
    absoluteChange,
    percentChange,
    previousStage,
    currentStage,
    stageWorsened,
    significantDecline,
  };
}
