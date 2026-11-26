import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ExternalLink, Info } from "lucide-react";
import { Alert } from "@/components/Alert";
import {
  formatArticleReviewDate,
  getReviewStatusMeta,
  normalizeArticleRow,
  splitArticleParagraphs,
  type RawArticleInput,
} from "@/lib/education/articles";
import { createClient } from "@/lib/supabase/server";

interface ArtikelDetailPageProps {
  params: Promise<{ slug: string }>;
}

function ArticleDetailFallback() {
  return (
    <div className="page article-page">
      <div className="skeleton-block skeleton-bar" />
      <div className="skeleton-block skeleton-chart" />
    </div>
  );
}

async function ArticleDetailContent({ params }: ArtikelDetailPageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).trim();

  if (!decodedSlug) {
    notFound();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", decodedSlug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    return (
      <div className="page article-page">
        <Link href="/edukasi" className="back-link">
          ← Kembali ke edukasi
        </Link>
        <Alert
          variant="critical"
          title="Gagal memuat artikel"
          description="Terjadi kendala saat mengambil isi artikel dari server. Silakan coba beberapa saat lagi."
        />
      </div>
    );
  }

  const article = data
    ? normalizeArticleRow(data as RawArticleInput)
    : null;

  if (!article) {
    notFound();
  }

  const reviewMeta = getReviewStatusMeta(article.reviewStatus);
  const paragraphs = splitArticleParagraphs(article.body);
  const formattedReviewDate = formatArticleReviewDate(article.reviewedAt);
  const sourceLabel = article.sourceOrg ?? article.source;
  const hasSourceInfo = Boolean(sourceLabel || article.sourceUrl);
  const hasMetadata = Boolean(
    hasSourceInfo || formattedReviewDate || article.reviewer,
  );

  return (
    <div className="page article-page">
      <Link href="/edukasi" className="back-link">
        ← Kembali ke edukasi
      </Link>

      <article>
        <div className="article-detail-top">
          <span className="article-cat">{article.category}</span>
          <span
            className={`review-badge ${
              reviewMeta.isVerified ? "verified" : "pending"
            }`}
          >
            {reviewMeta.label}
          </span>
        </div>

        <h2>{article.title}</h2>
        {article.summary && <p className="lead">{article.summary}</p>}

        {!reviewMeta.isVerified && (
          <div className="article-review-alert">
            <Alert
              variant="warning"
              title="Artikel ini belum ditinjau tenaga kesehatan"
              description="Ringkasan ini disusun dari sumber rujukan yang tercantum dan masih menunggu peninjauan oleh tenaga kesehatan. Jangan gunakan sebagai dasar mengubah obat atau dosis tanpa arahan dokter."
            />
          </div>
        )}

        {hasMetadata && (
          <div className="article-meta">
            {hasSourceInfo && (
              <span>
                Sumber{" "}
                <b>
                  {article.sourceUrl ? (
                    <a
                      href={article.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="article-source-link"
                    >
                      {sourceLabel ?? "Buka sumber resmi"}
                      <ExternalLink size={13} aria-hidden="true" />
                    </a>
                  ) : (
                    sourceLabel
                  )}
                </b>
              </span>
            )}

            {formattedReviewDate && (
              <span>
                Tinjau terakhir <b>{formattedReviewDate}</b>
              </span>
            )}

            {article.reviewer && (
              <span>
                Peninjau <b>{article.reviewer}</b>
              </span>
            )}
          </div>
        )}

        {paragraphs.length > 0 ? (
          paragraphs.map((paragraph, idx) => <p key={idx}>{paragraph}</p>)
        ) : (
          <p>
            Isi artikel lengkap belum tersedia pada ringkasan ini. Anda dapat
            membuka tautan sumber resmi di atas bila tersedia untuk membaca
            materi aslinya.
          </p>
        )}

        <div className="article-note">
          <Info size={18} aria-hidden="true" />
          <p>
            Informasi ini bersifat umum dan bukan pengganti konsultasi dokter.
          </p>
        </div>
      </article>
    </div>
  );
}

export default function ArtikelDetailPage(props: ArtikelDetailPageProps) {
  return (
    <Suspense fallback={<ArticleDetailFallback />}>
      <ArticleDetailContent {...props} />
    </Suspense>
  );
}
