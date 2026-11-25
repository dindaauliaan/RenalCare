import {
  ACR_UNITS,
  albuminuriaStage,
  assessEgfrChange,
  calculateEgfr,
  ClinicalInputError,
  convertUrea,
  CREATININE_UNITS,
  gfrStage,
  isPotassiumCritical,
  roundEgfrForDisplay,
  toAcrMgG,
  toCreatinineMgDl,
  UREA_UNITS,
  type AcrUnit,
  type AlbuminuriaStage,
  type CreatinineUnit,
  type GfrStage,
  type Sex,
  type UreaUnit,
} from "@/lib/clinical";
import type { LabResult } from "@/types/database";

export type LabMetricTab = "eGFR" | "Kreatinin" | "ACR" | "Kalium" | "Ureum";
export type LabPeriod = "3 Bln" | "6 Bln" | "1 Thn" | "Semua";
export type LabSortOrder = "newest" | "oldest";

export interface LabTrendPoint {
  id: string;
  measuredAt: string;
  label: string;
  fullDate: string;
  value: number;
  isAcuteIllness: boolean;
}

export interface LabTrendSeries {
  metric: LabMetricTab;
  unit: string;
  headline: string;
  subtitle: string;
  domain: [number, number];
  points: LabTrendPoint[];
  latestIsAcute: boolean;
  latestIsPotassiumCritical: boolean;
}

export interface LabRowDisplay {
  id: string;
  measuredAt: string;
  formattedDate: string;
  isLatest: boolean;
  isAcuteIllness: boolean;
  egfrRounded: number | null;
  egfrText: string;
  gStage: GfrStage | null;
  aStage: AlbuminuriaStage | null;
  stageBadge: string | null;
  creatinineText: string;
  ureaText: string;
  acrText: string;
  potassiumText: string;
  potassiumCritical: boolean;
  referenceNotes: string | null;
  raw: LabResult;
}

function parseIsoDateParts(isoDate: string): { year: number; month: number; day: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
  if (!match) {
    throw new ClinicalInputError(`Format tanggal tidak valid: "${isoDate}".`);
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const check = new Date(Date.UTC(year, month - 1, day));
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    throw new ClinicalInputError(`Tanggal kalender tidak valid: "${isoDate}".`);
  }
  return { year, month, day };
}

/**
 * Menghitung usia (bilangan bulat dalam tahun) pada tanggal pengambilan sampel lab.
 * Ini lebih akurat daripada memakai usia hari ini saat mencatat hasil lab lampau.
 */
export function calculateAgeAtDate(birthDateIso: string, measuredAtIso: string): number {
  const birth = parseIsoDateParts(birthDateIso);
  const measured = parseIsoDateParts(measuredAtIso);

  let age = measured.year - birth.year;
  if (
    measured.month < birth.month ||
    (measured.month === birth.month && measured.day < birth.day)
  ) {
    age--;
  }

  if (age < 0) {
    throw new ClinicalInputError(
      "Tanggal pengambilan lab tidak boleh lebih awal dari tanggal lahir."
    );
  }
  return age;
}

/**
 * Mengonversi kreatinin ke mg/dL dan menghitung eGFR (presisi penuh)
 * memakai usia pasien pada tanggal pengambilan sampel.
 */
export function computeEgfrForLabEntry({
  creatinine,
  creatinineUnit,
  measuredAt,
  birthDate,
  sex,
}: {
  creatinine: number | null;
  creatinineUnit: CreatinineUnit;
  measuredAt: string;
  birthDate: string;
  sex: Sex;
}): number | null {
  if (creatinine === null) return null;
  const creatinineMgDl = toCreatinineMgDl(creatinine, creatinineUnit);
  const ageYears = calculateAgeAtDate(birthDate, measuredAt);
  return calculateEgfr({ creatinineMgDl, ageYears, sex });
}

function toSafeCreatinineUnit(unit: string | null): CreatinineUnit {
  return CREATININE_UNITS.includes(unit as CreatinineUnit)
    ? (unit as CreatinineUnit)
    : "mg/dL";
}

function toSafeUreaUnit(unit: string | null): UreaUnit {
  return UREA_UNITS.includes(unit as UreaUnit) ? (unit as UreaUnit) : "mg/dL (urea)";
}

function toSafeAcrUnit(unit: string | null): AcrUnit {
  return ACR_UNITS.includes(unit as AcrUnit) ? (unit as AcrUnit) : "mg/g";
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function formatIndonesianNumber(value: number, maxDecimals = 2): string {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: maxDecimals,
  }).format(value);
}

