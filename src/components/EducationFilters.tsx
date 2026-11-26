"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { buildEducationHref } from "@/lib/education/articles";

interface EducationFiltersProps {
  categories: string[];
  initialQuery: string;
  activeCategory: string;
}

export function EducationFilters({
  categories,
  initialQuery,
  activeCategory,
}: EducationFiltersProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  function navigateWith(nextQuery: string, nextCategory: string) {
    router.push(
      buildEducationHref({
        q: nextQuery,
        category: nextCategory === "Semua" ? undefined : nextCategory,
      }),
    );
  }

  function handleQueryChange(nextValue: string) {
    setQuery(nextValue);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      navigateWith(nextValue, activeCategory || "Semua");
    }, 250);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    navigateWith(query, activeCategory || "Semua");
  }

  function handleClearQuery() {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    setQuery("");
    navigateWith("", activeCategory || "Semua");
  }

  function handleSelectCategory(category: string) {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    navigateWith(query, category);
  }

  const allCategories = ["Semua", ...categories];

  return (
    <>
      <form
        className="search-box"
        role="search"
        aria-label="Cari artikel edukasi"
        onSubmit={handleSubmit}
      >
        <Search size={18} aria-hidden="true" />
        <input
          type="text"
          name="q"
          placeholder="Cari topik, misalnya eGFR atau obat..."
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
          aria-label="Cari judul artikel"
        />
        {query.trim().length > 0 && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={handleClearQuery}
            aria-label="Hapus kata kunci pencarian"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </form>

      <div className="chips" role="navigation" aria-label="Filter kategori artikel">
        {allCategories.map((category) => {
          const isAll = category === "Semua";
          const isActive = isAll
            ? !activeCategory || activeCategory === "Semua"
            : activeCategory === category;

          return (
            <button
              key={category}
              type="button"
              className={isActive ? "active" : ""}
              onClick={() => handleSelectCategory(category)}
              aria-pressed={isActive}
            >
              {category}
            </button>
          );
        })}
      </div>
    </>
  );
}
