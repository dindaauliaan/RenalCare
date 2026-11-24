import { describe, expect, it } from "vitest";
import { ClinicalInputError } from "./errors";
import { calculateEgfr, CKD_EPI_2021, roundEgfrForDisplay, type Sex } from "./egfr";

/*
 * Nilai pembanding dihitung dari rumus CKD-EPI 2021 (Inker dkk., NEJM 2021).
 * Contoh utama dari spesifikasi: laki-laki 60 th, kreatinin 1,0 mg/dL ≈ 86.
 * 8 kasus pertama (baris 1–8) telah diverifikasi langsung pada kalkulator resmi
 * National Kidney Foundation (https://www.kidney.org/professionals/gfr_calculator,
 * "CKD-EPI creatinine equation (2021)") dan nilai bulatnya cocok 100%.
 * 2 kasus terakhir (baris 9–10) dihitung langsung dari rumus yang sama.
 */
const referenceCases: Array<{
  sex: Sex;
  ageYears: number;
  creatinineMgDl: number;
  expected: number;
  expectedRounded: number;
}> = [
  { sex: "male", ageYears: 60, creatinineMgDl: 1.0, expected: 86.1626, expectedRounded: 86 },
  { sex: "female", ageYears: 50, creatinineMgDl: 0.6, expected: 109.283, expectedRounded: 109 },
  { sex: "female", ageYears: 55, creatinineMgDl: 0.7, expected: 102.0736, expectedRounded: 102 },
  { sex: "female", ageYears: 60, creatinineMgDl: 1.2, expected: 51.8213, expectedRounded: 52 },
  { sex: "male", ageYears: 55, creatinineMgDl: 1.5, expected: 54.6405, expectedRounded: 55 },
  { sex: "female", ageYears: 70, creatinineMgDl: 1.42, expected: 39.7896, expectedRounded: 40 },
  { sex: "male", ageYears: 60, creatinineMgDl: 2.5, expected: 28.694, expectedRounded: 29 },
  { sex: "female", ageYears: 65, creatinineMgDl: 4.0, expected: 11.8454, expectedRounded: 12 },
  { sex: "male", ageYears: 50, creatinineMgDl: 6.0, expected: 10.6794, expectedRounded: 11 },
  { sex: "male", ageYears: 18, creatinineMgDl: 0.9, expected: 126.961, expectedRounded: 127 },
];

describe("calculateEgfr (CKD-EPI 2021)", () => {
  it.each(referenceCases)(
    "$sex $ageYears th, kreatinin $creatinineMgDl mg/dL ≈ $expectedRounded",
    ({ sex, ageYears, creatinineMgDl, expected, expectedRounded }) => {
      const egfr = calculateEgfr({ sex, ageYears, creatinineMgDl });
      expect(egfr).toBeCloseTo(expected, 2);
      expect(roundEgfrForDisplay(egfr)).toBe(expectedRounded);
    }
  );

  it("menyimpan presisi penuh (tidak dibulatkan)", () => {
    const egfr = calculateEgfr({ sex: "male", ageYears: 60, creatinineMgDl: 1.0 });
    expect(Number.isInteger(egfr)).toBe(false);
    expect(egfr).not.toBe(86);
  });

  it("saat kreatinin = κ, kedua suku min/max bernilai 1", () => {
    const female = calculateEgfr({ sex: "female", ageYears: 40, creatinineMgDl: 0.7 });
    const male = calculateEgfr({ sex: "male", ageYears: 40, creatinineMgDl: 0.9 });
    expect(female).toBeCloseTo(142 * Math.pow(0.9938, 40) * 1.012, 10);
    expect(male).toBeCloseTo(142 * Math.pow(0.9938, 40), 10);
  });

  it("faktor perempuan 1,012 hanya berlaku untuk perempuan", () => {
    expect(CKD_EPI_2021.femaleFactor).toBe(1.012);
    expect(CKD_EPI_2021.kappa).toEqual({ female: 0.7, male: 0.9 });
    expect(CKD_EPI_2021.alpha).toEqual({ female: -0.241, male: -0.302 });
  });

  it("eGFR turun ketika kreatinin naik", () => {
    const low = calculateEgfr({ sex: "male", ageYears: 50, creatinineMgDl: 1.0 });
    const high = calculateEgfr({ sex: "male", ageYears: 50, creatinineMgDl: 2.0 });
    expect(high).toBeLessThan(low);
  });

  it("menerima usia tepat 18 tahun (batas bawah dewasa)", () => {
    expect(() => calculateEgfr({ sex: "female", ageYears: 18, creatinineMgDl: 0.8 })).not.toThrow();
  });

  describe("validasi input", () => {
    it.each([0, -0.5, Number.NaN, Number.POSITIVE_INFINITY])(
      "menolak kreatinin tidak valid: %s",
      (creatinineMgDl) => {
        expect(() => calculateEgfr({ sex: "male", ageYears: 40, creatinineMgDl })).toThrow(
          ClinicalInputError
        );
      }
    );

    it.each([17, 17.9, 0, -1])("menolak usia di bawah 18 tahun: %s", (ageYears) => {
      expect(() => calculateEgfr({ sex: "male", ageYears, creatinineMgDl: 1 })).toThrow(
        /dewasa/
      );
    });

    it("menolak usia tidak wajar (> 120)", () => {
      expect(() => calculateEgfr({ sex: "male", ageYears: 121, creatinineMgDl: 1 })).toThrow(
        ClinicalInputError
      );
    });

    it("menolak usia NaN", () => {
      expect(() =>
        calculateEgfr({ sex: "male", ageYears: Number.NaN, creatinineMgDl: 1 })
      ).toThrow(ClinicalInputError);
    });

    it("menolak jenis kelamin tidak valid", () => {
      expect(() =>
        calculateEgfr({ sex: "other" as Sex, ageYears: 40, creatinineMgDl: 1 })
      ).toThrow(/Jenis kelamin/);
    });
  });
});

describe("roundEgfrForDisplay", () => {
  it.each([
    [86.1626, 86],
    [89.5, 90],
    [89.49, 89],
    [14.5, 15],
  ])("%s → %s", (input, expected) => {
    expect(roundEgfrForDisplay(input)).toBe(expected);
  });
});
