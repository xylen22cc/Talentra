import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, CheckCircle, XCircle, AlertOctagon, UserPlus, FileText, 
  BarChart3, HelpCircle, Eye, Globe, Edit2, Trash2, Plus, 
  MapPin, Briefcase, Mail, ShieldAlert, BadgeCheck, X, Link, CircleCheck,
  Database, Copy, Check, RefreshCw, ExternalLink
} from 'lucide-react';
import { Job, Company, Application, User } from '../types';
import { useLanguage } from '../LanguageContext';

interface AdminPanelViewProps {
  jobs: Job[];
  companies: Company[];
  applications: Application[];
  users: User[];
  onToggleCompanyVerification: (companyId: string, isVerified: boolean) => Promise<void>;
  onModerateJob: (jobId: string, status: 'approved' | 'rejected') => Promise<void>;
  onAddUser: (userData: any) => Promise<void>;
  onUpdateUser: (id: string, updates: any) => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
  onAddCompany: (companyData: any) => Promise<void>;
  onUpdateCompany: (id: string, updates: any) => Promise<void>;
  onDeleteCompany: (id: string) => Promise<void>;
  onAddJob?: (jobData: any) => Promise<any>;
  onUpdateJob: (id: string, updates: any) => Promise<void>;
  onDeleteJob: (id: string) => Promise<void>;
  activeUser?: User | null;
  onOpenProfileModal?: () => void;
  // Dynamic Tab delegation from left sidebar menu
  activeTab?: 'quarantine' | 'companies' | 'jobs' | 'users' | 'analytics' | 'supabase';
  onActiveTabChange?: (tab: 'quarantine' | 'companies' | 'jobs' | 'users' | 'analytics' | 'supabase') => void;
}

