import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Send, MessageSquare, Briefcase, ChevronRight, Eye, MoreVertical, Coffee, Search, CheckCircle, ArrowLeft } from 'lucide-react';
import { ChatSession, User, Message } from '../types';
import { useLanguage } from '../LanguageContext';

interface ChatSystemViewProps {
  activeUser: User;
  onNavigateToTab?: (tab: string) => void;
}

export default function ChatSystemView({ activeUser, onNavigateToTab }: ChatSystemViewProps) {
  const { lang } = useLanguage();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchWord, setSearchWord] = useState('');

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Poll in-memory Express DB every 2.5 seconds to query and display HR callbacks
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await fetch('/api/chats');
        if (res.ok) {
          const data: ChatSession[] = await res.json();
          setSessions(data);

          // Get user-filtered sessions to correctly auto-select first session if idle
          const userFiltered = data.filter(s => {
            if (activeUser.role === 'admin') {
              return true;
            } else if (activeUser.role === 'recruiter') {
              return s.recruiterId === activeUser.id || s.companyName.toLowerCase() === activeUser.name.toLowerCase();
            } else {
              return s.seekerId === activeUser.id;
            }
          });

          // Auto-select first session if idle
          if (userFiltered.length > 0 && !activeSessionId) {
            setActiveSessionId(userFiltered[0].id);
          }
        }
      } catch (err) {
        console.error('Chat poller error:', err);
      }
    };

    fetchChats();
    const interval = setInterval(fetchChats, 2500);
    return () => clearInterval(interval);
  }, [activeSessionId, activeUser]);

  // Handle message sending
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeSessionId) return;

    const chosenSession = sessions.find(s => s.id === activeSessionId);
    if (!chosenSession) return;

    const userMsgContent = inputText.trim();
    setInputText('');

    // Pre-insert candidate message to keep UI snappy
    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      conversationId: activeSessionId,
      senderId: activeUser.id,
      senderName: activeUser.name,
      senderRole: activeUser.role === 'seeker' ? 'seeker' : 'recruiter',
      content: userMsgContent,
      timestamp: new Date().toISOString()
    };

    const updatedSessions = sessions.map(s => {
      if (s.id === activeSessionId) {
        return { ...s, messages: [...s.messages, tempMsg] };
      }
      return s;
    });
    setSessions(updatedSessions);

    try {
      await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: activeSessionId,
          jobTitle: chosenSession.jobTitle,
          companyName: chosenSession.companyName,
          message: tempMsg
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Scroll to bottom helper
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [sessions, activeSessionId]);

  const activeSession = sessions.find(s => s.id === activeSessionId);

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
      <div className="pb-6 border-b border-slate-205 dark:border-slate-800">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <MessageSquare className="w-7 h-7 text-indigo-500" /> Executive Messenger Hub
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review screening requests and speak directly with corporate talent partners in real-time.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 h-[550px] bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
        
        {/* Left pane: active recruiters listing */}
        <div className="lg:col-span-4 border-r border-slate-150 dark:border-slate-800 flex flex-col h-full min-h-0 bg-slate-50/50 dark:bg-slate-950/20">
          <div className="p-4 border-b border-slate-150">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
            />
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar divide-y divide-slate-100 dark:divide-slate-900">
            {(() => {
              const userFiltered = sessions.filter(s => {
                const searchMatch = searchWord === '' || 
                  s.jobTitle.toLowerCase().includes(searchWord.toLowerCase()) || 
                  s.companyName.toLowerCase().includes(searchWord.toLowerCase());

                if (!searchMatch) return false;

                if (activeUser.role === 'admin') {
                  return true;
                } else if (activeUser.role === 'recruiter') {
                  return s.recruiterId === activeUser.id || s.companyName.toLowerCase() === activeUser.name.toLowerCase();
                } else {
                  return s.seekerId === activeUser.id;
                }
              });

              return userFiltered.map(s => {
                const lastMsg = s.messages[s.messages.length - 1];
                const isActive = s.id === activeSessionId;
                
                // Dynamically resolve other party name/avatar without hardcoded ID limits
                const isSeeker = activeUser.role === 'seeker';
                const displayPartyName = isSeeker 
                  ? (s.recruiterName || s.otherPartyName || 'Sarah Connor')
                  : (s.seekerName || s.otherPartyName || 'Feri Irawan');
                const displayPartyAvatar = isSeeker
                  ? (s.recruiterAvatar || s.otherPartyAvatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80')
                  : (s.seekerAvatar || s.otherPartyAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80');

                return (
                  <div
                    key={s.id}
                    onClick={() => setActiveSessionId(s.id)}
                    className={`p-4 text-left cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-slate-150/40 dark:bg-slate-850'
                        : 'hover:bg-slate-50/40 dark:hover:bg-slate-900/40'
                    }`}
                  >
                    <div className="flex gap-3">
                      <img src={displayPartyAvatar} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline gap-2">
                          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{displayPartyName}</h4>
                          <span className="text-[9px] text-slate-400 font-mono">
                            {isSeeker ? 'HR Rep' : 'Jobseeker'}
                          </span>
                        </div>

                        <span className="text-[10px] text-indigo-500 font-bold block mt-0.5 font-mono">{s.jobTitle}</span>
                        <p className="text-[11px] text-slate-400 mt-1 truncate font-medium">
                          {lastMsg ? lastMsg.content : 'Open conversation...'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}

            {sessions.filter(s => {
              if (activeUser.role === 'admin') return true;
              if (activeUser.role === 'recruiter') return s.recruiterId === activeUser.id || s.companyName.toLowerCase() === activeUser.name.toLowerCase();
              return s.seekerId === activeUser.id;
            }).length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs italic font-medium leading-relaxed">
                No active conversations yet. Reach out or apply for positions under the Applicant tab to trigger automated screening lines.
              </div>
            )}
          </div>
        </div>

        {/* Right pane: Dialog Feed */}
        <div className="lg:col-span-8 flex flex-col h-full min-h-0 bg-white dark:bg-slate-900/30">
          {activeSession ? (
            <>
              {/* Header */}
              {(() => {
                const isSeeker = activeUser.role === 'seeker';
                const displayActivePartyName = isSeeker 
                  ? (activeSession.recruiterName || activeSession.otherPartyName || 'Sarah Connor')
                  : (activeSession.seekerName || activeSession.otherPartyName || 'Feri Irawan');
                const displayActivePartyAvatar = isSeeker
                  ? (activeSession.recruiterAvatar || activeSession.otherPartyAvatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80')
                  : (activeSession.seekerAvatar || activeSession.otherPartyAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80');

                return (
                  <div className="px-5 py-3 border-b border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={displayActivePartyAvatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                      <div className="text-left">
                        <div className="flex items-center gap-1">
                          <h4 className="text-xs font-black text-slate-905 dark:text-white leading-none">{displayActivePartyName}</h4>
                          <CheckCircle className="w-3.5 h-3.5 text-indigo-500" />
                        </div>
                        <span className="text-[10px] text-slate-450 font-mono uppercase mt-0.5">
                          {isSeeker ? `${activeSession.companyName} recruiter` : 'Verified Jobseeker Profile'}
                        </span>
                      </div>
                    </div>

                    <span className="text-2xs font-mono font-bold text-slate-400 bg-slate-150/40 px-2 py-0.5 rounded">
                      {activeSession.jobTitle} Pipeline
                    </span>
                  </div>
                );
              })()}

              {/* Message dialogue bubble lists */}
              <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-5 space-y-4">
                {activeSession.messages.map((m) => {
                  const isUser = m.senderId === activeUser.id;
                  return (
                    <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2.5 animate-in fade-in duration-150`}>
                      <div className="max-w-[75%]">
                        <div className={`p-3.5 rounded-2xl text-xs leading-relaxed text-left ${
                          isUser 
                            ? 'bg-indigo-650 bg-indigo-600 text-white rounded-tr-none'
                            : 'bg-slate-55 dark:bg-slate-800 text-slate-850 dark:text-white rounded-tl-none border border-slate-200 dark:border-slate-700/60'
                        }`}>
                          {m.content}
                        </div>
                        <span className="text-[9px] text-slate-400 mt-1 block font-mono">
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Footer text composition bar */}
              <form onSubmit={handleSend} className="p-4 border-t border-slate-150 dark:border-slate-800 bg-slate-55/60 dark:bg-slate-900 flex gap-3">
                <input
                  type="text"
                  value={inputText}
                  placeholder="Enter message text..."
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-850 dark:text-white focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400">
              <MessageSquare className="w-10 h-10 text-slate-350 dark:text-slate-700 animate-pulse" />
              <p className="text-xs font-semibold mt-3">Select a hiring conversation thread on the left to start messaging.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
