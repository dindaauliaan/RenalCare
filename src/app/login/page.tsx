import { Suspense } from "react";
import { AuthShell } from "@/components/AuthShell";
import { Card } from "@/components/Card";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <AuthShell>
      <Suspense
        fallback={
          <Card className="auth-card">
            <p className="text-sm text-slate-600">Memuat formulir masuk...</p>
          </Card>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
