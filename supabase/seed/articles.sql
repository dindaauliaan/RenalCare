-- ============================================================================
-- RenalCare – Seed Artikel Edukasi (supabase/seed/articles.sql)
-- Aman dijalankan berulang (idempotent) menggunakan ON CONFLICT (slug) DO UPDATE.
-- Catatan:
--   - 6 artikel pertama berasal dari link PubMed di artikel-links.md
--     (ringkasan singkat ditulis dengan kata-kata sendiri dari abstrak resmi).
--   - 6 artikel berikutnya berasal dari /prototype tanpa tautan sumber
--     (body = '[ISI MENUNGGU SUMBER]', source_url = NULL).
--   - Semua baris berstatus review_status = 'pending', reviewer = NULL, reviewed_at = NULL.
-- ============================================================================

insert into public.articles (
  slug,
  title,
  category,
  summary,
  body,
  source,
  source_org,
  source_url,
  reviewed_at,
  reviewer,
  read_minutes,
  published,
  review_status,
  language
)
values
  -- ==========================================================================
  -- A. 6 ARTIKEL DARI LINK PUBMED (src/app/(app)/edukasi/data/artikel-links.md)
  -- ==========================================================================
  (
    'variabilitas-egfr-risiko-pgk-cric-2025',
    'Time-Updated Estimated GFR Variability Is Associated With Mortality, Cardiovascular Disease, and End-Stage Kidney Disease in Patients With CKD: Findings From the CRIC Study',
    'Memahami CKD',
    'Studi kohort pada 4.224 peserta CRIC Study dengan eGFR awal 20–70 mL/mnt/1,73 m² meneliti variasi nilai eGFR yang diperbarui berkala tiap tahun. Hasilnya menunjukkan bahwa variasi eGFR yang lebih besar dari waktu ke waktu berhubungan dengan meningkatnya risiko penyakit kardiovaskular, penyakit ginjal tahap akhir, dan kematian, terlepas dari nilai absolut maupun laju penurunan eGFR.',
    'Studi kohort pada 4.224 peserta CRIC Study dengan eGFR awal 20–70 mL/mnt/1,73 m² meneliti variasi nilai eGFR yang diperbarui berkala tiap tahun. Hasilnya menunjukkan bahwa variasi eGFR yang lebih besar dari waktu ke waktu berhubungan dengan meningkatnya risiko penyakit kardiovaskular, penyakit ginjal tahap akhir, dan kematian, terlepas dari nilai absolut maupun laju penurunan eGFR.

Baca selengkapnya di sumber resmi.',
    'PubMed PMID 40054592 (Jun 2025)',
    'American Journal of Kidney Diseases (National Kidney Foundation)',
    'https://pubmed.ncbi.nlm.nih.gov/40054592/#1',
    null,
    null,
    3,
    true,
    'pending',
    'id'
  ),
  (
    'kreatinin-serum-dan-fungsi-ginjal-1988',
    'Serum creatinine and renal function',
    'Hasil Lab',
    'Tinjauan medis ini menjelaskan bahwa kadar kreatinin serum di darah tidak hanya mencerminkan penyaringan ginjal, tetapi juga dipengaruhi oleh pembentukan, asupan, dan metabolisme kreatinin. Oleh karena itu, kreatinin serum saja atau grafik kebalikan kreatinin terhadap waktu belum cukup akurat untuk memperkirakan GFR dan laju perkembangan penyakit ginjal.',
    'Tinjauan medis ini menjelaskan bahwa kadar kreatinin serum di darah tidak hanya mencerminkan penyaringan ginjal, tetapi juga dipengaruhi oleh pembentukan, asupan, dan metabolisme kreatinin. Oleh karena itu, kreatinin serum saja atau grafik kebalikan kreatinin terhadap waktu belum cukup akurat untuk memperkirakan GFR dan laju perkembangan penyakit ginjal.

Baca selengkapnya di sumber resmi.',
    'PubMed PMID 3285786 (1988)',
    'Annual Review of Medicine',
    'https://pubmed.ncbi.nlm.nih.gov/3285786/#1',
    null,
    null,
    3,
    true,
    'pending',
    'id'
  ),
  (
    'uji-acak-pembatasan-natrium-pada-ckd-2013',
    'A randomized trial of dietary sodium restriction in CKD',
    'Diet',
    'Uji acak silang tersamar ganda pada 20 pasien dewasa CKD stadium 3–4 dengan hipertensi (studi LowSALT CKD) membandingkan asupan natrium tinggi dan rendah. Pembatasan garam secara bermakna menurunkan tekanan darah (rata-rata 10/4 mmHg), volume cairan ekstraseluler, serta albuminuria dan proteinuria.',
    'Uji acak silang tersamar ganda pada 20 pasien dewasa CKD stadium 3–4 dengan hipertensi (studi LowSALT CKD) membandingkan asupan natrium tinggi dan rendah. Pembatasan garam secara bermakna menurunkan tekanan darah (rata-rata 10/4 mmHg), volume cairan ekstraseluler, serta albuminuria dan proteinuria.

Baca selengkapnya di sumber resmi.',
    'PubMed PMID 24204003 (Des 2013)',
    'Journal of the American Society of Nephrology (JASN)',
    'https://pubmed.ncbi.nlm.nih.gov/24204003/#1',
    null,
    null,
    3,
    true,
    'pending',
    'id'
  ),
  (
    'penggunaan-oains-dan-penyakit-ginjal-kronik-2014',
    'Status of non-steroidal anti-inflammatory drugs use and its association with chronic kidney disease: a cross-sectional survey in China',
    'Obat & NSAID',
    'Survei potong lintang berskala nasional terhadap 47.204 orang dewasa di Tiongkok meneliti kebiasaan penggunaan obat antiinflamasi nonsteroid (OAINS) dan kaitannya dengan CKD. Analisis menunjukkan bahwa penggunaan OAINS jangka panjang selama 48 bulan atau lebih berkaitan secara independen dengan penurunan fungsi ginjal (eGFR di bawah 60 mL/mnt/1,73 m²).',
    'Survei potong lintang berskala nasional terhadap 47.204 orang dewasa di Tiongkok meneliti kebiasaan penggunaan obat antiinflamasi nonsteroid (OAINS) dan kaitannya dengan CKD. Analisis menunjukkan bahwa penggunaan OAINS jangka panjang selama 48 bulan atau lebih berkaitan secara independen dengan penurunan fungsi ginjal (eGFR di bawah 60 mL/mnt/1,73 m²).

Baca selengkapnya di sumber resmi.',
    'PubMed PMID 25196389 (Okt 2014)',
    'Nephrology (Asian Pacific Society of Nephrology)',
    'https://pubmed.ncbi.nlm.nih.gov/25196389/#1',
    null,
    null,
    3,
    true,
    'pending',
    'id'
  ),
  (
    'konsensus-panduan-obat-saat-sakit-akut-2023',
    'Consensus Recommendations for Sick Day Medication Guidance for People With Diabetes, Kidney, or Cardiovascular Disease: A Modified Delphi Process',
    'Sick-Day',
    'Panel multidisiplin yang terdiri dari 26 klinisi menyusun 42 rekomendasi konsensus tentang panduan obat saat sakit akut (sick day medication guidance) ketika terjadi gejala kekurangan cairan. Konsensus ini mencakup penghentian sementara obat tertentu (seperti penghambat RAS, diuretik, OAINS, penghambat SGLT2, dan metformin) serta cara memulainya kembali dalam 24–48 jam setelah gejala mereda dan pola makan-minum kembali normal.',
    'Panel multidisiplin yang terdiri dari 26 klinisi menyusun 42 rekomendasi konsensus tentang panduan obat saat sakit akut (sick day medication guidance) ketika terjadi gejala kekurangan cairan. Konsensus ini mencakup penghentian sementara obat tertentu (seperti penghambat RAS, diuretik, OAINS, penghambat SGLT2, dan metformin) serta cara memulainya kembali dalam 24–48 jam setelah gejala mereda dan pola makan-minum kembali normal.

Baca selengkapnya di sumber resmi.',
    'PubMed PMID 36470530 (Mei 2023)',
    'American Journal of Kidney Diseases (National Kidney Foundation)',
    'https://pubmed.ncbi.nlm.nih.gov/36470530/#1',
    null,
    null,
    4,
    true,
    'pending',
    'id'
  ),
  (
    'pemantauan-tekanan-darah-di-rumah-2025',
    'Home Blood Pressure Monitoring',
    'Tekanan Darah',
    'Tinjauan ilmiah ini membahas pemantauan tekanan darah mandiri di rumah (HBPM) sebagai metode tervalidasi di luar klinik untuk membantu diagnosis dan pengelolaan hipertensi. HBPM dinilai mudah diakses, membantu mengukur tekanan darah basal, serta mendukung pengendalian tekanan darah yang lebih baik terutama bila dipadukan dengan telemonitoring dan perangkat yang tervalidasi.',
    'Tinjauan ilmiah ini membahas pemantauan tekanan darah mandiri di rumah (HBPM) sebagai metode tervalidasi di luar klinik untuk membantu diagnosis dan pengelolaan hipertensi. HBPM dinilai mudah diakses, membantu mengukur tekanan darah basal, serta mendukung pengendalian tekanan darah yang lebih baik terutama bila dipadukan dengan telemonitoring dan perangkat yang tervalidasi.

Baca selengkapnya di sumber resmi.',
    'PubMed PMID 39657954 (17 Mar 2025)',
    'American Journal of Hypertension',
    'https://pubmed.ncbi.nlm.nih.gov/39657954/#1',
    null,
    null,
    3,
    true,
    'pending',
    'id'
  ),

  -- ==========================================================================
  -- B. 6 ARTIKEL CONTOH DARI /prototype (BELUM MEMILIKI SUMBER RESMI)
  -- ==========================================================================
  (
    'mengenal-stage-penyakit-ginjal-kronik',
    'Mengenal stage penyakit ginjal kronik',
    'Memahami CKD',
    'Apa arti G1 hingga G5 dan mengapa hasil eGFR perlu dilihat dari waktu ke waktu.',
    '[ISI MENUNGGU SUMBER]',
    null,
    null,
    null,
    null,
    null,
    5,
    true,
    'pending',
    'id'
  ),
  (
    'cara-membaca-hasil-kreatinin-dan-egfr',
    'Cara membaca hasil kreatinin dan eGFR',
    'Hasil Lab',
    'Panduan sederhana memahami dua angka penting dalam pemantauan fungsi ginjal.',
    '[ISI MENUNGGU SUMBER]',
    null,
    null,
    null,
    null,
    null,
    4,
    true,
    'pending',
    'id'
  ),
  (
    'garam-cairan-dan-kesehatan-ginjal',
    'Garam, cairan, dan kesehatan ginjal',
    'Diet',
    'Langkah praktis mengatur asupan tanpa membuat waktu makan terasa rumit.',
    '[ISI MENUNGGU SUMBER]',
    null,
    null,
    null,
    null,
    null,
    6,
    true,
    'pending',
    'id'
  ),
  (
    'obat-nyeri-yang-perlu-diperhatikan',
    'Obat nyeri yang perlu diperhatikan',
    'Obat & NSAID',
    'Kenali obat anti-inflamasi nonsteroid dan kapan perlu bertanya kepada dokter.',
    '[ISI MENUNGGU SUMBER]',
    null,
    null,
    null,
    null,
    null,
    4,
    true,
    'pending',
    'id'
  ),
  (
    'apa-yang-dilakukan-saat-sedang-sakit',
    'Apa yang dilakukan saat sedang sakit?',
    'Sick-Day',
    'Panduan aman ketika demam, diare, muntah, atau sulit makan dan minum.',
    '[ISI MENUNGGU SUMBER]',
    null,
    null,
    null,
    null,
    null,
    5,
    true,
    'pending',
    'id'
  ),
  (
    'mengukur-tekanan-darah-di-rumah',
    'Mengukur tekanan darah di rumah',
    'Tekanan Darah',
    'Cara mendapatkan hasil yang lebih akurat dengan posisi dan waktu yang tepat.',
    '[ISI MENUNGGU SUMBER]',
    null,
    null,
    null,
    null,
    null,
    3,
    true,
    'pending',
    'id'
  )
on conflict (slug) do update set
  title = excluded.title,
  category = excluded.category,
  summary = excluded.summary,
  body = excluded.body,
  source = excluded.source,
  source_org = excluded.source_org,
  source_url = excluded.source_url,
  reviewed_at = excluded.reviewed_at,
  reviewer = excluded.reviewer,
  read_minutes = excluded.read_minutes,
  published = excluded.published,
  review_status = excluded.review_status,
  language = excluded.language;
