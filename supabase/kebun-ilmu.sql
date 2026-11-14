-- =====================================================================
--  Kebun Ilmu · skema database untuk Supabase
--  Jalankan sekali di Supabase: SQL Editor → New query → tempel → Run
--  Peran: pemilik (pengelola), guru (wali kelas), ortu (orang tua)
-- =====================================================================

-- ---------- Tabel ----------
create table if not exists public.profil (
  id      uuid primary key references auth.users(id) on delete cascade,
  email   text not null,
  nama    text,
  peran   text not null default 'ortu' check (peran in ('pemilik','guru','ortu')),
  dibuat  timestamptz not null default now()
);

create table if not exists public.kelas (
  id       uuid primary key default gen_random_uuid(),
  nama     text not null,
  jenjang  int  not null default 1 check (jenjang between 0 and 6),   -- 0 = TK
  kode     text not null unique default upper(substr(replace(gen_random_uuid()::text,'-',''),1,6)),
  dibuat   timestamptz not null default now()
);

create table if not exists public.guru_kelas (
  guru_id  uuid not null references public.profil(id) on delete cascade,
  kelas_id uuid not null references public.kelas(id)  on delete cascade,
  primary key (guru_id, kelas_id)
);

create table if not exists public.undangan_guru (
  email    text primary key,
  nama     text,
  kelas_id uuid[] not null default '{}',
  dibuat   timestamptz not null default now()
);

create table if not exists public.anak (
  id          uuid primary key default gen_random_uuid(),
  ortu_id     uuid not null references public.profil(id) on delete cascade,
  nama        text not null,
  usia        int,
  jk          text check (jk in ('L','P')),
  kelas_id    uuid references public.kelas(id) on delete set null,
  data        jsonb not null default '{}'::jsonb,     -- salinan progres dari aplikasi
  diperbarui  timestamptz not null default now(),
  dibuat      timestamptz not null default now()
);
create index if not exists anak_kelas_idx on public.anak(kelas_id);
create index if not exists anak_ortu_idx  on public.anak(ortu_id);

create table if not exists public.hasil (
  id         bigint generated always as identity primary key,
  anak_id    uuid not null references public.anak(id) on delete cascade,
  modul      text not null,
  level      int,
  tantangan  text,
  benar      int not null default 0,
  jumlah     int not null default 0,
  bintang    int not null default 0,
  waktu      timestamptz not null default now()
);
create index if not exists hasil_anak_waktu_idx on public.hasil(anak_id, waktu desc);

-- ---------- Fungsi bantu (dipakai aturan akses) ----------
create or replace function public.peran_saya() returns text
language sql stable security definer set search_path = public as
$$ select peran from public.profil where id = auth.uid() $$;

create or replace function public.kelas_saya() returns setof uuid
language sql stable security definer set search_path = public as
$$ select kelas_id from public.guru_kelas where guru_id = auth.uid() $$;

create or replace function public.anak_terlihat() returns setof uuid
language sql stable security definer set search_path = public as
$$ select a.id from public.anak a
   where a.ortu_id = auth.uid()
      or public.peran_saya() = 'pemilik'
      or a.kelas_id in (select public.kelas_saya()) $$;

-- ---------- Akun baru: buat profil, terapkan undangan guru ----------
create or replace function public.akun_baru() returns trigger
language plpgsql security definer set search_path = public as $$
declare u public.undangan_guru;
begin
  insert into public.profil(id, email, nama)
  values (new.id, lower(new.email), coalesce(new.raw_user_meta_data->>'nama', ''))
  on conflict (id) do nothing;
  select * into u from public.undangan_guru where email = lower(new.email);
  if found then
    update public.profil set peran = 'guru', nama = coalesce(nullif(u.nama,''), nama) where id = new.id;
    insert into public.guru_kelas(guru_id, kelas_id) select new.id, k from unnest(u.kelas_id) k
      where exists (select 1 from public.kelas where id = k) on conflict do nothing;
    delete from public.undangan_guru where email = lower(new.email);
  end if;
  return new;
end $$;
drop trigger if exists akun_baru_trg on auth.users;
create trigger akun_baru_trg after insert on auth.users for each row execute function public.akun_baru();

-- Peran hanya bisa diubah pemilik
create or replace function public.jaga_profil() returns trigger
language plpgsql security invoker set search_path = public as $$
begin
  if new.peran is distinct from old.peran and coalesce(public.peran_saya(),'') <> 'pemilik'
     and current_user not in ('postgres','supabase_admin','service_role') then
    raise exception 'Hanya pemilik yang boleh mengubah peran';
  end if;
  new.email := old.email;
  return new;
end $$;
drop trigger if exists jaga_profil_trg on public.profil;
create trigger jaga_profil_trg before update on public.profil for each row execute function public.jaga_profil();

