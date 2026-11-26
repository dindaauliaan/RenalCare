/**
 * Skrip audit RLS (Row Level Security) RenalCare untuk dua akun berbeda (User A & User B).
 *
 * Cara menjalankan:
 *   node --env-file=.env.local scripts/verify-rls.mjs
 *
 * Prasyarat environment:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   - SUPABASE_SERVICE_ROLE_KEY (hanya dipakai di sisi admin untuk membuat & membersihkan 2 akun uji)
 */

import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !ANON_KEY || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing required env vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY",
  );
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function createUserClient() {
  return createClient(SUPABASE_URL, ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function run() {
  const stamp = Date.now();
  const password = `RlsAudit!${stamp}`;
  const emailA = `rls-audit-a-${stamp}@example.com`;
  const emailB = `rls-audit-b-${stamp}@example.com`;

  let userAId = null;
  let userBId = null;

  try {
    // 1. Buat dua akun uji terverifikasi
    const createA = await admin.auth.admin.createUser({
      email: emailA,
      password,
      email_confirm: true,
    });
    assert.equal(createA.error, null, `Gagal membuat User A: ${createA.error?.message}`);
    userAId = createA.data.user.id;

    const createB = await admin.auth.admin.createUser({
      email: emailB,
      password,
      email_confirm: true,
    });
    assert.equal(createB.error, null, `Gagal membuat User B: ${createB.error?.message}`);
    userBId = createB.data.user.id;

    // 2. Login sebagai masing-masing akun menggunakan anon key (mengikuti RLS user nyata)
    const clientA = createUserClient();
    const loginA = await clientA.auth.signInWithPassword({ email: emailA, password });
    assert.equal(loginA.error, null, `Login User A gagal: ${loginA.error?.message}`);

    const clientB = createUserClient();
    const loginB = await clientB.auth.signInWithPassword({ email: emailB, password });
    assert.equal(loginB.error, null, `Login User B gagal: ${loginB.error?.message}`);

    // 3. Isi data awal milik User B
    const profB = await clientB
      .from("profiles")
      .update({ full_name: "Pasien B Audit", sex: "female", mode: "ckd", birth_date: "1985-05-10" })
      .eq("id", userBId)
      .select()
      .single();
    assert.equal(profB.error, null, `Update profil B gagal: ${profB.error?.message}`);

    const labB = await clientB
      .from("lab_results")
      .insert({
        user_id: userBId,
        measured_at: "2026-09-10",
        creatinine: 1.3,
        creatinine_unit: "mg/dL",
        egfr: 55,
      })
      .select()
      .single();
    assert.equal(labB.error, null, `Insert lab B gagal: ${labB.error?.message}`);

    const bpB = await clientB
      .from("bp_logs")
      .insert({
        user_id: userBId,
        measured_at: "2026-09-10T08:00:00Z",
        systolic: 130,
        diastolic: 82,
      })
      .select()
      .single();
    assert.equal(bpB.error, null, `Insert bp B gagal: ${bpB.error?.message}`);

    const remB = await clientB
      .from("reminders")
      .insert({
        user_id: userBId,
        type: "control",
        title: "Kontrol Rahasia B",
        remind_at: "2026-10-01T09:00:00Z",
      })
      .select()
      .single();
    assert.equal(remB.error, null, `Insert reminder B gagal: ${remB.error?.message}`);

    // 4. Uji isolasi dari sudut pandang User A (SELECT, INSERT spoofing, UPDATE, DELETE)
    const checks = [
      {
        table: "profiles",
        idCol: "id",
        targetId: userBId,
        spoofInsert: { id: userBId, full_name: "Palsu" },
        updatePayload: { full_name: "Dibajak A" },
      },
      {
        table: "lab_results",
        idCol: "id",
        targetId: labB.data.id,
        spoofInsert: { user_id: userBId, measured_at: "2026-09-11", creatinine: 9.9, egfr: 10 },
        updatePayload: { reference_notes: "Dibajak A" },
      },
      {
        table: "bp_logs",
        idCol: "id",
        targetId: bpB.data.id,
        spoofInsert: { user_id: userBId, measured_at: "2026-09-11T08:00:00Z", systolic: 200, diastolic: 120 },
        updatePayload: { systolic: 199 },
      },
      {
        table: "reminders",
        idCol: "id",
        targetId: remB.data.id,
        spoofInsert: { user_id: userBId, type: "lab", title: "Sisipan A", remind_at: "2026-10-02T09:00:00Z" },
        updatePayload: { title: "Dibajak A" },
      },
    ];

    for (const item of checks) {
      // SELECT milik B oleh A harus 0 baris
      const sel = await clientA.from(item.table).select("*").eq(item.idCol, item.targetId);
      assert.equal(sel.error, null);
      assert.equal(sel.data.length, 0, `[FAIL] User A bisa membaca ${item.table} milik User B`);

      // INSERT mengatasnamakan B harus ditolak RLS
      const ins = await clientA.from(item.table).insert(item.spoofInsert);
      assert.notEqual(ins.error, null, `[FAIL] User A bisa menyisipkan baris ke ${item.table} atas nama B`);

      // UPDATE milik B oleh A harus mempengaruhi 0 baris
      const upd = await clientA
        .from(item.table)
        .update(item.updatePayload)
        .eq(item.idCol, item.targetId)
        .select();
      assert.equal(upd.data?.length ?? 0, 0, `[FAIL] User A bisa mengubah ${item.table} milik B`);

      // DELETE milik B oleh A harus mempengaruhi 0 baris
      const del = await clientA
        .from(item.table)
        .delete()
        .eq(item.idCol, item.targetId)
        .select();
      assert.equal(del.data?.length ?? 0, 0, `[FAIL] User A bisa menghapus ${item.table} milik B`);

      console.log(`PASS RLS [${item.table}]: SELECT/INSERT/UPDATE/DELETE lintas akun ditolak.`);
    }

    // 5. Pastikan data User B tetap utuh di server
    const verifyLabB = await admin.from("lab_results").select("id").eq("id", labB.data.id);
    assert.equal(verifyLabB.data?.length, 1, "Data lab User B hilang!");
    console.log("SEMUA UJI RLS BERHASIL.");
  } finally {
    if (userAId) await admin.auth.admin.deleteUser(userAId);
    if (userBId) await admin.auth.admin.deleteUser(userBId);
  }
}

run().catch((err) => {
  console.error("RLS audit failed:", err);
  process.exit(1);
});
