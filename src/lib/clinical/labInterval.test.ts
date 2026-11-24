import { describe, expect, it } from "vitest";
import { calculateEgfr, roundEgfrForDisplay } from "./egfr";
import { ClinicalInputError } from "./errors";
import { suggestLabInterval } from "./labInterval";
import { albuminuriaStage, gfrStage, GFR_STAGE_ORDER, type AlbuminuriaStage, type GfrStage } from "./stages";

describe("suggestLabInterval (tabel KDIGO 2012)", () => {
  it("G3a A2 → 2x setahun (± tiap 6 bulan)", () => {
    expect(suggestLabInterval("G3a", "A2")).toEqual({
      timesPerYear: 2,
      isMinimum: false,
      onlyIfCkdConfirmed: false,
      approxMonthsBetween: 6,
    });
  });

  it("G1 A1 → 1x setahun hanya jika PGK sudah ditegakkan", () => {
    const result = suggestLabInterval("G1", "A1");
    expect(result.timesPerYear).toBe(1);
    expect(result.onlyIfCkdConfirmed).toBe(true);
  });

  it("G4 A3 → minimal 4x setahun", () => {
    const result = suggestLabInterval("G4", "A3");
    expect(result.timesPerYear).toBe(4);
    expect(result.isMinimum).toBe(true);
    expect(result.approxMonthsBetween).toBe(3);
  });

  it.each(["A1", "A2", "A3"] as AlbuminuriaStage[])("G5 %s → minimal 4x setahun", (a) => {
    expect(suggestLabInterval("G5", a)).toMatchObject({ timesPerYear: 4, isMinimum: true });
  });

  it("semua 18 kombinasi punya saran dan frekuensi tidak berkurang saat stage G memburuk", () => {
    for (const a of ["A1", "A2", "A3"] as AlbuminuriaStage[]) {
      let previous = 0;
      for (const g of GFR_STAGE_ORDER) {
        const { timesPerYear } = suggestLabInterval(g, a);
        expect(timesPerYear).toBeGreaterThanOrEqual(previous);
        previous = timesPerYear;
      }
    }
  });

  it("menolak stage yang tidak dikenal", () => {
    expect(() => suggestLabInterval("G6" as GfrStage, "A1")).toThrow(ClinicalInputError);
    expect(() => suggestLabInterval("G1", "A4" as AlbuminuriaStage)).toThrow(ClinicalInputError);
  });
});

describe("alur lengkap: kreatinin + ACR → stage → saran interval", () => {
  it("perempuan 60 th, kreatinin 1,2 mg/dL, ACR 38 mg/g → eGFR 52, G3a A2, 2x setahun", () => {
    const egfr = roundEgfrForDisplay(calculateEgfr({ sex: "female", ageYears: 60, creatinineMgDl: 1.2 }));
    const g = gfrStage(egfr);
    const a = albuminuriaStage(38);
    expect(egfr).toBe(52);
    expect(`${g} ${a}`).toBe("G3a A2");
    expect(suggestLabInterval(g, a).timesPerYear).toBe(2);
  });
});
