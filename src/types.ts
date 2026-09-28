export type TabType = 'registration' | 'tracking' | 'billing' | 'survey' | 'faq' | 'admin';
export type UserRole = 'customer' | 'admin';
export interface UserProfile {
  role: string;
  name: string;
  title?: string;
  avatar?: string;
  division?: string;
}
export type CustomerClass = string;
export type WorkflowStatus = string;
export type ReaderCategory = string;

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details?: any;
  [key: string]: any;
}

export interface IndustryCustomer {
  id: string;
  nomorPelanggan: string;
  namaPelanggan: string;
  alamat?: string;
  customerClass?: string;
  fotoMeterUrl?: string;
  [key: string]: any;
}

export interface MeterReader {
  id: string;
  nama: string;
  [key: string]: any;
}

export interface CycleSchedule {
  id: string;
  siklus: string;
  [key: string]: any;
}

export interface UserAccount {
  id: string;
  idPelanggan: string;
  nama: string;
  email: string;
  password?: string;
  role: UserRole;
  createdAt: string;
}

export interface MonthlyBillRecord {
  id: string;
  idPelanggan: string;
  noSr?: string;
  nama: string;
  alamat: string;
  golonganTarif: string;
  nomorMeter: string;
  periodeBulan: string;
  tanggalJatuhTempo: string;
  standLalu: number;
  standKini: number;
  pemakaianM3: number;
  rincianBlok: {
    blok1M3: number;
    blok1Tarif: number;
    blok1Total: number;
    blok2M3: number;
    blok2Tarif: number;
    blok2Total: number;
    blok3M3: number;
    blok3Tarif: number;
    blok3Total: number;
  };
  biayaAir: number;
  biayaPemeliharaanMeter: number;
  biayaAdministrasi: number;
  retribusi: number;
  denda: number;
  totalTagihan: number;
  status: 'BELUM LUNAS' | 'LUNAS';
  tanggalBayar?: string;
  metodeBayar?: string;
  noReferensi?: string;
}

export interface UploadedDoc {
  id: string;
  name: string;
  dataUrl: string;
  source: 'camera' | 'file';
  type?: string;
  size?: string;
  uploadedAt: string;
}

export interface PropertyPhoto {
  id: string;
  name: string;
  dataUrl: string;
  source: 'camera' | 'file';
  caption?: string;
  timestamp: string;
}

export interface RegistrationFormData {
  id: string;
  noSr: string;
  noForm: string;
  idPelanggan: string;
  tanggal: string;
  // Data Pelanggan
  namaKtp: string;
  noKtp: string;
  alamatKtp: string;
  rtRwKtp: string;
  kodePosKtp: string;
  kecamatanKtp?: string;
  kelurahanKtp: string;
  desaKtp?: string;
  telpHp: string;
  email: string;
  alamatPasang: string;
  rtRwPasang: string;
  kodePosPasang: string;
  kecamatanPasang?: string;
  kelurahanPasang: string;
  desaPasang?: string;
  pekerjaan: string;
  statusKepemilikan: string;
  statusKepemilikanLainnya?: string;
  persyaratan: {
    ktp: boolean;
    kk: boolean;
    pbb: boolean;
    suratDomisili?: boolean;
    suratKuasaSewa?: boolean;
    lainnya: boolean;
    keteranganLainnya?: string;
  };
  persyaratanFiles?: {
    ktp?: UploadedDoc;
    kk?: UploadedDoc;
    pbb?: UploadedDoc;
    suratDomisili?: UploadedDoc;
    suratKuasaSewa?: UploadedDoc;
    lainnya?: UploadedDoc;
  };
  luasTanah?: number | string;
  luasBangunan: number | string;
  totalLuasBangunan?: number | string;
  // Fungsi Bangunan
  fungsiBangunan: string;
  // Kondisi Fisik Bangunan
  kondisiBangunan: {
    luasBangunan?: number | string;
    totalLuasBangunan?: number | string;
    jumlahLantai: number | string;
    jumlahPenghuni: number | string;
    kamarTidur?: number | string;
    kamarMandi?: number | string;
    ruangTamu?: number | string;
    ruangMakan?: number | string;
    ruangKeluarga?: number | string;
    dapur?: number | string;
    teras?: number | string;
    garasi?: number | string;
    gudang?: number | string;
  };
  lingkungan: {
    saluranPembuangan: string;
    sanitasi: string;
    halaman: string;
    lebarJalan: string;
    lingkunganTertata: string;
    realEstate: string;
  };
  // Data Pasang Meter / Petugas
  dataPasang: {
    namaSales: string;
    tanggalSurvey: string;
    noWorkOrder: string;
    gpsLat: string;
    gpsLong: string;
    namaKontraktor: string;
    dataAlamat: string;
    dataAlamatKoreksi?: string;
    dataJaringan: string;
    dataGalian: string[];
    luasBangunanSurvey: string;
    kualitasBangunan: string;
    fotoProperti: string;
    diameterPipa: string;
    panjangPipa: string;
    panjangPipaTipe: string;
    materialTambahan: string;
    materialStatus?: string;
    tanggalPasangMeter: string;
    noSegel: string;
    noSeriMeter: string;
    namaTeknisi?: string;
    telpPetugas?: string;
    idPetugasSurveyor?: string;
    idPetugasTeknisi?: string;
  };
  fotoPropertiFiles?: PropertyPhoto[];
  // Pembayaran
  skemaPembayaran: string;
  metodePembayaran?: string;
  keteranganSkema?: string;
  biayaSambungan: number;
  golonganTarif?: string;
  kategoriTarifKlausul?: string;
  hasUsahaKomersil?: boolean;
  persetujuan: boolean;
  // Status Tracking Terkait
  trackingStep: 1 | 2 | 3 | 4;
  createdAt: string;
}