export function formatLabDateShort(isoDate: string): string {
  const { year, month, day } = parseIsoDateParts(isoDate);
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatChartAxisMonth(isoDate: string): string {
  const { year, month, day } = parseIsoDateParts(isoDate);
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}

/** Mengurutkan daftar hasil lab berdasarkan `measured_at` (dan `created_at` sebagai pemecah seri). */
export function sortLabRows(labs: LabResult[], order: LabSortOrder): LabResult[] {
  return [...labs].sort((a, b) => {
    const dateCompare = a.measured_at.localeCompare(b.measured_at);
    if (dateCompare !== 0) {
      return order === "oldest" ? dateCompare : -dateCompare;
    }
    const createdA = a.created_at ?? "";
    const createdB = b.created_at ?? "";
    const createdCompare = createdA.localeCompare(createdB);
    return order === "oldest" ? createdCompare : -createdCompare;
  });
}

/** Menyaring hasil lab berdasarkan periode waktu relatif terhadap `referenceDate`. */
export function filterLabsByPeriod(
  labs: LabResult[],
  period: LabPeriod,
  referenceDate = new Date()
): LabResult[] {
  if (period === "Semua") return labs;

  const monthsBack = period === "3 Bln" ? 3 : period === "6 Bln" ? 6 : 12;
  const cutoff = new Date(
    Date.UTC(
      referenceDate.getUTCFullYear(),
      referenceDate.getUTCMonth() - monthsBack,
      referenceDate.getUTCDate()
    )
  );
  const cutoffIso = cutoff.toISOString().slice(0, 10);

  return labs.filter((lab) => lab.measured_at >= cutoffIso);
}

function extractMetricValue(lab: LabResult, metric: LabMetricTab): number | null {
  switch (metric) {
    case "eGFR":
      return lab.egfr === null ? null : roundEgfrForDisplay(lab.egfr);
    case "Kreatinin":
      return lab.creatinine === null
        ? null
        : roundTo(toCreatinineMgDl(lab.creatinine, toSafeCreatinineUnit(lab.creatinine_unit)), 2);
    case "ACR":
      return lab.acr === null
        ? null
        : roundTo(toAcrMgG(lab.acr, toSafeAcrUnit(lab.acr_unit)), 1);
    case "Kalium":
      return lab.potassium === null ? null : roundTo(lab.potassium, 2);
    case "Ureum":
      return lab.urea === null
        ? null
        : roundTo(convertUrea(lab.urea, toSafeUreaUnit(lab.urea_unit), "mg/dL (urea)"), 1);
  }
}

const METRIC_UNITS: Record<LabMetricTab, string> = {
  eGFR: "mL/mnt/1,73 m²",
  Kreatinin: "mg/dL",
  ACR: "mg/g",
  Kalium: "mmol/L",
  Ureum: "mg/dL (urea)",
};

function computeDomain(metric: LabMetricTab, values: number[]): [number, number] {
  if (metric === "eGFR") {
    const maxVal = values.length ? Math.max(...values) : 100;
    return [0, Math.max(120, Math.ceil((maxVal + 10) / 10) * 10)];
  }
  if (values.length === 0) return [0, 10];
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const span = Math.max(maxVal - minVal, maxVal * 0.25, 1);
  const low = Math.max(0, Math.floor((minVal - span * 0.3) * 10) / 10);
  const high = Math.ceil((maxVal + span * 0.3) * 10) / 10;
  return [low, high];
}

/** Menyusun data grafik dan ringkasan header untuk tab metrik & periode yang dipilih. */
export function buildLabTrendSeries(
  labs: LabResult[],
  metric: LabMetricTab,
  period: LabPeriod,
  referenceDate = new Date()
): LabTrendSeries {
  const unit = METRIC_UNITS[metric];
  const filtered = sortLabRows(filterLabsByPeriod(labs, period, referenceDate), "oldest");

  const points: LabTrendPoint[] = [];
  for (const lab of filtered) {
    const val = extractMetricValue(lab, metric);
    if (val === null) continue;
    points.push({
      id: lab.id,
      measuredAt: lab.measured_at,
      label: formatChartAxisMonth(lab.measured_at),
      fullDate: formatLabDateShort(lab.measured_at),
      value: val,
      isAcuteIllness: Boolean(lab.is_acute_illness),
    });
  }

  const values = points.map((p) => p.value);
  const domain = computeDomain(metric, values);
  const latestPoint = points.at(-1) ?? null;
  const previousPoint = points.length >= 2 ? points.at(-2)! : null;

  if (!latestPoint) {
    return {
      metric,
      unit,
      headline: `Belum ada data ${metric}`,
      subtitle:
        period === "Semua"
          ? `Catat hasil lab untuk mulai memantau tren ${metric} Anda.`
          : `Tidak ada data ${metric} pada periode ${period}. Coba pilih rentang "Semua".`,
      domain,
      points,
      latestIsAcute: false,
      latestIsPotassiumCritical: false,
    };
  }

  let headline = `${metric} terakhir ${formatIndonesianNumber(latestPoint.value)} ${unit}`;
  let subtitle = `Diambil pada ${latestPoint.fullDate}.`;

  if (metric === "eGFR") {
    const stage = gfrStage(latestPoint.value);
    headline = `eGFR terakhir ${latestPoint.value} (${stage})`;
    if (previousPoint) {
      const change = assessEgfrChange({
        current: latestPoint.value,
        previous: previousPoint.value,
      });
      if (change.declined) {
        subtitle = `Turun dari ${previousPoint.value} pada ${previousPoint.fullDate}. Bicarakan dengan dokter.`;
      } else if (change.absoluteChange > 0) {
        subtitle = `Naik dari ${previousPoint.value} pada ${previousPoint.fullDate}.`;
      } else {
        subtitle = `Stabil dibanding hasil ${previousPoint.fullDate} (${previousPoint.value}).`;
      }
    } else {
      subtitle = `Hasil ${latestPoint.fullDate}. Catat hasil berikutnya untuk melihat tren perubahan.`;
    }
  } else if (previousPoint) {
    const diff = latestPoint.value - previousPoint.value;
    const prevFormatted = `${formatIndonesianNumber(previousPoint.value)} ${unit}`;
    if (diff > 0) {
      subtitle = `Naik dari ${prevFormatted} pada ${previousPoint.fullDate}.`;
    } else if (diff < 0) {
      subtitle = `Turun dari ${prevFormatted} pada ${previousPoint.fullDate}.`;
    } else {
      subtitle = `Sama dengan hasil ${previousPoint.fullDate} (${prevFormatted}).`;
    }
  }

  const latestIsPotassiumCritical =
    metric === "Kalium" && isPotassiumCritical(latestPoint.value);

  return {
    metric,
    unit,
    headline,
    subtitle,
    domain,
    points,
    latestIsAcute: latestPoint.isAcuteIllness,
    latestIsPotassiumCritical,
  };
}

/** Mengubah satu baris `lab_results` menjadi model tampilan lengkap dengan stage G/A. */
export function getLabRowDisplay(lab: LabResult, isLatest = false): LabRowDisplay {
  const egfrRounded = lab.egfr === null ? null : roundEgfrForDisplay(lab.egfr);
  const gStage = egfrRounded === null ? null : gfrStage(egfrRounded);

  let aStage: AlbuminuriaStage | null = null;
  if (lab.acr !== null) {
    const acrMgG = toAcrMgG(lab.acr, toSafeAcrUnit(lab.acr_unit));
    aStage = albuminuriaStage(acrMgG);
  }

  const stageParts = [gStage, aStage].filter(Boolean);
  const stageBadge = stageParts.length > 0 ? stageParts.join(" · ") : null;

  const potassiumCritical =
    lab.potassium !== null && isPotassiumCritical(lab.potassium);

  return {
    id: lab.id,
    measuredAt: lab.measured_at,
    formattedDate: formatLabDateShort(lab.measured_at),
    isLatest,
    isAcuteIllness: Boolean(lab.is_acute_illness),
    egfrRounded,
    egfrText: egfrRounded === null ? "—" : `${egfrRounded}`,
    gStage,
    aStage,
    stageBadge,
    creatinineText:
      lab.creatinine === null
        ? "—"
        : `${formatIndonesianNumber(lab.creatinine)} ${toSafeCreatinineUnit(lab.creatinine_unit)}`,
    ureaText:
      lab.urea === null
        ? "—"
        : `${formatIndonesianNumber(lab.urea)} ${toSafeUreaUnit(lab.urea_unit)}`,
    acrText:
      lab.acr === null
        ? "—"
        : `${formatIndonesianNumber(lab.acr)} ${toSafeAcrUnit(lab.acr_unit)}`,
    potassiumText:
      lab.potassium === null ? "—" : `${formatIndonesianNumber(lab.potassium, 1)} mmol/L`,
    potassiumCritical,
    referenceNotes: lab.reference_notes ?? null,
    raw: lab,
  };
}
