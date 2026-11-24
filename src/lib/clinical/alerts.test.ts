import { describe, expect, it } from "vitest";
import {
  assessEgfrChange,
  BP_CRITICAL_DIASTOLIC_MMHG,
  BP_CRITICAL_SYSTOLIC_MMHG,
  EGFR_SIGNIFICANT_DECLINE_PERCENT,
  isBloodPressureCritical,
  isPotassiumCritical,
  POTASSIUM_CRITICAL_MMOL_L,
} from "./alerts";
import { ClinicalInputError } from "./errors";

describe("konstanta ambang", () => {
  it("sesuai spesifikasi prototype", () => {
    expect(POTASSIUM_CRITICAL_MMOL_L).toBe(6);
    expect(BP_CRITICAL_SYSTOLIC_MMHG).toBe(180);
    expect(BP_CRITICAL_DIASTOLIC_MMHG).toBe(120);
    expect(EGFR_SIGNIFICANT_DECLINE_PERCENT).toBe(25);
  });
});

describe("isPotassiumCritical (≥ 6 mmol/L)", () => {
  it.each([
    [4.7, false],
    [5.99, false],
    [6.0, true],
    [6.5, true],
  ])("kalium %s → %s", (value, expected) => {
    expect(isPotassiumCritical(value)).toBe(expected);
  });

  it.each([0, -1, Number.NaN])("menolak input tidak valid: %s", (value) => {
    expect(() => isPotassiumCritical(value)).toThrow(ClinicalInputError);
  });
});

describe("isBloodPressureCritical (≥ 180 sistolik ATAU ≥ 120 diastolik)", () => {
  it.each([
    [130, 85, false],
    [179, 119, false],
    [180, 80, true],
    [150, 120, true],
    [179, 120, true],
    [200, 130, true],
  ])("%s/%s → %s", (systolic, diastolic, expected) => {
    expect(isBloodPressureCritical({ systolic, diastolic })).toBe(expected);
  });

  it("menolak nilai tidak valid", () => {
    expect(() => isBloodPressureCritical({ systolic: 0, diastolic: 80 })).toThrow(ClinicalInputError);
    expect(() => isBloodPressureCritical({ systolic: 120, diastolic: Number.NaN })).toThrow(
      ClinicalInputError
    );
  });
});

describe("assessEgfrChange", () => {
  it("contoh prototype 61 → 52: turun, stage memburuk (G2 → G3a), tetapi belum ≥ 25%", () => {
    const result = assessEgfrChange({ previous: 61, current: 52 });
    expect(result.declined).toBe(true);
    expect(result.absoluteChange).toBe(-9);
    expect(result.percentChange).toBeCloseTo(-14.754, 3);
    expect(result.previousStage).toBe("G2");
    expect(result.currentStage).toBe("G3a");
    expect(result.stageWorsened).toBe(true);
    expect(result.significantDecline).toBe(false);
  });

  it("80 → 59: stage memburuk dan turun 26,25% → penurunan signifikan", () => {
    const result = assessEgfrChange({ previous: 80, current: 59 });
    expect(result.stageWorsened).toBe(true);
    expect(result.significantDecline).toBe(true);
  });

  it("80 → 60: turun tepat 25% tetapi stage tetap G2 → tidak signifikan", () => {
    const result = assessEgfrChange({ previous: 80, current: 60 });
    expect(result.percentChange).toBeCloseTo(-25, 10);
    expect(result.stageWorsened).toBe(false);
    expect(result.significantDecline).toBe(false);
  });

  it("40 → 30: turun tepat 25%, stage tetap G3b → tidak signifikan", () => {
    expect(assessEgfrChange({ previous: 40, current: 30 }).significantDecline).toBe(false);
  });

  it("40 → 29: G3b → G4 dan turun 27,5% → signifikan", () => {
    expect(assessEgfrChange({ previous: 40, current: 29 }).significantDecline).toBe(true);
  });

  it("eGFR naik atau sama tidak dianggap turun", () => {
    expect(assessEgfrChange({ previous: 50, current: 52 }).declined).toBe(false);
    const same = assessEgfrChange({ previous: 50, current: 50 });
    expect(same.declined).toBe(false);
    expect(same.percentChange).toBe(0);
  });

  it("menolak nilai tidak valid", () => {
    expect(() => assessEgfrChange({ previous: 0, current: 50 })).toThrow(ClinicalInputError);
    expect(() => assessEgfrChange({ previous: 50, current: -1 })).toThrow(ClinicalInputError);
  });
});
