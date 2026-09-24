import React, { useState, useRef, useEffect } from 'react';
import { RegistrationFormData, UploadedDoc, PropertyPhoto, UserAccount } from '../types';
import { AetraLogo } from './AetraLogo';
import { 
  FileText, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  MapPin, 
  User, 
  Wrench, 
  CreditCard,
  Droplets,
  HelpCircle,
  Camera,
  Home,
  Upload,
  Trash2,
  Image as ImageIcon,
  FileCheck,
  Eye,
  Plus,
  Landmark,
  Store,
  Compass,
  Check,
  Sparkles
} from 'lucide-react';
import { AETRA_SERVICE_AREAS, ALL_KELURAHAN_FLAT, KECAMATAN_LIST } from '../data/serviceAreas';
import { CameraCaptureModal } from './CameraCaptureModal';
import { PaymentPartnersGrid } from './PaymentPartnersGrid';
import { calculateDomesticTariff, DOMESTIC_TARIFF_RULES } from '../data/domesticTariffs';

export const KECAMATAN_POSTAL_MAP: Record<string, string> = {
  'Sepatan': '15520',
  'Sepatan Timur': '15520',
  'Pasar Kemis': '15560',
  'Sindang Jaya': '15560',
  'Cikupa': '15710',
  'Balaraja': '15610',
  'Sukamulya': '15610',
  'Jayanti': '15610',
};

export const SOSIAL_INSTANSI_OPTIONS = [
  'Tempat Ibadah',
  'Asrama Badan Sosial',
  'Rumah Yatim Piatu',
  'Kantor Instansi Pemerintah',
  'Kantor Perwakilan Asing',
  'Lembaga Swasta Non Komersial',
  'Instansi Perguruan / Kursus Instansi',
  'ABRI (TNI/POLRI)',
];

export const USAHA_OPTIONS = [
  'Kios/Warung',
  'Bengkel Kecil',
  'Usaha Kecil',
  'Pergudangan',
  'Usaha Kecil Dalam Rumah Tangga',
  'Tempat Pangkas Rambut',
  'Bengkel Menengah',
  'Usaha Menengah',
  'Usaha Menengah Dalam Rumah Tangga',
  'Penjahit',
  'Rumah Makan/Restoran Kecil',
  'RS. Swasta/Poliklinik/Lab',
  'Praktek Dokter',
  'Kantor Pengacara',
  'Steembath/Salon',
  'Perusahaan Perdagangan/Niaga /Ruko/Rukan',
];

export type KategoriFungsi = 'rumah_tangga' | 'sosial_instansi' | 'usaha';

