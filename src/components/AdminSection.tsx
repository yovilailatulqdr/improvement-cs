import React, { useState, useMemo, useEffect } from 'react';
import { RegistrationFormData, CustomerTrackingRecord, SurveySubmission, MonthlyBillRecord } from '../types';
import {
  Users,
  Clock,
  CreditCard,
  Wrench,
  CheckCircle2,
  Search,
  Filter,
  Eye,
  FileText,
  Edit3,
  Trash2,
  PlusCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Check,
  AlertCircle,
  Droplets,
  Building2,
  MapPin,
  Phone,
  Calendar,
  X,
  Sparkles,
  MessageSquare,
  Send,
  CheckCheck,
  Radio,
  Smartphone,
  Share2,
  Copy,
  Home,
  FileCheck,
  Layers,
  CheckSquare,
  Info,
  FileSpreadsheet,
  Download,
  Upload,
  Star,
  MessageSquareHeart,
  BarChart3,
  ThumbsUp,
  Database,
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';
import { exportCustomersToExcel, downloadExcelTemplate, exportSurveysToExcel } from '../utils/excelService';
import { ExcelImportModal } from './ExcelImportModal';
import { AdminBillManagement } from './AdminBillManagement';
import { cloudSyncService, INITIAL_BILLS_DATA } from '../services/cloudSyncService';

interface AdminSectionProps {
  registrations: RegistrationFormData[];
  trackingRecords: CustomerTrackingRecord[];
  surveys?: SurveySubmission[];
  onUpdateTrackingStep: (noForm: string, nextStep: 1 | 2 | 3 | 4, adminNote?: string) => void;
  onUpdateTechnicalData?: (
    noForm: string,
    data: {
      nomorMeter?: string;
      nomorSegel?: string;
      petugasSurveyor?: string;
      petugasTeknisi?: string;
      statusPembayaran?: 'Lunas' | 'Menunggu Pembayaran';
      adminNotes?: string;
    }
  ) => void;
  onViewReceipt?: (record: RegistrationFormData) => void;
  onNavigateToTracking: (noForm: string) => void;
  onDeleteRegistration?: (noForm: string) => void;
  onQuickDemoRegister?: () => void;
  onSwitchToCustomer?: () => void;
  onNavigateToRegister?: () => void;
  onImportRegistrations?: (newRecords: RegistrationFormData[]) => void;
  onOpenSupabaseModal?: () => void;
  bills?: MonthlyBillRecord[];
  onUpdateBills?: (updatedBills: MonthlyBillRecord[]) => void;
  activeSubTab?: 'registrations' | 'bills' | 'surveys';
  onChangeSubTab?: (subTab: 'registrations' | 'bills' | 'surveys') => void;
}

export const AdminSection: React.FC<AdminSectionProps> = ({
  registrations,
  trackingRecords,
  surveys: _surveys,
  bills: externalBills,
  onUpdateBills,
  activeSubTab,
  onChangeSubTab,
  onUpdateTrackingStep,
  onUpdateTechnicalData,
  onViewReceipt,
  onNavigateToTracking,
  onDeleteRegistration,
  onQuickDemoRegister,
  onSwitchToCustomer,
  onNavigateToRegister,
  onImportRegistrations,
  onOpenSupabaseModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | '1' | '2' | '3' | '4' | 'paid'>('all');
  const [isExcelImportModalOpen, setIsExcelImportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sub-tab: 'registrations' | 'bills' | 'surveys'
  const [adminSubTab, setAdminSubTabState] = useState<'registrations' | 'bills' | 'surveys'>(
    activeSubTab || 'registrations'
  );

  const setAdminSubTab = (tab: 'registrations' | 'bills' | 'surveys') => {
    setAdminSubTabState(tab);
    onChangeSubTab?.(tab);
  };

  useEffect(() => {
    if (activeSubTab) {
      setAdminSubTabState(activeSubTab);
    }
  }, [activeSubTab]);
  const [surveySearchTerm, setSurveySearchTerm] = useState('');
  const [surveyFilterCat, setSurveyFilterCat] = useState<'all' | 'Puas' | 'Perlu Perbaikan Air' | 'Keluhan Tekanan' | 'Apresiasi Petugas'>('all');

  // Bills state
  const [billsState, setBillsState] = useState<MonthlyBillRecord[]>(() => {
    if (externalBills && externalBills.length > 0) return externalBills;
    const local = cloudSyncService.getLocalSnapshot().bills;
    return local.length > 0 ? local : INITIAL_BILLS_DATA;
  });

  useEffect(() => {
    if (externalBills && externalBills.length > 0) {
      setBillsState(externalBills);
    }
  }, [externalBills]);

  useEffect(() => {
    const unsub = cloudSyncService.addListener(() => {
      const snap = cloudSyncService.getLocalSnapshot().bills;
      if (snap && snap.length > 0) {
        setBillsState(snap);
      }
    });
    return unsub;
  }, []);

  const handleUpdateBills = (newBills: MonthlyBillRecord[]) => {
    setBillsState(newBills);
    if (onUpdateBills) {
      onUpdateBills(newBills);
    }
    cloudSyncService.saveBills(newBills);
  };

  const surveyList = _surveys || [];

  const filteredSurveys = useMemo(() => {
    return surveyList.filter((s) => {
      const matchSearch =
        !surveySearchTerm ||
        s.nama.toLowerCase().includes(surveySearchTerm.toLowerCase()) ||
        s.noPelangganOrSr.toLowerCase().includes(surveySearchTerm.toLowerCase()) ||
        s.kelurahan.toLowerCase().includes(surveySearchTerm.toLowerCase()) ||
        (s.kecamatan && s.kecamatan.toLowerCase().includes(surveySearchTerm.toLowerCase()));

      const matchCat = surveyFilterCat === 'all' || s.kategoriMasukan === surveyFilterCat;

      return matchSearch && matchCat;
    });
  }, [surveyList, surveySearchTerm, surveyFilterCat]);

  const surveyStats = useMemo(() => {
    const total = surveyList.length;
    if (total === 0) {
      return { total: 0, avgCsat: '0.0', avgNps: 0, satisfiedCount: 0, satisfactionRate: '0%' };
    }
    const sumCsat = surveyList.reduce((acc, curr) => acc + (curr.csatOverall || 5), 0);
    const avgCsat = (sumCsat / total).toFixed(1);
    const sumNps = surveyList.reduce((acc, curr) => acc + (curr.npsScore || 10), 0);
    const avgNps = Math.round(sumNps / total);
    const satisfiedCount = surveyList.filter((s) => (s.csatOverall || 5) >= 4).length;
    const satisfactionRate = `${Math.round((satisfiedCount / total) * 100)}%`;

    return { total, avgCsat, avgNps, satisfiedCount, satisfactionRate };
  }, [surveyList]);

  const handleExportSurveyExcel = () => {
    if (surveyList.length === 0) {
      showToast('Belum ada data survey untuk diekspor ke Excel.');
      return;
    }
    exportSurveysToExcel(surveyList);
    showToast(`Berhasil mengekspor ${surveyList.length} data survey kepuasan pelanggan ke format Excel (.xlsx)!`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  const handleExportExcel = () => {
    if (registrations.length === 0) {
      showToast('Belum ada data pelanggan untuk diekspor ke Excel.');
      return;
    }
    exportCustomersToExcel(registrations, trackingRecords);
    showToast(`Berhasil mengekspor ${registrations.length} data pelanggan ke format Microsoft Excel (.xlsx)!`);
  };

  const handleImportExcel = (newRecords: RegistrationFormData[]) => {
    onImportRegistrations?.(newRecords);
    showToast(`Sukses mengimpor ${newRecords.length} data pelanggan baru dari file Excel!`);
  };

  const handleDownloadTemplate = () => {
    downloadExcelTemplate();
    showToast('File template Excel berhasil diunduh. Silakan lengkapi data pemohon sesuai kolom.');
  };

  // WhatsApp Blast & Direct Customer WhatsApp Notification States
  const [isWaBlastModalOpen, setIsWaBlastModalOpen] = useState(false);
  const [selectedWaRecipients, setSelectedWaRecipients] = useState<string[]>([]);
  const [waTemplate, setWaTemplate] = useState<'paid_confirm' | 'install_schedule' | 'active_flow' | 'custom'>('paid_confirm');
  const [waCustomMessage, setWaCustomMessage] = useState('');
  const [waIsBlasting, setWaIsBlasting] = useState(false);
  const [waProgress, setWaProgress] = useState(0);
  const [waBlastHistory, setWaBlastHistory] = useState<Record<string, string>>({});
  const [singleWaItem, setSingleWaItem] = useState<(typeof combinedList)[0] | null>(null);

  // Full Registration Record Modal State
  const [viewingFullRecord, setViewingFullRecord] = useState<(typeof combinedList)[0] | null>(null);

  // Edit Technical & Status Modal State
  const [editingRecord, setEditingRecord] = useState<{
    noForm: string;
    nama: string;
    noSr: string;
    currentStep: 1 | 2 | 3 | 4;
    nomorMeter: string;
    nomorSegel: string;
    petugasSurveyor: string;
    petugasTeknisi: string;
    statusPembayaran: 'Lunas' | 'Menunggu Pembayaran';
    adminNotes?: string;
  } | null>(null);

  // Mapping registrations to tracking info
  const combinedList = useMemo(() => {
    return registrations.map((reg) => {
      const tracking = trackingRecords.find((t) => t.noForm === reg.noForm);
      const step = tracking ? tracking.currentStep : (reg.trackingStep || 1);
      return {
        ...reg,
        currentStep: step as 1 | 2 | 3 | 4,
        trackingRecord: tracking,
      };
    });
  }, [registrations, trackingRecords]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = combinedList.length;
    const step1 = combinedList.filter((r) => r.currentStep === 1).length;
    const step2 = combinedList.filter((r) => r.currentStep === 2).length;
    const step3 = combinedList.filter((r) => r.currentStep === 3).length;
    const step4 = combinedList.filter((r) => r.currentStep === 4).length;
    const totalRevenue = combinedList.reduce((acc, curr) => acc + (curr.biayaSambungan || 1371545), 0);
    const paidCount = combinedList.filter((r) => r.currentStep >= 2).length;

    return { total, step1, step2, step3, step4, totalRevenue, paidCount };
  }, [combinedList]);

  // Paid customers list for WA Blast feature
  const paidCustomers = useMemo(() => {
    return combinedList.filter((item) => item.currentStep >= 2);
  }, [combinedList]);

  // Filtered List
  const filteredList = useMemo(() => {
    return combinedList.filter((item) => {
      const matchSearch =
        item.namaKtp?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.noForm?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.noSr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.idPelanggan?.includes(searchTerm) ||
        item.trackingRecord?.idPelanggan?.includes(searchTerm) ||
        item.kelurahanPasang?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.noKtp?.includes(searchTerm);

      const matchStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'paid'
          ? item.currentStep >= 2
          : item.currentStep.toString() === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [combinedList, searchTerm, statusFilter]);

  // Helper to format WhatsApp phone number (sanitizing 08xx to 628xx)
  const formatWaPhone = (phone?: string): string => {
    if (!phone) return '6281234567890';
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1);
    } else if (!clean.startsWith('62')) {
      clean = '62' + clean;
    }
    return clean;
  };

  // Helper to get personalized message for any customer
  const getPersonalizedWaMessage = (item: (typeof combinedList)[0], templateKey = waTemplate): string => {
    const nama = item.namaKtp || 'Pelanggan';
    const noForm = item.noForm || '-';
    const noSr = item.noSr || '-';
    const idPelanggan = item.idPelanggan || item.trackingRecord?.idPelanggan || ('10' + (item.noForm || '123456').replace(/\D/g, '').padEnd(6, '0'));
    const biaya = (item.biayaSambungan || 1371545).toLocaleString('id-ID');
    const alamat = item.alamatPasang || 'Alamat Pemasangan Terdaftar';
    const meter = item.trackingRecord?.nomorMeter || item.dataPasang?.noSeriMeter || 'AET-2609-8472';
    const segel = item.trackingRecord?.nomorSegel || item.dataPasang?.noSegel || 'SGL-AAT-88192';
    const teknisi = item.trackingRecord?.petugasTeknisi?.nama || 'Bpk. Agus Santoso (Teknisi Aetra)';

    if (templateKey === 'paid_confirm') {
      return `*PT AETRA AIR TANGERANG - KONFIRMASI PEMBAYARAN*\n\nYth. Bpk/Ibu *${nama}*,\n\nPembayaran biaya pasang sambungan baru air minum untuk *No. Form #${noForm}* (ID Pelanggan: *${idPelanggan}* / SR: ${noSr}) sebesar *Rp ${biaya}* telah *LUNAS & TERVERIFIKASI* di sistem PT Aetra Air Tangerang.\n\nSurat Perintah Kerja (SPK) pemasangan pipa dinas dan water meter telah diterbitkan ke tim teknisi lapangan.\n\nPantau live progres sambungan Anda di portal resmi:\nhttps://aetra-tangerang.co.id/tracking\n\nTerima kasih atas kepercayaan Anda.\n*Customer Care PT Aetra Air Tangerang*`;
    }

    if (templateKey === 'install_schedule') {
      return `*PT AETRA AIR TANGERANG - JADWAL INSTALASI PIPA & METER*\n\nYth. Bpk/Ibu *${nama}*,\n\nPemberitahuan: Permohonan sambungan air No. Form: *#${noForm}* (ID Pelanggan: *${idPelanggan}*) telah dijadwalkan untuk pekerjaan fisik instalasi meter air dan pipa dinas.\n\nPetugas Teknisi: *${teknisi}*\nNomor Segel: *${segel}*\nLokasi Pemasangan: *${alamat}*\n\nMohon pastikan ada perwakilan di rumah saat petugas hadir. Seluruh pemasangan standar resmi *BEBAS BIAYA TAMBAHAN* di lapangan (Bebas Pungli).\n\n*Divisi Operasional & Distribusi Aetra*`;
    }

    if (templateKey === 'active_flow') {
      return `*PT AETRA AIR TANGERANG - SAMBUNGAN RESMI AKTIF*\n\nSelamat Bpk/Ibu *${nama}*!\n\nPemasangan sambungan baru untuk No. Form: *#${noForm}* telah *SELESAI*. Meter air nomor seri *${meter}* telah aktif dan air bersih siap pakai kini telah mengalir ke properti Anda di *${alamat}*.\n\nGunakan ID Pelanggan: *${idPelanggan}* untuk pembayaran rekening air bulanan rutin Anda.\n\nTerima kasih telah menjadi pelanggan setia PT Aetra Air Tangerang!`;
    }

    return waCustomMessage || `Halo Bpk/Ibu *${nama}*, kami dari PT Aetra Air Tangerang menginformasikan bahwa status permohonan sambungan baru Anda No. Form *#${noForm}* telah kami verifikasi aktif. Terima kasih.`;
  };

  const handleOpenWaBlastModal = () => {
    setSingleWaItem(null);
    setSelectedWaRecipients(paidCustomers.map((c) => c.noForm));
    setIsWaBlastModalOpen(true);
  };

  const handleOpenSingleWaModal = (item: (typeof combinedList)[0]) => {
    setSingleWaItem(item);
    setSelectedWaRecipients([item.noForm]);
    setIsWaBlastModalOpen(true);
  };

  const handleTriggerWaBlast = () => {
    if (selectedWaRecipients.length === 0) {
      alert('Pilih minimal satu pelanggan penerima WA Blast.');
      return;
    }

    setWaIsBlasting(true);
    setWaProgress(15);

    const interval = setInterval(() => {
      setWaProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          setWaIsBlasting(false);
          setWaProgress(100);

          // Mark recipients as sent in blast history
          const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
          setWaBlastHistory((prevHist) => {
            const nextHist = { ...prevHist };
            selectedWaRecipients.forEach((id) => {
              nextHist[id] = nowStr;
            });
            return nextHist;
          });

          showToast(
            `WA Blast berhasil dikirim ke ${selectedWaRecipients.length} pelanggan lunas via WhatsApp Gateway Aetra!`
          );
          return 100;
        }
        return prev + 25;
      });
    }, 350);
  };

  const handleOpenEditModal = (item: (typeof combinedList)[0]) => {
    setEditingRecord({
      noForm: item.noForm,
      nama: item.namaKtp,
      noSr: item.noSr,
      currentStep: item.currentStep,
      nomorMeter: item.trackingRecord?.nomorMeter || item.dataPasang?.noSeriMeter || '',
      nomorSegel: item.trackingRecord?.nomorSegel || item.dataPasang?.noSegel || '',
      petugasSurveyor: item.trackingRecord?.petugasSurveyor?.nama || 'Bpk. Hendra Gunawan',
      petugasTeknisi: item.trackingRecord?.petugasTeknisi?.nama || 'Bpk. Agus Santoso',
      statusPembayaran: item.currentStep >= 2 ? 'Lunas' : 'Menunggu Pembayaran',
      adminNotes: item.trackingRecord?.adminNotes || '',
    });
  };

  const handleQuickChangeStep = (noForm: string, newStep: 1 | 2 | 3 | 4, customerName: string) => {
    const stepNames: Record<number, string> = {
      1: 'Tahap 1: Verifikasi Berkas',
      2: 'Tahap 2: Persetujuan Teknis & Pembayaran',
      3: 'Tahap 3: Pemasangan Pipa & Meter Air',
      4: 'Tahap 4: Sambungan Aktif & Air Bersih Mengalir',
    };
    onUpdateTrackingStep(noForm, newStep);
    showToast(`Status No. Form ${noForm} (${customerName}) berhasil dirubah manual oleh Admin ke "${stepNames[newStep]}". Live tracking pelanggan kini otomatis ter-update.`);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    const stepNames: Record<number, string> = {
      1: 'Tahap 1: Verifikasi Berkas',
      2: 'Tahap 2: Persetujuan Teknis & Pembayaran',
      3: 'Tahap 3: Pemasangan Pipa & Meter Air',
      4: 'Tahap 4: Sambungan Aktif & Air Bersih Mengalir',
    };

    onUpdateTrackingStep(editingRecord.noForm, editingRecord.currentStep);
    onUpdateTechnicalData?.(editingRecord.noForm, {
      nomorMeter: editingRecord.nomorMeter,
      nomorSegel: editingRecord.nomorSegel,
      petugasSurveyor: editingRecord.petugasSurveyor,
      petugasTeknisi: editingRecord.petugasTeknisi,
      statusPembayaran: editingRecord.statusPembayaran,
      adminNotes: editingRecord.adminNotes,
    });

    showToast(`Data teknis & status No. Form ${editingRecord.noForm} (${editingRecord.nama}) berhasil diperbarui oleh Admin ke "${stepNames[editingRecord.currentStep]}".`);
    setEditingRecord(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Admin Banner */}
      <div className="bg-linear-to-r from-slate-900 via-blue-950 to-[#003868] text-white rounded-2xl p-6 shadow-sm border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F37021] text-white flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              BACKOFFICE &amp; OPERASIONAL
            </span>
            <span className="text-xs text-blue-200">PT Aetra Air Tangerang</span>
          </div>
          <h2 className="text-xl font-black tracking-tight text-white">
            Portal Administrasi &amp; Pengendalian Sambungan Baru
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Kelola verifikasi berkas permohonan, pantau pelunasan biaya pasang, terbitkan Surat Perintah Kerja (SPK), dan perbarui status teknis lapangan.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-xs text-blue-100 text-xs font-semibold border border-white/15">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Sistem Terhubung Real-Time</span>
          </div>
        </div>
      </div>

      {/* Tab Switcher: Data Registrasi Baru vs Data Survey Pelanggan */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/90 w-fit flex-wrap">
        <button
          type="button"
          onClick={() => setAdminSubTab('registrations')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            adminSubTab === 'registrations'
              ? 'bg-[#005DAA] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Data Pelanggan Registrasi Baru</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              adminSubTab === 'registrations'
                ? 'bg-white/20 text-white'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {combinedList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setAdminSubTab('bills')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            adminSubTab === 'bills'
              ? 'bg-[#005DAA] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <CreditCard className="w-4 h-4 text-amber-300" />
          <span>Data Tagihan Pelanggan (Manual &amp; Impor Excel)</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              adminSubTab === 'bills'
                ? 'bg-white/20 text-white'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {billsState.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setAdminSubTab('surveys')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            adminSubTab === 'surveys'
              ? 'bg-[#005DAA] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <MessageSquareHeart className="w-4 h-4 text-emerald-300" />
          <span>Data Survey Kepuasan Pelanggan</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              adminSubTab === 'surveys'
                ? 'bg-white/20 text-white'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {surveyList.length}
          </span>
        </button>
      </div>

      {adminSubTab === 'registrations' ? (
        <>
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Pengajuan */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Pengajuan</span>
            <Users className="w-4 h-4 text-[#005DAA]" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.total}</div>
          <div className="text-[11px] text-slate-500">Permohonan terdaftar</div>
        </div>

        {/* Tahap 1: Verifikasi Berkas */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">1. Berkas Masuk</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{stats.step1}</div>
          <div className="text-[11px] text-slate-500">Verifikasi dokumen</div>
        </div>

        {/* Tahap 2: Pembayaran */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">2. Pembayaran</span>
            <CreditCard className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-[#005DAA]">{stats.step2}</div>
          <div className="text-[11px] text-slate-500">Menunggu / konfirmasi</div>
        </div>

        {/* Tahap 3: Pemasangan */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">3. Pemasangan Pipa</span>
            <Wrench className="w-4 h-4 text-[#F37021]" />
          </div>
          <div className="text-2xl font-black text-[#F37021]">{stats.step3}</div>
          <div className="text-[11px] text-slate-500">Instalasi teknisi</div>
        </div>

        {/* Tahap 4: Selesai */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">4. Air Mengalir</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{stats.step4}</div>
          <div className="text-[11px] text-slate-500">Aktif &amp; bersegel resmi</div>
        </div>
      </div>

      {/* Main Admin Content Card: Data Pelanggan */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Top Header & Excel Action Bar */}
        <div className="border-b border-slate-200 px-5 sm:px-6 py-4 flex items-center justify-between gap-4 flex-wrap bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#005DAA] shadow-2xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Data Pelanggan Sambungan Baru
                </h3>
                <span className="text-[11px] font-bold bg-[#005DAA] text-white px-2.5 py-0.5 rounded-full">
                  {combinedList.length} Pemohon
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Total Akumulasi Biaya Pasang: <span className="font-bold text-slate-900">Rp {stats.totalRevenue.toLocaleString('id-ID')}</span>
              </p>
            </div>
          </div>

          {/* Excel Export / Import & Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              title="Ekspor seluruh data pelanggan ke file Excel (.xlsx)"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor Excel</span>
            </button>

            <button
              type="button"
              onClick={() => setIsExcelImportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#005DAA] hover:bg-[#004A88] text-white text-xs font-bold transition shadow-xs cursor-pointer"
              title="Import data pelanggan dari file Excel (.xlsx / .csv)"
            >
              <Upload className="w-4 h-4" />
              <span>Impor Excel</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold transition shadow-2xs cursor-pointer"
              title="Unduh format template Excel resmi"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Format Template</span>
            </button>

            {onNavigateToRegister && (
              <button
                type="button"
                onClick={onNavigateToRegister}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold transition shadow-2xs cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-[#F37021]" />
                <span className="hidden sm:inline">Tambah Baru</span>
              </button>
            )}
          </div>
        </div>

        <div className="p-5 space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[240px] max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari Nama, No. Form, No. SR, atau Kelurahan..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-[#005DAA]"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    &times;
                  </button>
                )}
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                <span className="text-slate-500 text-[11px] font-semibold flex items-center gap-1 mr-1">
                  <Filter className="w-3.5 h-3.5" />
                  Filter Tahap:
                </span>
                {[
                  { id: 'all', label: 'Semua' },
                  { id: 'paid', label: `★ Pelanggan Lunas (${stats.paidCount})` },
                  { id: '1', label: '1. Pendaftaran' },
                  { id: '2', label: '2. Pembayaran' },
                  { id: '3', label: '3. Pemasangan' },
                  { id: '4', label: '4. Selesai' },
                ].map((flt) => (
                  <button
                    key={flt.id}
                    type="button"
                    onClick={() => setStatusFilter(flt.id as any)}
                    className={`px-2.5 py-1.5 rounded-lg font-semibold transition ${
                      statusFilter === flt.id
                        ? 'bg-[#005DAA] text-white shadow-xs'
                        : flt.id === 'paid'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-bold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {flt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* WA Blast Quick Action Banner for Paid Customers */}
            <div className="p-4 rounded-xl bg-linear-to-r from-emerald-950 via-teal-950 to-slate-900 text-white flex flex-wrap items-center justify-between gap-4 border border-emerald-750/60 shadow-xs">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0 text-emerald-400 mt-0.5 sm:mt-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs uppercase tracking-wider text-emerald-300">
                      Fitur WhatsApp Blast Pelanggan Lunas
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-400 text-slate-950">
                      {paidCustomers.length} Pelanggan Siap Di-Blast
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 mt-0.5">
                    Kirim update pemberitahuan resmi secara massal atau personal ke nomor WhatsApp pelanggan yang sudah melakukan pembayaran.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStatusFilter('paid')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                    statusFilter === 'paid'
                      ? 'bg-emerald-400 text-slate-950 shadow-xs'
                      : 'bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 border border-emerald-600/50'
                  }`}
                >
                  Tampilkan ({paidCustomers.length})
                </button>
                <button
                  type="button"
                  onClick={handleOpenWaBlastModal}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim WA Blast Massal</span>
                </button>
              </div>
            </div>

            {/* Manual Update Guidance Banner for Admin */}
            <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200/80 flex items-start gap-2.5 text-xs text-blue-900">
              <ShieldCheck className="w-4 h-4 text-[#005DAA] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-blue-950">Wewenang Pembaruan Status Manual Admin:</span>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Anda dapat mengubah tahapan permohonan pelanggan secara manual langsung dari dropdown pada kolom <strong>Status Tahapan</strong> atau klik tombol <strong>Detail</strong> untuk melengkapi nomor seri meter, segel kran, dan catatan teknis. Setiap perubahan akan langsung otomatis memperbarui progres di portal <strong>Live Tracking Pelanggan</strong>.
                </p>
              </div>
            </div>

            {/* Table of Applications */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">No. Form &amp; SR</th>
                    <th className="py-3 px-4">Nama Pelanggan</th>
                    <th className="py-3 px-4">Alamat Pasang</th>
                    <th className="py-3 px-4">Golongan / Biaya</th>
                    <th className="py-3 px-4">Status Tahapan</th>
                    <th className="py-3 px-4">Data Teknis</th>
                    <th className="py-3 px-4 text-center">Aksi Cepat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400">
                        Tidak ada data permohonan yang sesuai dengan pencarian atau filter.
                      </td>
                    </tr>
                  ) : (
                    filteredList.map((item) => {
                      const stepColors: Record<number, { bg: string; text: string; label: string }> = {
                        1: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', label: '1. Pendaftaran Berkas' },
                        2: { bg: 'bg-blue-50 border-blue-200', text: 'text-[#005DAA]', label: '2. Pembayaran Biaya' },
                        3: { bg: 'bg-orange-50 border-orange-200', text: 'text-[#F37021]', label: '3. Pemasangan Pipa' },
                        4: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800', label: '4. Air Mengalir' },
                      };
                      const currColor = stepColors[item.currentStep] || stepColors[1];
                      const meterNo = item.trackingRecord?.nomorMeter || item.dataPasang?.noSeriMeter;
                      const segelNo = item.trackingRecord?.nomorSegel || item.dataPasang?.noSegel;

                      return (
                        <tr key={item.noForm} className="hover:bg-slate-50/80 transition">
                          <td className="py-3.5 px-4">
                            <div className="font-mono font-bold text-[#005DAA] text-xs">
                              #{item.noForm}
                            </div>
                            <div className="text-[11px] font-mono text-slate-500">
                              SR: {item.noSr}
                            </div>
                            <div className="text-[10px] font-mono text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block mt-0.5" title="ID Pelanggan (Kode Bayar)">
                              ID: {item.idPelanggan || item.trackingRecord?.idPelanggan || ('10' + (item.noForm || '123456').replace(/\D/g, '').padEnd(6, '0'))}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {item.tanggal || 'Baru masuk'}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 text-xs">
                              {item.namaKtp}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {item.telpHp || '-'}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              NIK: {item.noKtp || '-'}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 max-w-[200px]">
                            <div className="truncate text-slate-800 text-xs font-medium" title={item.alamatPasang}>
                              {item.alamatPasang}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Kel. {item.kelurahanPasang || '-'}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-800 text-xs">
                              Rp {(item.biayaSambungan || 1371545).toLocaleString('id-ID')}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {item.golonganTarif || '2A1 - Rumah Tangga'}
                            </div>
                            <span
                              className={`inline-block mt-1 px-2 py-0.2 rounded text-[10px] font-bold ${
                                item.currentStep >= 2
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {item.currentStep >= 2 ? 'Lunas' : 'Menunggu Pelunasan'}
                            </span>
                          </td>

                          {/* Manual Step Controller Dropdown right on row */}
                          <td className="py-3.5 px-4 min-w-[175px]">
                            <div className="space-y-1">
                              <div className="relative">
                                <select
                                  value={item.currentStep}
                                  onChange={(e) =>
                                    handleQuickChangeStep(
                                      item.noForm,
                                      Number(e.target.value) as 1 | 2 | 3 | 4,
                                      item.namaKtp
                                    )
                                  }
                                  className={`w-full text-[11px] font-bold py-1.5 pl-2.5 pr-7 rounded-lg border appearance-none cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition ${currColor.bg} ${currColor.text}`}
                                  title="Ubah tahapan proses permohonan pelanggan ini secara manual"
                                >
                                  <option value={1}>1. Verifikasi Berkas</option>
                                  <option value={2}>2. Pembayaran Biaya</option>
                                  <option value={3}>3. Pemasangan Pipa/Meter</option>
                                  <option value={4}>4. Selesai (Air Mengalir)</option>
                                </select>
                                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-current opacity-70 text-[9px]">
                                  ▼
                                </div>
                              </div>
                              <span className="text-[10px] text-slate-400 block font-mono">
                                Ubah manual per tahap
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-[11px]">
                            <div className="font-mono text-slate-700">
                              <span className="text-slate-400">Meter: </span>
                              {meterNo || '-'}
                            </div>
                            <div className="font-mono text-slate-700">
                              <span className="text-slate-400">Segel: </span>
                              {segelNo || '-'}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* View Full Registration Record Data */}
                              <button
                                type="button"
                                onClick={() => setViewingFullRecord(item)}
                                title="Buka Seluruh Data Pengisian Formulir Sambungan Baru"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-50 text-[#005DAA] hover:bg-sky-100 border border-sky-300 font-bold text-[11px] transition shadow-2xs"
                              >
                                <Eye className="w-3.5 h-3.5 text-[#005DAA]" />
                                <span>Data Lengkap</span>
                              </button>

                              {/* Direct WhatsApp notification button for paid customer */}
                              {item.currentStep >= 2 && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenSingleWaModal(item)}
                                  title="Kirim Pemberitahuan WhatsApp ke Pelanggan ini"
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 font-bold text-[11px] transition shadow-2xs"
                                >
                                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Kirim WA</span>
                                </button>
                              )}

                              {/* Edit Technical & Step modal */}
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(item)}
                                title="Buka Formulir Pembaruan Status Manual & Data Teknis"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-[#005DAA] hover:bg-blue-100 border border-blue-200/80 font-bold text-[11px] transition shadow-2xs"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Ubah Status</span>
                              </button>

                              {/* View Receipt */}
                              <button
                                type="button"
                                onClick={() => onViewReceipt?.(item)}
                                title="Lihat Tanda Terima / SPK"
                                className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                              >
                                <FileText className="w-4 h-4" />
                              </button>

                              {/* Open in Tracking view */}
                              <button
                                type="button"
                                onClick={() => onNavigateToTracking(item.noForm)}
                                title="Buka di Live Tracking"
                                className="p-1.5 rounded-lg bg-orange-50 text-[#F37021] hover:bg-orange-100 transition"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>

                              {/* Delete registration */}
                              {onDeleteRegistration && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Hapus permohonan No. Form ${item.noForm} (${item.namaKtp})?`)) {
                                      onDeleteRegistration(item.noForm);
                                    }
                                  }}
                                  title="Hapus Data"
                                  className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </>
    ) : adminSubTab === 'bills' ? (
      <AdminBillManagement
        bills={billsState}
        onUpdateBills={handleUpdateBills}
      />
    ) : (
      <>
        {/* Survey KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {/* Total Responden */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">Total Responden</span>
              <Users className="w-4 h-4 text-[#005DAA]" />
            </div>
            <div className="text-2xl font-black text-slate-900">{surveyStats.total}</div>
            <div className="text-[11px] text-slate-500">Kuesioner masuk</div>
          </div>

          {/* Rata-rata Skor CSAT */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">Rata-rata CSAT</span>
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-600 flex items-baseline gap-1">
              <span>{surveyStats.avgCsat}</span>
              <span className="text-xs font-bold text-slate-400">/ 5.0</span>
            </div>
            <div className="text-[11px] text-slate-500">Indeks kepuasan layanan</div>
          </div>

          {/* Net Promoter Score (NPS) */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">Net Promoter Score</span>
              <ThumbsUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600">+{surveyStats.avgNps}</div>
            <div className="text-[11px] text-slate-500">Skala loyalitas 0 - 10</div>
          </div>

          {/* Tingkat Kepuasan */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">Tingkat Kepuasan</span>
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-[#005DAA]">{surveyStats.satisfactionRate}</div>
            <div className="text-[11px] text-slate-500">{surveyStats.satisfiedCount} responden puas (≥ 4.0)</div>
          </div>
        </div>

        {/* Main Survey Table Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Table Top Header & Survey Excel Action Bar */}
          <div className="border-b border-slate-200 px-5 sm:px-6 py-4 flex items-center justify-between gap-4 flex-wrap bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-2xs">
                <MessageSquareHeart className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    Data Hasil Survey Kepuasan Pelanggan
                  </h3>
                  <span className="text-[11px] font-bold bg-emerald-600 text-white px-2.5 py-0.5 rounded-full">
                    {surveyList.length} Responden
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rekapitulasi 18 indikator kepuasan (kualitas, kuantitas, kontinuitas, respon teknisi &amp; meteran)
                </p>
              </div>
            </div>

            {/* Ekspor Survey ke Excel Button */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleExportSurveyExcel}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                title="Ekspor seluruh data survey kepuasan pelanggan ke file Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
                <span>Ekspor Survey ke Excel (.xlsx)</span>
              </button>
            </div>
          </div>

          {/* Survey Filter & Search Bar */}
          <div className="p-4 border-b border-slate-200 bg-white flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama responden, no. pelanggan / SR, kelurahan..."
                value={surveySearchTerm}
                onChange={(e) => setSurveySearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
              {surveySearchTerm && (
                <button
                  type="button"
                  onClick={() => setSurveySearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap mr-1">
                Kategori:
              </span>
              {[
                { id: 'all', label: 'Semua' },
                { id: 'Puas', label: 'Puas' },
                { id: 'Perlu Perbaikan Air', label: 'Kualitas Air' },
                { id: 'Keluhan Tekanan', label: 'Tekanan' },
                { id: 'Apresiasi Petugas', label: 'Apresiasi' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSurveyFilterCat(cat.id as any)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                    surveyFilterCat === cat.id
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Survey Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">No &amp; Tanggal</th>
                  <th className="py-3 px-4">Data Pelanggan</th>
                  <th className="py-3 px-4">Kelurahan / Wilayah</th>
                  <th className="py-3 px-4 text-center">Skor CSAT</th>
                  <th className="py-3 px-4 text-center">NPS</th>
                  <th className="py-3 px-4">Kategori Masukan</th>
                  <th className="py-3 px-4">Komentar &amp; Ulasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {filteredSurveys.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      <div className="max-w-xs mx-auto space-y-2">
                        <MessageSquareHeart className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="font-semibold text-slate-700">Tidak ada data survey yang cocok</p>
                        <p className="text-[11px] text-slate-400">
                          {surveySearchTerm ? 'Coba ubah kata kunci pencarian Anda' : 'Belum ada responden survey yang mengisi formulir'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSurveys.map((srv, idx) => (
                    <tr key={srv.id || idx} className="hover:bg-slate-50/80 transition">
                      {/* No & Tanggal */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900 block">#{idx + 1}</span>
                        <span className="text-[11px] text-slate-400">
                          {srv.createdAt ? srv.createdAt.slice(0, 10) : '2026-09-25'}
                        </span>
                      </td>

                      {/* Data Pelanggan */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900 block">{srv.nama}</span>
                        <span className="font-mono text-[11px] text-[#005DAA] font-semibold">
                          SR/ID: {srv.noPelangganOrSr || '-'}
                        </span>
                      </td>

                      {/* Kelurahan & Wilayah */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-medium text-slate-800 block">{srv.kelurahan || srv.desa || '-'}</span>
                        <span className="text-[11px] text-slate-500 uppercase">{srv.kecamatan || 'Kab. Tangerang'}</span>
                      </td>

                      {/* Skor CSAT */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 border border-amber-200/80">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                          <span className="font-bold text-amber-900 font-mono text-xs">
                            {srv.csatOverall || 5}.0
                          </span>
                        </div>
                      </td>

                      {/* NPS */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {srv.npsScore || 10}/10
                        </span>
                      </td>

                      {/* Kategori Masukan */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            srv.kategoriMasukan === 'Puas'
                              ? 'bg-emerald-100 text-emerald-800'
                              : srv.kategoriMasukan === 'Apresiasi Petugas'
                              ? 'bg-blue-100 text-blue-800'
                              : srv.kategoriMasukan === 'Keluhan Tekanan'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {srv.kategoriMasukan || 'Puas'}
                        </span>
                      </td>

                      {/* Komentar */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-slate-700 text-xs leading-relaxed italic line-clamp-2">
                          "{srv.komentar || 'Pelayanan memuaskan dan air mengalir jernih.'}"
                        </p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </>
    )}

      {/* Edit Modal */}
      {editingRecord && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#005DAA] text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Perbarui Status &amp; Data Teknis</h3>
                <p className="text-[11px] text-blue-100">
                  No. Form #{editingRecord.noForm} &bull; {editingRecord.nama}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 text-xs">
              {/* Status Step Selector */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tahap Progres Pemasangan
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { step: 1, label: '1. Pendaftaran Berkas' },
                    { step: 2, label: '2. Pembayaran Lunas' },
                    { step: 3, label: '3. Pemasangan Pipa' },
                    { step: 4, label: '4. Air Mengalir / Selesai' },
                  ].map((s) => (
                    <button
                      key={s.step}
                      type="button"
                      onClick={() =>
                        setEditingRecord((prev) =>
                          prev
                            ? {
                                ...prev,
                                currentStep: s.step as 1 | 2 | 3 | 4,
                                statusPembayaran: s.step >= 2 ? 'Lunas' : prev.statusPembayaran,
                              }
                            : null
                        )
                      }
                      className={`p-2.5 rounded-xl border font-bold text-left transition ${
                        editingRecord.currentStep === s.step
                          ? 'bg-blue-50 border-[#005DAA] text-[#005DAA] ring-1 ring-[#005DAA]'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Pembayaran */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Status Pembayaran Biaya Sambungan
                </label>
                <select
                  value={editingRecord.statusPembayaran}
                  onChange={(e) =>
                    setEditingRecord((prev) =>
                      prev ? { ...prev, statusPembayaran: e.target.value as any } : null
                    )
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-[#005DAA]"
                >
                  <option value="Menunggu Pembayaran">Menunggu Pembayaran (Belum Lunas)</option>
                  <option value="Lunas">Lunas (Terkonfirmasi)</option>
                </select>
              </div>

              {/* Technical Specifications */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Nomor Seri Meter Air
                  </label>
                  <input
                    type="text"
                    value={editingRecord.nomorMeter}
                    onChange={(e) =>
                      setEditingRecord((prev) =>
                        prev ? { ...prev, nomorMeter: e.target.value } : null
                      )
                    }
                    placeholder="Contoh: AET-2609-8472"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-[#005DAA]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Nomor Segel Kran
                  </label>
                  <input
                    type="text"
                    value={editingRecord.nomorSegel}
                    onChange={(e) =>
                      setEditingRecord((prev) =>
                        prev ? { ...prev, nomorSegel: e.target.value } : null
                      )
                    }
                    placeholder="Contoh: SGL-AAT-99120"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-[#005DAA]"
                  />
                </div>
              </div>

              {/* Officers */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Petugas Surveyor
                  </label>
                  <input
                    type="text"
                    value={editingRecord.petugasSurveyor}
                    onChange={(e) =>
                      setEditingRecord((prev) =>
                        prev ? { ...prev, petugasSurveyor: e.target.value } : null
                      )
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-[#005DAA]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Teknisi Lapangan
                  </label>
                  <input
                    type="text"
                    value={editingRecord.petugasTeknisi}
                    onChange={(e) =>
                      setEditingRecord((prev) =>
                        prev ? { ...prev, petugasTeknisi: e.target.value } : null
                      )
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-[#005DAA]"
                  />
                </div>
              </div>

              {/* Admin / Field Notes for Tracking */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Catatan Resmi Petugas / Alasan Pembaruan (Tampil di Tracking Pelanggan)
                </label>
                <textarea
                  rows={2}
                  value={editingRecord.adminNotes || ''}
                  onChange={(e) =>
                    setEditingRecord((prev) =>
                      prev ? { ...prev, adminNotes: e.target.value } : null
                    )
                  }
                  placeholder="Contoh: Berkas telah diverifikasi lengkap. Petugas surveyor dijadwalkan datang besok."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-[#005DAA]"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#005DAA] hover:bg-[#004A88] text-white font-bold shadow-xs transition"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL REGISTRATION DATA MODAL - Memastikan seluruh data sambungan baru tersimpan & dapat diakses admin */}
      {viewingFullRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-linear-to-r from-[#005DAA] via-[#004B8A] to-[#003868] text-white p-5 flex items-start justify-between gap-4 shrink-0 border-b-2 border-[#F37021]">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-white/20 text-white font-mono font-bold text-xs px-2 py-0.5 rounded">
                    FORM #{viewingFullRecord.noForm}
                  </span>
                  <span className="bg-orange-500/80 text-white font-mono font-bold text-xs px-2 py-0.5 rounded">
                    SR: {viewingFullRecord.noSr}
                  </span>
                  <span className="bg-emerald-500/90 text-white font-mono font-bold text-xs px-2 py-0.5 rounded">
                    ID PELANGGAN: {viewingFullRecord.idPelanggan || viewingFullRecord.trackingRecord?.idPelanggan || '10842918'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-400" />
                  <span>Berkas Pendaftaran Sambungan Baru: {viewingFullRecord.namaKtp}</span>
                </h3>
                <p className="text-xs text-blue-100">
                  Data lengkap formulir sambungan baru rumah tangga yang tersimpan permanen di sistem Aetra
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingFullRecord(null)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-6 space-y-6 overflow-y-auto text-xs bg-slate-50/60 flex-1">
              {/* Status Overview Card */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white ${
                    viewingFullRecord.currentStep === 1 ? 'bg-amber-500' :
                    viewingFullRecord.currentStep === 2 ? 'bg-[#005DAA]' :
                    viewingFullRecord.currentStep === 3 ? 'bg-[#F37021]' : 'bg-emerald-600'
                  }`}>
                    T{viewingFullRecord.currentStep}
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Status Tahap Proses Saat Ini</div>
                    <div className="text-sm font-bold text-slate-900">
                      {viewingFullRecord.currentStep === 1 && 'Tahap 1: Verifikasi Berkas & Jalur Pipa'}
                      {viewingFullRecord.currentStep === 2 && 'Tahap 2: Menunggu / Konfirmasi Pembayaran Biaya'}
                      {viewingFullRecord.currentStep === 3 && 'Tahap 3: Pemasangan Fisik Pipa Dinas & Meter Air'}
                      {viewingFullRecord.currentStep === 4 && 'Tahap 4: Selesai — Sambungan Aktif & Air Mengalir'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    viewingFullRecord.currentStep >= 2
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {viewingFullRecord.currentStep >= 2 ? 'Status: LUNAS' : 'Status: MENUNGGU PELUNASAN'}
                  </span>
                  <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                    Rp {(viewingFullRecord.biayaSambungan || 1371545).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. DATA IDENTITAS PEMOHON */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 font-bold text-slate-800 text-xs uppercase">
                    <Users className="w-4 h-4 text-[#005DAA]" />
                    <span>1. Data Identitas Pemohon</span>
                  </div>
                  <div className="space-y-2 text-slate-700">
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-400">Nama Lengkap (KTP):</span>
                      <strong className="text-slate-900 font-bold">{viewingFullRecord.namaKtp || '-'}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-400">Nomor KTP (NIK):</span>
                      <strong className="font-mono text-slate-900">{viewingFullRecord.noKtp || '-'}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-400">Pekerjaan:</span>
                      <span className="text-slate-800">{viewingFullRecord.pekerjaan || '-'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-400">No. Telepon / WhatsApp:</span>
                      <span className="font-mono font-semibold text-emerald-700">{viewingFullRecord.telpHp || '-'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-400">Email:</span>
                      <span className="text-slate-800">{viewingFullRecord.email || '-'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-400">Tanggal Daftar:</span>
                      <span className="text-slate-800">{viewingFullRecord.tanggal || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* 2. ALAMAT KTP & ALAMAT PASANG */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 font-bold text-slate-800 text-xs uppercase">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>2. Lokasi Pemasangan &amp; Alamat KTP</span>
                  </div>
                  <div className="space-y-2 text-slate-700">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Alamat Lokasi Pasang Sambungan Baru:</span>
                      <div className="text-slate-900 font-semibold mt-0.5 bg-blue-50/60 p-2 rounded border border-blue-100">
                        {viewingFullRecord.alamatPasang || '-'}
                        <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-2">
                          <span>RT/RW: {viewingFullRecord.rtRwPasang || '-'}</span>
                          <span>&bull;</span>
                          <strong className="text-[#005DAA]">Kel. {viewingFullRecord.kelurahanPasang || '-'}</strong>
                          <span>&bull;</span>
                          <span>Pos: {viewingFullRecord.kodePosPasang || '-'}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Alamat Sesuai KTP:</span>
                      <div className="text-slate-700 mt-0.5">
                        {viewingFullRecord.alamatKtp || '-'} (RT/RW: {viewingFullRecord.rtRwKtp || '-'}, Kel: {viewingFullRecord.kelurahanKtp || '-'}, Pos: {viewingFullRecord.kodePosKtp || '-'})
                      </div>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-100">
                      <span className="text-slate-400">Status Kepemilikan Rumah:</span>
                      <span className="font-semibold text-slate-900">
                        {viewingFullRecord.statusKepemilikan || 'Rumah Sendiri'}
                        {viewingFullRecord.statusKepemilikanLainnya ? ` (${viewingFullRecord.statusKepemilikanLainnya})` : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. KONDISI FISIK BANGUNAN & KATEGORI TARIF OTOMATIS */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 font-bold text-slate-800 text-xs uppercase">
                    <Home className="w-4 h-4 text-purple-600" />
                    <span>3. Kondisi Bangunan &amp; Tarif Domestik</span>
                  </div>
                  <div className="space-y-2 text-slate-700">
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-400">Luas Tapak Bangunan:</span>
                      <span className="font-semibold text-slate-900">{viewingFullRecord.luasBangunan || 0} m²</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-400">Jumlah Lantai:</span>
                      <span className="font-semibold text-slate-900">{viewingFullRecord.kondisiBangunan?.jumlahLantai || 1} Lantai</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50 bg-blue-50/50 px-2 rounded">
                      <span className="font-bold text-[#005DAA]">Total Luas Bangunan:</span>
                      <span className="font-mono font-black text-sm text-[#005DAA]">
                        {viewingFullRecord.totalLuasBangunan || viewingFullRecord.kondisiBangunan?.totalLuasBangunan || (Number(viewingFullRecord.luasBangunan || 0) * Number(viewingFullRecord.kondisiBangunan?.jumlahLantai || 1))} m²
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-400">Jumlah Penghuni:</span>
                      <span className="font-semibold text-slate-900">{viewingFullRecord.kondisiBangunan?.jumlahPenghuni || '-'} Jiwa</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-400">Kawasan Pemukiman:</span>
                      <span className="text-slate-800">{viewingFullRecord.lingkungan?.realEstate || 'Bukan Real Estate (Pemukiman Umum)'}</span>
                    </div>
                    <div className="bg-linear-to-r from-emerald-50 to-teal-50 p-2.5 rounded-lg border border-emerald-200 mt-2">
                      <div className="text-[10px] uppercase font-bold text-emerald-800">Kategori Golongan Tarif Resmi:</div>
                      <div className="text-sm font-black text-emerald-900 mt-0.5">
                        {viewingFullRecord.golonganTarif || 'R2 = Rumah Tangga 2'}
                      </div>
                      {viewingFullRecord.kategoriTarifKlausul && (
                        <p className="text-[11px] text-emerald-950 mt-1 font-medium bg-white/90 p-1.5 rounded border border-emerald-200 leading-tight">
                          &bull; {viewingFullRecord.kategoriTarifKlausul}
                        </p>
                      )}
                      <div className="text-[10px] text-emerald-700 mt-0.5 leading-snug">
                        Dihitung otomatis berdasarkan SK Direksi Aetra (Luas total &amp; peruntukan hunian domestik)
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. DOKUMEN PERSYARATAN & STATUS UNGGAHAN */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 font-bold text-slate-800 text-xs uppercase">
                    <FileCheck className="w-4 h-4 text-amber-600" />
                    <span>4. Berkas Persyaratan &amp; Dokumen</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'ktp', label: 'Fotokopi / Foto KTP' },
                      { key: 'kk', label: 'Fotokopi / Foto KK' },
                      { key: 'pbb', label: 'Bukti Lunas PBB' },
                      { key: 'suratDomisili', label: 'Surat Domisili' },
                      { key: 'suratKuasaSewa', label: 'Surat Kuasa Sewa' },
                      { key: 'lainnya', label: 'Dokumen Lainnya' },
                    ].map((doc) => {
                      const isChecked = viewingFullRecord.persyaratan && (viewingFullRecord.persyaratan as any)[doc.key];
                      const uploaded = viewingFullRecord.persyaratanFiles && (viewingFullRecord.persyaratanFiles as any)[doc.key];
                      return (
                        <div key={doc.key} className="p-2 rounded-lg border border-slate-100 bg-slate-50/60 flex items-center justify-between">
                          <span className="text-[11px] text-slate-700">{doc.label}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isChecked || uploaded ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                          }`}>
                            {uploaded ? 'Terunggah' : isChecked ? 'Tercantum' : '-'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {viewingFullRecord.persyaratan?.keteranganLainnya && (
                    <div className="text-[11px] text-slate-600 bg-amber-50 p-2 rounded border border-amber-200">
                      <strong className="text-amber-900">Keterangan Lainnya:</strong> {viewingFullRecord.persyaratan.keteranganLainnya}
                    </div>
                  )}

                  {/* 5. DATA TEKNIS LAPANGAN */}
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <div className="font-bold text-slate-800 text-xs uppercase flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-slate-600" />
                      <span>Data Teknis Pemasangan</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px]">No. Meter Air:</span>
                        <span className="font-mono font-bold text-slate-800">
                          {viewingFullRecord.trackingRecord?.nomorMeter || viewingFullRecord.dataPasang?.noSeriMeter || 'Belum Dipasang'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">No. Segel Resmi:</span>
                        <span className="font-mono font-bold text-slate-800">
                          {viewingFullRecord.trackingRecord?.nomorSegel || viewingFullRecord.dataPasang?.noSegel || 'Belum Disegel'}
                        </span>
                      </div>
                    </div>
                    {viewingFullRecord.dataPasang?.dataGalian && viewingFullRecord.dataPasang.dataGalian.length > 0 && (
                      <div className="pt-1 text-[11px]">
                        <span className="text-slate-400 text-[10px] block">Galian Lapangan:</span>
                        <span className="text-slate-700 font-medium">
                          {viewingFullRecord.dataPasang.dataGalian.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer with Actions */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Seluruh data formulir tersimpan secara persisten di database sistem Aetra</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {viewingFullRecord.currentStep >= 2 && (
                  <button
                    type="button"
                    onClick={() => {
                      const item = viewingFullRecord;
                      setViewingFullRecord(null);
                      handleOpenSingleWaModal(item);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Kirim WA</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const item = viewingFullRecord;
                    setViewingFullRecord(null);
                    handleOpenEditModal(item);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#005DAA] hover:bg-[#004B8A] text-white font-bold text-xs shadow-xs transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Ubah Status</span>
                </button>

                {onViewReceipt && (
                  <button
                    type="button"
                    onClick={() => {
                      const item = viewingFullRecord;
                      setViewingFullRecord(null);
                      onViewReceipt(item);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs shadow-2xs transition"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>SPK / Tanda Terima</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setViewingFullRecord(null)}
                  className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Blast & Direct Customer Notification Modal */}
      {isWaBlastModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-linear-to-r from-emerald-900 via-teal-900 to-slate-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-white">
                      WhatsApp Blast Pelanggan Lunas
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-400 text-slate-950">
                      Gateway Resmi Aetra
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-200/90">
                    Kirim pembaruan dan pemberitahuan berkala langsung ke nomor WhatsApp pelanggan yang telah melunasi biaya pemasangan.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!waIsBlasting) {
                    setIsWaBlastModalOpen(false);
                    setSingleWaItem(null);
                  }
                }}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 text-xs">
              {/* Left Column: Target Selection & Templates (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                {/* 1. Recipient Selection */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">
                        1. Target Penerima ({selectedWaRecipients.length}/{paidCustomers.length})
                      </span>
                      {singleWaItem && (
                        <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-[#005DAA] font-bold rounded">
                          Mode Personal
                        </span>
                      )}
                    </div>
                    {!singleWaItem && paidCustomers.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedWaRecipients.length === paidCustomers.length) {
                            setSelectedWaRecipients([]);
                          } else {
                            setSelectedWaRecipients(paidCustomers.map((c) => c.noForm));
                          }
                        }}
                        className="text-[11px] text-[#005DAA] hover:underline font-bold"
                      >
                        {selectedWaRecipients.length === paidCustomers.length
                          ? 'Batal Pilih Semua'
                          : 'Pilih Semua Pelanggan Lunas'}
                      </button>
                    )}
                  </div>

                  {/* Recipient list */}
                  <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 border border-slate-200/80 rounded-lg p-2 bg-white">
                    {paidCustomers.length === 0 ? (
                      <div className="py-4 text-center text-slate-400 text-xs">
                        Belum ada pelanggan dengan status pembayaran lunas.
                      </div>
                    ) : (
                      paidCustomers.map((c) => {
                        const isSelected = selectedWaRecipients.includes(c.noForm);
                        const isSent = waBlastHistory[c.noForm];

                        return (
                          <div
                            key={c.noForm}
                            className={`flex items-center justify-between p-2 rounded-lg border transition ${
                              isSelected
                                ? 'bg-emerald-50/70 border-emerald-300 text-slate-900'
                                : 'bg-slate-50/70 border-slate-200 text-slate-600 opacity-80'
                            }`}
                          >
                            <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0 mr-2">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedWaRecipients((prev) => [...prev, c.noForm]);
                                  } else {
                                    setSelectedWaRecipients((prev) => prev.filter((id) => id !== c.noForm));
                                  }
                                }}
                                className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                              />
                              <div className="truncate">
                                <div className="font-bold text-slate-900 truncate">
                                  {c.namaKtp || 'Pelanggan'}
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono flex items-center gap-2">
                                  <span>#{c.noForm}</span>
                                  <span>ID: {c.idPelanggan || '10' + c.noForm.slice(-6)}</span>
                                  <span className="text-emerald-700 font-semibold">{c.telpHp || '08xx-xxxx'}</span>
                                </div>
                              </div>
                            </label>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {isSent ? (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  <CheckCheck className="w-3 h-3 text-emerald-600" />
                                  {isSent}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-medium">Siap</span>
                              )}

                              {/* Direct WA Web Link */}
                              <a
                                href={`https://api.whatsapp.com/send?phone=${formatWaPhone(c.telpHp)}&text=${encodeURIComponent(
                                  getPersonalizedWaMessage(c)
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Buka Percakapan WhatsApp Langsung"
                                className="p-1 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* 2. Template Selection */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                  <div className="font-bold text-slate-800">
                    2. Pilih Template Pesan Resmi Aetra
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      {
                        id: 'paid_confirm',
                        title: '1. Konfirmasi Pembayaran & SPK',
                        desc: 'Pemberitahuan verifikasi pelunasan dan penerbitan SPK dinas',
                      },
                      {
                        id: 'install_schedule',
                        title: '2. Jadwal Pemasangan Lapangan',
                        desc: 'Info nama teknisi, nomor segel, dan waktu instalasi meter',
                      },
                      {
                        id: 'active_flow',
                        title: '3. Sambungan Resmi Aktif',
                        desc: 'Pemberitahuan air bersih telah mengalir & ID Pelanggan aktif',
                      },
                      {
                        id: 'custom',
                        title: '4. Tulis Pesan Kustom',
                        desc: 'Tulis pesan pemberitahuan bebas dari admin',
                      },
                    ].map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => setWaTemplate(tpl.id as any)}
                        className={`p-2.5 rounded-xl text-left border transition ${
                          waTemplate === tpl.id
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500 shadow-2xs font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="text-xs">{tpl.title}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{tpl.desc}</div>
                      </button>
                    ))}
                  </div>

                  {waTemplate === 'custom' && (
                    <div className="space-y-1 pt-1">
                      <label className="text-[11px] font-bold text-slate-700 block">
                        Isi Pesan Kustom WhatsApp:
                      </label>
                      <textarea
                        rows={4}
                        value={waCustomMessage}
                        onChange={(e) => setWaCustomMessage(e.target.value)}
                        placeholder="Ketik pesan resmi di sini... Gunakan format tebal (*kata*) atau miring (_kata_)."
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Live WhatsApp Bubble Preview & Send Execution (5 cols) */}
              <div className="lg:col-span-5 space-y-4 flex flex-col">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>3. Preview Tampilan WhatsApp</span>
                  <span className="text-[10px] text-slate-500">Pratinjau Pelanggan</span>
                </div>

                {/* WhatsApp Chat Simulation Container */}
                <div className="bg-[#EFEAE2] p-3.5 rounded-2xl border border-slate-300 shadow-inner flex-1 flex flex-col justify-between min-h-[280px]">
                  {/* WhatsApp Chat Bubble */}
                  <div className="bg-white rounded-xl rounded-tl-none p-3 shadow-sm border border-slate-200/80 text-[11px] leading-relaxed text-slate-800 max-w-[95%] space-y-1.5 self-start">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1 mb-1">
                      <span className="font-bold text-[#005DAA] flex items-center gap-1 text-[10px]">
                        <span>PT Aetra Air Tangerang</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      </span>
                      <span className="text-[9px] text-slate-400">Pemberitahuan Resmi</span>
                    </div>

                    <div className="whitespace-pre-line text-slate-700">
                      {paidCustomers.length > 0
                        ? getPersonalizedWaMessage(
                            paidCustomers.find((c) => selectedWaRecipients.includes(c.noForm)) || paidCustomers[0]
                          )
                        : 'Menunggu data pelanggan...'}
                    </div>

                    <div className="flex items-center justify-end gap-1 pt-1 text-[9px] text-slate-400">
                      <span>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                      <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                  </div>

                  {/* WhatsApp disclaimer */}
                  <div className="text-[10px] text-slate-500 text-center pt-2">
                    Enkripsi End-to-End Resmi Gateway Aetra
                  </div>
                </div>

                {/* Progress Bar when blasting */}
                {waIsBlasting && (
                  <div className="space-y-1.5 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                      <span className="flex items-center gap-1.5">
                        <span className="animate-spin w-3 h-3 border-2 border-emerald-600 border-t-transparent rounded-full"></span>
                        Mengirim WA Blast...
                      </span>
                      <span>{waProgress}%</span>
                    </div>
                    <div className="w-full bg-emerald-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full transition-all duration-300"
                        style={{ width: `${waProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Dispatch Trigger Buttons */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    disabled={waIsBlasting || selectedWaRecipients.length === 0}
                    onClick={handleTriggerWaBlast}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {waIsBlasting
                        ? 'Sedang Memproses Pengiriman...'
                        : `Kirim WA Blast (${selectedWaRecipients.length} Pelanggan)`}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (paidCustomers.length > 0) {
                        const sampleMsg = getPersonalizedWaMessage(paidCustomers[0]);
                        navigator.clipboard?.writeText(sampleMsg);
                        showToast('Teks pesan WhatsApp berhasil disalin ke clipboard!');
                      }
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition flex items-center justify-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Salin Template Pesan</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-200 px-6 py-3 bg-slate-50 flex items-center justify-between text-xs text-slate-500 shrink-0">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Semua notifikasi terintegrasi dengan portal Live Tracking Aetra
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsWaBlastModalOpen(false);
                  setSingleWaItem(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Admin Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 text-white p-4 rounded-2xl shadow-xl border border-slate-700 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1 text-xs space-y-1">
            <div className="font-bold text-emerald-400">Pembaruan Manual Berhasil!</div>
            <div className="text-slate-200 leading-relaxed">{toastMessage}</div>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white text-base leading-none ml-1"
          >
            &times;
          </button>
        </div>
      )}

      {/* Excel Import Modal */}
      <ExcelImportModal
        isOpen={isExcelImportModalOpen}
        onClose={() => setIsExcelImportModalOpen(false)}
        onConfirmImport={handleImportExcel}
      />
    </div>
  );
};
