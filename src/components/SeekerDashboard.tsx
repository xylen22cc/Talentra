import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, Calendar, CheckCircle2, Bookmark, User as UserIcon, Tag, Trash2, Edit2, ShieldAlert, BadgeInfo, HelpCircle, HelpCircle as HelpIcon, ArrowRight, LayoutDashboard, Plus, Lock, Globe, BadgeCheck, Sparkles, Languages, RefreshCw, UploadCloud, FileText, Image as ImageIcon, Phone, Linkedin, Github, Twitter, Instagram } from 'lucide-react';
import { Job, JobSeekerProfile, Application, Company, CompanyAnnouncement, User } from '../types';
import { useLanguage } from '../LanguageContext';

interface SeekerDashboardProps {
  jobs: Job[];
  companies: Company[];
  profile: JobSeekerProfile;
  applications: Application[];
  announcements?: CompanyAnnouncement[];
  initialSearchQuery?: string;
  initialLocationQuery?: string;
  initialJobType?: string;
  onClearSearchFilters?: () => void;
  onUpdateProfile: (p: JobSeekerProfile) => void;
  onApply: (jobId: string, anonymous: boolean) => Promise<void>;
  onSelectJob: (job: Job) => void;
  onNavigateToTab: (tab: string) => void;
  activeUser?: User | null;
  onOpenProfileModal?: () => void;
  activeTab?: 'overview' | 'recommendations' | 'tracker' | 'profile' | 'announcements';
  onActiveTabChange?: (tab: 'overview' | 'recommendations' | 'tracker' | 'profile' | 'announcements') => void;
}

