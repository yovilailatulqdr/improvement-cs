import React, { useState } from 'react';
import { FAQItem } from '../types';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  ThumbsUp, 
  HelpCircle, 
  PhoneCall, 
  MessageCircle, 
  Mail, 
  FileQuestion,
  CheckCircle,
  Clock,
  Filter,
  Layers,
  FileText,
  CreditCard,
  Droplets,
  Gauge,
  Building2,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface FaqSectionProps {
  faqItems: FAQItem[];
}

export const FaqSection: React.FC<FaqSectionProps> = ({ faqItems }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [sortByHelpful, setSortByHelpful] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>('faq-1');
  const [votedIds, setVotedIds] = useState<Record<string, boolean>>({});
  const [inquiryText, setInquiryText] = useState('');
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  const categories = [
    { name: 'Semua', icon: Layers, label: 'Semua Pertanyaan' },
    { name: 'Pendaftaran & Sambungan', icon: FileText, label: 'Pendaftaran & Sambungan' },
    { name: 'Tarif & Pembayaran', icon: CreditCard, label: 'Tarif & Pembayaran' },
    { name: 'Kualitas & Tekanan Air', icon: Droplets, label: 'Kualitas & Tekanan Air' },
    { name: 'Meter Air', icon: Gauge, label: 'Meter Air & Stand' },
    { name: 'Layanan Administrasi', icon: Building2, label: 'Layanan Administrasi' },
  ];

  let filteredFaqs = faqItems.filter((item) => {
    // Hilangkan pertanyaan tentang batas waktu pembayaran tagihan rekening air bulanan
    const isExcluded =
      item.pertanyaan.toLowerCase().includes('batas waktu pembayaran tagihan') ||
      item.pertanyaan.toLowerCase().includes('batas waktu pembayaran rekening');
    if (isExcluded) return false;

    const matchesCategory =
      selectedCategory === 'Semua' || item.kategori === selectedCategory;
    const matchesSearch =
      item.pertanyaan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.jawaban.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (sortByHelpful) {
    filteredFaqs = [...filteredFaqs].sort((a, b) => b.helpfulCount - a.helpfulCount);
  }

  const handleVote = (id: string) => {
    if (!votedIds[id]) {
      setVotedIds((prev) => ({ ...prev, [id]: true }));
    }
  };

  const handleResetFilter = () => {
    setSelectedCategory('Semua');
    setSearchQuery('');
    setSortByHelpful(false);
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryText.trim()) return;
    setInquirySubmitted(true);
    setInquiryText('');
    setTimeout(() => setInquirySubmitted(false), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Frequently Asked Questions (FAQ)
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Pusat bantuan &amp; informasi resmi pendaftaran sambungan baru, pembayaran tagihan, meter air, dan jaminan mutu air PT Aetra Air Tangerang.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 font-semibold text-xs border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Layanan Informasi 24 Jam
          </span>
        </div>
      </div>

      {/* Main Layout: Left Sidebar Filter + Right FAQ Accordion */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= LEFT SIDEBAR FILTER ================= */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-5">
          {/* Main Filter Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
            
            {/* Sidebar Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <Filter className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Sidebar Filter
                </h3>
              </div>

              {(selectedCategory !== 'Semua' || searchQuery || sortByHelpful) && (
                <button
                  onClick={handleResetFilter}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition"
                  title="Reset semua filter"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>

            {/* Search Input in Sidebar */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Pencarian Kata Kunci
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari biaya, pipa, syarat..."
                  className="w-full pl-8.5 pr-7 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-700 font-bold"
                  >
                    &times;
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Menu (Vertical List) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Kategori Pertanyaan
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {faqItems.length} Total
                </span>
              </div>

              <div className="space-y-1">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const count = cat.name === 'Semua' 
                    ? faqItems.length 
                    : faqItems.filter((i) => i.kategori === cat.name).length;
                  const isSelected = selectedCategory === cat.name;

                  return (
                    <button
                      key={cat.name}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition text-left group ${
                        isSelected
                          ? 'bg-[#005DAA] text-white font-bold shadow-xs shadow-blue-500/20'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 transition ${
                          isSelected ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'
                        }`} />
                        <span className="truncate text-xs">{cat.label}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ml-2 shrink-0 ${
                        isSelected 
                          ? 'bg-white/20 text-white' 
                          : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sorting & Quick Filter */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Urutkan Berdasarkan
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <button
                  onClick={() => setSortByHelpful(false)}
                  className={`py-1.5 px-2 rounded-lg text-center font-medium transition ${
                    !sortByHelpful
                      ? 'bg-slate-900 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Standar
                </button>
                <button
                  onClick={() => setSortByHelpful(true)}
                  className={`py-1.5 px-2 rounded-lg text-center font-medium transition flex items-center justify-center gap-1 ${
                    sortByHelpful
                      ? 'bg-amber-600 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  Terpopuler
                </button>
              </div>
            </div>
          </div>

          {/* Customer Care Contact in Sidebar */}
          <div className="bg-linear-to-br from-[#005DAA] to-[#003868] text-white p-5 rounded-2xl shadow-sm space-y-4 border-t-2 border-[#F37021]">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#F37021] uppercase bg-white/10 px-2 py-0.5 rounded">
                Customer Care Resmi
              </span>
              <h4 className="text-sm font-bold mt-1">Butuh Bantuan Langsung?</h4>
              <p className="text-[11px] text-blue-100 mt-1 leading-relaxed">
                Tim layanan pelanggan PT Aetra Air Tangerang siap membantu Anda 24 jam.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <a
                href="tel:0215985477"
                className="flex items-center gap-3 p-2.5 rounded-xl bg-white/10 hover:bg-white/15 transition border border-white/10"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                  <PhoneCall className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <span className="text-[10px] text-blue-200 block">Call Center</span>
                  <strong className="text-white font-mono text-xs">021-5985477</strong>
                </div>
              </a>

              <a
                href="https://wa.me/6287788224645?text=Halo%20Aetra%20Tangerang,%20saya%20ingin%20konsultasi%20layanan"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition font-medium"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-800 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <span className="text-[10px] text-emerald-100 block">WhatsApp Resmi</span>
                  <span className="text-xs font-bold">087788224645</span>
                </div>
              </a>

              <a
                href="mailto:contact.center@aat.co.id"
                className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition text-[11px] text-blue-100"
              >
                <Mail className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                <span className="truncate">contact.center@aat.co.id</span>
              </a>

              <div className="p-2.5 rounded-xl bg-white/5 text-[10px] text-blue-100 leading-relaxed">
                <span className="font-semibold text-white block">Kantor Pelayanan:</span>
                Jl. Raya Curug No.27, Kadu Jaya, Curug, Tangerang Banten 15810
              </div>
            </div>
          </div>
        </aside>

        {/* ================= RIGHT MAIN CONTENT: FAQ ACCORDION ================= */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-4">
          
          {/* Active Filter Status Bar */}
          <div className="bg-white px-5 py-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Filter Aktif:</span>
              <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 font-bold text-[11px]">
                {selectedCategory}
              </span>
              {searchQuery && (
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-medium text-[11px]">
                  Pencarian: &ldquo;{searchQuery}&rdquo;
                </span>
              )}
              {sortByHelpful && (
                <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-bold text-[11px]">
                  Terpopuler
                </span>
              )}
            </div>

            <div className="text-slate-500 text-xs">
              Menemukan <strong className="text-slate-900">{filteredFaqs.length}</strong> pertanyaan
            </div>
          </div>

          {/* Accordion Questions List */}
          <div className="space-y-3">
            {filteredFaqs.length === 0 ? (
              <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center text-slate-500 space-y-3">
                <FileQuestion className="w-12 h-12 mx-auto text-slate-300" />
                <h4 className="text-sm font-bold text-slate-800">
                  Tidak ada pertanyaan yang sesuai dengan filter
                </h4>
                <p className="text-xs max-w-sm mx-auto text-slate-500">
                  Coba hapus kata kunci pencarian atau pilih kategori &ldquo;Semua Pertanyaan&rdquo; pada sidebar filter.
                </p>
                <button
                  onClick={handleResetFilter}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  Reset Filter Sidebar
                </button>
              </div>
            ) : (
              filteredFaqs.map((faq) => {
                const isExpanded = expandedId === faq.id;
                const hasVoted = votedIds[faq.id];
                return (
                  <div
                    key={faq.id}
                    className={`bg-white rounded-2xl border transition-all duration-150 overflow-hidden ${
                      isExpanded
                        ? 'border-blue-300 shadow-sm ring-1 ring-blue-100'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                      className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          Q
                        </span>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-700 block mb-1">
                            {faq.kategori}
                          </span>
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                            {faq.pertanyaan}
                          </h3>
                        </div>
                      </div>
                      <div className="shrink-0 text-slate-400 p-1">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-blue-600" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-5 pb-5 pt-1 text-xs text-slate-700 leading-relaxed border-t border-slate-100 space-y-3 bg-slate-50/50">
                        <p className="pt-2">{faq.jawaban}</p>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 text-[11px] text-slate-500">
                          <span>Apakah jawaban ini membantu?</span>
                          <button
                            onClick={() => handleVote(faq.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border font-medium transition ${
                              hasVoted
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold'
                                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>
                              {hasVoted ? 'Terima kasih!' : `Membantu (${faq.helpfulCount + (hasVoted ? 1 : 0)})`}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Form Ajukan Pertanyaan Baru di Bawah Pertanyaan */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 mt-6">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              Belum Menemukan Jawaban yang Anda Cari?
            </h4>
            <p className="text-xs text-slate-500">
              Kirimkan pertanyaan seputar layanan air minum atau jaringan pipa Anda. Tim kami akan memberikan jawaban resmi.
            </p>

            {inquirySubmitted ? (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Pertanyaan Anda berhasil diajukan ke tim layanan pelanggan Aetra!</span>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-3">
                <textarea
                  rows={2}
                  value={inquiryText}
                  onChange={(e) => setInquiryText(e.target.value)}
                  placeholder="Tuliskan pertanyaan spesifik Anda di sini..."
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  Kirim Pertanyaan Baru
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
