import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PageTitle } from "@/components/PageTitle";
import { ProfileView } from "@/components/ProfileView";
import { getCurrentUserProfile } from "@/lib/auth/getCurrentUserProfile";
import { createClient } from "@/lib/supabase/server";

function ProfileLoadingFallback() {
  return (
    <div className="page profile-page">
      <PageTitle
        title="Profil & Hak Data"
        subtitle="Informasi akun, ekspor CSV, dan pengelolaan penghapusan akun."
      />
      <div className="skeleton-block skeleton-chart" />
    </div>
  );
}

async function ProfileContent() {
  const current = await getCurrentUserProfile();
  if (!current) {
    redirect("/login");
  }

  const supabase = await createClient();
  const [labsRes, bpRes, remindersRes] = await Promise.all([
    supabase
      .from("lab_results")
      .select("id", { count: "exact", head: true })
      .eq("user_id", current.userId),
    supabase
      .from("bp_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", current.userId),
    supabase
      .from("reminders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", current.userId),
  ]);

  return (
    <ProfileView
      profileData={{
        fullName: current.fullName,
        email: current.email,
        initials: current.initials,
        birthDate: current.profile?.birth_date ?? null,
        sex: current.profile?.sex ?? null,
        mode: current.mode,
        bpTargetSystolic: current.profile?.bp_target_systolic ?? null,
        bpTargetDiastolic: current.profile?.bp_target_diastolic ?? null,
      }}
      stats={{
        labCount: labsRes.count ?? 0,
        bpCount: bpRes.count ?? 0,
        reminderCount: remindersRes.count ?? 0,
      }}
    />
  );
}

export default function ProfilPage() {
  return (
    <Suspense fallback={<ProfileLoadingFallback />}>
      <ProfileContent />
    </Suspense>
  );
}
