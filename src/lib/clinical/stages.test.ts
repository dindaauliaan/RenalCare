import { describe, expect, it } from "vitest";
import { ClinicalInputError } from "./errors";
import { albuminuriaStage, gfrStage, isGfrStageWorse } from "./stages";

describe("gfrStage", () => {
  it.each([
    [120, "G1"],
    [75, "G2"],
    [52, "G3a"],
    [37, "G3b"],
    [22, "G4"],
    [8, "G5"],
  ])("satu kasus per stage: eGFR %s → %s", (egfr, expected) => {
    expect(gfrStage(egfr)).toBe(expected);
  });

  it.each([
    [90, "G1"],
    [89, "G2"],
    [60, "G2"],
    [59, "G3a"],
    [45, "G3a"],
    [44, "G3b"],
    [30, "G3b"],
    [29, "G4"],
    [15, "G4"],
    [14, "G5"],
    [0, "G5"],
  ])("batas nilai: eGFR %s → %s", (egfr, expected) => {
    expect(gfrStage(egfr)).toBe(expected);
  });

  it.each([
    [89.6, "G2"],
    [59.99, "G3a"],
    [14.99, "G5"],
  ])("nilai desimal di bawah batas tetap masuk stage bawah: %s → %s", (egfr, expected) => {
    expect(gfrStage(egfr)).toBe(expected);
  });

  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY])("menolak input tidak valid: %s", (egfr) => {
    expect(() => gfrStage(egfr)).toThrow(ClinicalInputError);
  });
});

describe("albuminuriaStage", () => {
  it.each([
    [10, "A1"],
    [150, "A2"],
    [800, "A3"],
  ])("satu kasus per stage: ACR %s mg/g → %s", (acr, expected) => {
    expect(albuminuriaStage(acr)).toBe(expected);
  });

  it.each([
    [0, "A1"],
    [29, "A1"],
    [29.99, "A1"],
    [30, "A2"],
    [300, "A2"],
    [300.01, "A3"],
    [301, "A3"],
  ])("batas nilai: ACR %s mg/g → %s", (acr, expected) => {
    expect(albuminuriaStage(acr)).toBe(expected);
  });

  it.each([-5, Number.NaN])("menolak input tidak valid: %s", (acr) => {
    expect(() => albuminuriaStage(acr)).toThrow(ClinicalInputError);
  });
});

describe("isGfrStageWorse", () => {
  it("G2 → G3a dianggap memburuk", () => {
    expect(isGfrStageWorse("G3a", "G2")).toBe(true);
  });
  it("stage sama atau membaik tidak dianggap memburuk", () => {
    expect(isGfrStageWorse("G3a", "G3a")).toBe(false);
    expect(isGfrStageWorse("G2", "G3b")).toBe(false);
  });
});
