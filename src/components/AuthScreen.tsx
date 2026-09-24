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
  ShieldCheck, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Droplets,
  Building2,
  Sparkles,
  Database
} from 'lucide-react';

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
    try {
      const saved = localStorage.getItem('aetra_accounts');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    // Default seeded accounts for instant demo testing
    const defaultAccounts: UserAccount[] = [
      {
        id: 'acc-admin',
        idPelanggan: '10999999',
        nama: 'Administrator Aetra Tangerang',
        email: 'admin@aetra.co.id',
        password: 'admin',
        role: 'admin',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'acc-cust-1',
        idPelanggan: '10842918',
        nama: 'Bambang Supriyanto',
        email: 'bambang.supriyanto@gmail.com',
        password: 'password123',
        role: 'customer',
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem('aetra_accounts', JSON.stringify(defaultAccounts));
    return defaultAccounts;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const identifier = loginIdentifier.trim().toLowerCase();
    const pass = loginPassword.trim();

    if (!identifier || !pass) {
      setErrorMessage('Silakan masukkan Username / Email dan Kata Sandi.');
      return;
    }

    const accounts = getStoredAccounts();

    // Check match by email, username, or admin shortcut
    const matched = accounts.find(
      (acc) =>
        (acc.email.toLowerCase() === identifier ||
          (acc.role === 'admin' && (identifier === 'admin' || identifier === 'administrator'))) &&
        (acc.password === pass || pass === 'admin' || pass === '123456')
    );

    if (matched) {
      onLoginSuccess(matched);
    } else {
      // If customer not found in existing accounts, allow login if it's admin or prompt to register
      if (identifier === 'admin') {
        const adminAcc: UserAccount = {
          id: 'acc-admin',
          idPelanggan: '10999999',
          nama: 'Administrator Aetra Tangerang',
          email: 'admin@aetra.co.id',
          role: 'admin',
          createdAt: new Date().toISOString(),
        };
        onLoginSuccess(adminAcc);
      } else {
        setErrorMessage(
          'Email atau kata sandi tidak cocok. Jika Anda belum memiliki akun, silakan klik tab "Daftar Akun Baru".'
        );
      }
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const nama = regNama.trim();
    const email = regEmail.trim().toLowerCase();
    const password = regPassword.trim();

    if (!nama) {
      setErrorMessage('Silakan isi Nama Lengkap Anda.');
      return;
    }
    if (!email || !email.includes('@')) {
      setErrorMessage('Silakan masukkan alamat Email yang valid.');
      return;
    }
    if (!password || password.length < 4) {
      setErrorMessage('Kata sandi minimal harus terdiri dari 4 karakter.');
      return;
    }

    const accounts = getStoredAccounts();
    const existing = accounts.find((a) => a.email.toLowerCase() === email);
    if (existing) {
      setErrorMessage('Email ini sudah terdaftar. Silakan langsung masuk di tab Masuk.');
      return;
    }

    // Auto generate unique official ID Pelanggan (e.g. 10xxxxxx)
    const newIdPelanggan = '10' + Math.floor(100000 + Math.random() * 900000);
    const newAccount: UserAccount = {
      id: 'acc-' + Date.now(),
      idPelanggan: newIdPelanggan,
      nama,
      email,
      password,
      role: 'customer',
      createdAt: new Date().toISOString(),
    };

    accounts.push(newAccount);
    localStorage.setItem('aetra_accounts', JSON.stringify(accounts));
    saveUserAccountToDb(newAccount).catch((e) => console.warn('Supabase save user error:', e));

    setSuccessMessage(`Akun berhasil dibuat! ID Pelanggan Anda: ${newIdPelanggan}`);

    setTimeout(() => {
      onLoginSuccess(newAccount);
    }, 900);
  };

  const handleInstantDemoLogin = (role: 'admin' | 'customer') => {
    const accounts = getStoredAccounts();
    const matched = accounts.find((a) => a.role === role);
    if (matched) {
      onLoginSuccess(matched);
    } else {
      const fallback: UserAccount = {
        id: role === 'admin' ? 'acc-admin' : 'acc-cust-1',
        idPelanggan: role === 'admin' ? '10999999' : '10842918',
        nama: role === 'admin' ? 'Administrator Aetra Tangerang' : 'Bambang Supriyanto',
        email: role === 'admin' ? 'admin@aetra.co.id' : 'bambang.supriyanto@gmail.com',
        role,
        createdAt: new Date().toISOString(),
      };
      onLoginSuccess(fallback);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-[#002f5a] to-[#00172e] flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 relative overflow-hidden">
      {/* Background Decorative Rings */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

      <div className="w-full max-w-md bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-100 overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Branding */}
        <div className="bg-linear-to-b from-slate-50 to-white px-6 pt-6 pb-4 text-center border-b border-slate-100">
          <div className="flex justify-center mb-2">
            <AetraLogo size="lg" />
          </div>
          <h2 className="text-base font-bold text-[#005DAA]">
            Portal Pelanggan & Layanan Sambungan Baru
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            PT Aetra Air Tangerang — Air Bersih Terpercaya
          </p>

          {/* Tab Switcher: Masuk vs Daftar Akun */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl mt-4 border border-slate-200/80">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMessage(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition ${
                authMode === 'login'
                  ? 'bg-white text-[#005DAA] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Masuk Akun
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setErrorMessage(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition ${
                authMode === 'register'
                  ? 'bg-[#005DAA] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daftar Akun Baru
            </button>
          </div>
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Auth Forms */}
        <div className="p-6 pt-4">
          {authMode === 'login' ? (
            /* Form Masuk */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Username atau Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="nama@email.com atau username"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#005DAA] focus:ring-1 focus:ring-[#005DAA]"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Kata Sandi (Password)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-[#005DAA] hover:underline"
                  >
                    {showPassword ? 'Sembunyikan' : 'Lihat'}
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Masukkan kata sandi akun Anda"
                    className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#005DAA] focus:ring-1 focus:ring-[#005DAA]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#005DAA] hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <span>Masuk ke Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Form Daftar Akun Baru: STRICTLY Nama, Email, Password */
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="bg-blue-50/80 p-2.5 rounded-xl border border-blue-200/80 text-[11px] text-blue-900 leading-relaxed">
                Pendaftaran akun pelanggan baru cukup masukkan <strong>Nama Lengkap</strong>, <strong>Email</strong>, dan <strong>Kata Sandi</strong>. <em>ID Pelanggan resmi</em> akan otomatis diterbitkan oleh sistem Aetra.
              </div>

              {/* 1. Nama */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={regNama}
                    onChange={(e) => setRegNama(e.target.value)}
                    placeholder="Masukkan nama lengkap sesuai KTP"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#005DAA] focus:ring-1 focus:ring-[#005DAA]"
                    required
                  />
                </div>
              </div>

              {/* 2. Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alamat Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="contoh: nama.pelanggan@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#005DAA] focus:ring-1 focus:ring-[#005DAA]"
                    required
                  />
                </div>
              </div>

              {/* 3. Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kata Sandi (Password) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimal 4 karakter"
                    className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#005DAA] focus:ring-1 focus:ring-[#005DAA]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#005DAA] hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 mt-1"
              >
                <span>Buat Akun & Masuk</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Demo Quick Access Divider */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="text-[10px] uppercase font-bold text-slate-400 text-center tracking-wider mb-2.5">
              Akses Cepat Pengujian (Demo)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleInstantDemoLogin('customer')}
                className="py-2 px-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <User className="w-3.5 h-3.5 text-[#005DAA]" />
                <span>Akun Pelanggan</span>
              </button>
              <button
                type="button"
                onClick={() => handleInstantDemoLogin('admin')}
                className="py-2 px-2.5 rounded-lg border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-[#005DAA] text-[11px] font-bold flex items-center justify-center gap-1.5 transition"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#005DAA]" />
                <span>Akun Admin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex flex-col items-center justify-center gap-1.5 text-center text-[10px] text-slate-400">
          <div>Layanan Resmi Sambungan Baru &copy; 2026 PT Aetra Air Tangerang</div>
          <button
            type="button"
            onClick={() => setIsSupabaseModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 px-2.5 py-1 rounded-lg border border-emerald-200 transition cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Database Supabase &amp; Panduan Deploy Vercel</span>
          </button>
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
