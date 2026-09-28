import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { RegistrationFormData, CustomerTrackingRecord, SurveySubmission, UserAccount } from '../types';

// Helper to always obtain active client
const getDb = () => getSupabaseClient();

// Convert frontend RegistrationFormData to Supabase registrations table row (snake_case)
const mapRegistrationToDb = (reg: RegistrationFormData) => ({
  id: reg.id || `reg-${Date.now()}`,
  no_form: reg.noForm,
  no_sr: reg.noSr,
  id_pelanggan: reg.idPelanggan,
  tanggal: reg.tanggal || new Date().toISOString().split('T')[0],
  nama_ktp: reg.namaKtp,
  no_ktp: reg.noKtp,
  email: reg.email || null,
  telp_hp: reg.telpHp || null,
  alamat_ktp: reg.alamatKtp,
  rt_rw_ktp: reg.rtRwKtp,
  kecamatan_ktp: reg.kecamatanKtp || null,
  desa_ktp: reg.desaKtp || null,
  kode_pos_ktp: reg.kodePosKtp || null,
  kelurahan_ktp: reg.kelurahanKtp || null,
  alamat_pasang: reg.alamatPasang,
  rt_rw_pasang: reg.rtRwPasang,
  kecamatan_pasang: reg.kecamatanPasang || null,
  desa_pasang: reg.desaPasang || null,
  kode_pos_pasang: reg.kodePosPasang || null,
  kelurahan_pasang: reg.kelurahanPasang || null,
  pekerjaan: reg.pekerjaan || null,
  status_kepemilikan: reg.statusKepemilikan || null,
  status_kepemilikan_lainnya: reg.statusKepemilikanLainnya || null,
  luas_tanah: reg.luasTanah || null,
  luas_bangunan: reg.luasBangunan || null,
  total_luas_bangunan: typeof reg.totalLuasBangunan === 'number' ? reg.totalLuasBangunan : null,
  fungsi_bangunan: reg.fungsiBangunan || null,
  golongan_tarif: reg.golonganTarif || null,
  kategori_tarif_klausul: reg.kategoriTarifKlausul || null,
  skema_pembayaran: reg.skemaPembayaran || 'Bayar Lunas',
  keterangan_skema: reg.keteranganSkema || null,
  biaya_sambungan: reg.biayaSambungan || 1371545,
  kondisi_bangunan: reg.kondisiBangunan || {},
  lingkungan: reg.lingkungan || {},
  persyaratan: reg.persyaratan || {},
  persyaratan_files: reg.persyaratanFiles || {},
  data_pasang: reg.dataPasang || {},
  foto_properti_files: reg.fotoPropertiFiles || [],
  persetujuan: reg.persetujuan ?? true,
  tracking_step: reg.trackingStep || 1,
  created_at: reg.createdAt || new Date().toISOString(),
});

