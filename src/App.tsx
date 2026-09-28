import React, { useState, useEffect, useCallback } from 'react';
import { TabType, RegistrationFormData, CustomerTrackingRecord, SurveySubmission, UserRole, UserAccount } from './types';
import { 
  INITIAL_TRACKING_DATABASE, 
  INITIAL_FAQS, 
  INITIAL_SURVEY_RESPONSES,
  INITIAL_REGISTRATIONS
} from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AetraLogo } from './components/AetraLogo';
import { RegistrationForm } from './components/RegistrationForm';
import { TrackingSection } from './components/TrackingSection';
import { SurveySection } from './components/SurveySection';
import { FaqSection } from './components/FaqSection';
import { AdminSection } from './components/AdminSection';
import { ReceiptModal } from './components/ReceiptModal';
import { AuthScreen } from './components/AuthScreen';
import { SupabaseModal } from './components/SupabaseModal';
import {
  fetchRegistrationsFromDb,
  saveRegistrationToDb,
  deleteRegistrationFromDb,
  fetchTrackingRecordsFromDb,
  saveTrackingRecordToDb,
  fetchSurveysFromDb,
  saveSurveyToDb,
} from './services/supabaseService';
import { Droplets, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('aetra_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    return currentUser?.role === 'admin' ? 'admin' : 'registration';
  });
  const [userRole, setUserRole] = useState<UserRole>(() => {
    return currentUser?.role === 'admin' ? 'admin' : 'customer';
  });
  const [activeTrackingForm, setActiveTrackingForm] = useState<string>('');
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);

  // Registrations state - seeded with customer data (Yovi, Amara, Nabila)
  const [registrations, setRegistrations] = useState<RegistrationFormData[]>(() => {
    try {
      const saved = localStorage.getItem('aetra_registrations');
      let parsed: RegistrationFormData[] = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(parsed)) parsed = [];

      // Clean old unwanted test names
      parsed = parsed.filter(
        (r) =>
          !r.namaKtp?.toLowerCase().includes('ansori') &&
          !r.namaKtp?.toLowerCase().includes('aan') &&
          r.noSr !== '163784'
      );

      // Ensure the requested 3 customers exist with latest phone numbers
      INITIAL_REGISTRATIONS.forEach((seed) => {
        const existingIdx = parsed.findIndex(
          (p) => p.noForm === seed.noForm || p.namaKtp?.toLowerCase() === seed.namaKtp?.toLowerCase()
        );
        if (existingIdx >= 0) {
          parsed[existingIdx] = {
            ...parsed[existingIdx],
            namaKtp: seed.namaKtp,
            telpHp: seed.telpHp,
          };
        } else {
          parsed.push(seed);
        }
      });

      return parsed;
    } catch {
      return INITIAL_REGISTRATIONS;
    }
  });

  // Tracking records state - synchronized with customer data
  const [trackingRecords, setTrackingRecords] = useState<CustomerTrackingRecord[]>(() => {
    try {
      const saved = localStorage.getItem('aetra_tracking');
      let parsed: CustomerTrackingRecord[] = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(parsed)) parsed = [];

      INITIAL_TRACKING_DATABASE.forEach((seed) => {
        const existingIdx = parsed.findIndex((p) => p.noForm === seed.noForm);
        if (existingIdx >= 0) {
          parsed[existingIdx] = {
            ...parsed[existingIdx],
            nama: seed.nama,
            telp: seed.telp,
          };
        } else {
          parsed.push(seed);
        }
      });

      return parsed;
    } catch {
      return INITIAL_TRACKING_DATABASE;
    }
  });

  // Survey Submissions state
  const [surveys, setSurveys] = useState<SurveySubmission[]>(() => {
    try {
      const saved = localStorage.getItem('aetra_surveys');
      return saved ? JSON.parse(saved) : INITIAL_SURVEY_RESPONSES;
    } catch {
      return INITIAL_SURVEY_RESPONSES;
    }
  });

  // Receipt Modal State
  const [receiptData, setReceiptData] = useState<RegistrationFormData | null>(null);
  // Supabase Guide & Database Modal
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [dbVersion, setDbVersion] = useState(0);

  // Initial load from Supabase if configured and online
  const loadFromSupabase = useCallback(async () => {
    try {
      const [remoteRegs, remoteTrackings, remoteSurveys] = await Promise.all([
        fetchRegistrationsFromDb(),
        fetchTrackingRecordsFromDb(),
        fetchSurveysFromDb(),
      ]);

      if (remoteRegs !== null) {
        setRegistrations(remoteRegs);
      }
      if (remoteTrackings !== null) {
        setTrackingRecords(remoteTrackings);
      }
      if (remoteSurveys !== null && remoteSurveys.length > 0) {
        setSurveys(remoteSurveys);
      }
    } catch (err) {
      console.warn('Supabase fetch skipped/failed:', err);
    }
  }, []);

  useEffect(() => {
    loadFromSupabase();
  }, [loadFromSupabase]);

  // Sync with local storage
  useEffect(() => {
    try {
      localStorage.setItem('aetra_registrations', JSON.stringify(registrations));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }, [registrations]);

  useEffect(() => {
    try {
      localStorage.setItem('aetra_tracking', JSON.stringify(trackingRecords));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }, [trackingRecords]);

  useEffect(() => {
    try {
      localStorage.setItem('aetra_surveys', JSON.stringify(surveys));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }, [surveys]);

  // Handler when user registers a new customer
  const handleRegisterSuccess = (newRecord: RegistrationFormData) => {
    setRegistrations((prev) => [newRecord, ...prev]);

    const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const nowTimeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

    // Create corresponding tracking record in live tracking with e-commerce order style details
    const newTracking: CustomerTrackingRecord = {
      noForm: newRecord.noForm,
      noSr: newRecord.noSr,
      idPelanggan: newRecord.idPelanggan || currentUser?.idPelanggan || ('10' + Math.floor(100000 + Math.random() * 900000)),
      email: newRecord.email || currentUser?.email,
      nama: newRecord.namaKtp,
      telp: newRecord.telpHp,
      alamat: `${newRecord.alamatPasang}, RT/RW ${newRecord.rtRwPasang}, Desa ${newRecord.desaPasang || newRecord.kelurahanPasang}`,
      currentStep: 1,
      tanggalDaftar: `${todayStr}, ${nowTimeStr}`,
      estimasiSelesai: '14 Hari Kerja (Estimasi Air Mengalir)',
      golonganTarif: newRecord.golonganTarif || '2A1 - Rumah Tangga Standard',
      biayaSambungan: newRecord.biayaSambungan || 1371545,
      statusPembayaran: 'Menunggu Pembayaran',
      petugasSurveyor: {
        nama: 'Bpk. Hendra Gunawan',
        id: 'SRV-AET-042',
        telp: '0812-8899-1122',
        role: 'Surveyor Wilayah & Pemetaan Jaringan',
      },
      petugasTeknisi: {
        nama: 'Bpk. Agus Santoso',
        id: 'TKN-AET-018',
        telp: '0877-8822-4645',
        role: 'Teknisi Pipa Dinas & Water Meter',
      },
      steps: [
        {
          step: 1,
          title: 'Pendaftaran Diterima',
          statusLabel: `Diperbarui: ${todayStr}`,
          updatedAt: todayStr,
          isCompleted: false,
          isCurrent: true,
          notes: 'Formulir pendaftaran berhasil masuk ke sistem administrasi PT Aetra Air Tangerang.',
          subCheckpoints: [
            {
              id: 'sub-1',
              title: 'Data Identitas & Berkas KTP Terverifikasi',
              desc: 'NIK dan dokumen kepemilikan telah valid.',
              completed: true,
              badge: 'Valid',
            },
            {
              id: 'sub-2',
              title: 'Pemeriksaan Jaringan Pipa Distribusi',
              desc: 'Pengecekan ketersediaan pipa transmisi di depan persil pemohon.',
              completed: true,
            },
            {
              id: 'sub-3',
              title: 'Penerbitan Kode Pembayaran Tagihan',
              desc: 'Kode bayar No. Form diterbitkan untuk kanal External Payment Point.',
              completed: true,
            },
          ],
        },
        {
          step: 2,
          title: 'Pembayaran Diterima',
          statusLabel: 'Menunggu Pembayaran',
          updatedAt: '-',
          isCompleted: false,
          isCurrent: false,
          deadlineNote: 'Batas pembayaran: 7 hari kerja sejak verifikasi berkas.',
          notes: 'Silakan lakukan pembayaran via ATM, Mobile Banking, Indomaret, atau Alfamart.',
        },
        {
          step: 3,
          title: 'Proses Pemasangan',
          statusLabel: 'Menunggu Pelunasan',
          updatedAt: '-',
          isCompleted: false,
          isCurrent: false,
          notes: 'Penjadwalan teknisi lapangan untuk galian dan pemasangan pipa dinas.',
        },
        {
          step: 4,
          title: 'Selesai / Air Mengalir',
          statusLabel: 'Belum Aktif',
          updatedAt: '-',
          isCompleted: false,
          isCurrent: false,
          notes: 'Pengujian debit aliran air bersih dan pemasangan segel kran resmi.',
        },
      ],
      timelineEvents: [
        {
          id: 'log-1',
          time: nowTimeStr,
          date: todayStr,
          title: 'Pendaftaran Berhasil Disimpan',
          description: `Formulir sambungan baru No. Form: ${newRecord.noForm} / SR: ${newRecord.noSr} atas nama ${newRecord.namaKtp} berhasil didaftarkan secara online.`,
          status: 'completed',
          step: 1,
          actor: 'Sistem Online Aetra',
          badge: 'Baru Masuk',
        },
        {
          id: 'log-2',
          time: nowTimeStr,
          date: todayStr,
          title: 'Verifikasi Dokumen & Identitas KTP',
          description: 'Kelengkapan berkas KTP, KK, dan bukti kepemilikan rumah telah diperiksa secara digital.',
          status: 'completed',
          step: 1,
          actor: 'Tim Administrasi Aetra',
        },
        {
          id: 'log-3',
          time: 'Dalam Antrean',
          date: 'Tahap Berikutnya',
          title: 'Survei Teknis Lapangan & Pengukuran Pipa',
          description: 'Petugas Surveyor (Bpk. Hendra Gunawan) akan melakukan pengecekan jalur pipa dinas ke lokasi pemasangan.',
          status: 'in_progress',
          step: 1,
          actor: 'Surveyor Wilayah',
          badge: 'Sedang Berjalan',
        },
      ],
    };

    setTrackingRecords((prev) => {
      const exists = prev.some((t) => t.noForm === newTracking.noForm);
      if (exists) {
        return prev.map((t) => (t.noForm === newTracking.noForm ? newTracking : t));
      }
      return [newTracking, ...prev];
    });

    setActiveTrackingForm(newRecord.noForm);
    // Tidak langsung membuka ReceiptModal agar layar status "Pelanggan Sudah Melakukan Pendaftaran" langsung terlihat jelas oleh pelanggan.
    // Pelanggan dapat membuka tanda terima kapan saja melalui tombol "Lihat Bukti Tanda Terima / SPK" pada kartu status.

    // Save directly to localStorage immediately
    try {
      const saved = localStorage.getItem('aetra_registrations');
      const currentList: RegistrationFormData[] = saved ? JSON.parse(saved) : [];
      const updatedList = [newRecord, ...currentList.filter((r) => r.noForm !== newRecord.noForm)];
      localStorage.setItem('aetra_registrations', JSON.stringify(updatedList));

      if (currentUser && !currentUser.idPelanggan) {
        const updatedUser = { ...currentUser, idPelanggan: newRecord.idPelanggan };
        setCurrentUser(updatedUser);
        localStorage.setItem('aetra_current_user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.warn('Direct storage sync warning:', err);
    }

    // Persist to online Supabase database asynchronously
    saveRegistrationToDb(newRecord).catch((e) => console.warn('Supabase save error:', e));
    saveTrackingRecordToDb(newTracking).catch((e) => console.warn('Supabase tracking save error:', e));
  };

  const handleUpdateTrackingStep = (noForm: string, nextStep: 1 | 2 | 3 | 4, customNote?: string) => {
    const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const nowTimeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

    // Synchronize registrations state
    setRegistrations((prev) =>
      prev.map((reg) =>
        reg.noForm === noForm
          ? {
              ...reg,
              trackingStep: nextStep,
              dataPasang: {
                ...reg.dataPasang,
                noSeriMeter: nextStep >= 3 ? (reg.dataPasang.noSeriMeter || 'AET-2609-8812') : reg.dataPasang.noSeriMeter,
                noSegel: nextStep >= 4 ? (reg.dataPasang.noSegel || 'SGL-AAT-77401') : reg.dataPasang.noSegel,
              },
            }
          : reg
      )
    );

    setTrackingRecords((prev) => {
      const updatedList = prev.map((rec) => {
        if (rec.noForm !== noForm) return rec;

        const updatedSteps = rec.steps.map((st) => {
          if (st.step < nextStep) {
            return {
              ...st,
              isCompleted: true,
              isCurrent: false,
              statusLabel: `Selesai: ${todayStr}`,
            };
          } else if (st.step === nextStep) {
            return {
              ...st,
              isCompleted: false,
              isCurrent: true,
              statusLabel: `Sedang Berjalan: ${todayStr}`,
            };
          } else {
            return {
              ...st,
              isCompleted: false,
              isCurrent: false,
              statusLabel: 'Menunggu Tahap Sebelumnya',
            };
          }
        });

        const stepTitles: Record<number, string> = {
          1: 'Verifikasi Berkas Permohonan (Admin)',
          2: 'Persetujuan Teknis & Konfirmasi Pembayaran (Admin)',
          3: 'Surat Tugas Pemasangan Pipa & Meter Air Terbit (Admin)',
          4: 'Pemasangan Tuntas & Air Bersih Resmi Aktif (Admin)',
        };
        const stepDescs: Record<number, string> = {
          1: customNote || 'Berkas identitas KTP, KK, dan persil telah diperiksa dan dinyatakan lengkap oleh Admin Operasional.',
          2: customNote || 'Persetujuan teknis disahkan dan pembayaran biaya sambungan telah diverifikasi Lunas oleh Billing Aetra.',
          3: customNote || 'Surat Perintah Kerja (SPK) diterbitkan. Tim teknisi lapangan ditugaskan untuk pemasangan pipa dinas dan water meter.',
          4: customNote || 'Uji debit air bersih sukses, segel kran resmi dipasang, sambungan baru telah aktif mengalirkan air bersih ke pelanggan!',
        };

        const newLog = {
          id: `log-step-${Date.now()}`,
          date: todayStr,
          time: nowTimeStr,
          title: stepTitles[nextStep] || 'Pembaruan Status oleh Admin',
          description: stepDescs[nextStep] || 'Tahapan status sambungan baru telah diperbarui oleh Admin Aetra.',
          status: 'completed' as const,
          step: nextStep,
          actor: 'Admin Operasional Aetra',
          badge: nextStep === 4 ? 'Sukses Tuntas' : `Tahap ${nextStep} Terverifikasi`,
        };

        const existingLogs = rec.timelineEvents || [];

        return {
          ...rec,
          currentStep: nextStep,
          statusPembayaran: nextStep >= 2 ? ('Lunas' as const) : rec.statusPembayaran,
          nomorMeter: nextStep >= 3 ? (rec.nomorMeter || 'AET-2609-8812') : rec.nomorMeter,
          nomorSegel: nextStep >= 4 ? (rec.nomorSegel || 'SGL-AAT-77401') : rec.nomorSegel,
          lastUpdatedByAdmin: `${todayStr}, ${nowTimeStr} (Admin Operasional Aetra)`,
          steps: updatedSteps,
          timelineEvents: [newLog, ...existingLogs],
        };
      });

      const updatedRec = updatedList.find((r) => r.noForm === noForm);
      if (updatedRec) {
        saveTrackingRecordToDb(updatedRec).catch((e) => console.warn('Supabase step update error:', e));
      }
      return updatedList;
    });
  };

  const handleUpdateTechnicalData = (
    noForm: string,
    data: {
      nomorMeter?: string;
      nomorSegel?: string;
      petugasSurveyor?: string;
      petugasTeknisi?: string;
      statusPembayaran?: 'Lunas' | 'Menunggu Pembayaran';
      adminNotes?: string;
    }
  ) => {
    const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const nowTimeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

    setTrackingRecords((prev) => {
      const updatedList = prev.map((rec) => {
        if (rec.noForm !== noForm) return rec;

        const newLog = data.adminNotes
          ? {
              id: `log-admin-${Date.now()}`,
              date: todayStr,
              time: nowTimeStr,
              title: 'Catatan Admin Operasional Aetra',
              description: data.adminNotes,
              status: 'completed' as const,
              step: rec.currentStep,
              actor: 'Backoffice / Pengawas Aetra',
              badge: 'Catatan Resmi',
            }
          : null;

        return {
          ...rec,
          nomorMeter: data.nomorMeter !== undefined ? data.nomorMeter : rec.nomorMeter,
          nomorSegel: data.nomorSegel !== undefined ? data.nomorSegel : rec.nomorSegel,
          statusPembayaran: data.statusPembayaran !== undefined ? data.statusPembayaran : rec.statusPembayaran,
          adminNotes: data.adminNotes !== undefined ? data.adminNotes : rec.adminNotes,
          lastUpdatedByAdmin: `${todayStr}, ${nowTimeStr} (Admin Operasional Aetra)`,
          petugasSurveyor: data.petugasSurveyor
            ? {
                nama: data.petugasSurveyor,
                id: rec.petugasSurveyor?.id || 'SRV-042',
                telp: rec.petugasSurveyor?.telp || '0812-9876-5432',
                role: 'Surveyor Wilayah',
              }
            : rec.petugasSurveyor,
          petugasTeknisi: data.petugasTeknisi
            ? {
                nama: data.petugasTeknisi,
                id: rec.petugasTeknisi?.id || 'TKN-089',
                telp: rec.petugasTeknisi?.telp || '0813-8899-7711',
                role: 'Teknisi Lapangan',
              }
            : rec.petugasTeknisi,
          timelineEvents: newLog ? [newLog, ...(rec.timelineEvents || [])] : rec.timelineEvents,
        };
      });

      const updatedRec = updatedList.find((r) => r.noForm === noForm);
      if (updatedRec) {
        saveTrackingRecordToDb(updatedRec).catch((e) => console.warn('Supabase tech update error:', e));
      }
      return updatedList;
    });

    setRegistrations((prev) =>
      prev.map((reg) => {
        if (reg.noForm !== noForm) return reg;
        return {
          ...reg,
          dataPasang: {
            ...reg.dataPasang,
            noSeriMeter: data.nomorMeter || reg.dataPasang?.noSeriMeter || '',
            noSegel: data.nomorSegel || reg.dataPasang?.noSegel || '',
          },
        };
      })
    );
  };

  const handleDeleteRegistration = (noForm: string) => {
    setRegistrations((prev) => prev.filter((r) => r.noForm !== noForm));
    setTrackingRecords((prev) => prev.filter((t) => t.noForm !== noForm));
    deleteRegistrationFromDb(noForm).catch((e) => console.warn('Supabase delete error:', e));
    if (activeTrackingForm === noForm) {
      setActiveTrackingForm('');
    }
  };

  const handleImportRegistrations = (newRecords: RegistrationFormData[]) => {
    setRegistrations((prev) => {
      const existingForms = new Set(prev.map((r) => r.noForm));
      const filtered = newRecords.filter((r) => !existingForms.has(r.noForm));
      return [...filtered, ...prev];
    });

    const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    setTrackingRecords((prev) => {
      const existingTrackingForms = new Set(prev.map((t) => t.noForm));
      const newTrackings: CustomerTrackingRecord[] = newRecords
        .filter((r) => !existingTrackingForms.has(r.noForm))
        .map((r) => {
          const step = (r.trackingStep as 1 | 2 | 3 | 4) || 1;
          const isPaid = step >= 2;
          return {
            noForm: r.noForm,
            noSr: r.noSr,
            idPelanggan: r.idPelanggan || ('10' + r.noForm.replace(/\D/g, '').padEnd(6, '0')),
            email: r.email,
            nama: r.namaKtp,
            telp: r.telpHp,
            alamat: `${r.alamatPasang}, RT/RW ${r.rtRwPasang}, Kel. ${r.kelurahanPasang || r.desaPasang || '-'}`,
            currentStep: step,
            tanggalDaftar: r.tanggal || todayStr,
            estimasiSelesai: '14 Hari Kerja',
            golonganTarif: r.golonganTarif || '2A1 - Rumah Tangga Standard',
            biayaSambungan: r.biayaSambungan || 1371545,
            statusPembayaran: isPaid ? 'Lunas' : 'Menunggu Pembayaran',
            nomorMeter: r.dataPasang?.noSeriMeter,
            nomorSegel: r.dataPasang?.noSegel,
            petugasSurveyor: {
              nama: 'Bpk. Hendra Gunawan',
              id: 'SRV-AET-042',
              telp: '0812-8899-1122',
              role: 'Surveyor Wilayah',
            },
            petugasTeknisi: {
              nama: r.dataPasang?.namaTeknisi || 'Bpk. Agus Santoso',
              id: 'TKN-AET-018',
              telp: '0877-8822-4645',
              role: 'Teknisi Pipa Dinas & Meter',
            },
            steps: [
              {
                step: 1,
                title: 'Pendaftaran Diterima',
                statusLabel: 'Selesai',
                updatedAt: r.tanggal || todayStr,
                isCompleted: true,
                isCurrent: step === 1,
                notes: 'Formulir pendaftaran berhasil diimpor ke sistem.',
              },
              {
                step: 2,
                title: 'Pembayaran Diterima',
                statusLabel: isPaid ? 'Lunas' : 'Menunggu Pembayaran',
                updatedAt: isPaid ? todayStr : '-',
                isCompleted: isPaid,
                isCurrent: step === 2,
                notes: isPaid ? 'Pembayaran terverifikasi lunas.' : 'Menunggu pembayaran di loket resmi.',
              },
              {
                step: 3,
                title: 'Proses Pemasangan',
                statusLabel: step >= 3 ? 'Sedang Dipasang' : 'Menunggu',
                updatedAt: step >= 3 ? todayStr : '-',
                isCompleted: step >= 3,
                isCurrent: step === 3,
                notes: 'Pemasangan fisik pipa dinas dan water meter.',
              },
              {
                step: 4,
                title: 'Selesai / Air Mengalir',
                statusLabel: step === 4 ? 'Aktif' : 'Belum Aktif',
                updatedAt: step === 4 ? todayStr : '-',
                isCompleted: step === 4,
                isCurrent: step === 4,
                notes: 'Air bersih mengalir dan siap digunakan.',
              },
            ],
            timelineEvents: [],
          };
        });
      return [...newTrackings, ...prev];
    });

    newRecords.forEach((reg) => {
      saveRegistrationToDb(reg).catch((e) => console.warn('Supabase sync error:', e));
    });
  };

  const handleNavigateToTracking = (noForm: string) => {
    setActiveTrackingForm(noForm);
    setActiveTab('tracking');
    setReceiptData(null);
  };

  const handleQuickDemoRegister = () => {
    const demoForm: RegistrationFormData = {
      id: 'reg-' + Date.now(),
      noForm: '572910',
      noSr: '168392',
      idPelanggan: '10842918',
      tanggal: new Date().toISOString().split('T')[0],
      namaKtp: 'Bpk. Suryadi Pratama',
      noKtp: '3671041908850003',
      alamatKtp: 'Jl. Merpati No. 24 RT 003/004, Kel. Cikupa, Tangerang',
      rtRwKtp: '003/004',
      kodePosKtp: '15710',
      kelurahanKtp: 'Cikupa',
      telpHp: '0812-9876-5432',
      email: 'suryadi.pratama@gmail.com',
      alamatPasang: 'Jl. Merpati Indah No. 24 RT 003/004',
      rtRwPasang: '003/004',
      kodePosPasang: '15710',
      kelurahanPasang: 'Cikupa',
      pekerjaan: 'Karyawan Swasta',
      statusKepemilikan: 'Milik Sendiri',
      persyaratan: {
        ktp: true,
        kk: true,
        pbb: true,
        lainnya: false,
      },
      luasTanah: '90',
      luasBangunan: '72',
      totalLuasBangunan: 72,
      fungsiBangunan: 'Rumah Tinggal Pribadi',
      kondisiBangunan: {
        jumlahLantai: 1,
        luasBangunan: '72',
        totalLuasBangunan: 72,
        jumlahPenghuni: 4,
      },
      lingkungan: {
        saluranPembuangan: 'Got Tertutup',
        sanitasi: 'Septic Tank Pribadi',
        halaman: 'Ada',
        lebarJalan: '6 Meter',
        lingkunganTertata: 'Ya',
        realEstate: 'Bukan',
      },
      dataPasang: {
        namaSales: 'Aetra Digital Portal',
        tanggalSurvey: new Date().toISOString().split('T')[0],
        noWorkOrder: 'WO-2026-9901',
        gpsLat: '-6.223451',
        gpsLong: '106.512344',
        namaKontraktor: 'PT Mitra Tirta Tangerang',
        dataAlamat: 'Jl. Merpati Indah No. 24 RT 003/004, Cikupa',
        dataJaringan: 'Pipa Tersier HDPE 63mm',
        dataGalian: ['Tanah Biasa', 'Paving Blok'],
        luasBangunanSurvey: '72 m2',
        kualitasBangunan: 'Permanen Baik',
        fotoProperti: '',
        diameterPipa: '1/2 inch',
        panjangPipa: '4.5 meter',
        panjangPipaTipe: 'Standar (s/d 6m)',
        materialTambahan: 'Kran Kuningan, Stop Kran Ball Valve',
        tanggalPasangMeter: '',
        noSegel: 'SGL-AAT-99120',
        noSeriMeter: 'AET-2609-8472',
      },
      skemaPembayaran: 'Pembayaran Penuh',
      biayaSambungan: 1371545,
      golonganTarif: '2A1 - Rumah Tangga Standard',
      persetujuan: true,
      trackingStep: 1,
      createdAt: new Date().toISOString(),
    };
    handleRegisterSuccess(demoForm);
    setReceiptData(null);
    setActiveTab('tracking');
  };

  const handleAddSurvey = (newSurvey: SurveySubmission) => {
    setSurveys((prev) => [newSurvey, ...prev]);
    saveSurveyToDb(newSurvey).catch((e) => console.warn('Supabase survey save error:', e));
  };

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setUserRole(user.role);
    localStorage.setItem('aetra_current_user', JSON.stringify(user));
    if (user.role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('registration');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('aetra_current_user');
  };

  // If user is not logged in, gate the application with AuthScreen
  if (!currentUser) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-orange-100 selection:text-orange-900">
      {/* Left Sidebar Navigation (4 core features) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        registeredCount={registrations.length}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
        userRole={userRole}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onSwitchRole={(role) => {
          setUserRole(role);
          if (role === 'admin') {
            setActiveTab('admin');
          } else if (activeTab === 'admin') {
            setActiveTab('registration');
          }
        }}
      />

      {/* Main Content Column to the right of fixed sidebar on desktop */}
      <div className="lg:pl-80 flex flex-col min-h-screen">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          onOpenMobileSidebar={() => setIsOpenMobile(true)}
          registeredCount={registrations.length}
          userRole={userRole}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
          onSwitchRole={(role) => {
            setUserRole(role);
            if (role === 'admin') {
              setActiveTab('admin');
            } else if (activeTab === 'admin') {
              setActiveTab('registration');
            }
          }}
        />

        {/* Main Content Modules */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {activeTab === 'admin' && (
            <AdminSection
              registrations={registrations}
              trackingRecords={trackingRecords}
              surveys={surveys}
              onUpdateTrackingStep={handleUpdateTrackingStep}
              onUpdateTechnicalData={handleUpdateTechnicalData}
              onDeleteRegistration={handleDeleteRegistration}
              onQuickDemoRegister={handleQuickDemoRegister}
              onNavigateToTracking={handleNavigateToTracking}
              onNavigateToRegister={() => setActiveTab('registration')}
              onViewReceipt={(record) => setReceiptData(record)}
              onImportRegistrations={handleImportRegistrations}
              onSwitchToCustomer={() => {
                setUserRole('customer');
                setActiveTab('registration');
              }}
              onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
            />
          )}

          {activeTab === 'registration' && (
            <RegistrationForm
              onRegisterSuccess={handleRegisterSuccess}
              onNavigateTracking={handleNavigateToTracking}
              currentUser={currentUser}
              existingRegistrations={registrations}
              onViewReceipt={(record) => setReceiptData(record)}
            />
          )}

          {activeTab === 'tracking' && (() => {
            const customerFilteredRecords = userRole === 'admin'
              ? trackingRecords
              : trackingRecords.filter((rec) => {
                  if (currentUser?.idPelanggan && rec.idPelanggan === currentUser.idPelanggan) return true;
                  if (currentUser?.email && rec.email === currentUser.email) return true;
                  if (currentUser?.nama && rec.nama.toLowerCase().includes(currentUser.nama.toLowerCase())) return true;
                  return false;
                });

            return (
              <TrackingSection
                trackingRecords={customerFilteredRecords}
                activeFormNumber={activeTrackingForm}
                onSelectCustomer={(noForm) => setActiveTrackingForm(noForm)}
                onUpdateTrackingStep={handleUpdateTrackingStep}
                onNavigateToRegister={() => setActiveTab('registration')}
                onQuickDemoRegister={handleQuickDemoRegister}
                onNavigateToAdmin={(noForm) => {
                  setUserRole('admin');
                  setActiveTab('admin');
                  if (noForm) {
                    setActiveTrackingForm(noForm);
                  }
                }}
              />
            );
          })()}

          {activeTab === 'survey' && (
            <SurveySection
              submissions={surveys}
              onSubmitSurvey={handleAddSurvey}
            />
          )}

          {activeTab === 'faq' && (
            <FaqSection faqItems={INITIAL_FAQS} />
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-slate-600 text-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AetraLogo size="sm" variant="horizontal" />
                <div className="border-l border-slate-200 pl-3">
                  <span className="font-bold text-slate-900 text-xs block">
                    PT AETRA AIR TANGERANG
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Penyedia Layanan Air Bersih Terpercaya Kabupaten &amp; Kota Tangerang
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-5 text-slate-500 text-xs">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#F37021]" />
                  Standar Mutu Permenkes RI
                </span>
                <span className="flex items-center gap-1.5 text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                  <Droplets className="w-3.5 h-3.5 text-[#005DAA]" />
                  Jaminan Kualitas Air Bersih
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
              <div>
                <p className="text-slate-600 font-medium">PT Aetra Air Tangerang</p>
                <p className="text-slate-500">Jl. Raya Curug No.27, Kadu Jaya, Curug, Tangerang Banten 15810 &bull; Email: contact.center@aat.co.id</p>
              </div>
              <p>&copy; 2026 Hak Cipta Dilindungi &bull; Sistem Layanan Pelanggan Terpadu</p>
            </div>
          </div>
        </footer>
      </div>

      {/* Confirmation & Printable Slip Modal */}
      {receiptData && (
        <ReceiptModal
          data={receiptData}
          isOpen={Boolean(receiptData)}
          onClose={() => setReceiptData(null)}
          onTrackNow={() => {
            setActiveTrackingForm(receiptData.noForm);
            setActiveTab('tracking');
          }}
        />
      )}

      {/* Supabase Database & Vercel Guide Modal */}
      <SupabaseModal
        key={dbVersion}
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onCredentialsUpdated={() => {
          setDbVersion((v) => v + 1);
          loadFromSupabase();
        }}
      />
    </div>
  );
}
