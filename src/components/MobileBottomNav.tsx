import React from 'react';
import { TabType, UserRole } from '../types';
import { 
  FileText, 
  Navigation, 
  CreditCard, 
  MessageSquareHeart, 
  HelpCircle, 
  Users, 
  Sparkles 
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  userRole: UserRole;
  registeredCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  registeredCount,
}) => {
  const customerTabs: { id: TabType; label: string; icon: any; isCenter?: boolean; isLive?: boolean }[] = [
    {
      id: 'registration',
      label: 'Daftar SR',
      icon: FileText,
    },
    {
      id: 'tracking',
      label: 'Tracking',
      icon: Navigation,
      isLive: true,
    },
    {
      id: 'billing',
      label: 'Tagihan',
      icon: CreditCard,
      isCenter: true,
    },
    {
      id: 'survey',
      label: 'Survey',
      icon: MessageSquareHeart,
    },
    {
      id: 'faq',
      label: 'Bantuan',
      icon: HelpCircle,
    },
  ];

  const adminTabs: { id: TabType; label: string; icon: any; isCenter?: boolean; isLive?: boolean }[] = [
    {
      id: 'admin',
      label: 'Pelanggan',
      icon: Users,
    },
    {
      id: 'registration',
      label: 'Formulir',
      icon: FileText,
    },
    {
      id: 'billing',
      label: 'Tagihan',
      icon: CreditCard,
      isCenter: true,
    },
    {
      id: 'tracking',
      label: 'Tracking',
      icon: Navigation,
      isLive: true,
    },
    {
      id: 'faq',
      label: 'FAQ',
      icon: HelpCircle,
    },
  ];

  const tabs = userRole === 'admin' ? adminTabs : customerTabs;

  return (
    <nav 
      aria-label="Navigasi Bawah Mobile" 
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-2xl px-2 pt-1 pb-safe lg:hidden transition-transform"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.isCenter) {
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="relative -top-3 flex flex-col items-center group cursor-pointer focus:outline-hidden"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-200 active:scale-95 ${
                    isActive
                      ? 'bg-linear-to-tr from-[#005DAA] to-[#004A88] text-white ring-4 ring-blue-100 shadow-blue-500/30'
                      : 'bg-linear-to-tr from-[#F37021] to-[#e05e10] text-white shadow-orange-500/30'
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span
                  className={`text-[10px] font-black tracking-tight mt-1 transition-colors ${
                    isActive ? 'text-[#005DAA]' : 'text-slate-700'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-1.5 flex flex-col items-center justify-center relative transition-all duration-150 cursor-pointer focus:outline-hidden active:scale-95 ${
                isActive ? 'text-[#005DAA]' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <div
                  className={`p-1 rounded-xl transition-colors ${
                    isActive ? 'bg-blue-50 text-[#005DAA]' : 'text-slate-500'
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[2]" />
                </div>
                {tab.isLive && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-0.5 tracking-tight truncate ${
                  isActive ? 'font-black text-[#005DAA]' : 'font-semibold text-slate-500'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="w-4 h-0.5 bg-[#005DAA] rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
