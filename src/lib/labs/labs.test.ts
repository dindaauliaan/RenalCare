import { describe, expect, it } from "vitest";
import type { LabResult } from "@/types/database";
import {
  buildLabTrendSeries,
  calculateAgeAtDate,
  computeEgfrForLabEntry,
  filterLabsByPeriod,
  getLabRowDisplay,
  sortLabRows,
} from "./processing";
import { labFormSchema, parseLabFormValues } from "./schemas";

function makeLabRow(overrides: Partial<LabResult> = {}): LabResult {
  return {
    id: "lab-1",
    user_id: "user-1",
    measured_at: "2026-09-18",
    creatinine: 1.2,
    creatinine_unit: "mg/dL",
    urea: 40,
    urea_unit: "mg/dL (urea)",
    potassium: 4.5,
    acr: 38,
    acr_unit: "mg/g",
    egfr: 51.8213,
    is_acute_illness: false,
    reference_notes: null,
    created_at: "2026-09-18T08:00:00Z",
    ...overrides,
  };
}

describe("calculateAgeAtDate", () => {
  it("menghitung usia tepat pada tanggal pengambilan sampel", () => {
    expect(calculateAgeAtDate("1966-09-18", "2026-09-18")).toBe(60);
    expect(calculateAgeAtDate("1966-09-19", "2026-09-18")).toBe(59);
  });

  it("menolak tanggal sampel sebelum tanggal lahir", () => {
    expect(() => calculateAgeAtDate("2000-05-01", "1999-05-01")).toThrow();
  });
});

describe("computeEgfrForLabEntry", () => {
  it("menghitung eGFR dari kreatinin mg/dL dan usia pada tanggal sampel", () => {
    // Laki-laki 60 tahun (lahir 1966-01-01, sampel 2026-09-18), kreatinin 1.0 mg/dL ≈ 86.16
    const egfr = computeEgfrForLabEntry({
      creatinine: 1.0,
      creatinineUnit: "mg/dL",
      measuredAt: "2026-09-18",
      birthDate: "1966-01-01",
      sex: "male",
    });
    expect(egfr).not.toBeNull();
    expect(egfr!).toBeCloseTo(86.1626, 2);
  });

  it("mengonversi kreatinin µmol/L sebelum menghitung eGFR", () => {
    // 88.4 µmol/L = 1.0 mg/dL
    const egfr = computeEgfrForLabEntry({
      creatinine: 88.4,
      creatinineUnit: "µmol/L",
      measuredAt: "2026-09-18",
      birthDate: "1966-01-01",
      sex: "male",
    });
    expect(egfr!).toBeCloseTo(86.1626, 2);
  });

  it("mengembalikan null jika kreatinin tidak diisi", () => {
    expect(
      computeEgfrForLabEntry({
        creatinine: null,
        creatinineUnit: "mg/dL",
        measuredAt: "2026-09-18",
        birthDate: "1966-01-01",
        sex: "male",
      })
    ).toBeNull();
  });
});

describe("filterLabsByPeriod & sortLabRows", () => {
  const refDate = new Date("2026-09-25T00:00:00Z");
  const rows = [
    makeLabRow({ id: "old-2yr", measured_at: "2024-08-01" }),
    makeLabRow({ id: "10mo", measured_at: "2025-11-10" }),
    makeLabRow({ id: "5mo", measured_at: "2026-04-20" }),
    makeLabRow({ id: "1mo", measured_at: "2026-08-15" }),
  ];

  it("menyaring periode 3 Bln, 6 Bln, 1 Thn, dan Semua", () => {
    expect(filterLabsByPeriod(rows, "3 Bln", refDate).map((r) => r.id)).toEqual(["1mo"]);
    expect(filterLabsByPeriod(rows, "6 Bln", refDate).map((r) => r.id)).toEqual(["5mo", "1mo"]);
    expect(filterLabsByPeriod(rows, "1 Thn", refDate).map((r) => r.id)).toEqual([
      "10mo",
      "5mo",
      "1mo",
    ]);
    expect(filterLabsByPeriod(rows, "Semua", refDate)).toHaveLength(4);
  });

  it("mengurutkan terbaru dan terlama", () => {
    expect(sortLabRows(rows, "newest")[0].id).toBe("1mo");
    expect(sortLabRows(rows, "oldest")[0].id).toBe("old-2yr");
  });
});

