import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { analyzeCV, screenJobFraud, generateInterviewResponse, translateAnnouncement, parseCVFile, evaluateGeneralCV } from './server/gemini';
import { GoogleGenAI } from '@google/genai';
import { Job } from './src/types';
import { 
  isSupabaseConfigured, 
  getSupabaseClient, 
  testSupabaseConnection, 
  seedSupabaseDb, 
  getSQLSchemaDefinition 
} from './server/supabase';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// API Endpoints Base

// --- Supabase Control APIs ---
app.get('/api/supabase/status', async (req, res) => {
  const configured = isSupabaseConfigured();
  if (!configured) {
    return res.json({
      configured: false,
      connected: false,
      message: 'Supabase URL/Key credentials are not set. Configure these in the AI Studio Settings / Secrets panel to connect to your Supabase instance.',
      url: process.env.SUPABASE_URL || null
    });
  }

  const result = await testSupabaseConnection();
  res.json({
    configured: true,
    connected: result.success,
    message: result.message,
    url: process.env.SUPABASE_URL
  });
});

app.get('/api/supabase/schema', (req, res) => {
  res.json({
    schema: getSQLSchemaDefinition()
  });
});

app.post('/api/supabase/seed', async (req, res) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.status(400).json({ error: 'Supabase credentials are not configured.' });
    }
    const seedResult = await seedSupabaseDb();
    res.json(seedResult);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error occurred during migration seeding.' });
  }
});


// 1. Authenticated User simulated context
app.get('/api/users', async (req, res) => {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('users').select('*');
      if (!error && data) {
        return res.json(data.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          companyId: u.company_id,
          avatar: u.avatar,
          password: u.password
        })));
      }
    } catch (e) {
      console.warn('[Supabase] Failed to fetch users, falling back to db.json:', e);
    }
  }
  res.json(db.getUsers());
});

// 2. Profile Management
app.get('/api/profile/:userId', async (req, res) => {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', req.params.userId).maybeSingle();
      if (!error && data) {
        return res.json({
          id: data.id,
          title: data.title,
          bio: data.bio,
          skills: data.skills || [],
          experience: data.experience || [],
          education: data.education || [],
          portfolio: data.portfolio || [],
          cvText: data.cv_text
        });
      }
    } catch (e) {
      console.warn('[Supabase] Failed to fetch profile, falling back:', e);
    }
  }
  const profiles = db.getProfiles();
  const profile = profiles[req.params.userId];
  if (profile) {
    res.json(profile);
  } else {
    res.status(404).json({ error: 'Profile not found' });
  }
});

app.post('/api/profile/:userId', async (req, res) => {
  const body = req.body;
  db.updateProfile(req.params.userId, body);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('profiles').upsert({
        id: req.params.userId,
        title: body.title,
        bio: body.bio,
        skills: body.skills || [],
        experience: body.experience || [],
        education: body.education || [],
        portfolio: body.portfolio || [],
        cv_text: body.cvText
      });
    } catch (e) {
      console.warn('[Supabase] Failed to write profile:', e);
    }
  }

  res.json({ success: true, profile: db.getProfiles()[req.params.userId] });
});

// 3. Company directories
app.get('/api/companies', async (req, res) => {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('companies').select('*');
      if (!error && data) {
        return res.json(data.map(c => ({
          id: c.id,
          name: c.name,
          logo: c.logo,
          description: c.description,
          industry: c.industry,
          location: c.location,
          website: c.website,
          isVerified: c.is_verified
        })));
      }
    } catch (e) {
      console.warn('[Supabase] Failed to fetch companies:', e);
    }
  }
  res.json(db.getCompanies());
});

app.post('/api/companies', async (req, res) => {
  const newCompany = {
    id: `co-${Date.now()}`,
    name: req.body.name,
    logo: req.body.logo || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=100&auto=format&fit=crop&q=60',
    description: req.body.description || '',
    industry: req.body.industry || 'Tech',
    location: req.body.location || 'Remote',
    website: req.body.website || '',
    isVerified: false // Needs Admin authorization
  };
  db.addCompany(newCompany);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('companies').insert({
        id: newCompany.id,
        name: newCompany.name,
        logo: newCompany.logo,
        description: newCompany.description,
        industry: newCompany.industry,
        location: newCompany.location,
        website: newCompany.website,
        is_verified: newCompany.isVerified
      });
    } catch (e) {
      console.warn('[Supabase] Failed to insert company:', e);
    }
  }

  res.status(201).json(newCompany);
});

