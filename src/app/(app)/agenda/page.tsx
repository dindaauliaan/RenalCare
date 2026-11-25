import { Suspense } from "react";
import { AgendaView } from "@/components/AgendaView";
import { Card } from "@/components/Card";
import { PageTitle } from "@/components/PageTitle";
import { buildLabIntervalRecommendation } from "@/lib/agenda/processing";
import { createClient } from "@/lib/supabase/server";

function AgendaLoadingFallback() {
  return (
    <div className="page">
      <PageTitle
        title="Agenda & Pengingat"
        subtitle="Jadwal kontrol, pemeriksaan lab, dan pengingat obat Anda."
      />
      <Card>
        <div className="skeleton-block h-24" />
      </Card>
      <Card>
        <div className="skeleton-block h-48" />
      </Card>
    </div>
  );
}

async function AgendaContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <AgendaView
        initialReminders={[]}
        recommendation={buildLabIntervalRecommendation([])}
        initialError="Sesi pengguna tidak ditemukan. Silakan masuk kembali."
      />
    );
  }

  const [remindersRes, labsRes] = await Promise.all([
    supabase
      .from("reminders")
      .select("*")
      .eq("user_id", user.id)
      .order("remind_at", { ascending: true }),
    supabase
      .from("lab_results")
      .select("*")
      .eq("user_id", user.id)
      .order("measured_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  if (remindersRes.error || labsRes.error) {
    return (
      <AgendaView
        initialReminders={[]}
        recommendation={buildLabIntervalRecommendation([])}
        initialError="Tidak dapat memuat agenda dari server. Coba muat ulang beberapa saat lagi."
      />
    );
  }

  const recommendation = buildLabIntervalRecommendation(labsRes.data ?? []);

  return (
    <AgendaView
      initialReminders={remindersRes.data ?? []}
      recommendation={recommendation}
    />
  );
}

export default function AgendaPage() {
  return (
    <Suspense fallback={<AgendaLoadingFallback />}>
      <AgendaContent />
    </Suspense>
  );
}
