import React, { useState, useEffect } from 'react';
import { UserAccount } from '../types';
import { AetraLogo } from './AetraLogo';
import { SupabaseModal } from './SupabaseModal';
import { 
  fetchUserAccountsFromDb, 
  saveUserAccountToDb 
} from '../services/supabaseService';
import { 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Droplets,
  Sparkles,
  Shield,
  ShieldCheck,
  Database
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

interface AuthScreenProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  
  // Login fields (username/email + password)
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register fields (STRICTLY: Nama, Email, Password as requested by user)
  const [regNama, setRegNama] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sync users from Supabase on mount
  useEffect(() => {
    const syncUsers = async () => {
      try {
        const remoteUsers = await fetchUserAccountsFromDb();
        if (remoteUsers && remoteUsers.length > 0) {
          const currentLocal = getStoredAccounts();
          const merged = [...currentLocal];
          remoteUsers.forEach((ru) => {
            if (!merged.some((lu) => lu.email.toLowerCase() === ru.email.toLowerCase())) {
              merged.push(ru);
            }
          });
          localStorage.setItem('aetra_accounts', JSON.stringify(merged));
        }
      } catch (e) {
        console.warn('Sync users from Supabase error:', e);
      }
    };
    syncUsers();
  }, []);

  // Helper to load accounts from storage
  const getStoredAccounts = (): UserAccount[] => {
    let accounts: UserAccount[] = [];
    try {
      const saved = localStorage.getItem('aetra_accounts');
      if (saved) {
        accounts = JSON.parse(saved);
        if (!Array.isArray(accounts)) accounts = [];
      }
    } catch {
      accounts = [];
    }

    // Default admin account: username: admin, password: aetra123
    const adminIndex = accounts.findIndex((a) => a.role === 'admin' || a.id === 'acc-admin');
    if (adminIndex >= 0) {
      accounts[adminIndex] = {
        ...accounts[adminIndex],
        email: accounts[adminIndex].email || 'admin@aetra.co.id',
        password: 'aetra123',
        role: 'admin',
      };
    } else {
      accounts.unshift({
        id: 'acc-admin',
        idPelanggan: '10999999',
        nama: 'Administrator Aetra Tangerang',
        email: 'admin@aetra.co.id',
        password: 'aetra123',
        role: 'admin',
        createdAt: new Date().toISOString(),
      });
    }

    localStorage.setItem('aetra_accounts', JSON.stringify(accounts));
    return accounts;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const identifier = loginIdentifier.trim().toLowerCase();
    const pass = loginPassword.trim();

    setTimeout(() => {
      setIsLoading(false);
      if (!identifier || !pass) {
        setErrorMessage('Silakan masukkan Username / Email dan Kata Sandi.');
        return;
      }

      const accounts = getStoredAccounts();

      // Check admin match (username 'admin' or email 'admin@aetra.co.id') or customer match
      const matched = accounts.find(
        (acc) =>
          ((acc.role === 'admin' && (identifier === 'admin' || identifier === 'admin@aetra.co.id')) ||
            acc.email.toLowerCase() === identifier ||
            acc.idPelanggan === identifier) &&
          acc.password === pass
      );

      if (matched) {
        onLoginSuccess(matched);
      } else {
        const isKnownEmail = accounts.some(
          (a) => a.email.toLowerCase() === identifier || a.idPelanggan === identifier
        );

        if (!isKnownEmail && identifier !== 'admin' && identifier !== 'admin@aetra.co.id') {
          setErrorMessage(
            'Akun belum terdaftar di sistem. Silakan pilih tab "Daftar Akun Baru" di atas untuk mendaftarkan akun pelanggan Anda.'
          );
        } else {
          setErrorMessage('Kata sandi yang Anda masukkan tidak sesuai. Silakan periksa kembali.');
        }
      }
    }, 250);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    const nama = regNama.trim();
    const email = regEmail.trim().toLowerCase();
    const pass = regPassword.trim();

    if (!nama || !email || !pass) {
      setIsLoading(false);
      setErrorMessage('Seluruh field formulir (Nama, Email, Kata Sandi) wajib diisi.');
      return;
    }

    if (pass.length < 4) {
      setIsLoading(false);
      setErrorMessage('Kata sandi minimal terdiri dari 4 karakter.');
      return;
    }

    const accounts = getStoredAccounts();
    const existing = accounts.find((a) => a.email.toLowerCase() === email);

    if (existing) {
      setIsLoading(false);
      setErrorMessage(`Email "${email}" sudah terdaftar. Silakan langsung masuk pada tab Masuk Akun.`);
      return;
    }

    // Generate unique official customer ID: format 10 + 6 digit
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newIdPelanggan = '10' + randomCode;

    const newAccount: UserAccount = {
      id: 'acc-' + Date.now(),
      idPelanggan: newIdPelanggan,
      nama,
      email,
      password: pass,
      role: 'customer',
      createdAt: new Date().toISOString(),
    };

    accounts.push(newAccount);
    localStorage.setItem('aetra_accounts', JSON.stringify(accounts));

    // Bersihkan draf sebelumnya agar akun baru mulai dengan formulir kosong
    try {
      localStorage.removeItem('aetra_draft_' + newIdPelanggan);
      localStorage.removeItem('aetra_draft_' + newAccount.id);
      localStorage.removeItem('aetra_draft_' + email);
      localStorage.removeItem('aetra_registration_form_draft');
      localStorage.removeItem('aetra_saved_applicant_data');
    } catch {
      // ignore
    }

    try {
      await saveUserAccountToDb(newAccount);
    } catch (err) {
      console.warn('Sync to Supabase skipped/failed:', err);
    }

    setIsLoading(false);
    setSuccessMessage(
      `Pendaftaran akun pelanggan berhasil! ID Pelanggan Anda: ${newIdPelanggan}. Mengalihkan ke portal pelanggan...`
    );

    setTimeout(() => {
      onLoginSuccess(newAccount);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-[#00284d] to-[#00172e] flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 relative overflow-hidden selection:bg-[#005DAA] selection:text-white">
      {/* Background Decorative Tech Elements & Ambient Lights */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none -mt-32"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mb-32"></div>
      
      {/* Subtle Grid Watermark Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="w-full max-w-md bg-white text-slate-800 rounded-3xl shadow-2xl shadow-blue-950/40 border border-slate-100 overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Branding */}
        <div className="bg-linear-to-b from-slate-50 via-white to-white px-6 pt-7 pb-4 text-center border-b border-slate-100">
          <div className="flex justify-center mb-3">
            <AetraLogo size="lg" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#005DAA] text-[10px] font-bold tracking-wide border border-blue-200/80 mb-2">
            <Droplets className="w-3.5 h-3.5 text-[#005DAA]" />
            <span>PORTAL LAYANAN AIR BERSIH RESMI</span>
          </div>

          <p className="text-xs font-semibold text-slate-600 mt-1">
            PT Aetra Air Tangerang
          </p>

          {/* Modern Segmented Control / Tab Switcher */}
          <div className="grid grid-cols-2 p-1 bg-slate-100/90 rounded-2xl mt-5 border border-slate-200/80 shadow-inner">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMessage(null);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition duration-150 cursor-pointer flex items-center justify-center gap-1.5 ${
                authMode === 'login'
                  ? 'bg-white text-[#005DAA] shadow-sm border border-slate-200/60 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Masuk Akun</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setErrorMessage(null);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition duration-150 cursor-pointer flex items-center justify-center gap-1.5 ${
                authMode === 'register'
                  ? 'bg-[#005DAA] text-white shadow-sm font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Daftar Akun Baru</span>
            </button>
          </div>
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-red-50/90 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
            <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
            <span className="leading-relaxed font-medium">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 font-semibold animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{successMessage}</span>
          </div>
        )}

        {/* Auth Forms */}
        <div className="p-6 pt-4">
          {authMode === 'login' ? (
            /* Form Masuk */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="nama@email.com atau username admin"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#005DAA] focus:ring-2 focus:ring-[#005DAA]/20 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Kata Sandi
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-[#005DAA] hover:underline font-semibold cursor-pointer"
                  >
                    {showPassword ? 'Sembunyikan' : 'Lihat'}
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Masukkan kata sandi akun Anda"
                    className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#005DAA] focus:ring-2 focus:ring-[#005DAA]/20 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-400" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[#005DAA] hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-700/25 transition duration-150 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-60"
              >
                <span>{isLoading ? 'Memverifikasi Akun...' : 'Masuk ke Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <p className="text-xs text-slate-500">
                  Belum memiliki akun pelanggan?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setErrorMessage(null);
                    }}
                    className="font-bold text-[#005DAA] hover:underline cursor-pointer"
                  >
                    Daftar Akun
                  </button>
                </p>
              </div>
            </form>
          ) : (
            /* Form Daftar Akun Baru: STRICTLY Nama, Email, Password */
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="bg-blue-50/80 p-3 rounded-2xl border border-blue-200/80 text-[11px] text-blue-900 leading-relaxed">
                Pendaftaran akun pelanggan baru cukup masukkan <strong>Nama Lengkap</strong>, <strong>Email</strong>, dan <strong>Kata Sandi</strong>. <em>ID Pelanggan resmi</em> akan otomatis diterbitkan oleh sistem loket Aetra.
              </div>

              {/* 1. Nama */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={regNama}
                    onChange={(e) => setRegNama(e.target.value)}
                    placeholder="Masukkan nama lengkap sesuai KTP"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#005DAA] focus:ring-2 focus:ring-[#005DAA]/20 transition"
                    required
                  />
                </div>
              </div>

              {/* 2. Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Alamat Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="contoh: nama.pelanggan@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#005DAA] focus:ring-2 focus:ring-[#005DAA]/20 transition"
                    required
                  />
                </div>
              </div>

              {/* 3. Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Kata Sandi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimal 4 karakter"
                    className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#005DAA] focus:ring-2 focus:ring-[#005DAA]/20 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[#005DAA] hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-700/25 transition duration-150 flex items-center justify-center gap-2 mt-1 cursor-pointer active:scale-[0.99] disabled:opacity-60"
              >
                <span>{isLoading ? 'Membuat Akun...' : 'Buat Akun & Masuk'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <p className="text-xs text-slate-500">
                  Sudah memiliki akun pelanggan?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setErrorMessage(null);
                    }}
                    className="font-bold text-[#005DAA] hover:underline cursor-pointer"
                  >
                    Masuk di Sini
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>



        {/* Footer Security & Info */}
        <div className="bg-slate-100/90 px-6 py-3 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-500">
          <span className="flex items-center gap-1 text-slate-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Koneksi Aman Terenkripsi SSL</span>
          </span>
          <span>&copy; 2026 PT Aetra Air Tangerang</span>
        </div>
      </div>

      {/* Supabase Guide & Database Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </div>
  );
};
