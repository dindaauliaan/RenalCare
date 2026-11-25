import {
  ACR_UNITS,
  albuminuriaStage,
  gfrStage,
  roundEgfrForDisplay,
  suggestLabInterval,
  toAcrMgG,
  type AcrUnit,
  type AlbuminuriaStage,
  type GfrStage,
  type LabIntervalSuggestion,
} from "@/lib/clinical";
import { sortLabRows } from "@/lib/labs/processing";
import type { LabResult, Reminder, ReminderType } from "@/types/database";
import type { ReminderFormValues } from "./schemas";

export type AgendaTab = "Akan Datang" | "Selesai" | "Terlewat";
export type ReminderBucket = "upcoming" | "completed" | "overdue";

export interface ClassifiedReminder {
  id: string;
  bucket: ReminderBucket;
  type: ReminderType;
  typeLabel: string;
  title: string;
  day: string;
  month: string;
  statusLabel: string;
  dateTimeLine: string;
  location: string | null;
  notes: string | null;
  isDone: boolean;
  raw: Reminder;
}

export interface AgendaCounts {
  upcoming: number;
  completed: number;
  overdue: number;
}

export interface LabIntervalRecommendation {
  hasStage: boolean;
  stageLabel: string | null;
  hasConfirmedAcr: boolean;
  suggestion: LabIntervalSuggestion | null;
  headline: string;
  description: string;
  prefillValues: ReminderFormValues;
}

const TYPE_LABELS: Record<ReminderType, string> = {
  control: "Kontrol dokter",
  lab: "Pemeriksaan lab",
  medication: "Obat",
};

function toWibDayKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function daysBetweenWibDates(fromDate: Date, toDate: Date): number {
  const [y1, m1, d1] = toWibDayKey(fromDate).split("-").map(Number);
  const [y2, m2, d2] = toWibDayKey(toDate).split("-").map(Number);
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  return Math.round((utc2 - utc1) / (24 * 60 * 60 * 1000));
}

export function classifyReminderBucket(
  reminder: Pick<Reminder, "remind_at" | "is_done">,
  now = new Date()
): ReminderBucket {
  if (reminder.is_done) return "completed";
  const remindTime = new Date(reminder.remind_at).getTime();
  if (!Number.isNaN(remindTime) && remindTime < now.getTime()) {
    return "overdue";
  }
  return "upcoming";
}

export function formatReminderItem(
  reminder: Reminder,
  now = new Date()
): ClassifiedReminder {
  const bucket = classifyReminderBucket(reminder, now);
  const type: ReminderType =
    reminder.type === "lab" || reminder.type === "medication" ? reminder.type : "control";
  const target = new Date(reminder.remind_at);
  const valid = !Number.isNaN(target.getTime());

  const day = valid
    ? new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", day: "2-digit" }).format(
        target
      )
    : "--";
  const month = valid
    ? new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", month: "short" })
        .format(target)
        .toUpperCase()
    : "---";
  const timePart = valid
    ? `${new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
        .format(target)
        .replace(":", ".")} WIB`
    : "";
  const fullDatePart = valid
    ? new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(target)
    : reminder.remind_at;

  let statusLabel = TYPE_LABELS[type];
  if (bucket === "completed") {
    statusLabel = "Selesai";
  } else if (bucket === "overdue") {
    const diff = valid ? Math.abs(daysBetweenWibDates(now, target)) : 0;
    statusLabel = diff === 0 ? "Terlewat hari ini" : `Terlewat ${diff} hari`;
  } else if (valid) {
    const diff = daysBetweenWibDates(now, target);
    if (diff === 0) statusLabel = "Hari ini";
    else if (diff === 1) statusLabel = "Besok";
    else if (diff > 1 && diff <= 30) statusLabel = `${diff} hari lagi`;
  }

  const timeOrDate =
    bucket === "completed" || bucket === "overdue"
      ? `${fullDatePart} · ${timePart}`
      : timePart;
  const dateTimeLine = reminder.location ? `${timeOrDate} · ${reminder.location}` : timeOrDate;

  return {
    id: reminder.id,
    bucket,
    type,
    typeLabel: TYPE_LABELS[type],
    title: reminder.title,
    day,
    month,
    statusLabel,
    dateTimeLine,
    location: reminder.location ?? null,
    notes: reminder.notes ?? null,
    isDone: Boolean(reminder.is_done),
    raw: reminder,
  };
}

