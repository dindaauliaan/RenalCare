import { isBloodPressureCritical } from "@/lib/clinical";
import { formatIndonesianTimestamp } from "@/lib/home/summary";
import type { BpArm, BpLog, BpPosition } from "@/types/database";

export interface BpAverage {
  systolic: number;
  diastolic: number;
  count: number;
}

export interface BpMiniBarDay {
  dayKey: string;
  label: string;
  avgSystolic: number | null;
  avgDiastolic: number | null;
  heightPx: number;
  hasData: boolean;
}

export interface BpTarget {
  systolic: number;
  diastolic: number;
}

export interface BpTargetComparison {
  status: "within_or_below" | "above";
  badgeText: string;
  detailText: string;
  referencePeriodLabel: string;
}

export interface BpRowDisplay {
  id: string;
  formattedTime: string;
  systolic: number;
  diastolic: number;
  pulseText: string;
  armLabel: string;
  positionLabel: string;
  isCritical: boolean;
  raw: BpLog;
}

const ARM_LABELS: Record<BpArm, string> = {
  left: "Lengan kiri",
  right: "Lengan kanan",
};

const POSITION_LABELS: Record<BpPosition, string> = {
  sitting: "Duduk",
  standing: "Berdiri",
  lying: "Berbaring",
};

function toWibDayKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getWibCalendarDayKeys(daysBack: number, now = new Date()): string[] {
  const keys: string[] = [];
  const baseMs = now.getTime();
  for (let i = daysBack - 1; i >= 0; i--) {
    const d = new Date(baseMs - i * 24 * 60 * 60 * 1000);
    keys.push(toWibDayKey(d));
  }
  return keys;
}

/** Mengurutkan catatan tensi dari yang terbaru ke terlama (atau sebaliknya). */
export function sortBpLogs(logs: BpLog[], order: "newest" | "oldest" = "newest"): BpLog[] {
  return [...logs].sort((a, b) => {
    const timeA = new Date(a.measured_at).getTime();
    const timeB = new Date(b.measured_at).getTime();
    if (timeA !== timeB) {
      return order === "newest" ? timeB - timeA : timeA - timeB;
    }
    const createdA = a.created_at ?? "";
    const createdB = b.created_at ?? "";
    return order === "newest"
      ? createdB.localeCompare(createdA)
      : createdA.localeCompare(createdB);
  });
}

function averageLogs(logs: BpLog[]): BpAverage | null {
  if (logs.length === 0) return null;
  const totalSys = logs.reduce((acc, item) => acc + item.systolic, 0);
  const totalDia = logs.reduce((acc, item) => acc + item.diastolic, 0);
  return {
    systolic: Math.round(totalSys / logs.length),
    diastolic: Math.round(totalDia / logs.length),
    count: logs.length,
  };
}

/** Menghitung rata-rata 7 hari dan 30 hari terakhir (berdasarkan hari kalender WIB). */
export function computeBpPeriodAverages(
  logs: BpLog[],
  now = new Date()
): { avg7Days: BpAverage | null; avg30Days: BpAverage | null } {
  const last7Keys = new Set(getWibCalendarDayKeys(7, now));
  const last30Keys = new Set(getWibCalendarDayKeys(30, now));

  const logs7: BpLog[] = [];
  const logs30: BpLog[] = [];

  for (const log of logs) {
    const parsed = new Date(log.measured_at);
    if (Number.isNaN(parsed.getTime())) continue;
    const key = toWibDayKey(parsed);
    if (last30Keys.has(key)) {
      logs30.push(log);
      if (last7Keys.has(key)) {
        logs7.push(log);
      }
    }
  }

  return {
    avg7Days: averageLogs(logs7),
    avg30Days: averageLogs(logs30),
  };
}

