-- Skrip SQL Database Supabase untuk PT Aetra Air Tangerang
-- Salin seluruh isi skrip ini ke menu SQL Editor di dashboard Supabase Anda.
-- File sumber lengkap juga tersedia di /supabase/schema.sql

CREATE TABLE IF NOT EXISTS public.user_accounts (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nama TEXT NOT NULL,
  id_pelanggan TEXT,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS public.registrations (
  id TEXT PRIMARY KEY,
  no_form TEXT UNIQUE NOT NULL,
  no_sr TEXT,
  id_pelanggan TEXT,
  tanggal DATE DEFAULT CURRENT_DATE,
  nama_ktp TEXT NOT NULL,
  no_ktp TEXT NOT NULL,
  email TEXT,
  telp_hp TEXT,
  alamat_ktp TEXT NOT NULL,
  rt_rw_ktp TEXT,
  kecamatan_ktp TEXT,
  desa_ktp TEXT,
  kode_pos_ktp TEXT,
  kelurahan_ktp TEXT,
  alamat_pasang TEXT NOT NULL,
  rt_rw_pasang TEXT,
  kecamatan_pasang TEXT,
  desa_pasang TEXT,
  kode_pos_pasang TEXT,
  kelurahan_pasang TEXT,
  pekerjaan TEXT,
  status_kepemilikan TEXT,
  status_kepemilikan_lainnya TEXT,
  luas_tanah TEXT,
  luas_bangunan TEXT,
  total_luas_bangunan NUMERIC,
  fungsi_bangunan TEXT,
  golongan_tarif TEXT,
  kategori_tarif_klausul TEXT,
  skema_pembayaran TEXT DEFAULT 'Bayar Lunas',
  keterangan_skema TEXT,
  biaya_sambungan NUMERIC DEFAULT 1371545,
  kondisi_bangunan JSONB DEFAULT '{}'::jsonb,
  lingkungan JSONB DEFAULT '{}'::jsonb,
  persyaratan JSONB DEFAULT '{}'::jsonb,
  persyaratan_files JSONB DEFAULT '{}'::jsonb,
  data_pasang JSONB DEFAULT '{}'::jsonb,
  foto_properti_files JSONB DEFAULT '[]'::jsonb,
  persetujuan BOOLEAN DEFAULT true,
  tracking_step INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS public.tracking_records (
  no_form TEXT PRIMARY KEY,
  no_sr TEXT,
  id_pelanggan TEXT,
  email TEXT,
  nama TEXT NOT NULL,
  telp TEXT,
  alamat TEXT,
  current_step INTEGER DEFAULT 1,
  tanggal_daftar TEXT,
  estimasi_selesai TEXT DEFAULT '14 Hari Kerja (Estimasi Air Mengalir)',
  golongan_tarif TEXT,
  biaya_sambungan NUMERIC DEFAULT 1371545,
  status_pembayaran TEXT DEFAULT 'Menunggu Pembayaran',
  nomor_meter TEXT,
  nomor_segel TEXT,
  admin_notes TEXT,
  last_updated_by_admin TEXT,
  petugas_surveyor JSONB DEFAULT '{}'::jsonb,
  petugas_teknisi JSONB DEFAULT '{}'::jsonb,
  steps JSONB DEFAULT '[]'::jsonb,
  timeline_events JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS public.surveys (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  no_pelanggan_or_sr TEXT,
  kecamatan TEXT,
  desa TEXT,
  kelurahan TEXT,
  q1_kualitas_syarat INTEGER,
  q2_kualitas_warna INTEGER,
  q3_kualitas_bau INTEGER,
  q4_kuantitas_24jam INTEGER,
  q5_kuantitas_volume INTEGER,
  q6_kontinuitas_tekanan INTEGER,
  q7_kontinuitas_penurunan INTEGER,
  q8_teknis_kecepatan INTEGER,
  q9_teknis_sikap INTEGER,
  q10_keluhan_ramah INTEGER,
  q11_keluhan_cepat INTEGER,
  q12_keluhan_komunikasi INTEGER,
  q13_meter_ramah INTEGER,
  q14_meter_tanggap INTEGER,
  q15_meter_akurat INTEGER,
  q16_tagihan_alamat INTEGER,
  q17_tagihan_m3 INTEGER,
  q18_tagihan_pilihan INTEGER,
  kualitas_air NUMERIC,
  kontinuitas_aliran NUMERIC,
  kecepatan_pelayanan NUMERIC,
  kemudahan_tagihan NUMERIC,
  profesionalisme_petugas NUMERIC,
  csat_overall NUMERIC,
  nps_score NUMERIC,
  komentar TEXT,
  kategori_masukan TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access user_accounts" ON public.user_accounts;
CREATE POLICY "Public access user_accounts" ON public.user_accounts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access registrations" ON public.registrations;
CREATE POLICY "Public access registrations" ON public.registrations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access tracking_records" ON public.tracking_records;
CREATE POLICY "Public access tracking_records" ON public.tracking_records FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access surveys" ON public.surveys;
CREATE POLICY "Public access surveys" ON public.surveys FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.user_accounts (id, email, nama, id_pelanggan, password, role)
VALUES 
  ('acc-admin', 'admin@aetra.co.id', 'Administrator Aetra Tangerang', '10999999', 'admin', 'admin'),
  ('acc-cust-1', 'bambang.supriyanto@gmail.com', 'Bambang Supriyanto', '10842918', 'password123', 'customer')
ON CONFLICT (id) DO NOTHING;

GRANT ALL ON TABLE public.user_accounts TO anon, authenticated;
GRANT ALL ON TABLE public.registrations TO anon, authenticated;
GRANT ALL ON TABLE public.tracking_records TO anon, authenticated;
GRANT ALL ON TABLE public.surveys TO anon, authenticated;
