import { describe, expect, it } from "vitest";
import type { BpLog, LabResult } from "@/types/database";
import {
  buildBpLogsCsv,
  buildLabResultsCsv,
  escapeCsvCell,
  getExportFileNames,
} from "./exportCsv";

describe("escapeCsvCell", () => {
  it("menangani null, undefined, koma, tanda kutip, dan baris baru", () => {
    expect(escapeCsvCell(null)).toBe("");
    expect(escapeCsvCell(undefined)).toBe("");
    expect(escapeCsvCell(52)).toBe("52");
    expect(escapeCsvCell('Nilai "normal", stabil')).toBe(
      '"Nilai ""normal"", stabil"',
    );
    expect(escapeCsvCell("Baris 1\nBaris 2")).toBe('"Baris 1\nBaris 2"');
  });

  it("melindungi nilai string yang diawali karakter formula spreadsheet", () => {
    expect(escapeCsvCell("=CMD()")).toBe("'=CMD()");
    expect(escapeCsvCell("+1+2")).toBe("'+1+2");
    expect(escapeCsvCell("-10")).toBe("'-10");
    expect(escapeCsvCell("@SUM(A1)")).toBe("'@SUM(A1)");
  });
});

describe("buildLabResultsCsv", () => {
  it("menghasilkan CSV dengan UTF-8 BOM, header standar, dan format data lab", () => {
    const sampleLabs: LabResult[] = [
      {
        id: "lab-1",
        user_id: "user-1",
        measured_at: "2026-09-18",
        creatinine: 1.42,
        creatinine_unit: "mg/dL",
        urea: 42,
        urea_unit: "mg/dL",
        potassium: 4.7,
        acr: 38,
        acr_unit: "mg/g",
        egfr: 52,
        is_acute_illness: false,
        reference_notes: "Lab RS Harapan, puasa 8 jam",
        created_at: "2026-09-18T08:00:00Z",
      },
      {
        id: "lab-2",
        user_id: "user-1",
        measured_at: "2026-08-12",
        creatinine: 110,
        creatinine_unit: "umol/L",
        urea: null,
        urea_unit: null,
        potassium: null,
        acr: null,
        acr_unit: null,
        egfr: 61,
        is_acute_illness: true,
        reference_notes: null,
        created_at: "2026-08-12T08:00:00Z",
      },
    ];

    const csv = buildLabResultsCsv(sampleLabs);
    expect(csv.startsWith("\uFEFF")).toBe(true);

    const lines = csv.slice(1).split("\r\n");
    expect(lines).toHaveLength(3);
    expect(lines[0]).toContain("tanggal_ukur,egfr_ml_menit_1_73m2,kreatinin");
    expect(lines[1]).toBe(
      '2026-09-18,52,1.42,mg/dL,42,mg/dL,4.7,38,mg/g,Tidak,"Lab RS Harapan, puasa 8 jam",2026-09-18T08:00:00Z',
    );
    expect(lines[2]).toBe(
      "2026-08-12,61,110,umol/L,,,,,,Ya,,2026-08-12T08:00:00Z",
    );
  });
});

describe("buildBpLogsCsv", () => {
  it("menghasilkan CSV tekanan darah dengan label lengan & posisi Bahasa Indonesia", () => {
    const sampleBp: BpLog[] = [
      {
        id: "bp-1",
        user_id: "user-1",
        measured_at: "2026-09-24T07:15:00+07:00",
        systolic: 132,
        diastolic: 84,
        pulse: 76,
        arm: "left",
        position: "sitting",
        created_at: "2026-09-24T00:16:00Z",
      },
      {
        id: "bp-2",
        user_id: "user-1",
        measured_at: "2026-09-23T20:00:00+07:00",
        systolic: 128,
        diastolic: 80,
        pulse: null,
        arm: "right",
        position: "lying",
        created_at: null,
      },
    ];

    const csv = buildBpLogsCsv(sampleBp);
    const lines = csv.slice(1).split("\r\n");
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe(
      "waktu_ukur,sistolik_mmhg,diastolik_mmhg,nadi_bpm,lengan,posisi,dibuat_pada",
    );
    expect(lines[1]).toBe(
      "2026-09-24T07:15:00+07:00,132,84,76,Kiri,Duduk,2026-09-24T00:16:00Z",
    );
    expect(lines[2]).toBe(
      "2026-09-23T20:00:00+07:00,128,80,,Kanan,Berbaring,",
    );
  });
});

describe("getExportFileNames", () => {
  it("menghasilkan nama file bertanggal YYYY-MM-DD sesuai WIB", () => {
    const filenames = getExportFileNames(new Date("2026-09-24T18:00:00Z"));
    expect(filenames).toEqual({
      lab: "renalcare-riwayat-lab-2026-09-25.csv",
      bp: "renalcare-tekanan-darah-2026-09-25.csv",
    });
  });
});
