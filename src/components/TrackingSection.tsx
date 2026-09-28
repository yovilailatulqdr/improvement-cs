import React, { useState, useEffect, useMemo } from 'react';
import { CustomerTrackingRecord, RegistrationFormData } from '../types';
import { 
  Check, 
  Clock, 
  MessageCircle, 
  MapPin, 
  Phone, 
  AlertCircle,
  Sparkles,
  Package,
  Droplets,
  CreditCard,
  UserCheck,
  Compass,
  FileCheck2,
  Calendar,
  ShieldCheck,
} from 'lucide-react';

interface TrackingSectionProps {
  trackingRecords: CustomerTrackingRecord[];
  registrations?: RegistrationFormData[];
  activeFormNumber?: string;
  onSelectCustomer?: (noForm: string) => void;
  onUpdateTrackingStep?: (noForm: string, nextStep: 1 | 2 | 3 | 4) => void;
  onNavigateToRegister?: () => void;
  onQuickDemoRegister?: () => void;
  onNavigateToAdmin?: (noForm?: string) => void;
}

export const TrackingSection: React.FC<TrackingSectionProps> = ({
  trackingRecords,
  registrations = [],
  activeFormNumber = '',
  onSelectCustomer,
  onUpdateTrackingStep,
  onNavigateToRegister,
  onQuickDemoRegister,
  onNavigateToAdmin,
}) => {
  // Selected record: match activeFormNumber or first record in trackingRecords
  const [selectedRecord, setSelectedRecord] = useState<CustomerTrackingRecord | null>(() => {
    if (activeFormNumber) {
      const match = trackingRecords.find((r) => r.noForm === activeFormNumber);
      if (match) return match;
    }
    return trackingRecords.length > 0 ? trackingRecords[0] : null;
  });

  // Keep state in sync when trackingRecords or activeFormNumber change
  useEffect(() => {
    if (trackingRecords.length === 0) {
      setSelectedRecord(null);
      return;
    }

    if (activeFormNumber) {
      const match = trackingRecords.find((r) => r.noForm === activeFormNumber);
      if (match) {
        setSelectedRecord(match);
        return;
      }
    }

    // Default to the newest record
    setSelectedRecord(trackingRecords[0]);
  }, [activeFormNumber, trackingRecords]);

  const handleSelectCustomerRecord = (record: CustomerTrackingRecord) => {
    setSelectedRecord(record);
    if (onSelectCustomer) {
      onSelectCustomer(record.noForm);
    }
  };

  const handleAdvanceStep = (targetStep: 1 | 2 | 3 | 4) => {
    if (selectedRecord && onUpdateTrackingStep) {
      onUpdateTrackingStep(selectedRecord.noForm, targetStep);
    }
  };

  // Status badge config
  const getStepStatusBadge = (step: 1 | 2 | 3 | 4) => {
    switch (step) {
      case 1:
        return {
          label: 'Tahap 1: Verifikasi Berkas',
          badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
          desc: 'Formulir diterima, proses verifikasi identitas & pengecekan jalur pipa',
        };
      case 2:
        return {
          label: 'Tahap 2: Menunggu Pembayaran',
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
          desc: 'Berkas disetujui, silakan lakukan pembayaran via kanal resmi',
        };
      case 3:
        return {
          label: 'Tahap 3: Proses Pemasangan Pipa & Meter',
          badgeClass: 'bg-orange-50 text-[#F37021] border-orange-200',
          desc: 'Teknisi sedang melakukan instalasi fisik pipa dinas dan water meter',
        };
      case 4:
        return {
          label: 'Tahap 4: Sambungan Aktif & Air Mengalir',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          desc: 'Pemasangan rampung, meter aktif dan air bersih resmi mengalir',
        };
      default:
        return {
          label: 'Dalam Proses',
          badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
          desc: 'Sedang dalam penanganan administrasi Aetra',
        };
    }
  };

  // =========================================================
  // EMPTY STATE: No registered connections yet
  // =========================================================
  if (trackingRecords.length === 0 || !selectedRecord) {
    return (
      <div className="space-y-6">
        {/* Banner */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-slate-900">
                Tracking Sambungan Baru
              </h2>
              <span className="relative flex h-2.5 w-2.5" title="Status Real-Time">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Lacak progres pemasangan sambungan air bersih PT Aetra Air Tangerang secara real-time dari pendaftaran hingga air bersih mengalir ke rumah Anda.
            </p>
          </div>
        </div>

        {/* Empty State Card */}
        <div className="bg-white rounded-2xl p-10 border border-slate-200 shadow-xs text-center max-w-2xl mx-auto space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-blue-50 text-[#005DAA] border border-blue-100 flex items-center justify-center mx-auto shadow-xs">
            <Package className="w-10 h-10 stroke-[1.5]" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-900">
              Belum Ada Sambungan Baru yang Terdaftar
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Data pelacakan sambungan baru akan otomatis muncul di sini begitu Anda mengisi dan mengirimkan Formulir Pendaftaran Sambungan Baru.
            </p>
          </div>

          {/* Explanation 4 Steps */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left pt-2">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] mb-2">
                1
              </span>
              <span className="font-bold text-slate-800 block text-[11px]">Pendaftaran</span>
              <span className="text-[10px] text-slate-500">Verifikasi berkas &amp; KTP</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-[11px] mb-2">
                2
              </span>
              <span className="font-bold text-slate-800 block text-[11px]">Pembayaran</span>
              <span className="text-[10px] text-slate-500">Pelunasan biaya pasang</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-[11px] mb-2">
                3
              </span>
              <span className="font-bold text-slate-800 block text-[11px]">Pemasangan</span>
              <span className="text-[10px] text-slate-500">Instalasi pipa &amp; meter</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-[11px] mb-2">
                4
              </span>
              <span className="font-bold text-slate-800 block text-[11px]">Air Mengalir</span>
              <span className="text-[10px] text-slate-500">Segel resmi &amp; aktif</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // ACTIVE STATE: Tracking Data Available
  // =========================================================
  const currentStatus = getStepStatusBadge(selectedRecord.currentStep);
  const customerDisplayName = selectedRecord.nama.split('/')[0].trim();
  const progressPercent = selectedRecord.currentStep * 25;

  // Match with existing registration data to ensure Petugas Lapangan in Tracking matches the form input
  const matchingReg = useMemo(() => {
    if (!selectedRecord) return null;
    return registrations.find(
      (r) =>
        r.noForm === selectedRecord.noForm ||
        (selectedRecord.idPelanggan && r.idPelanggan === selectedRecord.idPelanggan)
    );
  }, [selectedRecord, registrations]);

  // Dynamic Petugas Lapangan derived from registration form or tracking record
  const surveyorName = matchingReg?.dataPasang?.namaSales?.trim() || selectedRecord.petugasSurveyor?.nama || 'Bpk. Hendra Gunawan';
  const surveyorId = matchingReg?.dataPasang?.noWorkOrder?.trim() ? `SRV-${matchingReg.dataPasang.noWorkOrder.trim()}` : (selectedRecord.petugasSurveyor?.id || 'SRV-042');
  const teknisiName = matchingReg?.dataPasang?.namaTeknisi?.trim() || matchingReg?.dataPasang?.namaKontraktor?.trim() || selectedRecord.petugasTeknisi?.nama || 'Bpk. Agus Santoso';
  const teknisiId = selectedRecord.petugasTeknisi?.id || 'TKN-AET-018';
  const petugasPhone = matchingReg?.dataPasang?.telpPetugas?.trim() || selectedRecord.petugasTeknisi?.telp || '0877-8822-4645';
  const cleanPhone = petugasPhone.replace(/\D/g, '').replace(/^0/, '62');
  const displayMeter = matchingReg?.dataPasang?.noSeriMeter?.trim() || selectedRecord.nomorMeter;
  const displaySegel = matchingReg?.dataPasang?.noSegel?.trim() || selectedRecord.nomorSegel;
  const displayPanjangPipa = matchingReg?.dataPasang?.panjangPipa?.trim()
    ? `${matchingReg.dataPasang.panjangPipa} Meter (${matchingReg.dataPasang.panjangPipaTipe || 'Standard'})`
    : (selectedRecord.panjangPipaDinas || '4.5 Meter (Standar s/d 6m)');

  // Clean, authoritative, non-repetitive milestone history
  const milestones = React.useMemo(() => {
    if (!selectedRecord) return [];

    const regDate = selectedRecord.tanggalDaftar || '21 Sep 2026';
    const estDate = selectedRecord.estimasiSelesai || '26 Sep 2026';

    return [
      {
        step: 1,
        title: 'Pendaftaran & Verifikasi Berkas',
        subtitle: 'Dokumen KTP, KK, & Data Permohonan',
        description: `Formulir sambungan baru No. Form #${selectedRecord.noForm} (SR: ${selectedRecord.noSr}) berhasil didaftarkan dan berkas identitas pemohon telah diverifikasi lengkap. Petugas Surveyor: ${surveyorName}.`,
        date: regDate,
        time: '09:15 WIB',
        actor: `Surveyor Wilayah (${surveyorName})`,
        isCompleted: selectedRecord.currentStep >= 1,
        isCurrent: selectedRecord.currentStep === 1,
      },
      {
        step: 2,
        title: 'Persetujuan Teknis & Pembayaran',
        subtitle: 'Penetapan Biaya & Penerbitan SPKO',
        description:
          selectedRecord.currentStep >= 2
            ? `Pembayaran biaya sambungan baru sebesar Rp ${(selectedRecord.biayaSambungan || 1371545).toLocaleString('id-ID')} telah diverifikasi Lunas. Surat Perintah Kerja Operasional (SPKO) resmi diterbitkan.`
            : `Menunggu konfirmasi pelunasan biaya sambungan baru sebesar Rp ${(selectedRecord.biayaSambungan || 1371545).toLocaleString('id-ID')}. Pembayaran dapat dilakukan via transfer bank atau kasir resmi.`,
        date: selectedRecord.currentStep >= 2 ? regDate : 'Tahap Berikutnya',
        time: selectedRecord.currentStep >= 2 ? '14:20 WIB' : 'Menunggu Pelunasan',
        actor: 'Billing & Keuangan Aetra',
        isCompleted: selectedRecord.currentStep >= 2,
        isCurrent: selectedRecord.currentStep === 2,
      },
      {
        step: 3,
        title: 'Pemasangan Pipa Dinas & Meter Air',
        subtitle: 'Pekerjaan Fisik & Instalasi Persil',
        description:
          selectedRecord.currentStep >= 3
            ? `Pekerjaan penyambungan pipa dinas HDPE dan pemasangan unit water meter (${displayMeter || 'AET-2609-8472'}) di persil pelanggan telah selesai dikerjakan oleh teknisi ${teknisiName}.`
            : `Pekerjaan fisik penyambungan pipa dinas ke persil pelanggan dan pemasangan water meter berstandar SNI oleh teknisi lapangan ${teknisiName}.`,
        date: selectedRecord.currentStep >= 3 ? regDate : 'Tahap Berikutnya',
        time: selectedRecord.currentStep >= 3 ? '10:00 WIB' : 'Jadwal Pemasangan',
        actor: `Teknisi Lapangan (${teknisiName})`,
        isCompleted: selectedRecord.currentStep >= 3,
        isCurrent: selectedRecord.currentStep === 3,
      },
      {
        step: 4,
        title: 'Uji Pengaliran & Air Bersih Aktif',
        subtitle: 'Pemasangan Segel Resmi & Siap Pakai',
        description:
          selectedRecord.currentStep === 4
            ? `Uji coba tekanan dan debit air bersih berhasil. Segel kran resmi telah terpasang (${selectedRecord.nomorSegel || 'SGL-AAT-88192'}). Air bersih resmi aktif mengalir ke rumah Anda.`
            : `Pengecekan debit aliran air dan pemasangan segel resmi kran meter air oleh pengawas distribusi. Estimasi target: ${estDate}.`,
        date: selectedRecord.currentStep === 4 ? regDate : estDate,
        time: selectedRecord.currentStep === 4 ? '15:30 WIB' : 'Estimasi Pengaliran',
        actor: 'Pengawas Distribusi Air Bersih',
        isCompleted: selectedRecord.currentStep === 4,
        isCurrent: selectedRecord.currentStep === 4,
      },
    ];
  }, [selectedRecord]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-slate-900">
              Tracking Sambungan Baru
            </h2>
            <span className="relative flex h-2.5 w-2.5" title="Status Real-Time">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Lacak progres pemasangan sambungan air bersih PT Aetra Air Tangerang secara transparan dan akurat untuk akun Anda.
          </p>
        </div>
      </div>

      {/* Switcher if user has multiple connections under their account */}
      {trackingRecords.length > 1 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-semibold text-slate-400 uppercase shrink-0">
            Sambungan Anda:
          </span>
          {trackingRecords.map((rec) => {
            const isSelected = selectedRecord.noForm === rec.noForm;
            return (
              <button
                key={rec.noForm}
                type="button"
                onClick={() => handleSelectCustomerRecord(rec)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border shrink-0 transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>#{rec.noForm}</span>
                <span className="text-slate-400">&bull;</span>
                <span className="max-w-[140px] truncate">{rec.alamat.split(',')[0]}</span>
                {rec.currentStep === 4 ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* ORDER SUMMARY & STEPPER (CLEAN E-COMMERCE STYLE)          */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
        {/* Top Header Card */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                ID Pelanggan:
              </span>
              <span className="font-mono text-sm font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {selectedRecord.idPelanggan || ('10' + (selectedRecord.noForm || '123456').replace(/\D/g, '').padEnd(6, '0'))}
              </span>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider ml-2">
                No. Form:
              </span>
              <span className="font-mono text-xs font-bold text-[#005DAA] bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                #{selectedRecord.noForm}
              </span>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider ml-2">
                No. SR:
              </span>
              <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                {selectedRecord.noSr}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              {customerDisplayName}
            </h3>

            <p className="text-xs text-slate-600 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#F37021] shrink-0" />
              <span>{selectedRecord.alamat}</span>
            </p>
          </div>

          {/* Current Status Badge */}
          <div className="flex flex-col sm:items-end gap-1.5">
            <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold ${currentStatus.badgeClass}`}>
              <span className="w-2 h-2 rounded-full bg-current animate-ping" />
              {currentStatus.label}
            </span>
            <span className="text-[11px] text-slate-400">
              {selectedRecord.tanggalDaftar ? `Didaftarkan: ${selectedRecord.tanggalDaftar}` : 'Terdaftar di sistem'}
            </span>
          </div>
        </div>

        {/* 4-Step Visual Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-3 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5 text-blue-900 font-bold">
              <Compass className="w-4 h-4 text-blue-600" />
              Tahapan Pemasangan Sambungan
            </span>
            <span className="font-mono text-[#005DAA] font-bold">
              Progres: {progressPercent}% ({selectedRecord.currentStep} dari 4 Tahap)
            </span>
          </div>

          {/* Progress Bar Line */}
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-5">
            <div 
              className="bg-linear-to-r from-[#005DAA] to-[#F37021] h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* 4 Step Blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                stepNum: 1,
                title: '1. Pendaftaran Berkas',
                desc: 'Verifikasi KTP & Data Pemohon',
                date: selectedRecord.steps[0]?.updatedAt || 'Selesai',
                completed: selectedRecord.currentStep >= 1,
                isCurrent: selectedRecord.currentStep === 1,
              },
              {
                stepNum: 2,
                title: '2. Pembayaran Biaya',
                desc: 'Pelunasan Biaya Pasang Resmi',
                date: selectedRecord.steps[1]?.updatedAt || 'Menunggu',
                completed: selectedRecord.currentStep >= 2,
                isCurrent: selectedRecord.currentStep === 2,
              },
              {
                stepNum: 3,
                title: '3. Pemasangan Pipa',
                desc: 'Instalasi Fisik & Meter Air',
                date: selectedRecord.steps[2]?.updatedAt || 'Menunggu',
                completed: selectedRecord.currentStep >= 3,
                isCurrent: selectedRecord.currentStep === 3,
              },
              {
                stepNum: 4,
                title: '4. Air Bersih Mengalir',
                desc: 'Segel Resmi Terpasang & Aktif',
                date: selectedRecord.steps[3]?.updatedAt || 'Estimasi',
                completed: selectedRecord.currentStep === 4,
                isCurrent: selectedRecord.currentStep === 4,
              },
            ].map((item) => (
              <div
                key={item.stepNum}
                className={`p-3.5 rounded-xl border transition ${
                  item.isCurrent
                    ? 'bg-blue-50/80 border-blue-400 shadow-xs ring-1 ring-blue-300'
                    : item.completed
                    ? 'bg-emerald-50/50 border-emerald-300'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    item.completed && !item.isCurrent
                      ? 'bg-emerald-600 text-white'
                      : item.isCurrent
                      ? 'bg-blue-600 text-white animate-pulse'
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    {item.completed && !item.isCurrent ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : item.stepNum}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {item.date}
                  </span>
                </div>
                <div className={`text-xs font-bold ${item.isCurrent ? 'text-blue-950' : item.completed ? 'text-emerald-950' : 'text-slate-600'}`}>
                  {item.title}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Display notes if present */}
        {selectedRecord.adminNotes && (
          <div className="p-3.5 bg-amber-50/90 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#F37021] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-amber-950">Catatan Resmi Petugas Lapangan:</span>
              <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">{selectedRecord.adminNotes}</p>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* TWO COLUMNS: REAL-TIME TIMELINE LOGS & FIELD OFFICER CARD */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: REAL-TIME TIMELINE (ORDER TRACKING LOGS) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#005DAA]" />
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Riwayat Pelacakan Real-Time
                </h4>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Waktu Indonesia Barat (WIB)
              </span>
            </div>

            {/* Timeline Feed */}
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {milestones.map((milestone) => {
                return (
                  <div key={milestone.step} className="relative group">
                    {/* Dot indicator */}
                    <div
                      className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                        milestone.isCompleted
                          ? 'bg-emerald-500 border-emerald-100 text-white'
                          : milestone.isCurrent
                          ? 'bg-[#005DAA] border-blue-200 text-white shadow-xs animate-pulse'
                          : 'bg-slate-100 border-slate-300 text-slate-400'
                      }`}
                    >
                      {milestone.isCompleted ? (
                        <Check className="w-3 h-3 stroke-[3]" />
                      ) : milestone.isCurrent ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      )}
                    </div>

                    <div
                      className={`p-4 rounded-xl border transition space-y-1.5 text-xs ${
                        milestone.isCurrent
                          ? 'bg-blue-50/70 border-blue-200 ring-1 ring-blue-300/40'
                          : milestone.isCompleted
                          ? 'bg-slate-50 group-hover:bg-blue-50/30 border-slate-200/80'
                          : 'bg-slate-50/40 border-slate-200/50 opacity-70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                          <span>{milestone.title}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              milestone.isCompleted
                                ? 'bg-emerald-100 text-emerald-800'
                                : milestone.isCurrent
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {milestone.isCompleted
                              ? 'Selesai'
                              : milestone.isCurrent
                              ? 'Sedang Berjalan'
                              : 'Tahap Berikutnya'}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {milestone.date} &bull; {milestone.time}
                        </span>
                      </div>

                      <p className="text-slate-600 leading-relaxed text-xs">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 text-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Droplets className="w-4 h-4 text-[#005DAA]" />
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Spesifikasi Teknis Sambungan
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 text-[11px] block">Nomor Seri Meter Air</span>
                <span className="font-mono font-bold text-slate-900 text-xs">
                  {displayMeter || (selectedRecord.currentStep >= 3 ? 'AET-2609-8472' : 'Menunggu Pemasangan Fisik')}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 text-[11px] block">Nomor Segel Kran Resmi</span>
                <span className="font-mono font-bold text-slate-900 text-xs">
                  {displaySegel || (selectedRecord.currentStep >= 4 ? 'SGL-AAT-99120' : 'Menunggu Uji Pengaliran')}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 text-[11px] block">Panjang Pipa Dinas</span>
                <span className="font-bold text-slate-900 text-xs">
                  {displayPanjangPipa}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 text-[11px] block">Golongan Tarif</span>
                <span className="font-bold text-slate-900 text-xs">
                  {selectedRecord.golonganTarif || 'R2 = Rumah Tangga 2'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FIELD OFFICER & PAYMENT INFO */}
        <div className="lg:col-span-5 space-y-6">
          {/* Petugas Lapangan Ditugaskan */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Petugas Lapangan Aetra
                </h4>
              </div>
              <span className="text-[10px] text-blue-800 bg-blue-50 px-2 py-0.5 rounded font-semibold border border-blue-200">
                Sesuai Data Pendaftaran
              </span>
            </div>

            {/* Teknisi Pemasangan */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#005DAA] text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                  {teknisiName.slice(0, 3).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-slate-900 truncate">
                      {teknisiName}
                    </h5>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                      Bersertifikat
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {selectedRecord.petugasTeknisi?.role || 'Teknisi Pipa Dinas & Water Meter'}
                  </p>
                  <p className="text-[10px] font-mono text-slate-400">
                    ID: {teknisiId}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80 flex items-center gap-2">
                <a
                  href={`https://wa.me/${cleanPhone}?text=Halo%20${encodeURIComponent(teknisiName)},%20saya%20pemilik%20No.%20Form%20${selectedRecord.noForm}%20ingin%20konfirmasi%20jadwal%20pemasangan%20sambungan%20air.`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-white" />
                  Chat WhatsApp
                </a>
                <a
                  href={`tel:${petugasPhone.replace(/[^\d+]/g, '')}`}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Hubungi
                </a>
              </div>
            </div>

            {/* Surveyor Wilayah */}
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">Surveyor Teknis Wilayah:</span>
                <span className="font-bold text-slate-800">
                  {surveyorName}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                {surveyorId}
              </span>
            </div>
          </div>

          {/* Informasi Akun Pelanggan & Layanan Bantuan Resmi */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#005DAA]" />
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Informasi Akun &amp; Bantuan
                </h4>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                selectedRecord.currentStep >= 2
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {selectedRecord.currentStep >= 2 ? 'Lunas Terbayar' : 'Menunggu Pelunasan'}
              </span>
            </div>

            {/* ID Pelanggan Highlight Box */}
            <div className="p-3.5 bg-linear-to-r from-blue-50 to-indigo-50/50 border border-blue-200 rounded-xl space-y-1">
              <span className="text-[11px] text-blue-900 font-semibold block">
                ID Pelanggan Resmi (Nomor Pembayaran):
              </span>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-black text-lg text-[#005DAA] tracking-wider">
                  {selectedRecord.idPelanggan || ('10' + (selectedRecord.noForm || '123456').replace(/\D/g, '').padEnd(6, '0'))}
                </span>
                <span className="text-[10px] bg-white px-2 py-0.5 rounded text-slate-600 font-bold border border-slate-200">
                  ID Aetra Aktif
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Gunakan ID Pelanggan di atas saat melakukan pembayaran sambungan baru di kasir Indomaret/Alfamart, ATM/m-Banking, atau e-commerce.
              </p>
            </div>

            {/* Hubungi Layanan Aetra */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="text-[11px] font-bold text-slate-800 block uppercase tracking-wider">
                Pusat Kontak Resmi PT Aetra Air Tangerang
              </span>
              <div className="space-y-1 text-[11px] text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Call Center 24 Jam:</span>
                  <a href="tel:0215985477" className="font-bold text-[#005DAA] hover:underline">021-5985477</a>
                </div>
                <div className="flex items-center justify-between">
                  <span>WhatsApp Contact Center:</span>
                  <a href="https://wa.me/6287788224645" target="_blank" rel="noreferrer" className="font-bold text-emerald-600 hover:underline">0877-8822-4645</a>
                </div>
                <div className="flex items-center justify-between">
                  <span>Email Bantuan:</span>
                  <span className="font-mono text-slate-700">contact.center@aat.co.id</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Kantor Operasional:</span>
                  <span className="text-slate-700 text-right">Curug, Tangerang</span>
                </div>
              </div>
            </div>

            {/* Catatan Transparansi */}
            <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-[11px] text-slate-600 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Rincian komponen biaya sambungan baru telah tercantum lengkap pada formulir pendaftaran. Pembayaran Anda akan otomatis diverifikasi oleh Admin Operasional Aetra.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