export default function SeekerDashboard({
  jobs,
  companies,
  profile,
  applications,
  announcements = [],
  initialSearchQuery = '',
  initialLocationQuery = '',
  initialJobType = 'All',
  onClearSearchFilters,
  onUpdateProfile,
  onApply,
  onSelectJob,
  onNavigateToTab,
  activeUser,
  onOpenProfileModal,
  activeTab: propActiveTab,
  onActiveTabChange: propOnActiveTabChange
}: SeekerDashboardProps) {
  const { t, lang } = useLanguage();
  const [internalActiveTab, setInternalActiveTab] = useState<'overview' | 'recommendations' | 'tracker' | 'profile' | 'announcements'>(
    (initialSearchQuery || initialLocationQuery || initialJobType !== 'All') ? 'recommendations' : 'overview'
  );
  
  const activeTab = propActiveTab || internalActiveTab;
  const setActiveTab = propOnActiveTabChange || setInternalActiveTab;

  const [anonymousApply, setAnonymousApply] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [activityPage, setActivityPage] = useState(1);
  const [recommendationsPage, setRecommendationsPage] = useState(1);

  // States for announcement translations
  const [translatedAnnouncements, setTranslatedAnnouncements] = useState<Record<string, { title: string; content: string; lang: 'en' | 'id' }>>({});
  const [translatingIds, setTranslatingIds] = useState<Record<string, boolean>>({});

  const handleTranslateAnnouncement = async (id: string, title: string, content: string) => {
    const targetLang = lang === 'id' ? 'id' : 'en';
    
    // Toggle back if already translated to the target lang
    if (translatedAnnouncements[id] && translatedAnnouncements[id].lang === targetLang) {
      const updated = { ...translatedAnnouncements };
      delete updated[id];
      setTranslatedAnnouncements(updated);
      return;
    }

    setTranslatingIds(prev => ({ ...prev, [id]: true }));
    try {
      const response = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, targetLang })
      });
      if (response.ok) {
        const data = await response.json();
        setTranslatedAnnouncements(prev => ({
          ...prev,
          [id]: { title: data.title, content: data.content, lang: targetLang }
        }));
      }
    } catch (err) {
      console.error('Translation failed:', err);
    } finally {
      setTranslatingIds(prev => ({ ...prev, [id]: false }));
    }
  };
  
  // Local state for dashboard-level search & filter adjustments
  const [dashSearch, setDashSearch] = useState(initialSearchQuery);
  const [dashLocation, setDashLocation] = useState(initialLocationQuery);
  const [dashJobType, setDashJobType] = useState(initialJobType);

  // Sync state if props change from outside (e.g. repetitive home searching)
  useEffect(() => {
    setDashSearch(initialSearchQuery);
  }, [initialSearchQuery]);

  useEffect(() => {
    setDashLocation(initialLocationQuery);
  }, [initialLocationQuery]);

  useEffect(() => {
    setDashJobType(initialJobType);
  }, [initialJobType]);

  // Reset recommendations page on filter change
  useEffect(() => {
    setRecommendationsPage(1);
  }, [dashSearch, dashLocation, dashJobType]);

  // If initial values indicate search, make sure recommendations tab opens
  useEffect(() => {
    if (initialSearchQuery || initialLocationQuery || initialJobType !== 'All') {
      setActiveTab('recommendations');
    }
  }, [initialSearchQuery, initialLocationQuery, initialJobType]);

  // Local state for editing profile fields
  const [bio, setBio] = useState(profile.bio);
  const [title, setTitle] = useState(profile.title);
  const [cvText, setCvText] = useState(profile.cvText || '');
  const [cvFile, setCvFile] = useState<{ name: string; type: string; dataUrl: string; size?: number } | undefined>(profile.cvFile);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  // Sync state if prop changes
  useEffect(() => {
    setBio(profile.bio);
    setTitle(profile.title);
    setCvText(profile.cvText || '');
    setCvFile(profile.cvFile);
  }, [profile]);

  // Handle Profile Update
  const handleSaveProfile = (updatedCvFile = cvFile) => {
    onUpdateProfile({
      ...profile,
      bio,
      title,
      cvText,
      cvFile: updatedCvFile
    });
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processUploadedFile(files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processUploadedFile(files[0]);
    }
  };

  const processUploadedFile = async (file: File) => {
    // Check file types (PDF or Images)
    const isValidType = file.type === 'application/pdf' || file.type.startsWith('image/');
    if (!isValidType) {
      alert(lang === 'id' ? 'Format file tidak didukung! Unggah file gambar atau PDF.' : 'Unsupported file format! Please upload an image or PDF file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      const filePayload = {
        name: file.name,
        type: file.type,
        dataUrl,
        size: Math.round(file.size / 1024) // KB
      };
      
      setCvFile(filePayload);
      
      // Automatically trigger Gemini file parsing to extract profile details
      setIsParsing(true);
      try {
        const response = await fetch('/api/ai/parse-cv-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl, filename: file.name })
        });
        if (response.ok) {
          const parsed = await response.json();
          // Update profile fields with extracted information
          setTitle(parsed.title);
          setBio(parsed.bio);
          setCvText(parsed.cvText);
          
          // Also sync skills
          if (parsed.skills && parsed.skills.length > 0) {
            onUpdateProfile({
              ...profile,
              title: parsed.title,
              bio: parsed.bio,
              cvText: parsed.cvText,
              skills: parsed.skills,
              cvFile: filePayload
            });
          } else {
            handleSaveProfile(filePayload);
          }
        } else {
          handleSaveProfile(filePayload);
        }
      } catch (err) {
        console.error('Error parsing file via AI:', err);
        handleSaveProfile(filePayload);
      } finally {
        setIsParsing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setCvFile(undefined);
    handleSaveProfile(undefined);
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      onUpdateProfile({
        ...profile,
        skills: [...profile.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    onUpdateProfile({
      ...profile,
      skills: profile.skills.filter(s => s !== skillToRemove)
    });
  };

  // Stats Counters
  const pendingApps = applications.filter(a => a.status === 'pending').length;
  const interviewApps = applications.filter(a => a.status === 'interview').length;
  const totalApps = applications.length;

  // Smart matching algorithm based on skills tag overlap
  const getMatchScore = (job: Job) => {
    if (!job.skillsRequired || job.skillsRequired.length === 0) return 60;
    const commonSkills = job.skillsRequired.filter(s => 
      profile.skills.some(userSkill => userSkill.toLowerCase() === s.toLowerCase())
    );
    return Math.round((commonSkills.length / job.skillsRequired.length) * 100);
  };

  return (
    <div className="max-w-full mx-auto px-4 sm:px-8 md:px-12 py-8">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="text-left">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {lang === 'id' ? 'Dashboard Pelamar' : 'Applicant Suite'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'id' 
              ? 'Bangun profil Anda, dapatkan verifikasi lolos saringan loker palsu, dan latih sesi wawancara AI.' 
              : 'Build your brand, secure verification, and launch mock sessions.'}
          </p>
        </div>

        {/* Dashboard sub-navigation tabs */}
        {!propActiveTab && (
          <div className="flex flex-wrap bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl gap-0.5 self-start">
            {([
              { id: 'overview', label: lang === 'id' ? 'Ringkasan' : 'Overview' },
              { id: 'recommendations', label: lang === 'id' ? 'Suapan Karir' : 'Careers Feed' },
              { id: 'tracker', label: lang === 'id' ? 'Pelacak Lamaran' : 'Applications Tracker' },
              { id: 'announcements', label: lang === 'id' ? 'Papan Pengumuman' : 'Company Boards & News' },
              { id: 'profile', label: lang === 'id' ? 'Detail Profil' : 'Profile Details' }
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg uppercase tracking-wide transition-all ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Main Tab Body Contents */}
      <div className="mt-8">
        <AnimatePresence mode="wait">
          
          {/* A. OVERVIEW MODULE */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* Core Aggregated Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                
                <div className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 text-left">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold">
                    {lang === 'id' ? 'Lamaran Terkirim' : 'Applications Sent'}
                  </span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{totalApps}</span>
                    <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      {lang === 'id' ? 'Pelacak aktif' : 'Active tracker'}
                    </span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 text-left">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold">
                    {lang === 'id' ? 'Dalam Peninjauan' : 'Under Review'}
                  </span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{pendingApps}</span>
                    <span className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-full">
                      {lang === 'id' ? 'Menunggu HR' : 'Pending HR'}
                    </span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 text-left">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold">
                    {lang === 'id' ? 'Wawancara Terjadwal' : 'Interviews Booked'}
                  </span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-3xl font-extrabold text-slate-950 dark:text-white">{interviewApps}</span>
                    <span className="text-xs font-semibold text-violet-500 bg-violet-500/10 px-2 py-0.5 rounded-full">
                      {lang === 'id' ? 'Simulasi aktif' : 'Sim active'}
                    </span>
                  </div>
                </div>

                {/* AI Scorecard indicator */}
                <div className="bg-gradient-to-br from-[#0c1024] to-[#1e1451] p-5 rounded-2xl border border-indigo-505/30 text-left relative overflow-hidden flex flex-col justify-between shadow-md">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#a5b4fc] font-black">
                      {lang === 'id' ? 'Skor Penilaian Resume' : 'Resume rating score'}
                    </span>
                    <p className="text-3xl font-black text-white mt-1">85%</p>
                  </div>
                  <button
                    onClick={() => onNavigateToTab('analyzer')}
                    className="mt-4 w-full flex items-center justify-between px-3 py-2 rounded-xl bg-indigo-605 hover:bg-indigo-600 text-white font-extrabold text-[11px] transition-all shadow-sm border border-indigo-400/30 group cursor-pointer"
                  >
                    <span>{lang === 'id' ? 'Analisis celah' : 'Analyze gaps'}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 text-white" />
                  </button>
                </div>

              </div>

              {/* Lower Section: Recommendations and Simulator CTA */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Visual Highlights list */}
                <div className="lg:col-span-8 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 text-left">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Briefcase className="w-4.5 h-4.5 text-indigo-500" /> {lang === 'id' ? 'Log Aktivitas Terbaru' : 'Recent Activity Log'}
                  </h3>
                  
                  {applications.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      {lang === 'id' ? 'Belum ada lamaran tercatat. Mulailah mencari lowongan!' : 'No applications recorded yet. Start exploring jobs!'}
                    </div>
                  ) : (
                    <div className="mt-5 space-y-4">
                      {(() => {
                        const itemsPerPage = 5;
                        const totalActivityPages = Math.ceil(applications.length / itemsPerPage);
                        const currentActivityPage = Math.min(activityPage, totalActivityPages || 1);
                        const paginatedApps = applications.slice((currentActivityPage - 1) * itemsPerPage, currentActivityPage * itemsPerPage);

                        return (
                          <>
                            <div className="space-y-3.5">
                              {paginatedApps.map(app => {
                                const associatedJob = jobs.find(j => j.id === app.jobId);
                                return (
                                  <div key={app.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-900/60 transition-all hover:border-indigo-200 dark:hover:border-indigo-900">
                                    <div className="flex items-center gap-3 text-left">
                                      <img
                                        src={associatedJob?.companyLogo || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=100&auto=format&fit=crop&q=60'}
                                        alt="logo"
                                        className="w-9 h-9 rounded-lg object-cover"
                                      />
                                      <div>
                                        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                                          {associatedJob?.title}
                                        </h4>
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                                          {associatedJob?.companyName}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                        app.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-500' :
                                        app.status === 'rejected' ? 'bg-rose-500/10 text-rose-500' :
                                        app.status === 'interview' ? 'bg-indigo-550/10 text-indigo-600' :
                                        'bg-amber-500/10 text-amber-500'
                                      }`}>
                                        {app.status}
                                      </span>
                                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono hidden sm:inline">
                                        {new Date(app.appliedAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Pagination row matching requested style exactly */}
                            {totalActivityPages > 1 && (
                              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                                <div className="flex items-center gap-2">
                                  {Array.from({ length: totalActivityPages }, (_, i) => i + 1).map((pg) => {
                                    const isCurrent = pg === currentActivityPage;
                                    return (
                                      <button
                                        key={pg}
                                        onClick={() => setActivityPage(pg)}
                                        className={`px-2.5 py-1 text-xs font-bold font-sans transition-all rounded-md cursor-pointer ${
                                          isCurrent
                                            ? 'text-slate-900 dark:text-white bg-slate-200/60 dark:bg-white/10 scale-105 border-b-2 border-slate-900 dark:border-white pb-0.5 font-bold'
                                            : 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-medium'
                                        }`}
                                      >
                                        {pg}
                                      </button>
                                    );
                                  })}
                                </div>

                                {currentActivityPage < totalActivityPages && (
                                  <button
                                    onClick={() => setActivityPage(prev => prev + 1)}
                                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors flex items-center gap-1 cursor-pointer"
                                  >
                                    {lang === 'id' ? 'Berikutnya' : 'Next'} &rarr;
                                  </button>
                                )}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Arena quick CTA cards */}
                <div className="lg:col-span-4 space-y-5">
                  <div className="p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/20 text-left">
                    <h4 className="text-xs font-black text-indigo-900 dark:text-indigo-200">
                      {lang === 'id' ? 'Bersiap Wawancara?' : 'Prepping for Interviews?'}
                    </h4>
                    <p className="text-2xs text-indigo-700/80 dark:text-indigo-400 leading-normal mt-2">
                      {lang === 'id'
                        ? 'Berlatihlah dengan bot simulasi kustom kami. Susun argumen di bawah Manajer Rekayasa yang kritis.'
                        : 'Engage with our custom simulation bot. Formulate arguments under critical Engineering Managers.'}
                    </p>
                    <button
                      onClick={() => onNavigateToTab('simulator')}
                      className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                    >
                      {lang === 'id' ? 'Mulai Simulasi Arena' : 'Start Arena Simulation'} <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-5 rounded-2xl border border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/10 text-left">
                    <h4 className="text-xs font-black text-purple-900 dark:text-purple-200">
                      {lang === 'id' ? 'Rekrutmen Anti-Bias' : 'Anti-Bias Hiring'}
                    </h4>
                    <p className="text-2xs text-purple-700/80 dark:text-purple-400 leading-normal mt-2">
                      {lang === 'id'
                        ? 'Saat melamar, pilih Lamar Anonim untuk menyembunyikan metadata (nama, foto) dari perekrut selama penyaringan.'
                        : 'When applying, choose Anonymous Apply to hide metadata (name, photo) from recruiters during screening.'}
                    </p>
                    <div className="flex items-center gap-2 mt-4">
                      <input
                        type="checkbox"
                        id="anon-mode"
                        checked={anonymousApply}
                        onChange={(e) => setAnonymousApply(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 border-slate-200 rounded focus:ring-indigo-500"
                      />
                      <label htmlFor="anon-mode" className="text-2xs font-bold text-purple-800 dark:text-purple-350 cursor-pointer">
                        {lang === 'id' ? 'Aktifkan Lamar Anonim' : 'Enable Anonymous Apply'}
                      </label>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* B. RECOMMENDATIONS TABLE */}
          {activeTab === 'recommendations' && (() => {
            const searchStr = typeof dashSearch === 'string' ? dashSearch.trim().toLowerCase() : '';
            const locationStr = typeof dashLocation === 'string' ? dashLocation.trim().toLowerCase() : '';
            const jobTypeStr = typeof dashJobType === 'string' ? dashJobType : 'All';

            const filteredAndApprovedJobs = jobs
              .filter(j => j.status === 'approved')
              .filter(job => {
                const matchesSearch = !searchStr || 
                                      (job.title && job.title.toLowerCase().includes(searchStr)) || 
                                      (job.skillsRequired && job.skillsRequired.some(s => s.toLowerCase().includes(searchStr))) ||
                                      (job.companyName && job.companyName.toLowerCase().includes(searchStr));
                const matchesLocation = !locationStr || 
                                        (job.location && job.location.toLowerCase().includes(locationStr));
                const matchesType = jobTypeStr === 'All' || job.jobType === jobTypeStr;
                return matchesSearch && matchesLocation && matchesType;
              });

            return (
              <motion.div
                key="recommendations"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6 text-left"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-900 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {lang === 'id' ? 'Rekomendasi Kecocokan Cerdas' : 'Smart Match Recommendations'}
                    </h3>
                    <p className="text-2xs text-slate-550 dark:text-slate-400 leading-normal">
                      {lang === 'id'
                        ? 'AI membandingkan keahlian profil Anda yang tersimpan '
                        : 'AI compares stored profile skills '}
                      <span className="text-indigo-505 font-bold font-mono">({profile.skills.join(', ')})</span>
                      {lang === 'id'
                        ? ' dengan daftar lowongan aktif.'
                        : ' against active job listings.'}
                    </p>
                  </div>
                  
                  {/* Clear button if filters exist */}
                  {(dashSearch || dashLocation || dashJobType !== 'All') && (
                    <button
                      type="button"
                      onClick={() => {
                        setDashSearch('');
                        setDashLocation('');
                        setDashJobType('All');
                        if (onClearSearchFilters) onClearSearchFilters();
                      }}
                      className="text-2xs font-bold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      Reset Filter Pencarian
                    </button>
                  )}
                </div>

                {/* Dashboard-level search filter controller */}
                <div className="sticky top-[68px] z-30 p-4 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md rounded-xl border border-slate-200/80 dark:border-slate-800/80 grid grid-cols-1 md:grid-cols-12 gap-4 items-end shadow-md transition-all duration-200">
                  <div className="md:col-span-5 text-left">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      {lang === 'id' ? 'Nama Lowongan / Perusahaan' : 'Job Title / Company'}
                    </label>
                    <input
                      type="text"
                      value={dashSearch}
                      placeholder="Cari kata kunci, React, Golang..."
                      onChange={(e) => setDashSearch(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 text-xs rounded-lg border border-slate-205 dark:border-slate-805 text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="md:col-span-4 text-left">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      {lang === 'id' ? 'Lokasi / Remote' : 'Location / Remote'}
                    </label>
                    <input
                      type="text"
                      value={dashLocation}
                      placeholder="Tulis kota atau remote..."
                      onChange={(e) => setDashLocation(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 text-xs rounded-lg border border-slate-205 dark:border-slate-805 text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="md:col-span-3 text-left font-medium">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      {lang === 'id' ? 'Tipe Pekerjaan' : 'Job Type'}
                    </label>
                    <select
                      value={dashJobType}
                      onChange={(e) => setDashJobType(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-[#0c1020] text-xs rounded-lg border border-slate-205 dark:border-slate-805 text-slate-800 dark:text-white focus:outline-none focus:border-indigo-505"
                    >
                      <option value="All">{lang === 'id' ? 'Semua Tipe Pekerjaan' : 'All Job Types'}</option>
                      <option value="Full-time">{lang === 'id' ? 'Waktu Penuh' : 'Full-time'}</option>
                      <option value="Part-time">{lang === 'id' ? 'Paruh Waktu' : 'Part-time'}</option>
                      <option value="Contract">{lang === 'id' ? 'Kontrak' : 'Contract'}</option>
                      <option value="Remote">{lang === 'id' ? 'Remote' : 'Remote'}</option>
                      <option value="Internship">{lang === 'id' ? 'Magang' : 'Internship'}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredAndApprovedJobs.slice((recommendationsPage - 1) * 4, recommendationsPage * 4).map(job => {
                    const score = getMatchScore(job);
                    const isAlreadyApplied = applications.some(a => a.jobId === job.id);

                    return (
                      <div key={job.id} className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
                      <div>
                        {/* Company bar */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <img src={job.companyLogo} alt="" className="w-8 h-8 rounded-lg object-cover" />
                            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-300 leading-none">{job.companyName}</span>
                          </div>

                          <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-lg">
                            <Tag className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="text-2xs font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">{score}% Match</span>
                          </div>
                        </div>

                        {/* Title and requirements checklist */}
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-4">{job.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">{job.description}</p>
                        
                        <div className="mt-4 space-y-1.5">
                          <p className="text-[10px] font-mono font-bold text-slate-400">
                            {lang === 'id' ? 'Elemen Keahlian yang Dibutuhkan:' : 'Required Skill Elements:'}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {job.skillsRequired.map(skill => {
                              const matches = profile.skills.some(s => s.toLowerCase() === skill.toLowerCase());
                              return (
                                <span
                                  key={skill}
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-0.5 ${
                                    matches
                                      ? 'bg-emerald-500/10 text-emerald-500'
                                      : 'bg-slate-100 dark:bg-slate-800/85 text-slate-550 dark:text-slate-400'
                                  }`}
                                >
                                  {skill}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Apply button */}
                      <div className="mt-6 border-t border-slate-100 dark:border-slate-900 pt-4 flex items-center justify-between">
                        <span className="text-2xs font-mono font-bold text-slate-500">{job.location} • {job.salaryRange}</span>
                        
                        <button
                          disabled={isAlreadyApplied}
                          onClick={() => onApply(job.id, anonymousApply)}
                          className={`px-4 py-2 text-2xs font-extrabold rounded-lg transition-all ${
                            isAlreadyApplied
                              ? 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 cursor-not-allowed'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          }`}
                        >
                          {isAlreadyApplied ? (lang === 'id' ? 'Sudah Dilamar' : 'Applied') : (lang === 'id' ? 'Lamar 1-Klik' : '1-Click Apply')}
                        </button>
                      </div>
                    </div>
                  );
                })}
                {filteredAndApprovedJobs.length === 0 && (
                  <div className="col-span-1 md:col-span-2 text-center py-12 bg-white dark:bg-slate-900/10 border border-slate-200/60 dark:border-slate-800/60 p-10 rounded-2xl w-full">
                    <p className="text-xs text-slate-550 dark:text-slate-400 font-bold">Tidak ada lowongan kerja yang cocok dengan filter pencarian Anda.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Silakan coba kata kunci lain atau bersihkan filter di atas.</p>
                  </div>
                )}
              </div>

              {/* Pagination matching exactly requested layout & white color scheme selection */}
              {(() => {
                const totalPages = Math.ceil(filteredAndApprovedJobs.length / 4);
                if (totalPages <= 1) return null;

                let startPage = Math.max(1, recommendationsPage - 2);
                let endPage = Math.min(totalPages, startPage + 4);
                if (endPage - startPage < 4) {
                  startPage = Math.max(1, endPage - 4);
                }

                return (
                  <div className="flex items-center justify-center gap-3 mt-8 pt-5 border-t border-slate-150 dark:border-slate-800/60 flex-wrap">
                    {/* Previous button if not on page 1 */}
                    {recommendationsPage > 1 && (
                      <button
                        onClick={() => setRecommendationsPage(prev => prev - 1)}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors mr-2 cursor-pointer"
                      >
                        &larr; {lang === 'id' ? 'Sebelumnya' : 'Prev'}
                      </button>
                    )}

                    {/* Display first page and ellipsis if we skipped */}
                    {startPage > 1 && (
                      <>
                        <button
                          onClick={() => setRecommendationsPage(1)}
                          className="px-2.5 py-1 text-xs font-bold font-sans transition-all rounded-md cursor-pointer text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-medium"
                        >
                          1
                        </button>
                        {startPage > 2 && (
                          <span className="text-slate-400 dark:text-slate-600 text-xs px-1 select-none">...</span>
                        )}
                      </>
                    )}

                    {/* Display up to 5 page numbers */}
                    {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((pg) => {
                      const isCurrent = pg === recommendationsPage;
                      return (
                        <button
                          key={pg}
                          onClick={() => setRecommendationsPage(pg)}
                          className={`px-2.5 py-1 text-xs font-bold font-sans transition-all rounded-md cursor-pointer ${
                            isCurrent
                              ? 'text-slate-900 dark:text-white bg-slate-200/60 dark:bg-white/10 scale-105 border-b-2 border-slate-900 dark:border-white pb-0.5 font-bold'
                              : 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-medium'
                          }`}
                        >
                          {pg}
                        </button>
                      );
                    })}

                    {/* Ellipsis and last page at the end if truncated */}
                    {endPage < totalPages && (
                      <>
                        {endPage < totalPages - 1 && (
                          <span className="text-slate-400 dark:text-slate-600 text-xs px-1 select-none">...</span>
                        )}
                        <button
                          onClick={() => setRecommendationsPage(totalPages)}
                          className="px-2.5 py-1 text-xs font-bold font-sans transition-all rounded-md cursor-pointer text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-medium"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}

                    {/* Next button if not on last page */}
                    {recommendationsPage < totalPages && (
                      <button
                        onClick={() => setRecommendationsPage(prev => prev + 1)}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors ml-2 flex items-center gap-1 cursor-pointer"
                      >
                        {lang === 'id' ? 'Berikutnya' : 'Next'} &rarr;
                      </button>
                    )}
                  </div>
                );
              })()}
            </motion.div>
          );
        })()}

          {/* C. STATUS TRACKER */}
          {activeTab === 'tracker' && (
            <motion.div
              key="tracker"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 text-left"
            >
              <div>
                <h3 className="text-base font-bold text-slate-950 dark:text-white">
                  {lang === 'id' ? 'Papan Pelacak Lamaran Aktif' : 'Active Application Tracker Board'}
                </h3>
                <p className="text-2xs text-slate-500 dark:text-slate-400 mt-1">
                  {lang === 'id'
                    ? 'Pantau proses pelamaran Anda. Evaluasi dari Perekrut mengalir otomatis ke ubin status.'
                    : 'Keep tabs on your pipeline. Recruiter evaluations flow automatically to status tiles.'}
                </p>
              </div>

              {/* Status Columns Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 col-id-status-grid">
                
                {/* Column 1: Pending */}
                <div id="col-pending-hr" className="bg-slate-100/70 dark:bg-slate-900/20 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      1. {lang === 'id' ? 'Menunggu HR' : 'Pending HR'}
                    </span>
                    <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded px-1.5 text-2xs font-mono font-bold">
                      {applications.filter(a => a.status === 'pending').length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {applications.filter(a => a.status === 'pending').map(app => {
                      const associatedJob = jobs.find(j => j.id === app.jobId);
                      return (
                        <div id={`app-pending-${app.id}`} key={app.id} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-slate-400 dark:hover:border-slate-700 transition-colors" onClick={() => associatedJob && onSelectJob(associatedJob)}>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block mb-1">{associatedJob?.companyName}</span>
                          <h4 className="text-2xs font-extrabold text-slate-900 dark:text-white line-clamp-1 leading-tight">{associatedJob?.title}</h4>
                          <div className="mt-2.5 flex items-center justify-between">
                            <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 px-1.5 py-0.5 rounded font-mono font-bold">
                              {app.matchPercent}% {lang === 'id' ? 'Cocok' : 'Match'}
                            </span>
                            {app.anonymousMode && <span className="flex items-center gap-0.5 text-[9px] text-rose-500 font-bold bg-rose-500/5 px-1.5 py-0.5 rounded"><Lock className="w-2 h-2" /> Anon</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Column 2: Interview */}
                <div id="col-interviews" className="bg-indigo-50/70 dark:bg-indigo-950/20 p-4 rounded-2xl border border-indigo-200/60 dark:border-indigo-900/30">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-indigo-200/50 dark:border-indigo-900/30">
                    <span className="text-xs font-bold text-indigo-805 dark:text-indigo-305">
                      2. {lang === 'id' ? 'Wawancara' : 'Interviews'}
                    </span>
                    <span className="bg-indigo-100/80 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 rounded px-1.5 text-2xs font-mono font-bold">
                      {applications.filter(a => a.status === 'interview').length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {applications.filter(a => a.status === 'interview').map(app => {
                      const associatedJob = jobs.find(j => j.id === app.jobId);
                      return (
                        <div id={`app-interview-${app.id}`} key={app.id} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-indigo-200 dark:border-indigo-900/80 shadow-sm cursor-pointer" onClick={() => associatedJob && onSelectJob(associatedJob)}>
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono block mb-1">{associatedJob?.companyName}</span>
                          <h4 className="text-2xs font-extrabold text-slate-900 dark:text-white line-clamp-1 leading-tight">{associatedJob?.title}</h4>
                          <button
                            id={`btn-chat-link-${app.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigateToTab('chats');
                            }}
                            className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1 text-[10px] rounded-md transition-colors text-center"
                          >
                            {lang === 'id' ? 'Buka Obrolan Messenger' : 'Open Conversation Messenger'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Column 3: Rejected */}
                <div id="col-under-review" className="bg-rose-50/70 dark:bg-rose-950/20 p-4 rounded-2xl border border-rose-200/60 dark:border-rose-900/30">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-rose-200/50 dark:border-rose-900/30">
                    <span className="text-xs font-bold text-rose-800 dark:text-rose-300">
                      3. {lang === 'id' ? 'Dalam Peninjauan / Ditutup' : 'Under Review / Closed'}
                    </span>
                    <span className="bg-rose-100/80 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded px-1.5 text-2xs font-mono font-bold">
                      {applications.filter(a => a.status === 'rejected').length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {applications.filter(a => a.status === 'rejected').map(app => {
                      const associatedJob = jobs.find(j => j.id === app.jobId);
                      return (
                        <div id={`app-rejected-${app.id}`} key={app.id} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm opacity-85">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block mb-1">{associatedJob?.companyName}</span>
                          <h4 className="text-2xs font-extrabold text-rose-700 dark:text-rose-450 line-clamp-1 leading-tight">{associatedJob?.title}</h4>
                          <span className="text-[9px] text-slate-500 dark:text-slate-400 block mt-1">
                            {lang === 'id' ? 'Lamaran diarsipkan.' : 'Application archived.'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Column 4: Accepted */}
                <div id="col-offered" className="bg-emerald-50/70 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/30">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-emerald-200/55 dark:border-emerald-900/30">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      4. {lang === 'id' ? 'Mendapat Penawaran' : 'Offered'}
                    </span>
                    <span className="bg-emerald-100/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded px-1.5 text-2xs font-mono font-bold">
                      {applications.filter(a => a.status === 'accepted').length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {applications.filter(a => a.status === 'accepted').map(app => {
                      const associatedJob = jobs.find(j => j.id === app.jobId);
                      return (
                        <div id={`app-offered-${app.id}`} key={app.id} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/70 shadow-sm">
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold font-mono block mb-1">
                            {lang === 'id' ? 'SELAMAT' : 'CONGRATULATIONS'}
                          </span>
                          <h4 className="text-2xs font-extrabold text-slate-900 dark:text-white line-clamp-1 leading-tight">{associatedJob?.title}</h4>
                          <p className="text-[9px] text-slate-600 dark:text-slate-350 mt-2">
                            {lang === 'id' ? 'Perekrut mengirimkan surat penawaran resmi!' : 'Finverge Recruiter sent your formal offer letter!'}
                          </p>
                          <button
                            id={`btn-chat-link-offered-${app.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigateToTab('chats');
                            }}
                            className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-1 text-[10px] rounded-md transition-colors text-center cursor-pointer"
                          >
                            {lang === 'id' ? 'Buka Obrolan Messenger' : 'Open Conversation Messenger'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* D. DIGITAL RESUME / PROFILE EDITOR */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left"
            >
              
              {/* Account Profile Header Card */}
              {activeUser && (
                <div className="lg:col-span-12 bg-gradient-to-r from-indigo-500/5 via-violet-500/5 to-transparent rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                    <img 
                      src={activeUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} 
                      alt={activeUser.name}
                      className="w-20 h-20 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 shadow-sm"
                    />
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{activeUser.name}</h2>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-extrabold capitalize">
                          {activeUser.role === 'seeker' ? (lang === 'id' ? 'Kandidat' : 'Job Seeker') : activeUser.role}
                        </span>
                        {activeUser.gender && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                            {activeUser.gender === 'Laki-laki' || activeUser.gender === 'Male' ? (lang === 'id' ? 'Laki-laki' : 'Male') : activeUser.gender === 'Perempuan' || activeUser.gender === 'Female' ? (lang === 'id' ? 'Perempuan' : 'Female') : (lang === 'id' ? 'Lainnya' : 'Other')}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
                        {activeUser.bio || (lang === 'id' ? 'Belum menulis bio profil.' : 'No profile biography written yet.')}
                      </p>

                      {activeUser.phone && (
                        <p className="text-2xs font-mono text-slate-500 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {activeUser.phone}
                        </p>
                      )}

                      {/* Social Badges */}
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                        {activeUser.socialLinks?.linkedin && (
                          <a href={activeUser.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-1 px-2.5 rounded-lg bg-blue-50/80 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 text-[10px] font-semibold flex items-center gap-1 hover:opacity-80 transition-all select-all">
                            <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                          </a>
                        )}
                        {activeUser.socialLinks?.github && (
                          <a href={activeUser.socialLinks.github} target="_blank" rel="noopener noreferrer" className="p-1 px-2.5 rounded-lg bg-slate-150 dark:bg-slate-850 text-slate-700 dark:text-slate-300 text-[10px] font-semibold flex items-center gap-1 hover:opacity-80 transition-all select-all">
                            <Github className="w-3.5 h-3.5" /> GitHub
                          </a>
                        )}
                        {activeUser.socialLinks?.twitter && (
                          <a href={activeUser.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-1 px-2.5 rounded-lg bg-sky-50/80 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400 text-[10px] font-semibold flex items-center gap-1 hover:opacity-80 transition-all select-all">
                            <Twitter className="w-3.5 h-3.5" /> Twitter / X
                          </a>
                        )}
                        {activeUser.socialLinks?.instagram && (
                          <a href={activeUser.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-1 px-2.5 rounded-lg bg-pink-50/80 dark:bg-pink-950/20 text-pink-600 dark:text-pink-400 text-[10px] font-semibold flex items-center gap-1 hover:opacity-80 transition-all select-all">
                            <Instagram className="w-3.5 h-3.5" /> Instagram
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={onOpenProfileModal}
                    type="button"
                    className="w-full sm:w-auto px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Edit2 className="w-4 h-4" />
                    {lang === 'id' ? 'Edit Profil Akun' : 'Edit Account Profile'}
                  </button>
                </div>
              )}

              {/* Profile fields and tags */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 space-y-5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {lang === 'id' ? 'Pengaturan Profil CV Digital' : 'CV Digital Profile Settings'}
                </h3>
                
                <div className="space-y-1">
                  <label className="text-2xs font-mono font-semibold text-slate-400">
                    {lang === 'id' ? 'JUDUL PEKERJAAN TARGET' : 'TARGET JOB TITLE'}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white placeholder-slate-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-mono font-semibold text-slate-400">
                    {lang === 'id' ? 'BIO PROFESIONAL SINGKAT' : 'SHORT PROFESSIONAL BIO'}
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white placeholder-slate-400"
                  />
                </div>

                {/* Skill tagging systems */}
                <div className="space-y-2">
                  <label className="text-2xs font-mono font-semibold text-slate-400">
                    {lang === 'id' ? 'SISTEM TAG KEAHLIAN TEKNIS' : 'TECHNICAL SKILLS Tag System'}
                  </label>
                  
                  <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-150 dark:border-slate-905">
                    {profile.skills.map(s => (
                      <span key={s} className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold flex items-center gap-1">
                        {s}
                        <button type="button" onClick={() => handleRemoveSkill(s)} className="hover:text-rose-500 cursor-pointer">
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                    {profile.skills.length === 0 && <span className="text-2xs text-slate-400 italic font-medium p-1">No tags added yet...</span>}
                  </div>

                  <form onSubmit={handleAddSkill} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add tech skill tag (e.g. Node.js)..."
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs"
                    />
                    <button type="submit" className="px-4 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-xs font-bold rounded-lg transition-all dark:hover:bg-indigo-600">
                      Add
                    </button>
                  </form>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-900 pt-4">
                  <button
                    onClick={handleSaveProfile}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-lg text-xs transition-all active:scale-95"
                  >
                    Save Professional Details
                  </button>
                </div>
              </div>

              {/* CV Parsing Content */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 flex flex-col justify-between space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-950 dark:text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-500" /> {lang === 'id' ? 'Unggah CV Dokumen / Gambar' : 'Upload CV Document / Image'}
                  </h3>
                  <p className="text-2xs text-slate-500 dark:text-slate-400 leading-normal mt-1.5">
                    {lang === 'id' 
                      ? 'Unggah file PDF atau Gambar CV Anda. AI Gemini akan menganalisis dokumen untuk mengisi profil Anda secara otomatis.'
                      : 'Upload your PDF or Image CV. Gemini AI will analyze the file to automatically populate your profile fields.'}
                  </p>

                  {/* Drag & Drop Zone */}
                  <div className="mt-4">
                    <input
                      id="cv-file-picker"
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {isParsing ? (
                      <div className="border-2 border-dashed border-indigo-400/85 bg-indigo-50/10 dark:bg-indigo-950/20 rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-3 min-h-[140px] animate-pulse">
                        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                        <div>
                          <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            {lang === 'id' ? 'Memparsing Dokumen dengan Gemini AI...' : 'Parsing Document with Gemini AI...'}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {lang === 'id' ? 'Mengekstrak judul, bio, tag keahlian, dan teks resume...' : 'Extracting title, bio, skill tags, and raw resume text...'}
                          </p>
                        </div>
                      </div>
                    ) : cvFile ? (
                      <div className="border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl p-4 flex flex-col space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-indigo-150/10 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
                              {cvFile.type.startsWith('image/') ? (
                                <ImageIcon className="w-5 h-5" />
                              ) : (
                                <FileText className="w-5 h-5" />
                              )}
                            </div>
                            <div className="max-w-[180px] sm:max-w-xs">
                              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{cvFile.name}</h4>
                              <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{cvFile.size ? `${cvFile.size} KB` : 'Unknown size'}</p>
                            </div>
                          </div>
                          
                          <button
                            type="button"
                            onClick={handleRemoveFile}
                            className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer animate-fade-in"
                            title={lang === 'id' ? 'Hapus File' : 'Remove File'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Image Preview Thumbnail if it's an image */}
                        {cvFile.type.startsWith('image/') && (
                          <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[140px] bg-slate-100">
                            <img
                              src={cvFile.dataUrl}
                              alt="CV Preview"
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                              CV Preview
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 bg-emerald-50/50 dark:bg-emerald-950/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1.5 rounded-lg text-[10px] font-sans font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          {lang === 'id' ? 'Sukses terhubung & ter-sinkronisasi oleh AI Gemini' : 'Successfully connected & synchronized by Gemini AI'}
                        </div>
                      </div>
                    ) : (
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('cv-file-picker')?.click()}
                        className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[140px] ${
                          isDragging
                            ? 'border-indigo-500 bg-indigo-50/10 dark:bg-indigo-950/20 scale-[0.99]'
                            : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/10 hover:border-indigo-400 dark:hover:border-indigo-500/80'
                        }`}
                      >
                        <UploadCloud className={`w-8 h-8 ${isDragging ? 'text-indigo-500 scale-110' : 'text-slate-400'} transition-transform`} />
                        <div className="mt-3">
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {lang === 'id' ? 'Seret & Lepas CV di sini, atau klik untuk memilih' : 'Drag & Drop your CV here, or click to browse'}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                            {lang === 'id' ? 'Mendukung format gambar (PNG/JPG) atau PDF dokumen' : 'Supports images (PNG/JPG) or PDF documents'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between pb-1">
                      <label className="text-2xs font-mono font-bold text-slate-400 tracking-wider">
                        {lang === 'id' ? 'TEKS RAW CV DIGITAL (SINKRON)' : 'DIGITAL RESUME (FULL CV RAW TEXT)'}
                      </label>
                      <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono px-1.5 py-0.5 rounded font-bold">Editable</span>
                    </div>

                    <textarea
                      rows={6}
                      value={cvText}
                      onChange={(e) => setCvText(e.target.value)}
                      placeholder={lang === 'id' ? 'Tempel resume Anda, sertifikat, portofolio, atau teks CV mentah di sini...' : 'Paste your resume, certificates, portfolios, or copy-paste text CV...'}
                      className="w-full mt-1.5 p-3 bg-slate-50 dark:bg-slate-950 text-[11px] font-mono rounded-xl border border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 leading-relaxed"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-900 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleSaveProfile();
                      onNavigateToTab('analyzer');
                    }}
                    className="w-full bg-violet-650 hover:bg-violet-700 text-white py-2.5 text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors bg-violet-600"
                  >
                    {lang === 'id' ? 'Simpan & Evaluasi AI Gemini' : 'Save & Trigger AI Evaluation Suite'} <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
                  </button>
                </div>
              </div>

            </motion.div>
          )}

          {/* E. COMPANY ANNOUNCEMENTS & BULLETIN BOARD */}
          {activeTab === 'announcements' && (
            <motion.div
              key="announcements"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left"
            >
              {/* Left Side: Company Directory with descriptions & badges */}
              <div className="lg:col-span-4 space-y-4">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-display">
                  {lang === 'id' ? 'Direktori Perusahaan' : 'Enterprise Directory'}
                </h3>
                
                <div className="space-y-3.5 max-h-[640px] overflow-y-auto pr-2 no-scrollbar">
                  {companies.map(comp => {
                    const compJobsCount = jobs.filter(j => j.companyId === comp.id).length;
                    return (
                      <div key={comp.id} className="bg-white dark:bg-[#0a0c10] border border-slate-205 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:border-indigo-500/30 transition-all">
                        <div className="flex items-center gap-2.5">
                          <img src={comp.logo} alt="" className="w-9 h-9 object-cover rounded-lg bg-slate-50 border border-slate-150 dark:border-slate-850" />
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              {comp.name}
                              {comp.isVerified && <BadgeCheck className="w-4 h-4 text-indigo-505 dark:text-indigo-400 fill-indigo-550/10" />}
                            </h4>
                            <span className="text-[9px] text-slate-400 font-mono mt-0.5 block">{comp.industry} • {comp.location}</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-505 dark:text-slate-400 mt-3 line-clamp-3 leading-relaxed font-semibold">
                          {comp.description || (lang === 'id' ? 'Tidak ada deskripsi perusahaan yang disediakan.' : 'No corporate description supplied.')}
                        </p>
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-900 flex items-center justify-between text-2xs font-mono font-bold">
                          <span className="text-indigo-500">
                            {compJobsCount} {lang === 'id' ? 'lowongan aktif' : 'active role(s)'}
                          </span>
                          {comp.website && (
                            <a href={comp.website} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-400 hover:underline flex items-center gap-0.5">
                              Website <Globe className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Side: Active Announcement Bulletins List */}
              <div className="lg:col-span-8 space-y-4">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-display">
                  {lang === 'id' ? 'Papan Pengumuman Perusahaan' : 'Active Corporate Announcements Board'}
                </h3>
                
                <div className="space-y-4 max-h-[640px] overflow-y-auto pr-1">
                  {(announcements || []).length === 0 ? (
                    <div className="bg-white dark:bg-[#0a0c10] p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                      <p className="text-xs text-slate-550 font-semibold">
                        {lang === 'id' ? 'Belum ada pengumuman yang dikirim oleh perwakilan korporasi.' : 'No announcements posted yet by registered company representatives.'}
                      </p>
                    </div>
                  ) : (
                    (announcements || []).map(ann => {
                      const comp = companies.find(c => c.id === ann.companyId);
                      const translation = translatedAnnouncements[ann.id];
                      const isCurrentlyTranslated = translation && translation.lang === lang;
                      const displayedTitle = isCurrentlyTranslated ? translation.title : ann.title;
                      const displayedContent = isCurrentlyTranslated ? translation.content : ann.content;
                      
                      return (
                        <div key={ann.id} className="bg-white dark:bg-[#0a0c10] border border-slate-205 dark:border-slate-800 p-6 rounded-2xl shadow-sm relative overflow-hidden">
                          <div className="flex items-center justify-between">
                            <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded ${
                              ann.category === 'Milestone' 
                                ? 'bg-indigo-500/10 text-indigo-505' 
                                : ann.category === 'Culture' 
                                ? 'bg-emerald-500/10 text-emerald-505'
                                : ann.category === 'Hiring' 
                                ? 'bg-purple-500/10 text-purple-500'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}>
                              {ann.category}
                            </span>
                            <span className="text-2xs text-slate-400 font-mono font-semibold">{new Date(ann.createdAt).toLocaleDateString()}</span>
                          </div>

                          <h4 className="text-sm font-black text-slate-905 dark:text-white mt-3 leading-tight">{displayedTitle}</h4>
                          <p className="text-2xs text-slate-650 dark:text-slate-350 leading-relaxed mt-3 font-semibold whitespace-pre-line">
                            {displayedContent}
                          </p>

                          {isCurrentlyTranslated && (
                            <div className="mt-3 text-[9px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono font-bold bg-emerald-50/50 dark:bg-emerald-950/20 px-2 py-1 rounded w-fit">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              {lang === 'id' ? 'Diterjemahkan secara otomatis oleh Gemini' : 'Automatically translated by Gemini'}
                            </div>
                          )}

                          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-900 flex flex-wrap gap-3 items-center justify-between">
                            <div className="flex items-center gap-2">
                              <img src={comp?.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80'} alt="" className="w-5.5 h-5.5 rounded-md object-cover bg-slate-100" />
                              <span className="text-[10px] text-slate-500 dark:text-slate-450 font-bold font-sans">
                                {lang === 'id' ? 'Oleh ' : 'Published by '} {ann.companyName}
                              </span>
                            </div>

                            <button
                              id={`btn-translate-${ann.id}`}
                              onClick={() => handleTranslateAnnouncement(ann.id, ann.title, ann.content)}
                              disabled={translatingIds[ann.id]}
                              className="text-[10px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50/80 hover:bg-indigo-100/90 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 font-sans font-bold transition-all disabled:opacity-50"
                            >
                              {translatingIds[ann.id] ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  {lang === 'id' ? 'Mengolah AI...' : 'AI Processing...'}
                                </>
                              ) : isCurrentlyTranslated ? (
                                <>
                                  <Languages className="w-3.5 h-3.5" />
                                  {lang === 'id' ? 'Lihat Bahasa Asli' : 'Show Original'}
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                                  {lang === 'id' ? 'Terjemahkan Otomatis' : 'Auto Translate'}
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
