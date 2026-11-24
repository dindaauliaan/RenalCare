import Link from "next/link";
import { notFound } from "next/navigation";
import { Info } from "lucide-react";
import { DUMMY_ARTICLES } from "@/lib/dummy-data";

export function generateStaticParams() {
  return DUMMY_ARTICLES.map((article) => ({ slug: article.slug }));
}

export default async function ArtikelDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = DUMMY_ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="page article-page">
      <Link href="/edukasi" className="back-link">
        ← Kembali ke edukasi
      </Link>
      <article>
        <span className="article-cat">{article.cat}</span>
        <h2>{article.title}</h2>
        <p className="lead">{article.desc}</p>

        <div className="article-meta">
          <span>
            Sumber <b>{article.source}</b>
          </span>
          <span>
            Tinjau terakhir <b>{article.reviewedAt}</b>
          </span>
          <span>
            Peninjau <b>{article.reviewer}</b>
          </span>
        </div>

        <h3>Mengapa ini penting?</h3>
        <p>{article.whyImportant}</p>

        <h3>Hal yang dapat Anda lakukan</h3>
        <ul>
          {article.actionItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <div className="article-note">
          <Info size={20} strokeWidth={1.8} />
          <p>
            Informasi ini bersifat umum. Kondisi setiap orang berbeda; konsultasikan dengan dokter
            yang merawat Anda.
          </p>
        </div>
      </article>
    </div>
  );
}
