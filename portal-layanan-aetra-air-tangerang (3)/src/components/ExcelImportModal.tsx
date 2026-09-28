import React, { useState, useRef } from 'react';
import { RegistrationFormData } from '../types';
import { parseExcelCustomerFile, downloadExcelTemplate } from '../utils/excelService';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  ArrowRight,
  RefreshCw,
  Users,
  Eye,
  FileCheck
} from 'lucide-react';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmImport: (newRecords: RegistrationFormData[]) => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onConfirmImport,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<RegistrationFormData[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleProcessFile = async (file: File) => {
    // Validate file type
    const validExts = ['.xlsx', '.xls', '.csv'];
    const hasValidExt = validExts.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      setErrorMessage('Format file tidak didukung. Harap unggah file Microsoft Excel (.xlsx, .xls) atau CSV.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSelectedFileName(file.name);

    try {
      const records = await parseExcelCustomerFile(file);
      if (records.length === 0) {
        setErrorMessage('Tidak ada data pelanggan yang valid ditemukan di dalam file. Pastikan kolom Nama dan No. Form terisi.');
        setParsedData([]);
      } else {
        setParsedData(records);
      }
    } catch (err: any) {
      console.error('Error parsing Excel:', err);
      setErrorMessage(err.message || 'Gagal membaca file Excel. Harap periksa format data di dalamnya.');
      setParsedData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleProcessFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleProcessFile(files[0]);
    }
  };

  const handleReset = () => {
    setSelectedFileName(null);
    setParsedData([]);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExecuteImport = () => {
    if (parsedData.length === 0) return;
    onConfirmImport(parsedData);
    handleReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-linear-to-r from-[#005DAA] to-[#003868] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/20">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight">
                Import Data Pelanggan dari Excel
              </h3>
              <p className="text-xs text-blue-100 mt-0.5">
                Tambahkan atau perbarui data pendaftaran sambungan secara massal (.xlsx / .csv)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Quick Guide & Template Download Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <Layers className="w-4 h-4 text-[#005DAA] shrink-0" />
              <span>Gunakan format kolom resmi agar data terpetakan secara otomatis.</span>
            </div>
            <button
              type="button"
              onClick={downloadExcelTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-emerald-600 hover:text-emerald-700 text-slate-700 font-bold transition shadow-2xs text-xs shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              Unduh Template Excel (.xlsx)
            </button>
          </div>

          {/* Upload / Drag & Drop Area */}
          {parsedData.length === 0 ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-[#005DAA] bg-blue-50/60 scale-[1.01]'
                  : 'border-slate-300 hover:border-[#005DAA] bg-slate-50/40 hover:bg-blue-50/20'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 border border-emerald-200 shadow-2xs">
                {isLoading ? (
                  <RefreshCw className="w-7 h-7 animate-spin text-[#005DAA]" />
                ) : (
                  <Upload className="w-7 h-7 text-emerald-600" />
                )}
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                {isLoading ? 'Sedang Membaca & Memvalidasi File Excel...' : 'Tarik & Letakkan File Excel Di Sini'}
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Mendukung berkas <strong>.xlsx</strong>, <strong>.xls</strong>, atau <strong>.csv</strong>. Klik area ini untuk memilih file dari komputer Anda.
              </p>
            </div>
          ) : (
            /* Preview of Parsed Data */
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-900 block">
                      File: {selectedFileName}
                    </span>
                    <span className="text-[11px] text-emerald-700">
                      Terdeteksi <strong>{parsedData.length} baris data pelanggan</strong> siap diimpor.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-2.5 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-100 rounded-lg transition"
                >
                  Ganti File
                </button>
              </div>

              {/* Table Preview */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-[#005DAA]" />
                    Pratinjau Data (Maksimal 5 baris pertama)
                  </span>
                  <span>Total {parsedData.length} Data</span>
                </div>
                <div className="overflow-x-auto max-h-56">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 text-[11px] uppercase border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="py-2 px-3">No. Form</th>
                        <th className="py-2 px-3">Nama Pemohon</th>
                        <th className="py-2 px-3">NIK</th>
                        <th className="py-2 px-3">No. HP</th>
                        <th className="py-2 px-3">Alamat Pasang</th>
                        <th className="py-2 px-3">Tarif</th>
                        <th className="py-2 px-3">Tahap</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedData.slice(0, 5).map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70">
                          <td className="py-2 px-3 font-mono font-bold text-[#005DAA]">
                            #{row.noForm}
                          </td>
                          <td className="py-2 px-3 font-semibold text-slate-800 truncate max-w-[140px]">
                            {row.namaKtp}
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-600">
                            {row.noKtp}
                          </td>
                          <td className="py-2 px-3 text-slate-600">
                            {row.telpHp}
                          </td>
                          <td className="py-2 px-3 text-slate-600 truncate max-w-[160px]">
                            {row.alamatPasang}
                          </td>
                          <td className="py-2 px-3 text-slate-700">
                            {row.golonganTarif || '2A1'}
                          </td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                              Tahap {row.trackingStep || 1}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block">Gagal Memproses Berkas</span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition"
          >
            Batal
          </button>
          {parsedData.length > 0 && (
            <button
              type="button"
              onClick={handleExecuteImport}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              Konfirmasi &amp; Simpan {parsedData.length} Data Pelanggan
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
