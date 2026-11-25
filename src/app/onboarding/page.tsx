import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthShell } from "@/components/AuthShell";
import { Card } from "@/components/Card";
import { OnboardingForm } from "@/components/OnboardingForm";
import { isProfileOnboarded } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";

async function OnboardingContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, birth_date, sex, mode")
    .eq("id", user.id)
    .maybeSingle();

  if (isProfileOnboarded(profile)) {
    redirect("/");
  }

  return (
    <OnboardingForm
      userId={user.id}
      userEmail={user.email ?? ""}
      initialFullName={profile?.full_name ?? ""}
      initialBirthDate={profile?.birth_date ?? ""}
      initialSex={profile?.sex ?? ""}
      initialMode={profile?.mode ?? "ckd"}
    />
  );
}

export default function OnboardingPage() {
  return (
    <AuthShell wide>
      <Suspense
        fallback={
          <Card className="auth-card">
            <p className="text-sm text-slate-600">Menyiapkan formulir profil...</p>
          </Card>
        }
      >
        <OnboardingContent />
      </Suspense>
    </AuthShell>
  );
}
