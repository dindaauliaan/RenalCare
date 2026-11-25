"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { translateSupabaseAuthError } from "@/lib/auth/errors";
import { registerSchema, type RegisterFormValues } from "@/lib/auth/schemas";
import { createClient } from "@/lib/supabase/client";

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [needsEmailConfirm, setNeedsEmailConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      consent: false,
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setServerError(translateSupabaseAuthError(error.message));
      return;
    }

    if (data.session) {
      router.push("/onboarding");
      router.refresh();
      return;
    }

    // Jika verifikasi email aktif di pengaturan Supabase Auth
    setNeedsEmailConfirm(true);
  };

  if (needsEmailConfirm) {
    return (
      <Card className="auth-card">
        <div className="auth-success">
          <CheckCircle2 size={42} strokeWidth={1.8} />
          <span className="label">PENDAFTARAN BERHASIL</span>
          <h1>Cek email Anda</h1>
          <p>
            Kami telah mengirim tautan konfirmasi ke email Anda. Klik tautan tersebut, lalu
            kembali untuk masuk dan melengkapi profil kesehatan Anda.
          </p>
          <Button href="/login" className="full-btn">
            Lanjut ke halaman Masuk
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="auth-card">
      <div className="auth-head">
        <span className="label">BUAT AKUN BARU</span>
        <h1>Mulai pantau kesehatan ginjal Anda</h1>
        <p>Daftar dengan email Anda, lalu lengkapi profil singkat di langkah berikutnya.</p>
      </div>

      {serverError && (
        <Alert variant="critical" title="Pendaftaran gagal" description={serverError} />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
        <label className="field">
          Email
          <input
            type="email"
            autoComplete="email"
            placeholder="nama@email.com"
            {...register("email")}
          />
          {errors.email && <small className="field-error">{errors.email.message}</small>}
        </label>

        <label className="field">
          Kata sandi
          <input
            type="password"
            autoComplete="new-password"
            placeholder="Minimal 6 karakter"
            {...register("password")}
          />
          {errors.password && (
            <small className="field-error">{errors.password.message}</small>
          )}
        </label>

        <label className="field">
          Ulangi kata sandi
          <input
            type="password"
            autoComplete="new-password"
            placeholder="Ketik ulang kata sandi"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <small className="field-error">{errors.confirmPassword.message}</small>
          )}
        </label>

        <div>
          <label className="check-row">
            <input type="checkbox" {...register("consent")} />
            <span>
              <b>
                Persetujuan Penggunaan Data{" "}
                <span className="review-tag">PERLU DITINJAU</span>
              </b>
              <small>
                Saya menyetujui bahwa data kesehatan yang saya catat disimpan secara pribadi di
                RenalCare untuk membantu pemantauan mandiri. Saya memahami RenalCare hanya alat
                pencatat dan edukasi, bukan alat diagnosis medis maupun pengganti konsultasi
                dokter.
              </small>
            </span>
          </label>
          {errors.consent && (
            <small className="field-error mt-1.5 block">{errors.consent.message}</small>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting} className="full-btn">
          {isSubmitting ? "Mendaftarkan akun..." : "Daftar"}
        </Button>
      </form>

      <p className="auth-switch">
        Sudah punya akun? <Link href="/login">Masuk di sini</Link>
      </p>
    </Card>
  );
}