export function groupAndCountReminders(
  reminders: Reminder[],
  now = new Date()
): {
  upcoming: ClassifiedReminder[];
  completed: ClassifiedReminder[];
  overdue: ClassifiedReminder[];
  counts: AgendaCounts;
} {
  const items = reminders.map((r) => formatReminderItem(r, now));

  const upcoming = items
    .filter((i) => i.bucket === "upcoming")
    .sort(
      (a, b) =>
        new Date(a.raw.remind_at).getTime() - new Date(b.raw.remind_at).getTime()
    );

  const completed = items
    .filter((i) => i.bucket === "completed")
    .sort(
      (a, b) =>
        new Date(b.raw.remind_at).getTime() - new Date(a.raw.remind_at).getTime()
    );

  const overdue = items
    .filter((i) => i.bucket === "overdue")
    .sort(
      (a, b) =>
        new Date(b.raw.remind_at).getTime() - new Date(a.raw.remind_at).getTime()
    );

  return {
    upcoming,
    completed,
    overdue,
    counts: {
      upcoming: upcoming.length,
      completed: completed.length,
      overdue: overdue.length,
    },
  };
}

function toSafeAcrUnit(unit: string | null): AcrUnit {
  return ACR_UNITS.includes(unit as AcrUnit) ? (unit as AcrUnit) : "mg/g";
}

function computeSuggestedDateTimeLocal(
  latestMeasuredAt: string | null,
  monthsInterval: number,
  now = new Date()
): string {
  const minDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  let target = minDate;

  if (latestMeasuredAt && /^\d{4}-\d{2}-\d{2}$/.test(latestMeasuredAt)) {
    const [y, m, d] = latestMeasuredAt.split("-").map(Number);
    const candidate = new Date(Date.UTC(y, m - 1 + monthsInterval, d));
    if (candidate.getTime() > now.getTime()) {
      target = candidate;
    }
  }

  const datePart = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(target);

  return `${datePart}T07:00`;
}

/**
 * Menghitung saran interval pemeriksaan lab berdasarkan stage terbaru pasien
 * memakai `suggestLabInterval` dari `src/lib/clinical/labInterval.ts`.
 */
export function buildLabIntervalRecommendation(
  labs: LabResult[],
  now = new Date()
): LabIntervalRecommendation {
  const sorted = sortLabRows(labs, "newest");
  const latestWithEgfr = sorted.find((row) => row.egfr !== null) ?? null;
  const latestWithAcr = sorted.find((row) => row.acr !== null) ?? null;

  if (!latestWithEgfr || latestWithEgfr.egfr === null) {
    return {
      hasStage: false,
      stageLabel: null,
      hasConfirmedAcr: false,
      suggestion: null,
      headline: "Jaga pemeriksaan Anda tetap rutin",
      description:
        "Catat hasil lab pertama Anda untuk mendapatkan saran interval pemeriksaan sesuai stage (PERLU DIVERIFIKASI terhadap KDIGO). Anda tetap bisa membuat pengingat lab sekarang.",
      prefillValues: {
        type: "lab",
        title: "Cek laboratorium rutin",
        remindAt: computeSuggestedDateTimeLocal(null, 3, now),
        location: "",
        notes: "Kreatinin, ureum, kalium, dan ACR.",
      },
    };
  }

  const g: GfrStage = gfrStage(roundEgfrForDisplay(latestWithEgfr.egfr));
  const acrValue = latestWithAcr?.acr ?? null;
  const hasConfirmedAcr = acrValue !== null;
  const a: AlbuminuriaStage =
    acrValue !== null
      ? albuminuriaStage(
          toAcrMgG(acrValue, toSafeAcrUnit(latestWithAcr?.acr_unit ?? null))
        )
      : "A1";

  const suggestion = suggestLabInterval(g, a);
  const stageLabel = hasConfirmedAcr ? `${g} ${a}` : g;
  const freqLabel = suggestion.isMinimum
    ? `minimal ${suggestion.timesPerYear}x setahun (sekitar tiap ${suggestion.approxMonthsBetween} bulan)`
    : `${suggestion.timesPerYear}x setahun (sekitar tiap ${suggestion.approxMonthsBetween} bulan)`;

  const acrCaveat = hasConfirmedAcr
    ? ""
    : " (ACR belum tercatat; sementara memakai acuan dasar A1.)";

  const ckdNote = suggestion.onlyIfCkdConfirmed
    ? " Berlaku bila PGK sudah ditegakkan dokter."
    : "";

  return {
    hasStage: true,
    stageLabel,
    hasConfirmedAcr,
    suggestion,
    headline: "Jaga pemeriksaan Anda tetap rutin",
    description: `Untuk stage ${stageLabel}, panduan KDIGO menyarankan cek lab ${freqLabel}.${acrCaveat}${ckdNote} Sesuaikan dengan anjuran dokter Anda (PERLU DIVERIFIKASI terhadap KDIGO).`,
    prefillValues: {
      type: "lab",
      title: "Cek laboratorium rutin",
      remindAt: computeSuggestedDateTimeLocal(
        latestWithEgfr.measured_at,
        suggestion.approxMonthsBetween,
        now
      ),
      location: "",
      notes: "Kreatinin, ureum, kalium, dan ACR.",
    },
  };
}
