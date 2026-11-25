import { describe, expect, it } from "vitest";
import type { BpLog, LabResult, Reminder } from "@/types/database";
import {
  buildHomeAgendaSummary,
  buildHomeBpSummary,
  buildHomeKidneySummary,
  calculateEgfrMeterPosition,
  getIndonesianTimeGreeting,
} from "./summary";

function makeLab(overrides: Partial<LabResult> = {}): LabResult {
  return {
    id: "lab-1",
    user_id: "user-1",
    measured_at: "2026-09-18",
    creatinine: 1.42,
    creatinine_unit: "mg/dL",
    urea: null,
    urea_unit: "mg/dL (urea)",
    potassium: null,
    acr: 38,
    acr_unit: "mg/g",
    egfr: 52.1,
    is_acute_illness: false,
    reference_notes: null,
    created_at: "2026-09-18T08:00:00Z",
    ...overrides,
  };
}

describe("calculateEgfrMeterPosition", () => {
  it("memetakan tiap stage eGFR ke segmen warna meter yang sesuai", () => {
    // Hijau: 0–36% (eGFR ≥ 60)
    expect(calculateEgfrMeterPosition(110)).toBeGreaterThanOrEqual(2);
    expect(calculateEgfrMeterPosition(110)).toBeLessThan(36);
    expect(calculateEgfrMeterPosition(60)).toBe(36);

    // Kuning: 36–58% (eGFR 30–59)
    const pos52 = calculateEgfrMeterPosition(52);
    expect(pos52).toBeGreaterThan(36);
    expect(pos52).toBeLessThan(58);
    expect(calculateEgfrMeterPosition(30)).toBe(58);

    // Oranye: 58–78% (eGFR 15–29)
    const pos22 = calculateEgfrMeterPosition(22);
    expect(pos22).toBeGreaterThan(58);
    expect(pos22).toBeLessThan(78);
    expect(calculateEgfrMeterPosition(15)).toBe(78);

    // Merah: 78–98% (eGFR < 15)
    expect(calculateEgfrMeterPosition(8)).toBeGreaterThan(78);
    expect(calculateEgfrMeterPosition(0)).toBe(98);
  });
});

describe("buildHomeKidneySummary", () => {
  it("mengembalikan keadaan kosong bila belum ada hasil lab", () => {
    const res = buildHomeKidneySummary([]);
    expect(res.hasEgfr).toBe(false);
    expect(res.egfrRounded).toBeNull();
    expect(res.declineAlert).toBeNull();
  });

  it("tidak memunculkan banner penurunan bila baru ada 1 hasil lab", () => {
    const res = buildHomeKidneySummary([makeLab({ egfr: 52.1, acr: 38 })]);
    expect(res.hasEgfr).toBe(true);
    expect(res.egfrRounded).toBe(52);
    expect(res.stageLabel).toBe("G3a · A2");
    expect(res.declineAlert).toBeNull();
  });

  it("memunculkan banner penurunan bila eGFR turun dibanding hasil sebelumnya", () => {
    const res = buildHomeKidneySummary([
      makeLab({ id: "new", measured_at: "2026-09-18", egfr: 52.1, acr: 38 }),
      makeLab({ id: "old", measured_at: "2026-08-12", egfr: 61.4, acr: 32 }),
    ]);
    expect(res.declineAlert).toEqual({
      currentEgfr: 52,
      previousEgfr: 61,
      previousDateLabel: "12 Agu 2026",
    });
  });

  it("tidak memunculkan banner penurunan bila eGFR stabil atau naik", () => {
    const res = buildHomeKidneySummary([
      makeLab({ id: "new", measured_at: "2026-09-18", egfr: 64.2 }),
      makeLab({ id: "old", measured_at: "2026-08-12", egfr: 61.1 }),
    ]);
    expect(res.declineAlert).toBeNull();
  });
});

describe("buildHomeBpSummary & buildHomeAgendaSummary", () => {
  it("menangani array kosong dengan ramah", () => {
    expect(buildHomeBpSummary([]).hasData).toBe(false);
    expect(buildHomeAgendaSummary([]).hasData).toBe(false);
  });

  it("memformat tekanan darah terakhir dan mendeteksi tensi kritis", () => {
    const log: BpLog = {
      id: "bp-1",
      user_id: "u1",
      measured_at: "2026-11-25T00:15:00Z", // 07.15 WIB
      systolic: 132,
      diastolic: 84,
      pulse: 72,
      arm: "left",
      position: "sitting",
      created_at: null,
    };
    const now = new Date("2026-11-25T05:00:00Z"); // hari sama di WIB
    const summary = buildHomeBpSummary([log], now);
    expect(summary.hasData).toBe(true);
    expect(summary.measuredLabel).toBe("Hari ini, 07.15");
    expect(summary.isCritical).toBe(false);

    const critical = buildHomeBpSummary([{ ...log, systolic: 185 }], now);
    expect(critical.isCritical).toBe(true);
  });

  it("memformat agenda terdekat dalam WIB", () => {
    const rem: Reminder = {
      id: "r1",
      user_id: "u1",
      type: "control",
      title: "Kontrol dokter ginjal",
      remind_at: "2026-09-28T02:30:00Z", // 09.30 WIB
      location: "RS Harapan Sehat",
      notes: null,
      is_done: false,
    };
    const summary = buildHomeAgendaSummary([rem]);
    expect(summary).toEqual({
      hasData: true,
      title: "Kontrol dokter ginjal",
      day: "28",
      month: "SEP",
      timeLabel: "09.30 WIB",
      location: "RS Harapan Sehat",
    });
  });
});

describe("getIndonesianTimeGreeting", () => {
  it("menghasilkan sapaan pagi/siang/sore/malam sesuai jam WIB", () => {
    expect(getIndonesianTimeGreeting(new Date("2026-11-25T01:00:00Z"))).toBe("Selamat pagi"); // 08.00 WIB
    expect(getIndonesianTimeGreeting(new Date("2026-11-25T05:00:00Z"))).toBe("Selamat siang"); // 12.00 WIB
    expect(getIndonesianTimeGreeting(new Date("2026-11-25T09:00:00Z"))).toBe("Selamat sore"); // 16.00 WIB
    expect(getIndonesianTimeGreeting(new Date("2026-11-25T13:00:00Z"))).toBe("Selamat malam"); // 20.00 WIB
  });
});
