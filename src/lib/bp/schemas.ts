import { z } from "zod";

export const BP_ARMS = ["left", "right"] as const;
export const BP_POSITIONS = ["sitting", "standing", "lying"] as const;

export type BpArmOption = (typeof BP_ARMS)[number];
export type BpPositionOption = (typeof BP_POSITIONS)[number];

export function parseIntInputString(val: string): number | null {
  const trimmed = val.trim();
  if (trimmed === "") return null;
  const num = Number(trimmed);
  return Number.isInteger(num) ? num : Number.NaN;
}

export function getCurrentDateTimeLocalWib(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "00";

  const hour = get("hour") === "24" ? "00" : get("hour");
  return `${get("year")}-${get("month")}-${get("day")}T${hour}:${get("minute")}`;
}

export const bpFormSchema = z
  .object({
    systolic: z.string().min(1, "Tekanan sistolik wajib diisi."),
    diastolic: z.string().min(1, "Tekanan diastolik wajib diisi."),
    pulse: z.string(),
    arm: z.enum(BP_ARMS),
    position: z.enum(BP_POSITIONS),
    measuredAt: z
      .string()
      .min(1, "Tanggal dan jam pengukuran wajib diisi.")
      .refine((val) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(val), {
        message: "Format tanggal dan jam tidak valid.",
      })
      .refine((val) => val <= getCurrentDateTimeLocalWib(), {
        message: "Waktu pengukuran tidak boleh di masa depan.",
      }),
  })
  .superRefine((data, ctx) => {
    const sys = parseIntInputString(data.systolic);
    const dia = parseIntInputString(data.diastolic);
    const pulse = parseIntInputString(data.pulse);

    if (sys === null || Number.isNaN(sys)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["systolic"],
        message: "Sistolik harus berupa bilangan bulat.",
      });
    } else if (sys < 50 || sys > 300) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["systolic"],
        message: "Sistolik harus antara 50–300 mmHg.",
      });
    }

    if (dia === null || Number.isNaN(dia)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["diastolic"],
        message: "Diastolik harus berupa bilangan bulat.",
      });
    } else if (dia < 30 || dia > 200) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["diastolic"],
        message: "Diastolik harus antara 30–200 mmHg.",
      });
    }

    if (
      sys !== null &&
      dia !== null &&
      !Number.isNaN(sys) &&
      !Number.isNaN(dia) &&
      dia >= sys
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["diastolic"],
        message: "Diastolik harus lebih rendah dari sistolik.",
      });
    }

    if (pulse !== null) {
      if (Number.isNaN(pulse)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["pulse"],
          message: "Denyut nadi harus berupa bilangan bulat.",
        });
      } else if (pulse < 30 || pulse > 220) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["pulse"],
          message: "Denyut nadi harus antara 30–220 kali/menit.",
        });
      }
    }
  });

export type BpFormValues = z.infer<typeof bpFormSchema>;

export interface ParsedBpPayload {
  systolic: number;
  diastolic: number;
  pulse: number | null;
  arm: BpArmOption;
  position: BpPositionOption;
  measuredAtIso: string;
}

export function wibDateTimeLocalToIso(localStr: string): string {
  // Input HTML datetime-local (YYYY-MM-DDTHH:mm) diinterpretasikan dalam WIB (+07:00)
  return new Date(`${localStr}:00+07:00`).toISOString();
}

export function isoToWibDateTimeLocal(isoStr: string): string {
  const date = new Date(isoStr);
  if (Number.isNaN(date.getTime())) return getCurrentDateTimeLocalWib();
  return getCurrentDateTimeLocalWib(date);
}

export function parseBpFormValues(values: BpFormValues): ParsedBpPayload {
  return {
    systolic: parseIntInputString(values.systolic)!,
    diastolic: parseIntInputString(values.diastolic)!,
    pulse: parseIntInputString(values.pulse),
    arm: values.arm,
    position: values.position,
    measuredAtIso: wibDateTimeLocalToIso(values.measuredAt),
  };
}

export const bpTargetSchema = z
  .object({
    targetSystolic: z.string().min(1, "Target sistolik wajib diisi."),
    targetDiastolic: z.string().min(1, "Target diastolik wajib diisi."),
  })
  .superRefine((data, ctx) => {
    const sys = parseIntInputString(data.targetSystolic);
    const dia = parseIntInputString(data.targetDiastolic);

    if (sys === null || Number.isNaN(sys) || sys < 80 || sys > 200) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["targetSystolic"],
        message: "Target sistolik harus antara 80–200 mmHg.",
      });
    }

    if (dia === null || Number.isNaN(dia) || dia < 40 || dia > 130) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["targetDiastolic"],
        message: "Target diastolik harus antara 40–130 mmHg.",
      });
    }

    if (
      sys !== null &&
      dia !== null &&
      !Number.isNaN(sys) &&
      !Number.isNaN(dia) &&
      dia >= sys
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["targetDiastolic"],
        message: "Target diastolik harus lebih rendah dari target sistolik.",
      });
    }
  });

export type BpTargetFormValues = z.infer<typeof bpTargetSchema>;

export function parseBpTargetValues(values: BpTargetFormValues): {
  systolic: number;
  diastolic: number;
} {
  return {
    systolic: parseIntInputString(values.targetSystolic)!,
    diastolic: parseIntInputString(values.targetDiastolic)!,
  };
}
