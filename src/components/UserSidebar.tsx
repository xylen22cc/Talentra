import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Sparkles, 
  MessageSquare, 
  Bell, 
  Globe, 
  Sun, 
  Moon, 
  LogOut, 
  Menu, 
  X, 
  HelpCircle, 
  CheckCircle2, 
  ShieldCheck,
  LayoutDashboard,
  Search,
  Megaphone,
  User as UserIcon,
  Users,
  Plus,
  Building
} from 'lucide-react';
import { User } from '../types';
import { useLanguage } from '../LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

interface UserSidebarProps {
  activeUser: User;
  currentPage: string;
  onNavigate: (page: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
  onOpenProfile: () => void;
  onOpenTutorial?: () => void;

  // Sub-tabs delegate
  seekerActiveTab?: 'overview' | 'recommendations' | 'tracker' | 'profile' | 'announcements';
  onSeekerActiveTabChange?: (tab: 'overview' | 'recommendations' | 'tracker' | 'profile' | 'announcements') => void;
  recruiterActiveTab?: 'applicants' | 'post-job' | 'announcements' | 'company-profile';
  onRecruiterActiveTabChange?: (tab: 'applicants' | 'post-job' | 'announcements' | 'company-profile') => void;
}

export default function UserSidebar({
  activeUser,
  currentPage,
  onNavigate,
  isDarkMode,
  onToggleTheme,
  onLogout,
  onOpenProfile,
  onOpenTutorial,
  seekerActiveTab = 'overview',
  onSeekerActiveTabChange,
  recruiterActiveTab = 'applicants',
  onRecruiterActiveTabChange
}: UserSidebarProps) {
  const { lang, setLang, t } = useLanguage();
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showNotifyMenu, setShowNotifyMenu] = useState(false);

  const [hasUnreadChats, setHasUnreadChats] = useState(false);
  const [acceptedApps, setAcceptedApps] = useState<any[]>([]);

  // Periodically check for unread chats
  useEffect(() => {
    const checkChats = async () => {
      try {
        const res = await fetch('/api/chats');
        if (res.ok) {
          const sessions = await res.json();
          const unread = sessions.some((s: any) => {
            const lastMsg = s.messages[s.messages.length - 1];
            return lastMsg && lastMsg.senderRole !== (activeUser.role === 'seeker' ? 'seeker' : 'recruiter');
          });
          setHasUnreadChats(unread);
        }
      } catch (e) {
        console.warn('Failed to fetch chats check in sidebar:', e);
      }
    };
    checkChats();
    const interval = setInterval(checkChats, 3000);
    return () => clearInterval(interval);
  }, [activeUser]);

  // Periodically fetch application status (for Seeker accepted notification)
  useEffect(() => {
    if (activeUser.role !== 'seeker') return;
    const fetchApplications = async () => {
      try {
        const res = await fetch('/api/applications');
        if (res.ok) {
          const apps = await res.json();
          const accepted = apps.filter((a: any) => a.applicantId === activeUser.id && a.status === 'accepted');
          setAcceptedApps(accepted);
        }
      } catch (e) {
        console.warn('Failed to fetch applications in sidebar:', e);
      }
    };
    fetchApplications();
    const interval = setInterval(fetchApplications, 4000);
    return () => clearInterval(interval);
  }, [activeUser]);

  const showUnreadDot = hasUnreadChats && currentPage !== 'chats';