export interface TrackingStepInfo {
  step: 1 | 2 | 3 | 4;
  title: string;
  statusLabel: string;
  updatedAt: string;
  isCompleted: boolean;
  isCurrent: boolean;
  notes?: string;
  deadlineNote?: string;
  subCheckpoints?: {
    id: string;
    title: string;
    desc: string;
    completed: boolean;
    badge?: string;
  }[];
}

export interface TrackingTimelineEvent {
  id: string;
  time: string;
  date: string;
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'pending';
  step: 1 | 2 | 3 | 4;
  actor?: string;
  badge?: string;
}

export interface CustomerTrackingRecord {
  noForm: string;
  noSr: string;
  idPelanggan?: string;
  email?: string;
  nama: string;
  currentStep: 1 | 2 | 3 | 4;
  telp: string;
  alamat: string;
  steps: TrackingStepInfo[];
  tanggalDaftar?: string;
  estimasiSelesai?: string;
  golonganTarif?: string;
  biayaSambungan?: number;
  statusPembayaran?: 'Lunas' | 'Menunggu Pembayaran' | 'Belum Ditagihkan';
  petugasSurveyor?: {
    nama: string;
    id: string;
    telp: string;
    role: string;
  };
  petugasTeknisi?: {
    nama: string;
    id: string;
    telp: string;
    role: string;
  };
  nomorMeter?: string;
  nomorSegel?: string;
  panjangPipaDinas?: string;
  lastUpdatedByAdmin?: string;
  adminNotes?: string;
  timelineEvents?: TrackingTimelineEvent[];
}

export interface SurveySubmission {
  id: string;
  nama: string;
  noPelangganOrSr: string;
  kelurahan: string;
  kecamatan?: string;
  desa?: string;
  // 18 Pertanyaan Kepuasan Pelanggan (Bintang 1-5)
  // Kualitas:
  q1_kualitas_syarat: number;
  q2_kualitas_warna: number;
  q3_kualitas_bau: number;
  // Kuantitas:
  q4_kuantitas_24jam: number;
  q5_kuantitas_volume: number;
  // Kontinuitas:
  q6_kontinuitas_tekanan: number;
  q7_kontinuitas_penurunan: number;
  // Pelayanan teknis:
  q8_teknis_kecepatan: number;
  q9_teknis_sikap: number;
  // Pelayanan keluhan pelanggan:
  q10_keluhan_ramah: number;
  q11_keluhan_cepat: number;
  q12_keluhan_komunikasi: number;
  // Meter reading:
  q13_meter_ramah: number;
  q14_meter_tanggap: number;
  q15_meter_akurat: number;
  // Tagihan:
  q16_tagihan_alamat: number;
  q17_tagihan_m3: number;
  q18_tagihan_pilihan: number;
  // Backward compatibility aggregates:
  kualitasAir?: number; // 1-5
  kontinuitasAliran?: number; // 1-5
  kecepatanPelayanan?: number; // 1-5
  kemudahanTagihan?: number; // 1-5
  profesionalismePetugas?: number; // 1-5
  csatOverall: number; // 1-5
  npsScore: number; // 0-10
  komentar: string;
  kategoriMasukan: 'Puas' | 'Perlu Perbaikan Air' | 'Keluhan Tekanan' | 'Apresiasi Petugas' | 'Lainnya';
  createdAt: string;
}

export interface FAQItem {
  id: string;
  kategori: 'Pendaftaran & Sambungan' | 'Tarif & Pembayaran' | 'Kualitas & Tekanan Air' | 'Meter Air' | 'Layanan Administrasi';
  pertanyaan: string;
  jawaban: string;
  helpfulCount: number;
}