app.post('/api/companies/verify', async (req, res) => {
  const { id, isVerified } = req.body;
  db.verifyCompany(id, isVerified);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('companies').update({ is_verified: isVerified }).eq('id', id);
    } catch (e) {
      console.warn('[Supabase] Failed to update company verification status:', e);
    }
  }

  res.json({ success: true });
});

// 4. Job Listings
app.get('/api/jobs', async (req, res) => {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('jobs').select('*');
      if (!error && data) {
        return res.json(data.map(j => ({
          id: j.id,
          title: j.title,
          companyId: j.company_id,
          companyName: j.company_name,
          companyLogo: j.company_logo,
          location: j.location,
          salaryRange: j.salary_range,
          jobType: j.job_type,
          experienceLevel: j.experience_level,
          description: j.description,
          requirements: j.requirements || [],
          skillsRequired: j.skills_required || [],
          status: j.status,
          isSuspicious: j.is_suspicious,
          suspiciousReason: j.suspicious_reason,
          createdAt: j.created_at
        })));
      }
    } catch (e) {
      console.warn('[Supabase] Failed to fetch jobs, falling back:', e);
    }
  }
  res.json(db.getJobs());
});

app.post('/api/jobs', async (req, res) => {
  try {
    const { title, companyId, companyName, location, salaryRange, jobType, experienceLevel, description, requirements, skillsRequired } = req.body;
    
    // Automatically screen the job for fraud using Gemini API!
    const company = db.getCompanies().find(c => c.id === companyId);
    const companyDesc = company ? company.description : '';
    
    console.log(`Scanning live job posting for potential scams: ${title}`);
    const fraudScanResult = await screenJobFraud(title, companyDesc, description, salaryRange);
    console.log('Job fraud scan computed result:', fraudScanResult);

    const companyLogo = company?.logo || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=100&auto=format&fit=crop&q=60';

    const newJob: Job = {
      id: `job-${Date.now()}`,
      title,
      companyId,
      companyName,
      companyLogo,
      location,
      salaryRange,
      jobType,
      experienceLevel,
      description,
      requirements: requirements || [],
      skillsRequired: skillsRequired || [],
      status: (fraudScanResult.isSuspicious ? 'pending' : 'approved') as 'pending' | 'approved', // Pending moderation if scam flagged
      isSuspicious: fraudScanResult.isSuspicious,
      suspiciousReason: fraudScanResult.reason,
      createdAt: new Date().toISOString()
    };

    db.addJob(newJob);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('jobs').insert({
          id: newJob.id,
          title: newJob.title,
          company_id: newJob.companyId,
          company_name: newJob.companyName,
          company_logo: newJob.companyLogo,
          location: newJob.location,
          salary_range: newJob.salaryRange,
          job_type: newJob.jobType,
          experience_level: newJob.experienceLevel,
          description: newJob.description,
          requirements: newJob.requirements,
          skills_required: newJob.skillsRequired,
          status: newJob.status,
          is_suspicious: newJob.isSuspicious,
          suspicious_reason: newJob.suspiciousReason,
          created_at: newJob.createdAt
        });
      } catch (e) {
        console.warn('[Supabase] Failed to insert job:', e);
      }
    }

    res.status(201).json(newJob);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/jobs/moderation', async (req, res) => {
  const { id, status } = req.body;
  db.updateJob(id, { status });

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('jobs').update({ status }).eq('id', id);
    } catch (e) {
      console.warn('[Supabase] Failed to update job moderation status:', e);
    }
  }

  res.json({ success: true });
});

// 5. Applications Board
app.get('/api/applications', async (req, res) => {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('applications').select('*');
      if (!error && data) {
        return res.json(data.map(a => ({
          id: a.id,
          jobId: a.job_id,
          applicantId: a.applicant_id,
          applicantName: a.applicant_name,
          applicantTitle: a.applicant_title,
          applicantSkills: a.applicant_skills || [],
          cvSummary: a.cv_summary,
          status: a.status,
          appliedAt: a.applied_at,
          anonymousMode: a.anonymous_mode,
          matchPercent: a.match_percent
        })));
      }
    } catch (e) {
      console.warn('[Supabase] Failed to fetch applications, falling back:', e);
    }
  }
  res.json(db.getApplications());
});

