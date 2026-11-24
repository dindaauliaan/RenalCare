export type LabMetricTab = "eGFR" | "Kreatinin" | "ACR" | "Kalium" | "Ureum";
export type LabPeriod = "3 Bln" | "6 Bln" | "1 Thn" | "Semua";

export interface TrendPoint {
  month: string;
  value: number;
}

export interface LabMetricSummary {
  tab: LabMetricTab;
  unit: string;
  headline: string;
  subtitle: string;
  domain: [number, number];
  data: TrendPoint[];
}

export interface LabHistoryRow {
  id: string;
  date: string;
  tag: string;
  egfr: string;
  creatinine: string;
  acr: string;
  potassium: string;
}

export interface ArticleDummy {
  slug: string;
  cat: string;
  title: string;
  desc: string;
  time: string;
  source: string;
  reviewedAt: string;
  reviewer: string;
  whyImportant: string;
  actionItems: string[];
}

export const DUMMY_PROFILE = {
  fullName: "Budi Santoso",
  firstName: "Budi",
  initials: "BS",
  greetingDate: "Selasa, 24 September",
};

export const DUMMY_HOME_SUMMARY = {
  latestLabDate: "18 Sep 2026",
  stageLabel: "G3a · A2",
  egfr: 52,
  egfrExplain:
    "Penurunan ringan sampai sedang. Ini perkiraan; dokter yang menentukan artinya untuk Anda.",
  nextAgenda: {
    day: "28",
    month: "SEP",
    title: "Kontrol dokter ginjal",
    time: "09.30 WIB",
    location: "RS Harapan Sehat",
  },
  latestBp: {
    timeLabel: "Hari ini, 07.15",
    statusLabel: "Tercatat",
    systolic: 132,
    diastolic: 84,
  },
};

export const DUMMY_LAB_TRENDS: Record<LabMetricTab, LabMetricSummary> = {
  eGFR: {
    tab: "eGFR",
    unit: "mL/mnt/1,73 m²",
    headline: "eGFR terakhir 52 (G3a)",
    subtitle: "Turun dari 61 pada 12 Agu 2026. Bicarakan dengan dokter.",
    domain: [0, 120],
    data: [
      { month: "Apr", value: 72 },
      { month: "Mei", value: 69 },
      { month: "Jun", value: 64 },
      { month: "Jul", value: 62 },
      { month: "Agu", value: 61 },
      { month: "Sep", value: 52 },
    ],
  },
  Kreatinin: {
    tab: "Kreatinin",
    unit: "mg/dL",
    headline: "Kreatinin terbaru 1,42 mg/dL",
    subtitle: "Naik dari 1,25 mg/dL pada 12 Agu 2026. Bicarakan dengan dokter.",
    domain: [0.5, 2.0],
    data: [
      { month: "Apr", value: 1.08 },
      { month: "Mei", value: 1.12 },
      { month: "Jun", value: 1.19 },
      { month: "Jul", value: 1.22 },
      { month: "Agu", value: 1.25 },
      { month: "Sep", value: 1.42 },
    ],
  },
  ACR: {
    tab: "ACR",
    unit: "mg/g",
    headline: "ACR terbaru 38 mg/g",
    subtitle: "Data contoh untuk memantau perubahan albumin urin dari waktu ke waktu.",
    domain: [0, 60],
    data: [
      { month: "Apr", value: 24 },
      { month: "Mei", value: 26 },
      { month: "Jun", value: 28 },
      { month: "Jul", value: 30 },
      { month: "Agu", value: 32 },
      { month: "Sep", value: 38 },
    ],
  },
  Kalium: {
    tab: "Kalium",
    unit: "mmol/L",
    headline: "Kalium terbaru 4,7 mmol/L",
    subtitle: "Data contoh riwayat kalium darah selama 6 bulan terakhir.",
    domain: [3, 6.5],
    data: [
      { month: "Apr", value: 4.2 },
      { month: "Mei", value: 4.3 },
      { month: "Jun", value: 4.3 },
      { month: "Jul", value: 4.4 },
      { month: "Agu", value: 4.5 },
      { month: "Sep", value: 4.7 },
    ],
  },
  Ureum: {
    tab: "Ureum",
    unit: "mg/dL",
    headline: "Ureum terbaru 42 mg/dL",
    subtitle: "Data contoh riwayat ureum selama 6 bulan terakhir.",
    domain: [10, 60],
    data: [
      { month: "Apr", value: 32 },
      { month: "Mei", value: 34 },
      { month: "Jun", value: 35 },
      { month: "Jul", value: 37 },
      { month: "Agu", value: 39 },
      { month: "Sep", value: 42 },
    ],
  },
};

