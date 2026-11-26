"use server";

import {
  validateDeleteAccountInput,
  type DeleteAccountInput,
} from "@/lib/profile/deleteAccount";
import {
  buildBpLogsCsv,
  buildLabResultsCsv,
  getExportFileNames,
} from "@/lib/profile/exportCsv";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export interface ExportHealthDataResult {
  ok: boolean;
  error?: string;
  labCsv?: string;
  bpCsv?: string;
  labCount?: number;
  bpCount?: number;
  filenames?: {
    lab: string;
    bp: string;
  };
}

export interface DeleteMyAccountResult {
  ok: boolean;
  error?: string;
}

export async function exportMyHealthDataAction(): Promise<ExportHealthDataResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      error: "Sesi login Anda telah berakhir. Silakan masuk kembali.",
    };
  }

  const [labRes, bpRes] = await Promise.all([
    supabase
      .from("lab_results")
      .select("*")
      .eq("user_id", user.id)
      .order("measured_at", { ascending: false }),
    supabase
      .from("bp_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("measured_at", { ascending: false }),
  ]);

  if (labRes.error || bpRes.error) {
    return {
      ok: false,
      error: "Gagal mengambil data lab atau tekanan darah untuk diekspor.",
    };
  }

  const labs = labRes.data ?? [];
  const bpLogs = bpRes.data ?? [];

  return {
    ok: true,
    labCsv: buildLabResultsCsv(labs),
    bpCsv: buildBpLogsCsv(bpLogs),
    labCount: labs.length,
    bpCount: bpLogs.length,
    filenames: getExportFileNames(),
  };
}

export async function deleteMyAccountAction(
  input: DeleteAccountInput,
): Promise<DeleteMyAccountResult> {
  const validation = validateDeleteAccountInput(input);
  if (!validation.valid) {
    return {
      ok: false,
      error: validation.error ?? "Konfirmasi penghapusan akun belum lengkap.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      error: "Sesi login Anda tidak ditemukan. Silakan masuk kembali.",
    };
  }

  const adminClient = createAdminClient();
  if (!adminClient) {
    return {
      ok: false,
      error:
        "Konfigurasi server (`SUPABASE_SERVICE_ROLE_KEY`) belum diatur di `.env.local`, sehingga penghapusan akun belum dapat dijalankan.",
    };
  }

  // `user.id` selalu diambil dari sesi server terverifikasi, bukan dari parameter klien.
  // Penghapusan `auth.users` otomatis menghapus profiles, lab_results, bp_logs, dan reminders via ON DELETE CASCADE.
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(
    user.id,
  );

  if (deleteError) {
    return {
      ok: false,
      error:
        "Gagal menghapus akun dari server autentikasi. Silakan coba beberapa saat lagi.",
    };
  }

  await supabase.auth.signOut({ scope: "local" });

  return { ok: true };
}
