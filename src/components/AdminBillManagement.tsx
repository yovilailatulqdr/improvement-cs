import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { MonthlyBillRecord } from '../types';
import { cloudSyncService, INITIAL_BILLS_DATA } from '../services/cloudSyncService';
import {
  CreditCard,
  Plus,
  Upload,
  Download,
  FileSpreadsheet,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Trash2,
  Edit3,
  X,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  Calendar,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

interface AdminBillManagementProps {
  bills: MonthlyBillRecord[];
  onUpdateBills: (updatedBills: MonthlyBillRecord[]) => void;
}

export const AdminBillManagement: React.FC<AdminBillManagementProps> = ({
  bills,
  onUpdateBills,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'BELUM LUNAS' | 'LUNAS'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<MonthlyBillRecord | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State for Manual Add / Edit
  const [formData, setFormData] = useState({
    idPelanggan: '',
    noSr: '',
    nama: '',
    alamat: '',
    golonganTarif: '2A1 - Rumah Tangga Standard (R2)',
    nomorMeter: '',
    periodeBulan: 'Maret 2026',
    tanggalJatuhTempo: '20 Maret 2026',
    totalTagihan: 142600,
    status: 'BELUM LUNAS' as 'BELUM LUNAS' | 'LUNAS',
  });

  // Excel Import Preview State
  const [importPreview, setImportPreview] = useState<MonthlyBillRecord[]>([]);
  const [importFileName, setImportFileName] = useState<string>('');

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Filtered Bills
  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      const matchSearch =
        !searchTerm.trim() ||
        b.idPelanggan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.noSr && b.noSr.toLowerCase().includes(searchTerm.toLowerCase())) ||
        b.periodeBulan.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        statusFilter === 'all' || b.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [bills, searchTerm, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = bills.length;
    const unpaid = bills.filter((b) => b.status === 'BELUM LUNAS');
    const paid = bills.filter((b) => b.status === 'LUNAS');
    const totalAmount = bills.reduce((sum, b) => sum + (b.totalTagihan || 0), 0);
    const unpaidAmount = unpaid.reduce((sum, b) => sum + (b.totalTagihan || 0), 0);
    const paidAmount = paid.reduce((sum, b) => sum + (b.totalTagihan || 0), 0);

    return {
      total,
      unpaidCount: unpaid.length,
      paidCount: paid.length,
      totalAmount,
      unpaidAmount,
      paidAmount,
    };
  }, [bills]);

  // Copy ID Pelanggan
  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Open Edit Modal
  const handleOpenEdit = (bill: MonthlyBillRecord) => {
    setEditingBill(bill);
    setFormData({
      idPelanggan: bill.idPelanggan,
      noSr: bill.noSr || '',
      nama: bill.nama,
      alamat: bill.alamat || '',
      golonganTarif: bill.golonganTarif || '2A1 - Rumah Tangga Standard (R2)',
      nomorMeter: bill.nomorMeter || '',
      periodeBulan: bill.periodeBulan,
      tanggalJatuhTempo: bill.tanggalJatuhTempo,
      totalTagihan: bill.totalTagihan,
      status: bill.status,
    });
    setIsAddModalOpen(true);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingBill(null);
    setFormData({
      idPelanggan: '10' + Math.floor(100000 + Math.random() * 900000),
      noSr: '16' + Math.floor(1000 + Math.random() * 9000),
      nama: '',
      alamat: 'Jl. Pemukiman RT 001/002, Tangerang',
      golonganTarif: '2A1 - Rumah Tangga Standard (R2)',
      nomorMeter: 'AET-2609-' + Math.floor(1000 + Math.random() * 9000),
      periodeBulan: 'Maret 2026',
      tanggalJatuhTempo: '20 Maret 2026',
      totalTagihan: 142600,
      status: 'BELUM LUNAS',
    });
    setIsAddModalOpen(true);
  };

  // Save Add / Edit
  const handleSaveBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.idPelanggan.trim()) {
      alert('ID Pelanggan wajib diisi.');
      return;
    }
    if (!formData.nama.trim()) {
      alert('Nama Pelanggan wajib diisi.');
      return;
    }

    const billRecord: MonthlyBillRecord = {
      id: editingBill ? editingBill.id : `bill-${formData.idPelanggan}-${Date.now()}`,
      idPelanggan: formData.idPelanggan.trim(),
      noSr: formData.noSr.trim(),
      nama: formData.nama.trim(),
      alamat: formData.alamat.trim(),
      golonganTarif: formData.golonganTarif,
      nomorMeter: formData.nomorMeter,
      periodeBulan: formData.periodeBulan.trim(),
      tanggalJatuhTempo: formData.tanggalJatuhTempo.trim(),
      standLalu: 0,
      standKini: 0,
      pemakaianM3: 0,
      rincianBlok: { blok1M3: 0, blok1Tarif: 0, blok1Total: 0, blok2M3: 0, blok2Tarif: 0, blok2Total: 0, blok3M3: 0, blok3Tarif: 0, blok3Total: 0 },
      biayaAir: 0,
      biayaPemeliharaanMeter: 12500,
      biayaAdministrasi: 5000,
      retribusi: 0,
      denda: 0,
      totalTagihan: Number(formData.totalTagihan) || 0,
      status: formData.status,
      tanggalBayar: formData.status === 'LUNAS' ? new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : undefined,
      metodeBayar: formData.status === 'LUNAS' ? 'Bank BCA (Virtual Account)' : undefined,
    };

    let updated: MonthlyBillRecord[];
    if (editingBill) {
      updated = bills.map((b) => (b.id === editingBill.id ? billRecord : b));
      showToast(`Tagihan untuk ${billRecord.nama} berhasil diperbarui.`);
    } else {
      updated = [billRecord, ...bills];
      showToast(`Tagihan baru untuk ${billRecord.nama} berhasil ditambahkan.`);
    }

    onUpdateBills(updated);
    cloudSyncService.saveBills(updated);
    setIsAddModalOpen(false);
    setEditingBill(null);
  };

  // Delete Bill
  const handleDeleteBill = (id: string, name: string) => {
    if (!window.confirm(`Yakin ingin menghapus data tagihan untuk ${name}?`)) return;
    const updated = bills.filter((b) => b.id !== id);
    onUpdateBills(updated);
    cloudSyncService.deleteBill(id);
    showToast(`Tagihan untuk ${name} telah dihapus.`);
  };

  // Toggle Status Lunas / Belum Lunas
  const handleToggleStatus = (bill: MonthlyBillRecord) => {
    const newStatus = bill.status === 'LUNAS' ? 'BELUM LUNAS' : 'LUNAS';
    const updatedRecord: MonthlyBillRecord = {
      ...bill,
      status: newStatus,
      tanggalBayar: newStatus === 'LUNAS' ? new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : undefined,
      metodeBayar: newStatus === 'LUNAS' ? 'Kasir / Mitra Resmi Aetra' : undefined,
    };

    const updated = bills.map((b) => (b.id === bill.id ? updatedRecord : b));
    onUpdateBills(updated);
    cloudSyncService.saveBills(updated);
    showToast(`Status tagihan #${bill.idPelanggan} diubah menjadi ${newStatus}.`);
  };

  // Export to Excel
  const handleExportExcel = () => {
    const dataToExport = bills.map((b, idx) => ({
      No: idx + 1,
      'ID Pelanggan': b.idPelanggan,
      'No. SR': b.noSr || '',
      'Nama Pelanggan': b.nama,
      Alamat: b.alamat || '',
      'Golongan Tarif': b.golonganTarif || '',
      'Periode Tagihan': b.periodeBulan,
      'Total Tagihan (Rp)': b.totalTagihan,
      'Jatuh Tempo': b.tanggalJatuhTempo,
      'Status Pembayaran': b.status,
      'Tanggal Bayar': b.tanggalBayar || '',
      'Metode Bayar': b.metodeBayar || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Tagihan Air');
    XLSX.writeFile(workbook, `Tagihan_Air_Aetra_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Data tagihan berhasil diekspor ke Excel!');
  };

  // Download Sample Template Excel
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        id_pelanggan: '10842918',
        no_sr: '168392',
        nama: 'Yovi Lailatul',
        alamat: 'Jl. Merpati No. 24 RT 003/004, Cikupa',
        periode_bulan: 'Maret 2026',
        total_tagihan: 142600,
        tanggal_jatuh_tempo: '20 Maret 2026',
        status: 'BELUM LUNAS',
      },
      {
        id_pelanggan: '10928371',
        no_sr: '172839',
        nama: 'Amara Putri',
        alamat: 'Jl. Raya Serang Km 14 No. 88, Balaraja',
        periode_bulan: 'Maret 2026',
        total_tagihan: 218400,
        tanggal_jatuh_tempo: '20 Maret 2026',
        status: 'LUNAS',
      },
      {
        id_pelanggan: '10739182',
        no_sr: '183920',
        nama: 'Nabila Syahrani',
        alamat: 'Lavon Swan City Cluster Allura, Pasar Kemis',
        periode_bulan: 'Maret 2026',
        total_tagihan: 96500,
        tanggal_jatuh_tempo: '20 Maret 2026',
        status: 'BELUM LUNAS',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Tagihan');
    XLSX.writeFile(workbook, 'Template_Impor_Tagihan_Pelanggan_Aetra.xlsx');
    showToast('Template Excel berhasil diunduh.');
  };

  // Parse Uploaded Excel File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(sheet);

        if (!rawJson || rawJson.length === 0) {
          alert('File Excel kosong atau format tidak sesuai.');
          return;
        }

        const parsedBills: MonthlyBillRecord[] = rawJson.map((row, idx) => {
          const idPelanggan = String(row['id_pelanggan'] || row['ID Pelanggan'] || row['id'] || `10${Math.floor(100000 + Math.random() * 900000)}`).trim();
          const nama = String(row['nama'] || row['Nama'] || row['Nama Pelanggan'] || 'Pelanggan Baru').trim();
          const total = Number(row['total_tagihan'] || row['Total Tagihan'] || row['tagihan'] || row['Total Tagihan (Rp)'] || 142600);
          const rawStatus = String(row['status'] || row['Status'] || row['Status Pembayaran'] || 'BELUM LUNAS').toUpperCase();
          const status = rawStatus.includes('LUNAS') && !rawStatus.includes('BELUM') ? 'LUNAS' : 'BELUM LUNAS';

          return {
            id: `bill-${idPelanggan}-${Date.now()}-${idx}`,
            idPelanggan,
            noSr: String(row['no_sr'] || row['No. SR'] || row['sr'] || ''),
            nama,
            alamat: String(row['alamat'] || row['Alamat'] || 'Wilayah Pelayanan Aetra Tangerang'),
            golonganTarif: String(row['golongan_tarif'] || row['Golongan Tarif'] || '2A1 - Rumah Tangga Standard (R2)'),
            nomorMeter: String(row['nomor_meter'] || row['Nomor Meter'] || 'AET-2609-001'),
            periodeBulan: String(row['periode_bulan'] || row['Periode'] || row['Periode Tagihan'] || 'Maret 2026'),
            tanggalJatuhTempo: String(row['tanggal_jatuh_tempo'] || row['Jatuh Tempo'] || '20 Maret 2026'),
            standLalu: 0,
            standKini: 0,
            pemakaianM3: 0,
            rincianBlok: { blok1M3: 0, blok1Tarif: 0, blok1Total: 0, blok2M3: 0, blok2Tarif: 0, blok2Total: 0, blok3M3: 0, blok3Tarif: 0, blok3Total: 0 },
            biayaAir: 0,
            biayaPemeliharaanMeter: 12500,
            biayaAdministrasi: 5000,
            retribusi: 0,
            denda: 0,
            totalTagihan: total,
            status,
            tanggalBayar: status === 'LUNAS' ? new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : undefined,
          };
        });

        setImportPreview(parsedBills);
      } catch (err: any) {
        alert('Gagal membaca file Excel: ' + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Commit Excel Import
  const handleCommitImport = () => {
    if (importPreview.length === 0) {
      alert('Tidak ada data yang dapat diimpor.');
      return;
    }

    // Merge: update existing by ID Pelanggan + Periode, append new
    const merged = [...bills];
    importPreview.forEach((newBill) => {
      const existingIdx = merged.findIndex(
        (b) => b.idPelanggan === newBill.idPelanggan && b.periodeBulan === newBill.periodeBulan
      );
      if (existingIdx >= 0) {
        merged[existingIdx] = { ...merged[existingIdx], ...newBill };
      } else {
        merged.unshift(newBill);
      }
    });

    onUpdateBills(merged);
    cloudSyncService.saveBills(merged);
    showToast(`Berhasil mengimpor ${importPreview.length} data tagihan dari Excel!`);
    setIsImportModalOpen(false);
    setImportPreview([]);
    setImportFileName('');
  };

  // Manual Trigger Cloud Sync
  const handleManualSync = async () => {
    setIsSyncing(true);
    await cloudSyncService.syncNow();
    setIsSyncing(false);
    showToast('Sinkronisasi database tagihan cloud berhasil!');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border border-slate-700 animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Pelanggan Tertagih</span>
            <CreditCard className="w-4 h-4 text-[#005DAA]" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.total}</div>
          <div className="text-[11px] text-slate-500">Rekening terdaftar</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Belum Lunas</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{stats.unpaidCount}</div>
          <div className="text-[11px] text-slate-500">Rp {stats.unpaidAmount.toLocaleString('id-ID')}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Sudah Lunas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{stats.paidCount}</div>
          <div className="text-[11px] text-slate-500">Rp {stats.paidAmount.toLocaleString('id-ID')}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Nominal Tagihan</span>
            <Layers className="w-4 h-4 text-[#F37021]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#005DAA]">
            Rp {stats.totalAmount.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-slate-500">Akumulasi billing</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Top Header & Action Buttons */}
        <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#005DAA] border border-blue-200 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                  Manajemen Data Tagihan Pelanggan
                </h3>
                <span className="text-[10px] font-bold bg-[#005DAA] text-white px-2 py-0.5 rounded-full">
                  {filteredBills.length} Rekening
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Admin dapat menambah data tagihan manual maupun impor massal via file Excel.
              </p>
            </div>
          </div>

          {/* Action Buttons Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#005DAA] hover:bg-[#004A88] text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Tagihan Manual</span>
            </button>

            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Impor Excel</span>
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition shadow-2xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Ekspor Excel</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition shadow-2xs cursor-pointer"
              title="Unduh Format Template Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#F37021]" />
              <span className="hidden sm:inline">Format Template</span>
            </button>

            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="p-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl transition shadow-2xs cursor-pointer"
              title="Sinkronkan Cloud Antar Perangkat"
            >
              <RefreshCw className={`w-4 h-4 text-[#005DAA] ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="p-4 border-b border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari ID Pelanggan, Nama, No. SR, atau Periode..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#005DAA] focus:outline-hidden"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
            <span className="text-slate-400 font-semibold text-[11px] flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Status:
            </span>
            {(['all', 'BELUM LUNAS', 'LUNAS'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg transition font-bold text-[11px] ${
                  statusFilter === st
                    ? 'bg-[#005DAA] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'all' ? 'Semua' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-[11px] text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">ID Pelanggan</th>
                <th className="py-3 px-4">Nama Pelanggan</th>
                <th className="py-3 px-4">No. SR</th>
                <th className="py-3 px-4">Periode</th>
                <th className="py-3 px-4">Total Tagihan</th>
                <th className="py-3 px-4">Jatuh Tempo</th>
                <th className="py-3 px-4 text-center">Status (Klik Ubah)</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-xs">Belum ada data tagihan yang sesuai pencarian.</p>
                    <p className="text-[11px] mt-0.5">Gunakan tombol "Tambah Tagihan Manual" atau "Impor Excel" untuk memasukkan data tagihan.</p>
                  </td>
                </tr>
              ) : (
                filteredBills.map((b) => (
                  <tr key={b.id} className="hover:bg-blue-50/30 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          {b.idPelanggan}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(b.idPelanggan)}
                          className="text-slate-400 hover:text-[#005DAA] transition"
                          title="Salin ID Pelanggan"
                        >
                          {copiedId === b.idPelanggan ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <strong className="text-slate-900 font-bold block">{b.nama}</strong>
                      <span className="text-[10px] text-slate-400 block truncate max-w-[200px]">{b.alamat}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                      {b.noSr || '-'}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {b.periodeBulan}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#005DAA]">
                      Rp {b.totalTagihan.toLocaleString('id-ID')},-
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {b.tanggalJatuhTempo}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(b)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide transition cursor-pointer border ${
                          b.status === 'LUNAS'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                        }`}
                        title="Klik untuk ubah status pembayaran"
                      >
                        {b.status === 'LUNAS' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>LUNAS</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-700" />
                            <span>BELUM LUNAS</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(b)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Tagihan"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBill(b.id, b.nama)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Hapus Tagihan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Tambah / Edit Tagihan Manual */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 my-auto">
            <div className="bg-[#005DAA] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5" />
                <h3 className="font-bold text-sm sm:text-base">
                  {editingBill ? 'Edit Data Tagihan Pelanggan' : 'Tambah Data Tagihan Pelanggan Manual'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs font-bold transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBill} className="p-5 sm:p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ID Pelanggan (Kode Bayar) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.idPelanggan}
                    onChange={(e) => setFormData({ ...formData, idPelanggan: e.target.value.replace(/\s+/g, '') })}
                    placeholder="Contoh: 10842918"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#005DAA] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. SR (Sambungan)</label>
                  <input
                    type="text"
                    value={formData.noSr}
                    onChange={(e) => setFormData({ ...formData, noSr: e.target.value })}
                    placeholder="Contoh: 168392"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-800 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Lengkap Pelanggan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: Bpk. Ahmad Yani"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#005DAA] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alamat Pemasangan</label>
                <input
                  type="text"
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  placeholder="Alamat jalan / RT / RW / Kelurahan"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Periode Bulan Tagihan</label>
                  <input
                    type="text"
                    value={formData.periodeBulan}
                    onChange={(e) => setFormData({ ...formData, periodeBulan: e.target.value })}
                    placeholder="Contoh: Maret 2026"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Jatuh Tempo</label>
                  <input
                    type="text"
                    value={formData.tanggalJatuhTempo}
                    onChange={(e) => setFormData({ ...formData, tanggalJatuhTempo: e.target.value })}
                    placeholder="Contoh: 20 Maret 2026"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Total Tagihan Air (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={100}
                    value={formData.totalTagihan}
                    onChange={(e) => setFormData({ ...formData, totalTagihan: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-blue-900 focus:bg-white focus:ring-2 focus:ring-[#005DAA] focus:outline-hidden text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Pembayaran</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-hidden text-xs"
                  >
                    <option value="BELUM LUNAS">BELUM LUNAS (Menunggu)</option>
                    <option value="LUNAS">LUNAS (Sudah Dibayar)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#005DAA] hover:bg-[#004A88] text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  {editingBill ? 'Simpan Perubahan' : 'Tambah Tagihan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Impor Excel (.xlsx) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 my-auto">
            <div className="bg-emerald-700 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-5 h-5 text-emerald-200" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base">Impor Data Tagihan Pelanggan via Excel</h3>
                  <p className="text-[11px] text-emerald-100">Upload file spreadsheet (.xlsx / .csv) untuk update tagihan massal</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportPreview([]);
                }}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs font-bold transition"
              >
                ✕
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4 text-xs">
              {/* Template Download helper */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <span className="font-bold text-emerald-950 block text-xs">Belum punya format template Excel?</span>
                  <span className="text-[11px] text-emerald-800 block">Unduh template resmi dengan kolom: id_pelanggan, nama, no_sr, periode_bulan, total_tagihan, jatuh_tempo, status</span>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition inline-flex items-center gap-1.5 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Template</span>
                </button>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-emerald-50/30 transition">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <label className="inline-block px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-xs">
                  <span>Pilih File Excel (.xlsx / .csv)</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                {importFileName ? (
                  <p className="text-xs font-bold text-emerald-800 mt-2">✓ File terpilih: {importFileName}</p>
                ) : (
                  <p className="text-[11px] text-slate-500 mt-2">Seret file Excel ke sini atau klik tombol di atas</p>
                )}
              </div>

              {/* Import Preview Table */}
              {importPreview.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">
                      Pratinjau Data ({importPreview.length} Baris Terbaca):
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                      Siap Diimpor
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 font-bold text-slate-600 sticky top-0">
                        <tr>
                          <th className="p-2">ID Pelanggan</th>
                          <th className="p-2">Nama</th>
                          <th className="p-2">Periode</th>
                          <th className="p-2">Tagihan (Rp)</th>
                          <th className="p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {importPreview.map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-2 font-mono font-bold text-slate-900">{row.idPelanggan}</td>
                            <td className="p-2">{row.nama}</td>
                            <td className="p-2">{row.periodeBulan}</td>
                            <td className="p-2 font-mono text-[#005DAA]">Rp {row.totalTagihan.toLocaleString('id-ID')}</td>
                            <td className="p-2">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                row.status === 'LUNAS' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setImportPreview([]);
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={importPreview.length === 0}
                  onClick={handleCommitImport}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-40"
                >
                  Proses &amp; Simpan ke Sistem ({importPreview.length} Tagihan)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
