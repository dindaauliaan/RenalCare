import { useMemo, useState } from "react";

type Page = "home" | "labs" | "blood" | "agenda" | "education" | "emergency";
type IconName =
  | "home"
  | "lab"
  | "heart"
  | "calendar"
  | "book"
  | "alert"
  | "plus"
  | "arrow"
  | "trend"
  | "clock"
  | "search"
  | "chevron"
  | "info"
  | "edit"
  | "trash"
  | "check";

const paths: Record<IconName, React.ReactNode> = {
  home: (
    <>
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10M9 20v-6h6v6" />
    </>
  ),
  lab: (
    <>
      <path d="M9 3h6M10 3v5l-5.5 9.2A2.5 2.5 0 0 0 6.7 21h10.6a2.5 2.5 0 0 0 2.2-3.8L14 8V3" />
      <path d="M7 15h10" />
    </>
  ),
  heart: (
    <>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
      <path d="M3.8 12h4l1.4-3.4 2.4 7 1.8-3.6h6.8" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
    </>
  ),
  book: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5v13Z" />
      <path d="M8 8h8M8 12h6" />
    </>
  ),
  alert: (
    <>
      <path d="M10.3 3.6 2.5 17.2A2 2 0 0 0 4.2 20h15.6a2 2 0 0 0 1.7-2.8L13.7 3.6a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  arrow: <path d="m9 18 6-6-6-6" />,
  trend: (
    <>
      <path d="m3 17 6-6 4 4 8-9" />
      <path d="M15 6h6v6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  chevron: <path d="m6 9 6 6 6-6" />,
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  edit: (
    <>
      <path d="M12 20h9" />
      <path d="m16.5 3.5 4 4L8 20l-5 1 1-5Z" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 11v5M14 11v5" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
};

function Icon({
  name,
  size = 22,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

const nav: { id: Page; label: string; icon: IconName }[] = [
  { id: "home", label: "Beranda", icon: "home" },
  { id: "labs", label: "Riwayat Lab", icon: "lab" },
  { id: "blood", label: "Tekanan Darah", icon: "heart" },
  { id: "agenda", label: "Agenda", icon: "calendar" },
  { id: "education", label: "Edukasi", icon: "book" },
];

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <section className={`card ${className}`}>{children}</section>
);

const Button = ({
  children,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "outline" | "danger" | "ghost";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) => (
  <button
    type={type}
    disabled={disabled}
    onClick={onClick}
    className={`btn btn-${variant} ${className}`}
  >
    {children}
  </button>
);

function Header({ title, onEmergency }: { title: string; onEmergency: () => void }) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">RenalCare</p>
        <h1>{title}</h1>
      </div>
      <button className="emergency-btn" onClick={onEmergency}>
        <Icon name="alert" size={19} /> <span>Tanda Bahaya / IGD</span>
      </button>
    </header>
  );
}

function PageTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="page-intro">
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  );
}