export const DUMMY_LAB_HISTORY: LabHistoryRow[] = [
  {
    id: "lab-sep-2026",
    date: "18 Sep 2026",
    tag: "Terbaru",
    egfr: "52",
    creatinine: "1,42 mg/dL",
    acr: "38 mg/g",
    potassium: "4,7 mmol/L",
  },
  {
    id: "lab-agu-2026",
    date: "12 Agu 2026",
    tag: "Hasil rutin",
    egfr: "61",
    creatinine: "1,25 mg/dL",
    acr: "32 mg/g",
    potassium: "4,5 mmol/L",
  },
  {
    id: "lab-jun-2026",
    date: "14 Jun 2026",
    tag: "Hasil rutin",
    egfr: "64",
    creatinine: "1,19 mg/dL",
    acr: "28 mg/g",
    potassium: "4,3 mmol/L",
  },
];

export const DUMMY_BP_SUMMARY = {
  avg7Days: { systolic: 130, diastolic: 82, status: "Stabil" },
  avg30Days: "132/84 mmHg",
  miniBarsHeights: [48, 58, 44, 70, 61, 53, 64],
};

export const DUMMY_EDUCATION_CATEGORIES = [
  "Semua",
  "Memahami CKD",
  "Hasil Lab",
  "Diet",
  "Tekanan Darah",
  "Obat & NSAID",
  "Sick-Day",
] as const;

/*
 * Catatan (sesuai AGENTS.md): konten artikel di bawah ini adalah placeholder dummy
 * dari /prototype. Seluruh materi klinis/edukasi PERLU DIVERIFIKASI terhadap
 * sumber resmi (KDIGO, NKF, Kemenkes, PERNEFRI) sebelum digunakan pasien nyata.
 */
