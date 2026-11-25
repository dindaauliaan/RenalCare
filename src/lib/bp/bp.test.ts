import { describe, expect, it } from "vitest";
import type { BpLog } from "@/types/database";
import {
  buildLast7DaysMiniBars,
  compareAverageAgainstTarget,
  computeBpPeriodAverages,
  formatBpLogRow,
  sortBpLogs,
} from "./processing";
import {
  bpFormSchema,
  bpTargetSchema,
  parseBpFormValues,
  parseBpTargetValues,
} from "./schemas";

function makeBpLog(overrides: Partial<BpLog> = {}): BpLog {
  return {
    id: "bp-1",
    user_id: "user-1",
    measured_at: "2026-11-25T01:00:00Z", // 08.00 WIB
    systolic: 130,
    diastolic: 82,
    pulse: 72,
    arm: "left",
    position: "sitting",
    created_at: "2026-11-25T01:00:00Z",
    ...overrides,
  };
}

describe("bpFormSchema & bpTargetSchema", () => {
  it("menerima input pengukuran valid dan mengonversi waktu WIB ke ISO", () => {
    const parsed = bpFormSchema.safeParse({
      systolic: "132",
      diastolic: "84",
      pulse: "74",
      arm: "left",
      position: "sitting",
      measuredAt: "2026-11-25T07:15",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      const payload = parseBpFormValues(parsed.data);
      expect(payload.systolic).toBe(132);
      expect(payload.diastolic).toBe(84);
      expect(payload.pulse).toBe(74);
      expect(payload.measuredAtIso).toBe("2026-11-25T00:15:00.000Z");
    }
  });

  it("menerima denyut nadi kosong sebagai null", () => {
    const parsed = bpFormSchema.safeParse({
      systolic: "120",
      diastolic: "80",
      pulse: "",
      arm: "right",
      position: "standing",
      measuredAt: "2026-11-25T07:15",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parseBpFormValues(parsed.data).pulse).toBeNull();
    }
  });

  it("menolak diastolik lebih tinggi atau sama dengan sistolik, dan rentang di luar batas", () => {
    expect(
      bpFormSchema.safeParse({
        systolic: "90",
        diastolic: "95",
        pulse: "",
        arm: "left",
        position: "sitting",
        measuredAt: "2026-11-25T07:15",
      }).success
    ).toBe(false);

    expect(
      bpFormSchema.safeParse({
        systolic: "350",
        diastolic: "80",
        pulse: "",
        arm: "left",
        position: "sitting",
        measuredAt: "2026-11-25T07:15",
      }).success
    ).toBe(false);
  });

  it("memvalidasi target tekanan darah dokter", () => {
    const valid = bpTargetSchema.safeParse({
      targetSystolic: "130",
      targetDiastolic: "80",
    });
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(parseBpTargetValues(valid.data)).toEqual({ systolic: 130, diastolic: 80 });
    }

    expect(
      bpTargetSchema.safeParse({
        targetSystolic: "80",
        targetDiastolic: "90",
      }).success
    ).toBe(false);
  });
});

describe("computeBpPeriodAverages & buildLast7DaysMiniBars", () => {
  const now = new Date("2026-11-25T05:00:00Z"); // 25 Nov 2026 12.00 WIB
  const logs: BpLog[] = [
    makeBpLog({ id: "today", measured_at: "2026-11-25T01:00:00Z", systolic: 130, diastolic: 80 }),
    makeBpLog({ id: "3d", measured_at: "2026-11-22T01:00:00Z", systolic: 140, diastolic: 90 }),
    makeBpLog({ id: "15d", measured_at: "2026-11-10T01:00:00Z", systolic: 120, diastolic: 70 }),
    makeBpLog({ id: "45d", measured_at: "2026-10-10T01:00:00Z", systolic: 160, diastolic: 100 }),
  ];

  it("menghitung rata-rata 7 hari dan 30 hari dengan tepat", () => {
    const { avg7Days, avg30Days } = computeBpPeriodAverages(logs, now);
    expect(avg7Days).toEqual({ systolic: 135, diastolic: 85, count: 2 });
    expect(avg30Days).toEqual({ systolic: 130, diastolic: 80, count: 3 });
  });

  it("menyusun 7 mini-bar sesuai 7 hari terakhir WIB", () => {
    const bars = buildLast7DaysMiniBars(logs, now);
    expect(bars).toHaveLength(7);
    expect(bars[6].dayKey).toBe("2026-11-25");
    expect(bars[6].avgSystolic).toBe(130);
    expect(bars[6].hasData).toBe(true);
    expect(bars[5].hasData).toBe(false);
    expect(bars[5].heightPx).toBe(6);
  });

  it("mengurutkan log terbaru terlebih dahulu", () => {
    const sorted = sortBpLogs(logs, "newest");
    expect(sorted[0].id).toBe("today");
    expect(sorted.at(-1)?.id).toBe("45d");
  });
});

describe("compareAverageAgainstTarget & formatBpLogRow", () => {
  it("membandingkan rata-rata terhadap target dokter tanpa klaim diagnosis", () => {
    const below = compareAverageAgainstTarget({
      avg7Days: { systolic: 126, diastolic: 78, count: 3 },
      avg30Days: null,
      target: { systolic: 130, diastolic: 80 },
    });
    expect(below?.status).toBe("within_or_below");

    const above = compareAverageAgainstTarget({
      avg7Days: { systolic: 138, diastolic: 82, count: 3 },
      avg30Days: null,
      target: { systolic: 130, diastolic: 80 },
    });
    expect(above?.status).toBe("above");

    const diaAbove = compareAverageAgainstTarget({
      avg7Days: null,
      avg30Days: { systolic: 125, diastolic: 86, count: 4 },
      target: { systolic: 130, diastolic: 80 },
    });
    expect(diaAbove?.status).toBe("above");
    expect(diaAbove?.referencePeriodLabel).toBe("rata-rata 30 hari");
  });

  it("menandai tensi kritis pada baris riwayat", () => {
    const row = formatBpLogRow(
      makeBpLog({ systolic: 182, diastolic: 95 }),
      new Date("2026-11-25T05:00:00Z")
    );
    expect(row.isCritical).toBe(true);
    expect(row.armLabel).toBe("Lengan kiri");
    expect(row.positionLabel).toBe("Duduk");
  });
});
