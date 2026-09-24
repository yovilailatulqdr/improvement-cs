import React from 'react';
import { TabType, UserRole, UserAccount } from '../types';
import { AetraLogo } from './AetraLogo';
import {
  FileText,
  Navigation,
  MessageSquareHeart,
  HelpCircle,
  ChevronRight,
  X,
  ShieldCheck,
  User,
  LayoutDashboard,
  LogOut,
  Database,
} from 'lucide-react';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  registeredCount: number;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  userRole: UserRole;
  onSwitchRole: (role: UserRole) => void;
  currentUser?: UserAccount | null;
  onLogout?: () => void;
  onOpenSupabaseModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  registeredCount,
  isOpenMobile,
  setIsOpenMobile,
  userRole,
  onSwitchRole,
  currentUser,
  onLogout,
  onOpenSupabaseModal,
}) => {
  const customerNavItems = [
    {
      id: 'registration' as TabType,
      label: 'Registrasi Baru',
      sublabel: 'Formulir Sambungan (SR)',
      icon: FileText,
      // No number badge
    },
    {
      id: 'tracking' as TabType,
      label: 'Tracking Sambungan',
      sublabel: 'Lacak Status Pemasangan',
      icon: Navigation,
      isLiveDot: true,
    },
    {
      id: 'survey' as TabType,
      label: 'Survey',
      sublabel: 'Kepuasan & Evaluasi Layanan',
      icon: MessageSquareHeart,
    },
    {
      id: 'faq' as TabType,
      label: 'FAQ',
      sublabel: 'Tarif, Ketentuan & Panduan',
      icon: HelpCircle,
    },
  ];

  const adminNavItems = [
    {
      id: 'admin' as TabType,
      label: 'Dashboard Admin',
      sublabel: 'Antrean & Kendali SPK',
      icon: LayoutDashboard,
    },
    {
      id: 'tracking' as TabType,
      label: 'Tracking Sambungan',
      sublabel: 'Status Teknis & Progres Fisik',
      icon: Navigation,
      isLiveDot: true,
    },
    {
      id: 'registration' as TabType,
      label: 'Formulir Pendaftaran',
      sublabel: 'Input Data Pasang Baru',
      icon: FileText,
    },
    {
      id: 'survey' as TabType,
      label: 'Respon Survey',
      sublabel: 'Evaluasi & Indeks CSAT',
      icon: MessageSquareHeart,
    },
    {
      id: 'faq' as TabType,
      label: 'Pusat Bantuan / FAQ',
      sublabel: 'Ketentuan & Info Tarif',
      icon: HelpCircle,
    },
  ];

  const currentNavItems = userRole === 'admin' ? adminNavItems : customerNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-250 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <AetraLogo size="sm" variant="horizontal" />
          <button
            onClick={() => setIsOpenMobile(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Switcher in Sidebar */}
        <div className="px-3 pt-3">
          <div className="p-1 bg-slate-100 rounded-xl flex items-center border border-slate-200/80">
            <button
              type="button"
              onClick={() => {
                onSwitchRole('customer');
                if (activeTab === 'admin') setActiveTab('registration');
              }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                userRole === 'customer'
                  ? 'bg-white text-[#005DAA] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Pelanggan
            </button>
            <button
              type="button"
              onClick={() => {
                onSwitchRole('admin');
                setActiveTab('admin');
              }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                userRole === 'admin'
                  ? 'bg-[#005DAA] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin
            </button>
          </div>
        </div>

        {/* Primary Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
          <div className="px-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>{userRole === 'admin' ? 'Menu Backoffice' : 'Menu Layanan'}</span>
            <span className="text-[10px] font-normal text-slate-400 lowercase">
              {userRole === 'admin' ? 'admin' : 'pelanggan'}
            </span>
          </div>

          <nav className="space-y-1">
            {currentNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpenMobile(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all duration-150 group ${
                    isActive
                      ? 'bg-[#005DAA] text-white shadow-sm shadow-blue-900/15 font-medium'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? 'bg-white/15 text-white'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-[#005DAA]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className={`text-xs font-semibold truncate ${isActive ? 'text-white' : 'text-slate-800'}`}>
                        {item.label}
                      </span>
                      {item.isLiveDot && (
                        <span className="relative flex h-2 w-2 shrink-0" title="Aktif Real-time">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-[11px] truncate leading-tight mt-0.5 ${
                        isActive ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      {item.sublabel}
                    </p>
                  </div>

                  <ChevronRight
                    className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                      isActive ? 'text-white translate-x-0.5' : 'text-slate-300 group-hover:text-slate-500'
                    }`}
                  />
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Account Info & Logout */}
        {currentUser && (
          <div className="p-3 mx-3 mb-2 rounded-xl bg-slate-100/90 border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {currentUser.nama}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {currentUser.email}
                </div>
                <div className="text-[10px] font-mono font-bold text-[#005DAA] mt-0.5">
                  ID: #{currentUser.idPelanggan}
                </div>
              </div>
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  title="Keluar"
                  className="p-1.5 rounded-lg bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-200 transition shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Bottom Status / Copyright */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-center">
          {onOpenSupabaseModal && (
            <button
              type="button"
              onClick={onOpenSupabaseModal}
              className="w-full mb-3 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition shadow-2xs group cursor-pointer"
            >
              <Database className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
              <span>Database Supabase</span>
            </button>
          )}

          <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Layanan Online 24 Jam</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            PT Aetra Air Tangerang &copy; 2026
          </p>
        </div>
      </aside>
    </>
  );
};

