-- ============================================================================
-- RenalCare – Migrasi 0002: Status Tinjauan & Metadata Sumber Artikel Edukasi
-- ============================================================================

alter table public.articles
  add column if not exists review_status text not null default 'pending'
    check (review_status in ('pending', 'verified')),
  add column if not exists source_org text,
  add column if not exists language text default 'id';