/** Menyusun data mini-bar 7 hari terakhir (tinggi 18–66 px bila ada data, 6 px bila kosong). */
export function buildLast7DaysMiniBars(
  logs: BpLog[],
  now = new Date()
): BpMiniBarDay[] {
  const dayKeys = getWibCalendarDayKeys(7, now);
  const grouped = new Map<string, BpLog[]>();

  for (const log of logs) {
    const d = new Date(log.measured_at);
    if (Number.isNaN(d.getTime())) continue;
    const key = toWibDayKey(d);
    const list = grouped.get(key) ?? [];
    list.push(log);
    grouped.set(key, list);
  }

  const rawDays = dayKeys.map((dayKey) => {
    const items = grouped.get(dayKey) ?? [];
    const avg = averageLogs(items);
    const [year, month, day] = dayKey.split("-").map(Number);
    const label = new Intl.DateTimeFormat("id-ID", {
      weekday: "short",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(year, month - 1, day)));

    return {
      dayKey,
      label,
      avgSystolic: avg?.systolic ?? null,
      avgDiastolic: avg?.diastolic ?? null,
      hasData: avg !== null,
    };
  });

  const systolicValues = rawDays
    .map((d) => d.avgSystolic)
    .filter((v): v is number => v !== null);

  if (systolicValues.length === 0) {
    return rawDays.map((d) => ({ ...d, heightPx: 6 }));
  }

  const minSys = Math.min(...systolicValues, 90);
  const maxSys = Math.max(...systolicValues, 150);
  const span = Math.max(maxSys - minSys, 20);

  return rawDays.map((d) => {
    if (d.avgSystolic === null) {
      return { ...d, heightPx: 6 };
    }
    const normalized = (d.avgSystolic - minSys) / span;
    const heightPx = Math.round(22 + Math.max(0, Math.min(1, normalized)) * 44);
    return { ...d, heightPx };
  });
}

/**
 * Membandingkan rata-rata tekanan darah terhadap target dari dokter
 * secara deskriptif tanpa menyimpulkan diagnosis medis.
 */
export function compareAverageAgainstTarget({
  avg7Days,
  avg30Days,
  target,
}: {
  avg7Days: BpAverage | null;
  avg30Days: BpAverage | null;
  target: BpTarget;
}): BpTargetComparison | null {
  const reference = avg7Days ?? avg30Days;
  if (!reference) return null;

  const periodLabel = avg7Days ? "rata-rata 7 hari" : "rata-rata 30 hari";
  const withinTarget =
    reference.systolic <= target.systolic && reference.diastolic <= target.diastolic;

  if (withinTarget) {
    return {
      status: "within_or_below",
      badgeText: "Di bawah / sesuai target",
      detailText: `${periodLabel[0].toUpperCase()}${periodLabel.slice(1)} (${reference.systolic}/${reference.diastolic} mmHg) berada di bawah atau sesuai target dokter (${target.systolic}/${target.diastolic} mmHg). Tetap catat secara rutin dan ikuti anjuran dokter.`,
      referencePeriodLabel: periodLabel,
    };
  }

  return {
    status: "above",
    badgeText: "Di atas target",
    detailText: `${periodLabel[0].toUpperCase()}${periodLabel.slice(1)} (${reference.systolic}/${reference.diastolic} mmHg) berada di atas target dokter (${target.systolic}/${target.diastolic} mmHg). Bawa catatan ini untuk didiskusikan saat kontrol.`,
    referencePeriodLabel: periodLabel,
  };
}

export function formatBpLogRow(log: BpLog, now = new Date()): BpRowDisplay {
  return {
    id: log.id,
    formattedTime: formatIndonesianTimestamp(log.measured_at, now),
    systolic: log.systolic,
    diastolic: log.diastolic,
    pulseText: log.pulse !== null ? `${log.pulse} x/mnt` : "—",
    armLabel: log.arm ? ARM_LABELS[log.arm] : "—",
    positionLabel: log.position ? POSITION_LABELS[log.position] : "—",
    isCritical: isBloodPressureCritical({
      systolic: log.systolic,
      diastolic: log.diastolic,
    }),
    raw: log,
  };
}