interface RegistrationFormProps {
  onRegisterSuccess: (record: RegistrationFormData) => void;
  onNavigateTracking: (noForm: string) => void;
  currentUser?: UserAccount | null;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ 
  onRegisterSuccess, 
  onNavigateTracking,
  currentUser 
}) => {
  const [formData, setFormData] = useState<RegistrationFormData>(() => {
    return {
      id: 'reg-' + Date.now(),
      noSr: '',
      noForm: '',
      idPelanggan: currentUser?.idPelanggan || '10' + Math.floor(100000 + Math.random() * 900000),
      tanggal: new Date().toISOString().split('T')[0],
      namaKtp: currentUser?.nama || '',
      noKtp: '',
      alamatKtp: '',
      rtRwKtp: '',
      kecamatanKtp: '',
      desaKtp: '',
      kodePosKtp: '',
      kelurahanKtp: '',
      telpHp: '',
      email: currentUser?.email || '',
      alamatPasang: '',
      rtRwPasang: '',
      kecamatanPasang: '',
      desaPasang: '',
      kodePosPasang: '',
      kelurahanPasang: '',
      pekerjaan: '',
      statusKepemilikan: '',
      statusKepemilikanLainnya: '',
      persyaratan: {
        ktp: false,
        kk: false,
        pbb: false,
        suratDomisili: false,
        suratKuasaSewa: false,
        lainnya: false,
        keteranganLainnya: '',
      },
      persyaratanFiles: {},
      luasTanah: '',
      luasBangunan: '',
      totalLuasBangunan: '',
      fungsiBangunan: '',
      kondisiBangunan: {
        luasBangunan: '',
        totalLuasBangunan: '',
        jumlahLantai: '',
        jumlahPenghuni: '',
      },
      lingkungan: {
        saluranPembuangan: '',
        sanitasi: '',
        halaman: '',
        lebarJalan: '',
        lingkunganTertata: '',
        realEstate: '',
      },
      dataPasang: {
        namaSales: '',
        tanggalSurvey: '',
        noWorkOrder: '',
        gpsLat: '',
        gpsLong: '',
        namaKontraktor: '',
        dataAlamat: '',
        dataAlamatKoreksi: '',
        dataJaringan: '',
        dataGalian: [],
        luasBangunanSurvey: '',
        kualitasBangunan: '',
        fotoProperti: '',
        diameterPipa: '',
        panjangPipa: '',
        panjangPipaTipe: '',
        materialTambahan: '',
        materialStatus: '',
        tanggalPasangMeter: '',
        noSegel: '',
        noSeriMeter: '',
      },
      fotoPropertiFiles: [],
      skemaPembayaran: 'Bayar Lunas',
      keteranganSkema: 'Pelunasan Penuh (Sekaligus)',
      biayaSambungan: 1371545,
      persetujuan: false,
      trackingStep: 1,
      createdAt: new Date().toISOString(),
    };
  });

  const [notification, setNotification] = useState<string | null>(null);
  const [submittedRecord, setSubmittedRecord] = useState<RegistrationFormData | null>(null);
  const [previewModalImg, setPreviewModalImg] = useState<{ title: string; src: string } | null>(null);

  // Auto-camera modal configuration for mobile and laptop
  const [cameraModalConfig, setCameraModalConfig] = useState<{
    isOpen: boolean;
    targetType: 'document' | 'property';
    docKey?: 'ktp' | 'kk' | 'pbb' | 'suratDomisili' | 'suratKuasaSewa' | 'lainnya';
    title: string;
    guideType?: 'document' | 'property';
  }>({
    isOpen: false,
    targetType: 'document',
    title: 'Kamera Pengambilan Foto',
    guideType: 'document',
  });

  // Sync with currentUser when available
  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        idPelanggan: currentUser.idPelanggan || prev.idPelanggan,
        namaKtp: prev.namaKtp || currentUser.nama,
        email: prev.email || currentUser.email,
      }));
    }
  }, [currentUser]);

  // Service Area states for Kelurahan Pasang
  const [selectedKecamatanPasang, setSelectedKecamatanPasang] = useState<string>('Semua');

  const [kategoriFungsi, setKategoriFungsi] = useState<KategoriFungsi>(() => {
    if (formData.fungsiBangunan) {
      if (SOSIAL_INSTANSI_OPTIONS.includes(formData.fungsiBangunan)) return 'sosial_instansi';
      if (USAHA_OPTIONS.includes(formData.fungsiBangunan)) return 'usaha';
    }
    return 'rumah_tangga';
  });

  const handleSelectKategori = (cat: KategoriFungsi) => {
    setKategoriFungsi(cat);
    if (cat === 'rumah_tangga') {
      setFormData((prev) => ({
        ...prev,
        fungsiBangunan: 'Rumah Tangga',
        golonganTarif: '2A1 - Rumah Tangga Standard',
      }));
    } else if (cat === 'sosial_instansi') {
      const selected = SOSIAL_INSTANSI_OPTIONS.includes(formData.fungsiBangunan)
        ? formData.fungsiBangunan
        : SOSIAL_INSTANSI_OPTIONS[0];
      setFormData((prev) => ({
        ...prev,
        fungsiBangunan: selected,
        golonganTarif: '1 - Sosial & Instansi',
      }));
    } else if (cat === 'usaha') {
      const selected = USAHA_OPTIONS.includes(formData.fungsiBangunan)
        ? formData.fungsiBangunan
        : USAHA_OPTIONS[0];
      setFormData((prev) => ({
        ...prev,
        fungsiBangunan: selected,
        golonganTarif: '3 - Niaga / Usaha',
      }));
    }
  };

  const handleDocUpload = (
    docKey: 'ktp' | 'kk' | 'pbb' | 'suratDomisili' | 'suratKuasaSewa' | 'lainnya',
    e: React.ChangeEvent<HTMLInputElement>,
    source: 'camera' | 'file'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const docInfo: UploadedDoc = {
        id: 'doc-' + Date.now(),
        name: file.name || `${docKey.toUpperCase()}_${source}.jpg`,
        dataUrl,
        source,
        type: file.type,
        size: (file.size / 1024).toFixed(1) + ' KB',
        uploadedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setFormData((prev) => ({
        ...prev,
        persyaratan: { ...prev.persyaratan, [docKey]: true },
        persyaratanFiles: { ...(prev.persyaratanFiles || {}), [docKey]: docInfo },
      }));
      setNotification(`Dokumen ${docKey.toUpperCase()} berhasil diunggah (${source === 'camera' ? 'Kamera' : 'File'}).`);
      setTimeout(() => setNotification(null), 3000);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveDoc = (docKey: 'ktp' | 'kk' | 'pbb' | 'suratDomisili' | 'suratKuasaSewa' | 'lainnya') => {
    setFormData((prev) => {
      const updated = { ...(prev.persyaratanFiles || {}) };
      delete updated[docKey];
      return {
        ...prev,
        persyaratanFiles: updated,
      };
    });
  };

  // Direct snapshot handler from CameraCaptureModal (Laptop webcam or HP camera)
  const handleDirectCameraCapture = (dataUrl: string, fileName: string) => {
    if (cameraModalConfig.targetType === 'document' && cameraModalConfig.docKey) {
      const docKey = cameraModalConfig.docKey;
      const docInfo: UploadedDoc = {
        id: 'doc-' + Date.now(),
        name: fileName,
        dataUrl,
        source: 'camera',
        type: 'image/jpeg',
        size: Math.round((dataUrl.length * 3) / 4 / 1024) + ' KB',
        uploadedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setFormData((prev) => ({
        ...prev,
        persyaratan: { ...prev.persyaratan, [docKey]: true },
        persyaratanFiles: { ...(prev.persyaratanFiles || {}), [docKey]: docInfo },
      }));
      setNotification(`Foto dokumen ${docKey.toUpperCase()} berhasil diambil langsung via kamera perangkat.`);
    } else if (cameraModalConfig.targetType === 'property') {
      const newPhoto: PropertyPhoto = {
        id: 'photo-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        name: fileName,
        dataUrl,
        source: 'camera',
        caption: 'Foto Lokasi & Properti Lapangan (Kamera Perangkat)',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setFormData((prev) => ({
        ...prev,
        dataPasang: {
          ...prev.dataPasang,
          fotoProperti: 'Ada',
        },
        fotoPropertiFiles: [...(prev.fotoPropertiFiles || []), newPhoto],
      }));
      setNotification('Foto properti lapangan berhasil diambil langsung via kamera perangkat.');
    }
    setTimeout(() => setNotification(null), 3000);
  };

  const handlePropertyPhotoUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    source: 'camera' | 'file'
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const newPhoto: PropertyPhoto = {
          id: 'photo-' + Date.now() + '-' + index,
          name: file.name || `Foto_Properti_${Date.now()}.jpg`,
          dataUrl,
          source,
          caption: 'Foto Lokasi & Bangunan Pelanggan',
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        };
        setFormData((prev) => ({
          ...prev,
          dataPasang: {
            ...prev.dataPasang,
            fotoProperti: 'Ada',
          },
          fotoPropertiFiles: [...(prev.fotoPropertiFiles || []), newPhoto],
        }));
      };
      reader.readAsDataURL(file);
    });
    setNotification(`Foto properti lapangan berhasil ditambahkan (${source === 'camera' ? 'Kamera' : 'File'}).`);
    setTimeout(() => setNotification(null), 3000);
    e.target.value = '';
  };

  const handleRemovePropertyPhoto = (id: string) => {
    setFormData((prev) => {
      const remaining = (prev.fotoPropertiFiles || []).filter((p) => p.id !== id);
      return {
        ...prev,
        dataPasang: {
          ...prev.dataPasang,
          fotoProperti: remaining.length > 0 ? 'Ada' : '',
        },
        fotoPropertiFiles: remaining,
      };
    });
  };

  const handleReset = () => {
    setFormData({
      id: 'reg-' + Date.now(),
      noSr: '',
      noForm: '',
      tanggal: new Date().toISOString().split('T')[0],
      namaKtp: '',
      noKtp: '',
      alamatKtp: '',
      rtRwKtp: '',
      kodePosKtp: '',
      kelurahanKtp: '',
      telpHp: '',
      email: '',
      alamatPasang: '',
      rtRwPasang: '',
      kodePosPasang: '',
      kelurahanPasang: '',
      pekerjaan: '',
      statusKepemilikan: '',
      statusKepemilikanLainnya: '',
      persyaratan: {
        ktp: false,
        kk: false,
        pbb: false,
        suratDomisili: false,
        suratKuasaSewa: false,
        lainnya: false,
        keteranganLainnya: '',
      },
      persyaratanFiles: {},
      luasTanah: '',
      luasBangunan: '',
      totalLuasBangunan: '',
      idPelanggan: '10' + Math.floor(100000 + Math.random() * 900000),
      fungsiBangunan: '',
      kondisiBangunan: {
        luasBangunan: '',
        totalLuasBangunan: '',
        jumlahLantai: '',
        jumlahPenghuni: '',
      },
      lingkungan: {
        saluranPembuangan: '',
        sanitasi: '',
        halaman: '',
        lebarJalan: '',
        lingkunganTertata: '',
        realEstate: '',
      },
      dataPasang: {
        namaSales: '',
        tanggalSurvey: '',
        noWorkOrder: '',
        gpsLat: '',
        gpsLong: '',
        namaKontraktor: '',
        dataAlamat: '',
        dataAlamatKoreksi: '',
        dataJaringan: '',
        dataGalian: [],
        luasBangunanSurvey: '',
        kualitasBangunan: '',
        fotoProperti: '',
        diameterPipa: '',
        panjangPipa: '',
        panjangPipaTipe: '',
        materialTambahan: '',
        materialStatus: '',
        tanggalPasangMeter: '',
        noSegel: '',
        noSeriMeter: '',
      },
      fotoPropertiFiles: [],
      skemaPembayaran: '',
      keteranganSkema: '',
      biayaSambungan: 0,
      persetujuan: false,
      trackingStep: 1,
      createdAt: new Date().toISOString(),
    });
    setKategoriFungsi('rumah_tangga');
    setNotification('Formulir berhasil dikosongkan.');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCopyAlamatKtp = () => {
    setFormData((prev) => ({
      ...prev,
      alamatPasang: prev.alamatKtp,
      rtRwPasang: prev.rtRwKtp,
      kecamatanPasang: prev.kecamatanKtp,
      desaPasang: prev.desaKtp || prev.kelurahanKtp,
      kelurahanPasang: prev.desaKtp || prev.kelurahanKtp,
      kodePosPasang: prev.kodePosKtp,
    }));
    setNotification('Alamat pemasangan disamakan dengan alamat KTP.');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleGalianToggle = (item: string) => {
    setFormData((prev) => {
      const exists = prev.dataPasang.dataGalian.includes(item);
      const newGalian = exists
        ? prev.dataPasang.dataGalian.filter((g) => g !== item)
        : [...prev.dataPasang.dataGalian, item];
      return {
        ...prev,
        dataPasang: {
          ...prev.dataPasang,
          dataGalian: newGalian,
        },
      };
    });
  };

  // Automatic Domestic Tariff Determination based on Tapak, Lantai, Kawasan, and Usaha
  const tapakComputed = parseFloat(String(formData.luasBangunan || '0')) || 0;
  const lantaiComputed = Number(formData.kondisiBangunan.jumlahLantai) || 1;
  const totalLuasComputed = tapakComputed > 0 ? tapakComputed * lantaiComputed : 0;
  const isRealEstateComputed =
    formData.lingkungan.realEstate === 'Ya' ||
    formData.lingkungan.realEstate === 'Real Estate / Cluster / Komplek' ||
    formData.lingkungan.realEstate === 'real_estate';
  const hasUsahaComputed =
    Boolean(formData.hasUsahaKomersil) ||
    Boolean(formData.fungsiBangunan && USAHA_OPTIONS.includes(formData.fungsiBangunan)) ||
    (formData.fungsiBangunan ? formData.fungsiBangunan.toLowerCase().includes('usaha') : false);

  const autoTariff = totalLuasComputed > 0 ? calculateDomesticTariff(totalLuasComputed, isRealEstateComputed, hasUsahaComputed) : null;

  // Auto-sync tariff into formData
  useEffect(() => {
    if (autoTariff) {
      setFormData((prev) => {
        if (
          prev.golonganTarif === autoTariff.name &&
          prev.kategoriTarifKlausul === autoTariff.appliedClause &&
          prev.totalLuasBangunan === totalLuasComputed
        ) {
          return prev;
        }
        return {
          ...prev,
          golonganTarif: autoTariff.name,
          kategoriTarifKlausul: autoTariff.appliedClause,
          totalLuasBangunan: totalLuasComputed,
          kondisiBangunan: {
            ...prev.kondisiBangunan,
            totalLuasBangunan: totalLuasComputed,
            luasBangunan: prev.luasBangunan,
          },
        };
      });
    }
  }, [autoTariff, totalLuasComputed]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi seluruh isian wajib (kecuali Data Pasang Meter / Petugas Survey Lapangan)
    const missing: string[] = [];

    // 1. Data Pelanggan & Alamat
    if (!formData.namaKtp?.trim()) missing.push('Nama Pemohon Sesuai KTP');
    if (!formData.noKtp?.trim()) missing.push('Nomor KTP (NIK)');
    if (!formData.alamatKtp?.trim()) missing.push('Alamat Sesuai KTP');
    if (!formData.rtRwKtp?.trim()) missing.push('RT/RW KTP');
    if (!formData.kecamatanKtp?.trim()) missing.push('Kecamatan KTP');
    if (!formData.desaKtp?.trim() && !formData.kelurahanKtp?.trim()) missing.push('Desa KTP');
    if (!formData.kodePosKtp?.trim()) missing.push('Kode Pos KTP');
    if (!formData.telpHp?.trim()) missing.push('No. Telepon / WhatsApp');
    if (!formData.email?.trim()) missing.push('Email');
    if (!formData.pekerjaan?.trim()) missing.push('Pekerjaan Pemohon');
    if (!formData.statusKepemilikan?.trim()) missing.push('Status Kepemilikan Rumah');

    // Alamat Pemasangan
    if (!formData.alamatPasang?.trim()) missing.push('Alamat Lokasi Pemasangan');
    if (!formData.rtRwPasang?.trim()) missing.push('RT/RW Lokasi Pasang');
    if (!formData.kecamatanPasang?.trim()) missing.push('Kecamatan Lokasi Pasang');
    if (!formData.desaPasang?.trim() && !formData.kelurahanPasang?.trim()) missing.push('Desa Lokasi Pasang');
    if (!formData.kodePosPasang?.trim()) missing.push('Kode Pos Lokasi Pasang');

    // 2. Data Bangunan
    if (!formData.luasTanah || String(formData.luasTanah).trim() === '') missing.push('Luas Tanah (m²)');
    if (!formData.luasBangunan || String(formData.luasBangunan).trim() === '') missing.push('Luas Bangunan (m²)');
    if (!formData.fungsiBangunan?.trim()) missing.push('Fungsi / Peruntukan Bangunan');

    // 3. Kondisi Bangunan & Lingkungan
    if (!formData.kondisiBangunan.jumlahLantai || String(formData.kondisiBangunan.jumlahLantai).trim() === '') missing.push('Jumlah Lantai');
    if (!formData.kondisiBangunan.jumlahPenghuni || String(formData.kondisiBangunan.jumlahPenghuni).trim() === '') missing.push('Jumlah Penghuni (Jiwa)');
    if (!formData.lingkungan.saluranPembuangan) missing.push('Saluran Pembuangan');
    if (!formData.lingkungan.sanitasi) missing.push('Sanitasi');
    if (!formData.lingkungan.halaman) missing.push('Halaman');
    if (!formData.lingkungan.lebarJalan) missing.push('Lebar Jalan');
    if (!formData.lingkungan.lingkunganTertata) missing.push('Lingkungan Tertata');
    if (!formData.lingkungan.realEstate) missing.push('Kawasan Real Estate');

    // 5. Persetujuan
    if (!formData.persetujuan) missing.push('Centang Persetujuan Syarat & Ketentuan');

    if (missing.length > 0) {
      alert(`Mohon lengkapi seluruh data wajib berikut sebelum mengirim formulir (Data Pasang Meter / Petugas Survey Lapangan tidak wajib):\n\n• ${missing.slice(0, 8).join('\n• ')}${missing.length > 8 ? `\n...dan ${missing.length - 8} data wajib lainnya.` : ''}`);
      return;
    }

    const finalNoSr = formData.noSr.trim() || 'SR-' + Math.floor(100000 + Math.random() * 900000);
    const finalNoForm = formData.noForm.trim() || 'FM-' + Math.floor(100000 + Math.random() * 900000);
    const finalIdPelanggan = formData.idPelanggan?.trim() || ('10' + Math.floor(100000 + Math.random() * 900000));

    const finalFungsiBangunan =
      formData.fungsiBangunan ||
      (kategoriFungsi === 'rumah_tangga'
        ? 'Rumah Tangga'
        : kategoriFungsi === 'sosial_instansi'
        ? SOSIAL_INSTANSI_OPTIONS[0]
        : USAHA_OPTIONS[0]);

    const parsedLantai = Number(formData.kondisiBangunan.jumlahLantai) || 1;
    const parsedLuas = parseFloat(String(formData.luasBangunan || '0')) || 0;
    const computedTotalLuas = parsedLuas * parsedLantai;

    const isRealEstate =
      formData.lingkungan.realEstate === 'Ya' ||
      formData.lingkungan.realEstate === 'Real Estate / Cluster / Komplek' ||
      formData.lingkungan.realEstate === 'real_estate';

    const hasUsaha =
      Boolean(formData.hasUsahaKomersil) ||
      kategoriFungsi === 'usaha' ||
      Boolean(formData.fungsiBangunan && USAHA_OPTIONS.includes(formData.fungsiBangunan)) ||
      (formData.fungsiBangunan ? formData.fungsiBangunan.toLowerCase().includes('usaha') : false);

    const domesticResult = computedTotalLuas > 0 ? calculateDomesticTariff(computedTotalLuas, isRealEstate, hasUsaha) : null;

    const finalGolonganTarif =
      domesticResult?.name ||
      formData.golonganTarif ||
      (kategoriFungsi === 'sosial_instansi'
        ? '1 - Sosial & Instansi'
        : kategoriFungsi === 'usaha'
        ? '3 - Niaga / Usaha'
        : 'R2 = Rumah Tangga 2');

    const finalKategoriKlausul = domesticResult?.appliedClause || formData.kategoriTarifKlausul || '';

    const newRecord: RegistrationFormData = {
      ...formData,
      totalLuasBangunan: computedTotalLuas,
      kondisiBangunan: {
        ...formData.kondisiBangunan,
        totalLuasBangunan: computedTotalLuas,
        luasBangunan: formData.luasBangunan,
      },
      hasUsahaKomersil: hasUsaha,
      idPelanggan: finalIdPelanggan,
      fungsiBangunan: finalFungsiBangunan,
      golonganTarif: finalGolonganTarif,
      kategoriTarifKlausul: finalKategoriKlausul,
      noSr: finalNoSr,
      noForm: finalNoForm,
      id: 'reg-' + Date.now(),
      createdAt: new Date().toISOString(),
    };

    onRegisterSuccess(newRecord);
    setSubmittedRecord(newRecord);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Fast Controls */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Formulir Pendaftaran Sambungan Baru Rumah Tangga
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Sistem formulir pendaftaran sambungan baru resmi PT Aetra Air Tangerang. Silakan isi formulir dengan lengkap dan benar sesuai identitas KTP dan data properti Anda.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            Reset Formulir
          </button>
        </div>
      </div>

      {notification && (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 text-xs px-4 py-3 rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Submitted Success Card if just submitted */}
      {submittedRecord && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-emerald-950">
                  Pendaftaran Berhasil Disimpan ke Sistem!
                </h3>
                <div className="flex items-center gap-2 flex-wrap mt-1">
                  <span className="text-xs text-slate-700 font-semibold">ID Pelanggan (Kode Bayar):</span>
                  <span className="font-mono text-sm font-black text-emerald-900 bg-white px-2.5 py-0.5 rounded border border-emerald-400 shadow-2xs">
                    {submittedRecord.idPelanggan}
                  </span>
                  <span className="text-xs text-slate-500">&bull; No. SR: <strong>{submittedRecord.noSr}</strong> &bull; No. Form: <strong>{submittedRecord.noForm}</strong></span>
                </div>
                <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                  Pendaftaran atas nama <strong>{submittedRecord.namaKtp}</strong> telah aktif. Gunakan <strong>ID Pelanggan ({submittedRecord.idPelanggan})</strong> untuk pelunasan biaya sambungan di 9 mitra external payment resmi Aetra.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTracking(submittedRecord.noForm)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-sm"
            >
              Lihat di Live Tracking Sekarang &rarr;
            </button>
          </div>
        </div>
      )}

      {/* THE HARDCOPY FORM CONTAINER (Designed to match the physical paper in Photo 1) */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-300 shadow-md overflow-hidden">
        {/* Paper Form Header */}
        <div className="bg-linear-to-r from-[#005DAA] via-[#004B8A] to-[#003868] text-white p-6 border-b-4 border-[#F37021]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="bg-white px-3.5 py-1.5 rounded-xl inline-flex items-center shadow-xs">
                <AetraLogo size="sm" variant="horizontal" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight uppercase">
                Formulir Pendaftaran Sambungan Baru Rumah Tangga
              </h1>
              <p className="text-xs text-blue-100 mt-0.5">
                Surat Permohonan Pemasangan Pipa Dinas &amp; Meter Air Minum PT Aetra Air Tangerang
              </p>
            </div>

            {/* SR Badge, Form Number, & Auto Customer ID box */}
            <div className="bg-white/10 backdrop-blur-xs border border-white/20 p-3 rounded-xl flex items-center gap-4 sm:gap-6 flex-wrap">
              <div>
                <div className="text-[10px] text-blue-200 uppercase font-semibold">No. SR (Sambungan)</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs font-bold text-orange-300">SR -</span>
                  <input
                    type="text"
                    value={formData.noSr}
                    onChange={(e) => setFormData({ ...formData, noSr: e.target.value })}
                    className="w-24 bg-white text-[#005DAA] px-2 py-1 rounded font-mono font-black text-sm text-center border-none focus:ring-2 focus:ring-[#F37021]"
                    placeholder="No. SR"
                  />
                </div>
              </div>
              <div className="border-l border-white/20 pl-4">
                <div className="text-[10px] text-blue-200 uppercase font-semibold">No. Form</div>
                <input
                  type="text"
                  value={formData.noForm}
                  onChange={(e) => setFormData({ ...formData, noForm: e.target.value })}
                  className="w-24 bg-white/90 text-slate-900 px-2 py-1 rounded font-mono font-bold text-sm text-center mt-0.5 focus:ring-2 focus:ring-[#F37021]"
                  placeholder="No. Form"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Body with hardcopy sections */}
        <div className="p-6 sm:p-8 space-y-8 bg-slate-50/40">
          {/* SECTION 1: DATA IDENTITAS PELANGGAN */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200 mb-5">
              <User className="w-5 h-5 text-blue-700" />
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                Data Identitas Pemohon / Pelanggan
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Tanggal & Nama */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Pendaftaran
                </label>
                <input
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pekerjaan Pemohon
                </label>
                <input
                  type="text"
                  value={formData.pekerjaan}
                  onChange={(e) => setFormData({ ...formData, pekerjaan: e.target.value })}
                  placeholder="Masukkan pekerjaan pemohon"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Nama Sesuai KTP */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800">
                    Nama Lengkap (Sesuai KTP) <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">HURUF KAPITAL</span>
                </div>
                <input
                  type="text"
                  required
                  value={formData.namaKtp}
                  onChange={(e) => setFormData({ ...formData, namaKtp: e.target.value.toUpperCase() })}
                  placeholder="Masukkan nama lengkap sesuai KTP"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-lg text-sm font-bold tracking-wider text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-0 focus:outline-hidden"
                />
              </div>

              {/* No. KTP / NIK */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800">
                    Nomor KTP (NIK 16 Digit) <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">{formData.noKtp.length} / 16 digit</span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={16}
                  value={formData.noKtp}
                  onChange={(e) => setFormData({ ...formData, noKtp: e.target.value.replace(/\D/g, '') })}
                  placeholder="16 digit NIK"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono tracking-widest font-semibold focus:bg-white focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              {/* Telepon & Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  No. Telepon / WhatsApp / HP <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.telpHp}
                  onChange={(e) => setFormData({ ...formData, telpHp: e.target.value })}
                  placeholder="Nomor telepon / WhatsApp"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email (Opsional untuk Tagihan Elektronik)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@contoh.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Alamat Sesuai KTP */}
              <div className="md:col-span-2 space-y-3 pt-2 border-t border-slate-100 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#005DAA]" />
                    Alamat Sesuai KTP <span className="text-red-500">*</span>
                  </label>
                </div>
                <input
                  type="text"
                  required
                  value={formData.alamatKtp}
                  onChange={(e) => setFormData({ ...formData, alamatKtp: e.target.value })}
                  placeholder="Alamat jalan / nomor rumah sesuai KTP *"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#005DAA] focus:outline-hidden"
                />
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      RT / RW <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.rtRwKtp}
                      onChange={(e) => setFormData({ ...formData, rtRwKtp: e.target.value })}
                      placeholder="000/000"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Kecamatan <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.kecamatanKtp || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          kecamatanKtp: e.target.value,
                          kelurahanKtp: '',
                          desaKtp: '',
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs uppercase font-bold text-slate-900 focus:ring-2 focus:ring-blue-200 focus:outline-hidden"
                    >
                      <option value="">-- PILIH KECAMATAN --</option>
                      {AETRA_SERVICE_AREAS.map((area) => (
                        <option key={area.kecamatan} value={area.kecamatan}>
                          KEC. {area.kecamatan}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Pilih Desa <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.desaKtp || formData.kelurahanKtp || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          desaKtp: e.target.value,
                          kelurahanKtp: e.target.value,
                        })
                      }
                      disabled={!formData.kecamatanKtp}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs uppercase font-bold text-slate-900 focus:ring-2 focus:ring-blue-200 focus:outline-hidden disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <option value="">-- PILIH DESA --</option>
                      {formData.kecamatanKtp &&
                        AETRA_SERVICE_AREAS.find((a) => a.kecamatan === formData.kecamatanKtp)?.desaList.map((desa) => (
                          <option key={desa} value={desa}>
                            DESA {desa.toUpperCase()}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Kode Pos <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.kodePosKtp}
                      onChange={(e) => setFormData({ ...formData, kodePosKtp: e.target.value })}
                      placeholder="Contoh: 15710"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-hidden font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Alamat Yang Akan Dipasang */}
              <div className="md:col-span-2 space-y-3 pt-3 border-t border-slate-100 bg-blue-50/50 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    Alamat Lokasi (Yang Akan Dipasang Sambungan Air) <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleCopyAlamatKtp}
                    className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 underline"
                  >
                    Samakan dengan Alamat KTP
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={formData.alamatPasang}
                  onChange={(e) => setFormData({ ...formData, alamatPasang: e.target.value })}
                  placeholder="Alamat lengkap lokasi pemasangan sambungan air *"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      RT / RW Pasang <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.rtRwPasang}
                      onChange={(e) => setFormData({ ...formData, rtRwPasang: e.target.value })}
                      placeholder="000/000"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-blue-950 mb-1">
                      Kecamatan <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.kecamatanPasang || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          kecamatanPasang: e.target.value,
                          kelurahanPasang: '',
                          desaPasang: '',
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border-2 border-blue-400 focus:border-[#005DAA] rounded-lg text-xs uppercase font-bold text-slate-900 focus:ring-2 focus:ring-blue-200 focus:outline-hidden shadow-2xs"
                    >
                      <option value="">-- PILIH KECAMATAN --</option>
                      {AETRA_SERVICE_AREAS.map((area) => (
                        <option key={area.kecamatan} value={area.kecamatan}>
                          KEC. {area.kecamatan}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-blue-950 mb-1">
                      Pilih Desa <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.desaPasang || formData.kelurahanPasang || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          desaPasang: e.target.value,
                          kelurahanPasang: e.target.value,
                        })
                      }
                      disabled={!formData.kecamatanPasang}
                      className="w-full px-2.5 py-1.5 bg-white border-2 border-blue-400 focus:border-[#005DAA] rounded-lg text-xs uppercase font-bold text-slate-900 focus:ring-2 focus:ring-blue-200 focus:outline-hidden shadow-2xs disabled:bg-slate-100 disabled:border-slate-300 disabled:text-slate-400"
                    >
                      <option value="">-- PILIH DESA --</option>
                      {formData.kecamatanPasang &&
                        AETRA_SERVICE_AREAS.find((a) => a.kecamatan === formData.kecamatanPasang)?.desaList.map((desa) => (
                          <option key={desa} value={desa}>
                            DESA {desa.toUpperCase()}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Kode Pos <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.kodePosPasang}
                      onChange={(e) => setFormData({ ...formData, kodePosPasang: e.target.value })}
                      placeholder="Contoh: 15710"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-hidden font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Status Kepemilikan Rumah */}
              <div className="md:col-span-2 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Home className="w-4 h-4 text-[#005DAA]" />
                    Status Kepemilikan Rumah <span className="text-red-500">*</span>
                  </label>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
                  {[
                    { id: 'Rumah Sendiri', label: 'Rumah Sendiri' },
                    { id: 'Kontrak / Sewa', label: 'Kontrak / Sewa' },
                    { id: 'Dinas', label: 'Dinas' },
                    { id: 'Milik Keluarga / Orang Tua', label: 'Milik Keluarga / Ortu' },
                    { id: 'KPR / Angsuran Bank', label: 'KPR / Cicilan' },
                    { id: 'Lainnya', label: 'Lainnya' },
                  ].map((item) => (
                    <label
                      key={item.id}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition ${
                        formData.statusKepemilikan === item.id
                          ? 'border-[#005DAA] bg-blue-50/80 text-[#005DAA] font-bold shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100/60'
                      }`}
                    >
                      <input
                        type="radio"
                        name="statusKepemilikan"
                        checked={formData.statusKepemilikan === item.id}
                        onChange={() => setFormData({ ...formData, statusKepemilikan: item.id })}
                        className="text-[#005DAA] focus:ring-[#005DAA]"
                      />
                      <span className="text-xs">{item.label}</span>
                    </label>
                  ))}
                </div>

                {/* Kolom Isian Keterangan Lainnya */}
                <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700 shrink-0">
                    Keterangan Status Kepemilikan (Lainnya):
                  </span>
                  <input
                    type="text"
                    value={formData.statusKepemilikanLainnya || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        statusKepemilikanLainnya: e.target.value,
                        statusKepemilikan: formData.statusKepemilikan || 'Lainnya',
                      })
                    }
                    placeholder="Tuliskan keterangan status kepemilikan (misal: Rumah Warisan, Hak Pakai, Menumpang, dll.)"
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#005DAA] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Persyaratan yang Dilampirkan & Upload Kamera/File */}
              <div className="md:col-span-2 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
                  <div>
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#005DAA]" />
                      Persyaratan Dokumen &amp; Unggah Berkas / Kamera
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Unggah dokumen persyaratan menggunakan kamera ponsel langsung atau pilih file dari perangkat.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  {[
                    { key: 'ktp' as const, label: 'KTP', desc: 'Kartu Tanda Penduduk pemohon' },
                    { key: 'kk' as const, label: 'KK', desc: 'Kartu Keluarga pemohon' },
                    { key: 'pbb' as const, label: 'Bukti Lunas PBB', desc: 'Surat bukti lunas PBB tahun berjalan' },
                    { key: 'suratDomisili' as const, label: 'Surat Domisili', desc: 'Surat keterangan domisili RT/RW/Kelurahan' },
                    { key: 'suratKuasaSewa' as const, label: 'Surat Kuasa Sewa', desc: 'Surat izin pemilik jika mengontrak/sewa' },
                    { key: 'lainnya' as const, label: 'Dokumen Lainnya', desc: 'Dokumen pendukung permohonan lainnya' },
                  ].map((doc) => {
                    const isChecked = !!formData.persyaratan[doc.key];
                    const uploadedFile = formData.persyaratanFiles?.[doc.key];

                    return (
                      <div
                        key={doc.key}
                        className={`p-3 rounded-xl border transition flex flex-col justify-between ${
                          isChecked
                            ? 'border-[#005DAA] bg-white shadow-xs ring-1 ring-[#005DAA]/20'
                            : 'border-slate-200 bg-white/70 hover:bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    persyaratan: { ...formData.persyaratan, [doc.key]: e.target.checked },
                                  })
                                }
                                className="rounded text-[#005DAA] focus:ring-[#005DAA] w-4 h-4"
                              />
                              <span className="font-bold text-slate-900 text-xs">{doc.label}</span>
                            </label>
                            {uploadedFile && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                <FileCheck className="w-3 h-3" /> Terunggah
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 pl-6 leading-relaxed">{doc.desc}</p>
                        </div>

                        {/* Upload Status & Action Buttons */}
                        <div className="mt-3 pt-2.5 border-t border-slate-100">
                          {uploadedFile ? (
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                                <div className="flex items-center gap-2 min-w-0">
                                  {uploadedFile.dataUrl.startsWith('data:image/') ? (
                                    <img
                                      src={uploadedFile.dataUrl}
                                      alt={doc.label}
                                      className="w-8 h-8 rounded object-cover border border-slate-300 shrink-0 cursor-pointer"
                                      onClick={() => setPreviewModalImg({ title: doc.label, src: uploadedFile.dataUrl })}
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center shrink-0 text-[#005DAA]">
                                      <FileText className="w-4 h-4" />
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="text-[11px] font-semibold text-slate-800 truncate" title={uploadedFile.name}>
                                      {uploadedFile.name}
                                    </p>
                                    <p className="text-[10px] text-slate-500">
                                      {uploadedFile.size} • {uploadedFile.source === 'camera' ? '📷 Kamera' : '📁 File'}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  {uploadedFile.dataUrl.startsWith('data:image/') && (
                                    <button
                                      type="button"
                                      onClick={() => setPreviewModalImg({ title: doc.label, src: uploadedFile.dataUrl })}
                                      className="p-1 text-slate-500 hover:text-[#005DAA] rounded hover:bg-slate-200 transition"
                                      title="Lihat Pratinjau"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveDoc(doc.key)}
                                    className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50 transition"
                                    title="Hapus Dokumen"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              {/* Kamera Button with Auto Device Camera */}
                              <button
                                type="button"
                                onClick={() =>
                                  setCameraModalConfig({
                                    isOpen: true,
                                    targetType: 'document',
                                    docKey: doc.key,
                                    title: `Kamera Pemotretan ${doc.label}`,
                                    guideType: 'document',
                                  })
                                }
                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-[#005DAA] rounded-lg font-bold text-[11px] border border-blue-200 transition shadow-2xs"
                                title="Buka Kamera Perangkat Langsung (Laptop / HP)"
                              >
                                <Camera className="w-3.5 h-3.5 text-[#005DAA]" />
                                <span>Buka Kamera</span>
                              </button>

                              {/* File Button */}
                              <label className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-[11px] cursor-pointer border border-slate-200 transition">
                                <Upload className="w-3.5 h-3.5 text-slate-500" />
                                <span>Pilih File</span>
                                <input
                                  type="file"
                                  accept="image/*,.pdf,.doc,.docx"
                                  onChange={(e) => handleDocUpload(doc.key, e, 'file')}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Kolom Isian Persyaratan Lainnya */}
                <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700 shrink-0">
                    Keterangan Dokumen Persyaratan (Lainnya):
                  </span>
                  <input
                    type="text"
                    value={formData.persyaratan.keteranganLainnya || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        persyaratan: {
                          ...formData.persyaratan,
                          keteranganLainnya: e.target.value,
                          lainnya: e.target.value.length > 0 ? true : formData.persyaratan.lainnya,
                        },
                      })
                    }
                    placeholder="Tuliskan dokumen persyaratan tambahan lainnya jika ada (misal: Akta Jual Beli, Perjanjian Sewa, Surat Keterangan RT/RW)"
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#005DAA] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Luas Tanah & Bangunan (Sesuai PBB) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Luas Tanah (Sesuai PBB)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.luasTanah}
                    onChange={(e) => setFormData({ ...formData, luasTanah: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:bg-white focus:outline-hidden pr-8"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400 font-medium">m²</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Luas Bangunan (Sesuai PBB)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.luasBangunan}
                    onChange={(e) => setFormData({ ...formData, luasBangunan: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:bg-white focus:outline-hidden pr-8"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400 font-medium">m²</span>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: FUNGSI BANGUNAN */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-5">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#005DAA]" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                    Fungsi Bangunan
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pilih kategori peruntukan bangunan: Rumah Tangga, Sosial &amp; Instansi, atau Usaha
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-block px-2.5 py-1 bg-blue-50 text-[#005DAA] text-[11px] font-bold rounded-lg border border-blue-200">
                Terpilih: {formData.fungsiBangunan || 'Belum Dipilih'}
              </span>
            </div>

            {/* 3 Main Categories Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Opsi 1: Rumah Tangga */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleSelectKategori('rumah_tangga')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectKategori('rumah_tangga'); }}
                className={`p-4 rounded-xl border-2 cursor-pointer transition text-left relative flex flex-col justify-between ${
                  kategoriFungsi === 'rumah_tangga'
                    ? 'border-[#005DAA] bg-blue-50/70 shadow-xs ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      kategoriFungsi === 'rumah_tangga' ? 'bg-[#005DAA] text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Home className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="radio"
                      name="kategoriFungsi"
                      checked={kategoriFungsi === 'rumah_tangga'}
                      onChange={() => handleSelectKategori('rumah_tangga')}
                      className="w-4 h-4 text-[#005DAA] focus:ring-[#005DAA]"
                    />
                    <span className="text-sm font-bold text-slate-900">
                      Rumah Tangga
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Hunian keluarga, rumah tinggal perorangan, dan pemakaian domestik
                  </p>
                </div>
              </div>

              {/* Opsi 2: Sosial & Instansi */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleSelectKategori('sosial_instansi')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectKategori('sosial_instansi'); }}
                className={`p-4 rounded-xl border-2 cursor-pointer transition text-left relative flex flex-col justify-between ${
                  kategoriFungsi === 'sosial_instansi'
                    ? 'border-[#005DAA] bg-blue-50/70 shadow-xs ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      kategoriFungsi === 'sosial_instansi' ? 'bg-[#005DAA] text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Landmark className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="radio"
                      name="kategoriFungsi"
                      checked={kategoriFungsi === 'sosial_instansi'}
                      onChange={() => handleSelectKategori('sosial_instansi')}
                      className="w-4 h-4 text-[#005DAA] focus:ring-[#005DAA]"
                    />
                    <span className="text-sm font-bold text-slate-900">
                      Sosial &amp; Instansi
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Tempat ibadah, panti asuhan, kantor pemerintah, lembaga non-komersial hingga ABRI
                  </p>
                </div>
              </div>

              {/* Opsi 3: Usaha */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleSelectKategori('usaha')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectKategori('usaha'); }}
                className={`p-4 rounded-xl border-2 cursor-pointer transition text-left relative flex flex-col justify-between ${
                  kategoriFungsi === 'usaha'
                    ? 'border-[#005DAA] bg-blue-50/70 shadow-xs ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      kategoriFungsi === 'usaha' ? 'bg-[#005DAA] text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Store className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="radio"
                      name="kategoriFungsi"
                      checked={kategoriFungsi === 'usaha'}
                      onChange={() => handleSelectKategori('usaha')}
                      className="w-4 h-4 text-[#005DAA] focus:ring-[#005DAA]"
                    />
                    <span className="text-sm font-bold text-slate-900">
                      Usaha
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Kios, warung, bengkel, toko, restoran, klinik, perkantoran, perniagaan, hingga ruko
                  </p>
                </div>
              </div>
            </div>

            {/* Sub-panel berdasarkan kategori terpilih */}
            {kategoriFungsi === 'rumah_tangga' && (
              <div className="mt-4 p-4 rounded-xl bg-blue-50/60 border border-blue-200 flex items-start gap-3">
                <Home className="w-5 h-5 text-[#005DAA] shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Peruntukan Terpilih: Rumah Tangga (Domestik)</div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Sambungan dialokasikan untuk pemakaian tempat tinggal keluarga. Rincian jumlah ruangan fisik dan sarana prasarana lingkungan dapat Anda isi pada <strong>Kondisi Bangunan dan Lingkungan</strong> di bawah.
                  </p>
                </div>
              </div>
            )}

            {kategoriFungsi === 'sosial_instansi' && (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-[#005DAA]" />
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      Pilihan Kategori Sosial &amp; Instansi (Tempat Ibadah hingga ABRI):
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">Pilih salah satu peruntukan</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {SOSIAL_INSTANSI_OPTIONS.map((opt) => (
                    <label
                      key={opt}
                      className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                        formData.fungsiBangunan === opt
                          ? 'border-[#005DAA] bg-blue-50 text-[#005DAA] font-bold shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100/80'
                      }`}
                    >
                      <input
                        type="radio"
                        name="subFungsiBangunan"
                        checked={formData.fungsiBangunan === opt}
                        onChange={() => setFormData({ ...formData, fungsiBangunan: opt })}
                        className="text-[#005DAA] focus:ring-[#005DAA] w-3.5 h-3.5"
                      />
                      <span className="leading-snug">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {kategoriFungsi === 'usaha' && (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-[#005DAA]" />
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      Pilihan Kategori Usaha (Kios/Warung hingga Perusahaan Perdagangan/Niaga/Ruko):
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">Pilih salah satu jenis usaha</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {USAHA_OPTIONS.map((opt) => (
                    <label
                      key={opt}
                      className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                        formData.fungsiBangunan === opt
                          ? 'border-[#005DAA] bg-blue-50 text-[#005DAA] font-bold shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100/80'
                      }`}
                    >
                      <input
                        type="radio"
                        name="subFungsiBangunan"
                        checked={formData.fungsiBangunan === opt}
                        onChange={() => setFormData({ ...formData, fungsiBangunan: opt })}
                        className="text-[#005DAA] focus:ring-[#005DAA] w-3.5 h-3.5"
                      />
                      <span className="leading-snug">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* SECTION 3: KONDISI BANGUNAN DAN LINGKUNGAN (Hanya muncul jika opsi Rumah Tangga dipilih) */}
          {kategoriFungsi === 'rumah_tangga' && (
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200 mb-5">
              <MapPin className="w-5 h-5 text-blue-700" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                  Kondisi Bangunan dan Lingkungan (Pelanggan Rumah Tangga)
                </h3>
                <p className="text-xs text-slate-500">
                  Data kelayakan instalasi perpipaan dalam rumah dan sarana prasarana
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Kolom Kiri: Fisik Bangunan (Lantai, Luas Bangunan, Total Luas Otomatis, & Jumlah Penghuni Manual) */}
              <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="border-b pb-2 border-slate-200 flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Fisik Bangunan &amp; Penghuni
                  </h4>
                  <span className="text-[10px] text-slate-500 font-medium">Parameter Fisik Properti</span>
                </div>

                <div className="space-y-3.5 text-xs">
                  {/* 1. Urutan Pertama: Jumlah Lantai Rumah (Input Manual Murni) */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <span>1. Jumlah Lantai Rumah</span>
                        <span className="text-red-500 font-bold">*</span>
                      </label>
                      <span className="text-[11px] font-mono text-[#005DAA] font-bold">
                        {formData.kondisiBangunan.jumlahLantai ? `${formData.kondisiBangunan.jumlahLantai} Lantai` : 'Belum diisi'}
                      </span>
                    </div>

                    {/* Input Angka Manual Bersih Tanpa Opsi Tombol */}
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="50"
                        placeholder="Masukkan jumlah lantai rumah (contoh: 1 atau 2)"
                        value={formData.kondisiBangunan.jumlahLantai || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            kondisiBangunan: {
                              ...formData.kondisiBangunan,
                              jumlahLantai: e.target.value === '' ? '' : Number(e.target.value),
                            },
                          })
                        }
                        className="w-full pl-3.5 pr-20 py-2 font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:border-[#005DAA] focus:ring-1 focus:ring-[#005DAA]"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-bold">
                        Lantai
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Total lantai bangunan rumah yang akan dialiri air bersih Aetra.
                    </p>
                  </div>

                  {/* 2. Urutan Kedua: Luas Bangunan Rumah (Hanya Luas Bangunan Saja, Tanpa Tipe) */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <span>2. Luas Bangunan Rumah (m²)</span>
                        <span className="text-red-500 font-bold">*</span>
                      </label>
                      <span className="text-[11px] font-mono text-[#005DAA] font-bold">
                        {formData.luasBangunan ? `${formData.luasBangunan} m²` : 'Belum diisi'}
                      </span>
                    </div>

                    {/* Input Angka Manual Bersih Tanpa Tipe */}
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="Masukkan luas bangunan rumah (contoh: 54)"
                        value={formData.luasBangunan}
                        onChange={(e) => setFormData({ ...formData, luasBangunan: e.target.value })}
                        className="w-full pl-3.5 pr-12 py-2 font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:border-[#005DAA] focus:ring-1 focus:ring-[#005DAA]"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-bold">m²</span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Luas tapak bangunan per lantai dalam satuan meter persegi (m²).
                    </p>
                  </div>

                  {/* 3. Urutan Ketiga: Total Luas Bangunan (Otomatis) */}
                  {(() => {
                    const lantai = Number(formData.kondisiBangunan.jumlahLantai) || 0;
                    const luas = parseFloat(String(formData.luasBangunan || '0')) || 0;
                    const totalLuas = lantai > 0 && luas > 0 ? luas * lantai : 0;

                    return (
                      <div className="bg-linear-to-r from-blue-50/90 via-sky-50/70 to-indigo-50/80 p-3.5 rounded-xl border border-blue-200/90 space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#005DAA] flex items-center gap-1.5">
                            <span>Total Luas Bangunan</span>
                            <span className="text-[9px] bg-blue-100 text-[#005DAA] font-extrabold px-1.5 py-0.5 rounded">
                              Otomatis
                            </span>
                          </span>
                          <span className="font-mono text-base font-black text-[#005DAA]">
                            {totalLuas > 0 ? `${totalLuas.toLocaleString('id-ID')} m²` : '0 m²'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 flex items-center justify-between pt-0.5">
                          <span>Perhitungan otomatis:</span>
                          <span className="font-mono text-[11px] text-slate-700 bg-white/80 px-2 py-0.5 rounded border border-blue-200">
                            {luas > 0 ? `${luas} m²` : '0 m²'} × {lantai > 0 ? `${lantai} Lantai` : '0 Lantai'} = <strong className="text-[#005DAA] font-black">{totalLuas > 0 ? `${totalLuas} m²` : '0 m²'}</strong>
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* 4. Urutan Keempat: Jumlah Penghuni */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <span>Jumlah Penghuni (Jiwa)</span>
                        <span className="text-red-500 font-bold">*</span>
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="99"
                        placeholder=""
                        value={formData.kondisiBangunan.jumlahPenghuni || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            kondisiBangunan: {
                              ...formData.kondisiBangunan,
                              jumlahPenghuni: e.target.value === '' ? '' : Number(e.target.value),
                            },
                          })
                        }
                        className="w-full pl-3.5 pr-28 py-2 font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:border-[#005DAA] focus:ring-1 focus:ring-[#005DAA]"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium">
                        Orang / Jiwa
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Jumlah anggota keluarga atau orang yang menempati bangunan tersebut secara permanen.
                    </p>
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Lingkungan / Prasarana */}
              <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide border-b pb-2 border-slate-200">
                  Lingkungan / Prasarana
                </h4>
                <div className="space-y-2.5 text-xs">
                  {/* Saluran Pembuangan */}
                  <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-700 font-medium">Saluran Pembuangan</span>
                    <div className="flex gap-2">
                      {(['Ada', 'Tidak Ada'] as const).map((opt) => (
                        <label key={opt} className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="saluranPembuangan"
                            checked={formData.lingkungan.saluranPembuangan === opt}
                            onChange={() =>
                              setFormData({
                                ...formData,
                                lingkungan: { ...formData.lingkungan, saluranPembuangan: opt },
                              })
                            }
                            className="text-blue-600"
                          />
                          <span className="text-xs">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Sanitasi */}
                  <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-700 font-medium">Sanitasi</span>
                    <div className="flex gap-2">
                      {(['Ada', 'Tidak Ada'] as const).map((opt) => (
                        <label key={opt} className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="sanitasi"
                            checked={formData.lingkungan.sanitasi === opt}
                            onChange={() =>
                              setFormData({
                                ...formData,
                                lingkungan: { ...formData.lingkungan, sanitasi: opt },
                              })
                            }
                            className="text-blue-600"
                          />
                          <span className="text-xs">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Halaman */}
                  <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-700 font-medium">Halaman</span>
                    <div className="flex gap-2">
                      {(['Ada', 'Tidak Ada'] as const).map((opt) => (
                        <label key={opt} className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="halaman"
                            checked={formData.lingkungan.halaman === opt}
                            onChange={() =>
                              setFormData({
                                ...formData,
                                lingkungan: { ...formData.lingkungan, halaman: opt },
                              })
                            }
                            className="text-blue-600"
                          />
                          <span className="text-xs">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Lebar Jalan */}
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="block text-slate-700 font-medium mb-1.5">Lebar Jalan (Akses Mobil/Truk)</span>
                    <div className="grid grid-cols-4 gap-1.5 text-center">
                      {(['> 4 m', '3 - 4 m', '1 - 2 m', '< 1 m'] as const).map((opt) => (
                        <button
                          type="button"
                          key={opt}
                          onClick={() =>
                            setFormData({
                              ...formData,
                              lingkungan: { ...formData.lingkungan, lebarJalan: opt },
                            })
                          }
                          className={`py-1 px-1.5 rounded text-[11px] font-medium border transition ${
                            formData.lingkungan.lebarJalan === opt
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Lingkungan Tertata & Real Estate */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="block text-slate-700 font-medium mb-1">Lingkungan Tertata</span>
                      <div className="flex gap-3">
                        {(['Ya', 'Bukan'] as const).map((opt) => (
                          <label key={opt} className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="radio"
                              name="lingkunganTertata"
                              checked={formData.lingkungan.lingkunganTertata === opt}
                              onChange={() =>
                                setFormData({
                                  ...formData,
                                  lingkungan: { ...formData.lingkungan, lingkunganTertata: opt },
                                })
                              }
                              className="text-blue-600"
                            />
                            <span className="text-xs">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="block text-slate-700 font-medium mb-1">Real Estate</span>
                      <div className="flex gap-3">
                        {(['Ya', 'Bukan'] as const).map((opt) => {
                          const isChecked =
                            opt === 'Ya'
                              ? formData.lingkungan.realEstate === 'Ya' ||
                                formData.lingkungan.realEstate === 'Real Estate / Cluster / Komplek'
                              : formData.lingkungan.realEstate === 'Bukan' ||
                                formData.lingkungan.realEstate === 'Bukan Real Estate (Pemukiman Umum)' ||
                                !formData.lingkungan.realEstate;
                          return (
                            <label key={opt} className="flex items-center gap-1 cursor-pointer">
                              <input
                                type="radio"
                                name="realEstate"
                                checked={isChecked}
                                onChange={() =>
                                  setFormData({
                                    ...formData,
                                    lingkungan: {
                                      ...formData.lingkungan,
                                      realEstate:
                                        opt === 'Ya'
                                          ? 'Real Estate / Cluster / Komplek'
                                          : 'Bukan Real Estate (Pemukiman Umum)',
                                    },
                                  })
                                }
                                className="text-blue-600"
                              />
                              <span className="text-xs">{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* KATEGORI TARIF OTOMATIS BERDASARKAN KETENTUAN RESMI */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="bg-linear-to-r from-blue-50/90 via-sky-50/70 to-indigo-50/60 p-5 rounded-2xl border-2 border-blue-200 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-200/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#005DAA] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Sparkles className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide">
                        Kategori Tarif Pelanggan (Otomatis Ditentukan Sistem)
                      </h4>
                      <p className="text-[11px] text-slate-600">
                        Sistem menetapkan kategori tarif resmi secara otomatis berdasarkan luas bangunan, jumlah lantai, kawasan, dan peruntukan usaha Anda.
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-[#005DAA] border border-blue-300 shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    Otomatis Sesuai SK Direksi
                  </span>
                </div>

                {autoTariff ? (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Big Badge & Name */}
                    <div className="md:col-span-4 bg-white p-4 rounded-xl border border-blue-200 shadow-xs flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-[#005DAA] to-[#003868] text-white flex flex-col items-center justify-center shrink-0 shadow-md">
                        <span className="text-[10px] text-blue-200 font-semibold uppercase leading-none">Golongan</span>
                        <span className="text-xl font-black tracking-tight text-white leading-tight">{autoTariff.code}</span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Kategori Terpilih:</span>
                        <h5 className="text-sm font-black text-slate-900 truncate" title={autoTariff.name}>
                          {autoTariff.name}
                        </h5>
                        <span className="inline-block mt-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {autoTariff.code === 'R1' ? 'Rumah Sangat Sederhana' : autoTariff.code === 'R2' ? 'Rumah Tinggal Standard' : autoTariff.code === 'R3' ? 'Rumah Menengah / Usaha' : 'Rumah Mewah / Usaha Besar'}
                        </span>
                      </div>
                    </div>

                    {/* Calculation Details */}
                    <div className="md:col-span-8 bg-white/90 p-4 rounded-xl border border-blue-100 space-y-2 text-xs">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                          <span className="text-slate-400 block text-[10px]">Total Luas Bangunan:</span>
                          <strong className="text-slate-900 font-mono">{totalLuasComputed} m²</strong>
                          <span className="text-[10px] text-slate-500 block">({tapakComputed} m² × {lantaiComputed} lt)</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                          <span className="text-slate-400 block text-[10px]">Kawasan Properti:</span>
                          <strong className="text-slate-900 truncate block">{isRealEstateComputed ? 'Real Estate / Cluster' : 'Pemukiman Umum'}</strong>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 col-span-2 sm:col-span-1">
                          <span className="text-slate-400 block text-[10px]">Kegiatan Usaha:</span>
                          <strong className="text-slate-900 block">{hasUsahaComputed ? 'Ada Usaha Komersil' : 'Murni Rumah Tinggal'}</strong>
                        </div>
                      </div>
                      <div className="p-2.5 bg-blue-50/80 rounded-lg border border-blue-200/80 flex items-start gap-2 text-[11px] text-blue-950">
                        <Check className="w-4 h-4 text-[#005DAA] shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Ketentuan Penerapan: </span>
                          <span>{autoTariff.appliedClause}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-4 bg-white/90 rounded-xl border border-dashed border-blue-300 text-center space-y-1">
                    <p className="text-xs font-bold text-slate-700">
                      Masukkan Luas Bangunan (m²) &amp; Jumlah Lantai di atas
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Sistem akan langsung menampilkan kategori tarif (R1 / R2 / R3 / R4) begitu data bangunan diisi.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
          )}

          {/* SECTION 4: DATA PASANG METER / PETUGAS SURVEY */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200 mb-5">
              <Wrench className="w-5 h-5 text-blue-700" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                  Data Pasang Meter (Data Teknis Petugas Survey Lapangan)
                </h3>
                <p className="text-xs text-slate-500">
                  Data hasil survey lapangan jaringan pipa dinas dan spesifikasi teknis
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Sales / Surveyor</label>
                <input
                  type="text"
                  value={formData.dataPasang.namaSales}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dataPasang: { ...formData.dataPasang, namaSales: e.target.value },
                    })
                  }
                  placeholder="Nama surveyor / sales"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tanggal Survey</label>
                <input
                  type="date"
                  value={formData.dataPasang.tanggalSurvey}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dataPasang: { ...formData.dataPasang, tanggalSurvey: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">No. Work Order</label>
                <input
                  type="text"
                  value={formData.dataPasang.noWorkOrder}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dataPasang: { ...formData.dataPasang, noWorkOrder: e.target.value },
                    })
                  }
                  placeholder="Nomor Work Order"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Kontraktor Pelaksana</label>
                <input
                  type="text"
                  value={formData.dataPasang.namaKontraktor}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dataPasang: { ...formData.dataPasang, namaKontraktor: e.target.value },
                    })
                  }
                  placeholder="Nama kontraktor pelaksana"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">GPS Koordinat Latitude</label>
                <input
                  type="text"
                  value={formData.dataPasang.gpsLat}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dataPasang: { ...formData.dataPasang, gpsLat: e.target.value },
                    })
                  }
                  placeholder="-6.xxxxxx"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">GPS Koordinat Longitude</label>
                <input
                  type="text"
                  value={formData.dataPasang.gpsLong}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dataPasang: { ...formData.dataPasang, gpsLong: e.target.value },
                    })
                  }
                  placeholder="106.xxxxxx"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Data Alamat & Jaringan */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="block font-semibold text-slate-700 mb-1.5">Verifikasi Data Alamat</span>
                <div className="flex gap-4 mb-2">
                  {(['Benar', 'Koreksi'] as const).map((opt) => (
                    <label key={opt} className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="dataAlamat"
                        checked={formData.dataPasang.dataAlamat === opt}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            dataPasang: { ...formData.dataPasang, dataAlamat: opt },
                          })
                        }
                        className="text-[#005DAA]"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
                {formData.dataPasang.dataAlamat === 'Koreksi' && (
                  <input
                    type="text"
                    value={formData.dataPasang.dataAlamatKoreksi || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dataPasang: { ...formData.dataPasang, dataAlamatKoreksi: e.target.value },
                      })
                    }
                    placeholder="Tuliskan koreksi alamat survey jika berbeda..."
                    className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                  />
                )}
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="block font-semibold text-slate-700 mb-1.5">Ketersediaan Jaringan Pipa</span>
                <div className="flex gap-3">
                  {(['Ada Jaringan', 'Tidak ada Jaringan'] as const).map((opt) => (
                    <label key={opt} className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="dataJaringan"
                        checked={formData.dataPasang.dataJaringan === opt}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            dataPasang: { ...formData.dataPasang, dataJaringan: opt },
                          })
                        }
                        className="text-[#005DAA]"
                      />
                      <span className="truncate">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="block font-semibold text-slate-700 mb-1.5">Kualitas Bangunan</span>
                <div className="flex gap-2">
                  {(['Non Permanen', 'Semi Permanen', 'Permanen'] as const).map((opt) => (
                    <label key={opt} className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="kualitasBangunan"
                        checked={formData.dataPasang.kualitasBangunan === opt}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            dataPasang: { ...formData.dataPasang, kualitasBangunan: opt },
                          })
                        }
                        className="text-[#005DAA]"
                      />
                      <span className="text-[11px]">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Luas Bangunan Survey & Foto Properti */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="block font-semibold text-slate-700 mb-1.5">Luas Bangunan (Hasil Survey)</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['< 28,8 m²', '28,9 - 70 m²', '71 - 120 m²', '> 120 m²'] as const).map((opt) => (
                    <label key={opt} className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="luasBangunanSurvey"
                        checked={formData.dataPasang.luasBangunanSurvey === opt}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            dataPasang: { ...formData.dataPasang, luasBangunanSurvey: opt },
                          })
                        }
                        className="text-[#005DAA]"
                      />
                      <span className="text-[11px]">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Foto Properti Lapangan - Upload Kamera Langsung atau File */}
              <div className="md:col-span-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200 mb-3">
                  <div>
                    <span className="block font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-[#005DAA]" />
                      Foto Properti Lapangan (Dokumentasi Survey Lapangan)
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Dokumentasikan tampak fisik bangunan, titik rencana meter air, atau kondisi jalan/pipa.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-600">Status:</span>
                    <div className="flex gap-2">
                      {(['Ada', 'Tidak'] as const).map((opt) => (
                        <label key={opt} className="flex items-center gap-1 cursor-pointer text-xs">
                          <input
                            type="radio"
                            name="fotoProperti"
                            checked={formData.dataPasang.fotoProperti === opt}
                            onChange={() =>
                              setFormData({
                                ...formData,
                                dataPasang: { ...formData.dataPasang, fotoProperti: opt },
                              })
                            }
                            className="text-[#005DAA]"
                          />
                          <span className={formData.dataPasang.fotoProperti === opt ? 'font-bold text-[#005DAA]' : 'text-slate-600'}>
                            {opt}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Upload Buttons */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {/* Ambil Kamera Otomatis (Webcam Laptop / Kamera HP) */}
                  <button
                    type="button"
                    onClick={() =>
                      setCameraModalConfig({
                        isOpen: true,
                        targetType: 'property',
                        title: 'Kamera Foto Properti & Lapangan',
                        guideType: 'property',
                      })
                    }
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#005DAA] hover:bg-[#004A88] text-white rounded-lg text-xs font-bold shadow-xs transition"
                    title="Buka Kamera Perangkat Langsung (Laptop / HP)"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Buka Kamera Otomatis</span>
                  </button>

                  {/* Unggah File Foto */}
                  <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition">
                    <Upload className="w-4 h-4 text-[#005DAA]" />
                    <span>Pilih Berkas Foto Lapangan</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handlePropertyPhotoUpload(e, 'file')}
                      className="hidden"
                    />
                  </label>

                  <span className="text-[11px] text-slate-500">
                    {formData.fotoPropertiFiles && formData.fotoPropertiFiles.length > 0
                      ? `${formData.fotoPropertiFiles.length} foto tersimpan`
                      : 'Bisa unggah lebih dari satu foto'}
                  </span>
                </div>

                {/* Gallery of Uploaded Photos */}
                {formData.fotoPropertiFiles && formData.fotoPropertiFiles.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {formData.fotoPropertiFiles.map((photo, idx) => (
                      <div
                        key={photo.id}
                        className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:border-[#005DAA]/50 transition flex flex-col justify-between"
                      >
                        <div className="relative group">
                          <img
                            src={photo.dataUrl}
                            alt={photo.caption || photo.name}
                            className="w-full h-32 object-cover bg-slate-100 cursor-pointer"
                            onClick={() => setPreviewModalImg({ title: photo.caption || `Foto Properti Lapangan ${idx + 1}`, src: photo.dataUrl })}
                          />
                          <div className="absolute top-2 right-2 flex gap-1">
                            <button
                              type="button"
                              onClick={() => setPreviewModalImg({ title: photo.caption || `Foto Properti Lapangan ${idx + 1}`, src: photo.dataUrl })}
                              className="p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-md backdrop-blur-xs transition"
                              title="Perbesar Foto"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemovePropertyPhoto(photo.id)}
                              className="p-1.5 bg-red-600/80 hover:bg-red-700 text-white rounded-md backdrop-blur-xs transition"
                              title="Hapus Foto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="absolute bottom-2 left-2">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/70 text-white backdrop-blur-xs">
                              {photo.source === 'camera' ? '📷 Kamera' : '📁 File'} • {photo.timestamp}
                            </span>
                          </div>
                        </div>

                        <div className="p-2.5">
                          <input
                            type="text"
                            value={photo.caption || ''}
                            onChange={(e) => {
                              const newCaption = e.target.value;
                              setFormData((prev) => ({
                                ...prev,
                                fotoPropertiFiles: (prev.fotoPropertiFiles || []).map((p) =>
                                  p.id === photo.id ? { ...p, caption: newCaption } : p
                                ),
                              }));
                            }}
                            placeholder="Keterangan foto (mis: Titik Meteran)"
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-700 focus:bg-white focus:ring-1 focus:ring-[#005DAA] focus:outline-hidden"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-300 rounded-xl p-6 text-center bg-white/60">
                    <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-1.5" />
                    <p className="text-xs font-semibold text-slate-700">Belum ada foto properti lapangan</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Gunakan tombol kamera untuk memotret fisik bangunan/lokasi langsung, atau pilih berkas foto dari penyimpanan.
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="block font-semibold text-slate-700 mb-1.5">Tanggal Pasang Meter</span>
                <input
                  type="date"
                  value={formData.dataPasang.tanggalPasangMeter || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dataPasang: { ...formData.dataPasang, tanggalPasangMeter: e.target.value },
                    })
                  }
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[#005DAA] focus:outline-hidden"
                />
              </div>

              {/* Data Galian */}
              <div className="md:col-span-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="block font-semibold text-slate-700 mb-1.5">
                  Jenis Galian Tanah Lapangan
                </span>
                <div className="flex flex-wrap gap-4">
                  {['Tanah', 'Sirtu', 'Coneblock', 'Aspal', 'Beton'].map((item) => (
                    <label key={item} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.dataPasang.dataGalian.includes(item)}
                        onChange={() => handleGalianToggle(item)}
                        className="rounded text-[#005DAA] focus:ring-[#005DAA]"
                      />
                      <span className="text-xs text-slate-700 font-medium">{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Pipa & Meter Spesifikasi */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Diameter Pipa Dinas</label>
                <div className="flex gap-3">
                  {(['3/4 Inchi', '1 Inchi', '1/2 Inchi'] as const).map((opt) => (
                    <label key={opt} className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="diameterPipa"
                        checked={formData.dataPasang.diameterPipa === opt}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            dataPasang: { ...formData.dataPasang, diameterPipa: opt },
                          })
                        }
                        className="text-[#005DAA]"
                      />
                      <span className="text-xs">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Panjang Pipa Dinas (Meter)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.dataPasang.panjangPipa}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dataPasang: { ...formData.dataPasang, panjangPipa: e.target.value },
                      })
                    }
                    placeholder="Panjang (m)"
                    className="w-24 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-hidden"
                  />
                  <div className="flex gap-2 text-[11px] items-center">
                    {(['Standard', 'Non Standard'] as const).map((opt) => (
                      <label key={opt} className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="panjangPipaTipe"
                          checked={formData.dataPasang.panjangPipaTipe === opt}
                          onChange={() =>
                            setFormData({
                              ...formData,
                              dataPasang: { ...formData.dataPasang, panjangPipaTipe: opt },
                            })
                          }
                          className="text-[#005DAA]"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Penggunaan Material Tambahan</label>
                <input
                  type="text"
                  value={formData.dataPasang.materialTambahan || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dataPasang: { ...formData.dataPasang, materialTambahan: e.target.value },
                    })
                  }
                  placeholder="Keterangan material tambahan jika ada"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block font-semibold text-slate-700 mb-1">Nomor Segel &amp; Seri Meter Air</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5 font-mono">No. Segel</span>
                    <input
                      type="text"
                      value={formData.dataPasang.noSegel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dataPasang: { ...formData.dataPasang, noSegel: e.target.value },
                        })
                      }
                      placeholder="Nomor segel meter"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:bg-white focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5 font-mono">No. Seri Meter</span>
                    <input
                      type="text"
                      value={formData.dataPasang.noSeriMeter}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dataPasang: { ...formData.dataPasang, noSeriMeter: e.target.value },
                        })
                      }
                      placeholder="Nomor seri meter air"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 5: PEMBAYARAN BIAYA SAMBUNGAN RESMI */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
              <CreditCard className="w-5 h-5 text-[#005DAA]" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                  Pembayaran Biaya Sambungan Baru Resmi
                </h3>
              </div>
            </div>

            {/* Banner Total Biaya & ID Pelanggan untuk Pembayaran */}
            <div className="p-5 bg-linear-to-r from-blue-50 via-sky-50 to-emerald-50/60 border-2 border-blue-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Total Biaya Sambungan Baru (SK Direksi Resmi)
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-2xl sm:text-3xl font-black text-[#005DAA]">
                    Rp 1.371.545,-
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Tarif Sah PT Aetra Air Tangerang
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Skema Pembayaran: <strong>Bayar Lunas (Sekaligus)</strong> setelah verifikasi permohonan disetujui.
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-xs space-y-1 shrink-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Nomor ID Pelanggan / Kode Bayar:
                </span>
                <span className="font-mono text-lg font-black text-slate-900 block">
                  {formData.idPelanggan || '10842918'}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Gunakan kode ini saat bertransaksi di mitra resmi
                </span>
              </div>
            </div>

            {/* Warning Banner Resmi: Anti Pungli */}
            <div className="bg-red-50 border-2 border-red-500 rounded-xl p-4 text-center text-red-950">
              <div className="text-xs font-black tracking-wider uppercase text-red-700 flex items-center justify-center gap-1.5 mb-1">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                DILARANG MELAKUKAN PEMBAYARAN APAPUN KEPADA PETUGAS LAPANGAN / SURVEYOR!
              </div>
              <p className="text-[11px] text-red-800 leading-snug font-medium max-w-3xl mx-auto">
                PEMBAYARAN HANYA SAH DILAKUKAN MELALUI 9 MITRA EXTERNAL PAYMENT RESMI PT AETRA AIR TANGERANG MENGGUNAKAN ID PELANGGAN ANDA. KAMI TIDAK BERTANGGUNG JAWAB ATAS TRANSAKSI TUNAI DI LUAR KANAL RESMI.
              </p>
            </div>

            {/* Official External Payment Channels (9 Mitra Pembayaran Resmi PT Aetra Air Tangerang) */}
            <div className="pt-2 border-t border-slate-200">
              <PaymentPartnersGrid
                paymentCode={formData.idPelanggan || '10842918'}
                totalAmount={formData.biayaSambungan || 1371545}
                title="9 Mitra Kanal Pembayaran Resmi PT Aetra Air Tangerang"
                subtitle={`Gunakan ID Pelanggan Anda (${formData.idPelanggan || '10842918'}) untuk melakukan pembayaran resmi di salah satu mitra terpercaya berikut:`}
              />
            </div>

            {/* Agreement Box */}
            <div className="pt-4 border-t border-slate-200">
              <label className="flex items-start gap-3 p-3.5 bg-slate-100/70 hover:bg-slate-100 rounded-xl cursor-pointer transition">
                <input
                  type="checkbox"
                  required
                  checked={formData.persetujuan}
                  onChange={(e) => setFormData({ ...formData, persetujuan: e.target.checked })}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-700 leading-relaxed">
                  Dengan menandatangani/mengirim formulir ini, Pelanggan menyatakan setuju dan tunduk kepada Syarat dan Ketentuan Berlangganan yang berlaku dan merupakan hubungan kepelangganan yang sah menurut hukum dengan <strong>PT Aetra Air Tangerang</strong>.
                </span>
              </label>
            </div>
          </section>

          {/* Bottom Action bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
            <div className="text-xs text-slate-500">
              * Pastikan data NIK KTP dan nomor telepon aktif untuk menerima SMS/WhatsApp konfirmasi jadwal survey.
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition"
              >
                Batalkan
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#005DAA] hover:bg-[#004A88] text-white text-xs font-bold tracking-wide shadow-md shadow-blue-600/30 transition transform active:scale-98"
              >
                <FileText className="w-4 h-4" />
                Daftarkan Sambungan Baru
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Lightbox / Image Preview Modal */}
      {previewModalImg && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewModalImg(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
              <span className="font-bold text-slate-900 text-sm">{previewModalImg.title}</span>
              <button
                type="button"
                onClick={() => setPreviewModalImg(null)}
                className="px-2.5 py-1 text-xs font-bold text-slate-500 hover:text-slate-900 bg-slate-200 hover:bg-slate-300 rounded-lg transition"
              >
                Tutup ✕
              </button>
            </div>
            <div className="p-4 overflow-auto flex items-center justify-center bg-slate-950/5">
              <img
                src={previewModalImg.src}
                alt={previewModalImg.title}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Auto Camera Device Modal (Buka kamera otomatis laptop / smartphone) */}
      <CameraCaptureModal
        isOpen={cameraModalConfig.isOpen}
        onClose={() => setCameraModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onCapture={handleDirectCameraCapture}
        title={cameraModalConfig.title}
        guideType={cameraModalConfig.guideType || 'document'}
      />
    </div>
  );
};
