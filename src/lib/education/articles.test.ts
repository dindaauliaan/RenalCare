import { describe, expect, it } from "vitest";
import {
  buildEducationHref,
  extractCategories,
  filterArticles,
  formatArticleReviewDate,
  getReviewStatusMeta,
  getSafeExternalUrl,
  normalizeArticleRow,
  normalizeArticles,
  splitArticleParagraphs,
  type RawArticleInput,
} from "./articles";

const SAMPLE_ROWS: RawArticleInput[] = [
  {
    id: "1",
    slug: "memahami-egfr",
    title: "Memahami eGFR dan Tahapan Penyakit Ginjal",
    category: "Dasar Ginjal",
    summary: "Penjelasan ringkas arti angka eGFR.",
    body: "Paragraf pertama.\n\nParagraf kedua.",
    source: "NKF",
    source_org: "National Kidney Foundation",
    source_url: "https://www.kidney.org/atoz/content/gfr",
    reviewed_at: "2026-03-01",
    reviewer: "dr. Rina",
    read_minutes: 4,
    published: true,
    review_status: "verified",
    language: "id",
  },
  {
    id: "2",
    slug: "natrium-harian-ckd",
    title: "Mengatur Asupan Natrium Harian",
    category: "Pola Makan",
    summary: "Panduan batas garam untuk ginjal.",
    body: "Batasi garam tambahan.",
    source: null,
    source_org: "Kemenkes RI",
    source_url: "https://ayosehat.kemkes.go.id/contoh",
    reviewed_at: null,
    reviewer: null,
    read_minutes: 3,
    published: true,
    review_status: "pending",
    language: "id",
  },
  {
    id: "3",
    slug: "draf-belum-terbit",
    title: "Artikel Draf Internal",
    category: "Obat & Ginjal",
    summary: "Tidak boleh tampil.",
    body: null,
    source: null,
    source_org: null,
    source_url: null,
    reviewed_at: null,
    reviewer: null,
    read_minutes: 2,
    published: false,
    review_status: "pending",
    language: "id",
  },
  {
    id: "4",
    slug: "tanpa-kolom-migrasi",
    title: "Kontrol Tekanan Darah pada CKD",
    category: "Tekanan Darah",
    summary: "Menjaga tekanan darah tetap stabil.",
    body: "Teks isi artikel.",
    source: "PERNEFRI",
    source_url: "javascript:alert(1)",
    reviewed_at: null,
    reviewer: null,
    read_minutes: null,
    published: true,
  },
];

describe("normalizeArticles", () => {
  it("hanya mempertahankan artikel published=true dengan slug valid dan menormalkan fallback", () => {
    const articles = normalizeArticles(SAMPLE_ROWS);
    expect(articles).toHaveLength(3);
    expect(articles.map((a) => a.slug)).toEqual([
      "memahami-egfr",
      "natrium-harian-ckd",
      "tanpa-kolom-migrasi",
    ]);
    expect(articles[2].reviewStatus).toBe("pending");
    expect(articles[2].sourceOrg).toBeNull();
    expect(articles[2].sourceUrl).toBeNull();
  });

  it("mengabaikan baris dengan slug kosong", () => {
    const normalized = normalizeArticleRow({
      ...SAMPLE_ROWS[0],
      slug: "   ",
    });
    expect(normalized).toBeNull();
  });
});

describe("filterArticles & extractCategories", () => {
  const articles = normalizeArticles(SAMPLE_ROWS);

  it("mengambil kategori unik terurut alfabet Indonesia", () => {
    expect(extractCategories(articles)).toEqual([
      "Dasar Ginjal",
      "Pola Makan",
      "Tekanan Darah",
    ]);
  });

  it("menyaring berdasarkan pencarian judul (?q=)", () => {
    const filtered = filterArticles(articles, { q: "egfr" });
    expect(filtered.map((a) => a.slug)).toEqual(["memahami-egfr"]);
  });

  it("menyaring berdasarkan kategori (?kategori=)", () => {
    const filtered = filterArticles(articles, { category: "Pola Makan" });
    expect(filtered.map((a) => a.slug)).toEqual(["natrium-harian-ckd"]);
  });

  it("mengombinasikan pencarian judul dan kategori secara bersamaan", () => {
    const match = filterArticles(articles, {
      q: "natrium",
      category: "Pola Makan",
    });
    expect(match.map((a) => a.slug)).toEqual(["natrium-harian-ckd"]);

    const mismatch = filterArticles(articles, {
      q: "natrium",
      category: "Dasar Ginjal",
    });
    expect(mismatch).toHaveLength(0);
  });

  it("mengabaikan kategori 'Semua' dan spasi berlebih", () => {
    const filtered = filterArticles(articles, {
      q: "   ",
      category: "Semua",
    });
    expect(filtered).toHaveLength(3);
  });
});

describe("buildEducationHref & helpers", () => {
  it("membentuk query string kombinasi q dan kategori", () => {
    expect(buildEducationHref({})).toBe("/edukasi");
    expect(buildEducationHref({ q: "egfr", category: "Semua" })).toBe(
      "/edukasi?q=egfr",
    );
    expect(buildEducationHref({ q: "garam", category: "Pola Makan" })).toBe(
      "/edukasi?q=garam&kategori=Pola+Makan",
    );
  });

  it("hanya mengizinkan URL http/https pada getSafeExternalUrl", () => {
    expect(getSafeExternalUrl("https://www.kidney.org/atoz")).toBe(
      "https://www.kidney.org/atoz",
    );
    expect(getSafeExternalUrl("http://kemkes.go.id")).toBe(
      "http://kemkes.go.id/",
    );
    expect(getSafeExternalUrl("javascript:alert(1)")).toBeNull();
    expect(getSafeExternalUrl("data:text/html,<script>")).toBeNull();
    expect(getSafeExternalUrl("bukan-url")).toBeNull();
  });

  it("memecah paragraf artikel dengan aman sebagai teks biasa", () => {
    expect(splitArticleParagraphs("Satu\n\nDua\r\n\r\n Tiga ")).toEqual([
      "Satu",
      "Dua",
      "Tiga",
    ]);
    expect(splitArticleParagraphs(null)).toEqual([]);
  });

  it("memformat tanggal tinjau dan label status tinjauan", () => {
    expect(formatArticleReviewDate("2026-03-01")).toBe("1 Maret 2026");
    expect(formatArticleReviewDate("tidak-valid")).toBe("tidak-valid");
    expect(getReviewStatusMeta("pending")).toEqual({
      label: "Belum ditinjau tenaga kesehatan",
      isVerified: false,
    });
    expect(getReviewStatusMeta("verified")).toEqual({
      label: "Telah ditinjau",
      isVerified: true,
    });
  });
});
