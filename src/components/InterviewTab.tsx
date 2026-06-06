import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Send, User, ChevronRight, HelpCircle, Trophy, RefreshCw, Star, Info, MessageSquare, AlertCircle, ArrowLeft } from 'lucide-react';
import { InterviewSession } from '../types';
import { useLanguage } from '../LanguageContext';

export default function InterviewTab({ onNavigateToTab }: { onNavigateToTab?: (tab: string) => void } = {}) {
  const { t, lang } = useLanguage();
  const [targetJob, setTargetJob] = useState('Senior Fullstack TypeScript Engineer');
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [overallEvaluation, setOverallEvaluation] = useState<{ score: number, summary: string } | null>(null);

  const handleStartSession = async () => {
    setLoading(true);
    setOverallEvaluation(null);

    // Seed the first question
    const initialHistory = [
      { role: 'interviewer' as const, text: `Hello! Welcome to your simulated technical interview for the position of ${targetJob}. To start things off, could you introduce yourself and briefly summarize your core architectural experience?` }
    ];

    setSession({
      id: `session-${Date.now()}`,
      jobTitle: targetJob,
      companyName: 'Finverge Corp (Simulated)',
      messages: [
        { id: '1', sender: 'interviewer', text: initialHistory[0].text }
      ],
      isCompleted: false
    });

    setLoading(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !session || loading) return;

    const userMessage = inputText.trim();
    setInputText('');
    setLoading(true);

    // Append candidate message
    const updatedMessages = [
      ...session.messages,
      { id: `msg-cand-${Date.now()}`, sender: 'candidate' as const, text: userMessage }
    ];

    setSession({
      ...session,
      messages: updatedMessages
    });

    // Translate to server history format
    const historyPayload = updatedMessages.map(m => ({
      role: m.sender as 'interviewer' | 'candidate',
      text: m.text
    }));

    try {
      const res = await fetch('/api/ai/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: historyPayload,
          jobTitle: session.jobTitle
        })
      });

      if (!res.ok) throw new Error('Failed to retrieve simulation response.');
      const data = await res.json();

      // Append interviewer follow up and feedback on candidate message
      const lastCandidateMsgIndex = updatedMessages.length - 1;
      updatedMessages[lastCandidateMsgIndex] = {
        ...updatedMessages[lastCandidateMsgIndex],
        feedback: data.feedback,
        score: data.score
      };

      if (data.isSessionComplete) {
        // Evaluate overall average
        const candidateScores = updatedMessages
          .filter(m => m.sender === 'candidate')
          .map(m => m.score || 70);
        const averageScore = Math.round(candidateScores.reduce((a, b) => a + b, 0) / (candidateScores.length || 1));

        setSession({
          ...session,
          messages: updatedMessages,
          isCompleted: true,
          overallScore: averageScore,
          overallFeedback: `You completed your interview evaluation for ${session.jobTitle}. Your answers displayed deep expertise on components, but try to bring out metrics around latency reductions or system scale in actual HR environments.`
        });
      } else {
        updatedMessages.push({
          id: `msg-int-${Date.now()}`,
          sender: 'interviewer' as const,
          text: data.nextQuestion
        });

        setSession({
          ...session,
          messages: updatedMessages
        });
      }

    } catch (err) {
      console.error(err);
      updatedMessages.push({
        id: `msg-fallback-err-${Date.now()}`,
        sender: 'interviewer' as const,
        text: 'That is a very good perspective. Can you describe key trade-offs in state management options you have deployed?'
      });
      setSession({
        ...session,
        messages: updatedMessages
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-full mx-auto px-4 sm:px-8 md:px-12 py-8 text-left">
      
      {/* Back button */}
      {onNavigateToTab && (
        <div className="mb-6">
          <button
            onClick={() => onNavigateToTab('dashboard')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            {lang === 'id' ? 'Kembali ke Dashboard' : 'Back to Dashboard'}
          </button>
        </div>
      )}
      
      {/* Intro */}
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Cpu className="w-7 h-7 text-indigo-500 animate-pulse" /> {lang === 'id' ? 'Sistem Simulasi Wawancara AI' : 'Interview Simulator Suite'}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {lang === 'id'
            ? 'Lakukan simulasi wawancara percakapan interaktif dengan pewawancara bertenaga AI Gemini. Dapatkan penilaian atas struktur bahasa, penguasaan sistem, dan metrik.'
            : 'Engage in multi-turn dialogues with a Gemini interviewer. Get graded on vocabulary density, system reasoning, and metrics.'}
        </p>
      </div>

      {!session ? (
        // Start State Configurations
        <div className="max-w-xl mx-auto mt-12 bg-white dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{lang === 'id' ? 'Atur Skenario Wawancara' : 'Configure Interview Scenario'}</h3>
          <p className="text-2xs text-slate-500 dark:text-slate-350 leading-relaxed mt-1">
            {lang === 'id'
              ? 'Pilih kategori fokus Anda. Gemini secara dinamis akan berperan sebagai arsitek rekrutmen atau direktur produk untuk menguji Anda.'
              : 'Pick your focus category. Gemini will act as an engineering architect or lead product director dynamically matching this target.'}
          </p>

          <div className="space-y-4 mt-6">
            <div className="space-y-1.5">
              <label className="text-2xs font-mono font-bold text-slate-400">{lang === 'id' ? 'NAMA POSISI TARGET JABATAN' : 'TARGET VACANCY TITLE'}</label>
              <input
                type="text"
                value={targetJob}
                onChange={(e) => setTargetJob(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white"
              />
            </div>

            <button
              onClick={handleStartSession}
              className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold py-3 text-xs text-white rounded-xl shadow-lg shadow-indigo-500/20 active:scale-98 transition-all"
            >
              {lang === 'id' ? 'Inisialisasi Simulasi Wawancara' : 'Initialize Recruiter Board Simulation'}
            </button>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 flex gap-2 items-start text-indigo-700 dark:text-indigo-400 text-2xs leading-normal">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              <strong>{lang === 'id' ? 'Aturan Permainan:' : 'Rule matrix:'}</strong> {lang === 'id'
                ? 'Simulasi memandu Anda melalui maksimal 6 putaran pertanyaan. Pada setiap kiriman, Gemini memberikan laporan penilaian di panel samping gelembung balon percakapan.'
                : 'The simulation guides you through up to 6 rounds of questions. On each submit, Gemini provides answer grading metrics in your speech bubble side panel.'}
            </span>
          </div>
        </div>
      ) : (
        // Active Chat Simulator state
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Chat main thread column */}
          <div className="lg:col-span-8 flex flex-col h-[520px] bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
            
            {/* Header banner */}
            <div className="px-5 py-3 border-b border-slate-150 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60 shrink-0">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-905 dark:text-white uppercase tracking-wider">{session.jobTitle} Board</span>
              </div>

              <span className="text-2xs font-mono font-bold text-slate-450">
                Round {Math.floor(session.messages.filter(m => m.sender === 'candidate').length + 1)} / 6
              </span>
            </div>

            {/* Chat list block */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {session.messages.map((m, idx) => {
                const isInterviewer = m.sender === 'interviewer';
                return (
                  <div key={m.id} className={`flex ${isInterviewer ? 'justify-start' : 'justify-end'} gap-3 animate-in fade-in duration-200`}>
                    
                    {isInterviewer && (
                      <div className="h-8 w-8 rounded-full bg-indigo-600/10 text-indigo-600 flex items-center justify-center shrink-0">
                        <Cpu className="w-4 h-4" />
                      </div>
                    )}

                    <div className="max-w-[85%]">
                      <div className={`p-4 rounded-2xl text-xs leading-relaxed text-left ${
                        isInterviewer 
                          ? 'bg-slate-55 dark:bg-slate-800 text-slate-800 dark:text-white rounded-tl-none border border-slate-200 dark:border-slate-700/60'
                          : 'bg-indigo-600 text-white rounded-tr-none'
                      }`}>
                        {m.text}
                      </div>

                      {/* Score metrics print-out just underneath candidate post */}
                      {!isInterviewer && m.score !== undefined && (
                        <div className="mt-2.5 p-3 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-left text-2xs font-bold flex gap-2 items-start leading-normal">
                          <Trophy className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                          <div>
                            <span className="text-slate-800 dark:text-indigo-200 font-mono">Turn Rating: {m.score}/100</span>
                            <p className="text-slate-470 dark:text-slate-400 font-medium text-[10px] mt-0.5">{m.feedback}</p>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}

              {loading && (
                <div className="flex justify-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-indigo-600/10 text-indigo-600 flex items-center justify-center shrink-0 animate-pulse">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div className="bg-slate-55 dark:bg-slate-800 text-slate-400 p-4 rounded-2xl text-xs rounded-tl-none border border-slate-100 flex items-center gap-1.5 font-semibold">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Interviewer is reviewing your notes...
                  </div>
                </div>
              )}
            </div>

            {/* Input bar */}
            {!session.isCompleted ? (
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-150 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-900/30 flex gap-3">
                <input
                  type="text"
                  disabled={loading}
                  value={inputText}
                  placeholder="Type your strategic answer highlights..."
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={loading || !inputText.trim()}
                  className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="p-4 border-t border-slate-150 dark:border-slate-800 shrink-0 bg-slate-55 text-center text-xs font-semibold text-emerald-500 bg-emerald-500/5">
                Session evaluation complete. Review scorecard details in the sidebar panel.
              </div>
            )}

          </div>

          {/* Right sidebar scorecard panel */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="p-5 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-205 dark:border-slate-800 text-left">
              <h3 className="text-xs font-mono font-bold text-slate-450 uppercase tracking-widest">Active Sim Status</h3>
              
              {session.isCompleted ? (
                <div className="space-y-4 mt-5">
                  <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 p-3 rounded-xl font-bold text-xs">
                    <Trophy className="w-5 h-5" /> Completed Evaluation
                  </div>
                  
                  <div className="p-4 rounded-xl bg-indigo-50/55 dark:bg-indigo-950/20">
                    <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono">{session.overallScore}%</span>
                    <span className="text-[10px] text-slate-400 block font-mono font-bold mt-1.5">AVERAGE COMMUNICATION SCORE</span>
                  </div>

                  <p className="text-2xs text-slate-550 dark:text-slate-400 leading-relaxed font-semibold">
                    {session.overallFeedback}
                  </p>

                  <button
                    onClick={handleStartSession}
                    className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 py-2 rounded-lg text-xs font-bold transition-all"
                  >
                    Reset & Practice Again
                  </button>
                </div>
              ) : (
                <div className="mt-4 space-y-3.5">
                  <p className="text-2xs text-slate-500 dark:text-slate-400 leading-normal">
                    Give comprehensive answers to recruiter prompts. After submission, Gemini grades each individual reply and records progress tags.
                  </p>

                  <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 text-[11px] leading-normal rounded-xl flex gap-1.5 items-start">
                    <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <span>Focus on including architectural keywords (e.g. tree-shaking, caching, debounce) to boost score metrics.</span>
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to exit and discard this practice interview?')) {
                        setSession(null);
                      }
                    }}
                    className="w-full bg-rose-500/15 hover:bg-rose-500/20 text-rose-500 font-mono text-xs font-extrabold py-2 rounded-lg transition-all"
                  >
                    DISCARD & EXIT
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* Immersive AI Interview Processing Overlay Dialog */}
      <AnimatePresence>
        {loading && (
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
                    <Cpu className="w-5 h-5 text-indigo-400" />
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
                {session ? 'AI Sedang Mengevaluasi Jawaban' : 'Menyiapkan Simulasi Al'}
              </h4>
              
              <p className="mt-3 text-xs text-slate-300 leading-relaxed font-sans px-2">
                {session 
                  ? 'Asisten AI sedang menilai tanggapan profesional Anda, memetakan skor komunikasi, serta merumuskan tindak lanjut pertanyaan...' 
                  : 'Sistem sedang memuat skenario simulasi interaktif, parameter posisi, dan merancang kueri pembuka...'}
              </p>

              <p className="mt-4 text-[9px] text-slate-500 font-mono tracking-widest uppercase">
                ENGINE GEMINI • TALENTRA
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
