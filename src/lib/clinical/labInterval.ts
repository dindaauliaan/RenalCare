import { ClinicalInputError } from "./errors";
import { GFR_STAGE_ORDER, type AlbuminuriaStage, type GfrStage } from "./stages";

/*
 * Saran frekuensi pemeriksaan lab per kombinasi stage G × A.
 *
 * Sumber: KDIGO 2012 CKD Guideline, Figure "Guide to frequency of monitoring
 * (number of times per year) by GFR and albuminuria category"; tabel serupa
 * dimuat kembali di KDIGO 2024.
 *
 * PERLU DIVERIFIKASI terhadap KDIGO (versi terbaru) dan anjuran dokter pasien.
 * Catatan: prototype menulis "G3a A2 ≈ 2–3x setahun", sedangkan tabel KDIGO
 * 2012 menulis 2x setahun untuk G3a A2. Di sini dipakai angka KDIGO.
 */

export interface LabIntervalSuggestion {
  /** Jumlah pemeriksaan per tahun. */
  timesPerYear: number;
  /** True jika angka adalah batas minimal ("4+" pada tabel KDIGO). */
  isMinimum: boolean;
  /** True jika berlaku "1 if CKD": hanya bila diagnosis PGK sudah ditegakkan oleh penanda lain. */
  onlyIfCkdConfirmed: boolean;
  /** Perkiraan jarak antar-pemeriksaan dalam bulan (12 ÷ timesPerYear). */
  approxMonthsBetween: number;
}

type FrequencyCell = { timesPerYear: number; isMinimum?: boolean; onlyIfCkdConfirmed?: boolean };

/** Tabel KDIGO 2012 (kali per tahun). PERLU DIVERIFIKASI terhadap KDIGO. */
export const KDIGO_MONITORING_FREQUENCY: Readonly<
  Record<GfrStage, Readonly<Record<AlbuminuriaStage, FrequencyCell>>>
> = {
  G1: { A1: { timesPerYear: 1, onlyIfCkdConfirmed: true }, A2: { timesPerYear: 1 }, A3: { timesPerYear: 2 } },
  G2: { A1: { timesPerYear: 1, onlyIfCkdConfirmed: true }, A2: { timesPerYear: 1 }, A3: { timesPerYear: 2 } },
  G3a: { A1: { timesPerYear: 1 }, A2: { timesPerYear: 2 }, A3: { timesPerYear: 3 } },
  G3b: { A1: { timesPerYear: 2 }, A2: { timesPerYear: 3 }, A3: { timesPerYear: 3 } },
  G4: { A1: { timesPerYear: 3 }, A2: { timesPerYear: 3 }, A3: { timesPerYear: 4, isMinimum: true } },
  G5: {
    A1: { timesPerYear: 4, isMinimum: true },
    A2: { timesPerYear: 4, isMinimum: true },
    A3: { timesPerYear: 4, isMinimum: true },
  },
};

const ALBUMINURIA_STAGES: readonly AlbuminuriaStage[] = ["A1", "A2", "A3"];

/** Mengembalikan saran frekuensi cek lab untuk kombinasi stage G dan A. */
export function suggestLabInterval(gStage: GfrStage, aStage: AlbuminuriaStage): LabIntervalSuggestion {
  if (!GFR_STAGE_ORDER.includes(gStage)) {
    throw new ClinicalInputError(`Stage GFR tidak dikenal: "${String(gStage)}".`);
  }
  if (!ALBUMINURIA_STAGES.includes(aStage)) {
    throw new ClinicalInputError(`Stage albuminuria tidak dikenal: "${String(aStage)}".`);
  }

  const cell = KDIGO_MONITORING_FREQUENCY[gStage][aStage];
  return {
    timesPerYear: cell.timesPerYear,
    isMinimum: cell.isMinimum ?? false,
    onlyIfCkdConfirmed: cell.onlyIfCkdConfirmed ?? false,
    approxMonthsBetween: 12 / cell.timesPerYear,
  };
}
