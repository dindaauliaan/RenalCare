import {
  ACR_UNITS,
  albuminuriaStage,
  assessEgfrChange,
  gfrStage,
  isBloodPressureCritical,
  roundEgfrForDisplay,
  toAcrMgG,
  type AcrUnit,
  type AlbuminuriaStage,
  type GfrStage,
} from "@/lib/clinical";
import { formatLabDateShort, sortLabRows } from "@/lib/labs/processing";
import type { BpLog, LabResult, Reminder } from "@/types/database";

export interface HomeKidneySummary {
  hasEgfr: boolean;
  egfrRounded: number | null;
  stageLabel: string | null;
  gStage: GfrStage | null;
  aStage: AlbuminuriaStage | null;
  measuredDateLabel: string | null;
  meterLeftPercent: number;
  explanation: string;
  isAcuteIllness: boolean;
  declineAlert: {
    currentEgfr: number;
    previousEgfr: number;
    previousDateLabel: string;
  } | null;
}

export interface HomeBpSummary {
  hasData: boolean;
  systolic: number | null;
  diastolic: number | null;
  measuredLabel: string | null;
  isCritical: boolean;
}

export interface HomeAgendaSummary {
  hasData: boolean;
  title: string | null;
  day: string | null;
  month: string | null;
  timeLabel: string | null;
  location: string | null;
}

/**
 * Memetakan nilai eGFR ke persentase posisi penanda pada `.meter`:
 *   - 0%–36%  : Hijau (G1–G2, eGFR ≥ 60, skala 120 → 60)
 *   - 36%–58% : Kuning (G3a–G3b, eGFR 30–59)
 *   - 58%–78% : Oranye (G4, eGFR 15–29)
 *   - 78%–100%: Merah (G5, eGFR < 15)
 */
export function calculateEgfrMeterPosition(egfr: number): number {
  const clamped = Math.max(0, Math.min(120, egfr));

  let percent: number;
  if (clamped >= 60) {
    percent = ((120 - clamped) / 60) * 36;
  } else if (clamped >= 30) {
    percent = 36 + ((60 - clamped) / 30) * 22;
  } else if (clamped >= 15) {
    percent = 58 + ((30 - clamped) / 15) * 20;
  } else {
    percent = 78 + ((15 - clamped) / 15) * 22;
  }

  return Math.round(Math.max(2, Math.min(98, percent)) * 10) / 10;
}

const STAGE_EXPLANATIONS: Record<GfrStage, string> = {
  G1: "Fungsi saringan ginjal berada pada kisaran normal atau tinggi. Ini perkiraan; dokter yang menentukan artinya untuk Anda.",
  G2: "Penurunan ringan. Ini perkiraan; dokter yang menentukan artinya untuk Anda.",
  G3a: "Penurunan ringan sampai sedang. Ini perkiraan; dokter yang menentukan artinya untuk Anda.",
  G3b: "Penurunan sedang sampai berat. Ini perkiraan; dokter yang menentukan artinya untuk Anda.",
  G4: "Penurunan berat pada fungsi saringan ginjal. Ini perkiraan; diskusikan rencana perawatan bersama dokter Anda.",
  G5: "Fungsi saringan ginjal sangat rendah. Ini perkiraan; segera diskusikan penanganan lanjutan dengan dokter Anda.",
};

export function getGfrStageExplanation(stage: GfrStage): string {
  return STAGE_EXPLANATIONS[stage];
}

function toSafeAcrUnit(unit: string | null): AcrUnit {
  return ACR_UNITS.includes(unit as AcrUnit) ? (unit as AcrUnit) : "mg/g";
}

