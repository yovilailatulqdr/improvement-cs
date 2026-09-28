import React, { useState } from 'react';
import { AETRA_PAYMENT_CHANNELS, PaymentChannel } from '../data/paymentChannels';
import { Copy, Check, ChevronRight, Info, ShieldCheck, X } from 'lucide-react';

interface PaymentPartnersGridProps {
  paymentCode?: string;
  totalAmount?: number;
  className?: string;
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export const PaymentPartnersGrid: React.FC<PaymentPartnersGridProps> = ({
  paymentCode = '567890',
  totalAmount,
  className = '',
  title = 'Kanal Pembayaran Resmi PT Aetra Air Tangerang',
  subtitle = 'Pembayaran sah dapat dilakukan melalui 9 mitra resmi di bawah ini menggunakan No. Form / No. SR Anda:',
  compact = false,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<PaymentChannel | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(paymentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderLogo = (logoType: PaymentChannel['logoType']) => {
    switch (logoType) {
      case 'pos_indonesia':
        return (
          <div className="flex items-center gap-1.5 font-sans">
            <svg viewBox="0 0 36 28" className="w-7 h-5.5 shrink-0" fill="none">
              <path d="M2 14C6 8 16 6 26 8L34 5L30 11C33 14 34 18 30 21C26 25 18 25 12 23L4 25L8 18C4 17 2 15 2 14Z" fill="#F37021" />
              <circle cx="18" cy="14" r="5" fill="#C9510C" />
              <path d="M12 14L24 14M18 8L18 20" stroke="#FFF" strokeWidth="1.2" />
            </svg>
            <div className="leading-tight text-left">
              <span className="block font-black text-[10px] tracking-tight text-[#C9510C] uppercase">POS INDONESIA</span>
              <span className="text-[7px] text-slate-400 block font-semibold">KANTOR POS & POSPAY</span>
            </div>
          </div>
        );
      case 'alfamart':
        return (
          <div className="flex items-center gap-1">
            <div className="bg-[#E11B22] text-white px-1.5 py-0.5 rounded font-black text-[11px] tracking-tighter">
              Alfa<span className="text-[#005DAA] bg-white px-0.5 rounded-xs ml-0.5">mart</span>
            </div>
          </div>
        );
      case 'indomaret':
        return (
          <div className="flex items-center border border-slate-200 rounded px-1.5 py-0.5 bg-white shadow-2xs">
            <div className="flex gap-0.5 mr-1">
              <span className="w-1.5 h-3.5 bg-[#005DAA] rounded-xs" />
              <span className="w-1.5 h-3.5 bg-[#E11B22] rounded-xs" />
              <span className="w-1.5 h-3.5 bg-[#FFCC00] rounded-xs" />
            </div>
            <span className="font-black text-[11px] text-[#005DAA] tracking-tighter">
              Indomaret
            </span>
          </div>
        );
      case 'bca':
        return (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-[#005DAA] text-white flex items-center justify-center font-bold text-[9px] shadow-2xs">
              <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 fill-current">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm-1 4h2a3 3 0 010 6H9V6zm0 7h3a3 3 0 010 6H9v-6z" />
              </svg>
            </div>
            <span className="font-black text-sm tracking-tight text-[#005DAA]">BCA</span>
          </div>
        );
      case 'mandiri':
        return (
          <div className="flex items-center gap-1">
            <span className="font-black text-xs text-[#003366] tracking-tight">mandirı</span>
            <svg viewBox="0 0 24 10" className="w-4 h-2 fill-[#FFB700]">
              <path d="M0 5C4 2 8 8 12 5C16 2 20 8 24 5L24 10L0 10Z" />
            </svg>
          </div>
        );
      case 'ottopay':
        return (
          <div className="flex items-center gap-1 bg-[#0070BA] text-white px-2 py-0.5 rounded-lg border border-[#005A96]">
            <div className="w-3.5 h-3.5 rounded-full bg-[#FFD100] flex items-center justify-center text-[#0070BA] font-black text-[8px] leading-none">
              ☺
            </div>
            <span className="font-black text-[10px] tracking-tight uppercase">OTTO PAY</span>
          </div>
        );
      case 'fastpay':
        return (
          <div className="flex items-center gap-1 text-left leading-none">
            <div className="w-4.5 h-4.5 rounded-full bg-linear-to-tr from-[#005BAC] to-[#F37021] flex items-center justify-center text-white text-[8px] font-black">
              FP
            </div>
            <div>
              <span className="text-[6px] text-slate-500 font-bold block uppercase">TOKO MODERN</span>
              <span className="text-[10px] font-black text-[#005BAC] tracking-tight">FASTPAY</span>
            </div>
          </div>
        );
      case 'shopee':
        return (
          <div className="flex items-center gap-1 text-[#EE4D2D]">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M19 6h-2c0-2.8-2.2-5-5-5S7 3.2 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.7 0 3 1.3 3 3H9c0-1.7 1.3-3 3-3zm4 11.2c-.2.9-.8 1.4-1.6 1.7-.8.3-1.8.3-2.7.2-.6-.1-1.2-.3-1.7-.5v-2.1c.5.3 1 .5 1.5.6.5.1.9.1 1.3 0 .4-.1.6-.3.6-.6 0-.2-.1-.4-.3-.5-.2-.1-.5-.2-.9-.3-.6-.2-1.1-.4-1.5-.7-.4-.3-.6-.8-.6-1.4 0-.8.3-1.4.9-1.8.6-.4 1.4-.6 2.4-.6.5 0 1 .1 1.5.2.5.1.9.3 1.3.5v2c-.4-.2-.8-.4-1.2-.5-.4-.1-.8-.1-1.2-.1-.3 0-.6.1-.8.2-.2.1-.3.3-.3.5 0 .2.1.3.3.4.2.1.5.2.9.3.6.2 1.2.4 1.6.7.4.3.7.8.7 1.3z"/>
            </svg>
            <span className="font-bold text-xs tracking-tight">Shopee</span>
          </div>
        );
      case 'tokopedia':
        return (
          <div className="flex items-center gap-1 text-[#03AC0E]">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M12 2C6.5 2 2 6.5 2 12c0 2.2.7 4.2 2 5.9L2 22l4.3-1.8C8 21.3 9.9 22 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2zm-3 7c.8 0 1.5.7 1.5 1.5S9.8 12 9 12s-1.5-.7-1.5-1.5S8.2 9 9 9zm6 0c.8 0 1.5.7 1.5 1.5S15.8 12 15 12s-1.5-.7-1.5-1.5.7-1.5 1.5-1.5zm-3 8c-2.3 0-4.2-1.4-4.8-3.4h9.6c-.6 2-2.5 3.4-4.8 3.4z"/>
            </svg>
            <span className="font-bold text-xs tracking-tight">tokopedia</span>
          </div>
        );
      default:
        return <span className="font-bold text-xs">Payment</span>;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header text if provided */}
      {title && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#005DAA]" />
              {title}
            </h4>
            {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
          </div>

          {/* Quick Payment Code display */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg shrink-0">
            <span className="text-[10px] text-slate-500 font-semibold uppercase">Kode Bayar:</span>
            <span className="font-mono font-bold text-xs text-[#005DAA]">{paymentCode}</span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="p-1 rounded text-slate-500 hover:text-[#005DAA] hover:bg-slate-200 transition"
              title="Salin Kode Pembayaran"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}

      {/* Grid of 9 Official Payment Channels */}
      <div className={`grid ${compact ? 'grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1.5' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2.5'}`}>
        {AETRA_PAYMENT_CHANNELS.map((ch) => (
          <button
            key={ch.id}
            type="button"
            onClick={() => setSelectedChannel(ch)}
            className={`group text-left p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/40 shadow-2xs hover:shadow-xs transition flex flex-col justify-between ${
              selectedChannel?.id === ch.id ? 'ring-2 ring-[#005DAA] border-transparent bg-blue-50/50' : ''
            }`}
          >
            <div className="flex items-center justify-between gap-1 w-full mb-1">
              <div className="h-6 flex items-center">
                {renderLogo(ch.logoType)}
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#005DAA] transition shrink-0" />
            </div>

            {!compact && (
              <div className="mt-1">
                <p className="text-[10px] text-slate-500 line-clamp-1 group-hover:text-slate-700">
                  {ch.keterangan}
                </p>
                <span className="inline-block mt-1 text-[9px] font-semibold text-[#005DAA] group-hover:underline">
                  Lihat Cara Bayar &rarr;
                </span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Modal / Detail Drawer for selected channel */}
      {selectedChannel && (
        <div className="p-4 bg-linear-to-r from-blue-50/80 to-indigo-50/60 rounded-xl border border-blue-200 text-xs animate-in fade-in duration-200 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
                {renderLogo(selectedChannel.logoType)}
              </div>
              <div>
                <h5 className="font-bold text-slate-900 text-xs">
                  Panduan Pembayaran via {selectedChannel.name}
                </h5>
                <p className="text-[11px] text-slate-500">{selectedChannel.keterangan}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedChannel(null)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200/50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Payment Identifiers Box */}
          <div className="bg-white p-3 rounded-lg border border-blue-100 flex flex-wrap items-center justify-between gap-2">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400">Kode Pembayaran / No. Form / No. SR:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-sm text-[#005DAA] tracking-wider">{paymentCode}</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-[#005DAA] rounded text-[10px] font-bold hover:bg-blue-100 transition"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Tersalin!' : 'Salin'}</span>
                </button>
              </div>
            </div>

            {totalAmount && (
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Nominal:</span>
                <div className="font-black text-sm text-slate-900">
                  Rp {totalAmount.toLocaleString('id-ID')},-
                </div>
              </div>
            )}
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-1.5 bg-white/70 p-3 rounded-lg border border-blue-100/70">
            <span className="font-bold text-slate-800 text-[11px] block">Langkah-langkah Pembayaran:</span>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px] leading-relaxed">
              {selectedChannel.instructions.map((ins, idx) => (
                <li key={idx} className="pl-1">
                  {ins}
                </li>
              ))}
            </ol>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <div className="flex items-center gap-1 text-amber-700">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>Struk / Resi dari mitra di atas sah dan otomatis tersinkronisasi ke sistem Aetra.</span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedChannel(null)}
              className="text-[#005DAA] font-bold hover:underline"
            >
              Tutup Panduan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