app.post('/api/applications', async (req, res) => {
  try {
    const { jobId, applicantId, anonymousMode } = req.body;
    const jobs = db.getJobs();
    const job = jobs.find(j => j.id === jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    let seekerProfile = db.getProfiles()[applicantId];
    
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data } = await supabase.from('profiles').select('*').eq('id', applicantId).maybeSingle();
        if (data) {
          seekerProfile = {
            id: data.id,
            title: data.title,
            bio: data.bio,
            skills: data.skills || [],
            experience: data.experience || [],
            education: data.education || [],
            portfolio: data.portfolio || [],
            cvText: data.cv_text
          };
        }
      } catch (e) {
        console.warn('[Supabase] Failed to fetch profile for application:', e);
      }
    }

    if (!seekerProfile) return res.status(404).json({ error: 'Job seeker profile not found' });

    const users = db.getUsers();
    const user = users.find(u => u.id === applicantId);
    
    // Auto matching calculations via Gemini
    console.log(`Calculating CV alignment matching details for applicant %s`, user?.name);
    let matchReport = { score: 50, feedback: 'Base check.' };
    try {
      matchReport = await analyzeCV(seekerProfile.cvText || seekerProfile.bio, job.title, job.requirements);
    } catch (e) {
      console.warn('Skipped full Gemini match calculation, fallback standard profile matcher.', e);
    }

    const newApp = {
      id: `app-${Date.now()}`,
      jobId,
      applicantId,
      applicantName: anonymousMode ? 'Anonymous Job Seeker' : (user?.name || 'Applicant'),
      applicantTitle: seekerProfile.title,
      applicantSkills: seekerProfile.skills,
      cvSummary: matchReport.feedback,
      status: 'pending' as const,
      appliedAt: new Date().toISOString(),
      anonymousMode: !!anonymousMode,
      matchPercent: matchReport.score || 50
    };

    db.addApplication(newApp);

    if (supabase) {
      try {
        await supabase.from('applications').insert({
          id: newApp.id,
          job_id: newApp.jobId,
          applicant_id: newApp.applicantId,
          applicant_name: newApp.applicantName,
          applicant_title: newApp.applicantTitle,
          applicant_skills: newApp.applicantSkills,
          cv_summary: newApp.cvSummary,
          status: newApp.status,
          applied_at: newApp.appliedAt,
          anonymous_mode: newApp.anonymousMode,
          match_percent: newApp.matchPercent
        });
      } catch (e) {
        console.warn('[Supabase] Failed to insert application:', e);
      }
    }

    res.status(201).json(newApp);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/applications/status', async (req, res) => {
  const { id, status } = req.body;
  db.updateApplicationStatus(id, status);

  if (status === 'accepted') {
    try {
      const app = db.getApplications().find(a => a.id === id);
      if (app) {
        const jobId = app.jobId;
        const job = db.getJobs().find(j => j.id === jobId);
        const companyName = job ? db.getCompanies().find(c => c.id === job.companyId)?.name || 'Finverge Labs' : 'Finverge Labs';
        
        // Find or fallback to Sarah Connor as recruiter
        const recruiter = db.getUsers().find(u => u.role === 'recruiter' && u.companyId === job?.companyId)
          || db.getUsers().find(u => u.role === 'recruiter')
          || { id: 'usr-2', name: 'Sarah Connor', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' };

        const chatId = `chat-accepted-${id}`;
        
        // Send actual chat message
        const welcomeMessageContent = `Halo ${app.applicantName}, selamat! 🎉 Lamaran Anda untuk posisi *${app.applicantTitle}* di *${companyName}* sudah kami TERIMA!\n\nKami sangat terkesan dengan profil dan kualifikasi Anda. Kami ingin mengundang Anda untuk berdiskusi lebih lanjut mengenai langkah dan koordinasi wawancara berikutnya. Silakan balas pesan ini agar kita bisa mengobrol lebih lanjut dengan tim HRD ya!`;
        
        db.addChatWebMessage(chatId, app.applicantTitle, companyName, {
          id: `msg-welcome-${Date.now()}`,
          conversationId: chatId,
          senderId: recruiter.id,
          senderName: `${recruiter.name} (HRD ${companyName})`,
          senderRole: 'recruiter',
          content: welcomeMessageContent,
          timestamp: new Date().toISOString()
        });
      }
    } catch (chatError) {
      console.warn('Failed to send automated direct chat for accepted application:', chatError);
    }
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('applications').update({ status }).eq('id', id);
    } catch (e) {
      console.warn('[Supabase] Failed to update application status:', e);
    }
  }

  res.json({ success: true, application: db.getApplications().find(a => a.id === id) });
});