// Convert database row to frontend RegistrationFormData
const mapDbToRegistration = (row: any): RegistrationFormData => ({
  id: row.id,
  noForm: row.no_form,
  noSr: row.no_sr || '',
  idPelanggan: row.id_pelanggan || '',
  tanggal: row.tanggal || '',
  namaKtp: row.nama_ktp || '',
  noKtp: row.no_ktp || '',
  email: row.email || '',
  telpHp: row.telp_hp || '',
  alamatKtp: row.alamat_ktp || '',
  rtRwKtp: row.rt_rw_ktp || '',
  kecamatanKtp: row.kecamatan_ktp || '',
  desaKtp: row.desa_ktp || '',
  kodePosKtp: row.kode_pos_ktp || '',
  kelurahanKtp: row.kelurahan_ktp || '',
  alamatPasang: row.alamat_pasang || '',
  rtRwPasang: row.rt_rw_pasang || '',
  kecamatanPasang: row.kecamatan_pasang || '',
  desaPasang: row.desa_pasang || '',
  kodePosPasang: row.kode_pos_pasang || '',
  kelurahanPasang: row.kelurahan_pasang || '',
  pekerjaan: row.pekerjaan || '',
  statusKepemilikan: row.status_kepemilikan || '',
  statusKepemilikanLainnya: row.status_kepemilikan_lainnya || '',
  luasTanah: row.luas_tanah || '',
  luasBangunan: row.luas_bangunan || '',
  totalLuasBangunan: row.total_luas_bangunan || 0,
  fungsiBangunan: row.fungsi_bangunan || '',
  golonganTarif: row.golongan_tarif || '',
  kategoriTarifKlausul: row.kategori_tarif_klausul || '',
  skemaPembayaran: row.skema_pembayaran || 'Bayar Lunas',
  keteranganSkema: row.keterangan_skema || '',
  biayaSambungan: row.biaya_sambungan || 1371545,
  kondisiBangunan: row.kondisi_bangunan || { luasBangunan: '', totalLuasBangunan: '', jumlahLantai: '', jumlahPenghuni: '' },
  lingkungan: row.lingkungan || { saluranPembuangan: '', sanitasi: '', halaman: '', lebarJalan: '', lingkunganTertata: '', realEstate: '' },
  persyaratan: row.persyaratan || { ktp: false, kk: false, pbb: false, suratDomisili: false, suratKuasaSewa: false, lainnya: false, keteranganLainnya: '' },
  persyaratanFiles: row.persyaratan_files || {},
  dataPasang: row.data_pasang || { namaSales: '', tanggalSurvey: '', noWorkOrder: '', gpsLat: '', gpsLong: '', namaKontraktor: '', dataAlamat: '', dataAlamatKoreksi: '', dataJaringan: '', dataGalian: [], luasBangunanSurvey: '', kualitasBangunan: '', fotoProperti: '', diameterPipa: '', panjangPipa: '', panjangPipaTipe: '', materialTambahan: '', materialStatus: '', tanggalPasangMeter: '', noSegel: '', noSeriMeter: '' },
  fotoPropertiFiles: row.foto_properti_files || [],
  persetujuan: Boolean(row.persetujuan),
  trackingStep: row.tracking_step || 1,
  createdAt: row.created_at,
});

// Convert frontend CustomerTrackingRecord to database row
const mapTrackingToDb = (rec: CustomerTrackingRecord) => ({
  no_form: rec.noForm,
  no_sr: rec.noSr || null,
  id_pelanggan: rec.idPelanggan || null,
  email: rec.email || null,
  nama: rec.nama,
  telp: rec.telp || null,
  alamat: rec.alamat,
  current_step: rec.currentStep || 1,
  tanggal_daftar: rec.tanggalDaftar || null,
  estimasi_selesai: rec.estimasiSelesai || '14 Hari Kerja (Estimasi Air Mengalir)',
  golongan_tarif: rec.golonganTarif || null,
  biaya_sambungan: rec.biayaSambungan || 1371545,
  status_pembayaran: rec.statusPembayaran || 'Menunggu Pembayaran',
  nomor_meter: rec.nomorMeter || null,
  nomor_segel: rec.nomorSegel || null,
  admin_notes: rec.adminNotes || null,
  last_updated_by_admin: rec.lastUpdatedByAdmin || null,
  petugas_surveyor: rec.petugasSurveyor || {},
  petugas_teknisi: rec.petugasTeknisi || {},
  steps: rec.steps || [],
  timeline_events: rec.timelineEvents || [],
  updated_at: new Date().toISOString(),
});

// Convert database row to frontend CustomerTrackingRecord
const mapDbToTracking = (row: any): CustomerTrackingRecord => ({
  noForm: row.no_form,
  noSr: row.no_sr || '',
  idPelanggan: row.id_pelanggan || '',
  email: row.email || '',
  nama: row.nama || '',
  telp: row.telp || '',
  alamat: row.alamat || '',
  currentStep: row.current_step || 1,
  tanggalDaftar: row.tanggal_daftar || '',
  estimasiSelesai: row.estimasi_selesai || '14 Hari Kerja',
  golonganTarif: row.golongan_tarif || '',
  biayaSambungan: row.biaya_sambungan || 1371545,
  statusPembayaran: row.status_pembayaran || 'Menunggu Pembayaran',
  nomorMeter: row.nomor_meter,
  nomorSegel: row.nomor_segel,
  adminNotes: row.admin_notes,
  lastUpdatedByAdmin: row.last_updated_by_admin,
  petugasSurveyor: row.petugas_surveyor,
  petugasTeknisi: row.petugas_teknisi,
  steps: Array.isArray(row.steps) ? row.steps : [],
  timelineEvents: Array.isArray(row.timeline_events) ? row.timeline_events : [],
});