export default function AdminPanelView({
  jobs,
  companies,
  applications,
  users,
  onToggleCompanyVerification,
  onModerateJob,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onAddCompany,
  onUpdateCompany,
  onDeleteCompany,
  onAddJob,
  onUpdateJob,
  onDeleteJob,
  activeUser,
  onOpenProfileModal,
  activeTab: propActiveTab,
  onActiveTabChange: propOnActiveTabChange
}: AdminPanelViewProps) {
  const { t, lang } = useLanguage();
  const [internalTab, setInternalTab] = useState<'quarantine' | 'companies' | 'jobs' | 'users' | 'analytics' | 'supabase'>('quarantine');

  const activeTab = propActiveTab || internalTab;
  const setActiveTab = propOnActiveTabChange || setInternalTab;

  // Supabase Connection & Admin Panel Integration States
  const [supabaseStatus, setSupabaseStatus] = useState<{ configured: boolean; connected: boolean; message: string; url: string | null } | null>(null);
  const [supabaseSchema, setSupabaseSchema] = useState<string>('');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<any>(null);
  const [isCopied, setIsCopied] = useState(false);

  const fetchSupabaseInfo = async () => {
    setIsTestingConnection(true);
    try {
      const sRes = await fetch('/api/supabase/status');
      if (sRes.ok) {
        const sData = await sRes.json();
        setSupabaseStatus(sData);
      }
      const schemaRes = await fetch('/api/supabase/schema');
      if (schemaRes.ok) {
        const schemaData = await schemaRes.json();
        setSupabaseSchema(schemaData.schema);
      }
    } catch (e) {
      console.error('Error loading Supabase configuration info:', e);
    } finally {
      setIsTestingConnection(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'supabase') {
      fetchSupabaseInfo();
    }
  }, [activeTab]);

  useEffect(() => {
    closeEditor();
  }, [activeTab]);

  const handleCopySchema = () => {
    if (!supabaseSchema) return;
    navigator.clipboard.writeText(supabaseSchema);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSeedSupabase = async () => {
    setIsSeeding(true);
    setSeedResult(null);
    try {
      const res = await fetch('/api/supabase/seed', { method: 'POST' });
      const data = await res.json();
      setSeedResult(data);
      if (data.success) {
        // Fetch fresh stats to verify tables populated
        fetchSupabaseInfo();
      }
    } catch (err: any) {
      console.error('Seeding target database failed:', err);
      setSeedResult({ success: false, errors: [err.message || 'Connection timeout.'] });
    } finally {
      setIsSeeding(false);
    }
  };


  // --- CRUD Modal/Form States ---
  const [editorType, setEditorType] = useState<'create' | 'edit' | null>(null);
  
  // Active entity target
  const [targetUser, setTargetUser] = useState<Partial<User> | null>(null);
  const [targetCompany, setTargetCompany] = useState<Partial<Company> | null>(null);
  const [targetJob, setTargetJob] = useState<Partial<Job> | null>(null);

  // Custom non-blocking delete confirmation modal states
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    type: 'user' | 'company' | 'job' | null;
    id: string;
    title: string;
    description: string;
  }>({
    isOpen: false,
    type: null,
    id: '',
    title: '',
    description: ''
  });

  const triggerDelete = (type: 'user' | 'company' | 'job', id: string, title: string, description: string) => {
    setDeleteDialog({
      isOpen: true,
      type,
      id,
      title,
      description
    });
  };

  const executeDelete = async () => {
    const { type, id } = deleteDialog;
    if (!type || !id) return;

    try {
      if (type === 'user') {
        await onDeleteUser(id);
      } else if (type === 'company') {
        await onDeleteCompany(id);
      } else if (type === 'job') {
        await onDeleteJob(id);
      }
    } catch (err: any) {
      alert(`Gagal menghapus: ${err.message}`);
    } finally {
      setDeleteDialog({ isOpen: false, type: null, id: '', title: '', description: '' });
    }
  };

  // Filter pending/flagged jobs for quarantine oversight
  const flaggedJobs = jobs.filter(j => j.status === 'pending');
  const pendingCompanies = companies.filter(c => !c.isVerified);

  // --- Submit Handlers ---
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUser?.name || !targetUser?.email || !targetUser?.role) return;

    if (editorType === 'create') {
      await onAddUser(targetUser);
    } else if (editorType === 'edit' && targetUser.id) {
      await onUpdateUser(targetUser.id, targetUser);
    }
    closeEditor();
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCompany?.name) return;

    if (editorType === 'create') {
      await onAddCompany(targetCompany);
    } else if (editorType === 'edit' && targetCompany.id) {
      await onUpdateCompany(targetCompany.id, targetCompany);
    }
    closeEditor();
  };

  const handleJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetJob?.title || !targetJob?.companyId) return;

    // Resolve company name and logo
    const comp = companies.find(c => c.id === targetJob.companyId);
    const updatedJob = {
      ...targetJob,
      companyName: comp?.name || 'Assigned Corporate',
      companyLogo: comp?.logo || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=100&auto=format&fit=crop&q=60'
    };

    if (editorType === 'create') {
      // In-line creation simulates posting
      const skillsArray = (typeof targetJob.skillsRequired === 'string' 
        ? (targetJob.skillsRequired as string).split(',') 
        : (targetJob.skillsRequired || [])).map(s => s.trim()).filter(Boolean);
      const reqsArray = (typeof targetJob.requirements === 'string' 
        ? (targetJob.requirements as string).split(',') 
        : (targetJob.requirements || [])).map(r => r.trim()).filter(Boolean);

      // Create new
      const payload = {
        title: targetJob.title,
        companyId: targetJob.companyId,
        companyName: comp?.name || 'Dynamic Corp',
        location: targetJob.location || 'Remote',
        salaryRange: targetJob.salaryRange || '$5,000 / month',
        jobType: targetJob.jobType || 'Full-time',
        experienceLevel: targetJob.experienceLevel || 'Mid Level',
        description: targetJob.description || '',
        requirements: reqsArray,
        skillsRequired: skillsArray
      };
      
      if (onAddJob) {
        try {
          await onAddJob(payload);
          alert('Iklan lowongan berhasil ditambahkan!');
        } catch (err: any) {
          alert(`Gagal mempublikasikan iklan lowongan: ${err.message}`);
        }
      } else {
        // Fallback
        await fetch('/api/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        // Force sync
        const jRes = await fetch('/api/jobs');
        if (jRes.ok) {
          window.location.reload();
        }
      }
    } else if (editorType === 'edit' && targetJob.id) {
      // Pre-format arrays if string representation is active
      const skillsArray = Array.isArray(updatedJob.skillsRequired)
        ? updatedJob.skillsRequired
        : String(updatedJob.skillsRequired || '').split(',').map(s => s.trim()).filter(Boolean);
      const reqsArray = Array.isArray(updatedJob.requirements)
        ? updatedJob.requirements
        : String(updatedJob.requirements || '').split(',').map(r => r.trim()).filter(Boolean);

      await onUpdateJob(targetJob.id, {
        ...updatedJob,
        skillsRequired: skillsArray,
        requirements: reqsArray
      });
    }
    closeEditor();
  };

  const closeEditor = () => {
    setEditorType(null);
    setTargetUser(null);
    setTargetCompany(null);
    setTargetJob(null);
  };

  const openUserEditor = (type: 'create' | 'edit', u?: User) => {
    setEditorType(type);
    setTargetUser(u ? { ...u } : { name: '', email: '', role: 'seeker', avatar: '', password: '' });
  };

  const openCompanyEditor = (type: 'create' | 'edit', c?: Company) => {
    setEditorType(type);
    setTargetCompany(c ? { ...c } : { name: '', logo: '', description: '', industry: 'Technology', location: 'Remote', website: '', isVerified: false });
  };

  const openJobEditor = (type: 'create' | 'edit', j?: Job) => {
    setEditorType(type);
    setTargetJob(j ? { 
      ...j,
      skillsRequired: Array.isArray(j.skillsRequired) ? j.skillsRequired.join(', ') : j.skillsRequired,
      requirements: Array.isArray(j.requirements) ? j.requirements.join(', ') : j.requirements
    } : { 
      title: '', 
      companyId: companies[0]?.id || '', 
      location: 'Remote', 
      salaryRange: '$5,000 / month', 
      jobType: 'Full-time', 
      experienceLevel: 'Mid Level', 
      description: '', 
      skillsRequired: 'React, TypeScript', 
      requirements: '3+ years experience',
      status: 'approved',
      isSuspicious: false
    });
  };

  return (
    <div className="max-w-full mx-auto px-4 sm:px-8 md:px-12 py-8 text-left relative z-10">
      
      {/* Header Banner */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Shield className="w-7 h-7 text-indigo-500" /> {lang === 'id' ? 'Pusat Administrasi Platform' : 'Platform Administration Hub'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'id'
              ? 'Lakukan peninjauan database CRUD untuk registrasi pengguna multi-peran, lowongan pekerjaan, dan entitas korporasi.'
              : 'Complete database CRUD operations for multi-role user registry, workspace vacancies, and corporate entities.'}
          </p>
          {activeUser && (
            <div className="mt-3 flex items-center gap-3 p-2 px-3 rounded-2xl bg-indigo-50/45 dark:bg-indigo-950/20 border border-indigo-100/40 dark:border-indigo-950/40 w-fit">
              <img
                src={activeUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                className="w-7 h-7 rounded-lg object-cover border border-indigo-200/50 dark:border-indigo-800"
                alt="Admin Avatar"
              />
              <div className="text-left leading-none">
                <p className="text-2xs font-extrabold text-slate-900 dark:text-white leading-none">
                  {activeUser.name} <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded font-mono bg-indigo-100 dark:bg-indigo-950/80 text-indigo-650 dark:text-indigo-400">Admin</span>
                </p>
                <button
                  type="button"
                  onClick={onOpenProfileModal}
                  className="text-[9.5px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 mt-1 cursor-pointer"
                >
                  <Edit2 className="w-2.5 h-2.5" /> {lang === 'id' ? 'Edit Profil Admin Saya' : 'Edit My Admin profile'}
                </button>
              </div>
            </div>
          )}
        </div>


      </div>

      {/* Main Block Grid */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Main List according to selected Tab */}
        <div className={`${editorType ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-6`}>
          
          {/* TAB 1: MODERATION CHAMBER */}
          {activeTab === 'quarantine' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">Fraud Surveillance & Quarantine</h3>
                <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-full font-bold font-mono">
                  Quarantine items: {flaggedJobs.length} active
                </span>
              </div>

              {flaggedJobs.length === 0 ? (
                <div className="bg-white dark:bg-[#0a0c14] border border-slate-200 dark:border-slate-800 p-12 text-center rounded-2xl">
                  <CheckCircle className="w-10 h-10 mx-auto text-emerald-500" />
                  <p className="text-xs text-slate-650 dark:text-slate-400 mt-2 font-semibold">
                    Compliance Clear! There are no vacant positions flagged inside quarantine.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {flaggedJobs.map(job => (
                    <div key={job.id} className="bg-white dark:bg-[#0a0c14] border border-red-500/20 dark:border-red-950/40 p-5 rounded-2xl space-y-4 shadow-sm">
                      <div className="flex gap-2.5 p-3.5 bg-rose-500/15 text-rose-600 dark:text-rose-400 text-xs rounded-xl items-start leading-relaxed border border-rose-500/10">
                        <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-extrabold font-mono tracking-wider text-[10px] uppercase block mb-0.5">Automated Threat Flags Detected</strong>
                          <span className="font-medium">{job.suspiciousReason || 'Advance payment requested or high compensation anomaly.'}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-900">
                        <div className="flex items-center gap-3">
                          <img src={job.companyLogo} alt="" className="w-9 h-9 rounded-lg object-cover bg-slate-100" />
                          <div>
                            <h4 className="text-xs font-bold text-slate-905 dark:text-white">{job.title}</h4>
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{job.companyName}</span>
                          </div>
                        </div>
                        <span className="text-2xs font-mono font-black text-rose-500">{job.salaryRange}</span>
                      </div>

                      <div className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-medium">
                        <strong className="text-[10px] text-slate-400 font-mono tracking-wider block uppercase mb-1">Ad Transcript:</strong>
                        {job.description}
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-900 flex justify-between items-center text-2xs text-slate-400 font-mono">
                        <span>Created {new Date(job.createdAt).toLocaleDateString()}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => onModerateJob(job.id, 'rejected')}
                            className="bg-rose-600 hover:bg-rose-700 font-bold px-3 py-1.5 rounded-lg text-white transition-all shadow-sm"
                          >
                            Strike Off Spam
                          </button>
                          <button
                            onClick={() => onModerateJob(job.id, 'approved')}
                            className="bg-emerald-600 hover:bg-emerald-700 font-bold px-3 py-1.5 rounded-lg text-white transition-all shadow-sm"
                          >
                            Override Approval
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: COMPANIES LIST / CRUD */}
          {activeTab === 'companies' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">Enterprise Identity Listings</h3>
                <button
                  onClick={() => openCompanyEditor('create')}
                  className="bg-indigo-600 hover:bg-indigo-700 font-bold text-xs text-white px-3.5 py-1.5 rounded-lg flex items-center gap-1 transition-all shadow-md"
                >
                  <Plus className="w-4.5 h-4.5" /> Add Company Account
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {companies.map(company => (
                  <div key={company.id} className="bg-white dark:bg-[#0a0c10] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <img src={company.logo} alt="" className="w-10 h-10 object-cover rounded-lg bg-slate-100" />
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              {company.name}
                              {company.isVerified && <BadgeCheck className="w-4.5 h-4.5 text-indigo-500 fill-indigo-500/10" />}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{company.industry}</span>
                          </div>
                        </div>

                        <div className="flex gap-1.5">
                          <button
                            onClick={() => openCompanyEditor('edit', company)}
                            className="p-1 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all text-2xs font-bold flex items-center gap-0.5"
                          >
                            <Edit2 className="w-3 h-3" /> Edit
                          </button>
                          <button
                            onClick={() => triggerDelete('company', company.id, company.name, 'Ini akan menghapus profil perusahaan secara permanen beserta seluruh lowongan pekerjaan yang diterbitkan oleh perusahaan tersebut.')}
                            className="p-1 px-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-all text-2xs font-bold flex items-center gap-0.5"
                          >
                            <Trash2 className="w-3 h-3" /> Drop
                          </button>
                        </div>
                      </div>

                      <p className="text-2xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-3 font-medium">
                        {company.description || 'No corporate description supplied.'}
                      </p>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-900 flex items-center justify-between">
                      <span className="text-2xs font-mono text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-indigo-500" /> {company.location}
                      </span>
                      
                      <button
                        onClick={() => onToggleCompanyVerification(company.id, !company.isVerified)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition-all ${
                          company.isVerified
                            ? 'bg-rose-500/10 text-rose-500'
                            : 'bg-emerald-500/10 text-emerald-500'
                        }`}
                      >
                        {company.isVerified ? 'Revoke Badging' : 'Verify Organization'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 3: JOBS MANAGER */}
          {activeTab === 'jobs' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">Platform Careers Listing Registry</h3>
                <button
                  onClick={() => openJobEditor('create')}
                  className="bg-indigo-600 hover:bg-indigo-700 font-bold text-xs text-white px-3.5 py-1.5 rounded-lg flex items-center gap-1 transition-all shadow-md"
                >
                  <Plus className="w-4.5 h-4.5" /> Post New Job Ad
                </button>
              </div>

              <div className="bg-white dark:bg-[#0a0c10] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto scrollbar-thin shadow-sm">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-900 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      <th className="p-3 text-left">Vacancy Title & Company</th>
                      <th className="p-3 text-left">Specs</th>
                      <th className="p-3 text-left">Salary Plan</th>
                      <th className="p-3 text-left">Compliance</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                    {jobs.map(job => (
                      <tr key={job.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                        <td className="p-3 text-left">
                          <div className="flex items-center gap-2.5">
                            <img src={job.companyLogo} alt="" className="w-8 h-8 roundedobject-cover bg-slate-100" />
                            <div>
                              <strong className="text-slate-900 dark:text-white font-bold block">{job.title}</strong>
                              <span className="text-[10px] text-slate-450 mt-0.5 block">{job.companyName}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-left whitespace-nowrap">
                          <div className="space-y-0.5 font-mono text-[10px]">
                            <span className="block text-slate-500 dark:text-slate-400">{job.location}</span>
                            <span className="block text-indigo-500 font-bold">{job.jobType} • {job.experienceLevel}</span>
                          </div>
                        </td>
                        <td className="p-3 text-left font-mono font-bold text-[10px] text-slate-650 dark:text-slate-300">
                          {job.salaryRange}
                        </td>
                        <td className="p-3 text-left">
                          {job.isSuspicious ? (
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold text-rose-500 bg-rose-500/10 border border-rose-500/10">Quarantined</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/11">Approved</span>
                          )}
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <div className="flex gap-1 justify-end">
                            <button
                              onClick={() => openJobEditor('edit', job)}
                              className="p-1 px-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-500 transition-all rounded-md text-[10px] font-bold flex items-center gap-0.5"
                            >
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                            <button
                              onClick={() => triggerDelete('job', job.id, job.title, 'Ini akan menghapus iklan lowongan pekerjaan ini secara permanen dari platform Jaringan Karir.')}
                              className="p-1 px-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-all rounded-md text-[10px] font-bold flex items-center gap-0.5"
                            >
                              <Trash2 className="w-3 h-3" /> Drop
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB 4: USERS REGISTER / CRUD */}
          {activeTab === 'users' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">User Security Registrations</h3>
                <button
                  onClick={() => openUserEditor('create')}
                  className="bg-indigo-600 hover:bg-indigo-700 font-bold text-xs text-white px-3.5 py-1.5 rounded-lg flex items-center gap-1 transition-all shadow-md"
                >
                  <Plus className="w-4.5 h-4.5" /> Register Platform User
                </button>
              </div>

              <div className="bg-white dark:bg-[#0a0c10] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto scrollbar-thin shadow-sm">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-900 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      <th className="p-3 text-left">Identity Profile</th>
                      <th className="p-3 text-left">Address Mail</th>
                      <th className="p-3 text-left">Role Access</th>
                      <th className="p-3 text-left">Entity Association</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                    {users.map(user => {
                      const linkedComp = companies.find(c => c.id === user.companyId);
                      return (
                        <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                          <td className="p-3 text-left">
                            <div className="flex items-center gap-2.5">
                              <img src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} alt="" className="w-8 h-8 rounded-full object-cover" />
                              <div>
                                <strong className="text-slate-900 dark:text-white font-bold block">{user.name}</strong>
                                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{user.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-left font-mono text-slate-650 dark:text-slate-350">{user.email}</td>
                          <td className="p-3 text-left">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold capitalize ${
                              user.role === 'admin' 
                                ? 'bg-indigo-500/15 text-indigo-500' 
                                : user.role === 'recruiter' 
                                ? 'bg-amber-500/15 text-amber-500' 
                                : 'bg-slate-150 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="p-3 text-left text-slate-500 dark:text-slate-400 font-medium">
                            {linkedComp ? linkedComp.name : <span className="text-slate-400 font-mono text-2xs">- None -</span>}
                          </td>
                          <td className="p-3 text-right whitespace-nowrap">
                            <div className="flex gap-1 justify-end">
                              <button
                                onClick={() => openUserEditor('edit', user)}
                                className="p-1 px-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-500 transition-all rounded-md text-[10px] font-bold flex items-center gap-0.5"
                              >
                                <Edit2 className="w-3 h-3" /> Edit
                              </button>
                              <button
                                onClick={() => triggerDelete('user', user.id, user.name, 'Tindakan ini tidak dapat dibatalkan. Menghapus akun pengguna akan mencabut seluruh akses dan data profil mereka dari sistem.')}
                                className="p-1 px-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-all rounded-md text-[10px] font-bold flex items-center gap-0.5"
                              >
                                <Trash2 className="w-3 h-3" /> Drop
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB 5: SYSTEM METRICS */}
          {activeTab === 'analytics' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">System Analytics Summary</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#0a0c10] p-5 rounded-2xl border border-slate-205 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-mono font-black text-slate-400">Total Registered Seekers</span>
                  <p className="text-2xl font-black mt-2 text-slate-900 dark:text-white font-display">
                    {users.filter(u => u.role === 'seeker').length}
                  </p>
                </div>

                <div className="bg-white dark:bg-[#0a0c10] p-5 rounded-2xl border border-slate-205 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-mono font-black text-slate-400">Total Active Employers</span>
                  <p className="text-2xl font-black mt-2 text-slate-900 dark:text-white font-display">
                    {companies.length}
                  </p>
                </div>

                <div className="bg-white dark:bg-[#0a0c10] p-5 rounded-2xl border border-slate-205 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-mono font-black text-slate-400">Total Applications Processed</span>
                  <p className="text-2xl font-black mt-2 text-slate-900 dark:text-white font-display">{applications.length}</p>
                </div>

                <div className="bg-white dark:bg-[#0a0c10] p-5 rounded-2xl border border-slate-205 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-mono font-black text-slate-400">Successful Placements</span>
                  <p className="text-2xl font-black mt-2 text-emerald-500 font-display">
                    {applications.filter(a => a.status === 'accepted').length}
                  </p>
                </div>
              </div>

              {/* Conversion bar view */}
              <div className="bg-white dark:bg-[#0a0c10] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white font-display pb-3 border-b border-slate-100 dark:border-slate-900 mb-4">
                  Match Compatibility Conversion metrics
                </h4>
                <div className="space-y-4 font-medium text-xs">
                  <div>
                    <div className="flex justify-between text-2xs text-slate-450 uppercase mb-1.5">
                      <span>Excellent Matching (&gt;80% Score)</span>
                      <span>{applications.filter(a => a.matchPercent >= 80).length} Applicant Profile(s)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-900 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(applications.filter(a => a.matchPercent >= 80).length / (applications.length || 1)) * 100}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-2xs text-slate-450 uppercase mb-1.5">
                      <span>Moderated Matching (50%-80% Score)</span>
                      <span>{applications.filter(a => a.matchPercent >= 50 && a.matchPercent < 80).length} Applicant Profile(s)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-900 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(applications.filter(a => a.matchPercent >= 50 && a.matchPercent < 80).length / (applications.length || 1)) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 6: SUPABASE DATABASE CONNECTOR */}
          {activeTab === 'supabase' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">Supabase Integration & Database Center</h3>
                {isTestingConnection ? (
                  <span className="flex items-center gap-1 text-2xs font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Verifying Connection...
                  </span>
                ) : (
                  <button 
                    onClick={fetchSupabaseInfo}
                    className="flex items-center gap-1 text-2xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Refresh Status
                  </button>
                )}
              </div>

              {/* Status Header Block */}
              {supabaseStatus ? (
                <div className={`p-6 rounded-2xl border ${
                  supabaseStatus.connected 
                    ? 'bg-emerald-500/5 border-emerald-500/20 dark:border-emerald-500/10 text-emerald-800 dark:text-emerald-350' 
                    : supabaseStatus.configured 
                      ? 'bg-amber-500/5 border-amber-500/20 dark:border-amber-500/10 text-amber-800 dark:text-amber-350'
                      : 'bg-indigo-500/5 border-indigo-500/20 dark:border-indigo-500/10 text-indigo-800 dark:text-indigo-350'
                } space-y-4`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${
                      supabaseStatus.connected 
                        ? 'bg-emerald-500/15 text-emerald-600' 
                        : supabaseStatus.configured 
                          ? 'bg-amber-500/15 text-amber-600'
                          : 'bg-indigo-500/15 text-indigo-600'
                    }`}>
                      <Database className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold tracking-tight">
                        {supabaseStatus.connected 
                          ? 'Supabase Cloud Cluster: Online & Connected' 
                          : supabaseStatus.configured 
                            ? 'Connection Pending Configuration'
                            : 'Supabase Integration is Local Enabled'}
                      </h4>
                      <p className="text-xs mt-1 opacity-90 leading-relaxed font-semibold">
                        {supabaseStatus.message}
                      </p>
                    </div>
                  </div>

                  {supabaseStatus.url && (
                    <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-wrap gap-4 items-center justify-between text-2xs font-mono font-bold text-slate-500">
                      <span>Endpoint: <code className="bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded text-indigo-505 font-mono select-all font-bold">{supabaseStatus.url}</code></span>
                      {supabaseStatus.connected && (
                        <div className="flex items-center gap-1.5 text-emerald-500">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Active PostgreSQL Connection Mode
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-12 text-center border border-slate-205 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 font-semibold text-xs text-slate-400">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-2" />
                  Analyzing Supabase environment metadata...
                </div>
              )}

              {/* Action Operations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Seed Database section */}
                <div className="bg-white dark:bg-[#0a0c10] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm">
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-indigo-500">Seed Demo Data to Supabase</h4>
                    <p className="text-xs text-slate-505 dark:text-slate-400 leading-relaxed font-semibold">
                      Publish the initial preloaded mock dataset (users, registered companies, job advertisements, applications, as well as digital resumes) directly into your live Supabase database tables with a single click.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      disabled={!supabaseStatus?.connected || isSeeding}
                      onClick={handleSeedSupabase}
                      className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md ${
                        isSeeding 
                          ? 'bg-slate-100 dark:bg-slate-900 text-slate-450' 
                          : supabaseStatus?.connected 
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-90 cursor-pointer font-sans' 
                            : 'bg-slate-105 dark:bg-slate-900/60 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      {isSeeding ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Seeding live database...
                        </>
                      ) : (
                        <>
                          <Database className="w-4 h-4" /> Seed Supabase Database Now
                        </>
                      )}
                    </button>

                    {seedResult && (
                      <div className={`p-4 rounded-xl text-2xs space-y-2 leading-relaxed border ${
                        seedResult.success 
                          ? 'bg-emerald-500/10 border-emerald-500/15 text-emerald-650 dark:text-emerald-400' 
                          : 'bg-rose-500/10 border-rose-500/15 text-rose-500'
                      }`}>
                        <div className="font-extrabold flex items-center gap-1 font-sans">
                          {seedResult.success ? '✓ Migration Seeding Completed Successfully!' : '⚠ Seeding Encountered Anomalies:'}
                        </div>
                        {seedResult.success ? (
                          <div className="font-mono text-[10px] grid grid-cols-2 gap-1 pt-1 border-t border-emerald-500/10 font-bold">
                            <span>Users: +{seedResult.inserted.users}</span>
                            <span>Companies: +{seedResult.inserted.companies}</span>
                            <span>Jobs: +{seedResult.inserted.jobs}</span>
                            <span>Profiles: +{seedResult.inserted.profiles}</span>
                            <span>Applications: +{seedResult.inserted.applications}</span>
                            <span>Announcements: +{seedResult.inserted.announcements}</span>
                          </div>
                        ) : (
                          <ul className="list-disc list-inside space-y-1 mt-1 font-bold">
                            {seedResult.errors?.map((err: string, i: number) => (
                              <li key={i}>{err}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Schema setup link */}
                <div className="bg-white dark:bg-[#0a0c10] border border-slate-205 dark:border-slate-800 p-6 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm">
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-indigo-500">Need Table Schemas?</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed font-semibold">
                      To successfully establish records and store users, you must prepare the database table structures. Copy our fully compatible Postgres SQL Script below and execute it inside the <strong className="text-slate-700 dark:text-white font-sans">Supabase Console &gt; SQL Editor</strong> screen.
                    </p>
                  </div>

                  <a 
                    href="https://supabase.com/dashboard" 
                    target="_blank" 
                    referrerPolicy="no-referrer"
                    className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-150 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-250 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm font-sans"
                  >
                    Open Supabase Dashboard <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

              </div>

              {/* SQL Code Block Area */}
              <div className="bg-[#04060d] border border-slate-800/80 rounded-2xl overflow-hidden mt-6 shadow-xl">
                <div className="bg-slate-950/80 px-4 py-3 flex items-center justify-between border-b border-slate-800/60 font-sans">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] font-mono font-black tracking-wider text-slate-350 uppercase">
                      setup_database_schema.sql
                    </span>
                  </div>

                  <button
                    onClick={handleCopySchema}
                    disabled={!supabaseSchema}
                    className="flex items-center gap-1 text-2xs font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Code Script
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 overflow-x-auto max-h-[340px] font-mono text-[10px] leading-relaxed text-slate-300 antialiased select-text scrollbar-thin scrollbar-thumb-slate-800">
                  {supabaseSchema ? (
                    <pre className="font-mono whitespace-pre text-left font-bold">{supabaseSchema}</pre>
                  ) : (
                    <div className="text-slate-500 font-sans p-6 text-center">
                      Rendering database SQL codes...
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

        </div>

        {/* RIGHT COLUMN: Interactive CRUD Editor Panel */}
        {editorType && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="lg:col-span-5 bg-white dark:bg-[#0a0c10] p-6 rounded-2xl border border-indigo-500/20 dark:border-indigo-900/40 shadow-xl space-y-5 sticky top-24"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-900">
              <h3 className="text-xs font-black uppercase tracking-wider text-indigo-500 flex items-center gap-1">
                {editorType === 'create' ? <Plus className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                {editorType === 'create' ? 'Create' : 'Edit'} {activeTab.slice(0, -1)}
              </h3>
              <button onClick={closeEditor} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-655 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* A. User Editor */}
            {activeTab === 'users' && targetUser && (
              <form onSubmit={handleUserSubmit} className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-2xs font-bold text-slate-400 font-mono uppercase tracking-widest">Full Name</label>
                  <input
                    required
                    type="text"
                    value={targetUser.name || ''}
                    onChange={e => setTargetUser({ ...targetUser, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs"
                    placeholder="e.g. Budi Hartono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-bold text-slate-400 font-mono uppercase tracking-widest">Email Address</label>
                  <input
                    required
                    type="email"
                    value={targetUser.email || ''}
                    onChange={e => setTargetUser({ ...targetUser, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs"
                    placeholder="e.g. budihartono@gmail.com"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-bold text-slate-400 font-mono uppercase tracking-widest">Password</label>
                  <input
                    type="text"
                    value={targetUser.password || ''}
                    onChange={e => setTargetUser({ ...targetUser, password: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs font-mono"
                    placeholder="Set user password"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-2xs font-bold text-slate-400 font-mono uppercase tracking-widest">Role Type</label>
                    <select
                      value={targetUser.role || 'seeker'}
                      onChange={e => setTargetUser({ ...targetUser, role: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-250 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs"
                    >
                      <option value="seeker">Job Seeker</option>
                      <option value="recruiter">Recruiter</option>
                      <option value="admin">Platform Admin</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-2xs font-bold text-slate-400 font-mono uppercase tracking-widest">Employer Co</label>
                    <select
                      value={targetUser.companyId || ''}
                      onChange={e => setTargetUser({ ...targetUser, companyId: e.target.value || '' })}
                      className="w-full px-3 py-2 border border-slate-250 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs"
                    >
                      <option value="">-- None (unaffiliated) --</option>
                      {companies.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-bold text-slate-400 font-mono uppercase tracking-widest">Avatar Image URL</label>
                  <input
                    type="text"
                    value={targetUser.avatar || ''}
                    onChange={e => setTargetUser({ ...targetUser, avatar: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs"
                    placeholder="Optional Unsplash URL"
                  />
                </div>

                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 py-2.5 text-xs text-white font-bold rounded-xl transition-all shadow-md">
                  Commit Registry Entry
                </button>
              </form>
            )}

            {/* B. Company Editor */}
            {activeTab === 'companies' && targetCompany && (
              <form onSubmit={handleCompanySubmit} className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-2xs font-bold text-slate-400 font-mono uppercase tracking-widest">Company Brand Name</label>
                  <input
                    required
                    type="text"
                    value={targetCompany.name || ''}
                    onChange={e => setTargetCompany({ ...targetCompany, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs"
                    placeholder="e.g. Tokopedia"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 font-semibold">
                    <label className="text-2xs font-bold text-slate-400 font-mono uppercase tracking-widest">Industry Group</label>
                    <input
                      type="text"
                      value={targetCompany.industry || 'Technology'}
                      onChange={e => setTargetCompany({ ...targetCompany, industry: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs"
                    />
                  </div>

                  <div className="space-y-1 font-semibold">
                    <label className="text-2xs font-bold text-slate-400 font-mono uppercase tracking-widest">Headquarters Office</label>
                    <input
                      type="text"
                      value={targetCompany.location || 'Jakarta, ID'}
                      onChange={e => setTargetCompany({ ...targetCompany, location: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-bold text-slate-400 font-mono uppercase tracking-widest">Company Website</label>
                  <input
                    type="text"
                    value={targetCompany.website || ''}
                    onChange={e => setTargetCompany({ ...targetCompany, website: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs"
                    placeholder="e.g. https://company.com"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-bold text-slate-400 font-mono uppercase tracking-widest">Logo Image URL</label>
                  <input
                    type="text"
                    value={targetCompany.logo || ''}
                    onChange={e => setTargetCompany({ ...targetCompany, logo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-bold text-slate-400 font-mono uppercase tracking-widest">Identity & Operations Bio</label>
                  <textarea
                    rows={3}
                    value={targetCompany.description || ''}
                    onChange={e => setTargetCompany({ ...targetCompany, description: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                    placeholder="Short description..."
                  />
                </div>

                <div className="flex items-center gap-2 py-1 font-semibold">
                  <input
                    type="checkbox"
                    id="isVerifiedCheck"
                    checked={!!targetCompany.isVerified}
                    onChange={e => setTargetCompany({ ...targetCompany, isVerified: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-650 bg-slate-100 dark:bg-slate-950"
                  />
                  <label htmlFor="isVerifiedCheck" className="text-xs text-slate-650 dark:text-slate-300">
                    Grant Verifiable Corporate Security Badge
                  </label>
                </div>

                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 py-2.5 text-xs text-white font-bold rounded-xl transition-all shadow-md">
                  Commit Corporate Entry
                </button>
              </form>
            )}

            {/* C. Job Editor */}
            {activeTab === 'jobs' && targetJob && (
              <form onSubmit={handleJobSubmit} className="space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-2xs font-bold text-slate-400 font-mono uppercase tracking-widest">Ad Title</label>
                    <input
                      required
                      type="text"
                      value={targetJob.title || ''}
                      onChange={e => setTargetJob({ ...targetJob, title: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs"
                      placeholder="e.g. React Developer"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-2xs font-bold text-slate-400 font-mono uppercase tracking-widest">Corporate Affiliation</label>
                    <select
                      value={targetJob.companyId || ''}
                      onChange={e => setTargetJob({ ...targetJob, companyId: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-250 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs"
                    >
                      {companies.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1 font-semibold">
                    <label className="text-2xs font-bold text-slate-400 font-mono uppercase tracking-widest font-mono">Type</label>
                    <select
                      value={targetJob.jobType || 'Full-time'}
                      onChange={e => setTargetJob({ ...targetJob, jobType: e.target.value as any })}
                      className="w-full px-2 py-2 border border-slate-250 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Remote">Remote</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>

                  <div className="space-y-1 font-semibold">
                    <label className="text-2xs font-bold text-slate-400 font-mono uppercase tracking-widest">Level</label>
                    <select
                      value={targetJob.experienceLevel || 'Mid Level'}
                      onChange={e => setTargetJob({ ...targetJob, experienceLevel: e.target.value as any })}
                      className="w-full px-2 py-2 border border-slate-250 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs"
                    >
                      <option value="Entry Level">Entry Level</option>
                      <option value="Mid Level">Mid Level</option>
                      <option value="Senior Level">Senior Level</option>
                    </select>
                  </div>

                  <div className="space-y-1 font-semibold">
                    <label className="text-2xs font-bold text-slate-400 font-mono uppercase tracking-widest">Compensation</label>
                    <input
                      type="text"
                      value={targetJob.salaryRange || ''}
                      onChange={e => setTargetJob({ ...targetJob, salaryRange: e.target.value })}
                      className="w-full px-2 py-2 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-bold text-slate-400 font-mono uppercase tracking-widest">Office Setup / Location</label>
                  <input
                    type="text"
                    value={targetJob.location || 'Remote'}
                    onChange={e => setTargetJob({ ...targetJob, location: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-bold text-slate-400 font-mono uppercase tracking-widest">Skills Tags (Comma separated)</label>
                  <input
                    type="text"
                    value={String(targetJob.skillsRequired || '')}
                    onChange={e => setTargetJob({ ...targetJob, skillsRequired: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-bold text-slate-400 font-mono uppercase tracking-widest">Target Requirements (Comma separated)</label>
                  <input
                    type="text"
                    value={String(targetJob.requirements || '')}
                    onChange={e => setTargetJob({ ...targetJob, requirements: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-bold text-slate-400 font-mono uppercase tracking-widest">Ad description</label>
                  <textarea
                    rows={4}
                    value={targetJob.description || ''}
                    onChange={e => setTargetJob({ ...targetJob, description: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                    placeholder="Paste job details here..."
                  />
                </div>

                {editorType === 'edit' && (
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-900">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <input
                        type="checkbox"
                        id="isSuspiciousCheck"
                        checked={!!targetJob.isSuspicious}
                        onChange={e => setTargetJob({ ...targetJob, isSuspicious: e.target.checked, status: e.target.checked ? 'pending' : 'approved' })}
                        className="w-4 h-4 rounded text-rose-500"
                      />
                      <label htmlFor="isSuspiciousCheck" className="text-2xs text-rose-500">Quarantined Fraud Flag</label>
                    </div>

                    <div className="space-y-1 font-semibold">
                      <label className="text-[9px] text-slate-400 font-mono tracking-wider block">Compliance Reason</label>
                      <input
                        type="text"
                        value={targetJob.suspiciousReason || ''}
                        onChange={e => setTargetJob({ ...targetJob, suspiciousReason: e.target.value })}
                        className="w-full p-1.5 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded text-[10px]"
                        placeholder="Suspect wire etc."
                      />
                    </div>
                  </div>
                )}

                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 py-2.5 text-xs text-white font-bold rounded-xl transition-all shadow-md">
                  Commit Careers Ad Entry
                </button>
              </form>
            )}

          </motion.div>
        )}

      </div>

      {/* Custom Non-blocking Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteDialog.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Ambient Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteDialog(prev => ({ ...prev, isOpen: false }))}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative w-full max-w-md overflow-hidden bg-white dark:bg-[#0c0f17] border border-rose-500/20 dark:border-rose-950 rounded-2xl p-6 shadow-2xl space-y-4"
            >
              {/* Top Alert Accent Icon */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 flex-shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-display">Tindakan Berkadar Bahaya</h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5 select-all">ID: {deleteDialog.id}</p>
                </div>
              </div>

              {/* Body */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-350">
                  Anda akan menghapus entitas <span className="text-rose-500 underline font-extrabold">{deleteDialog.title}</span>?
                </p>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-400/80 leading-relaxed bg-slate-50 dark:bg-slate-950/50 p-3 rounded-lg border border-slate-150 dark:border-slate-900">
                  {deleteDialog.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setDeleteDialog(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all"
                >
                  Batalkan
                </button>
                <button
                  onClick={executeDelete}
                  className="flex-1 py-2 px-3 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-rose-500/10 flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-4.5 h-4.5" /> Drop Permanen
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