// 6. Gemini Core Custom APIs

// Immediate CV Review Scorecard Analyzer
app.post('/api/ai/cv-analyze', async (req, res) => {
  try {
    const { cvText, jobTitle, requirements } = req.body;
    if (!cvText) {
      return res.status(400).json({ error: 'No CV resume data provided' });
    }
    console.log('Parsing user CV submission for:', jobTitle);
    const results = await analyzeCV(cvText, jobTitle || 'Software Engineer', requirements || ['React', 'TypeScript']);
    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Multi-turn Mock Interview Simulator Session
app.post('/api/ai/interview', async (req, res) => {
  try {
    const { history, jobTitle } = req.body;
    if (!history || !Array.isArray(history)) {
      return res.status(400).json({ error: 'Missing interview messages history list' });
    }
    console.log('Simulating round candidate response for:', jobTitle);
    const response = await generateInterviewResponse(history, jobTitle || 'Frontend Developer');
    res.json(response);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Real-time AI Translation Endpoint
app.post('/api/ai/translate', async (req, res) => {
  try {
    const { title, content, targetLang } = req.body;
    if (!title || !content || !targetLang) {
      return res.status(400).json({ error: 'Missing title, content, or targetLang parameters.' });
    }
    console.log(`Translating announcement to [${targetLang}]: "${title.substring(0, 30)}..."`);
    const translationResult = await translateAnnouncement(title, content, targetLang);
    res.json(translationResult);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error executing AI translation.' });
  }
});

// Multimodal CV File Parser Endpoint (Image/PDF)
app.post('/api/ai/parse-cv-file', async (req, res) => {
  try {
    const { dataUrl, filename } = req.body;
    if (!dataUrl || !filename) {
      return res.status(400).json({ error: 'Missing dataUrl or filename parameters.' });
    }
    console.log(`Parsing uploaded CV document: "${filename}"`);
    const parsedResult = await parseCVFile(dataUrl, filename);
    res.json(parsedResult);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error executing AI CV parsing.' });
  }
});

// Full General CV Evaluator and Job Seeker Advisor
app.post('/api/ai/cv-evaluate-full', async (req, res) => {
  try {
    const { cvText, jobs, lang } = req.body;
    if (!cvText) {
      return res.status(400).json({ error: 'No CV resume data provided' });
    }
    console.log('Evaluating general CV with language:', lang);
    const results = await evaluateGeneralCV(cvText, jobs || [], lang || 'id');
    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error executing general CV evaluation.' });
  }
});

// 7. Interactive Message System with auto replies
app.get('/api/chats', (req, res) => {
  res.json(db.getChats());
});

app.post('/api/chats', async (req, res) => {
  const { chatId, jobTitle, companyName, message } = req.body;
  
  // Add original candidate user message
  const updatedSession = db.addChatWebMessage(chatId, jobTitle, companyName, message);

  // If candidate was sending, let the Recruiter or HR Assistant generate an intelligent automated response!
  if (message.senderRole === 'seeker') {
    setTimeout(async () => {
      const chatSession = db.getChats().find(s => s.id === chatId);
      const recruiterName = chatSession?.recruiterName || 'Sarah Connor';
      const recruiterId = chatSession?.recruiterId || 'usr-2';
      const dbCompanyName = chatSession?.companyName || companyName || 'Finverge Labs';
      const senderName = message.senderName || chatSession?.seekerName || 'Jobseeker';
      const firstName = senderName.split(' ')[0];

      let automatedPrompt = `
      You are ${recruiterName}, an expert corporate talent recruiter at ${dbCompanyName}.
      A candidate named "${senderName}" (called ${firstName}) has sent you a follow-up about the position: "${jobTitle}".
      
      What they said: "${message.content}"
      
      Formulate a brief, helpful, professional recruiter response that continues the discussion warmly and prompts next interview steps or timeline details. Keep it under 3-4 sentences. Greet them by their name: "${firstName}".
      `;
      let aiReply = `Hi ${firstName}, thanks for reaching out. We received your message and our team is happy to connect with you. I will review our pending schedule and ping you shortly about setting up our next conversation.`;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey && apiKey !== 'MOCK_KEY') {
        try {
          const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
          const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: automatedPrompt
          });
          if (response.text) {
            aiReply = response.text.trim();
          }
        } catch (e) {
          console.error('Error generating AI recruiter chat answer:', e);
        }
      }

      db.addChatWebMessage(chatId, jobTitle, dbCompanyName, {
        id: `msg-${Date.now()}`,
        conversationId: chatId,
        senderId: recruiterId,
        senderName: `${recruiterName} (${dbCompanyName} AI Rep)`,
        senderRole: 'recruiter',
        content: aiReply,
        timestamp: new Date().toISOString()
      });
    }, 1500);
  }

  res.json(updatedSession);
});


// ==========================================
// 8. ENHANCED ADMIN & RECRUITER REST APIs (CRUD & ANNOUNCEMENTS)
// ==========================================

// --- Announcements REST API ---
app.get('/api/announcements', async (req, res) => {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('announcements').select('*');
      if (!error && data) {
        return res.json(data.map(an => ({
          id: an.id,
          companyId: an.company_id,
          companyName: an.company_name,
          title: an.title,
          content: an.content,
          category: an.category,
          createdAt: an.created_at
        })));
      }
    } catch (e) {
      console.warn('[Supabase] Failed to fetch announcements, falling back:', e);
    }
  }
  res.json(db.getAnnouncements());
});

app.post('/api/announcements', async (req, res) => {
  try {
    const { companyId, companyName, title, content, category } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Announcement title and content details are required.' });
    }
    const newAnn = {
      id: `ann-${Date.now()}`,
      companyId: companyId || 'co-2',
      companyName: companyName || 'Finverge Labs',
      title,
      content,
      category: category || 'General',
      createdAt: new Date().toISOString()
    };
    db.addAnnouncement(newAnn);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('announcements').insert({
          id: newAnn.id,
          company_id: newAnn.companyId,
          company_name: newAnn.companyName,
          title: newAnn.title,
          content: newAnn.content,
          category: newAnn.category,
          created_at: newAnn.createdAt
        });
      } catch (e) {
        console.warn('[Supabase] Failed to insert announcement:', e);
      }
    }

    res.status(201).json(newAnn);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/announcements/edit', async (req, res) => {
  try {
    const { id, title, content, category } = req.body;
    if (!id) return res.status(400).json({ error: 'Missing announcement identification parameter.' });
    db.updateAnnouncement(id, { title, content, category });

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('announcements').update({
          title,
          content,
          category
        }).eq('id', id);
      } catch (e) {
        console.warn('[Supabase] Failed to update announcement:', e);
      }
    }

    res.json({ success: true, item: db.getAnnouncements().find(a => a.id === id) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/announcements/:id', async (req, res) => {
  try {
    db.deleteAnnouncement(req.params.id);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('announcements').delete().eq('id', req.params.id);
      } catch (e) {
        console.warn('[Supabase] Failed to delete announcement:', e);
      }
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Jobs Extra CRUD Support ---
app.post('/api/jobs/edit', async (req, res) => {
  try {
    const { id, title, location, salaryRange, jobType, experienceLevel, description, requirements, skillsRequired, status, isSuspicious, suspiciousReason, companyId } = req.body;
    if (!id) return res.status(400).json({ error: 'Missing vacancy identification parameter.' });
    
    const company = companyId ? db.getCompanies().find(c => c.id === companyId) : null;
    const companyName = company ? company.name : undefined;
    const companyLogo = company ? company.logo : undefined;

    db.updateJob(id, {
      title,
      companyId,
      companyName,
      companyLogo,
      location,
      salaryRange,
      jobType,
      experienceLevel,
      description,
      requirements: requirements || [],
      skillsRequired: skillsRequired || [],
      status,
      isSuspicious: !!isSuspicious,
      suspiciousReason
    });

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('jobs').update({
          title,
          company_id: companyId,
          company_name: companyName,
          company_logo: companyLogo,
          location,
          salary_range: salaryRange,
          job_type: jobType,
          experience_level: experienceLevel,
          description,
          requirements: requirements || [],
          skills_required: skillsRequired || [],
          status,
          is_suspicious: !!isSuspicious,
          suspicious_reason: suspiciousReason
        }).eq('id', id);
      } catch (e) {
        console.warn('[Supabase] Failed to update job:', e);
      }
    }

    res.json({ success: true, item: db.getJobs().find(j => j.id === id) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/jobs/:id', async (req, res) => {
  try {
    db.deleteJob(req.params.id);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('jobs').delete().eq('id', req.params.id);
      } catch (e) {
        console.warn('[Supabase] Failed to delete job:', e);
      }
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Companies Extra CRUD Support ---
app.post('/api/companies/edit', async (req, res) => {
  try {
    const { id, name, logo, description, industry, location, website, isVerified } = req.body;
    if (!id) return res.status(400).json({ error: 'Missing company identification parameter.' });
    
    db.updateCompany(id, {
      name,
      logo,
      description,
      industry,
      location,
      website,
      isVerified: isVerified !== undefined ? !!isVerified : undefined
    });

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('companies').update({
          name,
          logo,
          description,
          industry,
          location,
          website,
          is_verified: isVerified !== undefined ? !!isVerified : undefined
        }).eq('id', id);
      } catch (e) {
        console.warn('[Supabase] Failed to update company:', e);
      }
    }

    res.json({ success: true, item: db.getCompanies().find(c => c.id === id) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/companies/:id', async (req, res) => {
  try {
    db.deleteCompany(req.params.id);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('companies').delete().eq('id', req.params.id);
      } catch (e) {
        console.warn('[Supabase] Failed to delete company:', e);
      }
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Users CRUD Support ---
app.post('/api/users/add', async (req, res) => {
  try {
    const { name, email, role, companyId, avatar, password } = req.body;
    if (!name || !name.trim() || !email || !email.trim() || !role || !password || !password.trim()) {
      return res.status(400).json({ error: 'Data registrasi tidak lengkap! Nama, Email, Peran (Role), dan Password semuanya wajib diisi.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password tidak boleh kurang dari 8 karakter!' });
    }

    // Check if user already exists
    const existingUser = db.getUsers().find(u => u.email.trim().toLowerCase() === email.trim().toLowerCase());
    if (existingUser) {
      return res.status(400).json({ error: 'Email sudah terdaftar. Silakan masuk melalui tab Login.' });
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role,
      companyId,
      avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      password: password || undefined
    };
    db.addUser(newUser);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('users').insert({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          company_id: newUser.companyId || null,
          avatar: newUser.avatar,
          password: newUser.password || null
        });
      } catch (e) {
        console.warn('[Supabase] Failed to insert user:', e);
      }
    }

    res.status(201).json(newUser);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    let user = db.getUsers().find(u => u.email.trim().toLowerCase() === normalizedEmail);

    // If not found locally (e.g. after a server restart), attempt fetching from Supabase
    const supabase = getSupabaseClient();
    if (!user && supabase) {
      try {
        console.log(`[Supabase] User ${normalizedEmail} not found in local memory, querying from Supabase...`);
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', normalizedEmail)
          .maybeSingle();

        if (!error && data) {
          // Sync/reconstruct user back into local memory db so future requests also know this user
          user = {
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role as any,
            companyId: data.company_id,
            avatar: data.avatar,
            password: data.password || undefined
          };
          db.addUser(user);
        }
      } catch (e) {
        console.warn('[Supabase] Failed to look up user during login:', e);
      }
    }

    if (!user) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan. Silakan mendaftar terlebih dahulu.' });
    }

    // If user has a password set, verify it. Preloaded sandbox users or any old users might have no password set.
    if (user.password && user.password !== password) {
      return res.status(401).json({ error: 'Password yang Anda masukkan salah.' });
    }

    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error occurred during login.' });
  }
});

app.post('/api/users/edit', async (req, res) => {
  try {
    const { id, name, email, role, companyId, avatar, gender, bio, socialLinks, phone, password } = req.body;
    if (!id) return res.status(400).json({ error: 'Missing user identification parameter.' });
    
    db.updateUser(id, { name, email, role, companyId, avatar, gender, bio, socialLinks, phone, password });

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('users').update({
          name,
          email,
          role,
          company_id: companyId || null,
          avatar,
          password
        }).eq('id', id);
      } catch (e) {
        console.warn('[Supabase] Failed to update user:', e);
      }
    }

    res.json({ success: true, item: db.getUsers().find(u => u.id === id) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    db.deleteUser(req.params.id);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('users').delete().eq('id', req.params.id);
      } catch (e) {
        console.warn('[Supabase] Failed to delete user:', e);
      }
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// Vite middleware for dev / express static for production build
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Job Seeker SaaS running on http://localhost:${PORT}`);
  });
}

startServer();
