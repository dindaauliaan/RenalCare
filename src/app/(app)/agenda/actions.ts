"use server";

import { revalidatePath } from "next/cache";
import {
  parseReminderFormValues,
  reminderFormSchema,
  type ReminderFormValues,
} from "@/lib/agenda/schemas";
import { createClient } from "@/lib/supabase/server";
import type { Reminder } from "@/types/database";

export type ReminderActionResult =
  | { ok: true; data: Reminder }
  | { ok: false; error: string };

export type ReminderDeleteResult = { ok: true } | { ok: false; error: string };

export async function createReminderAction(
  rawValues: ReminderFormValues
): Promise<ReminderActionResult> {
  const parsed = reminderFormSchema.safeParse(rawValues);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Data pengingat tidak valid.",
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

  const payload = parseReminderFormValues(parsed.data);
  const { data, error } = await supabase
    .from("reminders")
    .insert({
      user_id: user.id,
      type: payload.type,
      title: payload.title,
      remind_at: payload.remindAtIso,
      location: payload.location,
      notes: payload.notes,
      is_done: false,
    })
    .select("*")
    .single();

  if (error || !data) {
    return {
      ok: false,
      error: "Gagal menyimpan pengingat. Silakan coba lagi.",
    };
  }

  revalidatePath("/agenda");
  revalidatePath("/");
  return { ok: true, data };
}

export async function updateReminderAction(
  id: string,
  rawValues: ReminderFormValues
): Promise<ReminderActionResult> {
  if (!id) {
    return { ok: false, error: "ID pengingat tidak valid." };
  }

  const parsed = reminderFormSchema.safeParse(rawValues);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Data pengingat tidak valid.",
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

  const payload = parseReminderFormValues(parsed.data);
  const { data, error } = await supabase
    .from("reminders")
    .update({
      type: payload.type,
      title: payload.title,
      remind_at: payload.remindAtIso,
      location: payload.location,
      notes: payload.notes,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error || !data) {
    return {
      ok: false,
      error: "Gagal memperbarui pengingat. Silakan coba lagi.",
    };
  }

  revalidatePath("/agenda");
  revalidatePath("/");
  return { ok: true, data };
}

export async function toggleReminderDoneAction(
  id: string,
  isDone: boolean
): Promise<ReminderActionResult> {
  if (!id) {
    return { ok: false, error: "ID pengingat tidak valid." };
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

  const { data, error } = await supabase
    .from("reminders")
    .update({ is_done: isDone })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error || !data) {
    return {
      ok: false,
      error: "Gagal memperbarui status pengingat. Silakan coba lagi.",
    };
  }

  revalidatePath("/agenda");
  revalidatePath("/");
  return { ok: true, data };
}

export async function deleteReminderAction(id: string): Promise<ReminderDeleteResult> {
  if (!id) {
    return { ok: false, error: "ID pengingat tidak valid." };
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
    .from("reminders")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return {
      ok: false,
      error: "Gagal menghapus pengingat. Silakan coba lagi.",
    };
  }

  revalidatePath("/agenda");
  revalidatePath("/");
  return { ok: true };
}
