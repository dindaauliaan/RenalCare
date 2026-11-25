import { AuthShell } from "@/components/AuthShell";
import { RegisterForm } from "@/components/RegisterForm";

export default function DaftarPage() {
  return (
    <AuthShell>
      <RegisterForm />
    </AuthShell>
  );
}
