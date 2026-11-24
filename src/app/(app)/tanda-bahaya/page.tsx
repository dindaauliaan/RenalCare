import Link from "next/link";
import { AlertTriangle, HeartPulse } from "lucide-react";
import { DUMMY_EMERGENCY_SYMPTOMS } from "@/lib/dummy-data";

export default function TandaBahayaPage() {
  return (
    <div className="emergency-page">
      <Link href="/" className="back-link">
        ← Kembali
      </Link>

      <div className="emergency-hero">
        <div className="big-alert">
          <AlertTriangle size={38} strokeWidth={1.8} />
        </div>
        <span>TANDA BAHAYA</span>
        <h2>Jangan tunggu jika Anda mengalami gejala berikut</h2>
        <p>Gejala ini dapat menandakan kondisi serius dan memerlukan pertolongan medis segera.</p>
      </div>

      <div className="symptom-list">
        {DUMMY_EMERGENCY_SYMPTOMS.map((symptom) => (
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
        <HeartPulse size={22} strokeWidth={1.8} /> Hubungi Layanan Darurat / Segera ke IGD
      </a>

      <p className="emergency-note">
        Jika ragu, lebih baik cari pertolongan. Jangan menyetir sendiri bila kondisi Anda tidak
        stabil.
      </p>
    </div>
  );
}
