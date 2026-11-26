import Link from "next/link";
import { ArrowLeft, BookX } from "lucide-react";
import { Card } from "@/components/Card";

export default function ArtikelNotFoundPage() {
  return (
    <div className="page article-page">
      <Card className="empty-state">
        <div className="empty-lab-icon" aria-hidden="true">
          <BookX size={26} />
        </div>
        <h2>Artikel edukasi tidak ditemukan</h2>
        <p className="empty-lab-desc">
          Artikel yang Anda cari mungkin belum dipublikasikan, tautannya sudah
          berubah, atau alamat yang dimasukkan tidak sesuai.
        </p>
        <div className="empty-state-actions">
          <Link href="/edukasi" className="btn-primary">
            <ArrowLeft size={16} aria-hidden="true" /> Kembali ke daftar edukasi
          </Link>
        </div>
      </Card>
    </div>
  );
}
