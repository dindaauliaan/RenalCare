import Link from "next/link";
import { Suspense } from "react";
import {
  Calendar,
  ChevronRight,
  Clock,
  FlaskConical,
  HeartPulse,
  Info,
  Sparkles,
} from "lucide-react";
import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { getCurrentUserProfile } from "@/lib/auth/getCurrentUserProfile";
import { formatIndonesianDateHeader } from "@/lib/auth/profile";
import {
  buildHomeAgendaSummary,
  buildHomeBpSummary,
  buildHomeKidneySummary,
  getIndonesianTimeGreeting,
} from "@/lib/home/summary";
import { createClient } from "@/lib/supabase/server";

function HomeLoadingFallback() {
  return (
    <div className="page">
      <div className="welcome">
        <div>
          <p className="eyebrow">RenalCare</p>
          <h2>Memuat ringkasan...</h2>
          <p>Menyiapkan data kesehatan ginjal Anda.</p>
        </div>
        <div className="avatar">..</div>
      </div>
      <div className="dashboard-grid">
        <Card>
          <div className="skeleton-block h-48" />
        </Card>
        <Card>
          <div className="skeleton-block h-48" />
        </Card>
      </div>
    </div>
  );
}

async function HomeDashboardContent() {
  const current = await getCurrentUserProfile();
  const firstName = current?.firstName ?? "Pengguna";
  const initials = current?.initials ?? "RC";
  const now = new Date();
  const todayLabel = formatIndonesianDateHeader(now);
  const greeting = getIndonesianTimeGreeting(now);

  let labsError = false;
  const supabase = await createClient();

  const [labsRes, bpRes, remindersRes] = current
    ? await Promise.all([
        supabase
          .from("lab_results")
          .select("*")
          .eq("user_id", current.userId)
          .order("measured_at", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(12),
        supabase
          .from("bp_logs")
          .select("*")
          .eq("user_id", current.userId)
          .order("measured_at", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(1),
        supabase
          .from("reminders")
          .select("*")
          .eq("user_id", current.userId)
          .eq("is_done", false)
          .gte("remind_at", now.toISOString())
          .order("remind_at", { ascending: true })
          .limit(1),
      ])
    : [
        { data: [], error: null },
        { data: [], error: null },
        { data: [], error: null },
      ];

  if (labsRes.error || bpRes.error || remindersRes.error) {
    labsError = true;
  }

  const labs = labsRes.data ?? [];
  const bpLogs = bpRes.data ?? [];
  const reminders = remindersRes.data ?? [];

  const kidney = buildHomeKidneySummary(labs);
  const bp = buildHomeBpSummary(bpLogs, now);
  const agenda = buildHomeAgendaSummary(reminders);

  const isBrandNewUser =
    !labsError && labs.length === 0 && bpLogs.length === 0 && reminders.length === 0;

  return (
    <div className="page">
      <div className="welcome">
        <div>
          <p className="eyebrow">{todayLabel}</p>
          <h2>
            {greeting}, {firstName}
          </h2>
          <p>Berikut ringkasan kesehatan ginjal Anda.</p>
        </div>
        <div className="avatar" aria-label={`Inisial ${initials}`}>
          {initials}
        </div>
      </div>

      {labsError && (
        <Alert
          variant="critical"
          title="Sebagian data gagal dimuat"
          description="Tidak dapat mengambil semua data ringkasan dari server. Coba muat ulang halaman beberapa saat lagi."
        />
      )}

      {isBrandNewUser && (
        <Card className="home-onboarding-guide">
          <div className="guide-head">
            <div className="recommend-icon">
              <Sparkles size={21} strokeWidth={1.8} />
            </div>
            <div>
              <span className="label">LANGKAH PERTAMA</span>
              <h3>Selamat datang di RenalCare, {firstName}</h3>
              <p>
                Akun dan profil Anda sudah siap. Mulai catatan pertama agar grafik tren dan
                ringkasan ginjal Anda langsung terisi:
              </p>
            </div>
          </div>
          <div className="first-steps-grid">
            <Link href="/lab" className="first-step-item">
              <span className="step-num">1</span>
              <div>
                <b>Catat hasil lab pertama</b>
                <small>Masukkan kreatinin atau ACR untuk menghitung eGFR &amp; stage G/A.</small>
              </div>
              <ChevronRight size={17} strokeWidth={1.8} />
            </Link>
            <Link href="/tekanan-darah" className="first-step-item">
              <span className="step-num">2</span>
              <div>
                <b>Catat tekanan darah</b>
                <small>Pantau tensi harian karena berkaitan erat dengan kesehatan ginjal.</small>
              </div>
              <ChevronRight size={17} strokeWidth={1.8} />
            </Link>
            <Link href="/agenda" className="first-step-item">
              <span className="step-num">3</span>
              <div>
                <b>Buat pengingat kontrol</b>
                <small>Simpan jadwal kunjungan dokter atau cek lab berikutnya.</small>
              </div>
              <ChevronRight size={17} strokeWidth={1.8} />
            </Link>
          </div>
        </Card>
      )}

      {kidney.declineAlert && (
        <Alert
          variant="warning"
          title="Ada perubahan yang perlu diperhatikan"
          description={`eGFR Anda menurun dari ${kidney.declineAlert.previousEgfr} menjadi ${kidney.declineAlert.currentEgfr} sejak hasil sebelumnya (${kidney.declineAlert.previousDateLabel}). Tidak perlu panik, segera bicarakan dengan dokter.`}
          actionHref="/lab"
          actionLabel="Lihat perubahannya"
        />
      )}

      <div className="dashboard-grid">
        <Card className="kidney-card">
          <div className="card-heading">
            <div>
              <span className="label">STATUS GINJAL TERBARU</span>
              <p>
                {kidney.measuredDateLabel
                  ? `Hasil ${kidney.measuredDateLabel}`
                  : "Belum ada hasil lab"}
              </p>
            </div>
            {kidney.stageLabel && (
              <span className="status-badge">{kidney.stageLabel}</span>
            )}
          </div>

          {kidney.hasEgfr && kidney.egfrRounded !== null ? (
            <>
              <div className="egfr">
                <strong>{kidney.egfrRounded}</strong>
                <span>
                  mL/mnt/
                  <br />
                  1,73 m²
                </span>
              </div>
              <div
                className="meter"
                role="img"
                aria-label={`Posisi eGFR ${kidney.egfrRounded} pada skala fungsi ginjal`}
              >
                <span />
                <i style={{ left: `${kidney.meterLeftPercent}%` }} />
              </div>
              <p className="explain">
                <Info size={19} strokeWidth={1.8} />{" "}
                <span>
                  {kidney.explanation}
                  {kidney.isAcuteIllness &&
                    " (Catatan: hasil diambil saat sakit akut sehingga eGFR mungkin kurang stabil.)"}
                </span>
              </p>
              <Link href="/lab" className="text-link">
                Lihat tren dan riwayat <ChevronRight size={17} strokeWidth={1.8} />
              </Link>
            </>
          ) : (
            <div className="home-empty-card">
              <p className="explain">
                <Info size={19} strokeWidth={1.8} /> {kidney.explanation}
              </p>
              <Button href="/lab" variant="outline">
                Catat hasil lab sekarang
              </Button>
            </div>
          )}
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
          {agenda.hasData ? (
            <>
              <div className="card-heading">
                <div>
                  <span className="label">AGENDA TERDEKAT</span>
                  <h3>{agenda.title}</h3>
                </div>
                <div className="date-tile">
                  <b>{agenda.day}</b>
                  <span>{agenda.month}</span>
                </div>
              </div>
              <div className="meta-row">
                {agenda.timeLabel && (
                  <span>
                    <Clock size={18} strokeWidth={1.8} /> {agenda.timeLabel}
                  </span>
                )}
                {agenda.location && <span>{agenda.location}</span>}
              </div>
              <Link href="/agenda" className="text-link">
                Lihat semua agenda <ChevronRight size={17} strokeWidth={1.8} />
              </Link>
            </>
          ) : (
            <div className="home-empty-card">
              <div className="card-heading">
                <div>
                  <span className="label">AGENDA TERDEKAT</span>
                  <h3>Belum ada jadwal kontrol</h3>
                </div>
                <div className="empty-icon">
                  <Calendar size={20} strokeWidth={1.8} />
                </div>
              </div>
              <p className="home-empty-desc">
                Catat jadwal kontrol dokter, cek laboratorium, atau pengingat obat agar tidak
                terlewat.
              </p>
              <Link href="/agenda" className="text-link">
                Tambah agenda kontrol <ChevronRight size={17} strokeWidth={1.8} />
              </Link>
            </div>
          )}
        </Card>

        <Card className="bp-summary">
          {bp.hasData && bp.systolic !== null && bp.diastolic !== null ? (
            <>
              <div className="card-heading">
                <div>
                  <span className="label">TEKANAN DARAH TERAKHIR</span>
                  <h3>{bp.measuredLabel}</h3>
                </div>
                <span className={`soft-badge ${bp.isCritical ? "critical" : ""}`}>
                  {bp.isCritical ? "Perlu perhatian" : "Tercatat"}
                </span>
              </div>
              <div className="bp-value">
                <b>{bp.systolic}</b>
                <span>/</span>
                <b>{bp.diastolic}</b>
                <small>mmHg</small>
              </div>
              <Link href="/tekanan-darah" className="text-link">
                Lihat jurnal tensi <ChevronRight size={17} strokeWidth={1.8} />
              </Link>
            </>
          ) : (
            <div className="home-empty-card">
              <div className="card-heading">
                <div>
                  <span className="label">TEKANAN DARAH TERAKHIR</span>
                  <h3>Belum ada catatan tensi</h3>
                </div>
                <div className="empty-icon">
                  <HeartPulse size={20} strokeWidth={1.8} />
                </div>
              </div>
              <p className="home-empty-desc">
                Tekanan darah yang terkontrol membantu menjaga fungsi ginjal tetap stabil.
              </p>
              <Link href="/tekanan-darah" className="text-link">
                Catat tekanan darah <ChevronRight size={17} strokeWidth={1.8} />
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeLoadingFallback />}>
      <HomeDashboardContent />
    </Suspense>
  );
}
