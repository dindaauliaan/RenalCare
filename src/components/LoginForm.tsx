"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { translateSupabaseAuthError } from "@/lib/auth/errors";
import { loginSchema, type LoginFormValues } from "@/lib/auth/schemas";
import { createClient } from "@/lib/supabase/client";

function sanitizeNextPath(rawNext: string | null): string {
  if (!rawNext || !rawNext.startsWith("/") || rawNext.startsWith("//")) {
    return "/";
  }
  return rawNext;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setServerError(translateSupabaseAuthError(error.message));
      return;
    }

    const nextPath = sanitizeNextPath(searchParams.get("next"));
    router.push(nextPath);
    router.refresh();
  };

  const accountDeleted = searchParams.get("deleted") === "1";

  return (
    <Card className="auth-card">
      <div className="auth-head">
        <span className="label">MASUK AKUN</span>
        <h1>Selamat datang kembali</h1>
        <p>Masuk untuk melihat riwayat lab, tekanan darah, dan agenda kontrol Anda.</p>
      </div>

      {accountDeleted && (
        <Alert
          variant="warning"
          title="Akun telah dihapus"
          description="Akun dan seluruh data kesehatan Anda telah dihapus permanen dari RenalCare."
        />
      )}

      {serverError && (
        <Alert variant="critical" title="Gagal masuk" description={serverError} />
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
            autoComplete="current-password"
            placeholder="Masukkan kata sandi"
            {...register("password")}
          />
          {errors.password && (
            <small className="field-error">{errors.password.message}</small>
          )}
        </label>

        <Button type="submit" disabled={isSubmitting} className="full-btn">
          {isSubmitting ? "Memproses..." : "Masuk"}
        </Button>
      </form>

      <p className="auth-switch">
        Belum punya akun? <Link href="/daftar">Daftar sekarang</Link>
      </p>
    </Card>
  );
}
