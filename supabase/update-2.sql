-- =====================================================================
--  Kebun Ilmu · pembaruan 2: jenis pengguna (santri Luqmanul Hakim / umum)
--  Jalankan sekali di Supabase: SQL Editor → New query → tempel → Run
-- =====================================================================
alter table public.profil add column if not exists asal text not null default 'umum';
do $$ begin
  alter table public.profil add constraint profil_asal_cek check (asal in ('pondok','umum'));
exception when duplicate_object then null; end $$;

create or replace function public.akun_baru() returns trigger
language plpgsql security definer set search_path = public as $$
declare u public.undangan_guru;
begin
  insert into public.profil(id, email, nama, asal)
  values (new.id, lower(new.email), coalesce(new.raw_user_meta_data->>'nama', ''),
          case when new.raw_user_meta_data->>'asal' = 'pondok' then 'pondok' else 'umum' end)
  on conflict (id) do nothing;
  select * into u from public.undangan_guru where email = lower(new.email);
  if found then
    update public.profil set peran = 'guru', asal = 'pondok', nama = coalesce(nullif(u.nama,''), nama) where id = new.id;
    insert into public.guru_kelas(guru_id, kelas_id) select new.id, k from unnest(u.kelas_id) k
      where exists (select 1 from public.kelas where id = k) on conflict do nothing;
    delete from public.undangan_guru where email = lower(new.email);
  end if;
  return new;
end $$;

-- Periksa kode kelas sebelum anak didaftarkan
create or replace function public.cek_kode(p_kode text)
returns json language sql stable security definer set search_path = public as $$
  select json_build_object('id', id, 'nama', nama, 'jenjang', jenjang) from public.kelas where kode = upper(btrim(p_kode))
$$;

-- Ringkasan seluruh pengguna (khusus pemilik)
create or replace function public.ringkasan_umum()
returns json language plpgsql stable security definer set search_path = public as $$
begin
  if public.peran_saya() <> 'pemilik' then raise exception 'Khusus pemilik'; end if;
  return json_build_object(
    'keluarga_pondok', (select count(*) from public.profil where peran = 'ortu' and asal = 'pondok'),
    'keluarga_umum',   (select count(*) from public.profil where peran = 'ortu' and asal = 'umum'),
    'anak_umum',       (select count(*) from public.anak where kelas_id is null),
    'aktif_umum',      (select count(distinct h.anak_id) from public.hasil h join public.anak a on a.id = h.anak_id
                         where a.kelas_id is null and (h.waktu at time zone 'Asia/Jakarta')::date = (now() at time zone 'Asia/Jakarta')::date));
end $$;

grant execute on function public.cek_kode(text), public.ringkasan_umum() to authenticated;
