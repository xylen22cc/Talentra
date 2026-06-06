import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { db } from './db';

let supabaseInstance: SupabaseClient | null = null;

/**
 * Verifies if all Supabase cluster configuration criteria are satisfied.
 */
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.SUPABASE_URL &&
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)
  );
}

/**
 * Lazy loads the Supabase client safely without module loading failures
 * if environment keys are missing.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabaseInstance) {
    const url = process.env.SUPABASE_URL as string;
    const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY) as string;
    
    console.log(`[Supabase] Lazy-initializing connection to ${url}`);
    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }

  return supabaseInstance;
}

/**
 * Verifies live connectivity with Supabase by performing a simple query.
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase is not configured. Declare SUPABASE_URL and key in Secrets panel.'
    };
  }

  try {
    // Quick test query on any table or system version
    const { data, error } = await client.from('users').select('count', { count: 'exact', head: true });
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('relation "public.users" does not exist')) {
        return {
          success: true,
          message: 'Connected successfully to cluster, but schema tables do not exist yet. Please execute the SQL initialization script.'
        };
      }
      throw error;
    }

    return {
      success: true,
      message: 'Successfully connected and tables are verified.'
    };
  } catch (err: any) {
    console.error('[Supabase] Connection test failed:', err);
    return {
      success: false,
      message: err.message || 'System error while trying to connect to Postgres instance.'
    };
  }
}

/**
 * Transmits preloaded local db.json mock seed records up to Supabase tables.
 */
export async function seedSupabaseDb(): Promise<{ success: boolean; inserted: Record<string, number>; errors: string[] }> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client is not available or configured.');
  }

  const errors: string[] = [];
  const inserted: Record<string, number> = {
    users: 0,
    companies: 0,
    jobs: 0,
    profiles: 0,
    applications: 0,
    announcements: 0
  };

  try {
    // 1. Seed Users
    const users = db.getUsers();
    if (users.length > 0) {
      const formatted = users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        company_id: u.companyId || null,
        avatar: u.avatar,
        password: u.password || null
      }));
      const { error } = await client.from('users').upsert(formatted);
      if (error) errors.push(`Users: ${error.message}`);
      else inserted.users = formatted.length;
    }

    // 2. Seed Companies
    const companies = db.getCompanies();
    if (companies.length > 0) {
      const formatted = companies.map(c => ({
        id: c.id,
        name: c.name,
        logo: c.logo,
        description: c.description || null,
        industry: c.industry || null,
        location: c.location || null,
        website: c.website || null,
        is_verified: c.isVerified
      }));
      const { error } = await client.from('companies').upsert(formatted);
      if (error) errors.push(`Companies: ${error.message}`);
      else inserted.companies = formatted.length;
    }

    // 3. Seed Jobs
    const jobs = db.getJobs();
    if (jobs.length > 0) {
      const formatted = jobs.map(j => ({
        id: j.id,
        title: j.title,
        company_id: j.companyId,
        company_name: j.companyName,
        company_logo: j.companyLogo,
        location: j.location,
        salary_range: j.salaryRange,
        job_type: j.jobType,
        experience_level: j.experienceLevel,
        description: j.description,
        requirements: j.requirements, // text[] or jsonb in supabase
        skills_required: j.skillsRequired, // text[] or jsonb in supabase
        status: j.status,
        is_suspicious: j.isSuspicious,
        suspicious_reason: j.suspiciousReason || null,
        created_at: j.createdAt
      }));
      const { error } = await client.from('jobs').upsert(formatted);
      if (error) errors.push(`Jobs: ${error.message}`);
      else inserted.jobs = formatted.length;
    }

    // 4. Seed Profiles
    const rawProfiles = db.getProfiles();
    const profileKeys = Object.keys(rawProfiles);
    if (profileKeys.length > 0) {
      const formatted = profileKeys.map(k => {
        const p = rawProfiles[k];
        return {
          id: p.id,
          title: p.title,
          bio: p.bio,
          skills: p.skills,
          experience: p.experience, // jsonb in supabase
          education: p.education, // jsonb in supabase
          portfolio: p.portfolio, // jsonb in supabase
          cv_text: p.cvText || null
        };
      });
      const { error } = await client.from('profiles').upsert(formatted);
      if (error) errors.push(`Profiles: ${error.message}`);
      else inserted.profiles = formatted.length;
    }

    // 5. Seed Applications
    const applications = db.getApplications();
    if (applications.length > 0) {
      const formatted = applications.map(a => ({
        id: a.id,
        job_id: a.jobId,
        applicant_id: a.applicantId,
        applicant_name: a.applicantName,
        applicant_title: a.applicantTitle,
        applicant_skills: a.applicantSkills,
        cv_summary: a.cvSummary,
        status: a.status,
        applied_at: a.appliedAt,
        anonymous_mode: a.anonymousMode,
        match_percent: a.matchPercent
      }));
      const { error } = await client.from('applications').upsert(formatted);
      if (error) errors.push(`Applications: ${error.message}`);
      else inserted.applications = formatted.length;
    }

    // 6. Seed Announcements
    const announcements = db.getAnnouncements();
    if (announcements.length > 0) {
      const formatted = announcements.map(an => ({
        id: an.id,
        company_id: an.companyId,
        company_name: an.companyName,
        title: an.title,
        content: an.content,
        category: an.category,
        created_at: an.createdAt
      }));
      const { error } = await client.from('announcements').upsert(formatted);
      if (error) errors.push(`Announcements: ${error.message}`);
      else inserted.announcements = formatted.length;
    }

    return {
      success: errors.length === 0,
      inserted,
      errors
    };
  } catch (error: any) {
    console.error('[Supabase] Database seeding failed:', error);
    return {
      success: false,
      inserted,
      errors: [error.message || 'System error seeding records.']
    };
  }
}