// ==========================================
// REGISTRATION OPERATIONS
// ==========================================
export const fetchRegistrationsFromDb = async (): Promise<RegistrationFormData[] | null> => {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await getDb()
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching registrations from Supabase:', error.message);
      return null;
    }
    return (data || []).map(mapDbToRegistration);
  } catch (err) {
    console.warn('Network error fetching registrations from Supabase:', err);
    return null;
  }
};

export const saveRegistrationToDb = async (record: RegistrationFormData): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const dbData = mapRegistrationToDb(record);
    const { error } = await getDb()
      .from('registrations')
      .upsert(dbData, { onConflict: 'no_form' });

    if (error) {
      console.error('Error saving registration to Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Network error saving registration to Supabase:', err);
    return false;
  }
};

export const deleteRegistrationFromDb = async (noForm: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    await getDb().from('tracking_records').delete().eq('no_form', noForm);
    const { error } = await getDb().from('registrations').delete().eq('no_form', noForm);
    if (error) {
      console.error('Error deleting registration in Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Network error deleting registration in Supabase:', err);
    return false;
  }
};

// ==========================================
// TRACKING RECORD OPERATIONS
// ==========================================
export const fetchTrackingRecordsFromDb = async (): Promise<CustomerTrackingRecord[] | null> => {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await getDb()
      .from('tracking_records')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.warn('Error fetching tracking records from Supabase:', error.message);
      return null;
    }
    return (data || []).map(mapDbToTracking);
  } catch (err) {
    console.warn('Network error fetching tracking records from Supabase:', err);
    return null;
  }
};

export const saveTrackingRecordToDb = async (record: CustomerTrackingRecord): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const dbData = mapTrackingToDb(record);
    const { error } = await getDb()
      .from('tracking_records')
      .upsert(dbData, { onConflict: 'no_form' });

    if (error) {
      console.error('Error saving tracking record to Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Network error saving tracking record to Supabase:', err);
    return false;
  }
};

// ==========================================
// SURVEY OPERATIONS
// ==========================================
export const fetchSurveysFromDb = async (): Promise<SurveySubmission[] | null> => {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await getDb()
      .from('surveys')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching surveys from Supabase:', error.message);
      return null;
    }

    return (data || []).map((row: any): SurveySubmission => ({
      id: row.id,
      nama: row.nama,
      noPelangganOrSr: row.no_pelanggan_or_sr,
      kecamatan: row.kecamatan,
      desa: row.desa,
      kelurahan: row.kelurahan,
      q1_kualitas_syarat: row.q1_kualitas_syarat,
      q2_kualitas_warna: row.q2_kualitas_warna,
      q3_kualitas_bau: row.q3_kualitas_bau,
      q4_kuantitas_24jam: row.q4_kuantitas_24jam,
      q5_kuantitas_volume: row.q5_kuantitas_volume,
      q6_kontinuitas_tekanan: row.q6_kontinuitas_tekanan,
      q7_kontinuitas_penurunan: row.q7_kontinuitas_penurunan,
      q8_teknis_kecepatan: row.q8_teknis_kecepatan,
      q9_teknis_sikap: row.q9_teknis_sikap,
      q10_keluhan_ramah: row.q10_keluhan_ramah,
      q11_keluhan_cepat: row.q11_keluhan_cepat,
      q12_keluhan_komunikasi: row.q12_keluhan_komunikasi,
      q13_meter_ramah: row.q13_meter_ramah,
      q14_meter_tanggap: row.q14_meter_tanggap,
      q15_meter_akurat: row.q15_meter_akurat,
      q16_tagihan_alamat: row.q16_tagihan_alamat,
      q17_tagihan_m3: row.q17_tagihan_m3,
      q18_tagihan_pilihan: row.q18_tagihan_pilihan,
      kualitasAir: Number(row.kualitas_air || 0),
      kontinuitasAliran: Number(row.kontinuitas_aliran || 0),
      kecepatanPelayanan: Number(row.kecepatan_pelayanan || 0),
      kemudahanTagihan: Number(row.kemudahan_tagihan || 0),
      profesionalismePetugas: Number(row.profesionalisme_petugas || 0),
      csatOverall: Number(row.csat_overall || 0),
      npsScore: Number(row.nps_score || 0),
      komentar: row.komentar || '',
      kategoriMasukan: row.kategori_masukan || 'Puas',
      createdAt: row.created_at,
    }));
  } catch (err) {
    console.warn('Network error fetching surveys from Supabase:', err);
    return null;
  }
};

