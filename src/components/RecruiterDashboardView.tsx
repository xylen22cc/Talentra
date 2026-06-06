import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, AlertTriangle, ShieldCheck, Sparkles, FileText, 
  CheckCircle2, UserCheck, XCircle, Search, Mail, Tag, 
  HelpCircle, ArrowRight, Edit2, Trash2, Plus, Globe, 
  Building, Megaphone, Save, BadgeCheck, MapPin,
  Phone, Linkedin, Github, Twitter, Instagram, User as UserIcon
} from 'lucide-react';
import { Job, Company, Application, CompanyAnnouncement, User } from '../types';
import { useLanguage } from '../LanguageContext';

interface RecruiterDashboardViewProps {
  jobs: Job[];
  companies: Company[];
  applications: Application[];
  activeUser: User;
  announcements: CompanyAnnouncement[];
  onUpdateApplicationStatus: (appId: string, status: Application['status']) => Promise<void>;
  onPostJob: (jobData: any) => Promise<Job>;
  onAddAnnouncement: (annData: any) => Promise<void>;
  onUpdateAnnouncement: (id: string, updates: any) => Promise<void>;
  onDeleteAnnouncement: (id: string) => Promise<void>;
  onUpdateCompany: (id: string, updates: any) => Promise<void>;
  onOpenProfileModal?: () => void;
  activeTab?: 'applicants' | 'post-job' | 'announcements' | 'company-profile';
  onActiveTabChange?: (tab: 'applicants' | 'post-job' | 'announcements' | 'company-profile') => void;
}

