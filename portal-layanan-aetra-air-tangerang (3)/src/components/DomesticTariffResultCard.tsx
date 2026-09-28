import React from 'react';
import { calculateDomesticTariff } from '../data/domesticTariffs';
import { Lock, Sparkles, CheckCircle2, ShieldCheck, Home } from 'lucide-react';
import { TariffCategoryLogo } from './TariffCategoryLogo';

interface DomesticTariffResultCardProps {
  totalLuas: number;
  isRealEstate: boolean;
  hasUsaha: boolean;
  luasBangunan: string | number;
  jumlahLantai: string | number;
}

export const DomesticTariffResultCard: React.FC<DomesticTariffResultCardProps> = ({
  totalLuas,
  isRealEstate,
  hasUsaha,
  luasBangunan,
  jumlahLantai,
}) => {
  const isFilled = totalLuas > 0 && parseFloat(String(luasBangunan || '0')) > 0;
  const result = isFilled ? calculateDomesticTariff(totalLuas, isRealEstate, hasUsaha) : null;

  // Colors & badges mapped to the official 4 categories
  const themeMap: Record<string, {
    bg: string;
    border: string;
    badgeBg: string;
    badgeText: string;
    pillBg: string;
    titleColor: string;
    clauseBg: string;
    clauseBorder: string;
  }> = {
    R1: {
      bg: 'bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-white',
      border: 'border-emerald-300',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      badgeText: 'text-emerald-900',
      pillBg: 'bg-emerald-600 text-white',
      titleColor: 'text-emerald-950',
      clauseBg: 'bg-emerald-50/90',
      clauseBorder: 'border-emerald-200',
    },
    R2: {
      bg: 'bg-gradient-to-r from-amber-50/90 via-orange-50/40 to-white',
      border: 'border-amber-300',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      badgeText: 'text-amber-950',
      pillBg: 'bg-amber-500 text-white',
      titleColor: 'text-amber-950',
      clauseBg: 'bg-amber-50/90',
      clauseBorder: 'border-amber-200',
    },
    R3: {
      bg: 'bg-gradient-to-r from-blue-50/90 via-indigo-50/40 to-white',
      border: 'border-blue-300',
      badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
      badgeText: 'text-blue-950',
      pillBg: 'bg-[#005DAA] text-white',
      titleColor: 'text-blue-950',
      clauseBg: 'bg-blue-50/90',
      clauseBorder: 'border-blue-200',
    },
    R4: {
      bg: 'bg-gradient-to-r from-purple-50/90 via-fuchsia-50/40 to-white',
      border: 'border-purple-300',
      badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
      badgeText: 'text-purple-950',
      pillBg: 'bg-purple-600 text-white',
      titleColor: 'text-purple-950',
      clauseBg: 'bg-purple-50/90',
      clauseBorder: 'border-purple-200',
    },
  };

  const theme = result ? (themeMap[result.code] || themeMap.R2) : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#005DAA]" />
          <span>Kategori Tarif Pelanggan Domestik (Otomatis Ditentukan Sistem)</span>
        </label>
        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
          <Lock className="w-2.5 h-2.5 text-slate-500" />
          Terkunci Otomatis (Sesuai SK Direksi Aetra)
        </span>
      </div>

      {!isFilled || !result ? (
        <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/80 text-xs text-slate-500 space-y-1.5">
          <div className="flex items-center gap-2 font-semibold text-slate-700">
            <Home className="w-4 h-4 text-slate-400" />
            <span>Menunggu kelengkapan data fisik &amp; properti...</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Silakan isi <strong>Luas Bangunan Rumah</strong>, <strong>Jumlah Lantai</strong>, <strong>Kawasan Properti</strong>, dan <strong>Kegiatan Usaha</strong> di atas. Sistem secara otomatis akan menetapkan kategori golongan tarif Anda (<strong>R1</strong>, <strong>R2</strong>, <strong>R3</strong>, atau <strong>R4</strong>) sesuai SK Direksi PT Aetra Air Tangerang tanpa perlu dipilih manual.
          </p>
        </div>
      ) : (
        <div className={`p-4 sm:p-5 rounded-2xl border-2 shadow-sm transition-all duration-300 space-y-4 ${theme?.bg} ${theme?.border}`}>
          {/* Header Row: Modern Category Logo Emblem & Status */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <TariffCategoryLogo code={result.code} size="lg" />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-3 py-1 rounded-xl text-sm font-black tracking-wide shadow-2xs flex items-center gap-1.5 ${theme?.pillBg}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{result.name}</span>
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600">
                    Golongan Tarif Domestik Resmi
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Ditetapkan otomatis berdasarkan parameter fisik bangunan &amp; peruntukan
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700 bg-white/95 px-3 py-1.5 rounded-xl border border-slate-200/90 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Validasi Algoritma Resmi Aetra</span>
            </div>
          </div>

          {/* Clause Box: Persis seperti bunyi ketentuan pada SK resmi foto */}
          <div className={`p-3 rounded-lg border text-xs space-y-1 ${theme?.clauseBg} ${theme?.clauseBorder}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-500">
              Ketentuan &amp; Klausul Resmi yang Diberlakukan:
            </span>
            <p className={`text-xs font-semibold leading-relaxed ${theme?.titleColor}`}>
              &bull; {result.appliedClause}
            </p>
          </div>

          {/* Parameter Chips: Indikator dasar perhitungan */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
            <div className="bg-white/80 p-2 rounded-lg border border-slate-200 flex items-center justify-between">
              <span className="text-slate-500">Total Luas Bangunan:</span>
              <strong className="font-mono text-slate-900 font-bold">
                {totalLuas} m² ({luasBangunan} m² × {jumlahLantai} Lt)
              </strong>
            </div>

            <div className="bg-white/80 p-2 rounded-lg border border-slate-200 flex items-center justify-between">
              <span className="text-slate-500">Kawasan Properti:</span>
              <strong className="text-slate-900 font-bold">
                {isRealEstate ? 'Real Estate / Cluster' : 'Non Real Estate'}
              </strong>
            </div>

            <div className="bg-white/80 p-2 rounded-lg border border-slate-200 flex items-center justify-between">
              <span className="text-slate-500">Peruntukan Usaha:</span>
              <strong className="text-slate-900 font-bold">
                {hasUsaha ? 'Memiliki Usaha' : 'Tanpa Usaha Komersil'}
              </strong>
            </div>
          </div>

          {/* Locked Notice */}
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 pt-0.5">
            <Lock className="w-3 h-3 text-slate-400 shrink-0" />
            <span>Kategori tarif ini terkunci otomatis oleh sistem agar sesuai dengan ketentuan resmi dan tidak dapat dirubah manual.</span>
          </div>
        </div>
      )}
    </div>
  );
};