export const saveSurveyToDb = async (survey: SurveySubmission): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const row = {
      id: survey.id,
      nama: survey.nama,
      no_pelanggan_or_sr: survey.noPelangganOrSr,
      kecamatan: survey.kecamatan,
      desa: survey.desa,
      kelurahan: survey.kelurahan || survey.desa,
      q1_kualitas_syarat: survey.q1_kualitas_syarat,
      q2_kualitas_warna: survey.q2_kualitas_warna,
      q3_kualitas_bau: survey.q3_kualitas_bau,
      q4_kuantitas_24jam: survey.q4_kuantitas_24jam,
      q5_kuantitas_volume: survey.q5_kuantitas_volume,
      q6_kontinuitas_tekanan: survey.q6_kontinuitas_tekanan,
      q7_kontinuitas_penurunan: survey.q7_kontinuitas_penurunan,
      q8_teknis_kecepatan: survey.q8_teknis_kecepatan,
      q9_teknis_sikap: survey.q9_teknis_sikap,
      q10_keluhan_ramah: survey.q10_keluhan_ramah,
      q11_keluhan_cepat: survey.q11_keluhan_cepat,
      q12_keluhan_komunikasi: survey.q12_keluhan_komunikasi,
      q13_meter_ramah: survey.q13_meter_ramah,
      q14_meter_tanggap: survey.q14_meter_tanggap,
      q15_meter_akurat: survey.q15_meter_akurat,
      q16_tagihan_alamat: survey.q16_tagihan_alamat,
      q17_tagihan_m3: survey.q17_tagihan_m3,
      q18_tagihan_pilihan: survey.q18_tagihan_pilihan,
      kualitas_air: survey.kualitasAir,
      kontinuitas_aliran: survey.kontinuitasAliran,
      kecepatan_pelayanan: survey.kecepatanPelayanan,
      kemudahan_tagihan: survey.kemudahanTagihan,
      profesionalisme_petugas: survey.profesionalismePetugas,
      csat_overall: survey.csatOverall,
      nps_score: survey.npsScore,
      komentar: survey.komentar,
      kategori_masukan: survey.kategoriMasukan,
      created_at: survey.createdAt || new Date().toISOString(),
    };

    const { error } = await getDb().from('surveys').upsert(row, { onConflict: 'id' });
    if (error) {
      console.error('Error saving survey to Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Network error saving survey to Supabase:', err);
    return false;
  }
};

// ==========================================
// USER ACCOUNTS OPERATIONS
// ==========================================
export const fetchUserAccountsFromDb = async (): Promise<UserAccount[] | null> => {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await getDb().from('user_accounts').select('*');
    if (error) {
      console.warn('Error fetching user accounts from Supabase:', error.message);
      return null;
    }
    return (data || []).map((row: any) => ({
      id: row.id,
      email: row.email,
      nama: row.nama,
      idPelanggan: row.id_pelanggan || '',
      password: row.password,
      role: row.role as 'admin' | 'customer',
      createdAt: row.created_at,
    }));
  } catch (err) {
    console.warn('Network error fetching user accounts from Supabase:', err);
    return null;
  }
};

export const saveUserAccountToDb = async (acc: UserAccount): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const row = {
      id: acc.id,
      email: acc.email,
      nama: acc.nama,
      id_pelanggan: acc.idPelanggan || null,
      password: acc.password,
      role: acc.role,
      created_at: acc.createdAt || new Date().toISOString(),
    };
    const { error } = await getDb().from('user_accounts').upsert(row, { onConflict: 'email' });
    if (error) {
      console.error('Error saving user account to Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Network error saving user account to Supabase:', err);
    return false;
  }
};
