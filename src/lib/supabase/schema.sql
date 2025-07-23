-- ===============================================================================================
-- 1. FUNCTIONS & TRIGGERS
-- ===============================================================================================

-- Fungsi untuk mengecek apakah user adalah admin
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$;

-- Fungsi untuk membuat profil baru saat user mendaftar
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, username, avatar_url, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'display_name',
    new.raw_user_meta_data ->> 'username',
    new.raw_user_meta_data ->> 'avatar_url',
    'user' -- Default role
  );
  return new;
end;
$$;

-- Trigger yang memanggil handle_new_user saat ada user baru di auth.users
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ===============================================================================================
-- 2. TABLES
-- ===============================================================================================

-- Tabel untuk menyimpan profil pengguna, diperluas dari auth.users
create table if not exists public.profiles (
  id uuid not null primary key references auth.users(id) on delete cascade,
  display_name text,
  username text unique,
  avatar_url text,
  role text default 'user'
);

-- Tabel untuk kategori produk
create table if not exists public.categories (
    id serial primary key,
    name text not null unique
);

-- Tabel untuk subkategori produk, berelasi dengan categories
create table if not exists public.subcategories (
    id serial primary key,
    name text not null,
    category_id int not null references public.categories(id) on delete cascade
);

-- Tabel utama untuk produk
create table if not exists public.products (
    id serial primary key,
    name text not null,
    price_per_day numeric not null,
    category_id int not null references public.categories(id),
    subcategory_id int not null references public.subcategories(id),
    images text[],
    data_ai_hint text,
    description text,
    specs jsonb,
    availability text default 'Tersedia',
    object_fit text default 'cover'
);

-- Tabel untuk pengaturan situs
create table if not exists public.settings (
    id int primary key default 1,
    email text,
    phone text,
    address text,
    whatsapp_number text,
    social jsonb,
    logo_url text,
    constraint single_row check (id = 1)
);

-- Tabel untuk data analitik
create table if not exists public.analytics (
    id int primary key default 1,
    daily_visitors jsonb,
    top_products jsonb,
    weekly_summary jsonb,
    constraint single_row check (id = 1)
);

-- Tabel untuk riwayat penyewaan
create table if not exists public.rentals (
    id serial primary key,
    user_id uuid not null references public.profiles(id),
    user_name text,
    items jsonb not null,
    total numeric not null,
    status text not null,
    checkout_date timestamptz default now()
);

-- Tabel untuk log aktivitas
create table if not exists public.activity_log (
    id serial primary key,
    timestamp timestamptz default now(),
    user_name text,
    action text,
    details text
);

-- ===============================================================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ===============================================================================================

-- Aktifkan RLS untuk semua tabel
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.subcategories enable row level security;
alter table public.products enable row level security;
alter table public.settings enable row level security;
alter table public.analytics enable row level security;
alter table public.rentals enable row level security;
alter table public.activity_log enable row level security;

-- Hapus kebijakan yang ada (jika ada) untuk memastikan kebersihan
drop policy if exists "Allow public read access" on public.profiles;
drop policy if exists "Allow user to manage own profile" on public.profiles;
drop policy if exists "Allow admin to manage all profiles" on public.profiles;
drop policy if exists "Allow public read access" on public.categories;
drop policy if exists "Allow admin to manage categories" on public.categories;
drop policy if exists "Allow public read access" on public.subcategories;
drop policy if exists "Allow admin to manage subcategories" on public.subcategories;
drop policy if exists "Allow public read access" on public.products;
drop policy if exists "Allow admin to manage products" on public.products;
drop policy if exists "Allow public read access to settings" on public.settings;
drop policy if exists "Allow authenticated users to read settings" on public.settings;
drop policy if exists "Allow admin to manage settings" on public.settings;
drop policy if exists "Allow admin read access" on public.analytics;
drop policy if exists "Allow user to view own rentals" on public.rentals;
drop policy if exists "Allow admin to manage rentals" on public.rentals;
drop policy if exists "Allow admin access to logs" on public.activity_log;

-- Kebijakan untuk 'profiles'
create policy "Allow public read access" on public.profiles for select using (true);
create policy "Allow user to manage own profile" on public.profiles for update using (auth.uid() = id);
create policy "Allow admin to manage all profiles" on public.profiles for all using (public.is_admin());

-- Kebijakan untuk 'categories'
create policy "Allow public read access" on public.categories for select using (true);
create policy "Allow admin to manage categories" on public.categories for all using (public.is_admin());

-- Kebijakan untuk 'subcategories'
create policy "Allow public read access" on public.subcategories for select using (true);
create policy "Allow admin to manage subcategories" on public.subcategories for all using (public.is_admin());

-- Kebijakan untuk 'products'
create policy "Allow public read access" on public.products for select using (true);
create policy "Allow admin to manage products" on public.products for all using (public.is_admin());

-- Kebijakan untuk 'settings'
-- SIAPA SAJA boleh membaca pengaturan situs, ini penting untuk footer, dll.
create policy "Allow public read access to settings" on public.settings for select using (true);
-- HANYA ADMIN yang bisa mengubah pengaturan.
create policy "Allow admin to manage settings" on public.settings for all using (public.is_admin());

-- Kebijakan untuk 'analytics'
create policy "Allow admin read access" on public.analytics for select using (public.is_admin());

-- Kebijakan untuk 'rentals'
create policy "Allow user to view own rentals" on public.rentals for select using (auth.uid() = user_id);
create policy "Allow admin to manage rentals" on public.rentals for all using (public.is_admin());

-- Kebijakan untuk 'activity_log'
create policy "Allow admin access to logs" on public.activity_log for all using (public.is_admin());
