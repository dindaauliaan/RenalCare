import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export function isValidServiceRoleKey(value: string | undefined): value is string {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("YOUR_")) return false;
  return true;
}

/**
 * Membuat Supabase Admin Client khusus di sisi server menggunakan `SUPABASE_SERVICE_ROLE_KEY`.
 * Mengembalikan `null` bila env belum diatur agar Server Action dapat memberi pesan ramah
 * alih-alih melempar error server 500.
 */
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("createAdminClient hanya boleh dipanggil di sisi server.");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !isValidServiceRoleKey(serviceRoleKey)) {
    return null;
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