export function buildHomeKidneySummary(labs: LabResult[]): HomeKidneySummary {
  const sorted = sortLabRows(labs, "newest");
  const egfrRows = sorted.filter((row) => row.egfr !== null);
  const latestWithEgfr = egfrRows[0] ?? null;
  const previousWithEgfr = egfrRows[1] ?? null;

  if (!latestWithEgfr || latestWithEgfr.egfr === null) {
    const latestAny = sorted[0] ?? null;
    let aStageOnly: AlbuminuriaStage | null = null;
    if (latestAny?.acr !== null && latestAny?.acr !== undefined) {
      aStageOnly = albuminuriaStage(
        toAcrMgG(latestAny.acr, toSafeAcrUnit(latestAny.acr_unit))
      );
    }

    return {
      hasEgfr: false,
      egfrRounded: null,
      stageLabel: aStageOnly,
      gStage: null,
      aStage: aStageOnly,
      measuredDateLabel: latestAny ? formatLabDateShort(latestAny.measured_at) : null,
      meterLeftPercent: 0,
      explanation: latestAny
        ? "Hasil lab terbaru belum memuat nilai kreatinin/eGFR. Tambahkan nilai kreatinin untuk melihat perkiraan eGFR."
        : "Catat hasil laboratorium pertama Anda untuk melihat perkiraan eGFR dan kategori fungsi ginjal.",
      isAcuteIllness: Boolean(latestAny?.is_acute_illness),
      declineAlert: null,
    };
  }

  const egfrRounded = roundEgfrForDisplay(latestWithEgfr.egfr);
  const g = gfrStage(egfrRounded);

  // Gunakan ACR dari hasil terbaru yang memiliki ACR bila baris terbaru tidak menyertakan ACR
  const acrSource =
    latestWithEgfr.acr !== null
      ? latestWithEgfr
      : sorted.find((row) => row.acr !== null) ?? null;

  const a =
    acrSource && acrSource.acr !== null
      ? albuminuriaStage(toAcrMgG(acrSource.acr, toSafeAcrUnit(acrSource.acr_unit)))
      : null;

  const stageLabel = a ? `${g} · ${a}` : g;

  let declineAlert: HomeKidneySummary["declineAlert"] = null;
  if (previousWithEgfr && previousWithEgfr.egfr !== null) {
    const prevRounded = roundEgfrForDisplay(previousWithEgfr.egfr);
    const change = assessEgfrChange({
      current: egfrRounded,
      previous: prevRounded,
    });
    if (change.declined) {
      declineAlert = {
        currentEgfr: egfrRounded,
        previousEgfr: prevRounded,
        previousDateLabel: formatLabDateShort(previousWithEgfr.measured_at),
      };
    }
  }

  return {
    hasEgfr: true,
    egfrRounded,
    stageLabel,
    gStage: g,
    aStage: a,
    measuredDateLabel: formatLabDateShort(latestWithEgfr.measured_at),
    meterLeftPercent: calculateEgfrMeterPosition(egfrRounded),
    explanation: getGfrStageExplanation(g),
    isAcuteIllness: Boolean(latestWithEgfr.is_acute_illness),
    declineAlert,
  };
}

export function formatIndonesianTimestamp(isoTimestamp: string, now = new Date()): string {
  const target = new Date(isoTimestamp);
  if (Number.isNaN(target.getTime())) return isoTimestamp;

  const dayKeyFmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const timeFmt = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const timePart = timeFmt.format(target).replace(":", ".");
  if (dayKeyFmt.format(target) === dayKeyFmt.format(now)) {
    return `Hari ini, ${timePart}`;
  }

  const datePart = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(target);

  return `${datePart}, ${timePart}`;
}

export function buildHomeBpSummary(bpLogs: BpLog[], now = new Date()): HomeBpSummary {
  const latest = bpLogs[0] ?? null;
  if (!latest) {
    return {
      hasData: false,
      systolic: null,
      diastolic: null,
      measuredLabel: null,
      isCritical: false,
    };
  }

  return {
    hasData: true,
    systolic: latest.systolic,
    diastolic: latest.diastolic,
    measuredLabel: formatIndonesianTimestamp(latest.measured_at, now),
    isCritical: isBloodPressureCritical({
      systolic: latest.systolic,
      diastolic: latest.diastolic,
    }),
  };
}

export function buildHomeAgendaSummary(reminders: Reminder[]): HomeAgendaSummary {
  const next = reminders[0] ?? null;
  if (!next) {
    return {
      hasData: false,
      title: null,
      day: null,
      month: null,
      timeLabel: null,
      location: null,
    };
  }

  const date = new Date(next.remind_at);
  const valid = !Number.isNaN(date.getTime());

  const day = valid
    ? new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        day: "2-digit",
      }).format(date)
    : "--";
  const month = valid
    ? new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        month: "short",
      })
        .format(date)
        .toUpperCase()
    : "---";
  const timePart = valid
    ? `${new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
        .format(date)
        .replace(":", ".")} WIB`
    : "";

  return {
    hasData: true,
    title: next.title,
    day,
    month,
    timeLabel: timePart,
    location: next.location ?? null,
  };
}

export function getIndonesianTimeGreeting(now = new Date()): string {
  const hourStr = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    hour12: false,
  }).format(now);
  const hour = Number(hourStr);

  if (hour >= 4 && hour < 11) return "Selamat pagi";
  if (hour >= 11 && hour < 15) return "Selamat siang";
  if (hour >= 15 && hour < 18) return "Selamat sore";
  return "Selamat malam";
}
