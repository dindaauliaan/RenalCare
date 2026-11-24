import Link from "next/link";
import { ChevronRight, Clock, FlaskConical, HeartPulse, Info } from "lucide-react";
import { Alert } from "@/components/Alert";
import { Card } from "@/components/Card";
import { DUMMY_HOME_SUMMARY, DUMMY_PROFILE } from "@/lib/dummy-data";

export default function HomePage() {
  return (
    <div className="page">
      <div className="welcome">
        <div>
          <p className="eyebrow">{DUMMY_PROFILE.greetingDate}</p>
          <h2>Selamat pagi, {DUMMY_PROFILE.firstName}</h2>
          <p>Berikut ringkasan kesehatan ginjal Anda.</p>
        </div>
        <div className="avatar">{DUMMY_PROFILE.initials}</div>
      </div>

      <Alert
        variant="warning"
        title="Ada perubahan yang perlu diperhatikan"
        description="eGFR Anda menurun sejak hasil sebelumnya. Tidak perlu panik, segera bicarakan dengan dokter."
        actionHref="/lab"
        actionLabel="Lihat perubahannya"
      />

      <div className="dashboard-grid">
        <Card className="kidney-card">
          <div className="card-heading">
            <div>
              <span className="label">STATUS GINJAL TERBARU</span>
              <p>Hasil {DUMMY_HOME_SUMMARY.latestLabDate}</p>
            </div>
            <span className="status-badge">{DUMMY_HOME_SUMMARY.stageLabel}</span>
          </div>
          <div className="egfr">
            <strong>{DUMMY_HOME_SUMMARY.egfr}</strong>
            <span>
              mL/mnt/
              <br />
              1,73 m²
            </span>
          </div>
          <div className="meter" aria-hidden="true">
            <span />
            <i />
          </div>
          <p className="explain">
            <Info size={19} strokeWidth={1.8} /> {DUMMY_HOME_SUMMARY.egfrExplain}
          </p>
          <Link href="/lab" className="text-link">
            Lihat tren dan riwayat <ChevronRight size={17} strokeWidth={1.8} />
          </Link>
        </Card>

        <Card className="quick-card">
          <span className="label">AKSI CEPAT</span>
          <h3>Catat kesehatan Anda</h3>
          <div className="quick-actions">
            <Link href="/lab">
              <span>
                <FlaskConical size={22} strokeWidth={1.8} />
              </span>
              <b>Catat Hasil Lab</b>
              <small>Sekitar 90 detik</small>
            </Link>
            <Link href="/tekanan-darah">
              <span>
                <HeartPulse size={22} strokeWidth={1.8} />
              </span>
              <b>Catat Tekanan Darah</b>
              <small>Sekitar 30 detik</small>
            </Link>
          </div>
        </Card>
      </div>

      <div className="bottom-grid">
        <Card className="appointment">
          <div className="card-heading">
            <div>
              <span className="label">AGENDA TERDEKAT</span>
              <h3>{DUMMY_HOME_SUMMARY.nextAgenda.title}</h3>
            </div>
            <div className="date-tile">
              <b>{DUMMY_HOME_SUMMARY.nextAgenda.day}</b>
              <span>{DUMMY_HOME_SUMMARY.nextAgenda.month}</span>
            </div>
          </div>
          <div className="meta-row">
            <span>
              <Clock size={18} strokeWidth={1.8} /> {DUMMY_HOME_SUMMARY.nextAgenda.time}
            </span>
            <span>{DUMMY_HOME_SUMMARY.nextAgenda.location}</span>
          </div>
          <Link href="/agenda" className="text-link">
            Lihat semua agenda <ChevronRight size={17} strokeWidth={1.8} />
          </Link>
        </Card>

        <Card className="bp-summary">
          <div className="card-heading">
            <div>
              <span className="label">TEKANAN DARAH TERAKHIR</span>
              <h3>{DUMMY_HOME_SUMMARY.latestBp.timeLabel}</h3>
            </div>
            <span className="soft-badge">{DUMMY_HOME_SUMMARY.latestBp.statusLabel}</span>
          </div>
          <div className="bp-value">
            <b>{DUMMY_HOME_SUMMARY.latestBp.systolic}</b>
            <span>/</span>
            <b>{DUMMY_HOME_SUMMARY.latestBp.diastolic}</b>
            <small>mmHg</small>
          </div>
          <Link href="/tekanan-darah" className="text-link">
            Lihat jurnal tensi <ChevronRight size={17} strokeWidth={1.8} />
          </Link>
        </Card>
      </div>
    </div>
  );
}
