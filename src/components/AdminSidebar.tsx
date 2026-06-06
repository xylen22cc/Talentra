import React, { useState } from 'react';
import { 
  Briefcase, 
  ShieldAlert, 
  Globe, 
  Sun, 
  Moon, 
  LogOut, 
  User as UserIcon, 
  Menu, 
  X, 
  ShieldCheck, 
  Users, 
  Building2, 
  Sparkles,
  BarChart3,
  Database
} from 'lucide-react';
import { User, Job, Company } from '../types';
import { useLanguage } from '../LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

interface AdminSidebarProps {
  activeUser: User;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
  onOpenProfile: () => void;
  onRoleChange?: (role: User['role']) => void;
  
  // Tab alignment states & collections passed from parent
  jobs: Job[];
  companies: Company[];
  users: User[];
  activeTab: 'quarantine' | 'companies' | 'jobs' | 'users' | 'analytics' | 'supabase';
  onActiveTabChange: (tab: 'quarantine' | 'companies' | 'jobs' | 'users' | 'analytics' | 'supabase') => void;
}

export default function AdminSidebar({
  activeUser,
  isDarkMode,
  onToggleTheme,
  onLogout,
  onOpenProfile,
  onRoleChange,
  jobs,
  companies,
  users,
  activeTab,
  onActiveTabChange
}: AdminSidebarProps) {
  const { lang, setLang, t } = useLanguage();
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  // Compute stats counters
  const flaggedJobsCount = jobs.filter(j => j.status === 'pending').length;

  // Custom navigation configuration matching activeTab structure
  const menuConfig = [
    { 
      id: 'quarantine' as const, 
      labelId: 'Karantina', 
      labelEn: 'Quarantine', 
      icon: ShieldAlert, 
      badge: flaggedJobsCount,
      badgeType: flaggedJobsCount > 0 ? 'danger' : 'neutral'
    },
    { 
      id: 'companies' as const, 
      labelId: 'Perusahaan Terdaftar', 
      labelEn: 'Enterprise Companies', 
      icon: Globe, 
      badge: companies.length,
      badgeType: 'neutral'
    },
    { 
      id: 'jobs' as const, 
      labelId: 'Iklan Lowongan', 
      labelEn: 'Vacancy Ads', 
      icon: Briefcase, 
      badge: jobs.length,
      badgeType: 'neutral'
    },
    { 
      id: 'users' as const, 
      labelId: 'Sandi Keamanan', 
      labelEn: 'User Registry', 
      icon: Users, 
      badge: users.length,
      badgeType: 'neutral'
    },
    { 
      id: 'analytics' as const, 
      labelId: 'Metrik Sistem', 
      labelEn: 'System Metrics', 
      icon: BarChart3 
    },
    { 
      id: 'supabase' as const, 
      labelId: 'Koneksi Supabase', 
      labelEn: 'Supabase Sync', 
      icon: Database,
      isSpecial: true
    }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900/90 dark:bg-[#080a10]/95 text-slate-100 p-5 border-r border-slate-200/5 dark:border-slate-800/80 backdrop-blur-md">
      {/* Brand Header */}
      <div className="flex items-center gap-3 pb-5 border-b border-slate-200/5 dark:border-slate-800/60">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 shadow-lg shadow-indigo-505/10">
          <ShieldAlert className="h-5.5 w-5.5 text-white animate-pulse" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-sm tracking-tight text-white leading-none">
            TALENTRA
          </span>
          <span className="text-[9px] font-mono tracking-widest text-rose-500 font-medium uppercase mt-1">
            Staff Oversight
          </span>
        </div>
      </div>

      {/* Role Badge Indicator */}
      <div className="mt-4 p-3 bg-indigo-950/40 border border-indigo-500/15 rounded-xl flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping shrink-0" />
        <div className="min-w-0">
          <span className="text-[9px] font-mono font-black text-rose-400 tracking-wider block uppercase leading-none">
            System Administrator
          </span>
          <span className="text-[9px] font-medium text-indigo-300 mt-1 block truncate">
            {lang === 'id' ? 'Akses Kontrol Penuh' : 'Full Access Control'}
          </span>
        </div>
      </div>

      {/* Primary Sidebar Navigation Items */}
      <div className="flex-1 mt-6 space-y-6 overflow-y-auto no-scrollbar py-2">
        <div>
          <span className="text-[9px] font-mono font-extrabold text-slate-500 tracking-wider uppercase block mb-2.5 px-1">
            {lang === 'id' ? 'Menu Utama' : 'Oversight Menu'}
          </span>
          <div className="space-y-1">
            {menuConfig.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              const label = lang === 'id' ? item.labelId : item.labelEn;
              
              let activeClass = "bg-indigo-600/15 border border-indigo-500/20 text-indigo-200 shadow-inner";
              if (item.isSpecial && isActive) {
                activeClass = "bg-emerald-600/15 border border-emerald-500/25 text-emerald-300 shadow-inner";
              } else if (!isActive) {
                activeClass = "border border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40";
              }

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onActiveTabChange(item.id);
                    setIsOpenMobile(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer group ${activeClass}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <IconComponent className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive 
                        ? (item.isSpecial ? "text-emerald-405" : "text-indigo-400") 
                        : "text-slate-500 group-hover:text-amber-400"
                    }`} />
                    <span className="truncate">{label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full select-none ${
                      item.badgeType === 'danger'
                        ? 'bg-rose-500/20 text-rose-405 border border-rose-500/10'
                        : (isActive ? 'bg-indigo-550/25 text-indigo-300' : 'bg-slate-950/40 text-slate-500')
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Role Switcher (Sandbox Control) removed per user request */}
      </div>

      {/* Bottom Profile and Settings Section */}
      <div className="pt-4 border-t border-slate-200/5 dark:border-slate-800/80 space-y-4 shrink-0">
        {/* Theme and Language Utilities Row */}
        <div className="flex items-center justify-between gap-2">
          {/* Language Switch */}
          <button
            type="button"
            onClick={() => setLang(lang === 'en' ? 'id' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black bg-slate-950 border border-slate-800 text-slate-350 hover:border-slate-700 hover:bg-slate-900 transition-all font-mono cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-450" />
            <span>{lang === 'en' ? 'EN' : 'ID'}</span>
          </button>

          {/* Dark Mode Switch */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 hover:bg-slate-800/60 border border-slate-800 rounded-lg text-slate-350 transition-all cursor-pointer"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* User Card */}
        <div 
          onClick={onOpenProfile}
          className="flex items-center gap-3 p-2 border border-slate-800 rounded-xl bg-slate-950/20 hover:bg-slate-950/50 cursor-pointer group transition-all"
        >
          <img 
            src={activeUser.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150'} 
            alt={activeUser.name} 
            className="w-9 h-9 object-cover rounded-full border border-slate-850 group-hover:border-rose-500 transition-all shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white group-hover:text-rose-400 transition-colors truncate">
              {activeUser.name}
            </p>
            <p className="text-[9px] text-slate-450 truncate">
              {activeUser.email}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLogout();
            }}
            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Left Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-slate-900 border-r border-slate-200/5 dark:border-slate-800/80 select-none shrink-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Top Header (with Drawer Hamburger) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-rose-550/10 dark:border-slate-800/80 flex items-center justify-between px-4 z-40 shadow-md">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-rose-500 to-indigo-600 shadow-md">
            <ShieldAlert className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="font-extrabold text-xs tracking-tight text-white uppercase font-display">
            TALENTRA ADMIN
          </span>
        </div>

        <button
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
        >
          {isOpenMobile ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Spacer so content doesn't get hidden behind the mobile top fixed bar */}
      <div className="md:hidden h-16 w-full" />

      {/* Mobile Collapsible Sidebar Drawer overlay */}
      <AnimatePresence>
        {isOpenMobile && (
          <div className="fixed inset-0 z-50 md:hidden flex justify-start">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpenMobile(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-64 h-full"
            >
              <div className="h-full">
                {sidebarContent}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
