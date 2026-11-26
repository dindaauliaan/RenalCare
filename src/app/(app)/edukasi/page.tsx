import Link from "next/link";
import { Suspense } from "react";
import {
  BookOpen,
  ChevronRight,
  FlaskConical,
  SearchX,
} from "lucide-react";
import { Alert } from "@/components/Alert";
import { Card } from "@/components/Card";
import { EducationFilters } from "@/components/EducationFilters";
import { PageTitle } from "@/components/PageTitle";
import {
  extractCategories,
  filterArticles,
  getReviewStatusMeta,
  normalizeArticles,
  type RawArticleInput,
} from "@/lib/education/articles";
import { createClient } from "@/lib/supabase/server";

interface EdukasiPageProps {
  searchParams: Promise<{
    q?: string | string[];
    kategori?: string | string[];
  }>;
}

function getSingleParam(value: string | string[] | undefined): string {
  if (typeof value === "string") {
    return value.trim();
  }
  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0].trim();
  }
  return "";
}

function EdukasiLoadingFallback() {
  return (
    <div className="page">
      <PageTitle
        title="Edukasi"
        subtitle="Informasi tepercaya untuk membantu Anda memahami kesehatan ginjal."
      />
      <div className="skeleton-block skeleton-bar" />
      <div className="skeleton-block skeleton-chart" />
    </div>
  );
}

async function EdukasiContent({ searchParams }: EdukasiPageProps) {
  const resolvedParams = await searchParams;
  const query = getSingleParam(resolvedParams.q);
  const activeCategory = getSingleParam(resolvedParams.kategori);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("published", true)
    .order("title", { ascending: true });

  const articles = data ? normalizeArticles(data as RawArticleInput[]) : [];
  const categories = extractCategories(articles);
  const filteredArticles = filterArticles(articles, {
    q: query,
    category: activeCategory,
  });
  const hasActiveFilter = query.length > 0 || activeCategory.length > 0;

  return (
    <div className="page">
      <PageTitle
        title="Edukasi"
        subtitle="Informasi tepercaya untuk membantu Anda memahami kesehatan ginjal."
      />

      {error ? (
        <Alert
          variant="critical"
          title="Gagal memuat daftar artikel"
          description="Terjadi kendala saat mengambil data edukasi dari server. Silakan muat ulang halaman beberapa saat lagi."
        />
      ) : (
        <>
          <EducationFilters
            key={query}
            categories={categories}
            initialQuery={query}
            activeCategory={activeCategory}
          />

          {articles.length === 0 ? (
            <Card className="empty-state">
              <div className="empty-lab-icon" aria-hidden="true">
                <BookOpen size={24} />
              </div>
              <h3>Belum ada artikel tersedia</h3>
              <p className="empty-lab-desc">
                Artikel edukasi yang sudah diterbitkan akan muncul di halaman
                ini setelah data tersedia di sistem.
              </p>
            </Card>
          ) : filteredArticles.length === 0 ? (
            <Card className="empty-state">
              <div className="empty-lab-icon" aria-hidden="true">
                <SearchX size={24} />
              </div>
              <h3>Tidak ada artikel yang cocok</h3>
              <p className="empty-lab-desc">
                {hasActiveFilter
                  ? "Coba ubah kata kunci pencarian atau pilih kategori lain agar topik yang Anda cari muncul."
                  : "Belum ada artikel pada filter yang dipilih."}
              </p>
              {hasActiveFilter && (
                <div className="empty-state-actions">
                  <Link href="/edukasi" className="btn-outline">
                    Tampilkan semua artikel
                  </Link>
                </div>
              )}
            </Card>
          ) : (
            <div className="article-grid">
              {filteredArticles.map((article, index) => {
                const reviewMeta = getReviewStatusMeta(article.reviewStatus);
                return (
                  <Link
                    key={article.id}
                    href={`/edukasi/${encodeURIComponent(article.slug)}`}
                    className="article-card"
                  >
                    <div className={`article-visual visual-${index % 6}`}>
                      {index % 2 === 1 ? (
                        <FlaskConical size={30} strokeWidth={1.8} />
                      ) : (
                        <BookOpen size={30} strokeWidth={1.8} />
                      )}
                      <span>{article.category}</span>
                    </div>
                    <div className="article-body">
                      <div className="article-card-meta-row">
                        {article.readMinutes !== null ? (
                          <small>{article.readMinutes} menit baca</small>
                        ) : (
                          <span />
                        )}
                        <span
                          className={`review-badge ${
                            reviewMeta.isVerified ? "verified" : "pending"
                          }`}
                        >
                          {reviewMeta.label}
                        </span>
                      </div>
                      <h3>{article.title}</h3>
                      {article.summary && <p>{article.summary}</p>}
                      {article.sourceOrg && (
                        <small className="article-source-text">
                          Sumber: {article.sourceOrg}
                        </small>
                      )}
                      <span className="read-link">
                        Baca artikel{" "}
                        <ChevronRight size={17} aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function EdukasiPage(props: EdukasiPageProps) {
  return (
    <Suspense fallback={<EdukasiLoadingFallback />}>
      <EdukasiContent {...props} />
    </Suspense>
  );
}
