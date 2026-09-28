import React, { useState, useMemo } from 'react';
import { UserAccount, RegistrationFormData } from '../types';
import { 
  CreditCard, 
  Search, 
  Droplets, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Receipt, 
  Printer, 
  Download, 
  ExternalLink, 
  Calendar, 
  Building2, 
  MapPin, 
  QrCode, 
  Wallet, 
  Store, 
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  History,
  RotateCcw
} from 'lucide-react';

interface MonthlyBillSectionProps {
  currentUser?: UserAccount | null;
  registrations?: RegistrationFormData[];
  onNavigateToRegister?: () => void;
}

interface BillData {
  idPelanggan: string;
  noSr: string;
  nama: string;
  alamat: string;
  golonganTarif: string;
  nomorMeter: string;
  periodeBulan: string;
  tanggalJatuhTempo: string;
  standLalu: number;
  standKini: number;
  pemakaianM3: number;
  blok1M3: number;
  blok1Tarif: number;
  blok1Total: number;
  blok2M3: number;
  blok2Tarif: number;
  blok2Total: number;
  blok3M3: number;
  blok3Tarif: number;
  blok3Total: number;
  biayaPemeliharaan: number;
  biayaAdmin: number;
  denda: number;
  totalTagihan: number;
  status: 'BELUM LUNAS' | 'LUNAS';
  tanggalBayar?: string;
  metodeBayar?: string;
  noReferensi?: string;
}

// Initial Mock Monthly Bills
const INITIAL_BILLS: Record<string, BillData> = {
  '10842918': {
    idPelanggan: '10842918',
    noSr: '168392',
    nama: 'Yovi Lailatul',
    alamat: 'Jl. Merpati No. 24 RT 003/004, Kel. Cikupa, Kec. Cikupa, Tangerang',
    golonganTarif: '2A1 - Rumah Tangga Standard (R2)',
    nomorMeter: 'AET-2609-8472',
    periodeBulan: 'Bulan Berjalan (Maret 2026)',
    tanggalJatuhTempo: '20 Maret 2026',
    standLalu: 142,
    standKini: 165,
    pemakaianM3: 23,
    blok1M3: 10,
    blok1Tarif: 4250,
    blok1Total: 42500,
    blok2M3: 10,
    blok2Tarif: 5800,
    blok2Total: 58000,
    blok3M3: 3,
    blok3Tarif: 8200,
    blok3Total: 24600,
    biayaPemeliharaan: 12500,
    biayaAdmin: 5000,
    denda: 0,
    totalTagihan: 142600,
    status: 'BELUM LUNAS',
  },
  '10928371': {
    idPelanggan: '10928371',
    noSr: '172839',
    nama: 'Amara Putri',
    alamat: 'Jl. Raya Serang Km 14 No. 88, Balaraja, Tangerang',
    golonganTarif: '2A2 - Rumah Tangga Menengah (R3)',
    nomorMeter: 'AET-2609-9104',
    periodeBulan: 'Bulan Berjalan (Maret 2026)',
    tanggalJatuhTempo: '20 Maret 2026',
    standLalu: 210,
    standKini: 228,
    pemakaianM3: 18,
    blok1M3: 10,
    blok1Tarif: 4600,
    blok1Total: 46000,
    blok2M3: 8,
    blok2Tarif: 6200,
    blok2Total: 49600,
    blok3M3: 0,
    blok3Tarif: 8800,
    blok3Total: 0,
    biayaPemeliharaan: 15000,
    biayaAdmin: 5000,
    denda: 0,
    totalTagihan: 115600,
    status: 'BELUM LUNAS',
  },
  '10738192': {
    idPelanggan: '10738192',
    noSr: '159201',
    nama: 'Nabila Az-Zahra',
    alamat: 'Perumahan Graha Raya Blok B2 No. 15, Pasar Kemis, Tangerang',
    golonganTarif: '2A1 - Rumah Tangga Standard (R2)',
    nomorMeter: 'AET-2609-7721',
    periodeBulan: 'Bulan Berjalan (Maret 2026)',
    tanggalJatuhTempo: '20 Maret 2026',
    standLalu: 88,
    standKini: 102,
    pemakaianM3: 14,
    blok1M3: 10,
    blok1Tarif: 4250,
    blok1Total: 42500,
    blok2M3: 4,
    blok2Tarif: 5800,
    blok2Total: 23200,
    blok3M3: 0,
    blok3Tarif: 8200,
    blok3Total: 0,
    biayaPemeliharaan: 12500,
    biayaAdmin: 5000,
    denda: 0,
    totalTagihan: 83200,
    status: 'LUNAS',
    tanggalBayar: '10 Maret 2026 09:14 WIB',
    metodeBayar: 'BCA Virtual Account',
    noReferensi: 'TRX-AAT-20260310-9921',
  },
};

