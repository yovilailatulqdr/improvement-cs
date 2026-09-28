import React from 'react';
import { Droplets, Home, Building2, Store, Sparkles, ShieldCheck } from 'lucide-react';

export type TariffCode = 'R1' | 'R2' | 'R3' | 'R4' | '1' | '3' | string;

interface TariffCategoryLogoProps {
  code: TariffCode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  className?: string;
}

export const TariffCategoryLogo: React.FC<TariffCategoryLogoProps> = ({
  code,
  size = 'md',
  showLabel = false,
  className = '',
}) => {
  // Normalize code (e.g. "R2 = Rumah Tangga 2" -> "R2")
  const raw = (code || '').toUpperCase();
  const normalized = raw.startsWith('R1')
    ? 'R1'
    : raw.startsWith('R2')
    ? 'R2'
    : raw.startsWith('R3')
    ? 'R3'
    : raw.startsWith('R4')
    ? 'R4'
    : raw.includes('SOSIAL') || raw.startsWith('1')
    ? 'SOSIAL'
    : raw.includes('NIAGA') || raw.includes('USAHA') || raw.startsWith('3')
    ? 'USAHA'
    : 'R2';

  const configMap: Record<
    string,
    {
      code: string;
      label: string;
      sub: string;
      primaryColor: string;
      glowColor: string;
      gradient: string;
      borderColor: string;
      textColor: string;
      badgeColor: string;
      icon: React.ComponentType<{ className?: string }>;
      description: string;
    }
  > = {
    R1: {
      code: 'R1',
      label: 'Rumah Tangga 1',
      sub: 'Luas < 28,8 m²',
      primaryColor: '#059669',
      glowColor: 'rgba(5, 150, 105, 0.25)',
      gradient: 'from-emerald-600 via-teal-600 to-emerald-800',
      borderColor: 'border-emerald-300/80',
      textColor: 'text-emerald-950',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      icon: Home,
      description: 'Hunian Sederhana / Subsidi',
    },
    R2: {
      code: 'R2',
      label: 'Rumah Tangga 2',
      sub: 'Luas 28,9 – 70 m²',
      primaryColor: '#F37021',
      glowColor: 'rgba(243, 112, 33, 0.25)',
      gradient: 'from-[#F37021] via-orange-600 to-amber-700',
      borderColor: 'border-orange-300/80',
      textColor: 'text-orange-950',
      badgeColor: 'bg-orange-50 text-orange-900 border-orange-300',
      icon: Home,
      description: 'Rumah Tinggal Standar',
    },
    R3: {
      code: 'R3',
      label: 'Rumah Tangga 3',
      sub: 'Luas 70 – 120 m² / Cluster',
      primaryColor: '#005DAA',
      glowColor: 'rgba(0, 93, 170, 0.25)',
      gradient: 'from-[#005DAA] via-blue-700 to-indigo-900',
      borderColor: 'border-blue-300/80',
      textColor: 'text-blue-950',
      badgeColor: 'bg-blue-50 text-blue-900 border-blue-300',
      icon: Building2,
      description: 'Kawasan Real Estate & Menengah',
    },
    R4: {
      code: 'R4',
      label: 'Rumah Tangga 4',
      sub: 'Luas > 120 m² / Komersil',
      primaryColor: '#7C3AED',
      glowColor: 'rgba(124, 58, 237, 0.25)',
      gradient: 'from-purple-600 via-indigo-700 to-violet-950',
      borderColor: 'border-purple-300/80',
      textColor: 'text-purple-950',
      badgeColor: 'bg-purple-50 text-purple-900 border-purple-300',
      icon: Sparkles,
      description: 'Hunian Mewah / Komersil Domestik',
    },
    SOSIAL: {
      code: 'S1',
      label: 'Sosial & Instansi',
      sub: 'Fasilitas Umum & Ibadah',
      primaryColor: '#0284C7',
      glowColor: 'rgba(2, 132, 199, 0.25)',
      gradient: 'from-sky-600 via-cyan-600 to-blue-900',
      borderColor: 'border-sky-300/80',
      textColor: 'text-sky-950',
      badgeColor: 'bg-sky-50 text-sky-900 border-sky-300',
      icon: Droplets,
      description: 'Fasilitas Ibadah & Kantor Pemerintah',
    },
    USAHA: {
      code: 'N1',
      label: 'Niaga & Usaha',
      sub: 'Ruko, Toko & Perdagangan',
      primaryColor: '#E11D48',
      glowColor: 'rgba(225, 29, 72, 0.25)',
      gradient: 'from-rose-600 via-red-600 to-amber-900',
      borderColor: 'border-rose-300/80',
      textColor: 'text-rose-950',
      badgeColor: 'bg-rose-50 text-rose-900 border-rose-300',
      icon: Store,
      description: 'Perniagaan, Usaha & Jasa',
    },
  };

  const current = configMap[normalized] || configMap.R2;
  const IconComponent = current.icon;

  const sizeClasses = {
    xs: {
      box: 'w-6 h-6 rounded-md',
      code: 'text-[9px] font-black',
      icon: 'w-2 h-2',
      badgePad: 'px-1.5 py-0.5',
    },
    sm: {
      box: 'w-8 h-8 rounded-lg',
      code: 'text-xs font-black',
      icon: 'w-2.5 h-2.5',
      badgePad: 'px-2 py-0.5',
    },
    md: {
      box: 'w-11 h-11 rounded-xl',
      code: 'text-sm font-black',
      icon: 'w-3.5 h-3.5',
      badgePad: 'px-2.5 py-1',
    },
    lg: {
      box: 'w-14 h-14 rounded-2xl',
      code: 'text-lg font-black',
      icon: 'w-4 h-4',
      badgePad: 'px-3 py-1.5',
    },
    xl: {
      box: 'w-16 h-16 rounded-2xl',
      code: 'text-xl font-black',
      icon: 'w-5 h-5',
      badgePad: 'px-3.5 py-2',
    },
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Modern High-End Emblem Logo with Layered Depth & Watermark */}
      <div
        className={`relative ${sizeClasses.box} bg-gradient-to-br ${current.gradient} text-white flex flex-col items-center justify-center shadow-md border ${current.borderColor} overflow-hidden shrink-0 select-none transition-transform hover:scale-105`}
        style={{
          boxShadow: `0 4px 14px ${current.glowColor}, inset 0 1px 1px rgba(255, 255, 255, 0.45)`,
        }}
      >
        {/* Specular Gloss Reflection Layer */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-black/20 pointer-events-none" />

        {/* Ambient Water Drop Wave Pattern SVG in background */}
        <svg
          className="absolute -bottom-1 -right-1 w-7 h-7 text-white/15 pointer-events-none"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
        </svg>

        {/* Top-Right Micro Glyph */}
        <div className="absolute top-1 right-1 opacity-70">
          <IconComponent className={sizeClasses.icon} />
        </div>

        {/* High-Legibility Code Typography */}
        <span className={`${sizeClasses.code} tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] leading-none font-sans z-10`}>
          {current.code}
        </span>

        {/* Bottom subtle official marker bar */}
        <div className="absolute bottom-0.5 inset-x-0 flex justify-center z-10">
          <div className="h-0.5 w-3.5 bg-white/70 rounded-full shadow-2xs" />
        </div>
      </div>

      {showLabel && (
        <div className="leading-tight">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-900">{current.label}</span>
            <span
              className={`text-[10px] font-black px-1.5 py-0.2 rounded-md border ${current.badgeColor} shadow-2xs uppercase tracking-wider`}
            >
              {current.code}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-0.5 font-medium">{current.sub}</span>
        </div>
      )}
    </div>
  );
};