function Home({ go }: { go: (page: Page) => void }) {
  return (
    <div className="page">
      <div className="welcome">
        <div>
          <p className="eyebrow">Selasa, 24 September</p>
          <h2>Selamat pagi, Budi</h2>
          <p>Berikut ringkasan kesehatan ginjal Anda.</p>
        </div>
        <div className="avatar">BS</div>
      </div>

      <div className="alert warning">
        <div className="alert-icon">
          <Icon name="trend" />
        </div>
        <div>
          <strong>Ada perubahan yang perlu diperhatikan</strong>
          <p>
            eGFR Anda menurun sejak hasil sebelumnya. Tidak perlu panik, segera bicarakan dengan
            dokter.
          </p>
          <button onClick={() => go("labs")}>
            Lihat perubahannya <Icon name="arrow" size={17} />
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        <Card className="kidney-card">
          <div className="card-heading">
            <div>
              <span className="label">STATUS GINJAL TERBARU</span>
              <p>Hasil 18 Sep 2026</p>
            </div>
            <span className="status-badge">G3a · A2</span>
          </div>
          <div className="egfr">
            <strong>52</strong>
            <span>
              mL/mnt/
              <br />
              1,73 m²
            </span>
          </div>
          <div className="meter">
            <span />
            <i />
          </div>
          <p className="explain">
            <Icon name="info" size={19} /> Penurunan ringan sampai sedang. Ini perkiraan; dokter
            yang menentukan artinya untuk Anda.
          </p>
          <button className="text-link" onClick={() => go("labs")}>
            Lihat tren dan riwayat <Icon name="arrow" size={17} />
          </button>
        </Card>

        <Card className="quick-card">
          <span className="label">AKSI CEPAT</span>
          <h3>Catat kesehatan Anda</h3>
          <div className="quick-actions">
            <button onClick={() => go("labs")}>
              <span>
                <Icon name="lab" />
              </span>
              <b>Catat Hasil Lab</b>
              <small>Sekitar 90 detik</small>
            </button>
            <button onClick={() => go("blood")}>
              <span>
                <Icon name="heart" />
              </span>
              <b>Catat Tekanan Darah</b>
              <small>Sekitar 30 detik</small>
            </button>
          </div>
        </Card>
      </div>

      <div className="bottom-grid">
        <Card className="appointment">
          <div className="card-heading">
            <div>
              <span className="label">AGENDA TERDEKAT</span>
              <h3>Kontrol dokter ginjal</h3>
            </div>
            <div className="date-tile">
              <b>28</b>
              <span>SEP</span>
            </div>
          </div>
          <div className="meta-row">
            <span>
              <Icon name="clock" size={18} /> 09.30 WIB
            </span>
            <span>RS Harapan Sehat</span>
          </div>
          <button className="text-link" onClick={() => go("agenda")}>
            Lihat semua agenda <Icon name="arrow" size={17} />
          </button>
        </Card>
        <Card className="bp-summary">
          <div className="card-heading">
            <div>
              <span className="label">TEKANAN DARAH TERAKHIR</span>
              <h3>Hari ini, 07.15</h3>
            </div>
            <span className="soft-badge">Tercatat</span>
          </div>
          <div className="bp-value">
            <b>132</b>
            <span>/</span>
            <b>84</b>
            <small>mmHg</small>
          </div>
          <button className="text-link" onClick={() => go("blood")}>
            Lihat jurnal tensi <Icon name="arrow" size={17} />
          </button>
        </Card>
      </div>
    </div>
  );
}

function LabChart() {
  return (
    <div className="chart-wrap" aria-label="Grafik tren eGFR dari bulan April hingga September">
      <div className="chart-y">
        <span>90</span>
        <span>60</span>
        <span>30</span>
        <span>0</span>
      </div>
      <svg viewBox="0 0 700 230" preserveAspectRatio="none" role="img">
        <defs>
          <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#167D8D" stopOpacity=".22" />
            <stop offset="1" stopColor="#167D8D" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="700" height="55" fill="#dcfce7" opacity=".55" />
        <rect x="0" y="55" width="700" height="62" fill="#fef9c3" opacity=".55" />
        <rect x="0" y="117" width="700" height="58" fill="#ffedd5" opacity=".55" />
        <rect x="0" y="175" width="700" height="55" fill="#fee2e2" opacity=".55" />
        {[0, 55, 117, 175, 229].map((y) => (
          <line key={y} x1="0" x2="700" y1={y} y2={y} stroke="#cbd5e1" strokeDasharray="4 5" />
        ))}
        <path
          d="M15 53 L150 61 L285 74 L420 80 L555 97 L685 103 L685 230 L15 230Z"
          fill="url(#area)"
        />
        <path
          d="M15 53 L150 61 L285 74 L420 80 L555 97 L685 103"
          fill="none"
          stroke="#167D8D"
          strokeWidth="4"
          vectorEffect="non-scaling-stroke"
        />
        {[
          [15, 53],
          [150, 61],
          [285, 74],
          [420, 80],
          [555, 97],
          [685, 103],
        ].map(([x, y], i) => (
          <g key={x}>
            <circle cx={x} cy={y} r="7" fill="white" stroke="#167D8D" strokeWidth="4" />
            {i === 5 && (
              <>
                <rect x="627" y="58" width="70" height="32" rx="8" fill="#0F5E6B" />
                <text x="662" y="79" fill="white" textAnchor="middle" fontSize="14">
                  52
                </text>
              </>
            )}
          </g>
        ))}
      </svg>
      <div className="chart-x">
        <span>Apr</span>
        <span>Mei</span>
        <span>Jun</span>
        <span>Jul</span>
        <span>Agu</span>
        <span>Sep</span>
      </div>
    </div>
  );
}

