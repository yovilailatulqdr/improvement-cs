import * as XLSX from 'xlsx';
import { RegistrationFormData, CustomerTrackingRecord, SurveySubmission } from '../types';

export interface CustomerExcelRow {
  'No. Form': string;
  'No. SR': string;
  'ID Pelanggan': string;
  'Tanggal Pendaftaran': string;
  'Nama Pemohon (KTP)': string;
  'Nomor KTP (NIK)': string;
  'Nomor HP / WA': string;
  'Email': string;
  'Alamat Pemasangan': string;
  'RT / RW': string;
  'Kelurahan / Desa': string;
  'Kecamatan': string;
  'Kode Pos': string;
  'Pekerjaan': string;
  'Status Kepemilikan': string;
  'Luas Bangunan (m²)': string | number;
  'Luas Tanah (m²)': string | number;
  'Fungsi Bangunan': string;
  'Golongan Tarif': string;
  'Skema Pembayaran': string;
  'Biaya Sambungan (Rp)': number;
  'Status Tahap Progres': string;
  'Status Pembayaran': string;
  'Nomor Meter Air': string;
  'Nomor Segel': string;
  'Petugas Teknisi': string;
}

const STEP_LABELS: Record<number, string> = {
  1: 'Tahap 1: Verifikasi Berkas',
  2: 'Tahap 2: Pembayaran Tagihan',
  3: 'Tahap 3: Pemasangan Fisik Pipa & Meter',
  4: 'Tahap 4: Sambungan Aktif & Air Mengalir',
};

/**
 * Export data pelanggan ke file Microsoft Excel (.xlsx)
 */
