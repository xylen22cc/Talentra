import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'id';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Common / Global
    loading: "Loading...",
    cancel: "Cancel",
    confirm: "Confirm",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    back: "Back",
    submit: "Submit",
    status: "Status",
    all: "All",
    verified: "Verified",
    unverified: "Unverified",
    viewDetails: "View Details",
    applyNow: "Apply Instantly Now",
    applied: "Applied",
    suspended: "Held in Quarantine",
    boosted: "Boosted",
    pilihBahasa: "Language",
    languageFlag: "🇺🇸 EN",
    languageFlagAlt: "🇮🇩 ID",

    // Navbar
    "navbar.home": "Home",
    "navbar.launchPlatform": "Launch Platform",
    "navbar.signIn": "Sign In / Register",
    "navbar.mode": "Mode",
    "navbar.seeker": "Job Seeker (Candidate)",
    "navbar.recruiter": "Corporate Recruiter",
    "navbar.admin": "Platform Admin Panel",
    "navbar.signOut": "Sign Out",
    "navbar.inbox": "Inbox Updates",
    "navbar.new": "New",
    "navbar.switchRole": "Switch Role",
    "navbar.chats": "Direct Chats",
    "navbar.analyzer": "CV Analyzer 📄",
    "navbar.simulator": "Interview Simulator 🎙️",

    // Landing
    "landing.badge": "Empowering Next-Gen Talent with Real-Time Gemini Intelligence",
    "landing.title": "Find the Dream Job.",
    "landing.subtitle": "Screened for Fraud, Powered by AI.",
    "landing.description": "Talentra is a next-generation recruitment SaaS. Submit applications anonymously, access smart resume gap analyses, simulate interactive mock interviews, and search corporate slots with confidence.",
    "landing.launchBtn": "Launch Dashboard",
    "landing.recruiterBtn": "Recruiter Hub",
    "landing.searchPlaceholder": "Job title, keywords, or company...",
    "landing.locationPlaceholder": "City, remote, hybrid...",
    "landing.allTypes": "All Job Types",
    "landing.fullTime": "Full-time",
    "landing.partTime": "Part-time",
    "landing.contract": "Contract",
    "landing.remote": "Remote",
    "landing.internship": "Internship",
    "landing.searchBtn": "Search Vacancies",
    "landing.trending": "Trending Searches:",
    "landing.recomTitle": "Recommended Job Suggestions",
    "landing.diffTitle": "Platform Key Differentiators",
    "landing.diffDesc": "We move beyond traditional job boards by integrating direct intelligence at every step of application and listing processes.",
    "landing.diff1Title": "AI CV Analyzer",
    "landing.diff1Desc": "Paste your digital resume and test it instantly against any active job listing. Receive deep-learning scores, missing keyword insights, and wording recommendations directly.",
    "landing.diff2Title": "Employment Scam Filter",
    "landing.diff2Desc": "Every newly created corporate job post undergoes a real-time semantic integrity check. Malicious, upfront training fee requests, or phantom remote tasks are flagged for moderation automatically.",
    "landing.diff3Title": "Mock Interview Arena",
    "landing.diff3Desc": "Practice technical roles inside our live dialog simulator. Our smart interview script feeds scenario-based engineering steps and evaluates candidate transcripts dynamically.",
    "landing.recomOpp": "Recommended Opportunities",
    "landing.showingJobs": "Showing {count} active approved vacancies.",
    "landing.quickFilters": "Quick Filters:",
    "landing.noJobs": "No active jobs matched your search criteria. Try modifying your inputs.",
    "landing.partnerTitle": "Top Recruiting Corporate Organizations",

    // Seeker Dashboard
    "seeker.cvAnalysis": "My CV Analysis",
    "seeker.simulator": "Simulation",
    "seeker.applications": "Registered Applications",
    "seeker.settings": "Profile Settings",
    "seeker.scamAlert": "SECURITY CRAWLER ALERT: Suspicious Ad Terminology Flagged",
    "seeker.reason": "Reason:",
    "seeker.overview": "Job Overview Profile",
    "seeker.requirements": "Prerequisite Checklist",
    "seeker.skills": "Skillset Tag Cloud",
    "seeker.verifyParams": "Verify application parameters",
    "seeker.oneClick": "1-Click Fast Submit Active",
    "seeker.appliedText": "Applied",
    "seeker.quarantine": "Held in Quarantine",
    "seeker.applyText": "Apply Instantly Now",
    "seeker.appliedOn": "Applied on",
    "seeker.salary": "Salary:",
    "seeker.location": "Location:",
    "seeker.type": "Type:",
    "seeker.matchScore": "AI Match Score",
    "seeker.gapAnalysis": "Gap Analysis",
    "seeker.skillsGap": "Skills Gap Analysis",
    "seeker.emptyApplications": "No applications registered yet. Browse the homepage and start applying!",
    
    // Auth Modal
    "auth.title": "Register New Account...",
    "auth.signInSec": "Sign In / Register",
    "auth.desc": "Talentra runs inside an elite developer portal. You can pick an automated profile index, or register custom details.",
    "auth.option1": "Quick Portals (No Register)",
    "auth.option2": "Custom Entity (Register)",
    "auth.fullname": "Full Name",
    "auth.email": "Email Address",
    "auth.role": "Choose Workspace Role",
    "auth.regBtn": "Register & Setup Profile",
    "auth.registering": "Registering New Account...",

    // Modal Terms S&K
    "terms.title": "Terms & Conditions of Application",
    "terms.verification": "AI Recruitment Verification",
    "terms.subtitle": "Please read and acknowledge the following clauses before submitting your job application:",
    "terms.clause1_title": "Profile Honesty:",
    "terms.clause1_desc": "I guarantee that the profile, skills, and work history stored in my account are accurate, honest, and reflect genuine experience.",
    "terms.clause2_title": "AI Match Score Calculation:",
    "terms.clause2_desc": "I agree to have my resume and profile computed by the Talentra AI engine to generate Match Score visualizations for recruiters.",
    "terms.clause3_title": "Open Data Submission:",
    "terms.clause3_desc": "I authorize the transfer of my full professional profile documents to the Recruitment Unit of",
    "terms.anon_active": "ANONYMOUS PROTECTION ACTIVE",
    "terms.anon_desc": "Your full name, contact, and email are completely hidden until you explicitly authorize personal data disclosure to the recruiter.",
    "terms.open_profile": "OPEN PROFILE SUBMISSION",
    "terms.open_desc": "Your full profile, including real name, contact details, and portfolio, will be sent transparently to the recruiter for comparison.",
    "terms.agree_label": "I declare that I have read, understood, and fully agree to all terms and conditions of the Talentra AI recruitment platform.",
    "terms.submit": "Register & Submit Application",
    "terms.success_alert": "Application Successful! Your resume/profile has been sent, and AI is analyzing the match score.",

    // Splash Loader
    "splash.loading": "Launching Portal...",
    "splash.subtitle": "Verifying multi-role environments and initializing Gemini AI analysis units...",

    // Interview Simulator
    "interview.title": "AI Interactive Interview Simulator",
    "interview.desc": "Prepare yourself with real-time feedback powered by Gemini AI.",
    "interview.startBtn": "Start Simulation",
    "interview.stopBtn": "End & Summarize",
    "interview.feedback": "AI Interview Feedback",
    "interview.rolePlaceholder": "e.g., Senior React Developer...",
  },
  id: {
    // Common / Global
    loading: "Memuat...",
    cancel: "Batal",
    confirm: "Konfirmasi",
    save: "Simpan",
    edit: "Edit",
    delete: "Hapus",
    back: "Kembali",
    submit: "Kirim",
    status: "Status",
    all: "Semua",
    verified: "Terverifikasi",
    unverified: "Belum Verifikasi",
    viewDetails: "Lihat Rincian",
    applyNow: "Daftar Instan Sekarang",
    applied: "Sudah Dilamar",
    suspended: "Ditahan di Karantina",
    boosted: "Dipromosikan",
    pilihBahasa: "Bahasa",
    languageFlag: "🇮🇩 ID",
    languageFlagAlt: "🇺🇸 EN",

    // Navbar
    "navbar.home": "Beranda",
    "navbar.launchPlatform": "Luncurkan Platform",
    "navbar.signIn": "Masuk / Daftar",
    "navbar.mode": "Peran",
    "navbar.seeker": "Pencari Kerja (Kandidat)",
    "navbar.recruiter": "Perekrut Korporat",
    "navbar.admin": "Panel Admin Platform",
    "navbar.signOut": "Keluar",
    "navbar.inbox": "Pembaruan Masuk",
    "navbar.new": "Baru",
    "navbar.switchRole": "Ganti Peran",
    "navbar.chats": "Pesan HRD",
    "navbar.analyzer": "Analisis CV AI 📄",
    "navbar.simulator": "Simulasi Wawancara 🎙️",

    // Landing
    "landing.badge": "Memberdayakan Next-Gen Talent dengan Kecerdasan Gemini Real-Time",
    "landing.title": "Temukan Pekerjaan Impian.",
    "landing.subtitle": "Disaring dari Penipuan, Didukung AI.",
    "landing.description": "Talentra adalah SaaS rekrutmen generasi baru. Kirim lamaran secara anonim, akses analisis kesenjangan resume cerdas, simulasikan wawancara tiruan interaktif, dan cari slot korporat dengan percaya diri.",
    "landing.launchBtn": "Luncurkan Dasbor",
    "landing.recruiterBtn": "Hub Perekrut",
    "landing.searchPlaceholder": "Judul pekerjaan, kata kunci, atau perusahaan...",
    "landing.locationPlaceholder": "Kota, remote, hybrid...",
    "landing.allTypes": "Semua Jenis Pekerjaan",
    "landing.fullTime": "Full-time",
    "landing.partTime": "Part-time",
    "landing.contract": "Kontrak",
    "landing.remote": "Remote",
    "landing.internship": "Magang",
    "landing.searchBtn": "Cari Lowongan",
    "landing.trending": "Pencarian Populer:",
    "landing.recomTitle": "Rekomendasi Pekerjaan",
    "landing.diffTitle": "Perbedaan Utama Platform Kami",
    "landing.diffDesc": "Kami melangkah lebih jauh dari papan lowongan kerja tradisional dengan mengintegrasikan kecerdasan langsung di setiap langkah pelamaran.",
    "landing.diff1Title": "Analisis CV AI",
    "landing.diff1Desc": "Tempel resume digital Anda dan uji instan terhadap lowongan aktif apa pun. Terima skor pembelajaran mendalam, wawasan kata kunci yang hilang, dan saran kata secara langsung.",
    "landing.diff2Title": "Penyaring Penipuan Kerja",
    "landing.diff2Desc": "Setiap postingan lowongan korporat baru menjalani pemeriksaan integritas semantik secara real-time. Permintaan biaya pelatihan di muka yang berbahaya, atau tugas remote semu akan ditandai secara otomatis untuk moderasi.",
    "landing.diff3Title": "Arena Wawancara Simulasi",
    "landing.diff3Desc": "Latih peran teknis di dalam simulator dialog langsung kami. Skenario cerdas kami menyajikan langkah-langkah rekayasa berbasis kasus dan mengevaluasi transkrip kandidat secara dinamis.",
    "landing.recomOpp": "Rekomendasi Lowongan Bekerja",
    "landing.showingJobs": "Menampilkan {count} lowongan aktif yang disetujui.",
    "landing.quickFilters": "Filter Cepat:",
    "landing.noJobs": "Tidak ada pekerjaan aktif yang cocok dengan kriteria pencarian Anda. Coba ubah pencarian Anda.",
    "landing.partnerTitle": "Mitra Perusahaan Perekrut Utama",

    // Seeker Dashboard
    "seeker.cvAnalysis": "Analisis CV Saya",
    "seeker.simulator": "Simulasi",
    "seeker.applications": "Lamaran Terdaftar",
    "seeker.settings": "Pengaturan Profil",
    "seeker.scamAlert": "PERINGATAN KEAMANAN: Terminologi Lowongan Mencurigakan Ditandai",
    "seeker.reason": "Alasan:",
    "seeker.overview": "Ikhtisar Lowongan Pekerjaan",
    "seeker.requirements": "Daftar Prasyarat",
    "seeker.skills": "Kumpulan Keahlian",
    "seeker.verifyParams": "Verifikasi parameter pelamaran",
    "seeker.oneClick": "Pendaftaran Cepat 1-Klik Aktif",
    "seeker.appliedText": "Sudah Dilamar",
    "seeker.quarantine": "Ditahan di Karantina",
    "seeker.applyText": "Daftar Instan Sekarang",
    "seeker.appliedOn": "Dilamar pada",
    "seeker.salary": "Gaji:",
    "seeker.location": "Lokasi:",
    "seeker.type": "Jenis:",
    "seeker.matchScore": "Skor Kecocokan AI",
    "seeker.gapAnalysis": "Analisis Kesenjangan",
    "seeker.skillsGap": "Analisis Kesenjangan Keahlian",
    "seeker.emptyApplications": "Belum ada lamaran terdaftar. Jelajahi beranda dan mulailah melamar!",

    // Auth Modal
    "auth.title": "Mendaftarkan Akun Baru...",
    "auth.signInSec": "Masuk / Daftar",
    "auth.desc": "Talentra berjalan di dalam portal pengembang elit. Anda dapat memilih indeks profil otomatis, atau mendaftarkan detail kustom.",
    "auth.option1": "Portal Cepat (Tanpa Daftar)",
    "auth.option2": "Entitas Kustom (Daftar)",
    "auth.fullname": "Nama Lengkap",
    "auth.email": "Alamat Email",
    "auth.role": "Pilih Peran Workspace",
    "auth.regBtn": "Daftar & Siapkan Profil",
    "auth.registering": "Mendaftarkan Akun Baru...",

    // Modal Terms S&K
    "terms.title": "Syarat & Ketentuan Lamaran",
    "terms.verification": "Verifikasi Rekrutmen AI",
    "terms.subtitle": "Sila baca dan perhatikan klausul di bawah ini sebelum mengajukan lamaran pekerjaan:",
    "terms.clause1_title": "Kebenaran Profil:",
    "terms.clause1_desc": "Saya menjamin bahwa data profil, keahlian, dan riwayat pekerjaan yang tersimpan di akun saya adalah akurat, jujur, serta sesuai riwayat nyata.",
    "terms.clause2_title": "Kalkulasi AI Match Score:",
    "terms.clause2_desc": "Saya menyetujui resume dan profil saya dikomputasi menggunakan mesin AI Talentra guna menghasilkan visualisasi kecocokan (Match Score) untuk pihak Perekrut.",
    "terms.clause3_title": "Penyerahan Data Terbuka:",
    "terms.clause3_desc": "Saya memberikan otorisasi untuk mentransfer kelengkapan dokumen profil profesional saya kepada Unit Recruitment",
    "terms.anon_active": "PROTEKSI ANONIM AKTIF",
    "terms.anon_desc": "Nama lengkap, kontak, serta surel Anda sepenuhnya disembunyikan sampai Anda secara eksplisit mengizinkan pembukaan data pribadi kepada perekrut.",
    "terms.open_profile": "SUNTINGAN PROFIL TERBUKA",
    "terms.open_desc": "Profil utuh seperti nama asli, rincian kontak, dan portofolio Anda akan dikirim transparan ke perekrut secara komparatif.",
    "terms.agree_label": "Saya menyatakan telah membaca, mengerti, dan sepenuhnya menyetujui seluruh ketentuan dan syarat yang berlaku di platform rekrutmen AI Talentra.",
    "terms.submit": "Daftar & Kirim Lamaran",
    "terms.success_alert": "Pendaftaran Berhasil! CV/Profil Anda telah terkirim dan AI sedang menganalisis kecocokan.",

    // Splash Loader
    "splash.loading": "Meluncurkan Portal...",
    "splash.subtitle": "Memverifikasi lingkungan multi-peran dan menyelesaikan inisialisasi unit analisis AI Gemini...",

    // Interview Simulator
    "interview.title": "AI Simulator Wawancara Interaktif",
    "interview.desc": "Persiapkan diri Anda dengan masukan langsung berbasis AI dengan Gemini.",
    "interview.startBtn": "Mulai Simulasi",
    "interview.stopBtn": "Selesai & Ringkas",
    "interview.feedback": "Umpan Balik Wawancara AI",
    "interview.rolePlaceholder": "misal, Senior React Developer...",
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('talenta_air_lang');
    return (saved === 'en' || saved === 'id') ? saved : 'id';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('talenta_air_lang', newLang);
  };

  const t = (key: string, fallback?: string): string => {
    return translations[lang][key] || translations['id'][key] || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
