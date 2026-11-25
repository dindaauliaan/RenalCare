"use server";

import { revalidatePath } from "next/cache";
import { ClinicalInputError } from "@/lib/clinical";
import { computeEgfrForLabEntry } from "@/lib/labs/processing";
import {
  labFormSchema,
  parseLabFormValues,
  type LabFormValues,
} from "@/lib/labs/schemas";
import { createClient } from "@/lib/supabase/server";
import type { LabResult } from "@/types/database";

export type LabActionResult =
  | { ok: true; data: LabResult }
  | { ok: false; error: string };

export type DeleteLabActionResult =
  | { ok: true }
  | { ok: false; error: string };

async function prepareValidatedRow(rawValues: LabFormValues) {
  const parsed = labFormSchema.safeParse(rawValues);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return {
      ok: false as const,
      error: firstIssue?.message ?? "Data hasil lab tidak valid.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false as const,
      error: "Sesi Anda telah berakhir. Silakan masuk kembali.",
    };
  }

  const payload = parseLabFormValues(parsed.data);

  let computedEgfr: number | null = null;
  if (payload.creatinine !== null) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("birth_date, sex")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      return {
        ok: false as const,
        error: "Gagal membaca data profil untuk menghitung eGFR.",
      };
    }

    if (!profile?.birth_date || (profile.sex !== "female" && profile.sex !== "male")) {
      return {
        ok: false as const,
        error:
          "Tanggal lahir dan jenis kelamin pada profil belum lengkap untuk menghitung eGFR.",
      };
    }

    try {
      computedEgfr = computeEgfrForLabEntry({
        creatinine: payload.creatinine,
        creatinineUnit: payload.creatinineUnit,
        measuredAt: payload.measuredAt,
        birthDate: profile.birth_date,
        sex: profile.sex,
      });
    } catch (err) {
      if (err instanceof ClinicalInputError) {
        return { ok: false as const, error: err.message };
      }
      return {
        ok: false as const,
        error: "Terjadi kesalahan saat menghitung eGFR.",
      };
    }
  }

  return {
    ok: true as const,
    supabase,
    userId: user.id,
    payload,
    computedEgfr,
  };
}

export async function createLabResultAction(
  rawValues: LabFormValues
): Promise<LabActionResult> {
  const prepared = await prepareValidatedRow(rawValues);
  if (!prepared.ok) return prepared;

  const { supabase, userId, payload, computedEgfr } = prepared;
  const { data, error } = await supabase
    .from("lab_results")
    .insert({
      user_id: userId,
      measured_at: payload.measuredAt,
      creatinine: payload.creatinine,
      creatinine_unit: payload.creatinineUnit,
      urea: payload.urea,
      urea_unit: payload.ureaUnit,
      potassium: payload.potassium,
      acr: payload.acr,
      acr_unit: payload.acrUnit,
      egfr: computedEgfr,
      is_acute_illness: payload.isAcuteIllness,
      reference_notes: payload.referenceNotes,
    })
    .select("*")
    .single();

  if (error || !data) {
    return {
      ok: false,
      error: "Gagal menyimpan hasil lab ke database. Silakan coba lagi.",
    };
  }

  revalidatePath("/lab");
  revalidatePath("/");
  return { ok: true, data };
}

export async function updateLabResultAction(
  id: string,
  rawValues: LabFormValues
): Promise<LabActionResult> {
  if (!id) {
    return { ok: false, error: "ID hasil lab tidak valid." };
  }

  const prepared = await prepareValidatedRow(rawValues);
  if (!prepared.ok) return prepared;

  const { supabase, userId, payload, computedEgfr } = prepared;
  const { data, error } = await supabase
    .from("lab_results")
    .update({
      measured_at: payload.measuredAt,
      creatinine: payload.creatinine,
      creatinine_unit: payload.creatinineUnit,
      urea: payload.urea,
      urea_unit: payload.ureaUnit,
      potassium: payload.potassium,
      acr: payload.acr,
      acr_unit: payload.acrUnit,
      egfr: computedEgfr,
      is_acute_illness: payload.isAcuteIllness,
      reference_notes: payload.referenceNotes,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error || !data) {
    return {
      ok: false,
      error: "Gagal memperbarui hasil lab. Silakan coba lagi.",
    };
  }

  revalidatePath("/lab");
  revalidatePath("/");
  return { ok: true, data };
}

export async function deleteLabResultAction(
  id: string
): Promise<DeleteLabActionResult> {
  if (!id) {
    return { ok: false, error: "ID hasil lab tidak valid." };
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
    .from("lab_results")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return {
      ok: false,
      error: "Gagal menghapus hasil lab. Silakan coba lagi.",
    };
  }

  revalidatePath("/lab");
  revalidatePath("/");
  return { ok: true };
}