export function exportCustomersToExcel(
  registrations: RegistrationFormData[],
  trackingRecords: CustomerTrackingRecord[]
): void {
  const rows: CustomerExcelRow[] = registrations.map((reg) => {
    const tracking = trackingRecords.find((t) => t.noForm === reg.noForm);
    const step = tracking?.currentStep || reg.trackingStep || 1;
    const isPaid = step >= 2 || tracking?.statusPembayaran === 'Lunas';

    return {
      'No. Form': reg.noForm || '-',
      'No. SR': reg.noSr || '-',
      'ID Pelanggan': reg.idPelanggan || tracking?.idPelanggan || ('10' + (reg.noForm || '123456').replace(/\D/g, '').padEnd(6, '0')),
      'Tanggal Pendaftaran': reg.tanggal || new Date().toLocaleDateString('id-ID'),
      'Nama Pemohon (KTP)': reg.namaKtp || '-',
      'Nomor KTP (NIK)': reg.noKtp || '-',
      'Nomor HP / WA': reg.telpHp || '-',
      'Email': reg.email || '-',
      'Alamat Pemasangan': reg.alamatPasang || '-',
      'RT / RW': reg.rtRwPasang || '-',
      'Kelurahan / Desa': reg.desaPasang || reg.kelurahanPasang || '-',
      'Kecamatan': reg.kecamatanPasang || '-',
      'Kode Pos': reg.kodePosPasang || '-',
      'Pekerjaan': reg.pekerjaan || '-',
      'Status Kepemilikan': reg.statusKepemilikan || 'Milik Sendiri',
      'Luas Bangunan (m²)': reg.luasBangunan || '-',
      'Luas Tanah (m²)': reg.luasTanah || '-',
      'Fungsi Bangunan': reg.fungsiBangunan || 'Rumah Tinggal',
      'Golongan Tarif': reg.golonganTarif || '2A1 - Rumah Tangga',
      'Skema Pembayaran': reg.skemaPembayaran || 'Lakukan Pembayaran',
      'Biaya Sambungan (Rp)': reg.biayaSambungan || 1371545,
      'Status Tahap Progres': STEP_LABELS[step] || `Tahap ${step}`,
      'Status Pembayaran': isPaid ? 'Lunas' : 'Menunggu Pembayaran',
      'Nomor Meter Air': tracking?.nomorMeter || reg.dataPasang?.noSeriMeter || 'Belum Terpasang',
      'Nomor Segel': tracking?.nomorSegel || reg.dataPasang?.noSegel || 'Belum Terpasang',
      'Petugas Teknisi': tracking?.petugasTeknisi?.nama || 'Bpk. Agus Santoso',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set explicit column widths for professional layout in Excel
  const colWidths = [
    { wch: 14 }, // No. Form
    { wch: 12 }, // No. SR
    { wch: 14 }, // ID Pelanggan
    { wch: 18 }, // Tanggal
    { wch: 25 }, // Nama Pemohon
    { wch: 20 }, // NIK
    { wch: 16 }, // HP/WA
    { wch: 24 }, // Email
    { wch: 32 }, // Alamat Pasang
    { wch: 10 }, // RT/RW
    { wch: 18 }, // Kelurahan
    { wch: 18 }, // Kecamatan
    { wch: 10 }, // Kode Pos
    { wch: 18 }, // Pekerjaan
    { wch: 20 }, // Status Milik
    { wch: 18 }, // Luas Bangunan
    { wch: 16 }, // Luas Tanah
    { wch: 20 }, // Fungsi Bangunan
    { wch: 24 }, // Golongan Tarif
    { wch: 20 }, // Skema Pembayaran
    { wch: 20 }, // Biaya Sambungan
    { wch: 30 }, // Status Tahap
    { wch: 18 }, // Status Bayar
    { wch: 18 }, // Nomor Meter
    { wch: 18 }, // Nomor Segel
    { wch: 22 }, // Petugas Teknisi
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Pelanggan Aetra');

  const todayStr = new Date().toISOString().slice(0, 10);
  const fileName = `Data_Pelanggan_Aetra_Tangerang_${todayStr}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

/**
 * Unduh Template File Excel Kosong / Berisi Contoh Format untuk Import
 */
export function downloadExcelTemplate(): void {
  const sampleData: CustomerExcelRow[] = [
    {
      'No. Form': '567890',
      'No. SR': 'SR-260901',
      'ID Pelanggan': '10567890',
      'Tanggal Pendaftaran': '2026-09-25',
      'Nama Pemohon (KTP)': 'Bpk. Ahmad Fauzi',
      'Nomor KTP (NIK)': '3671012304850001',
      'Nomor HP / WA': '081298765432',
      'Email': 'ahmad.fauzi@email.com',
      'Alamat Pemasangan': 'Jl. Palem Raja No. 12, Perumahan Kadu',
      'RT / RW': '003/005',
      'Kelurahan / Desa': 'Kadu Jaya',
      'Kecamatan': 'Curug',
      'Kode Pos': '15810',
      'Pekerjaan': 'Wiraswasta',
      'Status Kepemilikan': 'Milik Sendiri',
      'Luas Bangunan (m²)': 54,
      'Luas Tanah (m²)': 72,
      'Fungsi Bangunan': 'Rumah Tinggal',
      'Golongan Tarif': '2A1 - Rumah Tangga',
      'Skema Pembayaran': 'Lakukan Pembayaran',
      'Biaya Sambungan (Rp)': 1371545,
      'Status Tahap Progres': 'Tahap 1: Verifikasi Berkas',
      'Status Pembayaran': 'Menunggu Pembayaran',
      'Nomor Meter Air': 'AET-2609-001',
      'Nomor Segel': 'SGL-AAT-001',
      'Petugas Teknisi': 'Bpk. Agus Santoso',
    },
    {
      'No. Form': '567891',
      'No. SR': 'SR-260902',
      'ID Pelanggan': '10567891',
      'Tanggal Pendaftaran': '2026-09-25',
      'Nama Pemohon (KTP)': 'Ibu Ratna Sari Dewi',
      'Nomor KTP (NIK)': '3671014508900002',
      'Nomor HP / WA': '087811223344',
      'Email': 'ratna.sari@email.com',
      'Alamat Pemasangan': 'Jl. Kenanga Blok C4 No. 8',
      'RT / RW': '002/004',
      'Kelurahan / Desa': 'Cikupa',
      'Kecamatan': 'Cikupa',
      'Kode Pos': '15710',
      'Pekerjaan': 'Karyawan Swasta',
      'Status Kepemilikan': 'Milik Sendiri',
      'Luas Bangunan (m²)': 45,
      'Luas Tanah (m²)': 60,
      'Fungsi Bangunan': 'Rumah Tinggal',
      'Golongan Tarif': '2A1 - Rumah Tangga',
      'Skema Pembayaran': 'Lakukan Pembayaran',
      'Biaya Sambungan (Rp)': 1371545,
      'Status Tahap Progres': 'Tahap 2: Pembayaran Tagihan',
      'Status Pembayaran': 'Lunas',
      'Nomor Meter Air': 'AET-2609-002',
      'Nomor Segel': 'SGL-AAT-002',
      'Petugas Teknisi': 'Bpk. Agus Santoso',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template_Pelanggan');
  XLSX.writeFile(workbook, 'Template_Import_Pelanggan_Aetra.xlsx');
}

/**
 * Parse file Excel (.xlsx / .xls / .csv) dan konversi ke RegistrationFormData[]
 */
export async function parseExcelCustomerFile(file: File): Promise<RegistrationFormData[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('File Excel tidak memiliki lembar kerja (worksheet).');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  if (rawRows.length === 0) {
    throw new Error('Lembar kerja Excel kosong atau tidak memiliki data.');
  }

  const results: RegistrationFormData[] = [];
  const todayStr = new Date().toISOString().slice(0, 10);

  rawRows.forEach((row, index) => {
    // Toleran terhadap variasi penamaan kolom Excel
    const getVal = (...keys: string[]): string => {
      for (const k of keys) {
        if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
          return String(row[k]).trim();
        }
        // Case-insensitive check
        const matchKey = Object.keys(row).find((rk) => rk.toLowerCase().trim() === k.toLowerCase().trim());
        if (matchKey && row[matchKey] !== undefined && row[matchKey] !== null && String(row[matchKey]).trim() !== '') {
          return String(row[matchKey]).trim();
        }
      }
      return '';
    };

    const nama = getVal('Nama Pemohon (KTP)', 'Nama', 'Nama Pemohon', 'Nama Lengkap', 'Nama KTP');
    if (!nama) {
      // Lewati baris kosong tanpa nama
      return;
    }

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const noForm = getVal('No. Form', 'No Form', 'NoForm', 'Nomor Form') || String(randomSuffix);
    const noSr = getVal('No. SR', 'No SR', 'NoSr', 'Nomor SR') || `SR-${noForm}`;
    const idPelanggan = getVal('ID Pelanggan', 'IDPelanggan', 'No Pelanggan') || ('10' + noForm.replace(/\D/g, '').padEnd(6, '0'));
    const noKtp = getVal('Nomor KTP (NIK)', 'No. KTP', 'NIK', 'No KTP', 'Nomor KTP') || `3671${randomSuffix}0001`;
    const telpHp = getVal('Nomor HP / WA', 'No HP', 'No. HP', 'Telepon', 'Telp / HP', 'WhatsApp') || '081234567890';
    const email = getVal('Email', 'Alamat Email') || `${nama.toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`;
    const alamatPasang = getVal('Alamat Pemasangan', 'Alamat Pasang', 'Alamat') || 'Jl. Raya Tangerang';
    const rtRw = getVal('RT / RW', 'RT/RW', 'RT RW') || '001/002';
    const kelurahan = getVal('Kelurahan / Desa', 'Kelurahan', 'Desa') || 'Kadu Jaya';
    const kecamatan = getVal('Kecamatan') || 'Curug';
    const kodePos = getVal('Kode Pos', 'Kodepos') || '15810';
    const pekerjaan = getVal('Pekerjaan') || 'Karyawan Swasta';
    const statusKepemilikan = getVal('Status Kepemilikan', 'Status Rumah') || 'Milik Sendiri';
    const luasBangunan = Number(getVal('Luas Bangunan (m²)', 'Luas Bangunan', 'LB')) || 54;
    const luasTanah = Number(getVal('Luas Tanah (m²)', 'Luas Tanah', 'LT')) || 72;
    const fungsiBangunan = getVal('Fungsi Bangunan', 'Peruntukan') || 'Rumah Tinggal';
    const golonganTarif = getVal('Golongan Tarif', 'Tarif') || '2A1 - Rumah Tangga';
    const skemaPembayaran = 'Lakukan Pembayaran';
    const rawBiaya = Number(getVal('Biaya Sambungan (Rp)', 'Biaya', 'Total Biaya'));
    const biayaSambungan = isNaN(rawBiaya) || rawBiaya <= 0 ? 1371545 : rawBiaya;
    const tanggal = getVal('Tanggal Pendaftaran', 'Tanggal', 'Tgl Daftar') || todayStr;

    // Detect step
    const rawTahap = getVal('Status Tahap Progres', 'Tahap', 'Status', 'Status Tahap');
    let trackingStep: 1 | 2 | 3 | 4 = 1;
    if (rawTahap.includes('4') || rawTahap.toLowerCase().includes('selesai') || rawTahap.toLowerCase().includes('alir')) {
      trackingStep = 4;
    } else if (rawTahap.includes('3') || rawTahap.toLowerCase().includes('pasang')) {
      trackingStep = 3;
    } else if (rawTahap.includes('2') || rawTahap.toLowerCase().includes('bayar')) {
      trackingStep = 2;
    }

    const rawStatusBayar = getVal('Status Pembayaran', 'Pembayaran');
    if (rawStatusBayar.toLowerCase().includes('lunas') && trackingStep === 1) {
      trackingStep = 2;
    }

    const regData: RegistrationFormData = {
      id: `reg-import-${Date.now()}-${index}`,
      noSr,
      noForm,
      idPelanggan,
      tanggal,
      namaKtp: nama,
      noKtp,
      alamatKtp: alamatPasang,
      rtRwKtp: rtRw,
      kodePosKtp: kodePos,
      kelurahanKtp: kelurahan,
      kecamatanKtp: kecamatan,
      desaKtp: kelurahan,
      telpHp,
      email,
      alamatPasang,
      rtRwPasang: rtRw,
      kodePosPasang: kodePos,
      kelurahanPasang: kelurahan,
      kecamatanPasang: kecamatan,
      desaPasang: kelurahan,
      pekerjaan,
      statusKepemilikan,
      persyaratan: {
        ktp: true,
        kk: true,
        pbb: true,
        suratDomisili: false,
        suratKuasaSewa: false,
        lainnya: false,
      },
      luasBangunan,
      luasTanah,
      totalLuasBangunan: luasBangunan,
      fungsiBangunan,
      kondisiBangunan: {
        jumlahLantai: 1,
        jumlahPenghuni: 4,
      },
      lingkungan: {
        saluranPembuangan: 'Got Tertutup',
        sanitasi: 'Septic Tank Pribadi',
        halaman: 'Ada Halaman',
        lebarJalan: 'Jalan Aspal > 3 Meter',
        lingkunganTertata: 'Perumahan / Tertata',
        realEstate: 'Non Real Estate',
      },
      skemaPembayaran,
      keteranganSkema: 'Lakukan Pembayaran',
      biayaSambungan,
      golonganTarif,
      trackingStep,
      dataPasang: {
        namaSales: 'Import Excel',
        tanggalSurvey: todayStr,
        noWorkOrder: `WO-${noForm}`,
        gpsLat: '-6.2234',
        gpsLong: '106.5123',
        namaKontraktor: 'PT Mitra Tirta Tangerang',
        dataAlamat: alamatPasang,
        dataJaringan: 'Pipa Tersier HDPE 63mm',
        dataGalian: ['Tanah Biasa'],
        luasBangunanSurvey: `${luasBangunan} m²`,
        kualitasBangunan: 'Permanen Baik',
        fotoProperti: '',
        diameterPipa: '1/2 Inchi (15mm)',
        panjangPipa: '6 meter',
        panjangPipaTipe: 'Standar (s/d 6m)',
        materialTambahan: 'Stop Kran, Kran Air',
        tanggalPasangMeter: todayStr,
        noSeriMeter: getVal('Nomor Meter Air', 'Nomor Meter') || `AET-2609-${noForm.slice(-4)}`,
        noSegel: getVal('Nomor Segel', 'Segel') || `SGL-AAT-${noForm.slice(-4)}`,
        namaTeknisi: getVal('Petugas Teknisi', 'Teknisi') || 'Bpk. Agus Santoso',
      },
      persetujuan: true,
      createdAt: todayStr,
    };

    results.push(regData);
  });

  return results;
}

export interface SurveyExcelRow {
  'No': number;
  'ID Responden': string;
  'Tanggal Survey': string;
  'Nama Pelanggan': string;
  'No. Pelanggan / SR': string;
  'Kelurahan / Desa': string;
  'Kecamatan': string;
  'Kepuasan Keseluruhan (CSAT)': number;
  'Rekomendasi (NPS)': number;
  'Kategori Masukan': string;
  'Kualitas Air (Skala 1-5)': number;
  'Kuantitas Air (Skala 1-5)': number;
  'Kontinuitas Aliran (Skala 1-5)': number;
  'Pelayanan Teknis (Skala 1-5)': number;
  'Penanganan Keluhan (Skala 1-5)': number;
  'Petugas Baca Meter (Skala 1-5)': number;
  'Transparansi Tagihan (Skala 1-5)': number;
  'Komentar / Masukan Pelanggan': string;
}

/**
 * Export data survey kepuasan pelanggan ke file Microsoft Excel (.xlsx)
 */
export function exportSurveysToExcel(surveys: SurveySubmission[]): void {
  const rows: SurveyExcelRow[] = surveys.map((srv, index) => {
    // Averages
    const avgKualitas = Number(
      (((srv.q1_kualitas_syarat || 5) + (srv.q2_kualitas_warna || 5) + (srv.q3_kualitas_bau || 5)) / 3).toFixed(1)
    );
    const avgKuantitas = Number(
      (((srv.q4_kuantitas_24jam || 5) + (srv.q5_kuantitas_volume || 5)) / 2).toFixed(1)
    );
    const avgKontinuitas = Number(
      (((srv.q6_kontinuitas_tekanan || 5) + (srv.q7_kontinuitas_penurunan || 5)) / 2).toFixed(1)
    );
    const avgTeknis = Number(
      (((srv.q8_teknis_kecepatan || 5) + (srv.q9_teknis_sikap || 5)) / 2).toFixed(1)
    );
    const avgKeluhan = Number(
      (((srv.q10_keluhan_ramah || 5) + (srv.q11_keluhan_cepat || 5) + (srv.q12_keluhan_komunikasi || 5)) / 3).toFixed(1)
    );
    const avgMeter = Number(
      (((srv.q13_meter_ramah || 5) + (srv.q14_meter_tanggap || 5) + (srv.q15_meter_akurat || 5)) / 3).toFixed(1)
    );
    const avgTagihan = Number(
      (((srv.q16_tagihan_alamat || 5) + (srv.q17_tagihan_m3 || 5) + (srv.q18_tagihan_pilihan || 5)) / 3).toFixed(1)
    );

    return {
      'No': index + 1,
      'ID Responden': srv.id || `SRV-${index + 1}`,
      'Tanggal Survey': srv.createdAt ? srv.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
      'Nama Pelanggan': srv.nama || '-',
      'No. Pelanggan / SR': srv.noPelangganOrSr || '-',
      'Kelurahan / Desa': srv.kelurahan || srv.desa || '-',
      'Kecamatan': srv.kecamatan || '-',
      'Kepuasan Keseluruhan (CSAT)': srv.csatOverall || 5,
      'Rekomendasi (NPS)': srv.npsScore || 10,
      'Kategori Masukan': srv.kategoriMasukan || 'Puas',
      'Kualitas Air (Skala 1-5)': srv.kualitasAir || avgKualitas,
      'Kuantitas Air (Skala 1-5)': avgKuantitas,
      'Kontinuitas Aliran (Skala 1-5)': srv.kontinuitasAliran || avgKontinuitas,
      'Pelayanan Teknis (Skala 1-5)': avgTeknis,
      'Penanganan Keluhan (Skala 1-5)': avgKeluhan,
      'Petugas Baca Meter (Skala 1-5)': avgMeter,
      'Transparansi Tagihan (Skala 1-5)': srv.kemudahanTagihan || avgTagihan,
      'Komentar / Masukan Pelanggan': srv.komentar || '-',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  const colWidths = [
    { wch: 6 },  // No
    { wch: 14 }, // ID Responden
    { wch: 16 }, // Tanggal
    { wch: 26 }, // Nama
    { wch: 18 }, // No Pelanggan / SR
    { wch: 18 }, // Kelurahan
    { wch: 18 }, // Kecamatan
    { wch: 28 }, // CSAT
    { wch: 20 }, // NPS
    { wch: 20 }, // Kategori
    { wch: 22 }, // Kualitas
    { wch: 22 }, // Kuantitas
    { wch: 26 }, // Kontinuitas
    { wch: 24 }, // Pelayanan Teknis
    { wch: 26 }, // Penanganan Keluhan
    { wch: 26 }, // Petugas Baca Meter
    { wch: 28 }, // Tagihan
    { wch: 45 }, // Komentar
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Survey Kepuasan');

  const todayStr = new Date().toISOString().slice(0, 10);
  const fileName = `Data_Survey_Kepuasan_Aetra_${todayStr}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

