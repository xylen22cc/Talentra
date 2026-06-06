import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Search, MapPin, Briefcase, Sparkles, ShieldCheck, MessageSquare, ArrowRight, TrendingUp, Cpu, Bookmark } from 'lucide-react';
import { Job, Company } from '../types';
import gsap from 'gsap';
import { useLanguage } from '../LanguageContext';

interface LandingPageProps {
  jobs: Job[];
  companies: Company[];
  onNavigateToDashboard: (query?: string, location?: string, type?: string) => void;
  onSelectJob: (job: Job) => void;
}

export default function LandingPage({ jobs, companies, onNavigateToDashboard, onSelectJob }: LandingPageProps) {
  const { t, lang } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showLocationSuggs, setShowLocationSuggs] = useState(false);
  const [visibleJobsCount, setVisibleJobsCount] = useState(4);
  const containerRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const [isLoaderIntersecting, setIsLoaderIntersecting] = useState(false);

  // Extract unique locations from active approved jobs list
  const availableLocations = Array.from(
    new Set(
      jobs
        .filter(j => j.status === 'approved')
        .map(j => j.location)
        .filter(Boolean)
    )
  );

  const filteredLocationSuggestions = locationQuery.trim() === ''
    ? availableLocations
    : availableLocations.filter(loc =>
        loc.toLowerCase().includes(locationQuery.toLowerCase())
      );

  const handleSelectLocation = (loc: string) => {
    setLocationQuery(loc);
    setShowLocationSuggs(false);
    
    // Smooth scroll directly to job listings below to let users see results
    setTimeout(() => {
      const section = document.getElementById('job-listings-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 120);
  };

  useEffect(() => {
    // Elegant stagger entrance using GSAP timeline
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      
      tl.fromTo('.gsap-badge', 
        { opacity: 0, scale: 0.9, y: 15 }, 
        { opacity: 1, scale: 1, y: 0, duration: 0.8 }
      )
      .fromTo('.gsap-title', 
        { opacity: 0, y: 25 }, 
        { opacity: 1, y: 0, duration: 1 }, 
        '-=0.6'
      )
      .fromTo('.gsap-desc', 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 0.8 }, 
        '-=0.65'
      )
      .fromTo('.gsap-cta', 
        { opacity: 0, y: 15 }, 
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }, 
        '-=0.6'
      )
      .fromTo('.gsap-search', 
        { opacity: 0, y: 30, scale: 0.98 }, 
        { opacity: 1, y: 0, scale: 1, duration: 0.9 }, 
        '-=0.5'
      )
      .fromTo('.gsap-bento-card', 
        { opacity: 0, y: 30, scale: 0.96 }, 
        { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.15 }, 
        '-=0.4'
      )
      .fromTo('.gsap-section-header', 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 0.7 }, 
        '-=0.5'
      )
      .fromTo('.gsap-job-card', 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }, 
        '-=0.3'
      );

      // Super responsive custom GSAP hover interactions for interactive cards
      const elementsToHover = document.querySelectorAll('.gsap-hover-target');
      elementsToHover.forEach((el) => {
        el.addEventListener('mouseenter', () => {
          gsap.to(el, { 
            scale: 1.02, 
            y: -6, 
            borderColor: '#6366f1',
            boxShadow: '0 20px 25px -5px rgb(99 102 241 / 0.08), 0 8px 10px -6px rgb(99 102 241 / 0.08)',
            duration: 0.35, 
            ease: 'power2.out' 
          });
        });
        el.addEventListener('mouseleave', () => {
          gsap.to(el, { 
            scale: 1, 
            y: 0, 
            borderColor: '',
            boxShadow: 'none',
            duration: 0.4, 
            ease: 'power2.out' 
          });
        });
      });
    }, containerRef);

    return () => ctx.revert(); // clean up context with GSAP for safe component re-renders
  }, [jobs]);

  // Generate unique recommended job titles matching searchQuery (acts as a dynamic selection list)
  const recommendations = Array.from(new Set(
    jobs
      .filter(j => j.status === 'approved')
      .filter(j => {
        if (searchQuery.trim() === '') return true; // Acts as interactive dropdown selection
        return (
          j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          j.skillsRequired.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
          j.companyName.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
      .map(j => j.title)
  )).slice(0, 5);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setShowSuggestions(false);
    setShowLocationSuggs(false);
    
    // Smooth scroll down to listings to see results immediately
    setTimeout(() => {
      const section = document.getElementById('job-listings-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 120);
  };

  // Filter approved jobs for featured section
  const approvedJobs = jobs.filter(j => j.status === 'approved');

  const filteredJobs = approvedJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          job.skillsRequired.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          job.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = job.location.toLowerCase().includes(locationQuery.toLowerCase());
    const matchesType = selectedType === 'All' || job.jobType === selectedType;
    return matchesSearch && matchesLocation && matchesType;
  });

  // Reset lazy load counter when filters change so search is responsive
  useEffect(() => {
    setVisibleJobsCount(4);
  }, [searchQuery, locationQuery, selectedType]);

  // Lazy loading IntersectionObserver logic
  useEffect(() => {
    const sentinel = loaderRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      setIsLoaderIntersecting(entry.isIntersecting);
    }, {
      rootMargin: '100px', // Pre-fetch slightly before scroll reaches bottom
    });

    observer.observe(sentinel);
    return () => {
      observer.unobserve(sentinel);
    };
  }, [loaderRef, filteredJobs.length]);

  useEffect(() => {
    if (isLoaderIntersecting && visibleJobsCount < filteredJobs.length) {
      const timer = setTimeout(() => {
        setVisibleJobsCount(prev => Math.min(prev + 4, filteredJobs.length));
      }, 500); // smooth 500ms delay to display micro-loader
      return () => clearTimeout(timer);
    }
  }, [isLoaderIntersecting, filteredJobs.length, visibleJobsCount]);

  const featuredCompanies = companies.filter(c => c.isVerified);

  return (
    <div ref={containerRef} className="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="absolute top-0 left-1/2 w-[700px] h-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/5 blur-[120px] dark:bg-indigo-550/10 pointer-events-none" />
        <div className="absolute top-40 right-10 w-[300px] h-[300px] rounded-full bg-violet-600/5 blur-[90px] pointer-events-none" />
        
        <div className="max-w-full mx-auto px-4 sm:px-8 md:px-12 text-center relative z-10">
          <div
            className="gsap-badge inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-6 border border-indigo-100/50 dark:border-indigo-900/30"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
            {t('landing.badge')}
          </div>

          <h1
            className="gsap-title text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white"
          >
            {t('landing.title')}<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 dark:from-indigo-400 dark:via-violet-400 dark:to-cyan-400">
              {t('landing.subtitle')}
            </span>
          </h1>

          <p
            className="gsap-desc mt-6 max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-400 font-medium"
          >
            {t('landing.description')}
          </p>

          <div
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => onNavigateToDashboard()}
              className="gsap-cta w-full sm:w-auto px-8 py-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              {t('landing.launchBtn')} <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                onNavigateToDashboard();
              }}
              className="gsap-cta w-full sm:w-auto px-8 py-4 text-sm font-semibold text-slate-705 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl active:scale-98 transition-all"
            >
              {t('landing.recruiterBtn')}
            </button>
          </div>
        </div>
      </section>

      {/* 2. Instant Search Bar Desk */}
      <section className="gsap-search relative z-20 -mt-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <form onSubmit={handleSearchSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 shadow-xl shadow-slate-100/40 dark:shadow-none">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* Search input with recommendations dropdown */}
              <div className="md:col-span-4 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  placeholder={t('landing.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 text-sm rounded-xl border border-slate-200/80 dark:border-slate-800/80 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />

                {/* Suggestions Dropdown */}
                {showSuggestions && recommendations.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 rounded-xl shadow-2xl z-50 overflow-hidden py-1 max-h-60 overflow-y-auto">
                    <p className="px-3 py-1.5 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" /> {t('landing.recomTitle')}
                    </p>
                    {recommendations.map((title) => (
                      <button
                        key={title}
                        type="button"
                        onMouseDown={() => {
                          setSearchQuery(title);
                          setShowSuggestions(false);
                          
                          // Smooth scroll directly to job listings below to let users see results
                          setTimeout(() => {
                            const section = document.getElementById('job-listings-section');
                            if (section) {
                              section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }, 120);
                        }}
                        className="w-full text-left px-3 py-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-xs font-semibold text-slate-705 dark:text-slate-200 flex items-center gap-2 border-b border-slate-50 dark:border-slate-800 last:border-0 transition-colors"
                      >
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Location input */}
              <div className="md:col-span-3 relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  placeholder={t('landing.locationPlaceholder')}
                  value={locationQuery}
                  onChange={(e) => {
                    setLocationQuery(e.target.value);
                    setShowLocationSuggs(true);
                  }}
                  onFocus={() => setShowLocationSuggs(true)}
                  onBlur={() => setTimeout(() => setShowLocationSuggs(false), 200)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 text-sm rounded-xl border border-slate-200/80 dark:border-slate-800/80 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />

                {/* Location Suggestions Dropdown Select */}
                {showLocationSuggs && filteredLocationSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 rounded-xl shadow-2xl z-50 overflow-hidden py-1 max-h-60 overflow-y-auto">
                    <p className="px-3 py-1.5 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-505 animate-pulse" /> {lang === 'id' ? 'Pilih Lokasi Tersedia' : 'Select Available Location'}
                    </p>
                    {filteredLocationSuggestions.map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onMouseDown={() => {
                          handleSelectLocation(loc);
                        }}
                        className="w-full text-left px-3 py-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 border-b border-slate-50 dark:border-slate-800 last:border-0 transition-colors cursor-pointer"
                      >
                        <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="truncate">{loc}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Job Type dropdown */}
              <div className="md:col-span-3">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 text-sm rounded-xl border border-slate-200/80 dark:border-slate-800/80 text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="All">{t('landing.allTypes')}</option>
                  <option value="Full-time">{t('landing.fullTime')}</option>
                  <option value="Part-time">{t('landing.partTime')}</option>
                  <option value="Contract">{t('landing.contract')}</option>
                  <option value="Remote">{t('landing.remote')}</option>
                  <option value="Internship">{t('landing.internship')}</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-650/10 hover:shadow-indigo-605/20 active:scale-98 transition-all whitespace-nowrap cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" /> {t('landing.searchBtn')}
                </button>
              </div>
            </div>

            {/* Quick tag stats */}
            <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs text-slate-505 dark:text-slate-400">
              <span className="font-semibold">{t('landing.trending')}</span>
              {['TypeScript', 'React 19', 'Framer Motion', 'Product Manager'].map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setSearchQuery(tag);
                    
                    // Smooth scroll down to listings to see results immediately
                    setTimeout(() => {
                      const section = document.getElementById('job-listings-section');
                      if (section) {
                        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }, 120);
                  }}
                  className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </form>
        </div>
      </section>

      {/* 3. Core Features Showcase (Bento Grid Style) */}
      <section className="py-20">
        <div className="max-w-full mx-auto px-4 sm:px-8 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              {t('landing.diffTitle')}
            </h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-3 font-medium">
              {t('landing.diffDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Box 1: CV Analyzer */}
            <div className="gsap-bento-card gsap-hover-target bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 transition-all group cursor-pointer">
              <div className="h-12 w-12 rounded-xl bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('landing.diff1Title')}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mt-2.5">
                {t('landing.diff1Desc')}
              </p>
            </div>

            {/* Box 2: Safety Guard */}
            <div className="gsap-bento-card gsap-hover-target bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 transition-all group cursor-pointer">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('landing.diff2Title')}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mt-2.5">
                {t('landing.diff2Desc')}
              </p>
            </div>

            {/* Box 3: Simulator */}
            <div className="gsap-bento-card gsap-hover-target bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 transition-all group cursor-pointer">
              <div className="h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('landing.diff3Title')}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mt-2.5">
                {t('landing.diff3Desc')}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Active Job Listings */}
      <section id="job-listings-section" className="py-12 border-t border-slate-200 dark:border-slate-900">
        <div className="max-w-full mx-auto px-4 sm:px-8 md:px-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
            <div className="gsap-section-header text-left">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {t('landing.recomOpp')}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                {t('landing.showingJobs').replace('{count}', String(filteredJobs.length))}
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0 flex gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mr-2 self-center">{t('landing.quickFilters')}</span>
              {['All', 'Remote', 'Full-time', 'Hybrid'].map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type === 'Hybrid' ? 'Full-time' : type)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    selectedType === type || (type === 'Hybrid' && selectedType === 'Full-time') // simple UI toggle
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/45'
                  }`}
                >
                  {type === 'All' ? t('all') : type === 'Remote' ? t('landing.remote') : type === 'Full-time' ? t('landing.fullTime') : type}
                </button>
              ))}
            </div>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="bg-white dark:bg-slate-900/60 p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800">
              <Briefcase className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 font-medium">
                {t('landing.noJobs')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredJobs.slice(0, visibleJobsCount).map((job) => (
                <div
                  key={job.id}
                  id={`job-card-${job.id}`}
                  className="gsap-job-card gsap-hover-target bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 hover:border-indigo-400 dark:hover:border-indigo-805 transition-all text-left flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Company brand */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={job.companyLogo}
                          alt={job.companyName}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-xl object-cover bg-slate-100"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                            {job.companyName}
                          </h4>
                          <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" /> {job.location}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-1 items-end">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 uppercase">
                          {job.jobType === 'Full-time' ? t('landing.fullTime') : job.jobType === 'Part-time' ? t('landing.partTime') : job.jobType === 'Contract' ? t('landing.contract') : job.jobType === 'Remote' ? t('landing.remote') : job.jobType === 'Internship' ? t('landing.internship') : job.jobType}
                        </span>
                        {job.isSponsored && (
                          <span className="flex items-center gap-0.5 text-[9px] font-mono font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.2 rounded">
                            <Cpu className="w-2.5 h-2.5" /> {t('boosted')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Job Title */}
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-4 line-clamp-1 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer" onClick={() => onSelectJob(job)}>
                      {job.title}
                    </h3>

                    {/* Requirements summary text */}
                    <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 mt-2 leading-relaxed">
                      {job.description}
                    </p>

                    {/* Skill tags list */}
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {job.skillsRequired.slice(0, 4).map(skill => (
                        <span key={skill} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer apply trigger */}
                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-5">
                    <span className="text-xs font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                      {job.salaryRange}
                    </span>
                    
                    <button
                      onClick={() => onSelectJob(job)}
                      className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg active:scale-95 transition-all text-center"
                    >
                      {t('viewDetails')}
                    </button>
                  </div>
                </div>
              ))}

              {/* Infinite Scroll / Lazy Loading Sentinel */}
              {filteredJobs.length > visibleJobsCount && (
                <div ref={loaderRef} className="col-span-1 md:col-span-2 py-10 flex flex-col items-center justify-center gap-3">
                  <div className="w-9 h-9 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-indigo-600 animate-spin" />
                  <p className="text-xs font-extrabold text-indigo-500 sm:text-slate-400 tracking-wider">
                    {lang === 'id' ? 'Memuat lebih banyak lowongan...' : 'Loading more job listings...'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 5. Verified Corporate Partners */}
      <section className="py-12 bg-slate-100/50 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-900/60">
        <div className="max-w-full mx-auto px-4 sm:px-8 md:px-12">
          <p className="text-[10px] font-mono font-extrabold tracking-widest text-slate-400 text-center uppercase">
            {t('landing.partnerTitle')}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-10">
            {featuredCompanies.map(c => (
              <div key={c.id} className="flex items-center gap-2 filter grayscale opacity-60 dark:opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
                <img src={c.logo} alt={c.name} className="w-6 h-6 rounded-md object-cover bg-slate-200" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-350">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
