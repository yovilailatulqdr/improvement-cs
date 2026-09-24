import React, { useMemo } from 'react';
import { RegistrationFormData } from '../types';
import { 
  calculateDomesticTariff, 
  DOMESTIC_TARIFF_RULES,
  DOMESTIC_TARIFF_CLAUSES,
  DomesticTariffClause
} from '../data/domesticTariffs';
import { 
  CheckCircle2, 
  Sparkles, 
  Building2, 
  Home, 
  Store, 
  Layers, 
  Info,
  Check,
  MapPin,
  HelpCircle
} from 'lucide-react';

interface DomesticTariffSelectorProps {
  formData: RegistrationFormData;
  setFormData: React.Dispatch<React.SetStateAction<RegistrationFormData>>;
  onKategoriChange?: (categoryCode: string, clauseText: string) => void;
  readOnly?: boolean;
}

export const DomesticTariffSelector: React.FC<DomesticTariffSelectorProps> = ({
  formData,
  setFormData,
  onKategoriChange,
  readOnly = false,
}) => {
  // 1. Extract values
  const luasTapak = parseFloat(String(formData.luasBangunan || '0')) || 0;
  const lantai = Number(formData.kondisiBangunan.jumlahLantai) || 1;
  const totalLuas = luasTapak > 0 ? luasTapak * lantai : 0;

  const isRealEstate =
    formData.lingkungan.realEstate === 'Ya' ||
    formData.lingkungan.realEstate === 'Real Estate / Cluster / Komplek' ||
    formData.lingkungan.realEstate === 'real_estate';

  const hasUsaha = Boolean(formData.hasUsahaKomersil);

  // 2. Compute the exact active tariff
  const calculation = useMemo(() => {
    return totalLuas > 0 ? calculateDomesticTariff(totalLuas, isRealEstate, hasUsaha) : null;
  }, [totalLuas, isRealEstate, hasUsaha]);

  // Sync to formData whenever calculation changes
  React.useEffect(() => {
    if (calculation) {
      if (
        formData.golonganTarif !== calculation.name ||
        formData.kategoriTarifKlausul !== calculation.appliedClause
      ) {
        setFormData((prev) => ({
          ...prev,
          golonganTarif: calculation.name,
          kategoriTarifKlausul: calculation.appliedClause,
        }));
        if (onKategoriChange) {
          onKategoriChange(calculation.code, calculation.appliedClause);
        }
      }
    }
  }, [calculation]);

  // Handlers for interactive controls
  const handleSetArea = (isRE: boolean) => {
    setFormData((prev) => ({
      ...prev,
      lingkungan: {
        ...prev.lingkungan,
        realEstate: isRE ? 'Real Estate / Cluster / Komplek' : 'Bukan Real Estate (Pemukiman Umum)',
      },
    }));
  };

  const handleSetUsaha = (withUsaha: boolean) => {
    setFormData((prev) => ({
      ...prev,
      hasUsahaKomersil: withUsaha,
      // If customer has usaha, optionally adjust building function if it was default
      fungsiBangunan: withUsaha
        ? (prev.fungsiBangunan && prev.fungsiBangunan !== 'Rumah Tangga' ? prev.fungsiBangunan : 'Usaha Kecil Dalam Rumah Tangga')
        : 'Rumah Tangga',
    }));
  };

  const handleSetLuasPreset = (presetLuas: number) => {
    setFormData((prev) => ({
      ...prev,
      luasBangunan: presetLuas,
      kondisiBangunan: {
        ...prev.kondisiBangunan,
        jumlahLantai: prev.kondisiBangunan.jumlahLantai || 1,
      },
    }));
  };

  // Direct Apply from photo clause click
  const handleApplyClause = (clause: DomesticTariffClause) => {
    if (readOnly) return;
    setFormData((prev) => ({
      ...prev,
      luasBangunan: clause.sampleLuas,
      hasUsahaKomersil: clause.hasUsaha,
      lingkungan: {
        ...prev.lingkungan,
        realEstate: clause.isRealEstate
          ? 'Real Estate / Cluster / Komplek'
          : 'Bukan Real Estate (Pemukiman Umum)',
      },
      kondisiBangunan: {
        ...prev.kondisiBangunan,
        jumlahLantai: prev.kondisiBangunan.jumlahLantai || 1,
      },
      golonganTarif: `${clause.code} = ${clause.code === 'R1' ? 'Rumah Tangga 1' : clause.code === 'R2' ? 'Rumah Tangga 2' : clause.code === 'R3' ? 'Rumah Tangga 3' : 'Rumah Tangga 4'}`,
      kategoriTarifKlausul: clause.text,
    }));
  };

  return (
    <div className="space-y-4">
      {/* KONTROL OPSI PENENTUAN KATEGORI TARIF */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b pb-2 border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#005DAA] text-white flex items-center justify-center font-bold text-xs">
              SK
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Opsi Penentuan Kategori Tarif Domestik
              </h4>
              <p className="text-[11px] text-slate-500">
                Pilih opsi di bawah ini untuk menentukan golongan tarif sesuai ketentuan resmi Aetra
              </p>
            </div>
          </div>
          <span className="text-[10px] bg-blue-100 text-[#005DAA] font-bold px-2 py-0.5 rounded-full">
            Ketentuan SK Aetra
          </span>
        </div>

        {/* 1. OPSI KAWASAN PROPERTI */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
          <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#005DAA]" />
              <span>1. Kawasan / Area Properti Bangunan:</span>
            </span>
            <span className="text-[11px] font-semibold text-[#005DAA]">
              {isRealEstate ? 'Kawasan Real Estate' : 'Non Real Estate (Pemukiman Umum)'}
            </span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              disabled={readOnly}
              onClick={() => handleSetArea(false)}
              className={`p-2.5 rounded-lg border text-left transition flex items-start gap-2.5 ${
                !isRealEstate
                  ? 'bg-blue-50/80 border-[#005DAA] text-slate-900 ring-1 ring-[#005DAA]/40'
                  : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className={`w-4 h-4 mt-0.5 rounded-full border flex items-center justify-center shrink-0 ${
                !isRealEstate ? 'border-[#005DAA] bg-[#005DAA]' : 'border-slate-400 bg-white'
              }`}>
                {!isRealEstate && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold">Area Non Real Estate / Pemukiman Umum</div>
                <div className="text-[10px] text-slate-500 leading-tight">
                  Perkampungan, perumahan umum biasa, kavling masyarakat umum
                </div>
              </div>
            </button>

            <button
              type="button"
              disabled={readOnly}
              onClick={() => handleSetArea(true)}
              className={`p-2.5 rounded-lg border text-left transition flex items-start gap-2.5 ${
                isRealEstate
                  ? 'bg-blue-50/80 border-[#005DAA] text-slate-900 ring-1 ring-[#005DAA]/40'
                  : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className={`w-4 h-4 mt-0.5 rounded-full border flex items-center justify-center shrink-0 ${
                isRealEstate ? 'border-[#005DAA] bg-[#005DAA]' : 'border-slate-400 bg-white'
              }`}>
                {isRealEstate && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold">Kawasan Real Estate / Cluster</div>
                <div className="text-[10px] text-slate-500 leading-tight">
                  Perumahan cluster mandiri, komplek real estate pengembang resmi
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* 2. OPSI PERUNTUKAN USAHA KOMERSIL */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
          <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-[#F37021]" />
              <span>2. Peruntukan &amp; Kegiatan Usaha di Rumah:</span>
            </span>
            <span className="text-[11px] font-semibold text-[#F37021]">
              {hasUsaha ? 'Memiliki Kegiatan Usaha' : 'Tanpa Usaha Komersil'}
            </span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              disabled={readOnly}
              onClick={() => handleSetUsaha(false)}
              className={`p-2.5 rounded-lg border text-left transition flex items-start gap-2.5 ${
                !hasUsaha
                  ? 'bg-emerald-50/80 border-emerald-600 text-slate-900 ring-1 ring-emerald-600/40'
                  : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className={`w-4 h-4 mt-0.5 rounded-full border flex items-center justify-center shrink-0 ${
                !hasUsaha ? 'border-emerald-600 bg-emerald-600' : 'border-slate-400 bg-white'
              }`}>
                {!hasUsaha && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold">Hanya Rumah Tinggal (Tanpa Usaha Komersil)</div>
                <div className="text-[10px] text-slate-500 leading-tight">
                  Murni untuk hunian keluarga, tidak ada toko/warung/jasa komersil
                </div>
              </div>
            </button>

            <button
              type="button"
              disabled={readOnly}
              onClick={() => handleSetUsaha(true)}
              className={`p-2.5 rounded-lg border text-left transition flex items-start gap-2.5 ${
                hasUsaha
                  ? 'bg-amber-50/80 border-amber-600 text-slate-900 ring-1 ring-amber-600/40'
                  : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className={`w-4 h-4 mt-0.5 rounded-full border flex items-center justify-center shrink-0 ${
                hasUsaha ? 'border-amber-600 bg-amber-600' : 'border-slate-400 bg-white'
              }`}>
                {hasUsaha && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold">Memiliki Usaha Komersil di Rumah</div>
                <div className="text-[10px] text-slate-500 leading-tight">
                  Terdapat warung kelontong, toko, salon/pangkas rambut, laundry, dll.
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* 3. INPUT LUAS BANGUNAN & SHORTCUT PILIHAN CEPAT RENTANG LUAS SESUAI KETENTUAN FOTO */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-blue-600" />
              <span>3. Luas Bangunan &amp; Rentang Sesuai Ketentuan Foto:</span>
            </label>
            <span className="font-mono text-xs font-black text-[#005DAA] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Total Luas: {totalLuas > 0 ? `${totalLuas.toLocaleString('id-ID')} m²` : '0 m²'}
            </span>
          </div>

          {/* Quick presets matching the photo intervals */}
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
              Pilihan Cepat Rentang Luas Bangunan Sesuai Ketentuan Foto:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { label: '< 28,8 m²', value: 24, desc: 'Kategori R1' },
                { label: '> 28,9 – < 70 m²', value: 54, desc: 'Kategori R2 / R3' },
                { label: '> 70 – < 120 m²', value: 90, desc: 'Kategori R3 / R4' },
                { label: '> 120 m²', value: 140, desc: 'Kategori R4' },
              ].map((preset) => {
                const isSelected = totalLuas === preset.value;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    disabled={readOnly}
                    onClick={() => handleSetLuasPreset(preset.value)}
                    className={`px-2.5 py-1.5 rounded-lg border text-center transition flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-[#005DAA] text-white border-[#005DAA] shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span className="font-bold text-xs">{preset.label}</span>
                    <span className={`text-[9px] ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                      {preset.desc} ({preset.value} m²)
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAMPILAN VISUAL RESMI SESUAI FOTO: "Kategori Tarif Pelanggan Domestik"     */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-md overflow-hidden">
        {/* Header persis banner dokumen resmi Aetra */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-[#005DAA] tracking-tight">
              Kategori Tarif Pelanggan Domestik
            </h3>
            <div className="h-0.5 w-24 bg-red-400 mt-0.5 rounded-full" />
          </div>

          <div className="flex items-center gap-1.5 text-right">
            <span className="text-base sm:text-lg font-black tracking-tight text-[#005DAA] lowercase">
              aetra
            </span>
            <span className="text-xs font-semibold text-slate-500 lowercase">
              tangerang
            </span>
          </div>
        </div>

        {/* 2 Kolom Grid Persis Sesuai Gambar Foto */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white text-xs">
          {/* ======================================== */}
          {/* KOLOM KIRI: R1 & R2                      */}
          {/* ======================================== */}
          <div className="space-y-6">
            {/* R1 = Rumah Tangga 1 */}
            {(() => {
              const isR1Active = calculation?.code === 'R1';
              return (
                <div
                  onClick={() => handleApplyClause(DOMESTIC_TARIFF_CLAUSES[0])}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative ${
                    isR1Active
                      ? 'bg-emerald-50/90 border-emerald-500 shadow-md ring-2 ring-emerald-400/30'
                      : 'bg-slate-50/50 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-black text-slate-900 tracking-tight">
                      R1 = Rumah Tangga 1
                    </h4>
                    {isR1Active && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold shadow-2xs animate-in fade-in">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>KATEGORI ANDA SAAT INI</span>
                      </span>
                    )}
                  </div>

                  <ul className="space-y-2 text-slate-700 pl-1 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="font-black text-slate-900 select-none">&bull;</span>
                      <span className={`${isR1Active ? 'font-bold text-emerald-950' : 'text-slate-700'}`}>
                        Pelanggan yang propertinya mempunyai luas bangunan &lt; 28,8 m2 Yang peruntukannya hanya untuk rumah tinggal tanpa usaha komersil
                      </span>
                    </li>
                  </ul>

                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Kriteria: Luas &lt; 28,8 m² &bull; Non Real Estate &bull; Tanpa Usaha</span>
                    <span className="text-[#005DAA] font-semibold">Klik untuk terapkan</span>
                  </div>
                </div>
              );
            })()}

            {/* R2 = Rumah Tangga 2 */}
            {(() => {
              const isR2Active = calculation?.code === 'R2';
              return (
                <div
                  onClick={() => handleApplyClause(DOMESTIC_TARIFF_CLAUSES[1])}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative ${
                    isR2Active
                      ? 'bg-amber-50/90 border-amber-500 shadow-md ring-2 ring-amber-400/30'
                      : 'bg-slate-50/50 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-black text-slate-900 tracking-tight">
                      R2 = Rumah Tangga 2
                    </h4>
                    {isR2Active && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-600 text-white text-[10px] font-bold shadow-2xs animate-in fade-in">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>KATEGORI ANDA SAAT INI</span>
                      </span>
                    )}
                  </div>

                  <ul className="space-y-2 text-slate-700 pl-1 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="font-black text-slate-900 select-none">&bull;</span>
                      <span className={`${isR2Active ? 'font-bold text-amber-950' : 'text-slate-700'}`}>
                        Pelanggan yang propertinya mempunyai luas bangunan &gt;28,9 m2 dan &lt;70 m2 di area non real estate, yang peruntukannya hanya untuk rumah tinggal tanpa usaha komersil.
                      </span>
                    </li>
                  </ul>

                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Kriteria: Luas 28,9 – 70 m² &bull; Non Real Estate &bull; Tanpa Usaha</span>
                    <span className="text-[#005DAA] font-semibold">Klik untuk terapkan</span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* ======================================== */}
          {/* KOLOM KANAN: R3 & R4                     */}
          {/* ======================================== */}
          <div className="space-y-6">
            {/* R3 = Rumah Tangga 3 */}
            {(() => {
              const isR3Active = calculation?.code === 'R3';
              const activeClause = calculation?.appliedClause || '';
              return (
                <div className={`p-4 rounded-xl border-2 transition-all relative ${
                  isR3Active
                    ? 'bg-blue-50/90 border-blue-500 shadow-md ring-2 ring-blue-400/30'
                    : 'bg-slate-50/50 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-black text-slate-900 tracking-tight">
                      R3 = Rumah Tangga 3
                    </h4>
                    {isR3Active && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-bold shadow-2xs animate-in fade-in">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>KATEGORI ANDA SAAT INI</span>
                      </span>
                    )}
                  </div>

                  <ul className="space-y-2.5 text-slate-700 leading-relaxed">
                    {/* Butir 1 R3 */}
                    <li
                      onClick={() => handleApplyClause(DOMESTIC_TARIFF_CLAUSES[2])}
                      className={`p-1.5 rounded-lg cursor-pointer transition flex items-start gap-2 ${
                        isR3Active && activeClause.includes('> 70 m2 dan < 120 m2 di pemukiman umum')
                          ? 'bg-blue-100/90 text-blue-950 font-bold ring-1 ring-blue-400'
                          : 'hover:bg-slate-100/80'
                      }`}
                    >
                      <span className="font-black select-none text-slate-900 mt-0.5">
                        {isR3Active && activeClause.includes('> 70 m2 dan < 120 m2 di pemukiman umum') ? (
                          <Check className="w-3.5 h-3.5 text-blue-700" />
                        ) : (
                          '&bull;'
                        )}
                      </span>
                      <span>
                        Pelanggan yang propertinya mempunyai luas bangunan &gt; 70 m2 dan &lt; 120 m2 di pemukiman umum.
                      </span>
                    </li>

                    {/* Butir 2 R3 */}
                    <li
                      onClick={() => handleApplyClause(DOMESTIC_TARIFF_CLAUSES[3])}
                      className={`p-1.5 rounded-lg cursor-pointer transition flex items-start gap-2 ${
                        isR3Active && activeClause.includes('kawasan real estate tanpa ada usaha')
                          ? 'bg-blue-100/90 text-blue-950 font-bold ring-1 ring-blue-400'
                          : 'hover:bg-slate-100/80'
                      }`}
                    >
                      <span className="font-black select-none text-slate-900 mt-0.5">
                        {isR3Active && activeClause.includes('kawasan real estate tanpa ada usaha') ? (
                          <Check className="w-3.5 h-3.5 text-blue-700" />
                        ) : (
                          '&bull;'
                        )}
                      </span>
                      <span>
                        Pelanggan yang propertinya mempunyai luas bangunan &lt; 70 m2 di kawasan real estate tanpa ada usaha.
                      </span>
                    </li>

                    {/* Butir 3 R3 */}
                    <li
                      onClick={() => handleApplyClause(DOMESTIC_TARIFF_CLAUSES[4])}
                      className={`p-1.5 rounded-lg cursor-pointer transition flex items-start gap-2 ${
                        isR3Active && activeClause.includes('tetapi memiliki usaha')
                          ? 'bg-blue-100/90 text-blue-950 font-bold ring-1 ring-blue-400'
                          : 'hover:bg-slate-100/80'
                      }`}
                    >
                      <span className="font-black select-none text-slate-900 mt-0.5">
                        {isR3Active && activeClause.includes('tetapi memiliki usaha') ? (
                          <Check className="w-3.5 h-3.5 text-blue-700" />
                        ) : (
                          '&bull;'
                        )}
                      </span>
                      <span>
                        Pelanggan yang propertinya mempunyai luas bangunan &gt; 28,9 m2 dan &lt; 70 m2 di area non real estate tetapi memiliki usaha.
                      </span>
                    </li>
                  </ul>
                </div>
              );
            })()}

            {/* R4 = Rumah Tangga 4 */}
            {(() => {
              const isR4Active = calculation?.code === 'R4';
              const activeClause = calculation?.appliedClause || '';
              return (
                <div className={`p-4 rounded-xl border-2 transition-all relative ${
                  isR4Active
                    ? 'bg-purple-50/90 border-purple-500 shadow-md ring-2 ring-purple-400/30'
                    : 'bg-slate-50/50 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-black text-slate-900 tracking-tight">
                      R4 = Rumah Tangga 4
                    </h4>
                    {isR4Active && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-600 text-white text-[10px] font-bold shadow-2xs animate-in fade-in">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>KATEGORI ANDA SAAT INI</span>
                      </span>
                    )}
                  </div>

                  <ul className="space-y-2.5 text-slate-700 leading-relaxed">
                    {/* Butir 1 R4 */}
                    <li
                      onClick={() => handleApplyClause(DOMESTIC_TARIFF_CLAUSES[5])}
                      className={`p-1.5 rounded-lg cursor-pointer transition flex items-start gap-2 ${
                        isR4Active && (activeClause.includes('> 120 m2 di pemukiman umum') || activeClause.includes('> 70 m2 di real estate'))
                          ? 'bg-purple-100/90 text-purple-950 font-bold ring-1 ring-purple-400'
                          : 'hover:bg-slate-100/80'
                      }`}
                    >
                      <span className="font-black select-none text-slate-900 mt-0.5">
                        {isR4Active && (activeClause.includes('> 120 m2 di pemukiman umum') || activeClause.includes('> 70 m2 di real estate')) ? (
                          <Check className="w-3.5 h-3.5 text-purple-700" />
                        ) : (
                          '&bull;'
                        )}
                      </span>
                      <span>
                        Pelanggan yang propertinya mempunyai luas bangunan &gt; 120 m2 di pemukiman umum atau &gt; 70 m2 di real estate tanpa ada usaha.
                      </span>
                    </li>

                    {/* Butir 2 R4 */}
                    <li
                      onClick={() => handleApplyClause(DOMESTIC_TARIFF_CLAUSES[6])}
                      className={`p-1.5 rounded-lg cursor-pointer transition flex items-start gap-2 ${
                        isR4Active && activeClause.includes('< 70 m2 dan < 120 m2 di pemukiman umum tetapi memiliki usaha')
                          ? 'bg-purple-100/90 text-purple-950 font-bold ring-1 ring-purple-400'
                          : 'hover:bg-slate-100/80'
                      }`}
                    >
                      <span className="font-black select-none text-slate-900 mt-0.5">
                        {isR4Active && activeClause.includes('< 70 m2 dan < 120 m2 di pemukiman umum tetapi memiliki usaha') ? (
                          <Check className="w-3.5 h-3.5 text-purple-700" />
                        ) : (
                          '&bull;'
                        )}
                      </span>
                      <span>
                        Pelanggan yang propertinya mempunyai luas bangunan &lt; 70 m2 dan &lt; 120 m2 di pemukiman umum tetapi memiliki usaha.
                      </span>
                    </li>
                  </ul>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Status Verifikasi Banner Di Bawah Foto */}
        <div className="px-5 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <span className="text-slate-500">Hasil Penentuan Golongan: </span>
              <strong className="text-slate-900 font-black">
                {calculation ? calculation.name : 'Silakan masukkan luas bangunan'}
              </strong>
            </div>
          </div>

          {calculation && (
            <span className="text-[11px] text-[#005DAA] font-semibold bg-white px-3 py-1 rounded-full border border-blue-200 shadow-2xs">
              Klausul Terpenuhi: {calculation.appliedClause}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
