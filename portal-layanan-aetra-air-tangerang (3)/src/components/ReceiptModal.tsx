import React from 'react';
import { RegistrationFormData } from '../types';
import { AetraLogo } from './AetraLogo';
import { CheckCircle2, Printer, X, ArrowRight, ShieldAlert } from 'lucide-react';
import { PaymentPartnersGrid } from './PaymentPartnersGrid';

interface ReceiptModalProps {
  data: RegistrationFormData;
  isOpen: boolean;
  onClose: () => void;
  onTrackNow: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ data, isOpen, onClose, onTrackNow }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
        {/* Modal Top Header with Aetra Royal Blue */}
        <div className="bg-[#005DAA] text-white px-6 py-4 flex items-center justify-between border-b border-blue-800">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F37021]"></span>
            <span className="font-bold tracking-wide text-sm">
              Tanda Terima Pendaftaran Sambungan Baru PT Aetra Air Tangerang
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Area */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-800 printable-slip">
          {/* Header Slip with Authentic Aetra Logo */}
          <div className="flex flex-wrap items-start justify-between border-b pb-4 border-slate-200 gap-4">
            <div>
              <AetraLogo size="md" variant="horizontal" />
              <p className="text-[11px] text-slate-700 font-bold mt-1">PT AETRA AIR TANGERANG</p>
              <p className="text-[11px] text-slate-500">Jl. Raya Curug No.27, Kadu Jaya, Curug, Tangerang Banten 15810</p>
              <p className="text-[10px] text-slate-400">Call Center: 021-5985477 &bull; WA: 087788224645 &bull; Email: contact.center@aat.co.id</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-lg bg-orange-50 text-[#F37021] text-xs font-bold border border-orange-200">
                BUKTI PENDAFTARAN RESMI
              </span>
              <p className="text-xs text-slate-500 mt-1">Tanggal: {data.tanggal}</p>
            </div>
          </div>

          {/* Success Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-emerald-900">Formulir Berhasil Didaftarkan ke Sistem!</h4>
              <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                Data pendaftaran telah tersimpan. Gunakan nomor di bawah ini untuk melakukan tracking status pemasangan serta pembayaran di kanal resmi Aetra.
              </p>
            </div>
          </div>

          {/* Key Identifiers (ID Pelanggan, No SR & No Form) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-linear-to-r from-blue-50/70 to-emerald-50/70 p-4 rounded-xl border border-blue-200">
            <div>
              <span className="text-[11px] text-emerald-800 uppercase font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                ID Pelanggan (Kode Bayar)
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-900 font-mono tracking-wider mt-0.5">
                {data.idPelanggan || '10842918'}
              </div>
              <span className="text-[10px] text-emerald-700 font-medium">Nomor Pembayaran Resmi</span>
            </div>
            <div>
              <span className="text-[11px] text-[#005DAA] uppercase font-bold">No. SR (Sambungan)</span>
              <div className="text-lg sm:text-xl font-black text-[#005DAA] font-mono tracking-wider mt-0.5">
                {data.noSr}
              </div>
              <span className="text-[10px] text-slate-500">Sambungan Rumah</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-600 uppercase font-bold">No. Form</span>
              <div className="text-lg sm:text-xl font-black text-slate-800 font-mono tracking-wider mt-0.5">
                {data.noForm}
              </div>
              <span className="text-[10px] text-slate-500">Registrasi Formulir</span>
            </div>
          </div>

          {/* Data Pelanggan Detail */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
            <div className="grid grid-cols-3 py-1 border-b border-slate-100">
              <span className="text-slate-500">Nama Pelanggan</span>
              <span className="col-span-2 font-bold text-slate-900">{data.namaKtp}</span>
            </div>
            <div className="grid grid-cols-3 py-1 border-b border-slate-100">
              <span className="text-slate-500">No. KTP / NIK</span>
              <span className="col-span-2 font-mono font-medium text-slate-800">{data.noKtp}</span>
            </div>
            <div className="grid grid-cols-3 py-1 border-b border-slate-100">
              <span className="text-slate-500">No. Telp / HP</span>
              <span className="col-span-2 font-medium text-slate-800">{data.telpHp}</span>
            </div>
            <div className="grid grid-cols-3 py-1 border-b border-slate-100">
              <span className="text-slate-500">Alamat Pasang</span>
              <span className="col-span-2 text-slate-800 font-medium">
                {data.alamatPasang} RT/RW {data.rtRwPasang}, Kel. {data.kelurahanPasang}
              </span>
            </div>
            <div className="grid grid-cols-3 py-1 border-b border-slate-100">
              <span className="text-slate-500">Fungsi &amp; Bangunan</span>
              <span className="col-span-2 text-slate-800">
                {data.fungsiBangunan} &bull; {data.kondisiBangunan?.jumlahLantai || 1} Lantai &bull; Luas: {data.luasBangunan || '-'} m² (Total: {(Number(data.totalLuasBangunan) || ((Number(data.luasBangunan) || 0) * (Number(data.kondisiBangunan?.jumlahLantai) || 1)))} m²) &bull; {data.kondisiBangunan?.jumlahPenghuni || '-'} Penghuni
              </span>
            </div>
            <div className="grid grid-cols-3 py-1 border-b border-slate-100">
              <span className="text-slate-500">Dokumen Dilampirkan</span>
              <span className="col-span-2 text-slate-800">
                {[
                  data.persyaratan.ktp ? 'KTP' : null,
                  data.persyaratan.kk ? 'KK' : null,
                  data.persyaratan.pbb ? 'PBB' : null,
                  data.persyaratan.suratDomisili ? 'Surat Domisili' : null,
                  data.persyaratan.suratKuasaSewa ? 'Surat Kuasa Sewa' : null,
                  data.persyaratan.lainnya ? 'Dokumen Lain' : null,
                ].filter(Boolean).join(', ') || 'Tidak ada berkas'}
                {data.persyaratanFiles && Object.keys(data.persyaratanFiles).length > 0 && (
                  <span className="ml-1.5 text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded border border-emerald-200">
                    {Object.keys(data.persyaratanFiles).length} file/foto terunggah
                  </span>
                )}
              </span>
            </div>
            {data.fotoPropertiFiles && data.fotoPropertiFiles.length > 0 && (
              <div className="grid grid-cols-3 py-1 border-b border-slate-100">
                <span className="text-slate-500">Foto Properti</span>
                <span className="col-span-2 text-emerald-700 font-medium">
                  ✓ {data.fotoPropertiFiles.length} foto lapangan terlampir
                </span>
              </div>
            )}
            <div className="grid grid-cols-3 py-1">
              <span className="text-slate-500">Biaya Sambungan</span>
              <span className="col-span-2 font-bold text-[#005DAA] text-sm">
                Rp {data.biayaSambungan.toLocaleString('id-ID')},- ({data.skemaPembayaran})
              </span>
            </div>
          </div>

          {/* Warning Notice as in the photo */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-red-900">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block uppercase text-[11px] text-red-950">
                Peringatan Resmi Pembayaran:
              </span>
              Dilarang keras melakukan pembayaran tunai apapun kepada petugas lapangan. Pembayaran hanya sah dilakukan melalui External Payment Point resmi PT Aetra Air Tangerang menggunakan <strong>ID Pelanggan ({data.idPelanggan || '10842918'})</strong> Anda.
            </div>
          </div>

          {/* 9 Official Payment Channels (Sesuai Foto Mitra Resmi) */}
          <div className="pt-2">
            <PaymentPartnersGrid
              paymentCode={data.idPelanggan || data.noForm || data.noSr}
              totalAmount={data.biayaSambungan || 1371545}
              compact={true}
              title="9 Mitra External Payment Point Resmi Aetra"
              subtitle={`Gunakan ID Pelanggan Anda (${data.idPelanggan || '10842918'}) untuk pelunasan melalui kasir, ATM, mobile banking, atau e-commerce berikut:`}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-xs transition"
          >
            <Printer className="w-4 h-4" />
            Cetak / Download PDF
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-200 text-xs font-medium transition"
            >
              Tutup
            </button>
            <button
              onClick={() => {
                onClose();
                onTrackNow();
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#005DAA] hover:bg-[#004A88] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition"
            >
              Lacak di Live Tracking Sekarang
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