-- Orang tua tidak bisa memasukkan anak ke kelas tanpa kode (lewat gabung_kelas)
create or replace function public.jaga_anak() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if coalesce(public.peran_saya(),'') = 'pemilik' or current_setting('kebun.gabung', true) = '1' then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.kelas_id := null;
  elsif new.kelas_id is distinct from old.kelas_id and new.kelas_id is not null then
    raise exception 'Gunakan kode kelas untuk bergabung';
  end if;
  if tg_op = 'UPDATE' then new.ortu_id := old.ortu_id; end if;
  return new;
end $$;
drop trigger if exists jaga_anak_trg on public.anak;
create trigger jaga_anak_trg before insert or update on public.anak for each row execute function public.jaga_anak();

-- ---------- Aturan akses (Row Level Security) ----------
alter table public.profil        enable row level security;
alter table public.kelas         enable row level security;
alter table public.guru_kelas    enable row level security;
alter table public.undangan_guru enable row level security;
alter table public.anak          enable row level security;
alter table public.hasil         enable row level security;

drop policy if exists profil_baca on public.profil;
create policy profil_baca on public.profil for select to authenticated
  using (id = auth.uid() or public.peran_saya() = 'pemilik'
         or id in (select guru_id from public.guru_kelas));          -- nama wali kelas boleh terlihat
drop policy if exists profil_ubah on public.profil;
create policy profil_ubah on public.profil for update to authenticated
  using (id = auth.uid() or public.peran_saya() = 'pemilik');

drop policy if exists kelas_baca on public.kelas;
create policy kelas_baca on public.kelas for select to authenticated
  using (public.peran_saya() = 'pemilik'
         or id in (select public.kelas_saya())
         or id in (select kelas_id from public.anak where ortu_id = auth.uid()));
drop policy if exists kelas_kelola on public.kelas;
create policy kelas_kelola on public.kelas for all to authenticated
  using (public.peran_saya() = 'pemilik') with check (public.peran_saya() = 'pemilik');

drop policy if exists gk_baca on public.guru_kelas;
create policy gk_baca on public.guru_kelas for select to authenticated
  using (guru_id = auth.uid() or public.peran_saya() = 'pemilik'
         or kelas_id in (select kelas_id from public.anak where ortu_id = auth.uid()));
drop policy if exists gk_kelola on public.guru_kelas;
create policy gk_kelola on public.guru_kelas for all to authenticated
  using (public.peran_saya() = 'pemilik') with check (public.peran_saya() = 'pemilik');

drop policy if exists undangan_kelola on public.undangan_guru;
create policy undangan_kelola on public.undangan_guru for all to authenticated
  using (public.peran_saya() = 'pemilik') with check (public.peran_saya() = 'pemilik');

drop policy if exists anak_baca on public.anak;
create policy anak_baca on public.anak for select to authenticated
  using (ortu_id = auth.uid() or public.peran_saya() = 'pemilik'
         or kelas_id in (select public.kelas_saya()));
drop policy if exists anak_tambah on public.anak;
create policy anak_tambah on public.anak for insert to authenticated
  with check (ortu_id = auth.uid());
drop policy if exists anak_ubah on public.anak;
create policy anak_ubah on public.anak for update to authenticated
  using (ortu_id = auth.uid() or public.peran_saya() = 'pemilik');
drop policy if exists anak_hapus on public.anak;
create policy anak_hapus on public.anak for delete to authenticated
  using (ortu_id = auth.uid() or public.peran_saya() = 'pemilik');

drop policy if exists hasil_baca on public.hasil;
create policy hasil_baca on public.hasil for select to authenticated
  using (anak_id in (select public.anak_terlihat()));
drop policy if exists hasil_tambah on public.hasil;
create policy hasil_tambah on public.hasil for insert to authenticated
  with check (anak_id in (select id from public.anak where ortu_id = auth.uid()));
drop policy if exists hasil_hapus on public.hasil;
create policy hasil_hapus on public.hasil for delete to authenticated
  using (public.peran_saya() = 'pemilik');

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profil, public.kelas, public.guru_kelas,
  public.undangan_guru, public.anak, public.hasil to authenticated;
grant usage, select on all sequences in schema public to authenticated;
revoke all on public.profil, public.kelas, public.guru_kelas, public.undangan_guru,
  public.anak, public.hasil from anon;

-- ---------- Fungsi yang dipanggil aplikasi ----------
-- Orang tua memasukkan anak ke kelas dengan kode
create or replace function public.gabung_kelas(p_kode text, p_anak uuid)
returns json language plpgsql security definer set search_path = public as $$
declare k public.kelas;
begin
  if not exists (select 1 from public.anak where id = p_anak and ortu_id = auth.uid()) then
    raise exception 'Anak tidak ditemukan';
  end if;
  if p_kode is null or btrim(p_kode) = '' then
    perform set_config('kebun.gabung', '1', true);
    update public.anak set kelas_id = null where id = p_anak;
    return json_build_object('kelas_id', null);
  end if;
  select * into k from public.kelas where kode = upper(btrim(p_kode));
  if not found then raise exception 'Kode kelas tidak ditemukan'; end if;
  perform set_config('kebun.gabung', '1', true);
  update public.anak set kelas_id = k.id where id = p_anak;
  return json_build_object('kelas_id', k.id, 'nama', k.nama, 'jenjang', k.jenjang);
