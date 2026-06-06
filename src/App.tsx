import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Sparkles, X, MapPin, Briefcase, Lock, AlertOctagon, HelpCircle, LogOut } from 'lucide-react';
import { User, Job, Company, JobSeekerProfile, Application, CompanyAnnouncement } from './types';
import { useLanguage } from './LanguageContext';

// Import our cohesive sandbox modules
import Splash from './components/Splash';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import SeekerDashboard from './components/SeekerDashboard';
import CVAnalyzerTab from './components/CVAnalyzerTab';
import InterviewTab from './components/InterviewTab';
import RecruiterDashboardView from './components/RecruiterDashboardView';
import AdminPanelView from './components/AdminPanelView';
import AdminSidebar from './components/AdminSidebar';
import UserSidebar from './components/UserSidebar';
import ChatSystemView from './components/ChatSystemView';
import UserProfileModal from './components/UserProfileModal';
import WelcomeTutorialModal from './components/WelcomeTutorialModal';
import { localizeJob } from './utils/jobTranslations';

export default function App() {
  const { t, lang } = useLanguage();
  const [showSplash, setShowSplash] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentPage, setCurrentPage] = useState<'landing' | 'dashboard' | 'analyzer' | 'simulator' | 'chats'>(() => {
    try {
      const stored = localStorage.getItem('talenta_current_page');
      if (stored && ['landing', 'dashboard', 'analyzer', 'simulator', 'chats'].includes(stored)) {
        return stored as any;
      }
    } catch {}
    return 'landing';
  });

  // Multi-role state definitions
  const [users, setUsers] = useState<User[]>([]);
  const [activeUser, setActiveUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('talenta_active_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [companies, setCompanies] = useState<Company[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [seekerProfile, setSeekerProfile] = useState<JobSeekerProfile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedJobDetail, setSelectedJobDetail] = useState<Job | null>(null);
  const [applyConfirmation, setApplyConfirmation] = useState<{ jobId: string; anonymousMode: boolean } | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [announcements, setAnnouncements] = useState<CompanyAnnouncement[]>([]);
  const [adminActiveTab, setAdminActiveTab] = useState<'quarantine' | 'companies' | 'jobs' | 'users' | 'analytics' | 'supabase'>('quarantine');
  const [seekerActiveTab, setSeekerActiveTab] = useState<'overview' | 'recommendations' | 'tracker' | 'profile' | 'announcements'>('overview');
  const [recruiterActiveTab, setRecruiterActiveTab] = useState<'applicants' | 'post-job' | 'announcements' | 'company-profile'>('applicants');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // Onboarding auth modal states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showWelcomeTutorial, setShowWelcomeTutorial] = useState(false);
  const [activeAuthTab, setActiveAuthTab] = useState<'login' | 'custom'>('login');
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customPassword, setCustomPassword] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [customRole, setCustomRole] = useState<'seeker' | 'recruiter' | 'admin'>('seeker');

  // Shared search states from Home Landing query
  const [globalSearch, setGlobalSearch] = useState('');
  const [globalLocation, setGlobalLocation] = useState('');
  const [globalJobType, setGlobalJobType] = useState('All');

  // Sync Global Theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Sync active user to localStorage
  useEffect(() => {
    if (activeUser) {
      localStorage.setItem('talenta_active_user_id', activeUser.id);
      localStorage.setItem('talenta_active_user', JSON.stringify(activeUser));
    } else {
      localStorage.removeItem('talenta_active_user_id');
      localStorage.removeItem('talenta_active_user');
      localStorage.removeItem('talenta_current_page');
    }
  }, [activeUser]);

  // Sync current page to localStorage
  useEffect(() => {
    if (currentPage) {
      localStorage.setItem('talenta_current_page', currentPage);
    }
  }, [currentPage]);

  // Primary REST Pull Sync helper
  const pullPlatformData = async () => {
    try {
      // 1. Fetch Users
      const uRes = await fetch('/api/users');
      if (uRes.ok) {
        const uData: User[] = await uRes.json();
        setUsers(uData);
        
        // Restore/Update current active user from fresh database pull if exists
        const storedUserId = localStorage.getItem('talenta_active_user_id');
        if (storedUserId) {
          const matched = uData.find(u => u.id === storedUserId);
          if (matched) {
            setActiveUser(matched);
          }
        }
      }

      // 2. Fetch Companies
      const cRes = await fetch('/api/companies');
      if (cRes.ok) setCompanies(await cRes.json());

      // 3. Fetch Jobs
      const jRes = await fetch('/api/jobs');
      if (jRes.ok) setJobs(await jRes.json());

      // 4. Fetch Applications List
      const aRes = await fetch('/api/applications');
      if (aRes.ok) setApplications(await aRes.json());

      // 5. Fetch Announcements List
      const annRes = await fetch('/api/announcements');
      if (annRes.ok) setAnnouncements(await annRes.json());


    } catch (err) {
      console.error('Initial data loading timeout:', err);
    }
  };

  // Poll databases on start
  useEffect(() => {
    pullPlatformData();
  }, []);

  // Fetch / Sync specific student profiles when activeUser shifts
  useEffect(() => {
    if (activeUser && activeUser.role === 'seeker') {
      const loadProfile = async () => {
        try {
          const res = await fetch(`/api/profile/${activeUser.id}`);
          if (res.ok) {
            setSeekerProfile(await res.json());
          } else {
            // Supply fallback to avoid blank screen and persist it to the server DB
            const fallback = {
              id: activeUser.id,
              title: 'Aspirational Candidate',
              bio: `Welcome! Let's optimize my anonymous profile resume information to begin.`,
              skills: ['React', 'TypeScript', 'Tailwind CSS'],
              experience: [],
              education: [],
              portfolio: [],
              cvText: `Full Name: ${activeUser.name}\nEmail: ${activeUser.email}`
            };
            setSeekerProfile(fallback);
            await fetch(`/api/profile/${activeUser.id}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(fallback)
            });
          }
        } catch (e) {
          console.error('Seeker profile loading failure:', e);
          const fallback = {
            id: activeUser.id,
            title: 'Aspirational Candidate',
            bio: `Welcome! Let's optimize my anonymous profile resume information to begin.`,
            skills: ['React', 'TypeScript', 'Tailwind CSS'],
            experience: [],
            education: [],
            portfolio: [],
            cvText: `Full Name: ${activeUser.name}\nEmail: ${activeUser.email}`
          };
          setSeekerProfile(fallback);
          // Try to persist fallback even on catch if connection allows
          try {
            await fetch(`/api/profile/${activeUser.id}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(fallback)
            });
          } catch (_) {}
        }
      };
      loadProfile();
    } else {
      setSeekerProfile(null);
    }
  }, [activeUser]);

  // Check if activeUser needs the onboarding welcome tutorial popup
  useEffect(() => {
    if (activeUser) {
      const seen = localStorage.getItem(`talenta_welcome_seen_${activeUser.id}`);
      if (!seen) {
        setShowWelcomeTutorial(true);
        localStorage.setItem(`talenta_welcome_seen_${activeUser.id}`, 'true');
      }
    } else {
      setShowWelcomeTutorial(false);
    }
  }, [activeUser]);

  // Redirect system admin directly to backend oversight dashboard, bypassing normal landing
  useEffect(() => {
    if (activeUser && activeUser.role === 'admin') {
      if (currentPage !== 'dashboard') {
        setCurrentPage('dashboard');
      }
    }
  }, [activeUser, currentPage]);

  // Role shifting triggers (Sandbox dropdown toggle helper)
  const handleRoleChange = (role: User['role']) => {
    const matchedUser = users.find(u => u.role === role);
    if (matchedUser) {
      setActiveUser(matchedUser);
      setSelectedJobDetail(null);
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const executeLogout = () => {
    setActiveUser(null);
    setSeekerProfile(null);
    setCurrentPage('landing');
    setSelectedJobDetail(null);
    setShowLogoutConfirm(false);
  };

  // Secure navigation interceptor: requires login for platform pages
  const handlePageNavigation = (
    page: 'landing' | 'dashboard' | 'analyzer' | 'simulator' | 'chats',
    query?: string,
    location?: string,
    type?: string
  ) => {
    if (typeof query === 'string') setGlobalSearch(query);
    if (typeof location === 'string') setGlobalLocation(location);
    if (typeof type === 'string') setGlobalJobType(type);

    if (page !== 'landing' && !activeUser) {
      setShowLoginModal(true);
    } else {
      setCurrentPage(page);
      setSelectedJobDetail(null);
    }
  };

  const [loadingProcess, setLoadingProcess] = useState<string | null>(null);

  // Helper to standardise all asynchronous operations with premium popup feedback running minimum 1.5s
  const runWithLoading = async <T,>(
    message: string,
    processFn: () => Promise<T>
  ): Promise<T> => {
    setLoadingProcess(message);
    const startTime = Date.now();
    try {
      const result = await processFn();
      const elapsed = Date.now() - startTime;
      if (elapsed < 1500) {
        await new Promise((resolve) => setTimeout(resolve, 1500 - elapsed));
      }
      return result;
    } catch (error) {
      const elapsed = Date.now() - startTime;
      if (elapsed < 1500) {
        await new Promise((resolve) => setTimeout(resolve, 1500 - elapsed));
      }
      throw error;
    } finally {
      setLoadingProcess(null);
    }
  };

  const handleRegisterCustomUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customEmail.trim() || !customPassword.trim()) {
      setAuthError(lang === 'id' ? 'Semua kolom input (Nama, Email, dan Password) wajib diisi!' : 'All fields (Name, Email, and Password) are mandatory!');
      return;
    }
    if (customPassword.length < 8) {
      setAuthError(lang === 'id' ? 'Password tidak boleh kurang dari 8 karakter!' : 'Password must be at least 8 characters!');
      return;
    }
    setAuthError(null);

    try {
      await runWithLoading('Mendaftarkan Akun Baru...', async () => {
        const res = await fetch('/api/users/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: customName,
            email: customEmail,
            role: customRole,
            password: customPassword,
            avatar: `https://images.unsplash.com/photo-${
              customRole === 'seeker' 
                ? '1535713875002-d1d0cf377fde' 
                : customRole === 'recruiter' 
                  ? '1494790108377-be9c29b29330' 
                  : '1570295999919-56ceb5ecca61'
            }?w=150&auto=format&fit=crop&q=80`
          })
        });

        if (res.ok) {
          const newUser: User = await res.json();
          
          // Reload Users from DB
          const uRes = await fetch('/api/users');
          if (uRes.ok) {
            const uData = await uRes.json();
            setUsers(uData);
          }

          // Custom initialize a seeker profile in db.json automatically for seekers
          if (customRole === 'seeker') {
            await fetch(`/api/profile/${newUser.id}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: newUser.id,
                title: 'Aspirational Professional',
                bio: `Welcome! Let's optimize my anonymous profile resume information to begin.`,
                skills: ['React', 'TypeScript', 'Tailwind CSS'],
                experience: [],
                education: [],
                portfolio: [],
                cvText: `Full Name: ${newUser.name}\nEmail: ${newUser.email}`
              })
            });
          }

          setActiveUser(newUser);
          setShowLoginModal(false);
          setCustomName('');
          setCustomEmail('');
          setCustomPassword('');
          setCurrentPage('dashboard');
        } else {
          const body = await res.json();
          setAuthError(body.error || 'Failed to register account.');
          alert(`Failed to register account: ${body.error || 'Unknown error'}`);
        }
      });
    } catch (err) {
      console.error('Error during custom user setup:', err);
    }
  };

  const handleLoginCustomUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) return;
    setAuthError(null);

    try {
      await runWithLoading('Sedang memverifikasi kredensial akun...', async () => {
        const res = await fetch('/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: loginEmail,
            password: loginPassword || undefined
          })
        });

        if (res.ok) {
          const user: User = await res.json();
          
          // Reload Users from DB
          const uRes = await fetch('/api/users');
          if (uRes.ok) {
            const uData = await uRes.json();
            setUsers(uData);
          }

          setActiveUser(user);
          setShowLoginModal(false);
          setLoginEmail('');
          setLoginPassword('');
          setCurrentPage('dashboard');
        } else {
          const body = await res.json();
          setAuthError(body.error || 'Gagal masuk. Silakan coba lagi.');
          alert(`Gagal Masuk: ${body.error || 'Kredensial salah'}`);
        }
      });
    } catch (err) {
      console.error('Error during login:', err);
      setAuthError('Gagal melakukan sinkronisasi server.');
    }
  };

  // Save unified user profile settings from modal
  const handleSaveProfileModal = async (updates: Partial<User>) => {
    if (!activeUser) return;
    try {
      await runWithLoading(lang === 'id' ? 'Menyimpan Perubahan Profil Akun Anda...' : 'Saving Account Profile Changes...', async () => {
        const res = await fetch('/api/users/edit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: activeUser.id, ...updates })
        });
        if (res.ok) {
          const body = await res.json();
          if (body.success && body.item) {
            setActiveUser(body.item);
            setUsers(prev => prev.map(u => u.id === activeUser.id ? body.item : u));
          }
        }
      });
    } catch (err) {
      console.error('Failed to post user update:', err);
    }
  };

  // Modify CV profile information (Digital Resume settings)
  const handleUpdateProfile = async (updated: JobSeekerProfile) => {
    if (!activeUser) return;
    try {
      await runWithLoading('Menyimpan Perubahan Rincian Profil & Mengindeks CV Anda...', async () => {
        const res = await fetch(`/api/profile/${activeUser.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });
        if (res.ok) {
          const body = await res.json();
          setSeekerProfile(body.profile);
        }
      });
    } catch (err) {
      console.error('Failed to post profile changes:', err);
    }
  };

  // Initiate apply flow showing dynamic pop up
  const handleApplyJob = async (jobId: string, anonymousMode: boolean) => {
    if (!activeUser) {
      setShowLoginModal(true);
      return;
    }
    setAgreedToTerms(false);
    setApplyConfirmation({ jobId, anonymousMode });
  };

  // The actual submission called after clicking "Daftar" in the terms modal
  const handleApplyJobConfirm = async (jobId: string, anonymousMode: boolean) => {
    if (!activeUser) return;
    try {
      await runWithLoading('Mendaftarkan Lamaran & Membuka Pemindaian AI Match Score...', async () => {
        const res = await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobId,
            applicantId: activeUser.id,
            anonymousMode
          })
        });

        if (res.ok) {
          // Reload Applications list from Database
          const aRes = await fetch('/api/applications');
          if (aRes.ok) setApplications(await aRes.json());
          alert('Pendaftaran Berhasil! CV/Profil Anda telah terkirim dan AI sedang menganalisis kecocokan.');
          setApplyConfirmation(null);
          setSelectedJobDetail(null);
        } else {
          const data = await res.json();
          alert(`Gagal: ${data.error}`);
        }
      });
    } catch (e) {
      console.error(e);
      alert('Terjadi kesalahan saat memproses lamaran.');
    }
  };

  // Recruiter posts new vacancy ad
  const handlePostJobAd = async (jobData: any): Promise<Job> => {
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData)
    });

    if (!res.ok) {
      const payload = await res.json();
      throw new Error(payload.error || 'Ad publishing failed.');
    }

    const jobResult: Job = await res.json();

    // Refresh database list
    const jRes = await fetch('/api/jobs');
    if (jRes.ok) setJobs(await jRes.json());

    return jobResult;
  };

  // Admin verifies enterprise corporate structure
  const handleToggleCompanyVerification = async (companyId: string, isVerified: boolean) => {
    try {
      const res = await fetch('/api/companies/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: companyId, isVerified })
      });
      if (res.ok) {
        const cRes = await fetch('/api/companies');
        if (cRes.ok) setCompanies(await cRes.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Admin moderates quarantine jobs pool
  const handleModerateJob = async (jobId: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch('/api/jobs/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: jobId, status })
      });
      if (res.ok) {
        const jRes = await fetch('/api/jobs');
        if (jRes.ok) setJobs(await jRes.json());
        
        if (status === 'approved') {
          alert('Berhasil disetujui! Lowongan telah divalidasi dan sekarang resmi dipublikasikan di platform.');
        } else {
          alert('Spam berhasil dibasmi! Lowongan kerja mencurigakan tersebut telah dihapus secara aman dari platform.');
        }
      } else {
        const errData = await res.json();
        alert(`Gagal memoderasi lowongan: ${errData.error || 'Kesalahan Server'}`);
      }
    } catch (e: any) {
      console.error(e);
      alert(`Terjadi kesalahan koneksi: ${e.message}`);
    }
  };

  // Recruiter shortlists or updates candidate application status
  const handleUpdateApplicationStatus = async (appId: string, status: Application['status']) => {
    try {
      const res = await fetch('/api/applications/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appId, status })
      });
      if (res.ok) {
        const aRes = await fetch('/api/applications');
        if (aRes.ok) setApplications(await aRes.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- Users CRUD ---
  const handleAddUser = async (userData: any) => {
    try {
      const res = await fetch('/api/users/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (res.ok) {
        const uRes = await fetch('/api/users');
        if (uRes.ok) setUsers(await uRes.json());
        alert('Pengguna berhasil ditambahkan!');
      } else {
        const rJson = await res.json();
        alert(`Gagal menambahkan pengguna: ${rJson.error || 'Kesalahan Server'}`);
      }
    } catch (e: any) {
      console.error(e);
      alert(`Terjadi kegagalan koneksi: ${e.message}`);
    }
  };

  const handleUpdateUser = async (id: string, updates: any) => {
    try {
      const res = await fetch('/api/users/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });
      if (res.ok) {
        const uRes = await fetch('/api/users');
        if (uRes.ok) setUsers(await uRes.json());
        alert('Data pengguna berhasil diperbarui!');
      } else {
        const rJson = await res.json();
        alert(`Gagal memperbarui pengguna: ${rJson.error || 'Kesalahan Server'}`);
      }
    } catch (e: any) {
      console.error(e);
      alert(`Terjadi kegagalan koneksi: ${e.message}`);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const uRes = await fetch('/api/users');
        if (uRes.ok) setUsers(await uRes.json());
        alert('Pengguna berhasil dihapus!');
      } else {
        const rJson = await res.json();
        alert(`Gagal menghapus pengguna: ${rJson.error || 'Kesalahan Server'}`);
      }
    } catch (e: any) {
      console.error(e);
      alert(`Terjadi kegagalan koneksi: ${e.message}`);
    }
  };

  // --- Companies CRUD ---
  const handleAddCompanySpec = async (companyData: any) => {
    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyData)
      });
      if (res.ok) {
        const cRes = await fetch('/api/companies');
        if (cRes.ok) setCompanies(await cRes.json());
        alert('Perusahaan berhasil didaftarkan!');
      } else {
        const rJson = await res.json();
        alert(`Gagal menambahkan perusahaan: ${rJson.error || 'Kesalahan Server'}`);
      }
    } catch (e: any) {
      console.error(e);
      alert(`Terjadi kegagalan koneksi: ${e.message}`);
    }
  };

  const handleUpdateCompany = async (id: string, updates: any) => {
    try {
      const res = await fetch('/api/companies/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });
      if (res.ok) {
        const cRes = await fetch('/api/companies');
        if (cRes.ok) setCompanies(await cRes.json());
        
        const jRes = await fetch('/api/jobs');
        if (jRes.ok) setJobs(await jRes.json());
        alert('Informasi perusahaan berhasil diperbarui!');
      } else {
        const rJson = await res.json();
        alert(`Gagal memperbarui perusahaan: ${rJson.error || 'Kesalahan Server'}`);
      }
    } catch (e: any) {
      console.error(e);
      alert(`Terjadi kegagalan koneksi: ${e.message}`);
    }
  };

  const handleDeleteCompany = async (id: string) => {
    try {
      const res = await fetch(`/api/companies/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const cRes = await fetch('/api/companies');
        if (cRes.ok) setCompanies(await cRes.json());
        
        const jRes = await fetch('/api/jobs');
        if (jRes.ok) setJobs(await jRes.json());
        alert('Perusahaan beserta iklan lowongan kerjanya berhasil dihapus!');
      } else {
        const rJson = await res.json();
        alert(`Gagal menghapus perusahaan: ${rJson.error || 'Kesalahan Server'}`);
      }
    } catch (e: any) {
      console.error(e);
      alert(`Terjadi kegagalan koneksi: ${e.message}`);
    }
  };

  // --- Jobs CRUD refinements ---
  const handleUpdateJobAd = async (id: string, updates: any) => {
    try {
      const res = await fetch('/api/jobs/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });
      if (res.ok) {
        const jRes = await fetch('/api/jobs');
        if (jRes.ok) setJobs(await jRes.json());
        alert('Iklan lowongan berhasil diperbarui!');
      } else {
        const rJson = await res.json();
        alert(`Gagal memperbarui lowongan: ${rJson.error || 'Kesalahan Server'}`);
      }
    } catch (e: any) {
      console.error(e);
      alert(`Terjadi kegagalan koneksi: ${e.message}`);
    }
  };

  const handleDeleteJobAd = async (id: string) => {
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const jRes = await fetch('/api/jobs');
        if (jRes.ok) setJobs(await jRes.json());
        alert('Iklan lowongan berhasil dihapus!');
      } else {
        const rJson = await res.json();
        alert(`Gagal menghapus lowongan: ${rJson.error || 'Kesalahan Server'}`);
      }
    } catch (e: any) {
      console.error(e);
      alert(`Terjadi kegagalan koneksi: ${e.message}`);
    }
  };

  // --- Announcements CRUD ---
  const handleAddAnnouncement = async (annData: any) => {
    const res = await fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(annData)
    });
    if (res.ok) {
      const aRes = await fetch('/api/announcements');
      if (aRes.ok) setAnnouncements(await aRes.json());
    }
  };

  const handleUpdateAnnouncement = async (id: string, updates: any) => {
    const res = await fetch('/api/announcements/edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates })
    });
    if (res.ok) {
      const aRes = await fetch('/api/announcements');
      if (aRes.ok) setAnnouncements(await aRes.json());
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    const res = await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
    if (res.ok) {
      const aRes = await fetch('/api/announcements');
      if (aRes.ok) setAnnouncements(await aRes.json());
    }
  };


  if (showSplash) {
    return <Splash onComplete={() => setShowSplash(false)} />;
  }

  const localizedJobs = jobs.map(job => localizeJob(job, lang));
  const localizedSelectedJobDetail = selectedJobDetail ? localizeJob(selectedJobDetail, lang) : null;

  const showSidebar = activeUser !== null;
  const isAdmin = activeUser && activeUser.role === 'admin';

  return (
    <div className={`min-h-screen flex ${showSidebar ? 'flex-col md:flex-row' : 'flex-col'} bg-slate-50 dark:bg-[#05060b] text-slate-800 dark:text-slate-100 transition-colors duration-200 selection:bg-indigo-500 selection:text-white relative overflow-clip`}>
      
      {/* Atmospheric Immersive UI Ambient Light Glows */}
      <div className="absolute top-[-10%] left-[15%] w-[600px] h-[600px] bg-indigo-600/5 dark:bg-indigo-600/10 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-[15%] right-[-10%] w-[500px] h-[500px] bg-purple-600/5 dark:bg-purple-600/8     rounded-full blur-[125px] pointer-events-none z-0" />
      
      {/* Sidebar / Navbar Selector */}
      {showSidebar ? (
        isAdmin ? (
          <AdminSidebar
            activeUser={activeUser}
            isDarkMode={isDarkMode}
            onToggleTheme={() => setIsDarkMode(!isDarkMode)}
            onLogout={handleLogout}
            onOpenProfile={() => setShowProfileModal(true)}
            onRoleChange={handleRoleChange}
            jobs={localizedJobs}
            companies={companies}
            users={users}
            activeTab={adminActiveTab}
            onActiveTabChange={setAdminActiveTab}
          />
        ) : (
          <UserSidebar
            activeUser={activeUser}
            currentPage={currentPage}
            onNavigate={(page: any) => {
              handlePageNavigation(page);
            }}
            isDarkMode={isDarkMode}
            onToggleTheme={() => setIsDarkMode(!isDarkMode)}
            onLogout={handleLogout}
            onOpenProfile={() => setShowProfileModal(true)}
            onOpenTutorial={() => setShowWelcomeTutorial(true)}
            seekerActiveTab={seekerActiveTab}
            onSeekerActiveTabChange={setSeekerActiveTab}
            recruiterActiveTab={recruiterActiveTab}
            onRecruiterActiveTabChange={setRecruiterActiveTab}
          />
        )
      ) : (
        <Navbar
          activeUser={activeUser}
          currentPage={currentPage}
          isDarkMode={isDarkMode}
          onNavigate={(page: any) => {
            handlePageNavigation(page);
          }}
          onRoleChange={handleRoleChange}
          onLogout={handleLogout}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
          onOpenLogin={() => setShowLoginModal(true)}
          onOpenProfile={() => setShowProfileModal(true)}
          onOpenTutorial={() => setShowWelcomeTutorial(true)}
        />
      )}

      {/* Main Core Routing Dashboard Views */}
      <main className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          
          {currentPage === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LandingPage
                jobs={localizedJobs}
                companies={companies}
                onSelectJob={(job) => setSelectedJobDetail(job)}
                onNavigateToDashboard={(q, l, t) => handlePageNavigation('dashboard', q, l, t)}
              />
            </motion.div>
          )}

          {currentPage === 'dashboard' && activeUser && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Render dynamic dashboard according to role parameters */}
              {activeUser.role === 'seeker' && seekerProfile && (
                <SeekerDashboard
                  jobs={localizedJobs}
                  companies={companies}
                  profile={seekerProfile}
                  applications={applications.filter(app => app.applicantId === activeUser.id)}
                  announcements={announcements}
                  initialSearchQuery={globalSearch}
                  initialLocationQuery={globalLocation}
                  initialJobType={globalJobType}
                  onClearSearchFilters={() => {
                    setGlobalSearch('');
                    setGlobalLocation('');
                    setGlobalJobType('All');
                  }}
                  onSelectJob={(job) => setSelectedJobDetail(job)}
                  onUpdateProfile={handleUpdateProfile}
                  onApply={handleApplyJob}
                  onNavigateToTab={(tab: any) => {
                    if (tab === 'analyzer') setCurrentPage('analyzer');
                    if (tab === 'simulator') setCurrentPage('simulator');
                    if (tab === 'chats') setCurrentPage('chats');
                  }}
                  activeUser={activeUser}
                  onOpenProfileModal={() => setShowProfileModal(true)}
                  activeTab={seekerActiveTab}
                  onActiveTabChange={setSeekerActiveTab}
                />
              )}

              {activeUser.role === 'recruiter' && (
                <RecruiterDashboardView
                  jobs={localizedJobs}
                  companies={companies}
                  applications={applications}
                  activeUser={activeUser}
                  announcements={announcements}
                  onUpdateApplicationStatus={handleUpdateApplicationStatus}
                  onPostJob={handlePostJobAd}
                  onAddAnnouncement={handleAddAnnouncement}
                  onUpdateAnnouncement={handleUpdateAnnouncement}
                  onDeleteAnnouncement={handleDeleteAnnouncement}
                  onUpdateCompany={handleUpdateCompany}
                  onOpenProfileModal={() => setShowProfileModal(true)}
                  activeTab={recruiterActiveTab}
                  onActiveTabChange={setRecruiterActiveTab}
                />
              )}

              {activeUser.role === 'admin' && (
                <AdminPanelView
                  jobs={localizedJobs}
                  companies={companies}
                  applications={applications}
                  users={users}
                  onToggleCompanyVerification={handleToggleCompanyVerification}
                  onModerateJob={handleModerateJob}
                  onAddUser={handleAddUser}
                  onUpdateUser={handleUpdateUser}
                  onDeleteUser={handleDeleteUser}
                  onAddCompany={handleAddCompanySpec}
                  onUpdateCompany={handleUpdateCompany}
                  onDeleteCompany={handleDeleteCompany}
                  onAddJob={handlePostJobAd}
                  onUpdateJob={handleUpdateJobAd}
                  onDeleteJob={handleDeleteJobAd}
                  activeUser={activeUser}
                  onOpenProfileModal={() => setShowProfileModal(true)}
                  activeTab={adminActiveTab}
                  onActiveTabChange={setAdminActiveTab}
                />
              )}
            </motion.div>
          )}

          {currentPage === 'analyzer' && seekerProfile && (
            <motion.div
              key="analyzer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CVAnalyzerTab
                profile={seekerProfile}
                onNavigateToTab={(tab: any) => {
                  if (tab === 'dashboard') setCurrentPage('dashboard');
                }}
                onUpdateProfile={handleUpdateProfile}
                jobs={localizedJobs}
              />
            </motion.div>
          )}

          {currentPage === 'simulator' && (
            <motion.div
              key="simulator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <InterviewTab
                onNavigateToTab={(tab: any) => {
                  if (tab === 'dashboard') setCurrentPage('dashboard');
                }}
              />
            </motion.div>
          )}

          {currentPage === 'chats' && activeUser && (
            <motion.div
              key="chats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ChatSystemView
                activeUser={activeUser}
                onNavigateToTab={(tab: any) => {
                  if (tab === 'dashboard') setCurrentPage('dashboard');
                }}
              />
            </motion.div>
          )}



        </AnimatePresence>
      </main>

      {/* FOOTER */}
      {!showSidebar && (
        <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-8 bg-white/50 dark:bg-slate-900/30 font-mono text-[10px] text-slate-400 mt-12">
          <div className="max-w-full mx-auto px-4 sm:px-8 md:px-12 text-center">
            <p>© 2026 Talentra Recruitment. Compliance and Safety Screened.</p>
          </div>
        </footer>
      )}

      {/* 3. DYNAMIC JOB SLIDE DRAWER VIEW DETAILS */}
      <AnimatePresence>
        {localizedSelectedJobDetail && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            
            {/* Overlay backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedJobDetail(null)}
              className="absolute inset-0 bg-black/50"
            />

            {/* Slide in card sheet */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xl bg-white dark:bg-slate-950 h-full shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-y-auto border-l border-slate-205 dark:border-slate-800 text-left"
            >
              <div>
                
                {/* Close handle button */}
                <button
                  type="button"
                  onClick={() => setSelectedJobDetail(null)}
                  className="absolute top-5 right-5 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>

                {/* Company logo title */}
                <div className="flex items-center gap-4 mt-4">
                  <img src={localizedSelectedJobDetail.companyLogo} className="w-14 h-14 rounded-2xl object-cover" alt="" />
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                      {localizedSelectedJobDetail.title}
                    </h3>
                    <p className="text-xs text-indigo-500 font-bold font-mono mt-1 leading-none">{localizedSelectedJobDetail.companyName}</p>
                    <span className="flex items-center gap-1 text-[11px] text-slate-450 mt-1.5 font-medium">
                      <MapPin className="w-3.5 h-3.5" /> {localizedSelectedJobDetail.location}
                    </span>
                  </div>
                </div>

                {/* Salary status tags */}
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 font-bold text-xs rounded-xl font-mono">
                    {localizedSelectedJobDetail.salaryRange}
                  </span>
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl font-mono">
                    {localizedSelectedJobDetail.jobType}
                  </span>
                  <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-xl font-mono">
                    {localizedSelectedJobDetail.experienceLevel}
                  </span>
                </div>

                {/* Quarantine scam danger alerts (anti job scam feature) */}
                {localizedSelectedJobDetail.isSuspicious && (
                  <div className="p-4 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20 text-xs font-bold flex gap-2 items-start mt-6 leading-relaxed">
                    <AlertOctagon className="w-5 h-5 shrink-0" />
                    <div>
                      <span>{t('seeker.scamAlert')}</span>
                      <p className="text-[10px] text-slate-600 dark:text-slate-350 font-semibold mt-1">
                        {t('seeker.reason')} {localizedSelectedJobDetail.suspiciousReason}
                      </p>
                    </div>
                  </div>
                )}

                {/* Full Description text area */}
                <div className="mt-8 space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 font-mono tracking-widest uppercase">{t('seeker.overview')}</h4>
                  <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed font-semibold">
                    {localizedSelectedJobDetail.description}
                  </p>
                </div>

                {/* Requirements Checklist */}
                {localizedSelectedJobDetail.requirements.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 font-mono tracking-widest uppercase">{t('seeker.requirements')}</h4>
                    <div className="space-y-2">
                      {localizedSelectedJobDetail.requirements.map((req, i) => (
                        <div key={i} className="flex gap-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          <span className="text-indigo-500 font-black shrink-0">✔</span>
                          <span>{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skill badges */}
                <div className="mt-6 space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 font-mono tracking-widest uppercase">{t('seeker.skills')}</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {localizedSelectedJobDetail.skillsRequired.map(skill => (
                      <span key={skill} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-300 rounded-lg text-xs font-semibold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Apply button triggers */}
              <div className="mt-8 border-t border-slate-100 dark:border-slate-850 pt-5 flex items-center justify-between gap-4 shrink-0">
                <div className="text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">{t('seeker.verifyParams')}</span>
                  <p className="text-xs font-bold text-emerald-500 font-mono">{t('seeker.oneClick')}</p>
                </div>

                <button
                  disabled={(activeUser && applications.some(a => a.jobId === localizedSelectedJobDetail.id && a.applicantId === activeUser.id)) || localizedSelectedJobDetail.isSuspicious}
                  onClick={() => {
                    if (!activeUser) {
                      setShowLoginModal(true);
                    } else {
                      handleApplyJob(localizedSelectedJobDetail.id, false);
                      setSelectedJobDetail(null);
                    }
                  }}
                  className={`px-8 py-3.5 text-xs font-black rounded-xl transition-all ${
                    (activeUser && applications.some(a => a.jobId === localizedSelectedJobDetail.id && a.applicantId === activeUser.id))
                      ? 'bg-slate-150 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      : localizedSelectedJobDetail.isSuspicious
                        ? 'bg-rose-500/20 text-rose-550/60 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg cursor-pointer'
                  }`}
                >
                  {(activeUser && applications.some(a => a.jobId === localizedSelectedJobDetail.id && a.applicantId === activeUser.id)) 
                    ? t('applied') 
                    : localizedSelectedJobDetail.isSuspicious 
                      ? t('seeker.quarantine')
                      : t('seeker.applyText')
                  }
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Terms and Conditions Confirmation Modal */}
      <AnimatePresence>
        {applyConfirmation && (() => {
          const confirmedJob = jobs.find(j => j.id === applyConfirmation.jobId);
          if (!confirmedJob) return null;
          return (
            <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
              {/* Overlay Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                onClick={() => setApplyConfirmation(null)}
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
              />

              {/* Modal Card */}
              <motion.div
                initial={{ scale: 0.95, y: 15, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 15, opacity: 0 }}
                transition={{ type: 'spring', duration: 0.4 }}
                className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl z-10"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 rounded-xl">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white font-display">
                        {t('terms.title')}
                      </h3>
                      <p className="text-2xs font-bold text-indigo-500 font-mono tracking-wider uppercase leading-none mt-1">
                        {t('terms.verification')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setApplyConfirmation(null)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-650 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Job Context Overview Card */}
                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 rounded-2xl flex items-center gap-4">
                  <img src={confirmedJob.companyLogo} className="w-11 h-11 rounded-xl object-cover" alt="" />
                  <div className="text-left">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                      {confirmedJob.title}
                    </h4>
                    <p className="text-3xs font-bold text-indigo-500 font-mono mt-0.5 leading-none">
                      {confirmedJob.companyName}
                    </p>
                    <div className="flex gap-2 mt-1 text-[10px] text-slate-450 dark:text-slate-400 font-medium">
                      <span>{confirmedJob.location}</span>
                      <span>•</span>
                      <span>{confirmedJob.jobType}</span>
                    </div>
                  </div>
                </div>

                {/* Terms Details */}
                <div className="mt-4 space-y-3.5 text-left bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 max-h-56 overflow-y-auto">
                  <p className="text-xs font-black text-slate-900 dark:text-white">
                    {t('terms.subtitle')}
                  </p>
                  
                  <ul className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300 list-decimal list-inside pr-1">
                    <li className="leading-relaxed">
                      <strong className="text-slate-950 dark:text-white font-extrabold">{t('terms.clause1_title')}</strong> {t('terms.clause1_desc')}
                    </li>
                    <li className="leading-relaxed">
                      <strong className="text-slate-950 dark:text-white font-extrabold">{t('terms.clause2_title')}</strong> {t('terms.clause2_desc')}
                    </li>
                    <li className="leading-relaxed">
                      <strong className="text-slate-950 dark:text-white font-extrabold">{t('terms.clause3_title')}</strong> {t('terms.clause3_desc')} <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{confirmedJob.companyName}</span>.
                    </li>
                  </ul>

                  {/* Mode Specific Note */}
                  <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 rounded-xl mt-3 flex gap-2.5">
                    {applyConfirmation.anonymousMode ? (
                      <>
                        <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 leading-tight">{t('terms.anon_active')}</p>
                          <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                            {t('terms.anon_desc')}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-emerald-650 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] font-black text-emerald-650 dark:text-emerald-400 leading-tight">{t('terms.open_profile')}</p>
                          <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                            {t('terms.open_desc')}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Agreement Checkbox */}
                <div className="mt-5 flex items-start gap-2.5 text-left">
                  <input
                    type="checkbox"
                    id="agree-checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800 shrink-0 mt-0.5 cursor-pointer accent-indigo-600"
                  />
                  <label htmlFor="agree-checkbox" className="text-xs text-slate-600 dark:text-slate-300 leading-normal select-none cursor-pointer">
                    {t('terms.agree_label')}
                  </label>
                </div>

                {/* Actions Button */}
                <div className="mt-6 flex items-center justify-end gap-3.5 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <button
                    type="button"
                    onClick={() => setApplyConfirmation(null)}
                    className="px-5 py-2.5 text-2xs font-extrabold text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-all"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    disabled={!agreedToTerms}
                    onClick={() => handleApplyJobConfirm(applyConfirmation.jobId, applyConfirmation.anonymousMode)}
                    className={`px-6 py-2.5 text-2xs font-black rounded-xl shadow-lg transition-all flex items-center gap-1.5 ${
                      agreedToTerms
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20 active:scale-98 cursor-pointer'
                        : 'bg-slate-150 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
                    }`}
                  >
                    {t('terms.submit')}
                  </button>
                </div>

              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* GLOBAL HIGH-POLISHED AI PROCESS LOADING OVERLAY */}
      <AnimatePresence>
        {loadingProcess && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Dark Premium Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.75 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            
            {/* Centered Futuristic Loading Card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl z-10 overflow-hidden"
            >
              {/* Subtle background ambient light glows */}
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

              {/* Holographic loader elements with layered rotating rings */}
              <div className="relative flex justify-center items-center py-6">
                {/* Outer Ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, ease: 'linear', duration: 1.8 }}
                  className="w-16 h-16 rounded-full border-t-2 border-r-2 border-indigo-500 border-b border-l border-slate-800"
                />
                
                {/* Inner Ring (counter-rotating) */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, ease: 'linear', duration: 1.2 }}
                  className="absolute w-10 h-10 rounded-full border-b-2 border-l-2 border-purple-400 border-t border-r border-slate-800"
                />

                {/* Pulsating core sparkle icon */}
                <div className="absolute">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                  >
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                  </motion.div>
                </div>
              </div>

              {/* Scanning modern progress bar overlay */}
              <div className="relative w-full h-1 bg-slate-800 rounded-full overflow-hidden mb-6">
                <motion.div
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                  className="w-1/2 h-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent absolute"
                />
              </div>

              {/* Typography info details */}
              <h4 className="text-xs font-black text-white tracking-wider uppercase font-mono">
                Sistem Sedang Memproses
              </h4>
              
              <p className="mt-3 text-xs text-slate-300 leading-relaxed font-sans px-2">
                {loadingProcess}
              </p>

              {/* Simulated cognitive tracking */}
              <p className="mt-4 text-[9px] text-slate-500 font-mono tracking-widest uppercase">
                AI RECRUITMENT PIPELINE • ACTIVE
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. PREMIUM COMPLIANT AUTH / SANDBOX SELECTION MODAL */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden z-10 text-left"
            >
              {/* Decorative top bar */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600" />
              
              {/* Close button */}
              <button
                type="button"
                onClick={() => setShowLoginModal(false)}
                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                id="close-login-btn"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col mt-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/25">
                    <Lock className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-widest mt-0.5">
                    Talentra Auth Portal
                  </span>
                </div>

                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-4 tracking-tight">
                  {t('auth.signInSec')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed font-semibold">
                  {t('auth.desc')}
                </p>
              </div>

              {/* TABS: Predefined sandbox vs login vs custom register */}
              <div className="mt-6">
                <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl mb-6 font-semibold">
                  <button
                    onClick={() => {
                      setActiveAuthTab('login');
                      setAuthError(null);
                    }}
                    className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                      activeAuthTab === 'login'
                        ? 'bg-white dark:bg-slate-800 text-indigo-650 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-705 dark:hover:text-slate-300'
                    }`}
                  >
                    {lang === 'id' ? 'Masuk' : 'Sign In'}
                  </button>
                  <button
                    onClick={() => {
                      setActiveAuthTab('custom');
                      setAuthError(null);
                    }}
                    className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                      activeAuthTab === 'custom'
                        ? 'bg-white dark:bg-slate-800 text-indigo-650 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-705 dark:hover:text-slate-300'
                    }`}
                  >
                    {lang === 'id' ? 'Daftar' : 'Register'}
                  </button>
                </div>

                {activeAuthTab === 'login' && (
                  <form onSubmit={handleLoginCustomUser} className="space-y-4">
                    {authError && (
                      <div className="bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 p-3 rounded-xl text-rose-600 dark:text-rose-450 text-xs font-semibold">
                        {authError}
                      </div>
                    )}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        {lang === 'id' ? 'Email Terdaftar' : 'Registered Email'}
                      </label>
                      <input
                        type="email"
                        required
                        placeholder=""
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-855 rounded-xl text-xs text-slate-800 dark:text-white placeholder-slate-450 focus:outline-none focus:border-indigo-500 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        Password
                      </label>
                      <input
                        type="password"
                        required
                        placeholder=""
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-855 rounded-xl text-xs text-slate-800 dark:text-white placeholder-slate-450 focus:outline-none focus:border-indigo-500 font-semibold"
                      />
                    </div>

                    {/* Removed quick helper for preloaded profiles */}

                    <button
                      type="submit"
                      className="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/10 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                    >
                      <Lock className="w-3.5 h-3.5 text-indigo-200" /> {lang === 'id' ? 'Masuk sekarang' : 'Sign In Now'}
                    </button>
                  </form>
                )}

                {activeAuthTab === 'custom' && (
                  <form onSubmit={handleRegisterCustomUser} className="space-y-4">
                    {authError && (
                      <div className="bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 p-3 rounded-xl text-rose-600 dark:text-rose-450 text-xs font-semibold">
                        {authError}
                      </div>
                    )}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t('auth.fullname')}</label>
                      <input
                        type="text"
                        required
                        placeholder=""
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-800 dark:text-white placeholder-slate-450 focus:outline-none focus:border-indigo-500 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t('auth.email')}</label>
                      <input
                        type="email"
                        required
                        placeholder=""
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-855 rounded-xl text-xs text-slate-800 dark:text-white placeholder-slate-450 focus:outline-none focus:border-indigo-500 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-sans flex items-center justify-between">
                        <span>Password</span>
                        <span className="text-[9px] text-indigo-400 font-normal uppercase tracking-wider">{lang === 'id' ? 'Wajib (Min 8 Karakter)' : 'Required (Min 8 Chars)'}</span>
                      </label>
                      <input
                        type="password"
                        required
                        minLength={8}
                        placeholder=""
                        value={customPassword}
                        onChange={(e) => setCustomPassword(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-855 rounded-xl text-xs text-slate-800 dark:text-white placeholder-slate-450 focus:outline-none focus:border-indigo-500 font-semibold"
                      />
                      {customPassword && customPassword.length < 8 && (
                        <p className="text-[10px] text-rose-500 font-bold mt-1">
                          {lang === 'id' ? '⚠️ Password minimal harus 8 karakter!' : '⚠️ Password must be at least 8 characters!'}
                        </p>
                      )}
                      {customPassword && customPassword.length >= 8 && (
                        (() => {
                          const hasUpper = /[A-Z]/.test(customPassword);
                          const hasDigit = /[0-9]/.test(customPassword);
                          const hasSpecial = /[^A-Za-z0-9]/.test(customPassword);
                          const isWeak = !(hasUpper && (hasDigit || hasSpecial));
                          if (isWeak) {
                            return (
                              <p className="text-[10px] text-amber-500 font-bold mt-1 leading-relaxed">
                                {lang === 'id' 
                                  ? '⚠️ Peringatan: Password Anda lemah! Masukkan kombinasi huruf besar, angka, dan karakter unik agar lebih aman.' 
                                  : '⚠️ Warning: Password is weak! Combine uppercase letters, numbers, and symbols for better safety.'}
                              </p>
                            );
                          } else {
                            return (
                              <p className="text-[10px] text-emerald-500 font-bold mt-1">
                                {lang === 'id' ? '✓ Password kuat.' : '✓ Strong password.'}
                              </p>
                            );
                          }
                        })()
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t('auth.role')}</label>
                      <select
                        value={customRole}
                        onChange={(e) => setCustomRole(e.target.value as any)}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-855 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 font-bold"
                      >
                        <option value="seeker">
                          {lang === 'id' ? 'Pencari Kerja (Cari lowongan & praktik simulasi wawancara)' : 'Job Seeker (Check listings & practice AI mock interviews)'}
                        </option>
                        <option value="recruiter">
                          {lang === 'id' ? 'Perekrut (Pasang lowongan, uji keaslian & chat)' : 'Recruiter (Publish open roles, run safety checks & chat)'}
                        </option>
                        <option value="admin">
                          {lang === 'id' ? 'Admin Sistem (Audit lowongan, kelola basis data)' : 'System Admin (Audit jobs, manage database)'}
                        </option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/10 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> {t('auth.regBtn')}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {activeUser && (
        <UserProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          user={activeUser}
          onSave={handleSaveProfileModal}
        />
      )}

      {activeUser && (
        <WelcomeTutorialModal
          isOpen={showWelcomeTutorial}
          onClose={() => setShowWelcomeTutorial(false)}
          activeRole={activeUser.role}
          onNavigateToTab={(page) => handlePageNavigation(page)}
          onSwitchRole={(role) => handleRoleChange(role)}
        />
      )}

      {/* 4. LOGOUT CONFIRMATION MODAL */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-sm overflow-hidden bg-white dark:bg-[#0c0f17] border border-slate-250 dark:border-rose-500/20 rounded-2xl p-6 shadow-2xl space-y-4 text-left relative z-10"
            >
              <div className="flex gap-4 items-start">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-500 border border-rose-500/20">
                  <LogOut className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-950 dark:text-white tracking-tight">
                    {lang === 'id' ? 'Yakin ingin logout?' : 'Confirm Logout?'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-450 font-medium leading-relaxed">
                    {lang === 'id' 
                      ? 'Anda harus login kembali untuk mengelola lamaran, lowongan, atau interaksi obrolan.' 
                      : 'You will need to sign in again to manage filings, listings, or chat interactions.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-150 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-855 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-900 border border-transparent rounded-xl transition-all hover:bg-slate-200/50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {lang === 'id' ? 'Batal' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={executeLogout}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-md shadow-rose-500/15 cursor-pointer"
                >
                  {lang === 'id' ? 'Logout' : 'Log Out'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
