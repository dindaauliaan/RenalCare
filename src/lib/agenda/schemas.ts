import { z } from "zod";
import {
  getCurrentDateTimeLocalWib,
  isoToWibDateTimeLocal,
  wibDateTimeLocalToIso,
} from "@/lib/bp/schemas";

export const REMINDER_TYPES = ["control", "lab", "medication"] as const;
export type ReminderTypeOption = (typeof REMINDER_TYPES)[number];

export { getCurrentDateTimeLocalWib, isoToWibDateTimeLocal, wibDateTimeLocalToIso };

export function getTomorrowMorningWib(now = new Date()): string {
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const datePart = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(tomorrow);
  return `${datePart}T09:00`;
}

export const reminderFormSchema = z.object({
  type: z.enum(REMINDER_TYPES, {
    message: "Pilih jenis pengingat terlebih dahulu.",
  }),
  title: z
    .string()
    .trim()
    .min(2, "Judul pengingat minimal 2 karakter.")
    .max(120, "Judul pengingat maksimal 120 karakter."),
  remindAt: z
    .string()
    .min(1, "Tanggal dan jam pengingat wajib diisi.")
    .refine((val) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(val), {
      message: "Format tanggal dan jam tidak valid.",
    }),
  location: z.string().max(120, "Lokasi maksimal 120 karakter."),
  notes: z.string().max(500, "Catatan maksimal 500 karakter."),
});

export type ReminderFormValues = z.infer<typeof reminderFormSchema>;

export interface ParsedReminderPayload {
  type: ReminderTypeOption;
  title: string;
  remindAtIso: string;
  location: string | null;
  notes: string | null;
}

export function parseReminderFormValues(values: ReminderFormValues): ParsedReminderPayload {
  const location = values.location.trim();
  const notes = values.notes.trim();
  return {
    type: values.type,
    title: values.title.trim(),
    remindAtIso: wibDateTimeLocalToIso(values.remindAt),
    location: location ? location : null,
    notes: notes ? notes : null,
  };
}
