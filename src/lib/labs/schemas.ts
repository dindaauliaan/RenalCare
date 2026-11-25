import { z } from "zod";
import {
  ACR_UNITS,
  convertUrea,
  CREATININE_UNITS,
  toAcrMgG,
  toCreatinineMgDl,
  UREA_UNITS,
  type AcrUnit,
  type CreatinineUnit,
  type UreaUnit,
} from "@/lib/clinical";

export function parseNumericInputString(val: string): number | null {
  const trimmed = val.trim().replace(",", ".");
  if (trimmed === "") return null;
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : Number.NaN;
}

export const labFormSchema = z
  .object({
    measuredAt: z
      .string()
      .min(1, "Tanggal pengambilan sampel wajib diisi.")
      .refine((val) => /^\d{4}-\d{2}-\d{2}$/.test(val), {
        message: "Format tanggal tidak valid.",
      })
      .refine(
        (val) => {
          const now = new Date();
          const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
          return val <= todayStr;
        },
        {
          message: "Tanggal pengambilan sampel tidak boleh di masa depan.",
        }
      ),
    creatinine: z.string(),
    creatinineUnit: z.enum(CREATININE_UNITS),
    urea: z.string(),
    ureaUnit: z.enum(UREA_UNITS),
    potassium: z.string(),
    acr: z.string(),
    acrUnit: z.enum(ACR_UNITS),
    referenceNotes: z.string().max(1000, "Catatan maksimal 1000 karakter."),
    isAcuteIllness: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const cr = parseNumericInputString(data.creatinine);
    const ur = parseNumericInputString(data.urea);
    const k = parseNumericInputString(data.potassium);
    const acr = parseNumericInputString(data.acr);

    if (cr === null && ur === null && k === null && acr === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["creatinine"],
        message:
          "Isi minimal satu hasil pemeriksaan (Kreatinin, Ureum, Kalium, atau ACR).",
      });
    }

    if (cr !== null) {
      if (Number.isNaN(cr)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["creatinine"],
          message: "Kreatinin harus berupa angka yang valid.",
        });
      } else if (cr <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["creatinine"],
          message: "Kreatinin harus lebih besar dari 0.",
        });
      } else {
        const mgDl = toCreatinineMgDl(cr, data.creatinineUnit as CreatinineUnit);
        if (mgDl < 0.1 || mgDl > 30) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["creatinine"],
            message:
              "Kreatinin di luar rentang masuk akal (0,1–30 mg/dL atau 9–2.652 µmol/L).",
          });
        }
      }
    }

    if (ur !== null) {
      if (Number.isNaN(ur)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["urea"],
          message: "Ureum harus berupa angka yang valid.",
        });
      } else if (ur <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["urea"],
          message: "Ureum harus lebih besar dari 0.",
        });
      } else {
        const ureaMgDl = convertUrea(ur, data.ureaUnit as UreaUnit, "mg/dL (urea)");
        if (ureaMgDl < 1 || ureaMgDl > 600) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["urea"],
            message:
              "Nilai ureum di luar rentang masuk akal (setara 1–600 mg/dL urea).",
          });
        }
      }
    }

    if (k !== null) {
      if (Number.isNaN(k)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["potassium"],
          message: "Kalium harus berupa angka yang valid.",
        });
      } else if (k < 1.0 || k > 12.0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["potassium"],
          message: "Kalium di luar rentang masuk akal (1,0–12,0 mmol/L).",
        });
      }
    }

    if (acr !== null) {
      if (Number.isNaN(acr)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["acr"],
          message: "ACR harus berupa angka yang valid.",
        });
      } else if (acr < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["acr"],
          message: "ACR tidak boleh negatif.",
        });
      } else {
        const mgG = toAcrMgG(acr, data.acrUnit as AcrUnit);
        if (mgG > 20000) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["acr"],
            message:
              "Nilai ACR di luar rentang masuk akal (maksimal setara 20.000 mg/g).",
          });
        }
      }
    }
  });

export type LabFormValues = z.infer<typeof labFormSchema>;

export interface ParsedLabPayload {
  measuredAt: string;
  creatinine: number | null;
  creatinineUnit: CreatinineUnit;
  urea: number | null;
  ureaUnit: UreaUnit;
  potassium: number | null;
  acr: number | null;
  acrUnit: AcrUnit;
  referenceNotes: string | null;
  isAcuteIllness: boolean;
}

export function parseLabFormValues(values: LabFormValues): ParsedLabPayload {
  const trimmedNotes = values.referenceNotes.trim();
  return {
    measuredAt: values.measuredAt,
    creatinine: parseNumericInputString(values.creatinine),
    creatinineUnit: values.creatinineUnit,
    urea: parseNumericInputString(values.urea),
    ureaUnit: values.ureaUnit,
    potassium: parseNumericInputString(values.potassium),
    acr: parseNumericInputString(values.acr),
    acrUnit: values.acrUnit,
    referenceNotes: trimmedNotes ? trimmedNotes : null,
    isAcuteIllness: values.isAcuteIllness,
  };
}
