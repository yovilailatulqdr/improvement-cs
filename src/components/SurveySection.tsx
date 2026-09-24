import React, { useState } from 'react';
import { SurveySubmission } from '../types';
import { AETRA_SERVICE_AREAS } from '../data/serviceAreas';
import { 
  Star, 
  Smile, 
  Send, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Award, 
  MessageSquare,
  AlertCircle,
  MapPin,
  Droplets,
  Layers,
  Wrench,
  Headphones,
  Gauge,
  Receipt
} from 'lucide-react';

interface SurveySectionProps {
  submissions: SurveySubmission[];
  onSubmitSurvey: (survey: SurveySubmission) => void;
}

interface QuestionDef {
  id: number;
  key: keyof SurveySubmission;
  text: string;
}

interface CategoryDef {
  name: string;
  icon: React.ReactNode;
  badgeColor: string;
  questions: QuestionDef[];
}

const SURVEY_CATEGORIES: CategoryDef[] = [
  {
    name: 'Kualitas',
    icon: <Droplets className="w-4 h-4 text-blue-600" />,
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
    questions: [
      { id: 1, key: 'q1_kualitas_syarat', text: 'Kualitas air minum yang didistribusikan memenuhi syarat yang dibutuhkan' },
      { id: 2, key: 'q2_kualitas_warna', text: 'Warna/kejernihan air sesuai dengan syarat yang dibutuhkan' },
      { id: 3, key: 'q3_kualitas_bau', text: 'Tidak ada bau selain klorin/kaporit dalam air' },
    ],
  },
  {
    name: 'Kuantitas',
    icon: <Layers className="w-4 h-4 text-cyan-600" />,
    badgeColor: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    questions: [
      { id: 4, key: 'q4_kuantitas_24jam', text: 'Air mengalir 24 jam atau air lancar sepanjang hari' },
      { id: 5, key: 'q5_kuantitas_volume', text: 'Jumlah/volume air yang diterima sesuai dengan kebutuhan' },
    ],
  },
  {
    name: 'Kontinuitas',
    icon: <TrendingUp className="w-4 h-4 text-teal-600" />,
    badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
    questions: [
      { id: 6, key: 'q6_kontinuitas_tekanan', text: 'Tekanan air yang diterima sesuai dengan yang diharapkan' },
      { id: 7, key: 'q7_kontinuitas_penurunan', text: 'Penurunan tekanan air akibat gangguan masih dapat ditoleransi' },
    ],
  },
  {
    name: 'Pelayanan Teknis',
    icon: <Wrench className="w-4 h-4 text-indigo-600" />,
    badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    questions: [
      { id: 8, key: 'q8_teknis_kecepatan', text: 'Kecepatan Aetra Tangerang dalam merespon jika terjadi gangguan' },
      { id: 9, key: 'q9_teknis_sikap', text: 'Sikap dan perilaku petugas dalam berkoordinasi di lapangan' },
    ],
  },
  {
    name: 'Pelayanan Keluhan Pelanggan',
    icon: <Headphones className="w-4 h-4 text-violet-600" />,
    badgeColor: 'bg-violet-50 text-violet-800 border-violet-200',
    questions: [
      { id: 10, key: 'q10_keluhan_ramah', text: 'Petugas menjelaskan layanan dengan ramah, baik, benar' },
      { id: 11, key: 'q11_keluhan_cepat', text: 'Petugas merespon keluhan pelanggan dengan cepat, baik, benar' },
      { id: 12, key: 'q12_keluhan_komunikasi', text: 'Petugas berkomunikasi dengan pelanggan secara baik dan benar' },
    ],
  },
  {
    name: 'Meter Reading',
    icon: <Gauge className="w-4 h-4 text-amber-600" />,
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    questions: [
      { id: 13, key: 'q13_meter_ramah', text: 'Petugas Pembaca Meter ramah dan sopan' },
      { id: 14, key: 'q14_meter_tanggap', text: 'Petugas Pembaca Meter tanggap terhadap informasi yang diminta pelanggan' },
      { id: 15, key: 'q15_meter_akurat', text: 'Hasil pembacaan meter akurat' },
    ],
  },
  {
    name: 'Tagihan',
    icon: <Receipt className="w-4 h-4 text-emerald-600" />,
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    questions: [
      { id: 16, key: 'q16_tagihan_alamat', text: 'Alamat pelanggan di rekening tagihan tepat' },
      { id: 17, key: 'q17_tagihan_m3', text: 'Tagihan dengan pemakaian air (m3) sesuai' },
      { id: 18, key: 'q18_tagihan_pilihan', text: 'Tersedia pilihan cara pembayaran' },
    ],
  },
];

