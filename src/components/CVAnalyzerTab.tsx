import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  BrainCircuit, 
  CheckSquare, 
  ChevronRight, 
  RefreshCw, 
  AlertCircle, 
  TrendingUp, 
  CheckCircle, 
  Target, 
  ArrowLeft,
  Upload,
  FileText,
  Briefcase,
  MapPin,
  DollarSign,
  Check,
  X
} from 'lucide-react';
import { JobSeekerProfile, Job } from '../types';
import { useLanguage } from '../LanguageContext';

interface CVAnalyzerTabProps {
  profile: JobSeekerProfile;
  onNavigateToTab: (tab: string) => void;
  onUpdateProfile?: (updated: JobSeekerProfile) => void;
  jobs?: Job[];
}

interface AnalysisResult {
  score: number;
  feedback: string;
  skillGaps: string[];
  recommendedOptimizations: string[];
  matchingRequirementPercent: number;
}

interface GeneralResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendedJobIds: string[];
  generalRoles: string[];
}

export default function CVAnalyzerTab({ 
  profile, 
  onNavigateToTab, 
  onUpdateProfile, 
  jobs = [] 
}: CVAnalyzerTabProps) {
  const { lang } = useLanguage();
  
  // Tab/Mode state
  const [activeMode, setActiveMode] = useState<'upload' | 'checklist'>('upload');
  
  // Checklist-based states
  const [targetRole, setTargetRole] = useState('Senior Fullstack TypeScript Engineer');
  const [requirements, setRequirements] = useState<string[]>([
    '5+ years programming experience in React and Node.js',
    'Proven expertise with modern build systems and bundlers (Vite/Rspack)',
    'Excellent system design capability and database performance optimization skills'
  ]);
  const [newReq, setNewReq] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // File-upload states
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [generalResults, setGeneralResults] = useState<GeneralResult | null>(null);
  
  // Application interaction states
  const [appliedJobs, setAppliedJobs] = useState<Record<string, boolean>>({});
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);

  // Manual requirements handling
  const handleAddRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    if (newReq.trim() && !requirements.includes(newReq.trim())) {
      setRequirements([...requirements, newReq.trim()]);
      setNewReq('');
    }
  };

  const handleRemoveRequirement = (req: string) => {
    setRequirements(requirements.filter(r => r !== req));
  };

  // Trigger manual checklist target evaluation
  const handleTriggerAnalysis = async () => {
    // If the user has a parsed cvText or active profile bio, use that
    if (!profile.cvText && !profile.bio) {
      setError(lang === 'id' 
        ? 'Unggah CV Anda terlebih dahulu di tab sebelah atau isi bio profil Anda sebelum mengevaluasi.'
        : 'Please upload your CV document or add detailed bio text in your profile before evaluating.');
      return;
    }
    setError(null);
    setAnalyzing(true);

    try {
      const res = await fetch('/api/ai/cv-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvText: profile.cvText || profile.bio,
          jobTitle: targetRole,
          requirements: requirements
        })
      });

      if (!res.ok) {
        throw new Error('AI analysis failed. Please verify credentials or server bounds.');
      }

      const data = await res.json();
      setResults(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Server timeout calling Gemini system.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Drag and drop event handlers
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Handle uploaded CV document (PDF or image)
  const handleFileChange = async (selectedFile: File) => {
    if (!selectedFile) return;
    
    const isPdf = selectedFile.type === 'application/pdf';
    const isImage = selectedFile.type.startsWith('image/');
    
    if (!isPdf && !isImage) {
      setUploadError(lang === 'id' 
        ? 'Format berkas tidak didukung. Harap unggah berkas PDF atau Gambar (PNG, JPG, JPEG).' 
        : 'Unsupported file format. Please upload a PDF or Image file.');
      return;
    }
    
    if (selectedFile.size > 10 * 1024 * 1024) {
      setUploadError(lang === 'id'
        ? 'Ukuran berkas melebihi batas 10MB.'
        : 'File size exceeds the 10MB limit.');
      return;
    }

    setFile(selectedFile);
    setUploadError(null);
    setUploading(true);
    setGeneralResults(null);

    try {
      // 1. Read file as Data URL
      const reader = new FileReader();
      const fileDataPromise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (e) => reject(e);
      });
      reader.readAsDataURL(selectedFile);
      const dataUrl = await fileDataPromise;

      // 2. Call Gemini parser to extract structured information
      const parseRes = await fetch('/api/ai/parse-cv-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataUrl,
          filename: selectedFile.name
        })
      });

      if (!parseRes.ok) {
        throw new Error(lang === 'id' 
          ? 'Gagal memproses parsing CV dengan Gemini. Silakan hubungi admin.' 
          : 'Failed parsing CV content with Gemini artificial intelligence.');
      }

      const parsedData = await parseRes.json();

      // 3. Update the global/database profile
      if (onUpdateProfile) {
        onUpdateProfile({
          ...profile,
          title: parsedData.title,
          bio: parsedData.bio,
          skills: parsedData.skills,
          cvText: parsedData.cvText,
          cvFile: {
            name: selectedFile.name,
            type: selectedFile.type,
            dataUrl: dataUrl,
            size: selectedFile.size
          }
        });
      }

      // 4. Automatically run general evaluation and vacancy recommendations
      const evalRes = await fetch('/api/ai/cv-evaluate-full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvText: parsedData.cvText,
          jobs: jobs,
          lang: lang
        })
      });

      if (!evalRes.ok) {
        throw new Error(lang === 'id'
          ? 'Gagal mengevaluasi CV dengan database lowongan.'
          : 'Failed evaluating parsed CV content with the job platform database.');
      }

      const evalData = await evalRes.json();
      setGeneralResults(evalData);
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'An unexpected error occurred while parsing CV.');
    } finally {
      setUploading(false);
    }
  };

  // Run general evaluation on current active profile index (if they already have parsed CV)
  const handleEvaluateActiveCV = async () => {
    if (!profile.cvText) return;
    setUploading(true);
    setUploadError(null);
    setGeneralResults(null);
    
    try {
      const evalRes = await fetch('/api/ai/cv-evaluate-full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvText: profile.cvText,
          jobs: jobs,
          lang: lang
        })
      });

      if (!evalRes.ok) {
        throw new Error(lang === 'id'
          ? 'Gagal mengevaluasi CV aktif Anda.'
          : 'Failed evaluating your active CV resume.');
      }

      const evalData = await evalRes.json();
      setGeneralResults(evalData);
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'An unexpected error occurred during active CV review.');
    } finally {
      setUploading(false);
    }
  };

  // 1-Click apply recommended job on platform
  const handleApplyRecommendedJob = async (jobId: string) => {
    setApplyingJobId(jobId);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: jobId,
          applicantId: profile.id,
          anonymousMode: false
        })
      });
      if (res.ok) {
        setAppliedJobs(prev => ({ ...prev, [jobId]: true }));
      }
    } catch (error) {
      console.error('Failed to apply recommended job:', error);
    } finally {
      setApplyingJobId(null);
    }
  };

  return (
    <div className="max-w-full mx-auto px-4 sm:px-8 md:px-12 py-8 text-left">
      
      {/* Back button */}
      <div className="mb-6">
        <button
          onClick={() => onNavigateToTab('dashboard')}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100/85 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          {lang === 'id' ? 'Kembali ke Dashboard' : 'Back to Dashboard'}
        </button>
      </div>
      
      {/* Tab Header */}
      <div className="pb-6 border-b border-slate-250 dark:border-slate-800">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <BrainCircuit className="w-7 h-7 text-indigo-500 animate-pulse" /> 
          {lang === 'id' ? 'Sistem Evaluasi CV & Rekomendasi Karir AI' : 'AI CV Evaluator & Career Advisor'}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {lang === 'id' 
            ? 'Unggah CV Anda langsung dan biarkan Gemini AI menganalisis kelebihan, kekurangan, serta mencocokkan pekerjaan yang paling sesuai dari database.' 
            : 'Upload your CV and let Gemini AI automatically discover pros, cons, and suggest highly-compatible jobs from our database.'}
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mt-6 mb-8 gap-4 overflow-x-auto">
        <button
          onClick={() => {
            setActiveMode('upload');
            setError(null);
          }}
          className={`pb-3 text-xs font-bold transition-all border-b-2 gap-2 flex items-center shrink-0 cursor-pointer ${
            activeMode === 'upload'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          <Upload className="w-4 h-4" />
          {lang === 'id' ? 'Evaluasi Dokumen CV (Instan & Otomatis)' : 'CV Document Analysis (Automatic & Instant)'}
        </button>
        <button
          onClick={() => {
            setActiveMode('checklist');
            setError(null);
          }}
          className={`pb-3 text-xs font-bold transition-all border-b-2 gap-2 flex items-center shrink-0 cursor-pointer ${
            activeMode === 'checklist'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          {lang === 'id' ? 'Analisis Target Spesifik (Manual)' : 'Target Specific Job Analyst (Manual)'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ==================== LEFT COLUMN: SETUP PARAMETERS / UPLOAD ZONE ==================== */}
        <div className="lg:col-span-4 space-y-6">
          
          {activeMode === 'upload' ? (
            // UPLOAD CV DOCUMENT MODE
            <div className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-250 uppercase tracking-widest font-mono">
                  {lang === 'id' ? 'UNGGAH BERKAS CV' : 'UPLOAD CV FILE'}
                </h3>
                <p className="text-2xs text-slate-450 dark:text-slate-500 leading-normal mt-1">
                  {lang === 'id' 
                    ? 'Seret gambar (PNG, JPG) atau berkas PDF CV Anda ke kotak di bawah.' 
                    : 'Drag & drop your PDF, PNG, or JPG resume directly into the target zone below.'}
                </p>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-500/5'
                    : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-800 bg-slate-50/50 dark:bg-slate-950/20'
                }`}
                onClick={() => document.getElementById('cv-file-uploader')?.click()}
              >
                <input
                  id="cv-file-uploader"
                  type="file"
                  className="hidden"
                  accept="application/pdf, image/png, image/jpeg, image/jpg"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                />

                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="p-3 bg-indigo-500/10 rounded-full text-indigo-500">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {lang === 'id' ? 'Pilih Berkas atau Seret ke Sini' : 'Browse File or Drag & Drop'}
                    </span>
                    <p className="text-[10px] text-slate-450 mt-1">
                      PDF, PNG, JPG (Max. 10MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Show file currently loaded */}
              {file && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                  <FileText className="w-5 h-5 text-indigo-500 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{file.name}</p>
                    <p className="text-[10px] text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setGeneralResults(null);
                    }}
                    className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}



              {uploadError && (
                <div className="p-3 bg-rose-500/10 text-rose-500 text-2xs rounded-lg flex gap-2 items-start border border-rose-500/20">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>
          ) : (
            // TARGET CRITERIA CHECKLIST MODE (OLD MANUAL MODE)
            <div className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-6">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest font-mono">
                {lang === 'id' ? 'Parameter Analisis' : 'Analysis Parameters'}
              </h2>

              <div className="space-y-1.5">
                <label className="text-2xs font-bold text-slate-400 font-mono tracking-wider uppercase">
                  {lang === 'id' ? 'PEKERJAAN TARGET YANG DIINGINKAN' : 'TARGET JOB PREFERENCE'}
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="space-y-3">
                <label className="text-2xs font-bold text-slate-400 font-mono tracking-wider">VACANCY SKILL CRITERIA</label>
                
                <div className="space-y-1.5 max-h-48 overflow-y-auto border border-slate-100 dark:border-slate-900 p-2 rounded-lg bg-slate-50/50 dark:bg-slate-950/20">
                  {requirements.map(req => (
                    <div key={req} className="flex items-start justify-between gap-2 p-1.5 bg-white dark:bg-slate-900 rounded-md text-2xs border border-slate-100 dark:border-slate-800 text-slate-705 dark:text-slate-300">
                      <span>{req}</span>
                      <button type="button" onClick={() => handleRemoveRequirement(req)} className="text-slate-400 hover:text-rose-500 p-0.5">
                        ✕
                      </button>
                    </div>
                  ))}
                  {requirements.length === 0 && <span className="text-2xs italic text-slate-400 p-2 block">No requirements listed yet...</span>}
                </div>

                <form onSubmit={handleAddRequirement} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add checklist parameter..."
                    value={newReq}
                    onChange={(e) => setNewReq(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs"
                  />
                  <button type="submit" className="px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer">
                    Add
                  </button>
                </form>
              </div>

              <button
                disabled={analyzing}
                onClick={handleTriggerAnalysis}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 text-xs rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:bg-indigo-600/60 cursor-pointer"
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                    Gemini evaluating CV alignment...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4.5 h-4.5" />
                    Trigger Gemini AI Evaluation
                  </>
                )}
              </button>

              {error && (
                <div className="p-3 bg-rose-500/10 text-rose-500 text-2xs rounded-lg flex gap-1.5 items-start border border-rose-500/20 font-sans">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          )}

        </div>

        {/* ==================== RIGHT COLUMN: AI ADVICE & JOBS OUTPUT ==================== */}
        <div className="lg:col-span-8 space-y-6">
          
          {activeMode === 'upload' ? (
            // ==================== RENDERING PARSING & EVAL MODE RESULTS ====================
            uploading ? (
              <div className="bg-white dark:bg-slate-900/40 p-16 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 text-center flex flex-col items-center justify-center min-h-[420px]">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                  className="h-12 w-12 text-indigo-500"
                >
                  <BrainCircuit className="w-12 h-12" />
                </motion.div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-4">
                  {lang === 'id' ? 'Dokumen Sedang Dipindai oleh Gemini AI' : 'Gemini Artificial Intelligence Reading Document'}
                </h4>
                <p className="text-2xs text-slate-450 dark:text-slate-400 mt-2 max-w-sm leading-normal">
                  {lang === 'id'
                    ? 'Ekstraksi teks cerdas dan analisis kecocokan pekerjaan sedang dilakukan. Harap tunggu beberapa detik...'
                    : 'Smart text extraction, quality review and job compatibility analysis is active. Please hold for a few moments...'}
                </p>
              </div>
            ) : generalResults ? (
              <div className="space-y-6">
                
                {/* Visual scorecard score block summary */}
                <div className="bg-gradient-to-br from-[#0c1024] to-[#1e1451] border border-indigo-950 text-white p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-6 justify-between shadow-xl">
                  <div className="text-left">
                    <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase font-mono bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-300">
                      GENERAL PROFILE REPORT
                    </span>
                    <h3 className="text-lg font-black tracking-tight mt-2.5">
                      {lang === 'id' ? 'Skor Kelayakan & Kesiapan Karir' : 'Career Readiness Scorecard'}
                    </h3>
                    <p className="text-2xs text-slate-350 leading-relaxed mt-1 max-w-md">
                      {lang === 'id'
                        ? 'Skor ini dievaluasi secara global berdasarkan kedalaman deskripsi kerja dan keterbacaan teknis CV Anda.'
                        : 'Score computed globally analyzing keywords, work metrics depth, and technical formatting.'}
                    </p>
                  </div>

                  <div className="flex flex-col items-center shrink-0">
                    <div className="relative flex items-center justify-center w-24 h-24">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.07)" strokeWidth="6" fill="transparent" />
                        <circle cx="48" cy="48" r="40" stroke="rgb(99, 102, 241)" strokeWidth="6" fill="transparent" strokeDasharray={`${Math.PI * 2 * 40}`} strokeDashoffset={`${Math.PI * 2 * 40 * (1 - generalResults.score / 100)}`} strokeLinecap="round" />
                      </svg>
                      <span className="absolute text-xl font-black font-mono">{generalResults.score}%</span>
                    </div>
                    <span className="text-[10px] text-indigo-300 font-mono tracking-wide uppercase mt-1.5">Strength Rating</span>
                  </div>
                </div>

                {/* Scorecard breakdown: Bagus vs Kurang */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Kelebihan / Bagus */}
                  <div className="bg-emerald-500/[0.02] dark:bg-emerald-500/[0.01] p-5 rounded-2xl border border-emerald-500/15 dark:border-emerald-500/10">
                    <h4 className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> 
                      {lang === 'id' ? 'Kelebihan / Bagus' : 'CV Strengths / Pros'}
                    </h4>
                    <div className="mt-4 space-y-3 text-left animate-fade-in">
                      {generalResults.strengths.map((str, i) => (
                        <div key={i} className="flex gap-2.5 text-xs text-slate-650 dark:text-slate-300 leading-relaxed font-semibold">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{str}</span>
                        </div>
                      ))}
                      {generalResults.strengths.length === 0 && (
                        <p className="text-2xs italic text-slate-450">No major strengths found.</p>
                      )}
                    </div>
                  </div>

                  {/* Kekurangan / Kekurangan */}
                  <div className="bg-rose-500/[0.02] dark:bg-rose-500/[0.01] p-5 rounded-2xl border border-rose-500/15 dark:border-rose-500/10">
                    <h4 className="text-xs font-mono font-bold text-rose-500 uppercase tracking-widest flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> 
                      {lang === 'id' ? 'Kekurangan / Kelemahan' : 'CV Weaknesses / Cons'}
                    </h4>
                    <div className="mt-4 space-y-3 text-left">
                      {generalResults.weaknesses.map((weak, i) => (
                        <div key={i} className="flex gap-2.5 text-xs text-slate-650 dark:text-slate-300 leading-relaxed font-semibold">
                          <span className="text-rose-500 font-bold text-base leading-none shrink-0 mt-0.5">•</span>
                          <span>{weak}</span>
                        </div>
                      ))}
                      {generalResults.weaknesses.length === 0 && (
                        <p className="text-2xs italic text-emerald-500 font-bold">Perfect formatting! No weaknesses found.</p>
                      )}
                    </div>
                  </div>

                </div>

                {/* RECOMMENDED VACANCIES FROM PLATFORM */}
                <div className="bg-white dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 text-left">
                  <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-500" />
                    {lang === 'id' ? 'Pekerjaan yang Cocok (Lowongan Aktif)' : 'Recommended Open Vacancies Match'}
                  </h4>
                  <p className="text-2xs text-slate-450 dark:text-slate-500 mt-1">
                    {lang === 'id'
                      ? 'Berdasarkan keahlian pada berkas CV Anda, AI mencocokkan beberapa lowongan riil aktif di bawah:'
                      : 'AI matched your parsed skillsets against active vacancies hosted in our system:'}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                    {jobs.filter(j => generalResults.recommendedJobIds.includes(j.id) && j.status === 'approved').map(job => (
                      <div 
                        key={job.id} 
                        className="p-4 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-150 dark:border-slate-850 flex flex-col justify-between hover:border-indigo-500/45 dark:hover:border-indigo-500/40 transition-all shadow-2xs"
                      >
                        <div className="space-y-2">
                          <div className="flex gap-3 items-start">
                            <img referrerPolicy="no-referrer" src={job.companyLogo} className="w-9 h-9 rounded-lg object-cover bg-white p-0.5 border" alt="Logo" />
                            <div className="min-w-0">
                              <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{job.title}</h5>
                              <p className="text-[10px] text-slate-450 truncate">{job.companyName}</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500 dark:text-slate-400 pt-1">
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                            <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />{job.salaryRange}</span>
                          </div>

                          <div className="flex flex-wrap gap-1 pt-1.5">
                            {job.skillsRequired.slice(0, 3).map(sk => (
                              <span key={sk} className="px-1.5 py-0.5 text-[9px] font-bold font-mono bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 rounded-md">
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/50 mt-4 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded-md">
                            {lang === 'id' ? 'Kecocokan Tinggi' : 'High Compatibility Match'}
                          </span>
                          
                          <button
                            disabled={appliedJobs[job.id] || applyingJobId === job.id}
                            onClick={() => handleApplyRecommendedJob(job.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                              appliedJobs[job.id]
                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/25'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs shadow-indigo-500/10'
                            }`}
                          >
                            {applyingJobId === job.id ? (
                              <RefreshCw className="w-3 h-3 animate-spin mx-2" />
                            ) : appliedJobs[job.id] ? (
                              <>✓ {lang === 'id' ? 'Dilamar' : 'Applied'}</>
                            ) : (
                              <>{lang === 'id' ? 'Lamar Instan' : 'Instant Apply'}</>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Fallback if no matching open jobs in DB */}
                    {jobs.filter(j => generalResults.recommendedJobIds.includes(j.id) && j.status === 'approved').length === 0 && (
                      <div className="col-span-full p-4 bg-slate-50 dark:bg-slate-950/20 text-center rounded-xl border border-slate-200/50 dark:border-slate-800/50 text-2xs text-slate-450 italic">
                        {lang === 'id'
                          ? 'Meskipun saat ini belum ada berkas lowongan aktif yang 100% cocok langsung dengan profil CV unik Anda, AI menyarankan peran spesifik di bawah.'
                          : 'No active job vacancies precisely match your credentials on file, but you are qualified for roles below.'}
                      </div>
                    )}
                  </div>
                </div>

                {/* SUGGESTED GENERAL CAREER PATHS */}
                <div className="bg-white dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 text-left">
                  <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Target className="w-4 h-4 text-violet-500" />
                    {lang === 'id' ? 'Saran Alternatif Peran & Bidang Karir' : 'Suggested General Roles & Career Pathways'}
                  </h4>
                  <p className="text-2xs text-slate-450 dark:text-slate-500 mt-1">
                    {lang === 'id'
                      ? 'Bidang profesional yang sangat direkomendasikan untuk diexplore lebih lanjut berdasarkan keahlian Anda:'
                      : 'High-opportunity professional domains worth exploring based on your documented experience:'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-4">
                    {generalResults.generalRoles.map((role, i) => (
                      <div key={i} className="p-3 bg-indigo-500/[0.02] hover:bg-indigo-500/[0.04] dark:bg-slate-950/30 border border-indigo-100/50 dark:border-slate-850 rounded-xl flex gap-3.5 items-center">
                        <span className="w-6 h-6 rounded-full font-mono font-bold text-xs bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-750 dark:text-slate-250 truncate">{role}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-12 text-center min-h-[420px] flex flex-col items-center justify-center">
                <BrainCircuit className="w-12 h-12 text-slate-350 dark:text-slate-705 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-850 dark:text-slate-300 mt-4">
                  {lang === 'id' ? 'Menunggu Dokumen CV' : 'Expecting CV Resume Document'}
                </h3>
                <p className="text-2xs text-slate-450 dark:text-slate-400 mt-2 max-w-sm leading-normal">
                  {lang === 'id'
                    ? 'Silakan seret berkas gambar atau PDF dari CV Anda ke wilayah unggah di sebelah kiri untuk melihat evaluasi kecocokan karir instan.'
                    : 'Please select or drag-and-drop a PDF or image of your CV in the upload card to triggers instant career evaluation ratings.'}
                </p>
              </div>
            )
          ) : (
            // ==================== RENDERING MANUAL CHECKLIST RESULTS ====================
            results ? (
              <div className="space-y-6">
                
                {/* Score card Header */}
                <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white p-6 rounded-2xl border border-indigo-900 flex flex-col sm:flex-row items-center gap-6 justify-between shadow-md">
                  <div className="text-left">
                    <h3 className="text-lg font-black tracking-tight">{targetRole} Scorecard</h3>
                    <p className="text-2xs text-slate-350 leading-relaxed mt-1">
                      {lang === 'id'
                        ? 'Tinjauan keselarasan kompetensi profil Anda terhadap kriteria checklist target spesifik manual.'
                        : 'Compiled alignment overview based on your digital profile CV. Check the optimizations tab underneath to bump your alignment percentage.'}
                    </p>
                  </div>

                  <div className="flex flex-col items-center shrink-0">
                    <div className="relative flex items-center justify-center w-24 h-24">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="transparent" />
                        <circle cx="48" cy="48" r="40" stroke="rgb(99, 102, 241)" strokeWidth="6" fill="transparent" strokeDasharray={`${Math.PI * 2 * 40}`} strokeDashoffset={`${Math.PI * 2 * 40 * (1 - results.score / 100)}`} strokeLinecap="round" />
                      </svg>
                      <span className="absolute text-xl font-black font-mono">{results.score}%</span>
                    </div>
                    <span className="text-[10px] text-indigo-300 font-mono tracking-wide uppercase mt-1.5">Match Rating</span>
                  </div>
                </div>

                {/* Evaluative Feedback */}
                <div className="bg-white dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 text-left">
                  <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-indigo-500" /> Recruiter Evaluation Summary
                  </h4>
                  <p className="text-slate-650 dark:text-slate-300 text-xs mt-3.5 leading-relaxed font-semibold">
                    {results.feedback}
                  </p>
                </div>

                {/* Skill gap detector */}
                <div className="bg-white dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 text-left">
                  <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
                    Detected Skill Gaps & Weaknesses
                  </h4>
                  <p className="text-2xs text-slate-450 dark:text-slate-400 mt-1">
                    These keywords were requested in vacancy guidelines but were weak or not found in your CV:
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-4 text-left">
                    {results.skillGaps.map(gap => (
                      <span key={gap} className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-500 text-2xs font-extrabold flex items-center gap-1 select-none">
                        <AlertCircle className="w-3.5 h-3.5" /> {gap}
                      </span>
                    ))}
                    {results.skillGaps.length === 0 && (
                      <span className="text-2xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg flex items-center gap-1 shrink-0">
                        <CheckCircle className="w-3.5 h-3.5" /> No critical technical elements missing! Excellent.
                      </span>
                    )}
                  </div>
                </div>

                {/* recommended optimizations */}
                <div className="bg-white dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 text-left border-slate-50">
                  <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-violet-500" /> Wording & Achievement Optimizations
                  </h4>
                  <div className="mt-4 space-y-3">
                    {results.recommendedOptimizations.map((opt, idx) => (
                      <div key={idx} className="flex gap-2 text-xs leading-relaxed text-slate-650 dark:text-slate-300">
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
                <BrainCircuit className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                <h3 className="text-sm font-bold text-slate-850 dark:text-slate-305 mt-4">Idle Evaluation State</h3>
                <p className="text-2xs text-slate-450 dark:text-slate-400 mt-2 max-w-sm leading-normal">
                  Select your parameters in the left pane, specify the vacancy keyword priorities, and press trigger to run the Gemini analysis suite.
                </p>
                
                <button
                  onClick={() => onNavigateToTab('dashboard')}
                  className="mt-6 px-4 py-2 text-xs font-bold bg-slate-150 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            )
          )}
        </div>

      </div>

      {/* Immersive AI CV Analysis Processing Overlay Dialog */}
      <AnimatePresence>
        {uploading && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Dark premium backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.75 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            
            {/* Centered Holographic Core Loading Dialog */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-3xl z-10 overflow-hidden"
            >
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

              {/* Holographic Loader Element with rotating border rings */}
              <div className="relative flex justify-center items-center py-6">
                {/* Outer Ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, ease: 'linear', duration: 1.8 }}
                  className="w-16 h-16 rounded-full border-t-2 border-r-2 border-indigo-500 border-b border-l border-slate-800"
                />
                
                {/* Inner Ring */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, ease: 'linear', duration: 1.2 }}
                  className="absolute w-10 h-10 rounded-full border-b-2 border-l-2 border-purple-400 border-t border-r border-slate-800"
                />

                {/* Central brain pulse animation */}
                <div className="absolute text-indigo-400">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                  >
                    <BrainCircuit className="w-5 h-5 text-indigo-400" />
                  </motion.div>
                </div>
              </div>

              {/* Scanning laser visual progress timeline */}
              <div className="relative w-full h-1 bg-slate-800 rounded-full overflow-hidden mb-6">
                <motion.div
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                  className="w-1/2 h-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent absolute"
                />
              </div>

              {/* Loading dialog messaging details */}
              <h4 className="text-xs font-black text-white tracking-wider uppercase font-mono">
                {lang === 'id' ? 'Memproses Berkas CV Anda' : 'PROCESSING YOUR CV RESUME'}
              </h4>
              
              <p className="mt-3 text-xs text-slate-300 leading-relaxed font-sans px-2 text-center">
                {lang === 'id'
                  ? 'Gemini membaca teks dari dokumen berkas, mengekstrak keterampilan, menilai kelayakan profil, serta merumuskan rekomendasi lowongan karir...'
                  : 'Gemini is scanning the document file, extracting exact technologies, evaluating credentials, and matching live platform jobs...'}
              </p>

              <p className="mt-4 text-[9px] text-slate-500 font-mono tracking-widest uppercase text-center">
                ENGINE GEMINI • TALENTRA
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