describe("buildLabTrendSeries", () => {
  const refDate = new Date("2026-09-25T00:00:00Z");
  const rows = [
    makeLabRow({
      id: "sep",
      measured_at: "2026-09-18",
      egfr: 51.8,
      creatinine: 106.08,
      creatinine_unit: "µmol/L", // = 1.2 mg/dL
      acr: 10,
      acr_unit: "mg/mmol", // = 88.4 mg/g
      urea: 10,
      urea_unit: "mmol/L", // = 60.06 mg/dL urea
      is_acute_illness: true,
    }),
    makeLabRow({
      id: "agu",
      measured_at: "2026-08-12",
      egfr: 61.2,
      creatinine: 1.25,
      creatinine_unit: "mg/dL",
      acr: 32,
      acr_unit: "mg/g",
      urea: 42,
      urea_unit: "mg/dL (urea)",
      is_acute_illness: false,
    }),
  ];

  it("membuat tren eGFR urut kronologis dan mendeteksi penurunan", () => {
    const series = buildLabTrendSeries(rows, "eGFR", "6 Bln", refDate);
    expect(series.points.map((p) => p.value)).toEqual([61, 52]);
    expect(series.headline).toBe("eGFR terakhir 52 (G3a)");
    expect(series.subtitle).toContain("Turun dari 61");
    expect(series.latestIsAcute).toBe(true);
  });

  it("menyeragamkan satuan saat memplot Kreatinin, ACR, dan Ureum", () => {
    const cr = buildLabTrendSeries(rows, "Kreatinin", "Semua", refDate);
    expect(cr.points.map((p) => p.value)).toEqual([1.25, 1.2]);

    const acr = buildLabTrendSeries(rows, "ACR", "Semua", refDate);
    expect(acr.points.map((p) => p.value)).toEqual([32, 88.4]);

    const urea = buildLabTrendSeries(rows, "Ureum", "Semua", refDate);
    expect(urea.points.map((p) => p.value)).toEqual([42, 60.1]);
  });

  it("menangani keadaan kosong dengan aman", () => {
    const empty = buildLabTrendSeries([], "eGFR", "6 Bln", refDate);
    expect(empty.points).toEqual([]);
    expect(empty.headline).toContain("Belum ada data");
  });
});

describe("getLabRowDisplay", () => {
  it("menghitung stage G/A dan status kalium kritis serta sakit akut", () => {
    const display = getLabRowDisplay(
      makeLabRow({
        egfr: 51.8,
        acr: 10,
        acr_unit: "mg/mmol", // 88.4 mg/g -> A2
        potassium: 6.1,
        is_acute_illness: true,
      }),
      true
    );
    expect(display.gStage).toBe("G3a");
    expect(display.aStage).toBe("A2");
    expect(display.stageBadge).toBe("G3a · A2");
    expect(display.potassiumCritical).toBe(true);
    expect(display.isAcuteIllness).toBe(true);
  });

  it("menampilkan stage tunggal bila hanya eGFR atau hanya ACR yang tersedia", () => {
    expect(getLabRowDisplay(makeLabRow({ acr: null, egfr: 92 })).stageBadge).toBe("G1");
    expect(getLabRowDisplay(makeLabRow({ egfr: null, acr: 350 })).stageBadge).toBe("A3");
  });
});

describe("labFormSchema", () => {
  it("menerima input lab valid dengan koma desimal string", () => {
    const res = labFormSchema.safeParse({
      measuredAt: "2026-09-18",
      creatinine: "1,42",
      creatinineUnit: "mg/dL",
      urea: "42",
      ureaUnit: "mg/dL (urea)",
      potassium: "4,7",
      acr: "38",
      acrUnit: "mg/g",
      referenceNotes: "Normal Cr 0.6-1.2",
      isAcuteIllness: false,
    });
    expect(res.success).toBe(true);
    if (res.success) {
      const parsed = parseLabFormValues(res.data);
      expect(parsed.creatinine).toBeCloseTo(1.42, 5);
      expect(parsed.potassium).toBeCloseTo(4.7, 5);
      expect(parsed.referenceNotes).toBe("Normal Cr 0.6-1.2");
    }
  });

  it("menolak bila semua nilai lab dikosongkan", () => {
    const res = labFormSchema.safeParse({
      measuredAt: "2026-09-18",
      creatinine: "",
      creatinineUnit: "mg/dL",
      urea: "",
      ureaUnit: "mg/dL (urea)",
      potassium: "",
      acr: "",
      acrUnit: "mg/g",
      referenceNotes: "",
      isAcuteIllness: false,
    });
    expect(res.success).toBe(false);
  });

  it("menolak nilai di luar rentang masuk akal", () => {
    const res = labFormSchema.safeParse({
      measuredAt: "2026-09-18",
      creatinine: "99",
      creatinineUnit: "mg/dL",
      urea: "",
      ureaUnit: "mg/dL (urea)",
      potassium: "20",
      acr: "",
      acrUnit: "mg/g",
      referenceNotes: "",
      isAcuteIllness: false,
    });
    expect(res.success).toBe(false);
  });
});
