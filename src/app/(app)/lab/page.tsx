import { Suspense } from "react";
import { Card } from "@/components/Card";
import { LabView } from "@/components/LabView";
import { PageTitle } from "@/components/PageTitle";
import { createClient } from "@/lib/supabase/server";

function LabLoadingFallback() {
  return (
    <div className="page">
      <div className="intro-actions">
        <PageTitle
          title="Riwayat Lab"
          subtitle="Pantau perubahan hasil laboratorium Anda dari waktu ke waktu."
        />
      </div>
      <Card>
        <div className="skeleton-block h-64" />
      </Card>
      <Card>
        <div className="skeleton-block h-40" />
      </Card>
    </div>
  );
}

async function LabPageContent({
  searchParams,
}: {
  searchParams: Promise<{ catat?: string }>;
}) {
  const [{ catat }, supabase] = await Promise.all([searchParams, createClient()]);
  const defaultOpenModal = catat === "1";

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <LabView
        initialLabs={[]}
        initialError="Sesi pengguna tidak ditemukan. Silakan masuk kembali."
      />
    );
  }

  const { data, error } = await supabase
    .from("lab_results")
    .select("*")
    .eq("user_id", user.id)
    .order("measured_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <LabView
        initialLabs={[]}
        initialError="Tidak dapat memuat riwayat lab dari server. Periksa koneksi Anda lalu coba lagi."
      />
    );
  }

  return (
    <LabView
      initialLabs={data ?? []}
      defaultOpenModal={defaultOpenModal}
    />
  );
}

export default function LabPage({
  searchParams,
}: {
  searchParams: Promise<{ catat?: string }>;
}) {
  return (
    <Suspense fallback={<LabLoadingFallback />}>
      <LabPageContent searchParams={searchParams} />
    </Suspense>
  );
}
