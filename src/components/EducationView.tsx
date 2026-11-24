"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookOpen, ChevronRight, FlaskConical, Search } from "lucide-react";
import { PageTitle } from "@/components/PageTitle";
import { DUMMY_ARTICLES, DUMMY_EDUCATION_CATEGORIES } from "@/lib/dummy-data";

export function EducationView() {
  const [cat, setCat] = useState<string>("Semua");
  const [query, setQuery] = useState("");

  const shown = useMemo(
    () =>
      DUMMY_ARTICLES.filter(
        (a) =>
          (cat === "Semua" || a.cat === cat) &&
          a.title.toLowerCase().includes(query.toLowerCase())
      ),
    [cat, query]
  );

  return (
    <div className="page">
      <PageTitle
        title="Edukasi"
        subtitle="Informasi tepercaya untuk membantu Anda memahami kesehatan ginjal."
      />

      <div className="search-box">
        <Search size={22} strokeWidth={1.8} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari topik, misalnya eGFR atau obat..."
          aria-label="Cari artikel edukasi"
        />
      </div>

      <div className="chips">
        {DUMMY_EDUCATION_CATEGORIES.map((x) => (
          <button
            type="button"
            onClick={() => setCat(x)}
            className={cat === x ? "active" : ""}
            key={x}
          >
            {x}
          </button>
        ))}
      </div>

      <div className="article-grid">
        {shown.map((a, i) => (
          <Link className="article-card" key={a.slug} href={`/edukasi/${a.slug}`}>
            <div className={`article-visual visual-${i}`}>
              {i % 2 ? (
                <FlaskConical size={30} strokeWidth={1.8} />
              ) : (
                <BookOpen size={30} strokeWidth={1.8} />
              )}
              <span>{a.cat}</span>
            </div>
            <div className="article-body">
              <small>{a.time} baca</small>
              <h3>{a.title}</h3>
              <p>{a.desc}</p>
              <span className="read-link">
                Baca artikel <ChevronRight size={17} strokeWidth={1.8} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
