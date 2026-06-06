import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Sparkles, 
  Briefcase, 
  FileText, 
  UserCheck, 
  MessageSquare, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  Play, 
  Compass, 
  CheckCircle,
  Clock,
  ExternalLink,
  Users
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface WelcomeTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRole: 'seeker' | 'recruiter' | 'admin';
  onNavigateToTab: (page: 'landing' | 'dashboard' | 'analyzer' | 'simulator' | 'chats') => void;
  onSwitchRole: (role: 'seeker' | 'recruiter' | 'admin') => void;
}

export default function WelcomeTutorialModal({
  isOpen,
  onClose,
  activeRole,
  onNavigateToTab,
  onSwitchRole
}: WelcomeTutorialModalProps) {
  const { lang } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  // Bilingual slides data
  const steps = [
    {
      title: lang === 'id' ? 'Selamat Datang di Talentra 👋' : 'Welcome to Talentra 👋',
      subtitle: lang === 'id' ? 'Gerbang Pintar Menuju Karir Impian & Rekrutmen Aman' : 'Smart Gateway to Your Dream Career & Safe Recruitment',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80',
      icon: <Sparkles className="w-8 h-8 text-indigo-500 animate-pulse" />,
      tag: lang === 'id' ? 'PENDAHULUAN' : 'OMBOARDING INTRO',
      description: lang === 'id' 
        ? 'Talentra adalah platform lowongan kerja full-stack generasi baru yang ditenagai oleh kecerdasan buatan (Gemini AI) untuk meningkatkan daya saing pencari kerja sekaligus melacak & menyeleksi lowongan mencurigakan (anti-scam).'
        : 'Talentra is a modern full-stack job board powered by Gemini AI to help you skyrocket your professional profile, practice live interviews, and combat recruiter scams.',
      bullets: lang === 'id' 
        ? [
            'Sistem AI mutakhir (CV Analyzer & Simulasi interview).',
            'Sistem pengawasan keamanan anti-loker penipuan otomatis.',
            'Dukungan multi-peran (Pencari Kerja, Perekrut, & Admin) terpadu.'
          ]
        : [
            'Cutting-edge AI systems (CV Analyzer & Interview Simulator).',
            'Autonomous anti-scam monitoring to filter suspicious jobs.',
            'Combined multi-role experience (Seeker, Recruiter, and Admin).'
          ]
    },
    {
      title: lang === 'id' ? 'Sektor Non-IT & Pencarian Aman 🛡️' : 'Non-IT Diversity & Safe Search 🛡️',
      subtitle: lang === 'id' ? 'Mulai dari Kuliner, Perhotelan, Logistik, hingga Jasa Profesional' : 'From Culinary, Hospitality, Logistics, to Guild & Professional services',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&auto=format&fit=crop&q=80',
      icon: <ShieldCheck className="w-8 h-8 text-emerald-500 animate-pulse" />,
      tag: lang === 'id' ? 'FITUR UTAMA: SMART JOB SEARCH' : 'CORE PATTERN: SMART SEARCH',
      description: lang === 'id'
        ? 'Kami memiliki ratusan lowongan kerja dari sektor teknologi hingga industri kuliner, pelayan, koki, asisten gigi, perawat, supir cargo, barista, penjahit, dan guru privat. Fitur keamanan kami juga melacak indikasi kecurigaan modus biaya administrasi secara real-time!'
        : 'Explore hundreds of real physical/non-technical jobs as easily as corporate tech positions. Our built-in safety filter checks and tags mock admin-fee scams in real-time!',
      bullets: lang === 'id'
        ? [
            'Filter lowongan IT & Non-IT secara presisi dalam satu ketukan.',
            'Lencana "Approved" vs bendera peringatan kuning jika mencurigakan.',
            'Data lowongan akurat disertai tombol lamar instan tanpa syarat fiktif.'
          ]
        : [
            'Filter IT & non-IT jobs instantly on the home dashboard.',
            'Yellow danger flags for suspicious postings demanding hidden fees.',
            'Safe, verified application flow without fraudulent placeholders.'
          ],
      action: {
        label: lang === 'id' ? 'Lihat Lowongan' : 'Browse Jobs',
        page: 'landing' as const
      }
    },
    {
      title: lang === 'id' ? 'AI CV Analyzer 📄' : 'AI CV Analyzer 📄',
      subtitle: lang === 'id' ? 'Ketahui Tingkat Kecocokan Resume Anda Secara Instan' : 'Get Real-time Content Alignment Analysis',
      image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
      icon: <FileText className="w-8 h-8 text-purple-500 animate-pulse" />,
      tag: 'AI-INFUSED SYSTEM',
      description: lang === 'id'
        ? 'Unggah CV Anda (format PDF/TXT) untuk dibandingkan langsung dengan deskripsi pekerjaan. Gemini AI akan memberikan penilaian skor kecocokan (0-100%), koreksi tata bahasa, kata kunci yang hilang, serta rekomendasi perbaikan instan agar dilirik rekruter.'
        : 'Drag and drop your professional CV to check matches against any active job detail. Gemini dynamically reviews missing keywords, grammatical suggestions, and spits out actionable score metrics.',
      bullets: lang === 'id'
        ? [
            'Penilaian kecocokan langsung yang objektif dan instan.',
            'Saran perbaikan kalimat spesifik bertenaga Gemini AI.',
            'Membantu Anda melewati filter ATS (Applicant Tracking System).'
          ]
        : [
            'Direct compatibility scoring using natural language models.',
            'Specific resume tips, missing skill highlights, and rewrite examples.',
            'Optimize your resume to scale past ATS checkers effortlessly.'
          ],
      action: {
        label: lang === 'id' ? 'Buka Analisis CV' : 'Launch CV Analyzer',
        page: 'analyzer' as const
      }
    },
    {
      title: lang === 'id' ? 'AI Wawancara Simulator 🎙️' : 'AI Interview Simulator 🎙️',
      subtitle: lang === 'id' ? 'Latihan Menjawab Pertanyaan Teknis & Perilaku Tanpa Gugup' : 'Practice Custom Behavioral and Technical Q&As',
      image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&auto=format&fit=crop&q=80',
      icon: <UserCheck className="w-8 h-8 text-blue-500 animate-pulse" />,
      tag: 'AI INTERACTION',
      description: lang === 'id'
        ? 'Jangan biarkan rasa gugup merusak kesempatan emas Anda. AI Interview Simulator bertindak sebagai pewawancara interaktif. Anda dapat berbicara langsung menggunakan mikrofon atau mengetik jawaban Anda untuk dievaluasi.'
        : 'Overcome presentation anxiety with customized conversation drills. Voice record or text-type your answers. Gemini analyzes tone, posture, logic and provides feedback with a thorough scoreboard!',
      bullets: lang === 'id'
        ? [
            'Pertanyaan kustom yang disesuaikan dengan posisi yang dilamar.',
            'Evaluasi per-jawaban dengan saran draf jawaban yang ideal.',
            'Transkripsi suara ke tulisan otomatis di browser.'
          ]
        : [
            'Context-aware questions tailored to the specified job role.',
            'Full transcript, score card, and ideal paragraph reconstructions.',
            'Highly interactive, modern visual layout with step indicator.'
          ],
      action: {
        label: lang === 'id' ? 'Mulai Latihan Wawancara' : 'Start Mock Interview',
        page: 'simulator' as const
      }
    },
    {
      title: lang === 'id' ? 'Direct HR Chat System 💬' : 'Direct HR Chat System 💬',
      subtitle: lang === 'id' ? 'Komunikasi Langsung Tanpa Perantara Misterius' : 'End-to-End Chat Connections with Hiring managers',
      image: 'https://images.unsplash.com/photo-1552581230-2641474ddb02?w=600&auto=format&fit=crop&q=80',
      icon: <MessageSquare className="w-8 h-8 text-pink-500 animate-pulse" />,
      tag: 'COLLABORATIVE EXCHANGES',
      description: lang === 'id'
        ? 'Pantau progres lamaran Anda dan berkomunikasilah langsung dengan manajer HRD. Anda dapat menanyakan jadwal, mendiskusikan penawaran gaji kontan, hingga memverifikasi keabsahan penugasan berkas perusahaan.'
        : 'Say goodbye to silent notifications. Check application updates via our direct real-time chat interface and connect directly with hiring managers to verify interview times and check-ins.',
      bullets: lang === 'id'
        ? [
            'Sistem pesan real-time terintegrasi untuk pencari kerja & rekruter.',
            'Kirim pesan instan langsung dari riwayat lamaran Anda.',
            'Ciptakan rasa percaya tinggi dan hilangkan miskomunikasi.'
          ]
        : [
            'Built-in real-time messaging pipeline for seekers & job posters.',
            'Initiate direct conversations right from the list tracking views.',
            'Minimize delays and skip third-party agent layers.'
          ],
      action: {
        label: lang === 'id' ? 'Buka Sistem Chat' : 'Open Direct Chats',
        page: 'chats' as const
      }
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleAction = (page: 'landing' | 'dashboard' | 'analyzer' | 'simulator' | 'chats') => {
    onNavigateToTab(page);
    onClose();
  };

  const activeStepData = steps[currentStep];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
          id="tutorial-backdrop"
        />

        {/* Modal box Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', duration: 0.5, bounce: 0.15 }}
          className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col md:flex-row min-h-[500px]"
          id="welcome-tutorial-modal-container"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 Transition-all active:scale-95"
            aria-label="Close dialog"
            id="tutorial-close-btn"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Visual Column */}
          <div className="w-full md:w-5/12 bg-slate-100 dark:bg-slate-950 relative h-48 md:h-auto overflow-hidden flex flex-col justify-between p-6">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950/80 md:to-slate-950/90 z-10" />
            
            {/* Display Unsplash Illustration backgrounds */}
            <img 
              src={activeStepData.image} 
              alt={activeStepData.title}
              className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out transform scale-102 hover:scale-105"
              referrerPolicy="no-referrer"
            />

            {/* Float Badge */}
            <div className="relative z-20 self-start bg-indigo-650/40 dark:bg-slate-900/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
              <span className="text-[10px] font-bold font-mono tracking-widest text-indigo-200 dark:text-indigo-400 uppercase">
                {activeStepData.tag}
              </span>
            </div>

            {/* Bottom Graphic Badge */}
            <div className="relative z-20 mt-auto flex items-center gap-3">
              <div className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg">
                {activeStepData.icon}
              </div>
              <div className="text-left text-white">
                <p className="text-[10px] font-bold text-indigo-300 font-mono tracking-wider uppercase mb-0.5 leading-none">
                  {lang === 'id' ? 'Langkah' : 'Onboard Step'}
                </p>
                <h4 className="text-sm font-black font-sans leading-none">
                  0{currentStep + 1} / 0{steps.length}
                </h4>
              </div>
            </div>
          </div>

          {/* Right Content Column */}
          <div className="w-full md:w-7/12 p-6 md:p-10 flex flex-col justify-between text-left dark:text-white bg-white dark:bg-slate-900">
            <div>
              {/* Core Titles */}
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2 leading-tight">
                  {activeStepData.title}
                </h2>
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide font-mono">
                  {activeStepData.subtitle}
                </p>
              </div>

              {/* Dynamic Description Paragraph */}
              <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed mb-6">
                {activeStepData.description}
              </p>

              {/* Bullets List of features */}
              <div className="space-y-3 mb-8">
                {activeStepData.bullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-xs md:text-sm text-slate-700 dark:text-slate-300 font-medium">
                      {bullet}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Row Controls */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Progress Dots Indicators */}
              <div className="flex gap-2 items-center">
                {steps.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentStep(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentStep === idx 
                        ? 'w-6 bg-indigo-600 dark:bg-indigo-505' 
                        : 'w-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700'
                    }`}
                    title={`Slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Action and Navigation button group */}
              <div className="flex justify-between sm:justify-end items-center gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={handlePrev}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-xs font-bold text-slate-750 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer active:scale-95"
                    id="tutorial-prev-btn"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    {lang === 'id' ? 'Kembali' : 'Back'}
                  </button>
                )}

                {/* Conditional Interactive Mini Dashboard Navigation Buttons */}
                {activeStepData.action && (
                  <button
                    onClick={() => handleAction(activeStepData.action!.page)}
                    className="flex items-center gap-1 px-3.5 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 text-xs font-bold transition-all cursor-pointer active:scale-95"
                    id={`tutorial-try-action-btn-${currentStep}`}
                  >
                    <Play className="w-3 h-3 fill-current shrink-0" />
                    {activeStepData.action.label}
                  </button>
                )}

                <button
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-705 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer ml-auto"
                  id="tutorial-next-btn"
                >
                  {currentStep === steps.length - 1 ? (
                    <>
                      {lang === 'id' ? 'Saya Mengerti!' : 'Understand!'}
                      <CheckCircle className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      {lang === 'id' ? 'Lanjut' : 'Next'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
