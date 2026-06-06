import { Briefcase, Bell, CheckCircle2, User as UserIcon, ShieldCheck, Sparkles, LogOut, Moon, Sun, Menu, X, Globe, HelpCircle, MessageSquare, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { User } from '../types';
import { useLanguage } from '../LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  activeUser: User | null;
  onRoleChange: (role: User['role']) => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
  onOpenLogin: () => void;
  onOpenProfile?: () => void;
  onOpenTutorial?: () => void;
}

export default function Navbar({
  activeUser,
  onRoleChange,
  currentPage,
  onNavigate,
  isDarkMode,
  onToggleTheme,
  onLogout,
  onOpenLogin,
  onOpenProfile,
  onOpenTutorial
}: NavbarProps) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifyMenu, setShowNotifyMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { lang, setLang, t } = useLanguage();

  const [hasUnreadChats, setHasUnreadChats] = useState(false);
  const [acceptedApps, setAcceptedApps] = useState<any[]>([]);

  useEffect(() => {
    if (!activeUser) return;
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
        console.warn('Failed to fetch chats check:', e);
      }
    };
    checkChats();
    const interval = setInterval(checkChats, 3000);
    return () => clearInterval(interval);
  }, [activeUser]);

  useEffect(() => {
    if (!activeUser || activeUser.role !== 'seeker') return;
    const fetchApplications = async () => {
      try {
        const res = await fetch('/api/applications');
        if (res.ok) {
          const apps = await res.json();
          const accepted = apps.filter((a: any) => a.applicantId === activeUser.id && a.status === 'accepted');
          setAcceptedApps(accepted);
        }
      } catch (e) {
        console.warn('Failed to fetch applications for notifications:', e);
      }
    };
    fetchApplications();
    const interval = setInterval(fetchApplications, 4000);
    return () => clearInterval(interval);
  }, [activeUser]);

  const showUnreadDot = hasUnreadChats && currentPage !== 'chats';

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

  const handleMobileNavigate = (page: string) => {
    onNavigate(page);
    setShowMobileMenu(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-full mx-auto px-4 sm:px-8 md:px-12">
        <div className="relative flex h-16 items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleMobileNavigate('landing')}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-md shadow-indigo-500/20">
              <Briefcase className="h-5.5 w-5.5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white leading-none">
                TALENTRA
              </span>
              <span className="text-[10px] font-mono tracking-widest text-indigo-500 font-medium uppercase mt-0.5">
                AI SaaS Portal
              </span>
            </div>
          </div>

          {/* Desktop Navigation Items */}
          <nav className="hidden md:flex space-x-1 absolute left-1/2 -translate-x-1/2 transform">
            <button
              onClick={() => handleMobileNavigate('landing')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                currentPage === 'landing'
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20'
                  : 'text-slate-600 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              {t('navbar.home')}
            </button>
            <button
              onClick={() => handleMobileNavigate('dashboard')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                currentPage === 'dashboard'
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20'
                  : 'text-slate-600 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              {t('navbar.launchPlatform')}
            </button>

            {activeUser && (activeUser.role === 'seeker' || activeUser.role === 'recruiter') && (
              <button
                onClick={() => handleMobileNavigate('chats')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 flex items-center gap-1.5 relative ${
                  currentPage === 'chats'
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 font-semibold opacity-100'
                    : 'text-slate-600 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <span>{t('navbar.chats')}</span>
                {showUnreadDot && (
                  <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse inline-block shadow-sm shadow-rose-500/50" />
                )}
              </button>
            )}
          </nav>

          {/* Desktop Right Area Control Utilities */}
          <div className="hidden md:flex items-center gap-3">
            {activeUser ? (
              <>
                {/* Removed Sandbox Role Switcher */}

                {/* Language Switcher */}
                <button
                  type="button"
                  onClick={() => setLang(lang === 'en' ? 'id' : 'en')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-2xs font-black bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300/80 transition-all font-mono shadow-sm cursor-pointer"
                  title="Switch Language / Ganti Bahasa"
                >
                  <span>{lang === 'en' ? '🇺🇸 EN' : '🇮🇩 ID'}</span>
                </button>

                {/* Dark Mode Switcher */}
                <button
                  onClick={onToggleTheme}
                  className="p-2 rounded-lg text-slate-505 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Toggle dark mode"
                >
                  {isDarkMode ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5" />}
                </button>

                {/* Manual Onboarding Guide Trigger */}
                {onOpenTutorial && (
                  <button
                    onClick={onOpenTutorial}
                    className="p-2 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors cursor-pointer"
                    title={lang === 'id' ? 'Panduan Interaktif Penggunaan Portal' : 'Interactive Walkthrough Guide'}
                    id="navbar-tutorial-manual-trigger"
                  >
                    <HelpCircle className="w-4.5 h-4.5 animate-pulse" />
                  </button>
                )}

                {/* Notification Bell Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotifyMenu(!showNotifyMenu);
                      setShowRoleMenu(false);
                    }}
                    className="relative p-2 rounded-lg text-slate-555 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Bell className="w-4.5 h-4.5" />
                    {dynamicNotifications.some(n => n.unread) && (
                      <span className="absolute top-1 right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                      </span>
                    )}
                  </button>

                  {showNotifyMenu && (
                    <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-2 text-slate-800 dark:text-white shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-3 duration-150 z-50">
                      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-slate-900 mb-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Inbox Updates</span>
                        <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950/65 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-full font-medium">
                          {dynamicNotifications.filter(n => n.unread).length} {lang === 'id' ? 'Baru' : 'New'}
                        </span>
                      </div>
                      <div className="divide-y divide-slate-100 dark:divide-slate-900 max-h-[300px] overflow-y-auto">
                        {dynamicNotifications.map((item) => (
                          <div 
                            key={item.id} 
                            onClick={() => {
                              if (String(item.id).startsWith('accepted')) {
                                handleMobileNavigate('chats');
                              }
                              setShowNotifyMenu(false);
                            }}
                            className="p-3 text-left hover:bg-slate-55 dark:hover:bg-slate-900/40 rounded-lg transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-1.5">
                              {item.type === 'ai' && <Sparkles className="w-3.5 h-3.5 text-purple-500" />}
                              {item.type === 'security' && <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />}
                              {item.type === 'system' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                              <span className="text-xs font-semibold text-slate-905 dark:text-white leading-tight">{item.title}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">{item.desc}</p>
                            <span className="text-[9px] text-slate-450 mt-1.5 block font-mono">{item.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Avatar & Quick Actions */}
                <div 
                  onClick={onOpenProfile}
                  className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-3 group hover:opacity-95 transition-all select-none"
                  title={lang === 'id' ? 'Edit Profil Saya' : 'Edit My Profile'}
                >
                  <div className="relative cursor-pointer">
                    <img
                      src={activeUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                      alt={activeUser.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-800 group-hover:border-indigo-500 group-hover:ring-2 group-hover:ring-indigo-500/10 transition-all animate-none"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-indigo-505 border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center">
                      <div className="w-1 h-1 bg-white rounded-full animate-ping" />
                    </div>
                  </div>
                  <div className="hidden lg:flex flex-col text-left mr-1 cursor-pointer">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {activeUser.name}
                    </span>
                    <span className="text-[9px] text-slate-400 capitalize font-medium flex items-center gap-1 leading-none mt-0.5">
                      {activeUser.role}
                      <span className="text-[7.5px] bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-indigo-55 dark:group-hover:bg-indigo-950/50 group-hover:text-indigo-605 dark:group-hover:text-indigo-400 px-1 py-0.5 rounded font-mono transition-all">
                        {lang === 'id' ? 'Ubah' : 'Edit'}
                      </span>
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLogout();
                    }}
                    title="Sign Out"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all ml-1 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Dark Mode Switcher */}
                <button
                  onClick={onToggleTheme}
                  className="p-2 rounded-lg text-slate-505 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Toggle dark mode"
                >
                  {isDarkMode ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5" />}
                </button>

                {/* Elegant Sign In Button */}
                <button
                  onClick={onOpenLogin}
                  className="flex items-center gap-1.5 px-4.5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-750 active:scale-95 transition-all rounded-xl shadow-md cursor-pointer"
                >
                  <UserIcon className="w-4 h-4" /> Sign In / Register
                </button>
              </>
            )}
          </div>

          {/* Mobile Navigation controls & triggers */}
          <div className="flex md:hidden items-center gap-2">
            {/* Quick Toggle Dark Mode on Mobile too */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-lg text-slate-605 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              aria-label="Toggle Menu"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Beautiful Mobile Menu Drawer Panel with AnimatePresence */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 overflow-hidden"
          >
            <div className="px-4 py-5 space-y-5 text-left max-h-[85vh] overflow-y-auto">
              
              {/* Profile card if active user */}
              {activeUser && (
                <div 
                  onClick={() => {
                    if (onOpenProfile) onOpenProfile();
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/50 cursor-pointer"
                >
                  <img
                    src={activeUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                    alt={activeUser.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-900 dark:text-white truncate">{activeUser.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize flex items-center gap-1.5 mt-0.5">
                      <span>{activeUser.role} mode</span>
                      <span className="text-[8px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-1 py-0.2 rounded font-mono font-bold">
                        {lang === 'id' ? 'BUKA PROFIL' : 'EDIT PROFILE'}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {/* Main routing buttons */}
              <div className="flex flex-col gap-1">
                <p className="text-[9px] font-mono font-extrabold text-slate-400 dark:text-slate-500 tracking-wider uppercase mb-1">
                  {lang === 'id' ? 'Navigasi Portal' : 'Portal Navigation'}
                </p>
                <button
                  onClick={() => handleMobileNavigate('landing')}
                  className={`w-full text-left px-4 py-3 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors ${
                    currentPage === 'landing'
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 font-extrabold'
                      : 'text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Briefcase className="w-4 h-4" /> {t('navbar.home')}
                </button>
                <button
                  onClick={() => handleMobileNavigate('dashboard')}
                  className={`w-full text-left px-4 py-3 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors ${
                    currentPage === 'dashboard'
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 font-extrabold'
                      : 'text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Sparkles className="w-4 h-4" /> {t('navbar.launchPlatform')}
                </button>

                {activeUser && (activeUser.role === 'seeker' || activeUser.role === 'recruiter') && (
                  <button
                    onClick={() => handleMobileNavigate('chats')}
                    className={`w-full text-left px-4 py-3 text-xs font-bold rounded-xl flex items-center justify-between transition-colors ${
                      currentPage === 'chats'
                        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 font-extrabold'
                        : 'text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-emerald-500" />
                      <span>{t('navbar.chats')}</span>
                    </div>
                    {showUnreadDot && (
                      <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse shadow-sm shadow-rose-500/50" />
                    )}
                  </button>
                )}

                {onOpenTutorial && (
                  <button
                    onClick={() => {
                      onOpenTutorial();
                      setShowMobileMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 text-xs font-bold rounded-xl flex items-center gap-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/15 hover:bg-indigo-50 dark:hover:bg-indigo-950/35 transition-colors cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 animate-pulse" /> {lang === 'id' ? 'Buka Panduan Penggunaan (Tutorial)' : 'Interactive Walkthrough Guide'}
                  </button>
                )}
              </div>

              {/* Mobile Role Switcher (ActiveUser) */}
              {activeUser && (
                <div className="space-y-2">
                  <p className="text-[9px] font-mono font-extrabold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                    {lang === 'id' ? 'Ganti Peran' : 'Role Control'}
                  </p>
                  
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200/20 dark:border-slate-800/55">
                    <button
                      onClick={() => {
                        onRoleChange('seeker');
                        handleMobileNavigate('dashboard');
                      }}
                      className={`py-2 text-[10px] font-extrabold rounded-lg ${
                        activeUser.role === 'seeker'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      {lang === 'id' ? 'Pelamar' : 'Seeker'}
                    </button>
                    <button
                      onClick={() => {
                        onRoleChange('recruiter');
                        handleMobileNavigate('dashboard');
                      }}
                      className={`py-2 text-[10px] font-extrabold rounded-lg ${
                        activeUser.role === 'recruiter'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      {lang === 'id' ? 'Perekrut' : 'Recruiter'}
                    </button>
                    <button
                      onClick={() => {
                        onRoleChange('admin');
                        handleMobileNavigate('dashboard');
                      }}
                      className={`py-2 text-[10px] font-extrabold rounded-lg ${
                        activeUser.role === 'admin'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      Admin
                    </button>
                  </div>
                </div>
              )}

              {/* Utility Tools */}
              <div className="space-y-2 pt-2 border-t border-slate-150 dark:border-slate-800/50">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500">
                    {lang === 'id' ? 'PILIH BAHASA' : 'CHOOSE LANGUAGE'}
                  </span>
                  
                  <button
                    type="button"
                    onClick={() => setLang(lang === 'en' ? 'id' : 'en')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-2xs font-extrabold bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-905 transition-colors font-mono cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{lang === 'en' ? '🇺🇸 ENGLISH' : '🇮🇩 BAHASA ID'}</span>
                  </button>
                </div>
              </div>

              {/* Notifications Inbox for mobile */}
              {activeUser && (
                <div className="border-t border-slate-150 dark:border-slate-800/50 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500">INBOX NOTIFICATIONS</span>
                    <span className="text-[9px] bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.2 rounded font-bold">
                      {dynamicNotifications.filter(n => n.unread).length} {lang === 'id' ? 'BARU' : 'NEW'}
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {dynamicNotifications.map(item => (
                      <div 
                        key={item.id} 
                        onClick={() => {
                          if (String(item.id).startsWith('accepted')) {
                            handleMobileNavigate('chats');
                          }
                        }}
                        className="p-2 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-100 dark:border-slate-900/60 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900/60"
                      >
                        <div className="flex items-center gap-1">
                          {item.type === 'ai' && <Sparkles className="w-3 h-3 text-purple-500" />}
                          {item.type === 'security' && <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />}
                          {item.type === 'system' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                          <span className="text-2xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{item.title}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal mt-0.5">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Authentic Action button - Sign In / Logout */}
              <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
                {activeUser ? (
                  <button
                    onClick={() => {
                      onLogout();
                      setShowMobileMenu(false);
                    }}
                    className="w-full py-3 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> {lang === 'id' ? 'Keluar Aplikasi' : 'Sign Out Account'}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onOpenLogin();
                      setShowMobileMenu(false);
                    }}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
                  >
                    <UserIcon className="w-4 h-4" /> Sign In / Register
                  </button>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
