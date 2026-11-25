import { describe, expect, it } from "vitest";
import type { LabResult, Reminder } from "@/types/database";
import {
  buildLabIntervalRecommendation,
  classifyReminderBucket,
  groupAndCountReminders,
} from "./processing";
import { parseReminderFormValues, reminderFormSchema } from "./schemas";

function makeReminder(overrides: Partial<Reminder> = {}): Reminder {
  return {
    id: "rem-1",
    user_id: "user-1",
    type: "control",
    title: "Kontrol dokter ginjal",
    remind_at: "2026-11-28T02:30:00Z", // 28 Nov 2026 09.30 WIB
    location: "RS Harapan Sehat",
    notes: "Bawa hasil lab terakhir.",
    is_done: false,
    ...overrides,
  };
}

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
    egfr: 52,
    is_acute_illness: false,
    reference_notes: null,
    created_at: "2026-09-18T08:00:00Z",
    ...overrides,
  };
}

describe("reminderFormSchema", () => {
  it("memvalidasi pengingat valid dan mengonversi WIB ke ISO", () => {
    const parsed = reminderFormSchema.safeParse({
      type: "lab",
      title: "  Cek laboratorium rutin ",
      remindAt: "2026-12-01T07:00",
      location: "Lab Medika",
      notes: "",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      const payload = parseReminderFormValues(parsed.data);
      expect(payload.title).toBe("Cek laboratorium rutin");
      expect(payload.location).toBe("Lab Medika");
      expect(payload.notes).toBeNull();
      expect(payload.remindAtIso).toBe("2026-12-01T00:00:00.000Z");
    }
  });

  it("menolak judul terlalu pendek atau kosong", () => {
    expect(
      reminderFormSchema.safeParse({
        type: "control",
        title: "A",
        remindAt: "2026-12-01T09:00",
        location: "",
        notes: "",
      }).success
    ).toBe(false);
  });
});

describe("classifyReminderBucket & groupAndCountReminders", () => {
  const now = new Date("2026-11-25T05:00:00Z"); // 25 Nov 2026 12.00 WIB

  it("mengelompokkan Akan Datang, Selesai, dan Terlewat dengan tepat", () => {
    expect(
      classifyReminderBucket({ remind_at: "2026-11-28T02:30:00Z", is_done: false }, now)
    ).toBe("upcoming");
    expect(
      classifyReminderBucket({ remind_at: "2026-11-20T02:30:00Z", is_done: false }, now)
    ).toBe("overdue");
    expect(
      classifyReminderBucket({ remind_at: "2026-11-20T02:30:00Z", is_done: true }, now)
    ).toBe("completed");
  });

  it("menghitung jumlah tiap tab dan mengurutkan sesuai jenis tab", () => {
    const grouped = groupAndCountReminders(
      [
        makeReminder({ id: "up-far", remind_at: "2026-12-10T02:00:00Z", is_done: false }),
        makeReminder({ id: "up-near", remind_at: "2026-11-26T02:00:00Z", is_done: false }),
        makeReminder({ id: "done-1", remind_at: "2026-11-10T02:00:00Z", is_done: true }),
        makeReminder({ id: "over-1", remind_at: "2026-11-22T02:00:00Z", is_done: false }),
        makeReminder({ id: "over-2", remind_at: "2026-11-24T02:00:00Z", is_done: false }),
      ],
      now
    );

    expect(grouped.counts).toEqual({ upcoming: 2, completed: 1, overdue: 2 });
    expect(grouped.upcoming.map((i) => i.id)).toEqual(["up-near", "up-far"]);
    expect(grouped.overdue.map((i) => i.id)).toEqual(["over-2", "over-1"]);
    expect(grouped.completed[0].statusLabel).toBe("Selesai");
  });
});

describe("buildLabIntervalRecommendation", () => {
  const now = new Date("2026-11-25T05:00:00Z");

  it("menghasilkan rekomendasi G3a A2 (2x setahun) dan prefill form otomatis", () => {
    const rec = buildLabIntervalRecommendation([makeLab({ egfr: 52, acr: 38 })], now);
    expect(rec.hasStage).toBe(true);
    expect(rec.stageLabel).toBe("G3a A2");
    expect(rec.suggestion?.timesPerYear).toBe(2);
    expect(rec.suggestion?.approxMonthsBetween).toBe(6);
    expect(rec.prefillValues.type).toBe("lab");
    expect(rec.prefillValues.remindAt).toBe("2027-03-18T07:00");
  });

  it("tetap menyediakan prefill aman bila belum ada data lab sama sekali", () => {
    const rec = buildLabIntervalRecommendation([], now);
    expect(rec.hasStage).toBe(false);
    expect(rec.prefillValues.type).toBe("lab");
    expect(rec.prefillValues.remindAt).toMatch(/^\d{4}-\d{2}-\d{2}T07:00$/);
  });
});
