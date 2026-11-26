import type { BpLog, LabResult } from "@/types/database";

const FORMULA_PREFIXES = ["=", "+", "-", "@", "\t", "\r"];

export function escapeCsvCell(
  value: string | number | boolean | null | undefined,
): string {
  if (value === null || value === undefined) {
    return "";
  }

  let text = String(value);

  // Cegah CSV formula injection bila isi string dibuka di spreadsheet
  if (
    typeof value === "string" &&
    text.length > 0 &&
    FORMULA_PREFIXES.some((prefix) => text.startsWith(prefix))
  ) {
    text = `'${text}`;
  }

  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

export function buildCsvString(
  headers: string[],
  rows: Array<Array<string | number | boolean | null | undefined>>,
): string {
  const headerLine = headers.map((header) => escapeCsvCell(header)).join(",");
  const dataLines = rows.map((row) =>
    row.map((cell) => escapeCsvCell(cell)).join(","),
  );

  // UTF-8 BOM agar karakter non-ASCII dan kolom rapi saat dibuka di Excel Windows
  return `\uFEFF${[headerLine, ...dataLines].join("\r\n")}`;
}

export function buildLabResultsCsv(rows: LabResult[]): string {
  const headers = [
    "tanggal_ukur",
    "egfr_ml_menit_1_73m2",
    "kreatinin",
    "satuan_kreatinin",
    "ureum",
    "satuan_ureum",
    "kalium_mmol_l",
    "acr",
    "satuan_acr",
    "diambil_saat_sakit_akut",
    "catatan_referensi",
    "dibuat_pada",
  ];

  const csvRows = rows.map((row) => [
    row.measured_at,
    row.egfr,
    row.creatinine,
    row.creatinine_unit,
    row.urea,
    row.urea_unit,
    row.potassium,
    row.acr,
    row.acr_unit,
    row.is_acute_illness === null
      ? ""
      : row.is_acute_illness
        ? "Ya"
        : "Tidak",
    row.reference_notes,
    row.created_at,
  ]);

  return buildCsvString(headers, csvRows);
}

function formatBpArm(arm: BpLog["arm"]): string {
  if (arm === "left") return "Kiri";
  if (arm === "right") return "Kanan";
  return "";
}

function formatBpPosition(position: BpLog["position"]): string {
  if (position === "sitting") return "Duduk";
  if (position === "standing") return "Berdiri";
  if (position === "lying") return "Berbaring";
  return "";
}

export function buildBpLogsCsv(rows: BpLog[]): string {
  const headers = [
    "waktu_ukur",
    "sistolik_mmhg",
    "diastolik_mmhg",
    "nadi_bpm",
    "lengan",
    "posisi",
    "dibuat_pada",
  ];

  const csvRows = rows.map((row) => [
    row.measured_at,
    row.systolic,
    row.diastolic,
    row.pulse,
    formatBpArm(row.arm),
    formatBpPosition(row.position),
    row.created_at,
  ]);

  return buildCsvString(headers, csvRows);
}

export function getExportFileNames(date = new Date()): {
  lab: string;
  bp: string;
} {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value ?? "2026";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  const stamp = `${year}-${month}-${day}`;

  return {
    lab: `renalcare-riwayat-lab-${stamp}.csv`,
    bp: `renalcare-tekanan-darah-${stamp}.csv`,
  };
}