function LabForm({ close }: { close: () => void }) {
  const [potassium, setPotassium] = useState("");
  const critical = Number(potassium) >= 6;
  return (
    <div className="modal-backdrop">
      <div className="modal large-modal" role="dialog" aria-modal="true">
        <div className="modal-head">
          <div>
            <span className="label">INPUT CEPAT</span>
            <h2>Catat hasil lab</h2>
            <p>Salin angka persis seperti pada lembar hasil laboratorium.</p>
          </div>
          <button className="close-btn" onClick={close} aria-label="Tutup">
            ×
          </button>
        </div>
        {critical && (
          <div className="alert critical">
            <Icon name="alert" />
            <div>
              <strong>Nilai kalium sangat tinggi dan dapat berbahaya</strong>
              <p>Hubungi dokter atau layanan darurat segera.</p>
            </div>
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            close();
          }}
        >
          <label className="field full">
            Tanggal pengambilan sampel
            <input type="date" defaultValue="2026-09-24" />
          </label>
          <div className="form-grid">
            <label className="field">
              Kreatinin
              <div className="unit-input">
                <input type="number" step=".01" placeholder="contoh: 1,4" />
                <select aria-label="Satuan kreatinin">
                  <option>mg/dL</option>
                  <option>µmol/L</option>
                </select>
              </div>
            </label>
            <label className="field">
              Ureum
              <div className="unit-input">
                <input type="number" placeholder="contoh: 42" />
                <select aria-label="Satuan ureum">
                  <option>mg/dL (urea)</option>
                  <option>mg/dL (BUN)</option>
                  <option>mmol/L</option>
                </select>
              </div>
            </label>
            <label className="field">
              Kalium
              <div className="unit-input">
                <input
                  value={potassium}
                  onChange={(e) => setPotassium(e.target.value)}
                  type="number"
                  step=".1"
                  placeholder="contoh: 4,5"
                />
                <span>mmol/L</span>
              </div>
            </label>
            <label className="field">
              ACR
              <div className="unit-input">
                <input type="number" placeholder="contoh: 35" />
                <select aria-label="Satuan ACR">
                  <option>mg/g</option>
                  <option>mg/mmol</option>
                </select>
              </div>
            </label>
          </div>
          <details>
            <summary>
              Masukkan rentang normal dari lembar lab Anda <Icon name="chevron" size={18} />
            </summary>
            <textarea placeholder="Tambahkan rentang normal atau catatan lain..." />
          </details>
          <label className="check-row">
            <input type="checkbox" />
            <span>
              <b>Hasil diambil saat saya sakit akut / dirawat</b>
              <small>Kondisi ini dapat membuat eGFR kurang stabil.</small>
            </span>
            <Icon name="info" size={20} />
          </label>
          <div className="modal-actions">
            <Button variant="ghost" onClick={close}>
              Batal
            </Button>
            <Button type="submit">Simpan hasil lab</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Labs() {
  const [form, setForm] = useState(false);
  const [tab, setTab] = useState("eGFR");
  return (
    <div className="page">
      <div className="intro-actions">
        <PageTitle
          title="Riwayat Lab"
          subtitle="Pantau perubahan hasil laboratorium Anda dari waktu ke waktu."
        />
        <Button onClick={() => setForm(true)}>
          <Icon name="plus" size={19} /> Catat hasil lab
        </Button>
      </div>
      <Card>
        <div className="tabs">
          {["eGFR", "Kreatinin", "ACR", "Kalium", "Ureum"].map((x) => (
            <button className={tab === x ? "active" : ""} onClick={() => setTab(x)} key={x}>
              {x}
            </button>
          ))}
        </div>
        <div className="chart-header">
          <div>
            <span className="label">TREN {tab.toUpperCase()}</span>
            <h3>{tab === "eGFR" ? "eGFR terakhir 52 (G3a)" : `${tab} terbaru`}</h3>
            <p>Turun dari 61 pada 12 Agu 2026. Bicarakan dengan dokter.</p>
          </div>
          <div className="periods">
            {["3 Bln", "6 Bln", "1 Thn", "Semua"].map((x, i) => (
              <button className={i === 1 ? "active" : ""} key={x}>
                {x}
              </button>
            ))}
          </div>
        </div>
        <LabChart />
        <div className="legend">
          <span>
            <i className="g1" /> G1–G2
          </span>
          <span>
            <i className="g3" /> G3
          </span>
          <span>
            <i className="g4" /> G4
          </span>
          <span>
            <i className="g5" /> G5
          </span>
        </div>
      </Card>
      <Card>
        <div className="card-heading">
          <div>
            <span className="label">SEMUA HASIL</span>
            <h3>Riwayat pemeriksaan</h3>
          </div>
          <select className="small-select">
            <option>Terbaru</option>
            <option>Terlama</option>
          </select>
        </div>
        <div className="lab-list">
          {[
            ["18 Sep 2026", "52", "1,42 mg/dL", "38 mg/g", "4,7 mmol/L"],
            ["12 Agu 2026", "61", "1,25 mg/dL", "32 mg/g", "4,5 mmol/L"],
            ["14 Jun 2026", "64", "1,19 mg/dL", "28 mg/g", "4,3 mmol/L"],
          ].map((r, i) => (
            <div className="lab-row" key={r[0]}>
              <div className="lab-date">
                <b>{r[0]}</b>
                <span>{i === 0 ? "Terbaru" : "Hasil rutin"}</span>
              </div>
              <div>
                <small>eGFR</small>
                <b>{r[1]}</b>
              </div>
              <div>
                <small>Kreatinin</small>
                <b>{r[2]}</b>
              </div>
              <div className="hide-mobile">
                <small>ACR</small>
                <b>{r[3]}</b>
              </div>
              <div className="hide-mobile">
                <small>Kalium</small>
                <b>{r[4]}</b>
              </div>
              <div className="row-actions">
                <button aria-label="Edit">
                  <Icon name="edit" size={18} />
                </button>
                <button aria-label="Hapus">
                  <Icon name="trash" size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
      {form && <LabForm close={() => setForm(false)} />}
    </div>
  );
}

function Blood() {
  const [sys, setSys] = useState("");
  const [dia, setDia] = useState("");
  const critical = Number(sys) >= 180 || Number(dia) >= 120;
  return (
    <div className="page">
      <PageTitle
        title="Tekanan Darah"
        subtitle="Catat secara rutin agar dokter dapat melihat pola tekanan darah Anda."
      />
      <button className="guide-banner">
        <span>
          <Icon name="info" />
        </span>
        <div>
          <b>Panduan cara ukur tekanan darah yang benar</b>
          <small>Duduk tenang, kaki menapak, lengan setinggi jantung.</small>
        </div>
        <Icon name="arrow" />
      </button>
      {critical && (
        <div className="alert critical">
          <Icon name="alert" />
          <div>
            <strong>Tekanan darah Anda sangat tinggi</strong>
            <p>
              Duduk tenang dan ukur ulang setelah 5 menit. Jika tetap tinggi atau ada nyeri
              dada/sesak, segera ke IGD.
            </p>
          </div>
        </div>
      )}
      <div className="blood-grid">
        <Card className="bp-form">
          <span className="label">CATAT SEKARANG</span>
          <h3>Hasil pengukuran</h3>
          <div className="bp-inputs">
            <label>
              Sistolik
              <input
                value={sys}
                onChange={(e) => setSys(e.target.value)}
                type="number"
                placeholder="120"
              />
              <small>mmHg</small>
            </label>
            <span>/</span>
            <label>
              Diastolik
              <input
                value={dia}
                onChange={(e) => setDia(e.target.value)}
                type="number"
                placeholder="80"
              />
              <small>mmHg</small>
            </label>
          </div>
          <div className="form-grid compact">
            <label className="field">
              Denyut nadi (opsional)
              <input type="number" placeholder="72 kali/menit" />
            </label>
            <label className="field">
              Lengan
              <select>
                <option>Kiri</option>
                <option>Kanan</option>
              </select>
            </label>
            <label className="field">
              Posisi
              <select>
                <option>Duduk</option>
                <option>Berdiri</option>
                <option>Berbaring</option>
              </select>
            </label>
            <label className="field">
              Tanggal & jam
              <input type="datetime-local" defaultValue="2026-09-24T07:15" />
            </label>
          </div>
          <Button className="full-btn">Simpan pengukuran</Button>
        </Card>
        <div className="side-stack">
          <Card>
            <div className="card-heading">
              <div>
                <span className="label">RATA-RATA 7 HARI</span>
                <h3>Tekanan darah</h3>
              </div>
              <span className="soft-badge">Stabil</span>
            </div>
            <div className="average">
              <b>130</b>
              <span>/</span>
              <b>82</b>
              <small>mmHg</small>
            </div>
            <div className="mini-bars">
              {[48, 58, 44, 70, 61, 53, 64].map((h, i) => (
                <i key={i} style={{ height: h }} />
              ))}
            </div>
            <p className="muted">
              Rata-rata 30 hari: <b>132/84 mmHg</b>
            </p>
          </Card>
          <Card className="target-empty">
            <div className="empty-icon">
              <Icon name="trend" />
            </div>
            <div>
              <h3>Target dari dokter</h3>
              <p>Belum ada target tekanan darah. Tanyakan ke dokter, lalu isi di sini.</p>
            </div>
            <Button variant="outline">Atur Target</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Agenda({ go }: { go: (p: Page) => void }) {
  const [filter, setFilter] = useState("Akan Datang");
  return (
    <div className="page">
      <div className="intro-actions">
        <PageTitle
          title="Agenda & Pengingat"
          subtitle="Jadwal kontrol dan pemeriksaan Anda untuk 30 hari ke depan."
        />
        <Button>
          <Icon name="plus" size={19} /> Tambah pengingat
        </Button>
      </div>
      <Card className="recommendation">
        <div className="recommend-icon">
          <Icon name="calendar" />
        </div>
        <div>
          <span className="label">SARAN INTERVAL LAB</span>
          <h3>Jaga pemeriksaan Anda tetap rutin</h3>
          <p>
            Untuk stage <b>G3a A2</b>, disarankan cek lab sekitar 2–3x setahun. Sesuaikan dengan
            anjuran dokter Anda.
          </p>
        </div>
        <Button variant="outline">Buat Pengingat</Button>
      </Card>
      <div className="filter-tabs">
        {["Akan Datang", "Selesai", "Terlewat"].map((x) => (
          <button key={x} onClick={() => setFilter(x)} className={filter === x ? "active" : ""}>
            {x}
            <span>{x === "Akan Datang" ? 3 : x === "Selesai" ? 2 : 1}</span>
          </button>
        ))}
      </div>
      <div className="schedule">
        {filter === "Akan Datang" ? (
          <>
            <Card className="schedule-card">
              <div className="date-block">
                <b>28</b>
                <span>SEP</span>
              </div>
              <div className="schedule-info">
                <span className="status upcoming">4 hari lagi</span>
                <h3>Kontrol dokter ginjal</h3>
                <p>09.30 WIB · RS Harapan Sehat</p>
                <small>Bawa hasil lab terakhir dan daftar obat.</small>
              </div>
              <Button variant="ghost">Lihat detail</Button>
            </Card>
            <Card className="schedule-card">
              <div className="date-block blue">
                <b>12</b>
                <span>OKT</span>
              </div>
              <div className="schedule-info">
                <span className="status planned">Pemeriksaan</span>
                <h3>Cek laboratorium rutin</h3>
                <p>07.00 WIB · Lab Medika Utama</p>
                <small>Kreatinin, ureum, kalium, dan ACR.</small>
              </div>
              <Button variant="ghost">Lihat detail</Button>
            </Card>
            <Card className="schedule-card">
              <div className="date-block">
                <b>21</b>
                <span>OKT</span>
              </div>
              <div className="schedule-info">
                <span className="status upcoming">Pengingat</span>
                <h3>Ambil resep obat bulanan</h3>
                <p>10.00 WIB · Klinik Penyakit Dalam</p>
              </div>
              <Button variant="ghost">Lihat detail</Button>
            </Card>
          </>
        ) : filter === "Selesai" ? (
          <Card className="schedule-card">
            <div className="date-block done">
              <Icon name="check" />
            </div>
            <div className="schedule-info">
              <span className="status completed">Selesai</span>
              <h3>Cek laboratorium rutin</h3>
              <p>18 Sep 2026 · Lab Medika Utama</p>
            </div>
            <Button onClick={() => go("labs")}>Catat Hasil Lab Sekarang</Button>
          </Card>
        ) : (
          <Card className="empty-state">
            <Icon name="calendar" />
            <h3>Tidak ada agenda terlewat</h3>
            <p>Bagus, semua agenda Anda tertangani.</p>
          </Card>
        )}
      </div>
    </div>
  );
}

const articles = [
  {
    cat: "Memahami CKD",
    title: "Mengenal stage penyakit ginjal kronik",
    desc: "Apa arti G1 hingga G5 dan mengapa hasil eGFR perlu dilihat dari waktu ke waktu.",
    time: "5 menit",
  },
  {
    cat: "Hasil Lab",
    title: "Cara membaca hasil kreatinin dan eGFR",
    desc: "Panduan sederhana memahami dua angka penting dalam pemantauan fungsi ginjal.",
    time: "4 menit",
  },
  {
    cat: "Diet",
    title: "Garam, cairan, dan kesehatan ginjal",
    desc: "Langkah praktis mengatur asupan tanpa membuat waktu makan terasa rumit.",
    time: "6 menit",
  },
  {
    cat: "Obat & NSAID",
    title: "Obat nyeri yang perlu diperhatikan",
    desc: "Kenali obat anti-inflamasi nonsteroid dan kapan perlu bertanya kepada dokter.",
    time: "4 menit",
  },
  {
    cat: "Sick-Day",
    title: "Apa yang dilakukan saat sedang sakit?",
    desc: "Panduan aman ketika demam, diare, muntah, atau sulit makan dan minum.",
    time: "5 menit",
  },
  {
    cat: "Tekanan Darah",
    title: "Mengukur tekanan darah di rumah",
    desc: "Cara mendapatkan hasil yang lebih akurat dengan posisi dan waktu yang tepat.",
    time: "3 menit",
  },
];

function Education() {
  const [cat, setCat] = useState("Semua");
  const [query, setQuery] = useState("");
  const [article, setArticle] = useState<(typeof articles)[0] | null>(null);
  const shown = useMemo(
    () =>
      articles.filter(
        (a) =>
          (cat === "Semua" || a.cat === cat) && a.title.toLowerCase().includes(query.toLowerCase()),
      ),
    [cat, query],
  );
  if (article)
    return (
      <div className="page article-page">
        <button className="back-link" onClick={() => setArticle(null)}>
          ← Kembali ke edukasi
        </button>
        <article>
          <span className="article-cat">{article.cat}</span>
          <h2>{article.title}</h2>
          <p className="lead">{article.desc}</p>
          <div className="article-meta">
            <span>
              Sumber <b>KDIGO 2024</b>
            </span>
            <span>
              Tinjau terakhir <b>10 Sep 2026</b>
            </span>
            <span>
              Peninjau <b>dr. Maya Pratiwi, Sp.PD-KGH</b>
            </span>
          </div>
          <h3>Mengapa ini penting?</h3>
          <p>
            Pemeriksaan rutin membantu Anda dan dokter memahami perubahan fungsi ginjal. Satu hasil
            saja belum selalu menggambarkan kondisi secara utuh, sehingga dokter akan melihat pola
            hasil dari waktu ke waktu.
          </p>
          <h3>Hal yang dapat Anda lakukan</h3>
          <ul>
            <li>Simpan dan bawa hasil laboratorium saat kontrol.</li>
            <li>Minum obat sesuai petunjuk dokter.</li>
            <li>Hindari mengubah pola makan atau obat tanpa berdiskusi dengan tenaga kesehatan.</li>
          </ul>
          <div className="article-note">
            <Icon name="info" />
            <p>
              Informasi ini bersifat umum. Kondisi setiap orang berbeda; konsultasikan dengan dokter
              yang merawat Anda.
            </p>
          </div>
        </article>
      </div>
    );
  return (
    <div className="page">
      <PageTitle
        title="Edukasi"
        subtitle="Informasi tepercaya untuk membantu Anda memahami kesehatan ginjal."
      />
      <div className="search-box">
        <Icon name="search" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari topik, misalnya eGFR atau obat..."
        />
      </div>
      <div className="chips">
        {[
          "Semua",
          "Memahami CKD",
          "Hasil Lab",
          "Diet",
          "Tekanan Darah",
          "Obat & NSAID",
          "Sick-Day",
        ].map((x) => (
          <button onClick={() => setCat(x)} className={cat === x ? "active" : ""} key={x}>
            {x}
          </button>
        ))}
      </div>
      <div className="article-grid">
        {shown.map((a, i) => (
          <button className="article-card" key={a.title} onClick={() => setArticle(a)}>
            <div className={`article-visual visual-${i}`}>
              <Icon name={i % 2 ? "lab" : "book"} size={30} />
              <span>{a.cat}</span>
            </div>
            <div className="article-body">
              <small>{a.time} baca</small>
              <h3>{a.title}</h3>
              <p>{a.desc}</p>
              <span className="read-link">
                Baca artikel <Icon name="arrow" size={17} />
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Emergency({ back }: { back: () => void }) {
  const symptoms = [
    ["Urine sangat sedikit atau berhenti", "Terutama bila disertai bengkak atau mual."],
    ["Sesak napas atau sulit bernapas", "Terasa mendadak atau semakin memburuk."],
    ["Bengkak mendadak", "Pada kaki, wajah, atau seluruh tubuh."],
    ["Nyeri atau tekanan di dada", "Terutama bila menjalar atau disertai keringat dingin."],
    ["Kebingungan atau sulit dibangunkan", "Perubahan kesadaran membutuhkan pertolongan segera."],
  ];
  return (
    <div className="emergency-page">
      <button className="back-link" onClick={back}>
        ← Kembali
      </button>
      <div className="emergency-hero">
        <div className="big-alert">
          <Icon name="alert" size={38} />
        </div>
        <span>TANDA BAHAYA</span>
        <h2>Jangan tunggu jika Anda mengalami gejala berikut</h2>
        <p>Gejala ini dapat menandakan kondisi serius dan memerlukan pertolongan medis segera.</p>
      </div>
      <div className="symptom-list">
        {symptoms.map(([a, b]) => (
          <div key={a}>
            <span>
              <Icon name="alert" size={21} />
            </span>
            <div>
              <h3>{a}</h3>
              <p>{b}</p>
            </div>
          </div>
        ))}
      </div>
      <a className="emergency-cta" href="tel:119">
        <Icon name="heart" /> Hubungi Layanan Darurat / Segera ke IGD
      </a>
      <p className="emergency-note">
        Jika ragu, lebih baik cari pertolongan. Jangan menyetir sendiri bila kondisi Anda tidak
        stabil.
      </p>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const title = nav.find((n) => n.id === page)?.label || "Tanda Bahaya";
  const go = (p: Page) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Icon name="heart" />
          </div>
          <div>
            <b>RenalCare</b>
            <span>Kidney Health Monitor</span>
          </div>
        </div>
        <nav>
          {nav.map((n) => (
            <button key={n.id} onClick={() => go(n.id)} className={page === n.id ? "active" : ""}>
              <Icon name={n.icon} />
              <span>{n.label}</span>
              {page === n.id && <i />}
            </button>
          ))}
        </nav>
        <button className="side-emergency" onClick={() => go("emergency")}>
          <Icon name="alert" />
          <span>
            <b>Tanda Bahaya</b>
            <small>Panduan keadaan darurat</small>
          </span>
        </button>
        <div className="side-profile">
          <div className="avatar small">BS</div>
          <div>
            <b>Budi Santoso</b>
            <span>Lihat profil</span>
          </div>
          <Icon name="arrow" size={17} />
        </div>
      </aside>
      <main>
        <Header title={title} onEmergency={() => go("emergency")} />
        <div className="content">
          {page === "home" && <Home go={go} />}
          {page === "labs" && <Labs />}
          {page === "blood" && <Blood />}
          {page === "agenda" && <Agenda go={go} />}
          {page === "education" && <Education />}
          {page === "emergency" && <Emergency back={() => go("home")} />}
        </div>
        <footer>RenalCare adalah alat pemantau dan edukasi, bukan pengganti dokter.</footer>
      </main>
      <nav className="bottom-nav">
        {nav.map((n) => (
          <button key={n.id} onClick={() => go(n.id)} className={page === n.id ? "active" : ""}>
            <Icon name={n.icon} size={21} />
            <span>{n.label.replace("Tekanan Darah", "Tensi").replace("Riwayat Lab", "Lab")}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
