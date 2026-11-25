import { Suspense } from "react";
import { BloodPressureView } from "@/components/BloodPressureView";
import { Card } from "@/components/Card";
import { PageTitle } from "@/components/PageTitle";
import { createClient } from "@/lib/supabase/server";

function BpLoadingFallback() {
  return (
    <div className="page">
      <PageTitle
        title="Tekanan Darah"
        subtitle="Catat secara rutin agar dokter dapat melihat pola tekanan darah Anda."
      />
      <div className="blood-grid">
        <Card>
          <div className="skeleton-block h-64" />
        </Card>
        <Card>
          <div className="skeleton-block h-64" />
        </Card>
      </div>
    </div>
  );
}

async function TekananDarahContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <BloodPressureView
        initialLogs={[]}
        initialTarget={null}
        initialError="Sesi pengguna tidak ditemukan. Silakan masuk kembali."
      />
    );
  }

  const [logsRes, profileRes] = await Promise.all([
    supabase
      .from("bp_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("measured_at", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("bp_target_systolic, bp_target_diastolic")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  if (logsRes.error || profileRes.error) {
    return (
      <BloodPressureView
        initialLogs={[]}
        initialTarget={null}
        initialError="Tidak dapat memuat catatan tekanan darah dari server. Coba muat ulang beberapa saat lagi."
      />
    );
  }

  const profile = profileRes.data;
  const initialTarget =
    profile?.bp_target_systolic && profile?.bp_target_diastolic
      ? {
          systolic: profile.bp_target_systolic,
          diastolic: profile.bp_target_diastolic,
        }
      : null;

  return (
    <BloodPressureView
      initialLogs={logsRes.data ?? []}
      initialTarget={initialTarget}
    />
  );
}

export default function TekananDarahPage() {
  return (
    <Suspense fallback={<BpLoadingFallback />}>
      <TekananDarahContent />
    </Suspense>
  );
}