  // Notification items constructed identically to original Navbar
  const dynamicNotifications = [
    ...acceptedApps.map((app) => ({
      id: `accepted-${app.id}`,
      title: lang === 'id' ? 'Lamaran Diterima! 🎉' : 'Application Accepted! 🎉',
      desc: lang === 'id' 
        ? `Selamat! Lamaran Anda untuk posisi ${app.applicantTitle} telah DITERIMA. Silakan cek kotak masuk Gmail Anda untuk langkah koordinasi wawancara berikutnya.` 
        : `Congratulations! Your application for ${app.applicantTitle} position is ACCEPTED. Please check your Gmail inbox for next steps and interview details.`,
      time: lang === 'id' ? 'Baru saja' : 'Just now',
      unread: true,
      type: 'system' as const
    })),
    {
      id: 1,
      title: lang === 'id' ? 'Analisis CV Selesai' : 'CV Analysis Complete',
      desc: lang === 'id' 
        ? 'Skor profil Anda meningkat menjadi 85% untuk pekerjaan Frontend Engineer.' 
        : 'Your profile score improved to 85% for Frontend Engineer jobs.',
      time: lang === 'id' ? 'Baru saja' : 'Just now',
      unread: true,
      type: 'ai' as const
    },
    {
      id: 2,
      title: lang === 'id' ? 'Postingan Penipuan Diblokir' : 'Scam Post Blocked',
      desc: lang === 'id' 
        ? 'Tim admin menandai "Remote Data Typist di ForexApex" karena permintaan biaya palsu.' 
        : 'Admin team flagged "Remote Data Typist at ForexApex" for fraudulent fee requests.',
      time: lang === 'id' ? '2 jam yang lalu' : '2 hours ago',
      unread: false,
      type: 'security' as const
    },
    {
      id: 3,
      title: lang === 'id' ? 'Undangan Wawancara' : 'Interview invitation',
      desc: lang === 'id' 
        ? 'Sarah Connor menjadwalkan babak penyaringan teknis Anda.' 
        : 'Sarah Connor scheduled your technical screening rounds.',
      time: lang === 'id' ? '1 hari yang lalu' : '1 day ago',
      unread: false,
      type: 'system' as const
    }
  ];

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setIsOpenMobile(false);
    setShowNotifyMenu(false);
  };

  const handleSubTabClick = (tabId: any) => {
    if (activeUser.role === 'seeker') {
      if (onSeekerActiveTabChange) onSeekerActiveTabChange(tabId);
    } else {
      if (onRecruiterActiveTabChange) onRecruiterActiveTabChange(tabId);
    }
    handleNavigate('dashboard');
  };

  const mainConfig = [
    {
      id: 'landing',
      labelHero: t('navbar.home'),
      icon: Briefcase,
      badge: null
    },
    {
      id: 'chats',
      labelHero: t('navbar.chats'),
      icon: MessageSquare,
      badge: showUnreadDot ? 'new' : null
    }
  ];

  // Seeker Dash Tabs
  const seekerMenuItems = [
    {
      id: 'overview' as const,
      labelId: 'Ringkasan',
      labelEn: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'recommendations' as const,
      labelId: 'Suapan Karir',
      labelEn: 'Careers Feed',
      icon: Search,
    },
    {
      id: 'tracker' as const,
      labelId: 'Pelacak Lamaran',
      labelEn: 'Applications Tracker',
      icon: CheckCircle2,
    },
    {
      id: 'announcements' as const,
      labelId: 'Papan Pengumuman',
      labelEn: 'Company Boards',
      icon: Megaphone,
    },
    {
      id: 'profile' as const,
      labelId: 'Detail Profil',
      labelEn: 'Profile Details',
      icon: UserIcon,
    }
  ];

  // Recruiter Dash Tabs
  const recruiterMenuItems = [
    {
      id: 'applicants' as const,
      labelId: 'Pelamar & Seleksi',
      labelEn: 'Applicants',
      icon: Users,
    },
    {
      id: 'post-job' as const,
      labelId: 'Pasang Lowongan',
      labelEn: 'Post Job Ad',
      icon: Plus,
    },
    {
      id: 'announcements' as const,
      labelId: 'Pengumuman Perusahaan',
      labelEn: 'Company Boards',
      icon: Megaphone,
    },
    {
      id: 'company-profile' as const,
      labelId: 'Profil Perusahaan',
      labelEn: 'Company Profile',
      icon: Building,
    }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-200/5 dark:border-slate-800/80 text-slate-100 p-5 backdrop-blur-md w-64">
      {/* Brand Header & Toggle Button */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-200/5 dark:border-slate-800/60">
        <div 
          onClick={() => handleNavigate('landing')}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/20">
            <Briefcase className="h-5.5 w-5.5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm tracking-tight text-white leading-none">
              TALENTRA
            </span>
            <span className="text-[9px] font-mono tracking-widest text-indigo-400 font-medium uppercase mt-1">
              AI SaaS Portal
            </span>
          </div>
        </div>
        
        {/* Collapse Toggle trigger for desktop */}
        <button
          onClick={() => setIsCollapsed(true)}
          className="hidden md:flex p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-all cursor-pointer"
          title={lang === 'id' ? 'Sembunyikan Menu' : 'Collapse Sidebar'}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Role Badge Indicator */}
      <div className="mt-4 p-3 bg-slate-950/45 border border-slate-800 rounded-xl flex items-center gap-2.5">
        <div className={`w-2 h-2 rounded-full ${activeUser.role === 'recruiter' ? 'bg-amber-500' : 'bg-indigo-500'} animate-none`} />
        <div className="min-w-0">
          <span className={`text-[9.5px] font-mono font-black ${activeUser.role === 'recruiter' ? 'text-amber-400' : 'text-indigo-400'} tracking-wider block uppercase leading-none`}>
            {activeUser.role === 'recruiter' 
              ? (lang === 'id' ? 'Mode Perekrut' : 'Recruiter Mode') 
              : (lang === 'id' ? 'Mode Pelamar' : 'Job Seeker Mode')}
          </span>
          <span className="text-[9px] font-medium text-slate-400 mt-1 block truncate">
            {activeUser.role === 'recruiter' ? 'Manage jobs & hires' : 'Explore vacancies'}
          </span>
        </div>
      </div>

      {/* Navigation section */}
      <div className="flex-1 mt-6 space-y-5 overflow-y-auto no-scrollbar py-2">
        {/* Section 1: Main pages */}
        <div>
          <span className="text-[9px] font-mono font-extrabold text-slate-500 tracking-wider uppercase block mb-2 px-1">
            {lang === 'id' ? 'Menu Utama' : 'Platform Menu'}
          </span>
          <div className="space-y-1">
            {mainConfig.map((item) => {
              const IconComponent = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer group ${
                    isActive 
                      ? "bg-indigo-600/15 border border-indigo-500/20 text-indigo-200 shadow-inner" 
                      : "border border-transparent text-slate-450 hover:text-white hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <IconComponent className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-indigo-400"
                    }`} />
                    <span className="truncate">{item.labelHero}</span>
                  </div>
                  {item.badge && (
                    <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse inline-block shadow-sm shadow-rose-500/50" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Dashboard/Sub-tabs pages based on role */}
        <div>
          <span className="text-[9px] font-mono font-extrabold text-slate-500 tracking-wider uppercase block mb-2 px-1">
            {activeUser.role === 'recruiter' 
              ? (lang === 'id' ? 'Menu Kelola' : 'Management Menu') 
              : (lang === 'id' ? 'Menu Portal' : 'Portal Dashboard')}
          </span>
          <div className="space-y-1">
            {activeUser.role === 'seeker' ? (
              seekerMenuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = currentPage === 'dashboard' && seekerActiveTab === item.id;
                const label = lang === 'id' ? item.labelId : item.labelEn;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSubTabClick(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer group ${
                      isActive 
                        ? "bg-indigo-605/15 bg-indigo-600/15 border border-indigo-500/20 text-indigo-200 shadow-inner" 
                        : "border border-transparent text-slate-450 hover:text-white hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <IconComponent className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? "text-indigo-405 text-indigo-400" : "text-slate-500 group-hover:text-indigo-405"
                      }`} />
                      <span className="truncate">{label}</span>
                    </div>
                  </button>
                );
              })
            ) : (
              recruiterMenuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = currentPage === 'dashboard' && recruiterActiveTab === item.id;
                const label = lang === 'id' ? item.labelId : item.labelEn;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSubTabClick(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer group ${
                      isActive 
                        ? "bg-amber-500/10 border border-amber-500/20 text-amber-200 shadow-inner" 
                        : "border border-transparent text-slate-450 hover:text-white hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <IconComponent className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? "text-amber-400" : "text-slate-500 group-hover:text-amber-400"
                      }`} />
                      <span className="truncate">{label}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Manual Tutorial walk-through guide banner if helper onOpenTutorial exists */}
        {onOpenTutorial && (
          <div className="pt-2 border-t border-slate-250/5 dark:border-slate-800/40">
            <button
              onClick={() => {
                onOpenTutorial();
                setIsOpenMobile(false);
              }}
              className="w-full flex items-center gap-2 py-2.5 px-3 bg-indigo-950/20 hover:bg-indigo-950/40 border border-indigo-500/10 rounded-xl transition-all text-xs font-bold text-indigo-300 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span className="text-left leading-snug">
                {lang === 'id' ? 'Panduan Interaktif' : 'Platform Guide'}
              </span>
            </button>
          </div>
        )}

        {/* Notifications list toggled directly inside sidebar to stay clean! */}
        <div className="pt-4 border-t border-slate-200/5 dark:border-slate-800/40">
          <button
            onClick={() => setShowNotifyMenu(!showNotifyMenu)}
            className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              showNotifyMenu 
                ? "bg-slate-800/80 text-white" 
                : "text-slate-450 hover:text-white hover:bg-slate-800/30"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-slate-500" />
              <span>{lang === 'id' ? 'Notifikasi' : 'Notifications'}</span>
            </div>
            {dynamicNotifications.some(n => n.unread) && (
              <span className="bg-indigo-505 bg-indigo-500 text-white font-mono text-[9px] font-black px-1.5 py-0.5 rounded-full">
                {dynamicNotifications.filter(n => n.unread).length}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifyMenu && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-2 space-y-1.5 bg-slate-950/40 p-1.5 rounded-xl border border-slate-850/60 max-h-48 overflow-y-auto no-scrollbar"
              >
                {dynamicNotifications.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => {
                      if (String(item.id).startsWith('accepted')) {
                        handleNavigate('chats');
                      }
                    }}
                    className="p-2 rounded-lg text-left bg-slate-900/40 border border-transparent hover:border-slate-800 hover:bg-slate-900/70 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-1">
                      {item.type === 'ai' && <Sparkles className="w-3 h-3 text-purple-400 shrink-0" />}
                      {item.type === 'security' && <ShieldCheck className="w-3 h-3 text-rose-400 shrink-0" />}
                      {item.type === 'system' && <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />}
                      <span className="text-[10px] font-bold text-slate-200 truncate leading-none">{item.title}</span>
                    </div>
                    <p className="text-[9.5px] text-slate-450 mt-1 line-clamp-2 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Profile and Settings Section */}
      <div className="pt-4 border-t border-slate-200/5 dark:border-slate-800/80 space-y-4 shrink-0">
        <div className="flex items-center justify-between gap-2">
          {/* Language Switch */}
          <button
            type="button"
            onClick={() => setLang(lang === 'en' ? 'id' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black bg-slate-950 border border-slate-800 text-slate-350 hover:border-slate-705 hover:bg-slate-900 transition-all font-mono cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-450" />
            <span>{lang === 'en' ? 'EN' : 'ID'}</span>
          </button>

          {/* Dark Mode Switch */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 hover:bg-slate-800/60 border border-slate-800 rounded-lg text-slate-355 transition-all cursor-pointer"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* User Profile Action item */}
        <div 
          onClick={onOpenProfile}
          className="flex items-center gap-3 p-2 border border-slate-800 rounded-xl bg-slate-955/20 hover:bg-slate-955/55 cursor-pointer group transition-all"
        >
          <img 
            src={activeUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
            alt={activeUser.name} 
            className="w-9 h-9 object-cover rounded-full border border-slate-850 group-hover:border-indigo-500 transition-all shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white group-hover:text-indigo-450 transition-colors truncate">
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
      {/* Desktop Toggle Button (Only visible when sidebar is collapsed on desktop) */}
      <AnimatePresence>
        {isCollapsed && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -10 }}
            onClick={() => setIsCollapsed(false)}
            className="hidden md:flex fixed top-4 left-4 z-40 h-10 w-10 items-center justify-center bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/10 cursor-pointer"
            title={lang === 'id' ? 'Tampilkan Menu' : 'Expand Sidebar'}
          >
            <Menu className="w-5 h-5 text-indigo-400" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Desktop Persistent Left Sidebar */}
      <aside className={`hidden md:flex flex-col h-screen sticky top-0 bg-slate-900 border-r border-slate-205/5 dark:border-slate-800/80 select-none shrink-0 z-30 transition-all duration-300 ${isCollapsed ? 'w-0 overflow-hidden border-r-0' : 'w-64'}`}>
        {sidebarContent}
      </aside>

      {/* Mobile Top Header (with Drawer Hamburger) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-indigo-500/10 flex items-center justify-between px-4 z-40 shadow-md">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-md">
            <Briefcase className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="font-extrabold text-xs tracking-tight text-white uppercase font-display">
            TALENTRA PORTAL
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
              exit={{ x: '-105%' }}
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
