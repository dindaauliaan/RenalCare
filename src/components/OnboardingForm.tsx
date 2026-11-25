"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { LogoutButton } from "@/components/LogoutButton";
import { onboardingSchema, type OnboardingFormValues } from "@/lib/auth/schemas";
import { createClient } from "@/lib/supabase/client";
import type { ProfileMode, ProfileSex } from "@/types/database";

export function OnboardingForm({
  userId,
  userEmail,
  initialFullName,
  initialBirthDate,
  initialSex,
  initialMode,
}: {
  userId: string;
  userEmail: string;
  initialFullName: string;
  initialBirthDate: string;
  initialSex: ProfileSex | "";
  initialMode: ProfileMode;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      fullName: initialFullName,
      birthDate: initialBirthDate,
      sex: initialSex === "female" || initialSex === "male" ? initialSex : undefined,
      mode: initialMode,
    },
  });

  const selectedSex = useWatch({ control, name: "sex" });
  const selectedMode = useWatch({ control, name: "mode" });

  const onSubmit = async (values: OnboardingFormValues) => {
    setServerError(null);
    const supabase = createClient();

    const { error } = await supabase.from("profiles").upsert(
      {
        id: userId,
        full_name: values.fullName.trim(),
        birth_date: values.birthDate,
        sex: values.sex,
        mode: values.mode,
      },
      { onConflict: "id" }
    );

    if (error) {
      setServerError(
        "Gagal menyimpan profil Anda. Pastikan koneksi stabil lalu coba lagi."
      );
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <Card className="auth-card">
      <div className="auth-head">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span className="label mb-0">LANGKAH AWAL · PROFIL PASIEN</span>
          <LogoutButton variant="inline" />
        </div>
        <h1>Lengkapi profil Anda</h1>
        <p>
          Masuk sebagai <b>{userEmail}</b>. Informasi tanggal lahir dan jenis kelamin diperlukan
          untuk menghitung perkiraan eGFR (rumus CKD-EPI 2021).
        </p>
      </div>

      {serverError && (
        <Alert variant="critical" title="Gagal menyimpan" description={serverError} />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
        <label className="field">
          Nama lengkap
          <input
            type="text"
            autoComplete="name"
            placeholder="contoh: Budi Santoso"
            {...register("fullName")}
          />
          {errors.fullName && (
            <small className="field-error">{errors.fullName.message}</small>
          )}
        </label>

        <label className="field">
          Tanggal lahir
          <input type="date" {...register("birthDate")} />
          <small className="field-hint">
            Dipakai untuk menghitung usia dewasa pada rumus eGFR.
          </small>
          {errors.birthDate && (
            <small className="field-error">{errors.birthDate.message}</small>
          )}
        </label>

        <div className="field">
          <span>Jenis kelamin (sesuai rumus eGFR)</span>
          <div className="choice-grid">
            <label className={`choice-card ${selectedSex === "female" ? "selected" : ""}`}>
              <input type="radio" value="female" {...register("sex")} />
              <b>Perempuan</b>
              <small>Koefisien CKD-EPI perempuan</small>
            </label>
            <label className={`choice-card ${selectedSex === "male" ? "selected" : ""}`}>
              <input type="radio" value="male" {...register("sex")} />
              <b>Laki-laki</b>
              <small>Koefisien CKD-EPI laki-laki</small>
            </label>
          </div>
          {errors.sex && <small className="field-error">{errors.sex.message}</small>}
        </div>

        <div className="field">
          <span>Mode pemantauan</span>
          <div className="choice-grid">
            <label className={`choice-card ${selectedMode === "ckd" ? "selected" : ""}`}>
              <input type="radio" value="ckd" {...register("mode")} />
              <b>PGK / CKD</b>
              <small>Pemantauan Penyakit Ginjal Kronik jangka panjang</small>
            </label>
            <label className={`choice-card ${selectedMode === "post_aki" ? "selected" : ""}`}>
              <input type="radio" value="post_aki" {...register("mode")} />
              <b>Pasca-AKI</b>
              <small>Pemantauan pemulihan setelah Gangguan Ginjal Akut</small>
            </label>
          </div>
          {errors.mode && <small className="field-error">{errors.mode.message}</small>}
        </div>

        <Button type="submit" disabled={isSubmitting} className="full-btn">
          {isSubmitting ? "Menyimpan profil..." : "Simpan & Lanjutkan"}
        </Button>
      </form>
    </Card>
  );
}
