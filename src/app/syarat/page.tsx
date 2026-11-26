import Link from "next/link";
import { Suspense } from "react";
import { Alert } from "@/components/Alert";
import { AuthShell } from "@/components/AuthShell";
import { Card } from "@/components/Card";
import { getCurrentUserProfile } from "@/lib/auth/getCurrentUserProfile";

async function TermsBackLink() {
  const current = await getCurrentUserProfile();

  if (current && current.onboarded) {
    return (
      <Link href="/profil" className="back-link">
        ← Kembali ke profil
      </Link>
    );
  }

  if (current) {
    return (
      <Link href="/onboarding" className="back-link">
        ← Kembali lengkapi profil
      </Link>
    );
  }

  return (
    <Link href="/daftar" className="back-link">
      ← Kembali ke pendaftaran
    </Link>
  );
}

export default function SyaratPage() {
  return (
    <AuthShell wide>
      <div className="legal-doc-wrap">
        <Suspense
          fallback={
            <Link href="/daftar" className="back-link">
              ← Kembali
            </Link>
          }
        >
          <TermsBackLink />
        </Suspense>

        <Card className="legal-doc-card">
          <div className="legal-doc-head">
            <span className="draft-pill">DRAF – perlu ditinjau</span>
            <h1>Syarat &amp; Ketentuan Penggunaan</h1>
            <p className="legal-doc-lead">
              Ketentuan dasar penggunaan RenalCare sebagai alat bantu pencatat
              dan edukasi kesehatan ginjal.
            </p>
          </div>

          <Alert
            variant="warning"
            title="DRAF – perlu ditinjau"
            description="Naskah ini berstatus draf awal untuk menjelaskan batasan aplikasi secara sederhana dan masih perlu ditinjau pihak berwenang sebelum dijadikan ketentuan resmi."
          />

          <section className="legal-section">
            <h2>1. Bukan alat diagnosis dan bukan pengganti dokter</h2>
            <p>
              RenalCare adalah alat bantu pemantau mandiri dan edukasi umum bagi
              pasien CKD atau pemulihan pasca-AKI. Angka perkiraan eGFR, stage
              G/A, dan penanda kewaspadaan di dalam aplikasi{" "}
              <b>bukan merupakan diagnosis medis</b> dan{" "}
              <b>tidak menggantikan pemeriksaan dokter</b>.
            </p>
            <p>
              Jangan mengubah jadwal minum obat, dosis, maupun rencana terapi
              hanya berdasarkan catatan di aplikasi tanpa berkonsultasi dengan
              dokter yang merawat Anda.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Kondisi gawat darurat</h2>
            <p>
              RenalCare tidak memantau kondisi Anda secara langsung (real-time)
              dan bukan layanan darurat medis. Bila muncul keluhan serius seperti
              sesak napas, nyeri dada, urine sangat sedikit/berhenti, bengkak
              mendadak, atau penurunan kesadaran, segera buka{" "}
              <Link href="/tanda-bahaya">halaman Tanda Bahaya</Link>, hubungi{" "}
              <b>119</b>, atau langsung ke IGD terdekat.
            </p>
          </section>

          <section className="legal-section">
            <h2>3. Keakuratan catatan dan keamanan akun</h2>
            <ul>
              <li>
                Anda bertanggung jawab memastikan tanggal, angka, dan satuan
                yang dicatat sesuai dengan lembar hasil laboratorium atau alat
                ukur yang Anda gunakan.
              </li>
              <li>
                Jaga kerahasiaan email dan kata sandi akun Anda serta tidak
                membagikannya kepada pihak lain yang tidak berwenang.
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Data yang disimpan dan hak pengguna</h2>
            <ul>
              <li>
                Aplikasi hanya menyimpan data profil, hasil lab, tekanan darah,
                dan agenda yang Anda masukkan untuk mendukung pemantauan pribadi
                Anda.
              </li>
              <li>
                Anda berhak mengunduh salinan data lab dan tekanan darah (CSV),
                memperbaiki atau menghapus catatan, serta meminta penghapusan
                akun dan seluruh data Anda melalui halaman{" "}
                <Link href="/profil">Profil</Link>.
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Pembaruan draf ketentuan</h2>
            <p>
              Karena dokumen ini masih berstatus draf pengembangan, isinya dapat
              diperbarui dan disempurnakan setelah peninjauan lanjutan.
            </p>
          </section>

          <div className="legal-footer-links">
            <Link href="/privasi" className="text-link">
              Baca Kebijakan Privasi (DRAF) →
            </Link>
          </div>
        </Card>
      </div>
    </AuthShell>
  );
}
