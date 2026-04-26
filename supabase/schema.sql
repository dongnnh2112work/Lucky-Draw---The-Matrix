-- Supabase/Postgres schema for multi-brand, multi-version sites
-- Goal:
-- 1) Keep global structure (header/footer/section slots) synchronized
-- 2) Allow each brand to have multiple versions with different content/theme

create extension if not exists "pgcrypto";

-- ---------- Enums ----------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'publish_status') then
    create type publish_status as enum ('draft', 'published', 'archived');
  end if;
end $$;

-- ---------- Core tenant layer ----------
create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,       -- short id, eg: "howl", "matrix"
  name text not null,
  domain text,                     -- optional custom domain
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- A reusable structure map used by many brands
create table if not exists public.layout_templates (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,       -- eg: "landing-v1", "event-v2"
  name text not null,
  description text,
  version int not null default 1,  -- structure revision
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Slot definitions inside a layout template (order is fixed)
create table if not exists public.layout_slots (
  id uuid primary key default gen_random_uuid(),
  layout_template_id uuid not null references public.layout_templates(id) on delete cascade,
  slot_key text not null,          -- eg: "header", "hero", "features", "footer"
  slot_type text not null,         -- eg: "header", "section", "footer"
  position int not null,           -- render order
  required boolean not null default true,
  config jsonb not null default '{}'::jsonb, -- optional static rules for this slot
  created_at timestamptz not null default now(),
  unique (layout_template_id, slot_key),
  unique (layout_template_id, position)
);

-- ---------- Brand release layer ----------
create table if not exists public.brand_versions (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  layout_template_id uuid not null references public.layout_templates(id),
  version_label text not null,     -- eg: "v1", "tet-2026", "summer-campaign"
  status publish_status not null default 'draft',
  starts_at timestamptz,
  ends_at timestamptz,
  theme_tokens jsonb not null default '{}'::jsonb, -- brand colors/fonts/spacing override
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  unique (brand_id, version_label)
);

-- Content for each slot in a given brand version
create table if not exists public.brand_slot_content (
  id uuid primary key default gen_random_uuid(),
  brand_version_id uuid not null references public.brand_versions(id) on delete cascade,
  layout_slot_id uuid not null references public.layout_slots(id) on delete cascade,
  is_enabled boolean not null default true,
  content jsonb not null default '{}'::jsonb, -- copy blocks, image urls, CTA, etc.
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (brand_version_id, layout_slot_id)
);

-- Optional: localization per slot content (if you need vi/en/etc)
create table if not exists public.brand_slot_translations (
  id uuid primary key default gen_random_uuid(),
  brand_slot_content_id uuid not null references public.brand_slot_content(id) on delete cascade,
  locale text not null,            -- eg: "vi", "en", "th"
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (brand_slot_content_id, locale)
);

-- ---------- Operational indexes ----------
create index if not exists idx_brand_versions_brand_status
  on public.brand_versions (brand_id, status);

create index if not exists idx_brand_versions_schedule
  on public.brand_versions (starts_at, ends_at);

create index if not exists idx_layout_slots_layout_position
  on public.layout_slots (layout_template_id, position);

create index if not exists idx_brand_slot_content_version
  on public.brand_slot_content (brand_version_id);

-- ---------- Utility trigger for updated_at ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_brands_updated_at on public.brands;
create trigger trg_brands_updated_at
before update on public.brands
for each row execute function public.set_updated_at();

drop trigger if exists trg_layout_templates_updated_at on public.layout_templates;
create trigger trg_layout_templates_updated_at
before update on public.layout_templates
for each row execute function public.set_updated_at();

drop trigger if exists trg_brand_versions_updated_at on public.brand_versions;
create trigger trg_brand_versions_updated_at
before update on public.brand_versions
for each row execute function public.set_updated_at();

drop trigger if exists trg_brand_slot_content_updated_at on public.brand_slot_content;
create trigger trg_brand_slot_content_updated_at
before update on public.brand_slot_content
for each row execute function public.set_updated_at();

drop trigger if exists trg_brand_slot_translations_updated_at on public.brand_slot_translations;
create trigger trg_brand_slot_translations_updated_at
before update on public.brand_slot_translations
for each row execute function public.set_updated_at();

-- ---------- Helpful view for frontend ----------
create or replace view public.v_active_brand_version as
select
  bv.*
from public.brand_versions bv
where bv.status = 'published'
  and (bv.starts_at is null or bv.starts_at <= now())
  and (bv.ends_at is null or bv.ends_at > now());

-- ---------- Optional RLS baseline ----------
-- Keep commented if you are not ready for auth yet.
-- alter table public.brands enable row level security;
-- alter table public.layout_templates enable row level security;
-- alter table public.layout_slots enable row level security;
-- alter table public.brand_versions enable row level security;
-- alter table public.brand_slot_content enable row level security;
-- alter table public.brand_slot_translations enable row level security;

