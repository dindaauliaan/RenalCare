import type { Database } from "@/types/database";

export type ArticleTableRow = Database["public"]["Tables"]["articles"]["Row"];

export type RawArticleInput = Omit<
  ArticleTableRow,
  "review_status" | "source_org" | "language"
> & {
  review_status?: "pending" | "verified" | string | null;
  source_org?: string | null;
  language?: string | null;
};

export interface EducationArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string | null;
  body: string | null;
  source: string | null;
  sourceOrg: string | null;
  sourceUrl: string | null;
  reviewedAt: string | null;
  reviewer: string | null;
  readMinutes: number | null;
  published: boolean;
  reviewStatus: "pending" | "verified";
  language: string;
}

export interface ArticleFilterParams {
  q?: string | null;
  category?: string | null;
}

export interface ReviewStatusMeta {
  label: string;
  isVerified: boolean;
}

export function normalizeArticleRow(
  row: RawArticleInput,
): EducationArticle | null {
  const slug = typeof row.slug === "string" ? row.slug.trim() : "";
  if (!slug || row.published !== true) {
    return null;
  }

  const reviewStatus: "pending" | "verified" =
    row.review_status === "verified" ? "verified" : "pending";

  const category =
    typeof row.category === "string" && row.category.trim().length > 0
      ? row.category.trim()
      : "Umum";

  const sourceOrg =
    typeof row.source_org === "string" && row.source_org.trim().length > 0
      ? row.source_org.trim()
      : null;

  const source =
    typeof row.source === "string" && row.source.trim().length > 0
      ? row.source.trim()
      : null;

  return {
    id: row.id,
    slug,
    title: row.title.trim(),
    category,
    summary:
      typeof row.summary === "string" && row.summary.trim().length > 0
        ? row.summary.trim()
        : null,
    body:
      typeof row.body === "string" && row.body.trim().length > 0
        ? row.body.trim()
        : null,
    source,
    sourceOrg,
    sourceUrl: getSafeExternalUrl(row.source_url),
    reviewedAt:
      typeof row.reviewed_at === "string" && row.reviewed_at.trim().length > 0
        ? row.reviewed_at.trim()
        : null,
    reviewer:
      typeof row.reviewer === "string" && row.reviewer.trim().length > 0
        ? row.reviewer.trim()
        : null,
    readMinutes:
      typeof row.read_minutes === "number" && Number.isFinite(row.read_minutes)
        ? row.read_minutes
        : null,
    published: true,
    reviewStatus,
    language:
      typeof row.language === "string" && row.language.trim().length > 0
        ? row.language.trim()
        : "id",
  };
}

export function normalizeArticles(rows: RawArticleInput[]): EducationArticle[] {
  const result: EducationArticle[] = [];
  for (const row of rows) {
    const normalized = normalizeArticleRow(row);
    if (normalized) {
      result.push(normalized);
    }
  }
  return result;
}

export function extractCategories(articles: EducationArticle[]): string[] {
  const seen = new Set<string>();
  const categories: string[] = [];

  for (const article of articles) {
    if (!seen.has(article.category)) {
      seen.add(article.category);
      categories.push(article.category);
    }
  }

  return categories.sort((a, b) => a.localeCompare(b, "id"));
}

export function filterArticles(
  articles: EducationArticle[],
  params: ArticleFilterParams,
): EducationArticle[] {
  const q = typeof params.q === "string" ? params.q.trim().toLowerCase() : "";
  const category =
    typeof params.category === "string" ? params.category.trim() : "";
  const activeCategory = category && category !== "Semua" ? category : "";

  return articles.filter((article) => {
    const matchesCategory =
      !activeCategory || article.category === activeCategory;
    const matchesQuery = !q || article.title.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });
}

export function buildEducationHref(params: ArticleFilterParams): string {
  const search = new URLSearchParams();
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const category =
    typeof params.category === "string" ? params.category.trim() : "";

  if (q) {
    search.set("q", q);
  }
  if (category && category !== "Semua") {
    search.set("kategori", category);
  }

  const queryString = search.toString();
  return queryString ? `/edukasi?${queryString}` : "/edukasi";
}

export function getSafeExternalUrl(url: string | null | undefined): string | null {
  if (typeof url !== "string") {
    return null;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.href;
    }
    return null;
  } catch {
    return null;
  }
}

export function splitArticleParagraphs(body: string | null | undefined): string[] {
  if (typeof body !== "string") {
    return [];
  }

  return body
    .split(/\r?\n\s*\r?\n/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

export function formatArticleReviewDate(dateStr: string | null | undefined): string | null {
  if (typeof dateStr !== "string") {
    return null;
  }

  const trimmed = dateStr.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return trimmed;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

export function getReviewStatusMeta(
  status: "pending" | "verified",
): ReviewStatusMeta {
  if (status === "verified") {
    return {
      label: "Telah ditinjau",
      isVerified: true,
    };
  }

  return {
    label: "Belum ditinjau tenaga kesehatan",
    isVerified: false,
  };
}
