import { describe, expect, it } from "vitest";
import { ClinicalInputError } from "./errors";
import {
  convertAcr,
  convertCreatinine,
  convertUrea,
  toAcrMgG,
  toCreatinineMgDl,
  UREA_UNITS,
  type AcrUnit,
  type CreatinineUnit,
  type UreaUnit,
} from "./units";

describe("convertCreatinine (÷/× 88,4)", () => {
  it("88,4 µmol/L = 1 mg/dL", () => {
    expect(convertCreatinine(88.4, "µmol/L", "mg/dL")).toBeCloseTo(1, 10);
  });

  it("1,42 mg/dL ≈ 125,5 µmol/L", () => {
    expect(convertCreatinine(1.42, "mg/dL", "µmol/L")).toBeCloseTo(125.528, 3);
  });

  it("satuan sama mengembalikan nilai yang sama", () => {
    expect(convertCreatinine(1.2, "mg/dL", "mg/dL")).toBe(1.2);
  });

  it.each([0.5, 1.0, 1.42, 6.0])("bolak-balik mg/dL → µmol/L → mg/dL: %s", (value) => {
    const umol = convertCreatinine(value, "mg/dL", "µmol/L");
    expect(convertCreatinine(umol, "µmol/L", "mg/dL")).toBeCloseTo(value, 10);
  });

  it("toCreatinineMgDl sebagai pintasan", () => {
    expect(toCreatinineMgDl(176.8, "µmol/L")).toBeCloseTo(2, 10);
  });
});

describe("convertUrea (urea mg/dL ↔ BUN mg/dL ↔ mmol/L)", () => {
  it("10 mmol/L = 60,06 mg/dL urea", () => {
    expect(convertUrea(10, "mmol/L", "mg/dL (urea)")).toBeCloseTo(60.06, 10);
  });

  it("10 mmol/L = 28,014 mg/dL BUN", () => {
    expect(convertUrea(10, "mmol/L", "mg/dL (BUN)")).toBeCloseTo(28.014, 10);
  });

  it("urea 42,8 mg/dL ≈ BUN 19,96 mg/dL (÷ ≈2,144)", () => {
    expect(convertUrea(42.8, "mg/dL (urea)", "mg/dL (BUN)")).toBeCloseTo(19.963, 3);
  });

  it("BUN 20 mg/dL ≈ urea 42,88 mg/dL (× ≈2,144)", () => {
    // 20 × 60,06 ÷ 28,014 = 42,8786
    expect(convertUrea(20, "mg/dL (BUN)", "mg/dL (urea)")).toBeCloseTo(42.879, 3);
  });

  const pairs: Array<[UreaUnit, UreaUnit]> = UREA_UNITS.flatMap((from) =>
    UREA_UNITS.filter((to) => to !== from).map((to) => [from, to] as [UreaUnit, UreaUnit])
  );

  it.each(pairs)("bolak-balik %s → %s → kembali", (from, to) => {
    const value = 37.5;
    const converted = convertUrea(value, from, to);
    expect(convertUrea(converted, to, from)).toBeCloseTo(value, 10);
  });
});

describe("convertAcr (× / ÷ 8,84)", () => {
  it("3 mg/mmol ≈ 26,52 mg/g", () => {
    expect(convertAcr(3, "mg/mmol", "mg/g")).toBeCloseTo(26.52, 10);
  });

  it("30 mg/g ≈ 3,39 mg/mmol", () => {
    expect(convertAcr(30, "mg/g", "mg/mmol")).toBeCloseTo(3.394, 3);
  });

  it.each([5, 30, 300, 1200])("bolak-balik mg/g → mg/mmol → mg/g: %s", (value) => {
    const mgMmol = convertAcr(value, "mg/g", "mg/mmol");
    expect(convertAcr(mgMmol, "mg/mmol", "mg/g")).toBeCloseTo(value, 10);
  });

  it("toAcrMgG sebagai pintasan", () => {
    expect(toAcrMgG(10, "mg/mmol")).toBeCloseTo(88.4, 10);
  });
});

describe("validasi konversi", () => {
  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY])("menolak nilai tidak valid: %s", (value) => {
    expect(() => convertCreatinine(value, "mg/dL", "µmol/L")).toThrow(ClinicalInputError);
    expect(() => convertUrea(value, "mmol/L", "mg/dL (BUN)")).toThrow(ClinicalInputError);
    expect(() => convertAcr(value, "mg/g", "mg/mmol")).toThrow(ClinicalInputError);
  });

  it("menolak satuan yang tidak dikenal", () => {
    expect(() => convertCreatinine(1, "mmol/L" as CreatinineUnit, "mg/dL")).toThrow(/Satuan/);
    expect(() => convertUrea(1, "g/L" as UreaUnit, "mmol/L")).toThrow(/Satuan/);
    expect(() => convertAcr(1, "mg/L" as AcrUnit, "mg/g")).toThrow(/Satuan/);
  });

  it("nilai 0 diperbolehkan", () => {
    expect(convertAcr(0, "mg/g", "mg/mmol")).toBe(0);
  });
});
