import React, { useState } from 'react';
import { 
  isSupabaseConfigured, 
  getSupabaseConfig, 
  getStoredSupabaseCredentials, 
  reloadSupabaseClient,
  getSupabaseClient
} from '../lib/supabase';
import { 
  Database, 
  X, 
  Check, 
  Copy, 
  ExternalLink, 
  Server, 
  ShieldCheck, 
  Github, 
  Sparkles,
  Layers,
  Terminal,
  KeyRound,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCredentialsUpdated?: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose, onCredentialsUpdated }) => {
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'setup' | 'sql' | 'guide'>('status');

  // Input credentials form
  const initialCreds = getStoredSupabaseCredentials();
  const [inputUrl, setInputUrl] = useState(initialCreds.url);
  const [inputKey, setInputKey] = useState(initialCreds.key);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');

  if (!isOpen) return null;

  const config = getSupabaseConfig();
  const isOnline = config.isConfigured;

  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = inputUrl.trim();
    const cleanKey = inputKey.trim();

    if (!cleanUrl || !cleanKey) {
      setTestStatus('error');
      setTestMessage('Harap masukkan Supabase URL dan Anon Key.');
      return;
    }

    if (!cleanUrl.startsWith('https://')) {
      setTestStatus('error');
      setTestMessage('Project URL harus diawali dengan https:// (misal: https://xyz.supabase.co)');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Menghubungkan ke database Supabase...');

    try {
      localStorage.setItem('aetra_supabase_url', cleanUrl);
      localStorage.setItem('aetra_supabase_anon_key', cleanKey);
      
      // Reload the client
      const client = reloadSupabaseClient();

      // Test a light ping query on public schema
      const { error } = await client.from('registrations').select('count', { count: 'exact', head: true });
      
      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('relation "public.registrations" does not exist') || error.message.includes('not found')) {
          setTestStatus('success');
          setTestMessage('Koneksi berhasil! Namun tabel "registrations" belum dibuat. Buka tab "Skema SQL" di atas dan jalankan query di Supabase SQL Editor.');
        } else {
          setTestStatus('error');
          setTestMessage(`Koneksi ditolak Supabase: ${error.message}`);
        }
      } else {
        setTestStatus('success');
        setTestMessage('Koneksi sukses! Tabel database terhubung dan aktif secara realtime.');
      }

      if (onCredentialsUpdated) {
        onCredentialsUpdated();
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(`Gagal terhubung: ${err.message || 'Periksa kembali URL dan Anon Key Anda.'}`);
    }
  };

  const handleClearCredentials = () => {
    localStorage.removeItem('aetra_supabase_url');
    localStorage.removeItem('aetra_supabase_anon_key');
    setInputUrl('');
    setInputKey('');
    reloadSupabaseClient();
    setTestStatus('idle');
    setTestMessage('Kredensial lokal telah dihapus. Aplikasi kembali ke mode cache lokal.');
    if (onCredentialsUpdated) {
      onCredentialsUpdated();
    }
  };

  const sqlSchemaCode = `-- SKEMA DATABASE SUPABASE UNTUK PT AETRA AIR TANGERANG
-- Jalankan di Supabase Dashboard: SQL Editor -> New Query

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
  estimasi_selesai TEXT DEFAULT '14 Hari Kerja',
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

CREATE POLICY "Public access user_accounts" ON public.user_accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access registrations" ON public.registrations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access tracking_records" ON public.tracking_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access surveys" ON public.surveys FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.user_accounts (id, email, nama, id_pelanggan, password, role)
VALUES 
  ('acc-admin', 'admin@aetra.co.id', 'Administrator Aetra Tangerang', '10999999', 'admin', 'admin'),
  ('acc-cust-1', 'bambang.supriyanto@gmail.com', 'Bambang Supriyanto', '10842918', 'password123', 'customer')
ON CONFLICT (id) DO NOTHING;

GRANT ALL ON TABLE public.user_accounts TO anon, authenticated;
GRANT ALL ON TABLE public.registrations TO anon, authenticated;
GRANT ALL ON TABLE public.tracking_records TO anon, authenticated;
GRANT ALL ON TABLE public.surveys TO anon, authenticated;`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlSchemaCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const copyEnvToClipboard = () => {
    const envText = `VITE_SUPABASE_URL=https://your-project.supabase.co\nVITE_SUPABASE_ANON_KEY=your-anon-key`;
    navigator.clipboard.writeText(envText);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-linear-to-r from-emerald-600 via-teal-700 to-[#005DAA] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-xs">
              <Database className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                Integrasi Database Supabase &amp; Vercel
                <span className="text-[10px] bg-emerald-400/30 text-emerald-100 font-semibold px-2 py-0.5 rounded-full border border-emerald-300/30">
                  Online Cloud
                </span>
              </h3>
              <p className="text-xs text-emerald-100">
                PostgreSQL Cloud Database terhubung untuk deployment di Vercel via GitHub
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('status')}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'status'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            Status Koneksi
          </button>
          <button
            onClick={() => setActiveTab('setup')}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'setup'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            Tes / Input Kredensial Langsung
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'sql'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Skema SQL (1-Click Copy)
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'guide'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Github className="w-3.5 h-3.5" />
            Panduan Deploy Vercel
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-xs leading-relaxed">
          
          {/* TAB 1: STATUS KONEKSI */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              {isOnline ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                    <span>Database Supabase Aktif &amp; Terhubung!</span>
                  </div>
                  <p className="text-emerald-700">
                    Aplikasi saat ini langsung menyimpan dan menyinkronkan seluruh data pendaftaran, tracking sambungan, akun pengguna, dan survey ke database cloud PostgreSQL Supabase secara realtime.
                  </p>
                  <div className="mt-2 pt-2 border-t border-emerald-200/80 font-mono text-[11px] text-slate-600">
                    <div><strong>Project URL:</strong> {config.url}</div>
                    <div><strong>Anon Key:</strong> {config.anonKey}</div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                      <ShieldCheck className="w-5 h-5 text-blue-600" />
                      <span>Mode Standby / Hybrid Offline-First</span>
                    </div>
                    <span className="text-[10px] font-bold bg-blue-200/70 text-blue-900 px-2 py-0.5 rounded-full">
                      Siap Deploy
                    </span>
                  </div>
                  <p className="text-blue-800">
                    Aplikasi saat ini berjalan normal menggunakan cache lokal browser. Jika Anda sudah memiliki Project URL &amp; API Key dari Supabase, Anda dapat mengujinya langsung di tab <strong>&quot;Tes / Input Kredensial Langsung&quot;</strong> di atas, atau memasukkannya di Environment Variables Vercel saat dideploy!
                  </p>
                </div>
              )}

              {/* Tombol pintas ke tab setup */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('setup')}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition text-xs shadow-2xs"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{isOnline ? 'Perbarui Kredensial / Tes Ulang' : 'Masukkan Kredensial &amp; Tes Koneksi Sekarang'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('sql')}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-1.5 transition text-xs"
                >
                  <Terminal className="w-4 h-4 text-slate-600" />
                  <span>Lihat Skema SQL</span>
                </button>
              </div>

              {/* Ringkasan Tabel Database */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wide text-[11px]">
                  Tabel Database yang Dikelola:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="font-mono font-bold text-slate-900 text-xs">registrations</div>
                    <div className="text-[11px] text-slate-500">Menyimpan data lengkap formulir pendaftaran sambungan baru</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="font-mono font-bold text-slate-900 text-xs">tracking_records</div>
                    <div className="text-[11px] text-slate-500">Status 4 tahapan pelacakan, nomor meter, segel &amp; log timeline</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="font-mono font-bold text-slate-900 text-xs">surveys</div>
                    <div className="text-[11px] text-slate-500">18 pertanyaan kepuasan pelanggan &amp; indeks CSAT/NPS</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="font-mono font-bold text-slate-900 text-xs">user_accounts</div>
                    <div className="text-[11px] text-slate-500">Akun autentikasi pelanggan dan administrator</div>
                  </div>
                </div>
              </div>

              {/* Variabel Environment */}
              <div className="p-3.5 bg-slate-900 text-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] text-emerald-400">Environment Variables untuk Vercel:</span>
                  <button
                    onClick={copyEnvToClipboard}
                    className="flex items-center gap-1 text-[10px] text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded transition"
                  >
                    {copiedEnv ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedEnv ? 'Tersalin!' : 'Salin Variabel'}
                  </button>
                </div>
                <pre className="font-mono text-[11px] text-slate-300 bg-slate-950 p-2.5 rounded overflow-x-auto">
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJh...your-anon-key`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB SETUP & TEST KREDENSIAL */}
          {activeTab === 'setup' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-emerald-600" />
                  <span>Masukkan URL dan API Key Supabase Anda</span>
                </h4>
                <p className="text-slate-600 text-[11px]">
                  Nilai ini didapatkan dari dashboard Supabase pada menu <strong>Project Settings &gt; API</strong> (Project URL &amp; Project API keys &quot;anon&quot; public).
                </p>
              </div>

              <form onSubmit={handleSaveAndTest} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Supabase Project URL (VITE_SUPABASE_URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://xyzabcdefghijklm.supabase.co"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-500">Contoh: https://xxxxxx.supabase.co</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Supabase Anon Public Key (VITE_SUPABASE_ANON_KEY)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono break-all"
                  />
                  <span className="text-[10px] text-slate-500">Gunakan key dengan label <code>anon</code> / <code>public</code>. Jangan gunakan secret key service role.</span>
                </div>

                {testStatus === 'testing' && (
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                    <span>{testMessage}</span>
                  </div>
                )}

                {testStatus === 'success' && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Berhasil!</strong> {testMessage}
                    </div>
                  </div>
                )}

                {testStatus === 'error' && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Gagal:</strong> {testMessage}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={testStatus === 'testing'}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                  >
                    {testStatus === 'testing' ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Menguji...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Simpan &amp; Tes Koneksi Database</span>
                      </>
                    )}
                  </button>

                  {(inputUrl || inputKey) && (
                    <button
                      type="button"
                      onClick={handleClearCredentials}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition cursor-pointer"
                    >
                      Reset / Hapus
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: SKEMA SQL */}
          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-slate-600">
                  Salin skrip SQL ini lalu jalankan di Supabase (menu <strong>SQL Editor</strong> &gt; <strong>New Query</strong> &gt; <strong>Run</strong>).
                </p>
                <button
                  onClick={copySqlToClipboard}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs transition"
                >
                  {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedSql ? 'Skrip SQL Tersalin!' : 'Salin Seluruh SQL'}
                </button>
              </div>

              <div className="relative bg-slate-900 text-slate-200 p-3 rounded-xl max-h-72 overflow-y-auto font-mono text-[10.5px] border border-slate-800">
                <pre className="whitespace-pre">{sqlSchemaCode}</pre>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Catatan:</strong> Skrip ini sudah mencakup konfigurasi <em>Row Level Security (RLS)</em> dan hak akses publik anon key sehingga frontend Vite di Vercel dapat langsung melakukan operasi database secara instan.
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PANDUAN DEPLOY */}
          {activeTab === 'guide' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-[#005DAA] text-white flex items-center justify-center font-bold text-xs shrink-0">1</div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-slate-900">Buat Database di Supabase</h5>
                    <p className="text-slate-600 text-[11px]">
                      Buka <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-blue-600 font-bold underline inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-2.5 h-2.5" /></a>, buat project baru, lalu salin dan jalankan skrip dari tab <strong>Skema SQL</strong> di atas pada menu SQL Editor.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-[#005DAA] text-white flex items-center justify-center font-bold text-xs shrink-0">2</div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-slate-900">Push Source Code ke GitHub</h5>
                    <p className="text-slate-600 text-[11px]">
                      Buat repository baru di GitHub, lalu commit &amp; push seluruh file aplikasi ini. File konfigurasi <code>vercel.json</code> sudah otomatis tersedia di root proyek.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-[#005DAA] text-white flex items-center justify-center font-bold text-xs shrink-0">3</div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-slate-900">Import &amp; Deploy di Vercel</h5>
                    <p className="text-slate-600 text-[11px]">
                      Buka <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-blue-600 font-bold underline inline-flex items-center gap-0.5">vercel.com <ExternalLink className="w-2.5 h-2.5" /></a>, klik <em>Add New &gt; Project</em>, pilih repo GitHub Anda, lalu isi bagian <strong>Environment Variables</strong>:
                    </p>
                    <div className="bg-slate-100 p-2 rounded text-[11px] font-mono space-y-0.5 text-slate-800">
                      <div>VITE_SUPABASE_URL = (URL project Supabase Anda)</div>
                      <div>VITE_SUPABASE_ANON_KEY = (Anon key dari Supabase)</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">4</div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-emerald-900">Klik &quot;Deploy&quot; &amp; Selesai!</h5>
                    <p className="text-emerald-800 text-[11px]">
                      Vercel akan otomatis melakukan build (Vite SPA) dan menerbitkan domain online aktif. Panduan lengkap tersimpan di file <strong>SUPABASE_VERCEL_GUIDE.md</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-t border-slate-200">
          <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            File konfigurasi: <code>vercel.json</code> &amp; <code>supabase/schema.sql</code>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition shadow-2xs"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