export default function RecruiterDashboardView({
  jobs,
  companies,
  applications,
  activeUser,
  announcements,
  onUpdateApplicationStatus,
  onPostJob,
  onAddAnnouncement,
  onUpdateAnnouncement,
  onDeleteAnnouncement,
  onUpdateCompany,
  onOpenProfileModal,
  activeTab: propActiveTab,
  onActiveTabChange: propOnActiveTabChange
}: RecruiterDashboardViewProps) {
  const { t, lang } = useLanguage();
  // Recruiters have co-2 as default associated company
  const recruiterCompanyId = activeUser.companyId || 'co-2';
  const myCompany = companies.find(c => c.id === recruiterCompanyId) || {
    id: recruiterCompanyId,
    name: 'Finverge Labs',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    description: 'We build next generation open-finance services.',
    industry: 'Financial Technology',
    location: 'Jakarta, ID',
    website: 'https://finverge.io',
    isVerified: true
  };

  const [internalActiveTab, setInternalActiveTab] = useState<'applicants' | 'post-job' | 'announcements' | 'company-profile'>('applicants');
  const activeTab = propActiveTab || internalActiveTab;
  const setActiveTab = propOnActiveTabChange || setInternalActiveTab;

  const [targetType, setTargetType] = useState<string>('All');
  
  // Job Post States
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('Remote (APAC)');
  const [salaryRange, setSalaryRange] = useState('$5,000 - $8,000 / month');
  const [jobType, setJobType] = useState<'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Internship'>('Full-time');
  const [experienceLevel, setExperienceLevel] = useState<'Entry Level' | 'Mid Level' | 'Senior Level'>('Mid Level');
  const [desc, setDesc] = useState('');
  const [skillsCsv, setSkillsCsv] = useState('React, TypeScript, Tailwind CSS');
  const [requirementsCsv, setRequirementsCsv] = useState('3+ years programming experience, Proven frontend styling capability');
  
  const [publishing, setPublishing] = useState(false);
  const [postResponse, setPostResponse] = useState<Job | null>(null);

  // Announcement States
  const [editingAnn, setEditingAnn] = useState<Partial<CompanyAnnouncement> | null>(null);
  const [annTitle, setAnnTitle] = useState('');
  const [annCategory, setAnnCategory] = useState<'Milestone' | 'Culture' | 'Hiring' | 'Innovation'>('Milestone');
  const [annContent, setAnnContent] = useState('');

  // Company Edit States
  const [compName, setCompName] = useState(myCompany.name);
  const [compLogo, setCompLogo] = useState(myCompany.logo);
  const [compDesc, setCompDesc] = useState(myCompany.description);
  const [compIndustry, setCompIndustry] = useState(myCompany.industry);
  const [compLoc, setCompLoc] = useState(myCompany.location);
  const [compWeb, setCompWeb] = useState(myCompany.website);
  const [showCompSaved, setShowCompSaved] = useState(false);

  // Filtering datasets owned by this corporate entity
  const finvergeJobs = jobs.filter(j => j.companyId === recruiterCompanyId);
  const finvergeAppList = applications.filter(app => {
    const job = jobs.find(j => j.id === app.jobId);
    return job && job.companyId === recruiterCompanyId;
  });
  
  // Filter announcements for current recruiter's company
  const myAnnouncements = announcements.filter(a => a.companyId === recruiterCompanyId);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim() || publishing) return;

    setPublishing(true);
    setPostResponse(null);

    const skillsArray = skillsCsv.split(',').map(s => s.trim()).filter(Boolean);
    const requirementsArray = requirementsCsv.split(',').map(r => r.trim()).filter(Boolean);

    try {
      const createdAd = await onPostJob({
        title,
        companyId: recruiterCompanyId,
        companyName: myCompany.name,
        location,
        salaryRange,
        jobType,
        experienceLevel,
        description: desc,
        requirements: requirementsArray,
        skillsRequired: skillsArray
      });

      setPostResponse(createdAd);

      // Reset fields if approved, otherwise keep for correction
      if (!createdAd.isSuspicious) {
        setTitle('');
        setDesc('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPublishing(false);
    }
  };

  const handleAnnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;

    if (editingAnn?.id) {
      // Editing
      await onUpdateAnnouncement(editingAnn.id, {
        title: annTitle,
        category: annCategory,
        content: annContent
      });
    } else {
      // Create new
      await onAddAnnouncement({
        companyId: recruiterCompanyId,
        companyName: myCompany.name,
        title: annTitle,
        category: annCategory,
        content: annContent
      });
    }

    setEditingAnn(null);
    setAnnTitle('');
    setAnnContent('');
  };

  const handleCompanyUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateCompany(recruiterCompanyId, {
      name: compName,
      logo: compLogo,
      description: compDesc,
      industry: compIndustry,
      location: compLoc,
      website: compWeb
    });
    setShowCompSaved(true);
    setTimeout(() => setShowCompSaved(false), 3000);
  };

  const startEditAnn = (ann: CompanyAnnouncement) => {
    setEditingAnn(ann);
    setAnnTitle(ann.title);
    setAnnCategory(ann.category as any);
    setAnnContent(ann.content);
  };

  return (
    <div className="max-w-full mx-auto px-4 sm:px-8 md:px-12 py-8 text-left relative z-10">
      
      {/* Upper Header Banner */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Building className="w-7 h-7 text-indigo-500" />
            {lang === 'id' ? 'Ruang Kerja Perekrut' : 'Recruiter Workspace'} 
            <span className="text-xs bg-indigo-500/10 text-indigo-550 dark:text-indigo-430 px-2.5 py-1 rounded-full font-mono font-bold flex items-center gap-1">
              {myCompany.name}
              {myCompany.isVerified && <BadgeCheck className="w-4 h-4 text-indigo-500 fill-indigo-500/10" />}
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'id'
              ? 'Saring resume kandidat terbaik, siarkan buletin pengumuman perusahaan, kelola profil direktori perusahaan beraliansi, dan pasang lowongan karir.'
              : 'Shortlist top candidate resumes, broadcast company bulletins, manage company directories and post approved corporate careers.'}
          </p>
        </div>

        {/* Tab switcher buttons */}
        {!propActiveTab && (
          <div className="flex flex-wrap bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-xl gap-1 self-start">
            <button
              onClick={() => setActiveTab('applicants')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'applicants'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-md'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" /> {lang === 'id' ? 'Tinjau Pelamar' : 'Review Applicants'} ({finvergeAppList.length})
            </button>
            
            <button
              onClick={() => setActiveTab('post-job')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'post-job'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-md'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" /> {lang === 'id' ? 'Pasang Karir Baru' : 'Post Workspace Ad'}
            </button>
            
            <button
              onClick={() => setActiveTab('announcements')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'announcements'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-md'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5" /> {lang === 'id' ? 'Siaran & Buletin' : 'Broadcast & Bulletins'} ({myAnnouncements.length})
            </button>

            <button
              onClick={() => setActiveTab('company-profile')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'company-profile'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-md'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" /> {lang === 'id' ? 'Identitas Perusahaan' : 'Edit Company Identity'}
            </button>
          </div>
        )}
      </div>

      {/* Corporate Overview Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-8">
        <div className="bg-white dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
            {lang === 'id' ? 'Total Lowongan Perusahaan' : 'Total Company Jobs'}
          </span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 ">{finvergeJobs.length}</p>
        </div>

        <div className="bg-white dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
            {lang === 'id' ? 'Lamaran Menunggu Tinjauan' : 'Pending Review Applications'}
          </span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {finvergeAppList.filter(a => a.status === 'pending').length}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 col-span-2 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
              {lang === 'id' ? 'Lencana Sorotan Perusahaan' : 'Company Spotlight Web Badge'}
            </span>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white">{myCompany.name}</span>
              {myCompany.isVerified ? (
                <span className="bg-indigo-500/10 text-indigo-500 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3" /> {lang === 'id' ? 'Profil Keamanan Teruji' : 'Vetted Security Profile'}
                </span>
              ) : (
                <span className="bg-amber-500/10 text-amber-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {lang === 'id' ? 'Verifikasi Menunggu Tinjauan' : 'Verification Pending Review'}
                </span>
              )}
            </div>
          </div>
          <img src={myCompany.logo} alt="" className="w-10 h-10 object-cover rounded-xl bg-slate-100 border border-slate-200 dark:border-slate-850" />
        </div>
      </div>

      {/* Main Tab Rendering Block */}
      <div className="mt-8">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: REVIEW APPLICANTS */}
          {activeTab === 'applicants' && (
            <motion.div
              key="applicants"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">Applications Tracking System (ATS)</h3>
                <div className="flex gap-1">
                  {['All', 'pending', 'accepted', 'rejected'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setTargetType(cat)}
                      className={`px-3 py-1 text-[10px] font-bold font-mono uppercase tracking-wider rounded-lg border transition-all ${
                        targetType === cat
                          ? 'bg-slate-900 dark:bg-slate-200 text-white dark:text-slate-900 border-transparent shadow-sm'
                          : 'bg-white dark:bg-slate-950 text-slate-500 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {finvergeAppList.length === 0 ? (
                <div className="bg-white dark:bg-slate-950 p-12 rounded-2xl border border-slate-200 dark:border-slate-850 text-center">
                  <Briefcase className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
                  <p className="text-xs text-slate-500 mt-2">No applications received yet for your company vacancies.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {finvergeAppList
                    .filter((app) => targetType === 'All' || app.status === targetType)
                    .map((app) => {
                      const matchedJob = jobs.find((j) => j.id === app.jobId);
                      return (
                        <div key={app.id} className="bg-white dark:bg-[#0a0c10] rounded-2xl border border-slate-205 dark:border-slate-800 p-5 flex flex-col md:flex-row justify-between gap-6 shadow-sm">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-3">
                              <img
                                src={app.anonymousMode 
                                  ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                                  : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
                                }
                                alt=""
                                className="w-10 h-10 rounded-full object-cover border border-indigo-500/20"
                              />
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                  {app.anonymousMode ? `Hidden Identity (#${app.id.slice(-4)})` : app.applicantName}
                                  {app.matchPercent >= 80 ? (
                                    <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                      <Sparkles className="w-2.5 h-2.5" /> Best Match
                                    </span>
                                  ) : (
                                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-400 text-[10px] font-mono px-1.5 py-0.5 rounded-full">
                                      Score: {app.matchPercent}%
                                    </span>
                                  )}
                                </h4>
                                <p className="text-[10px] text-indigo-500 font-mono mt-0.5">
                                  Applying for Job Title: <span className="underline">{matchedJob?.title || 'Job Post'}</span>
                                </p>
                              </div>
                            </div>

                            <p className="text-2xs text-slate-650 dark:text-slate-350 leading-relaxed font-semibold">
                              <strong className="text-[9px] text-slate-400 uppercase tracking-widest font-mono block mb-1">Resume AI Summary</strong>
                              {app.cvSummary || 'CV content screening completed. Suitable fit parameters parsed.'}
                            </p>

                            <div className="flex flex-wrap gap-1">
                              {app.applicantSkills.map((sk) => (
                                <span key={sk} className="text-[9px] bg-indigo-500/15 text-indigo-650 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold">
                                  {sk}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-row md:flex-col justify-between items-end border-t md:border-t-0 border-slate-100 dark:border-slate-900 pt-3 md:pt-0 gap-4">
                            <div className="text-right">
                              <span className="text-[9px] font-mono text-slate-400 block">Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                              <span className={`text-[9px] text-right font-extrabold capitalize block mt-1 ${
                                app.status === 'accepted' 
                                  ? 'text-emerald-500' 
                                  : app.status === 'rejected' 
                                  ? 'text-rose-500' 
                                  : 'text-amber-500'
                              }`}>
                                Status: {app.status}
                              </span>
                            </div>

                            {app.status === 'pending' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => onUpdateApplicationStatus(app.id, 'rejected')}
                                  className="p-1 px-3 rounded-lg text-rose-550 hover:bg-rose-500/10 text-xs font-black transition-all flex items-center gap-1 border border-rose-500/20"
                                >
                                  <XCircle className="w-4 h-4" /> Decline
                                </button>
                                <button
                                  onClick={() => onUpdateApplicationStatus(app.id, 'accepted')}
                                  className="p-1 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-md"
                                >
                                  <CheckCircle2 className="w-4 h-4" /> Shortlist
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: POST CAREERS AD */}
          {activeTab === 'post-job' && (
            <motion.div
              key="post-job"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              <form onSubmit={handlePostSubmit} className="lg:col-span-7 bg-white dark:bg-[#0a0c10] border border-slate-205 dark:border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm text-xs font-semibold">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-900 mb-2">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white font-display">Broadcast New Careers Ad Listing</h3>
                  <p className="text-2xs text-slate-400 mt-0.5 font-medium">Compliance guidelines verify zero request for deposits.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-bold text-slate-400 font-mono">VACANCY DESIGNATION / TITLE</label>
                  <input
                    required
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs"
                    placeholder="e.g. Senior Frontend Engineer (Security Systems)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-2xs font-bold text-slate-400 font-mono">OFFICE SETUP & LOCATION</label>
                    <input
                      required
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs"
                    />
                  </div>

                  <div className="space-y-1 font-semibold">
                    <label className="text-2xs font-bold text-slate-400 font-mono">ANNUAL COMPENSATION ESTIMATE</label>
                    <input
                      required
                      type="text"
                      value={salaryRange}
                      onChange={(e) => setSalaryRange(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-2xs font-bold text-slate-400 font-mono">EMPLOYMENT TYPE</label>
                    <select
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-250 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Remote">Remote</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-2xs font-bold text-slate-400 font-mono">EXPERIENCE TARGET RANGE</label>
                    <select
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-250 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs"
                    >
                      <option value="Entry Level">Entry Level (Junior)</option>
                      <option value="Mid Level">Mid Level</option>
                      <option value="Senior Level">Senior Level</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-bold text-slate-400 font-mono">REQUIRED SKILL METRICS (Comma separated)</label>
                  <input
                    type="text"
                    value={skillsCsv}
                    onChange={(e) => setSkillsCsv(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-bold text-slate-400 font-mono">JOB TARGET CHECKLIST REQUIREMENTS (Comma separated)</label>
                  <input
                    type="text"
                    value={requirementsCsv}
                    onChange={(e) => setRequirementsCsv(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-bold text-slate-400 font-mono">JOB DESCRIPTION & COMPENSATION SUMMARY</label>
                  <textarea
                    required
                    rows={6}
                    placeholder="Provide description. Upfront training fees are strict fraud signals..."
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    className="w-full p-3 border border-slate-205 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={publishing}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 text-xs rounded-xl transition-all shadow-md"
                >
                  {publishing ? 'Trigger Security Crawler Verification...' : 'Validate and Publish Ad Listing'}
                </button>
              </form>

              {/* Threat scanning diagnostics representation */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Visual Security panel state */}
                <div className="bg-slate-55 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl text-left">
                  <h4 className="text-xs font-mono font-bold text-slate-450 uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Active Security Screening
                  </h4>
                  <p className="text-2xs text-slate-500 dark:text-slate-400 leading-normal mt-2 font-semibold">
                    Every published career ad goes through semantic screening against upfront cash solicitations and phantom wire scams.
                  </p>

                  <div className="space-y-3 mt-5">
                    <div className="flex gap-2 text-2xs text-slate-550 dark:text-slate-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                      <span>Guarantees of fast high weekly payouts with no prerequisites are parsed.</span>
                    </div>
                    <div className="flex gap-2 text-2xs text-slate-550 dark:text-slate-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                      <span>Wording requesting tooling deposits triggers immediate quarantines.</span>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {postResponse && (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`p-5 rounded-2xl text-left border ${
                        postResponse.isSuspicious
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-600'
                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {postResponse.isSuspicious ? (
                          <AlertTriangle className="w-5.5 h-5.5 text-rose-500 shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle2 className="w-5.5 h-5.5 text-emerald-500 shrink-0 mt-0.5" />
                        )}

                        <div>
                          <h4 className="text-xs font-extrabold capitalize leading-none">
                            {postResponse.isSuspicious ? 'Crawler Quarantine warning' : 'Ad published successfully'}
                          </h4>
                          
                          <p className="text-[11px] text-slate-650 dark:text-slate-350 leading-relaxed mt-2 font-medium">
                            {postResponse.isSuspicious 
                              ? `FLAGGED PHANTOM SIGNAL: "${postResponse.suspiciousReason}". This listing has been held in moderation.`
                              : `Job post for "${postResponse.title}" successfully vetted and approved. Listed matching scores active.`
                            }
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* TAB 3: BROADCAST BULLETINS & ANNOUNCEMENTS (NEW FEATURE!) */}
          {activeTab === 'announcements' && (
            <motion.div
              key="announcements"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              {/* Form panel to publish news */}
              <div className="lg:col-span-5 bg-white dark:bg-[#0a0c10] border border-slate-205 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-900">
                  <h3 className="text-xs font-black uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
                    <Megaphone className="w-4 h-4" /> 
                    {editingAnn ? 'Modify Bulletin' : 'Broadcast Company Post'}
                  </h3>
                  <p className="text-2xs text-slate-400 mt-1 font-medium">
                    Spreading announcements keeps candidates excited and boosts corporate brand visibility.
                  </p>
                </div>

                <form onSubmit={handleAnnSubmit} className="space-y-4 text-xs font-semibold">
                  <div className="space-y-1">
                    <label className="text-2xs font-bold text-slate-450 uppercase font-mono tracking-widest">Post Title</label>
                    <input
                      required
                      type="text"
                      value={annTitle}
                      onChange={e => setAnnTitle(e.target.value)}
                      placeholder="e.g. Finverge secures pre-A funding"
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs focus:outline-none focus:border-indigo-550"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-2xs font-bold text-slate-450 uppercase font-mono tracking-widest">Topic category</label>
                    <select
                      value={annCategory}
                      onChange={e => setAnnCategory(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-250 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs"
                    >
                      <option value="Milestone">Milestone (Funding, Product Launch)</option>
                      <option value="Culture">Culture (Environment, Green Tech, Life)</option>
                      <option value="Hiring">Hiring (We are hiring notices, Job spotlights)</option>
                      <option value="Innovation">Innovation (Research development, Tech stack updates)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-2xs font-bold text-slate-450 uppercase font-mono tracking-widest font-mono">Bulletin Content Description</label>
                    <textarea
                      required
                      rows={5}
                      value={annContent}
                      onChange={e => setAnnContent(e.target.value)}
                      placeholder="Write an elegant corporate newsletter description summarizing this news post context..."
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex gap-2">
                    {editingAnn && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAnn(null);
                          setAnnTitle('');
                          setAnnContent('');
                        }}
                        className="w-1/3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2 rounded-xl text-xs font-bold font-sans hover:bg-slate-200"
                      >
                        Cancel
                      </button>
                    )}
                    <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 py-2.5 text-xs text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5">
                      <Save className="w-4 h-4" /> {editingAnn ? 'Update News' : 'Publish Bulletin'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Announcements list */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase font-mono tracking-widest font-display">Active Corporate Board Listings</h4>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-905 text-slate-400 px-2 py-0.5 rounded font-mono font-bold">
                    Count: {myAnnouncements.length}
                  </span>
                </div>

                {myAnnouncements.length === 0 ? (
                  <div className="bg-white dark:bg-[#0a0c10] border border-slate-200 dark:border-slate-800 p-12 text-center rounded-2xl">
                    <Megaphone className="w-8 h-8 text-slate-350 dark:text-slate-650 mx-auto" />
                    <p className="text-2xs text-slate-500 mt-2 font-medium">No published bulletins found. Draft your first corporate update today!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myAnnouncements.map(ann => (
                      <div key={ann.id} className="bg-white dark:bg-[#0a0c10] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-3.5 shadow-sm text-left">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded ${
                              ann.category === 'Milestone' 
                                ? 'bg-indigo-500/10 text-indigo-500' 
                                : ann.category === 'Culture' 
                                ? 'bg-emerald-500/10 text-emerald-505'
                                : ann.category === 'Hiring' 
                                ? 'bg-purple-500/10 text-purple-500'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-550 dark:text-slate-400'
                            }`}>
                              {ann.category}
                            </span>
                            <h4 className="text-xs font-black text-slate-900 dark:text-white mt-2 leading-tight">
                              {ann.title}
                            </h4>
                          </div>

                          <div className="flex gap-1.5">
                            <button
                              onClick={() => startEditAnn(ann)}
                              className="p-1 px-2 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-500 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all text-3xs font-black flex items-center gap-0.5"
                            >
                              <Edit2 className="w-2.5 h-2.5" /> Edit
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Drop this corporate announcement?')) {
                                  onDeleteAnnouncement(ann.id);
                                }
                              }}
                              className="p-1 px-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-505/20 transition-all text-3xs font-black flex items-center gap-0.5"
                            >
                              <Trash2 className="w-2.5 h-2.5" /> Drop
                            </button>
                          </div>
                        </div>

                        <p className="text-2xs text-slate-650 dark:text-slate-350 leading-relaxed font-semibold">
                          {ann.content}
                        </p>

                        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 pt-2.5 border-t border-slate-100 dark:border-slate-900 justify-between">
                          <span>{myCompany.name} • Publisher Office</span>
                          <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 4: COMPANY PROFILE DETAILS EDITING (NEW FEATURE!) */}
          {activeTab === 'company-profile' && (
            <motion.div
              key="company-profile"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-2xl mx-auto"
            >
              {/* Recruiter Personal Settings Box */}
              {activeUser && (
                <div className="bg-white dark:bg-[#0a0c10] border border-slate-200/80 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-5 mb-6 text-left">
                  <div className="pb-3 border-b border-slate-100 dark:border-slate-900 mb-2">
                    <h3 className="text-sm font-extrabold text-slate-905 dark:text-white font-display flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-indigo-500" />
                      {lang === 'id' ? 'Profil Perekrut Akun Saya' : 'My Recruiter Personal Profile'}
                    </h3>
                    <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                      {lang === 'id' ? 'Informasi akun utama untuk interaksi lamaran dan obrolan kandidat.' : 'Primary account credentials for interactions with candidates and chat rooms.'}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    <img
                      src={activeUser.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'}
                      alt={activeUser.name}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shadow-sm"
                    />
                    <div className="flex-1 space-y-1.5 text-center sm:text-left">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <span className="text-sm font-black text-slate-909 dark:text-white">{activeUser.name}</span>
                        {activeUser.gender && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                            {activeUser.gender === 'Laki-laki' || activeUser.gender === 'Male' ? (lang === 'id' ? 'Laki-laki' : 'Male') : activeUser.gender === 'Perempuan' || activeUser.gender === 'Female' ? (lang === 'id' ? 'Perempuan' : 'Female') : (lang === 'id' ? 'Lainnya' : 'Other')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{activeUser.email}</p>
                      
                      {activeUser.bio && (
                        <p className="text-xs text-slate-600 dark:text-slate-350 italic bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-900/60 mt-1 max-w-lg leading-relaxed">
                          "{activeUser.bio}"
                        </p>
                      )}

                      {activeUser.phone && (
                        <p className="text-2xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center sm:justify-start gap-1 font-mono">
                          <Phone className="w-3 w-3 text-slate-400" /> {activeUser.phone}
                        </p>
                      )}

                      {/* Social Integrations */}
                      {(activeUser.socialLinks?.linkedin || activeUser.socialLinks?.github || activeUser.socialLinks?.twitter || activeUser.socialLinks?.instagram) && (
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                          {activeUser.socialLinks?.linkedin && (
                            <a href={activeUser.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-1 px-2.5 rounded bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 text-[9px] font-bold flex items-center gap-1 hover:opacity-85 transition-all select-all">
                              <Linkedin className="w-3 h-3" /> LinkedIn
                            </a>
                          )}
                          {activeUser.socialLinks?.github && (
                            <a href={activeUser.socialLinks.github} target="_blank" rel="noopener noreferrer" className="p-1 px-2.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-[9px] font-bold flex items-center gap-1 hover:opacity-85 transition-all select-all">
                              <Github className="w-3 h-3" /> GitHub
                            </a>
                          )}
                          {activeUser.socialLinks?.twitter && (
                            <a href={activeUser.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-1 px-2.5 rounded bg-sky-50/50 dark:bg-sky-950/20 text-sky-650 dark:text-sky-400 text-[9px] font-bold flex items-center gap-1 hover:opacity-85 transition-all select-all">
                              <Twitter className="w-3 h-3" /> Twitter / X
                            </a>
                          )}
                          {activeUser.socialLinks?.instagram && (
                            <a href={activeUser.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-1 px-2.5 rounded bg-pink-50/50 dark:bg-pink-950/20 text-pink-600 dark:text-pink-400 text-[9px] font-bold flex items-center gap-1 hover:opacity-85 transition-all select-all">
                              <Instagram className="w-3 h-3" /> Instagram
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-900 flex justify-end">
                    <button
                      type="button"
                      onClick={onOpenProfileModal}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all shadow-sm cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 animate-pulse" />
                      {lang === 'id' ? 'Edit Profil Akun' : 'Edit Personal Profile'}
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleCompanyUpdateSubmit} className="bg-white dark:bg-[#0a0c10] border border-slate-205 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-900 mb-2">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white font-display">Enterprise Corporate Profile settings</h3>
                  <p className="text-2xs text-slate-450 mt-0.5 font-semibold">Changes are saved in database and instantly seen by matching searchers.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-bold text-slate-400 font-mono uppercase tracking-widest">Company Brand Name</label>
                  <input
                    required
                    type="text"
                    value={compName}
                    onChange={e => setCompName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs"
                    placeholder="e.g. Finverge Labs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 font-semibold">
                    <label className="text-2xs font-bold text-slate-400 font-mono uppercase tracking-widest">Industry Classification</label>
                    <input
                      required
                      type="text"
                      value={compIndustry}
                      onChange={e => setCompIndustry(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs"
                    />
                  </div>

                  <div className="space-y-1 font-semibold">
                    <label className="text-2xs font-bold text-slate-400 font-mono uppercase tracking-widest">Primary Office headquarters</label>
                    <input
                      required
                      type="text"
                      value={compLoc}
                      onChange={e => setCompLoc(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-bold text-slate-400 font-mono uppercase tracking-widest">Workspace Website link</label>
                  <input
                    required
                    type="text"
                    value={compWeb}
                    onChange={e => setCompWeb(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs"
                    placeholder="e.g. https://finvergelabs.io"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-bold text-slate-400 font-mono uppercase tracking-widest">Brand Logo URL</label>
                  <input
                    required
                    type="text"
                    value={compLogo}
                    onChange={e => setCompLogo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-bold text-slate-400 font-mono uppercase tracking-widest">Corporate Biography Narrative</label>
                  <textarea
                    required
                    rows={4}
                    value={compDesc}
                    onChange={e => setCompDesc(e.target.value)}
                    placeholder="We build open-finance ledger systems..."
                    className="w-full p-2.5 border border-slate-205 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="pt-2 flex justify-between items-center gap-4">
                  <div className="flex-1">
                    {showCompSaved && (
                      <span className="text-[10px] text-emerald-500 font-bold border border-emerald-500/20 bg-emerald-55/10 dark:bg-emerald-905 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-display">
                        <CheckCircle2 className="w-4 h-4" /> Corporate details synced.
                      </span>
                    )}
                  </div>
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-md text-xs flex items-center gap-1.5">
                    <Save className="w-4 h-4" /> Save Company Details
                  </button>
                </div>
              </form>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
