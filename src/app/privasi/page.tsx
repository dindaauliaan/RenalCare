import Link from "next/link";
import { Suspense } from "react";
import { Alert } from "@/components/Alert";
import { AuthShell } from "@/components/AuthShell";
import { Card } from "@/components/Card";
import { getCurrentUserProfile } from "@/lib/auth/getCurrentUserProfile";

async function LegalBackLink() {
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

export default function PrivasiPage() {
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
          <LegalBackLink />
        </Suspense>

        <Card className="legal-doc-card">
          <div className="legal-doc-head">
            <span className="draft-pill">DRAF – perlu ditinjau</span>
            <h1>Kebijakan Privasi RenalCare</h1>
            <p className="legal-doc-lead">
              Ringkasan sederhana mengenai data yang Anda catat di RenalCare,
              tujuan penggunaannya, dan hak Anda atas data tersebut.
            </p>
          </div>

          <Alert
            variant="warning"
            title="DRAF – perlu ditinjau"
            description="Dokumen ini adalah draf awal untuk menjelaskan alur data secara jujur kepada pengguna dan masih perlu ditinjau sebelum dipakai sebagai dokumen hukum resmi."
          />

          <section className="legal-section">
            <h2>1. Data apa yang kami simpan</h2>
            <p>
              Ketika Anda membuat akun dan menggunakan RenalCare, sistem hanya
              menyimpan data yang Anda masukkan sendiri:
            </p>
            <ul>
              <li>
                <b>Data akun:</b> alamat email untuk masuk dan menjaga sesi
                login.
              </li>
              <li>
                <b>Data profil kesehatan:</b> nama panggilan/lengkap, tanggal
                lahir dan jenis kelamin (dipakai rumus eGFR CKD-EPI 2021), mode
                pemantauan (CKD atau pasca-AKI), serta target tekanan darah dari
                dokter bila Anda isi.
              </li>
              <li>
                <b>Catatan hasil laboratorium:</b> tanggal pemeriksaan,
                kreatinin, ureum, kalium, ACR, satuan asli yang Anda pilih,
                perkiraan eGFR, catatan rentang rujukan, dan tanda kondisi sakit
                akut.
              </li>
              <li>
                <b>Catatan tekanan darah:</b> sistolik, diastolik, denyut nadi
                (opsional), lengan, posisi pengukuran, dan waktu pencatatan.
              </li>
              <li>
                <b>Agenda &amp; pengingat:</b> judul, jenis pengingat (kontrol,
                lab, obat), waktu pengingat, lokasi, catatan, dan status selesai.
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>2. Untuk apa data tersebut digunakan</h2>
            <ul>
              <li>
                Menampilkan riwayat, grafik tren, perkiraan eGFR, kategori G/A,
                rata-rata tekanan darah, serta pengingat jadwal di akun Anda
                sendiri.
              </li>
              <li>
                Memunculkan pengingat kewaspadaan umum (misalnya perubahan eGFR,
                kalium tinggi, atau tekanan darah tinggi) agar Anda lebih mudah
                menyiapkan bahan diskusi saat kontrol ke dokter.
              </li>
              <li>
                Kami <b>tidak</b> menjual data pribadi/kesehatan Anda, tidak
                menampilkan iklan berbasis data kesehatan, dan tidak memakai
                data Anda untuk diagnosis medis otomatis.
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. Penyimpanan dan batasan akses</h2>
            <p>
              Data Anda disimpan pada layanan basis data dan autentikasi
              terkelola (Supabase) dengan pembatasan akses per pengguna (Row
              Level Security), sehingga catatan lab, tekanan darah, profil, dan
              agenda Anda hanya dapat dibaca dan diubah oleh akun Anda sendiri.
            </p>
          </section>

          <section className="legal-section">
            <h2>4. Hak Anda atas data</h2>
            <ul>
              <li>
                <b>Mengubah dan menghapus catatan:</b> Anda dapat mengubah atau
                menghapus masing-masing catatan lab, tekanan darah, dan agenda
                kapan saja melalui menu terkait.
              </li>
              <li>
                <b>Mengunduh salinan data (ekspor CSV):</b> Anda dapat mengunduh
                seluruh riwayat laboratorium dan tekanan darah Anda dalam format
                CSV dari halaman <Link href="/profil">Profil</Link>.
              </li>
              <li>
                <b>Menghapus akun dan seluruh data:</b> Anda berhak meminta
                penghapusan akun beserta seluruh data terkait melalui fitur
                konfirmasi penghapusan di halaman Profil.
              </li>
            </ul>
          </section>

          <div className="legal-footer-links">
            <Link href="/syarat" className="text-link">
              Baca Syarat &amp; Ketentuan (DRAF) →
            </Link>
          </div>
        </Card>
      </div>
    </AuthShell>
  );
}