end $$;

-- Pemilik mengundang wali kelas (atau langsung menetapkan bila sudah punya akun)
create or replace function public.undang_guru(p_email text, p_nama text, p_kelas uuid[])
returns text language plpgsql security definer set search_path = public as $$
declare pid uuid; e text := lower(btrim(p_email));
begin
  if public.peran_saya() <> 'pemilik' then raise exception 'Khusus pemilik'; end if;
  select id into pid from public.profil where email = e;
  if pid is not null then
    update public.profil set peran = case when peran = 'pemilik' then peran else 'guru' end,
           nama = coalesce(nullif(btrim(p_nama),''), nama) where id = pid;
    delete from public.guru_kelas where guru_id = pid;
    insert into public.guru_kelas(guru_id, kelas_id) select pid, k from unnest(p_kelas) k on conflict do nothing;
    return 'aktif';
  end if;
  insert into public.undangan_guru(email, nama, kelas_id) values (e, p_nama, p_kelas)
    on conflict (email) do update set nama = excluded.nama, kelas_id = excluded.kelas_id;
  return 'diundang';
end $$;

-- Pemilik mencabut peran wali kelas
create or replace function public.cabut_guru(p_email text)
returns void language plpgsql security definer set search_path = public as $$
declare e text := lower(btrim(p_email));
begin
  if public.peran_saya() <> 'pemilik' then raise exception 'Khusus pemilik'; end if;
  delete from public.undangan_guru where email = e;
  delete from public.guru_kelas where guru_id in (select id from public.profil where email = e);
  update public.profil set peran = 'ortu' where email = e and peran = 'guru';
end $$;

-- Rekap murid (mengikuti aturan akses: wali kelas hanya melihat kelasnya)
create or replace function public.rekap_murid(p_kelas uuid default null)
returns table (anak_id uuid, nama text, usia int, jk text, kelas_id uuid, data jsonb, diperbarui timestamptz,
               terakhir timestamptz, latihan_hari_ini bigint, latihan_7hari bigint, benar_7hari bigint, soal_7hari bigint)
language sql stable security invoker set search_path = public as $$
  select a.id, a.nama, a.usia, a.jk, a.kelas_id, a.data, a.diperbarui,
         max(h.waktu),
         count(h.id) filter (where (h.waktu at time zone 'Asia/Jakarta')::date = (now() at time zone 'Asia/Jakarta')::date),
         count(h.id) filter (where h.waktu > now() - interval '7 days'),
         coalesce(sum(h.benar) filter (where h.waktu > now() - interval '7 days'), 0),
         coalesce(sum(h.jumlah) filter (where h.waktu > now() - interval '7 days'), 0)
  from public.anak a left join public.hasil h on h.anak_id = a.id
  where (p_kelas is null and a.kelas_id is not null) or a.kelas_id = p_kelas
  group by a.id
  order by a.nama
$$;

-- Ringkasan per kelas untuk pemilik / wali kelas
create or replace function public.ringkasan_kelas()
returns table (kelas_id uuid, nama text, jenjang int, kode text, jumlah_murid bigint, aktif_hari_ini bigint, wali text)
language sql stable security invoker set search_path = public as $$
  select k.id, k.nama, k.jenjang, k.kode,
         (select count(*) from public.anak a where a.kelas_id = k.id),
         (select count(distinct h.anak_id) from public.hasil h join public.anak a on a.id = h.anak_id
           where a.kelas_id = k.id and (h.waktu at time zone 'Asia/Jakarta')::date = (now() at time zone 'Asia/Jakarta')::date),
         (select string_agg(coalesce(nullif(p.nama,''), p.email), ', ') from public.guru_kelas g join public.profil p on p.id = g.guru_id where g.kelas_id = k.id)
  from public.kelas k
  order by k.jenjang, k.nama
$$;

grant execute on function public.gabung_kelas(text, uuid), public.undang_guru(text, text, uuid[]),
  public.cabut_guru(text), public.rekap_murid(uuid), public.ringkasan_kelas(),
  public.peran_saya(), public.kelas_saya(), public.anak_terlihat() to authenticated;

-- =====================================================================
--  SETELAH ustadz mendaftar di aplikasi, jalankan baris ini sekali
--  (ganti dengan email ustadz) agar akun ustadz menjadi PEMILIK:
--
--  update public.profil set peran = 'pemilik' where email = lower('EMAIL_USTADZ@gmail.com');
-- =====================================================================
