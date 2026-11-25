"use server";

import { revalidatePath } from "next/cache";
import {
  bpFormSchema,
  bpTargetSchema,
  parseBpFormValues,
  parseBpTargetValues,
  type BpFormValues,
  type BpTargetFormValues,
} from "@/lib/bp/schemas";
import { createClient } from "@/lib/supabase/server";
import type { BpLog } from "@/types/database";

export type BpActionResult =
  | { ok: true; data: BpLog }
  | { ok: false; error: string };

export type BpDeleteResult = { ok: true } | { ok: false; error: string };

export type BpTargetResult =
  | { ok: true; target: { systolic: number; diastolic: number } }
  | { ok: false; error: string };

export async function createBpLogAction(
  rawValues: BpFormValues
): Promise<BpActionResult> {
  const parsed = bpFormSchema.safeParse(rawValues);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Data pengukuran tidak valid.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      error: "Sesi Anda telah berakhir. Silakan masuk kembali.",
    };
  }

  const payload = parseBpFormValues(parsed.data);
  const { data, error } = await supabase
    .from("bp_logs")
    .insert({
      user_id: user.id,
      systolic: payload.systolic,
      diastolic: payload.diastolic,
      pulse: payload.pulse,
      arm: payload.arm,
      position: payload.position,
      measured_at: payload.measuredAtIso,
    })
    .select("*")
    .single();

  if (error || !data) {
    return {
      ok: false,
      error: "Gagal menyimpan catatan tekanan darah. Silakan coba lagi.",
    };
  }

  revalidatePath("/tekanan-darah");
  revalidatePath("/");
  return { ok: true, data };
}

export async function updateBpLogAction(
  id: string,
  rawValues: BpFormValues
): Promise<BpActionResult> {
  if (!id) {
    return { ok: false, error: "ID catatan tidak valid." };
  }

  const parsed = bpFormSchema.safeParse(rawValues);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Data pengukuran tidak valid.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      error: "Sesi Anda telah berakhir. Silakan masuk kembali.",
    };
  }

  const payload = parseBpFormValues(parsed.data);
  const { data, error } = await supabase
    .from("bp_logs")
    .update({
      systolic: payload.systolic,
      diastolic: payload.diastolic,
      pulse: payload.pulse,
      arm: payload.arm,
      position: payload.position,
      measured_at: payload.measuredAtIso,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error || !data) {
    return {
      ok: false,
      error: "Gagal memperbarui catatan tekanan darah. Silakan coba lagi.",
    };
  }

  revalidatePath("/tekanan-darah");
  revalidatePath("/");
  return { ok: true, data };
}

export async function deleteBpLogAction(id: string): Promise<BpDeleteResult> {
  if (!id) {
    return { ok: false, error: "ID catatan tidak valid." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      error: "Sesi Anda telah berakhir. Silakan masuk kembali.",
    };
  }

  const { error } = await supabase
    .from("bp_logs")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return {
      ok: false,
      error: "Gagal menghapus catatan tekanan darah. Silakan coba lagi.",
    };
  }

  revalidatePath("/tekanan-darah");
  revalidatePath("/");
  return { ok: true };
}

export async function updateBpTargetAction(
  rawValues: BpTargetFormValues
): Promise<BpTargetResult> {
  const parsed = bpTargetSchema.safeParse(rawValues);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Target tekanan darah tidak valid.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      error: "Sesi Anda telah berakhir. Silakan masuk kembali.",
    };
  }

  const target = parseBpTargetValues(parsed.data);
  const { error } = await supabase
    .from("profiles")
    .update({
      bp_target_systolic: target.systolic,
      bp_target_diastolic: target.diastolic,
    })
    .eq("id", user.id);

  if (error) {
    return {
      ok: false,
      error: "Gagal menyimpan target tekanan darah. Silakan coba lagi.",
    };
  }

  revalidatePath("/tekanan-darah");
  return { ok: true, target };
}