export const MonthlyBillSection: React.FC<MonthlyBillSectionProps> = ({
  currentUser,
  registrations = [],
  onNavigateToRegister,
}) => {
  // Input search state
  const initialInput = currentUser?.idPelanggan || '10842918';
  const [searchId, setSearchId] = useState<string>(initialInput);
  const [activeBill, setActiveBill] = useState<BillData | null>(() => {
    return INITIAL_BILLS[initialInput] || INITIAL_BILLS['10842918'];
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string>('');

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<'qris' | 'va_bca' | 'va_mandiri' | 'va_bri' | 'minimarket' | 'pos'>('qris');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<BillData | null>(null);

  // Local Bills State
  const [billsDatabase, setBillsDatabase] = useState<Record<string, BillData>>(() => {
    try {
      const saved = localStorage.getItem('aetra_monthly_bills');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_BILLS;
  });

  const saveBillsToStorage = (updated: Record<string, BillData>) => {
    setBillsDatabase(updated);
    try {
      localStorage.setItem('aetra_monthly_bills', JSON.stringify(updated));
    } catch {}
  };

  const handleSearch = (targetId?: string) => {
    const idToLook = (targetId || searchId).trim().replace(/\D/g, '');
    if (!idToLook) {
      setSearchError('Silakan masukkan nomor ID Pelanggan Anda.');
      return;
    }

    setSearchError('');
    setIsSearching(true);

    setTimeout(() => {
      setIsSearching(false);
      // Look in existing billsDatabase first
      if (billsDatabase[idToLook]) {
        setActiveBill(billsDatabase[idToLook]);
        return;
      }

      // Check if matches any registration
      const matchReg = registrations.find(
        (r) => (r.idPelanggan && r.idPelanggan.replace(/\D/g, '') === idToLook) || r.noForm.replace(/\D/g, '') === idToLook
      );

      if (matchReg) {
        // Generate simulated bill for this registered customer
        const generatedBill: BillData = {
          idPelanggan: matchReg.idPelanggan || idToLook,
          noSr: matchReg.noSr || '168900',
          nama: matchReg.namaKtp,
          alamat: matchReg.alamatPasang || matchReg.alamatKtp,
          golonganTarif: matchReg.golonganTarif || '2A1 - Rumah Tangga Standard',
          nomorMeter: matchReg.dataPasang?.noSeriMeter || 'AET-2609-5501',
          periodeBulan: 'Bulan Berjalan (Maret 2026)',
          tanggalJatuhTempo: '20 Maret 2026',
          standLalu: 110,
          standKini: 129,
          pemakaianM3: 19,
          blok1M3: 10,
          blok1Tarif: 4250,
          blok1Total: 42500,
          blok2M3: 9,
          blok2Tarif: 5800,
          blok2Total: 52200,
          blok3M3: 0,
          blok3Tarif: 8200,
          blok3Total: 0,
          biayaPemeliharaan: 12500,
          biayaAdmin: 5000,
          denda: 0,
          totalTagihan: 112200,
          status: 'BELUM LUNAS',
        };

        const updated = { ...billsDatabase, [idToLook]: generatedBill };
        saveBillsToStorage(updated);
        setActiveBill(generatedBill);
      } else {
        // Not found
        setSearchError(`Data ID Pelanggan #${idToLook} belum ditemukan di pangkalan data penagihan Aetra. Pastikan nomor ID benar atau gunakan contoh ID di bawah.`);
        setActiveBill(null);
      }
    }, 400);
  };

  const handleConfirmPayment = () => {
    if (!activeBill) return;

    setIsProcessingPayment(true);

    setTimeout(() => {
      setIsProcessingPayment(false);
      const now = new Date();
      const dateStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

      const channelNames: Record<string, string> = {
        qris: 'QRIS (Gojek/Shopee/OVO/DANA)',
        va_bca: 'BCA Virtual Account',
        va_mandiri: 'Mandiri Virtual Account',
        va_bri: 'BRI Virtual Account',
        minimarket: 'Indomaret / Alfamart',
        pos: 'Loket Pos Indonesia',
      };

      const paidBill: BillData = {
        ...activeBill,
        status: 'LUNAS',
        tanggalBayar: `${dateStr} ${timeStr}`,
        metodeBayar: channelNames[selectedChannel] || 'Kanal Resmi Aetra',
        noReferensi: `TRX-AAT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`,
      };

      const updated = { ...billsDatabase, [activeBill.idPelanggan]: paidBill };
      saveBillsToStorage(updated);
      setActiveBill(paidBill);
      setPaymentSuccessData(paidBill);
      setIsPaymentModalOpen(false);
    }, 1200);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-linear-to-r from-[#005DAA] via-[#004B8A] to-[#003868] rounded-2xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-sky-200 text-xs font-semibold border border-white/15">
            <CreditCard className="w-3.5 h-3.5 text-[#F37021]" />
            <span>Layanan Pembayaran &amp; Cek Tagihan Air Resmi</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Pembayaran Tagihan Bulanan Aetra
          </h2>
          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
            Masukkan Nomor ID Pelanggan Anda untuk melihat rincian pemakaian meter air bersih (m³), biaya blok tarif, dan melakukan pembayaran secara instan melalui kanal resmi PT Aetra Air Tangerang.
          </p>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            Masukkan ID Pelanggan (Nomor Sambungan Air)
          </label>
          <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                placeholder="Contoh: 10842918"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#005DAA] focus:border-[#005DAA] focus:outline-hidden transition"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
            </div>

            <button
              type="button"
              onClick={() => handleSearch()}
              disabled={isSearching}
              className="px-6 py-3 bg-[#005DAA] hover:bg-[#004A88] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 active:scale-98"
            >
              {isSearching ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memeriksa Tagihan...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Cek Tagihan Air</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick select chips */}
        <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
          <span className="text-slate-400 font-semibold">Contoh ID Cepat:</span>
          {Object.keys(billsDatabase).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setSearchId(id);
                handleSearch(id);
              }}
              className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-semibold transition cursor-pointer ${
                searchId === id
                  ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              }`}
            >
              #{id} ({billsDatabase[id]?.nama?.split(' ')[0]})
            </button>
          ))}
        </div>

        {searchError && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{searchError}</p>
          </div>
        )}
      </div>

      {/* BILL RESULT CARD */}
      {activeBill && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Header Card */}
          <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/60 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-sm font-black text-[#005DAA] bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                  ID: #{activeBill.idPelanggan}
                </span>
                <span className="text-xs text-slate-400 font-medium font-mono">
                  No. SR: {activeBill.noSr}
                </span>
                <span className="text-xs text-slate-400">&bull;</span>
                <span className="text-xs font-semibold text-slate-600">
                  {activeBill.periodeBulan}
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900">
                {activeBill.nama}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#F37021] shrink-0" />
                <span>{activeBill.alamat}</span>
              </p>
            </div>

            {/* Status Pill & Action */}
            <div className="flex flex-col sm:items-end gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-2xs ${
                    activeBill.status === 'LUNAS'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-rose-50 text-rose-800 border-rose-300 animate-pulse'
                  }`}
                >
                  {activeBill.status === 'LUNAS' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Tagihan Lunas</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5 text-rose-600" />
                      <span>Belum Lunas</span>
                    </>
                  )}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Jatuh Tempo: <strong className="text-slate-700">{activeBill.tanggalJatuhTempo}</strong>
              </span>
            </div>
          </div>

          {/* Meter Readings & Consumption Metric */}
          <div className="p-5 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/30 border-b border-slate-100">
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Nomor Meter</span>
              <span className="text-xs font-mono font-bold text-slate-800 block mt-0.5 truncate">
                {activeBill.nomorMeter}
              </span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Stand Meter Lalu</span>
              <span className="text-xs font-mono font-bold text-slate-700 block mt-0.5">
                {activeBill.standLalu} m³
              </span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Stand Meter Kini</span>
              <span className="text-xs font-mono font-bold text-slate-700 block mt-0.5">
                {activeBill.standKini} m³
              </span>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
              <span className="text-[10px] uppercase font-bold text-blue-900 block flex items-center gap-1">
                <Droplets className="w-3 h-3 text-[#005DAA]" />
                Pemakaian Air
              </span>
              <span className="text-sm font-mono font-black text-[#005DAA] block mt-0.5">
                {activeBill.pemakaianM3} m³
              </span>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="p-5 sm:p-6 space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-[#005DAA]" />
              Rincian Perhitungan Tagihan Air
            </h4>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5">Uraian Komponen Biaya</th>
                    <th className="px-4 py-2.5 text-center">Volume (m³)</th>
                    <th className="px-4 py-2.5 text-right">Tarif / m³</th>
                    <th className="px-4 py-2.5 text-right">Jumlah (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  <tr>
                    <td className="px-4 py-2.5">
                      <span className="font-semibold block">Blok 1 (Pemakaian 0 - 10 m³)</span>
                      <span className="text-[10px] text-slate-400">Tarif kebutuhan dasar rumah tangga</span>
                    </td>
                    <td className="px-4 py-2.5 text-center font-mono">{activeBill.blok1M3}</td>
                    <td className="px-4 py-2.5 text-right font-mono">Rp {activeBill.blok1Tarif.toLocaleString('id-ID')}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold">Rp {activeBill.blok1Total.toLocaleString('id-ID')}</td>
                  </tr>

                  {activeBill.blok2M3 > 0 && (
                    <tr>
                      <td className="px-4 py-2.5">
                        <span className="font-semibold block">Blok 2 (Pemakaian 11 - 20 m³)</span>
                        <span className="text-[10px] text-slate-400">Tarif pemakaian sedang</span>
                      </td>
                      <td className="px-4 py-2.5 text-center font-mono">{activeBill.blok2M3}</td>
                      <td className="px-4 py-2.5 text-right font-mono">Rp {activeBill.blok2Tarif.toLocaleString('id-ID')}</td>
                      <td className="px-4 py-2.5 text-right font-mono font-semibold">Rp {activeBill.blok2Total.toLocaleString('id-ID')}</td>
                    </tr>
                  )}

                  {activeBill.blok3M3 > 0 && (
                    <tr>
                      <td className="px-4 py-2.5">
                        <span className="font-semibold block">Blok 3 (Pemakaian &gt; 20 m³)</span>
                        <span className="text-[10px] text-slate-400">Tarif pemakaian tinggi</span>
                      </td>
                      <td className="px-4 py-2.5 text-center font-mono">{activeBill.blok3M3}</td>
                      <td className="px-4 py-2.5 text-right font-mono">Rp {activeBill.blok3Tarif.toLocaleString('id-ID')}</td>
                      <td className="px-4 py-2.5 text-right font-mono font-semibold">Rp {activeBill.blok3Total.toLocaleString('id-ID')}</td>
                    </tr>
                  )}

                  <tr className="bg-slate-50/50">
                    <td className="px-4 py-2.5">Biaya Pemeliharaan Meter Air</td>
                    <td className="px-4 py-2.5 text-center text-slate-400">-</td>
                    <td className="px-4 py-2.5 text-right text-slate-400">-</td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold">Rp {activeBill.biayaPemeliharaan.toLocaleString('id-ID')}</td>
                  </tr>

                  <tr className="bg-slate-50/50">
                    <td className="px-4 py-2.5">Biaya Administrasi Pelayanan</td>
                    <td className="px-4 py-2.5 text-center text-slate-400">-</td>
                    <td className="px-4 py-2.5 text-right text-slate-400">-</td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold">Rp {activeBill.biayaAdmin.toLocaleString('id-ID')}</td>
                  </tr>

                  {activeBill.denda > 0 && (
                    <tr className="bg-rose-50/50 text-rose-900">
                      <td className="px-4 py-2.5 font-bold">Denda Keterlambatan Pembayaran</td>
                      <td className="px-4 py-2.5 text-center">-</td>
                      <td className="px-4 py-2.5 text-right">-</td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold">Rp {activeBill.denda.toLocaleString('id-ID')}</td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-blue-50/80 border-t-2 border-blue-200">
                  <tr>
                    <td colSpan={3} className="px-4 py-3.5 text-xs font-black text-blue-950 uppercase tracking-wide">
                      Total Tagihan Rekening Air:
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-base font-black text-[#005DAA]">
                      Rp {activeBill.totalTagihan.toLocaleString('id-ID')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              {activeBill.status === 'LUNAS' ? (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex-1 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-emerald-950 block">
                        Tagihan Ini Telah Lunas Terbayar
                      </span>
                      <span className="text-[11px] text-emerald-700">
                        {activeBill.tanggalBayar} &bull; Metode: {activeBill.metodeBayar}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPaymentSuccessData(activeBill)}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Lihat Struk Resmi</span>
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-xs text-slate-500">
                    <span>Segera lakukan pembayaran sebelum </span>
                    <strong className="text-slate-800">{activeBill.tanggalJatuhTempo}</strong>
                    <span> untuk menghindari denda keterlambatan.</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="w-full sm:w-auto px-6 py-3 bg-[#F37021] hover:bg-[#d95e14] text-white rounded-xl text-sm font-bold shadow-md shadow-orange-500/20 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Bayar Tagihan Sekarang (Rp {activeBill.totalTagihan.toLocaleString('id-ID')})</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Riwayat Pembayaran Sebelumnya */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#005DAA]" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Riwayat Pembayaran Rekening Air Sebelumnya
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">Data 3 Bulan Terakhir</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              periode: 'Februari 2026',
              pemakaian: '21 m³',
              total: 'Rp 134.200',
              tanggal: '14 Feb 2026',
              metode: 'BCA Virtual Account',
            },
            {
              periode: 'Januari 2026',
              pemakaian: '24 m³',
              total: 'Rp 148.500',
              tanggal: '12 Jan 2026',
              metode: 'Indomaret Kasir',
            },
            {
              periode: 'Desember 2025',
              pemakaian: '22 m³',
              total: 'Rp 138.800',
              tanggal: '18 Des 2025',
              metode: 'QRIS Gopay',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{item.periode}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  LUNAS
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600 text-[11px]">
                <span>Pemakaian: {item.pemakaian}</span>
                <span className="font-mono font-bold text-slate-800">{item.total}</span>
              </div>
              <div className="pt-1 border-t border-slate-200 text-[10px] text-slate-400 flex items-center justify-between">
                <span>{item.tanggal}</span>
                <span>{item.metode}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL PEMBAYARAN TAGIHAN BULANAN                          */}
      {/* ========================================================= */}
      {isPaymentModalOpen && activeBill && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 bg-linear-to-r from-[#005DAA] to-[#004A88] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#F37021]" />
                  Bayar Tagihan Air Bulanan
                </h3>
                <p className="text-xs text-blue-100 mt-0.5">
                  ID Pelanggan: #{activeBill.idPelanggan} &bull; {activeBill.nama}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
              >
                &times;
              </button>
            </div>

            {/* Total Ringkasan */}
            <div className="p-5 border-b border-slate-100 bg-blue-50/50 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block">Total yang Harus Dibayar:</span>
                <span className="text-2xl font-mono font-black text-[#005DAA]">
                  Rp {activeBill.totalTagihan.toLocaleString('id-ID')}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-xs font-bold text-blue-900 font-mono">
                {activeBill.pemakaianM3} m³ Air
              </span>
            </div>

            {/* Kanal Pembayaran */}
            <div className="p-5 space-y-4">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Pilih Kanal Pembayaran Resmi
              </span>

              <div className="space-y-2">
                {[
                  {
                    id: 'qris',
                    name: 'QRIS (Gojek / OVO / ShopeePay / DANA)',
                    desc: 'Scan instan dari semua aplikasi e-wallet & mobile banking',
                    icon: QrCode,
                    badge: 'Instan & Bebas Antre',
                  },
                  {
                    id: 'va_bca',
                    name: 'BCA Virtual Account',
                    desc: 'Transfer via BCA Mobile / myBCA / ATM BCA',
                    icon: Wallet,
                    badge: 'Otomatis',
                  },
                  {
                    id: 'va_mandiri',
                    name: 'Mandiri Virtual Account (Livin)',
                    desc: 'Pembayaran via Livin by Mandiri / ATM Mandiri',
                    icon: Wallet,
                    badge: 'Otomatis',
                  },
                  {
                    id: 'va_bri',
                    name: 'BRI Virtual Account (BRIMO)',
                    desc: 'Pembayaran via aplikasi BRIMO / ATM BRI',
                    icon: Wallet,
                    badge: 'Otomatis',
                  },
                  {
                    id: 'minimarket',
                    name: 'Gerai Indomaret / Alfamart',
                    desc: 'Tunjukkan nomor ID Pelanggan di kasir terdekat',
                    icon: Store,
                    badge: 'Tunai / Debit',
                  },
                  {
                    id: 'pos',
                    name: 'Kantor Pos & Loket Resmi Aetra',
                    desc: 'Pembayaran di loket pos di seluruh Tangerang',
                    icon: Building2,
                    badge: 'Loket Resmi',
                  },
                ].map((ch) => {
                  const Icon = ch.icon;
                  const isSel = selectedChannel === ch.id;
                  return (
                    <label
                      key={ch.id}
                      onClick={() => setSelectedChannel(ch.id as any)}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition ${
                        isSel
                          ? 'bg-blue-50/90 border-[#005DAA] ring-2 ring-[#005DAA]/20'
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="channel"
                          checked={isSel}
                          onChange={() => setSelectedChannel(ch.id as any)}
                          className="text-[#005DAA] focus:ring-[#005DAA]"
                        />
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[#005DAA] shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">{ch.name}</span>
                          <span className="text-[11px] text-slate-500 leading-tight">{ch.desc}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                        {ch.badge}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={isProcessingPayment}
                className="px-6 py-2.5 rounded-xl bg-[#005DAA] hover:bg-[#004A88] text-white text-xs font-bold shadow-md shadow-blue-900/10 transition flex items-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isProcessingPayment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Memproses Transaksi...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Konfirmasi Pembayaran</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL STRUK RESMI PEMBAYARAN TAGIHAN (RECEIPT MODAL)       */}
      {/* ========================================================= */}
      {paymentSuccessData && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:border-none print:m-0 print:w-full">
            {/* Struk Card Header */}
            <div className="p-6 bg-linear-to-b from-blue-900 to-[#005DAA] text-white text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black tracking-tight">
                BUKTI PEMBAYARAN REKENING AIR
              </h3>
              <p className="text-xs text-blue-100">
                PT AETRA AIR TANGERANG
              </p>
              <span className="inline-block px-3 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-400/30">
                STATUS: LUNAS RESMI
              </span>
            </div>

            {/* Struk Paper Content */}
            <div className="p-6 space-y-4 text-xs font-mono text-slate-800 bg-white">
              <div className="border-b border-dashed border-slate-300 pb-3 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">No. Referensi:</span>
                  <span className="font-bold text-slate-900">{paymentSuccessData.noReferensi}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Waktu Bayar:</span>
                  <span>{paymentSuccessData.tanggalBayar}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Kanal Bayar:</span>
                  <span>{paymentSuccessData.metodeBayar}</span>
                </div>
              </div>

              <div className="border-b border-dashed border-slate-300 pb-3 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">ID Pelanggan:</span>
                  <span className="font-bold text-[#005DAA]">#{paymentSuccessData.idPelanggan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Nama Pelanggan:</span>
                  <span className="font-bold">{paymentSuccessData.nama}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Golongan Tarif:</span>
                  <span>{paymentSuccessData.golonganTarif.split(' ')[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Periode:</span>
                  <span>{paymentSuccessData.periodeBulan}</span>
                </div>
              </div>

              <div className="border-b border-dashed border-slate-300 pb-3 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Stand Meter:</span>
                  <span>{paymentSuccessData.standLalu} - {paymentSuccessData.standKini}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Volume Pemakaian:</span>
                  <span className="font-bold text-emerald-800">{paymentSuccessData.pemakaianM3} m³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Biaya Pemakaian Air:</span>
                  <span>Rp {(paymentSuccessData.blok1Total + paymentSuccessData.blok2Total + paymentSuccessData.blok3Total).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pemeliharaan &amp; Admin:</span>
                  <span>Rp {(paymentSuccessData.biayaPemeliharaan + paymentSuccessData.biayaAdmin).toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="pt-1 flex justify-between items-center text-sm font-black text-slate-900">
                <span>TOTAL DIBAYAR:</span>
                <span className="text-base text-[#005DAA]">
                  Rp {paymentSuccessData.totalTagihan.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="pt-2 text-[10px] text-center text-slate-400 leading-tight">
                Simpan struk ini sebagai bukti pembayaran rekening air yang sah. Pembayaran telah tercatat di sistem pusat PT Aetra Air Tangerang.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 print:hidden">
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Struk</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentSuccessData(null)}
                className="flex-1 py-2 px-3 rounded-xl bg-[#005DAA] hover:bg-[#004A88] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <span>Selesai</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