/**
 * Returns SQL source code script to easily create the corresponding public relational
 * database schema in Supabase's standard Web console SQL Editor.
 */
export function getSQLSchemaDefinition(): string {
  return `-- ==========================================
-- TALENTA AIR - SUPABASE POSTGRES SCHEMA
-- Copy & Run this code block inside Supabase > SQL Editor
-- ==========================================

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('seeker', 'recruiter', 'admin')),
  company_id TEXT,
  avatar TEXT,
  password TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Companies Table
CREATE TABLE IF NOT EXISTS public.companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo TEXT,
  description TEXT,
  industry TEXT,
  location TEXT,
  website TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Jobs Listing Table
CREATE TABLE IF NOT EXISTS public.jobs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_logo TEXT,
  location TEXT NOT NULL,
  salary_range TEXT,
  job_type TEXT,
  experience_level TEXT,
  description TEXT,
  requirements JSONB DEFAULT '[]'::jsonb,
  skills_required JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved')),
  is_suspicious BOOLEAN DEFAULT FALSE,
  suspicious_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Job Seeker Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT,
  bio TEXT,
  skills JSONB DEFAULT '[]'::jsonb,
  experience JSONB DEFAULT '[]'::jsonb,
  education JSONB DEFAULT '[]'::jsonb,
  portfolio JSONB DEFAULT '[]'::jsonb,
  cv_text TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Applications Table
CREATE TABLE IF NOT EXISTS public.applications (
  id TEXT PRIMARY KEY,
  job_id TEXT REFERENCES public.jobs(id) ON DELETE CASCADE,
  applicant_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  applicant_name TEXT NOT NULL,
  applicant_title TEXT,
  applicant_skills JSONB DEFAULT '[]'::jsonb,
  cv_summary TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  anonymous_mode BOOLEAN DEFAULT FALSE,
  match_percent INT DEFAULT 50
);

-- 6. Create Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
  id TEXT PRIMARY KEY,
  company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Enable unrestricted access for sandbox testing
-- Run these if you want to bypass RLS policies temporarily for quick testing:
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.users FOR UPDATE USING (true);

CREATE POLICY "Allow public select" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.companies FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.companies FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.companies FOR DELETE USING (true);

CREATE POLICY "Allow public select" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.jobs FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.jobs FOR DELETE USING (true);

CREATE POLICY "Allow public select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.profiles FOR UPDATE USING (true);

CREATE POLICY "Allow public select" ON public.applications FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.applications FOR UPDATE USING (true);

CREATE POLICY "Allow public select" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.announcements FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.announcements FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.announcements FOR DELETE USING (true);
`;
}