export const DUMMY_ARTICLES: ArticleDummy[] = [
  {
    slug: "mengenal-stage-penyakit-ginjal-kronik",
    cat: "Memahami CKD",
    title: "Mengenal stage penyakit ginjal kronik",
    desc: "Apa arti G1 hingga G5 dan mengapa hasil eGFR perlu dilihat dari waktu ke waktu.",
    time: "5 menit",
    source: "KDIGO 2024 (PERLU DIVERIFIKASI)",
    reviewedAt: "10 Sep 2026",
    reviewer: "dr. Maya Pratiwi, Sp.PD-KGH",
    whyImportant:
      "Pemeriksaan rutin membantu Anda dan dokter memahami perubahan fungsi ginjal. Satu hasil saja belum selalu menggambarkan kondisi secara utuh, sehingga dokter akan melihat pola hasil dari waktu ke waktu.",
    actionItems: [
      "Simpan dan bawa hasil laboratorium saat kontrol.",
      "Minum obat sesuai petunjuk dokter.",
      "Hindari mengubah pola makan atau obat tanpa berdiskusi dengan tenaga kesehatan.",
    ],
  },
  {
    slug: "cara-membaca-hasil-kreatinin-dan-egfr",
    cat: "Hasil Lab",
    title: "Cara membaca hasil kreatinin dan eGFR",
    desc: "Panduan sederhana memahami dua angka penting dalam pemantauan fungsi ginjal.",
    time: "4 menit",
    source: "KDIGO 2024 (PERLU DIVERIFIKASI)",
    reviewedAt: "10 Sep 2026",
    reviewer: "dr. Maya Pratiwi, Sp.PD-KGH",
    whyImportant:
      "Pemeriksaan rutin membantu Anda dan dokter memahami perubahan fungsi ginjal. Satu hasil saja belum selalu menggambarkan kondisi secara utuh, sehingga dokter akan melihat pola hasil dari waktu ke waktu.",
    actionItems: [
      "Simpan dan bawa hasil laboratorium saat kontrol.",
      "Minum obat sesuai petunjuk dokter.",
      "Hindari mengubah pola makan atau obat tanpa berdiskusi dengan tenaga kesehatan.",
    ],
  },
  {
    slug: "garam-cairan-dan-kesehatan-ginjal",
    cat: "Diet",
    title: "Garam, cairan, dan kesehatan ginjal",
    desc: "Langkah praktis mengatur asupan tanpa membuat waktu makan terasa rumit.",
    time: "6 menit",
    source: "KDIGO 2024 (PERLU DIVERIFIKASI)",
    reviewedAt: "10 Sep 2026",
    reviewer: "dr. Maya Pratiwi, Sp.PD-KGH",
    whyImportant:
      "Pemeriksaan rutin membantu Anda dan dokter memahami perubahan fungsi ginjal. Satu hasil saja belum selalu menggambarkan kondisi secara utuh, sehingga dokter akan melihat pola hasil dari waktu ke waktu.",
    actionItems: [
      "Simpan dan bawa hasil laboratorium saat kontrol.",
      "Minum obat sesuai petunjuk dokter.",
      "Hindari mengubah pola makan atau obat tanpa berdiskusi dengan tenaga kesehatan.",
    ],
  },
  {
    slug: "obat-nyeri-yang-perlu-diperhatikan",
    cat: "Obat & NSAID",
    title: "Obat nyeri yang perlu diperhatikan",
    desc: "Kenali obat anti-inflamasi nonsteroid dan kapan perlu bertanya kepada dokter.",
    time: "4 menit",
    source: "KDIGO 2024 (PERLU DIVERIFIKASI)",
    reviewedAt: "10 Sep 2026",
    reviewer: "dr. Maya Pratiwi, Sp.PD-KGH",
    whyImportant:
      "Pemeriksaan rutin membantu Anda dan dokter memahami perubahan fungsi ginjal. Satu hasil saja belum selalu menggambarkan kondisi secara utuh, sehingga dokter akan melihat pola hasil dari waktu ke waktu.",
    actionItems: [
      "Simpan dan bawa hasil laboratorium saat kontrol.",
      "Minum obat sesuai petunjuk dokter.",
      "Hindari mengubah pola makan atau obat tanpa berdiskusi dengan tenaga kesehatan.",
    ],
  },
  {
    slug: "apa-yang-dilakukan-saat-sedang-sakit",
    cat: "Sick-Day",
    title: "Apa yang dilakukan saat sedang sakit?",
    desc: "Panduan aman ketika demam, diare, muntah, atau sulit makan dan minum.",
    time: "5 menit",
    source: "KDIGO 2024 (PERLU DIVERIFIKASI)",
    reviewedAt: "10 Sep 2026",
    reviewer: "dr. Maya Pratiwi, Sp.PD-KGH",
    whyImportant:
      "Pemeriksaan rutin membantu Anda dan dokter memahami perubahan fungsi ginjal. Satu hasil saja belum selalu menggambarkan kondisi secara utuh, sehingga dokter akan melihat pola hasil dari waktu ke waktu.",
    actionItems: [
      "Simpan dan bawa hasil laboratorium saat kontrol.",
      "Minum obat sesuai petunjuk dokter.",
      "Hindari mengubah pola makan atau obat tanpa berdiskusi dengan tenaga kesehatan.",
    ],
  },
  {
    slug: "mengukur-tekanan-darah-di-rumah",
    cat: "Tekanan Darah",
    title: "Mengukur tekanan darah di rumah",
    desc: "Cara mendapatkan hasil yang lebih akurat dengan posisi dan waktu yang tepat.",
    time: "3 menit",
    source: "KDIGO 2024 (PERLU DIVERIFIKASI)",
    reviewedAt: "10 Sep 2026",
    reviewer: "dr. Maya Pratiwi, Sp.PD-KGH",
    whyImportant:
      "Pemeriksaan rutin membantu Anda dan dokter memahami perubahan fungsi ginjal. Satu hasil saja belum selalu menggambarkan kondisi secara utuh, sehingga dokter akan melihat pola hasil dari waktu ke waktu.",
    actionItems: [
      "Simpan dan bawa hasil laboratorium saat kontrol.",
      "Minum obat sesuai petunjuk dokter.",
      "Hindari mengubah pola makan atau obat tanpa berdiskusi dengan tenaga kesehatan.",
    ],
  },
];

export const DUMMY_EMERGENCY_SYMPTOMS: Array<{ title: string; desc: string }> = [
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
];
