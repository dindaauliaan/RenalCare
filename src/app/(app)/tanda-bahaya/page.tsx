import Link from "next/link";
import { Suspense } from "react";
import { AlertTriangle, HeartPulse } from "lucide-react";
import { getCurrentUserProfile } from "@/lib/auth/getCurrentUserProfile";

const EMERGENCY_SYMPTOMS = [
  {
    title: "Urine sangat sedikit atau berhenti",
    desc: "Terutama bila disertai bengkak atau mual.",
  },
  {
    title: "Sesak napas atau sulit bernapas",
    desc: "Terasa mendadak atau semakin memburuk.",
  },
  {
    title: "Bengkak mendadak",
    desc: "Pada kaki, wajah, atau seluruh tubuh.",
  },
  {
    title: "Nyeri atau tekanan di dada",
    desc: "Terutama bila menjalar atau disertai keringat dingin.",
  },
  {
    title: "Kebingungan atau sulit dibangunkan",
    desc: "Perubahan kesadaran membutuhkan pertolongan segera.",
  },
] as const;

async function EmergencyBackLink() {
  const current = await getCurrentUserProfile();

  if (current && current.onboarded) {
    return (
      <Link href="/" className="back-link">
        ← Kembali ke beranda
      </Link>
    );
  }

  if (current && !current.onboarded) {
    return (
      <Link href="/onboarding" className="back-link">
        ← Kembali lengkapi profil
      </Link>
    );
  }

  return (
    <Link href="/login" className="back-link">
      ← Kembali ke halaman masuk
    </Link>
  );
}

export default function TandaBahayaPage() {
  return (
    <div className="emergency-page">
      <Suspense
        fallback={
          <Link href="/" className="back-link">
            ← Kembali
          </Link>
        }
      >
        <EmergencyBackLink />
      </Suspense>

      <div className="emergency-hero">
        <div className="big-alert">
          <AlertTriangle size={38} strokeWidth={1.8} />
        </div>
        <span>TANDA BAHAYA</span>
        <h2>Jangan tunggu jika Anda mengalami gejala berikut</h2>
        <p>
          Gejala ini dapat menandakan kondisi serius dan memerlukan pertolongan
          medis segera.
        </p>
      </div>

      <div className="symptom-list">
        {EMERGENCY_SYMPTOMS.map((symptom) => (
          <div key={symptom.title}>
            <span>
              <AlertTriangle size={21} strokeWidth={1.8} />
            </span>
            <div>
              <h3>{symptom.title}</h3>
              <p>{symptom.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <a className="emergency-cta" href="tel:119">
        <HeartPulse size={22} strokeWidth={1.8} /> Hubungi Layanan Darurat /
        Segera ke IGD
      </a>

      <p className="emergency-note">
        Jika ragu, lebih baik cari pertolongan. Jangan menyetir sendiri bila
        kondisi Anda tidak stabil.
      </p>
    </div>
  );
}