export const SurveySection: React.FC<SurveySectionProps> = ({ submissions, onSubmitSurvey }) => {
  const [formState, setFormState] = useState({
    nama: '',
    noPelangganOrSr: '',
    kecamatan: '',
    desa: '',
    komentar: '',
    ratings: {} as Record<number, number>,
  });

  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [filterWilayah, setFilterWilayah] = useState<string>('Semua');

  // Handle star rating click
  const handleRatingChange = (questionId: number, value: number) => {
    setFormState((prev) => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [questionId]: value,
      },
    }));
  };

  // Selected kecamatan for Desa dropdown
  const currentArea = AETRA_SERVICE_AREAS.find((a) => a.kecamatan === formState.kecamatan);

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!formState.nama.trim()) {
      setValidationError('Mohon isi Nama Responden terlebih dahulu.');
      return;
    }

    if (!formState.kecamatan) {
      setValidationError('Mohon pilih Kecamatan domisili Anda.');
      return;
    }

    if (!formState.desa) {
      setValidationError('Mohon pilih Desa domisili Anda.');
      return;
    }

    // Check all 18 questions
    const missingQuestions: number[] = [];
    for (let i = 1; i <= 18; i++) {
      if (!formState.ratings[i] || formState.ratings[i] < 1) {
        missingQuestions.push(i);
      }
    }

    if (missingQuestions.length > 0) {
      setValidationError(
        `Mohon berikan penilaian bintang (1 - 5) untuk seluruh 18 pertanyaan. Pertanyaan belum diisi: No. ${missingQuestions.slice(0, 5).join(', ')}${missingQuestions.length > 5 ? '...' : ''}`
      );
      return;
    }

    // Calculate averages
    const allVals = Object.values(formState.ratings);
    const overallAvg = allVals.length > 0 ? Number((allVals.reduce((a, b) => a + b, 0) / allVals.length).toFixed(1)) : 5;

    const r = formState.ratings;
    const newSurvey: SurveySubmission = {
      id: 'srv-' + Date.now(),
      nama: formState.nama.trim(),
      noPelangganOrSr: formState.noPelangganOrSr.trim(),
      kelurahan: formState.desa,
      kecamatan: formState.kecamatan,
      desa: formState.desa,
      // 18 questions
      q1_kualitas_syarat: r[1],
      q2_kualitas_warna: r[2],
      q3_kualitas_bau: r[3],
      q4_kuantitas_24jam: r[4],
      q5_kuantitas_volume: r[5],
      q6_kontinuitas_tekanan: r[6],
      q7_kontinuitas_penurunan: r[7],
      q8_teknis_kecepatan: r[8],
      q9_teknis_sikap: r[9],
      q10_keluhan_ramah: r[10],
      q11_keluhan_cepat: r[11],
      q12_keluhan_komunikasi: r[12],
      q13_meter_ramah: r[13],
      q14_meter_tanggap: r[14],
      q15_meter_akurat: r[15],
      q16_tagihan_alamat: r[16],
      q17_tagihan_m3: r[17],
      q18_tagihan_pilihan: r[18],
      // Summary indicators
      kualitasAir: Math.round(((r[1] + r[2] + r[3]) / 3)),
      kontinuitasAliran: Math.round(((r[6] + r[7]) / 2)),
      kecepatanPelayanan: Math.round(((r[8] + r[11]) / 2)),
      kemudahanTagihan: Math.round(((r[16] + r[17] + r[18]) / 3)),
      profesionalismePetugas: Math.round(((r[9] + r[10] + r[12] + r[13] + r[14]) / 5)),
      csatOverall: overallAvg,
      npsScore: overallAvg >= 4 ? 9 : 7,
      komentar: formState.komentar.trim() || 'Pelayanan memuaskan dan air lancar.',
      kategoriMasukan: overallAvg >= 4 ? 'Puas' : overallAvg >= 3 ? 'Perlu Perbaikan Air' : 'Keluhan Tekanan',
      createdAt: new Date().toISOString(),
    };

    onSubmitSurvey(newSurvey);
    setSubmittedSuccess(true);
    setValidationError(null);

    // Reset form
    setFormState({
      nama: '',
      noPelangganOrSr: '',
      kecamatan: '',
      desa: '',
      komentar: '',
      ratings: {},
    });

    setTimeout(() => setSubmittedSuccess(false), 5000);
  };

  // Analytics calculation
  const totalSubmissions = submissions.length;
  const avgCsat = totalSubmissions > 0
    ? (submissions.reduce((acc, curr) => acc + (curr.csatOverall || 4.5), 0) / totalSubmissions).toFixed(1)
    : '4.8';
  const avgKualitas = totalSubmissions > 0
    ? (submissions.reduce((acc, curr) => acc + (curr.kualitasAir || 5), 0) / totalSubmissions).toFixed(1)
    : '4.8';
  const avgKontinuitas = totalSubmissions > 0
    ? (submissions.reduce((acc, curr) => acc + (curr.kontinuitasAliran || 4.7), 0) / totalSubmissions).toFixed(1)
    : '4.7';

  // Filtered submissions for display
  const filteredSubmissions = submissions.filter((sub) => {
    if (filterWilayah === 'Semua') return true;
    return sub.kelurahan.toLowerCase().includes(filterWilayah.toLowerCase()) ||
      (sub.kecamatan && sub.kecamatan.toLowerCase().includes(filterWilayah.toLowerCase())) ||
      (sub.desa && sub.desa.toLowerCase().includes(filterWilayah.toLowerCase()));
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Survey Kepuasan Pelanggan PT Aetra Air Tangerang
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Kuesioner evaluasi mutu pelayanan air minum, kuantitas debit, kontinuitas aliran, petugas lapangan, meter reading, serta kemudahan tagihan (Skala 1 - 5 Bintang).
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 shadow-2xs">
            <Award className="w-4 h-4 text-emerald-600" />
            Indeks Kepuasan: Sangat Baik ({avgCsat}/5.0)
          </span>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Total Responden</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalSubmissions}</div>
          <span className="text-[11px] text-emerald-600 font-medium">Partisipasi aktif warga</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Kualitas Air</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{avgKualitas} <span className="text-xs text-slate-400 font-normal">/ 5</span></div>
          <span className="text-[11px] text-slate-500 font-medium">Jernih &amp; higienis</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Kontinuitas Aliran</span>
            <TrendingUp className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{avgKontinuitas} <span className="text-xs text-slate-400 font-normal">/ 5</span></div>
          <span className="text-[11px] text-slate-500 font-medium">Tekanan stabil 24 jam</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Tingkat Kepuasan</span>
            <Smile className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">96.8%</div>
          <span className="text-[11px] text-emerald-600 font-medium">Pelanggan puas</span>
        </div>
      </div>

      {submittedSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex items-center gap-3 text-xs text-emerald-900 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <strong>Terima kasih atas penilaian Anda!</strong> Seluruh 18 jawaban survey kepuasan Anda telah berhasil disimpan dan sangat berharga untuk peningkatan mutu layanan PT Aetra Air Tangerang.
          </div>
        </div>
      )}

      {validationError && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-4 flex items-center gap-3 text-xs text-red-900 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <div>
            <strong>Mohon Perhatian:</strong> {validationError}
          </div>
        </div>
      )}

      {/* Main Grid: 18-Question Form on Left, Live Customer Feed on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* FORM SURVEY: 18 QUESTIONS */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-8 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-6"
        >
          <div className="border-b border-slate-200 pb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Pertanyaan Survey Kepuasan Pelanggan (18 Butir)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Berikan penilaian bintang 1 sampai 5 (1 = Sangat Tidak Puas / Sangat Tidak Sesuai, 5 = Sangat Puas / Sangat Sesuai)
              </p>
            </div>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
              Skala 1 - 5 Bintang
            </span>
          </div>

          {/* Data Responden Singkat */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Identitas Responden
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Anda <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formState.nama}
                  onChange={(e) => setFormState({ ...formState, nama: e.target.value })}
                  placeholder="Nama lengkap pemohon / pelanggan"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  No. ID Pelanggan / No. SR (Opsional)
                </label>
                <input
                  type="text"
                  value={formState.noPelangganOrSr}
                  onChange={(e) => setFormState({ ...formState, noPelangganOrSr: e.target.value })}
                  placeholder="Contoh: 10842918 atau SR-168392"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Kecamatan <span className="text-red-500">*</span>
                </label>
                <select
                  value={formState.kecamatan}
                  onChange={(e) => setFormState({ ...formState, kecamatan: e.target.value, desa: '' })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold text-xs uppercase focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="">-- PILIH KECAMATAN --</option>
                  {AETRA_SERVICE_AREAS.map((a) => (
                    <option key={a.kecamatan} value={a.kecamatan}>
                      KECAMATAN {a.kecamatan}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Desa <span className="text-red-500">*</span>
                </label>
                <select
                  value={formState.desa}
                  onChange={(e) => setFormState({ ...formState, desa: e.target.value })}
                  disabled={!formState.kecamatan}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold text-xs uppercase focus:ring-2 focus:ring-blue-500 focus:outline-hidden disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">-- PILIH DESA --</option>
                  {currentArea ? (
                    currentArea.desaList.map((desa) => (
                      <option key={desa} value={desa}>
                        DESA {desa.toUpperCase()}
                      </option>
                    ))
                  ) : (
                    <option disabled>Pilih Kecamatan terlebih dahulu</option>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* 18 QUESTIONS IN 7 CATEGORIES */}
          <div className="space-y-6">
            {SURVEY_CATEGORIES.map((cat, catIdx) => (
              <div key={cat.name} className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                {/* Category Header */}
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                      {cat.icon}
                    </span>
                    <span className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wide">
                      {catIdx + 1}. {cat.name}
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${cat.badgeColor}`}>
                    {cat.questions.length} Pertanyaan
                  </span>
                </div>

                {/* Questions List */}
                <div className="divide-y divide-slate-100 bg-white">
                  {cat.questions.map((q) => {
                    const currentRating = formState.ratings[q.id] || 0;
                    return (
                      <div key={q.id} className="p-4 sm:p-4.5 hover:bg-slate-50/50 transition">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="flex items-start gap-2.5 max-w-xl">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {q.id}
                            </span>
                            <span className="text-xs sm:text-xs font-semibold text-slate-800 leading-snug">
                              {q.text} <span className="text-red-500">*</span>
                            </span>
                          </div>

                          {/* Star Buttons 1 - 5 */}
                          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 pl-7 md:pl-0">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                type="button"
                                key={star}
                                onClick={() => handleRatingChange(q.id, star)}
                                className="p-1 hover:scale-110 transition focus:outline-hidden"
                                title={`Nilai ${star} dari 5`}
                              >
                                <Star
                                  className={`w-6 h-6 transition ${
                                    currentRating > 0 && star <= currentRating
                                      ? 'text-amber-400 fill-amber-400'
                                      : 'text-slate-300 hover:text-amber-300'
                                  }`}
                                />
                              </button>
                            ))}
                            <span className="text-xs font-bold font-mono ml-2 min-w-[50px] text-right">
                              {currentRating > 0 ? (
                                <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                  {currentRating} / 5
                                </span>
                              ) : (
                                <span className="text-slate-400 font-normal italic text-[10px]">
                                  Pilih
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Feedback & Komentar */}
          <div className="space-y-1.5 text-xs">
            <label className="block font-semibold text-slate-700">
              Komentar &amp; Saran Tambahan
            </label>
            <textarea
              rows={3}
              value={formState.komentar}
              onChange={(e) => setFormState({ ...formState, komentar: e.target.value })}
              placeholder="Tuliskan pengalaman atau saran Anda untuk perbaikan mutu air atau petugas di lingkungan Anda..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-[#005DAA] hover:bg-[#004A88] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
            Kirim Penilaian Survey Kepuasan Pelanggan (18 Pertanyaan)
          </button>
        </form>

        {/* LIVE CUSTOMER FEEDBACK & REVIEWS */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase">
                  Ulasan Pelanggan Terverifikasi
                </h4>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {filteredSubmissions.length} Ulasan
              </span>
            </div>

            {/* Filter Wilayah */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Filter Wilayah Kecamatan / Desa:
              </label>
              <select
                value={filterWilayah}
                onChange={(e) => setFilterWilayah(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:bg-white focus:outline-hidden"
              >
                <option value="Semua">Semua Wilayah Pelayanan</option>
                {AETRA_SERVICE_AREAS.map((a) => (
                  <optgroup key={a.kecamatan} label={`KECAMATAN ${a.kecamatan}`}>
                    <option value={a.kecamatan}>Kecamatan {a.kecamatan} (Semua Desa)</option>
                    {a.desaList.map((d) => (
                      <option key={d} value={d}>
                        &nbsp;&nbsp;Desa {d}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Feed List */}
            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
              {filteredSubmissions.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                  Belum ada ulasan untuk wilayah yang dipilih.
                </div>
              ) : (
                filteredSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{sub.nama}</span>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span className="font-bold text-xs">{sub.csatOverall || 5}/5</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <MapPin className="w-3 h-3 text-blue-500" />
                      <span>Desa {sub.desa || sub.kelurahan}</span>
                      {sub.kecamatan && <span>&bull; Kec. {sub.kecamatan}</span>}
                    </div>

                    {sub.komentar && (
                      <p className="text-[11px] text-slate-700 italic bg-white p-2.5 rounded-lg border border-slate-200/60 leading-relaxed">
                        &ldquo;{sub.komentar}&rdquo;
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>{sub.kategoriMasukan || 'Puas'}</span>
                      <span>{new Date(sub.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
