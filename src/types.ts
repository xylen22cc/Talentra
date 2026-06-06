export interface User {
  id: string;
  name: string;
  email: string;
  role: 'seeker' | 'recruiter' | 'admin';
  companyId?: string;
  avatar?: string;
  password?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'Laki-laki' | 'Perempuan';
  bio?: string;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    instagram?: string;
  };
  phone?: string;
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  description: string;
  industry: string;
  location: string;
  website: string;
  isVerified: boolean;
}

export interface Job {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  location: string;
  salaryRange: string;
  jobType: 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Internship';
  experienceLevel: 'Entry Level' | 'Mid Level' | 'Senior Level';
  description: string;
  requirements: string[]; // For smart matching
  skillsRequired: string[];
  status: 'pending' | 'approved' | 'rejected';
  isSuspicious: boolean; // Fake job detector flag
  suspiciousReason?: string;
  createdAt: string;
  isSponsored?: boolean;
}

export interface JobSeekerProfile {
  id: string;
  title: string;
  bio: string;
  skills: string[];
  experience: {
    role: string;
    company: string;
    duration: string;
    description: string;
  }[];
  education: {
    school: string;
    degree: string;
    year: string;
  }[];
  portfolio: {
    title: string;
    url: string;
  }[];
  cvText?: string;
  cvFile?: {
    name: string;
    type: string;
    dataUrl: string;
    size?: number;
  };
}

export interface Application {
  id: string;
  jobId: string;
  applicantId: string;
  applicantName: string;
  applicantTitle: string;
  applicantSkills: string[];
  cvSummary?: string;
  status: 'pending' | 'interview' | 'rejected' | 'accepted';
  appliedAt: string;
  anonymousMode: boolean; // Anti-bias application
  matchPercent: number; // calculated on application
  interviewScore?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'seeker' | 'recruiter' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  jobTitle: string;
  companyName: string;
  otherPartyId: string;
  otherPartyName: string;
  otherPartyAvatar: string;
  messages: Message[];
  seekerId?: string;
  recruiterId?: string;
  seekerName?: string;
  seekerAvatar?: string;
  recruiterName?: string;
  recruiterAvatar?: string;
}

export interface InterviewSession {
  id: string;
  jobTitle: string;
  companyName: string;
  messages: {
    id: string;
    sender: 'interviewer' | 'candidate';
    text: string;
    feedback?: string;
    score?: number;
  }[];
  isCompleted: boolean;
  overallScore?: number;
  overallFeedback?: string;
}

export interface CompanyAnnouncement {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  content: string;
  category: 'Milestone' | 'Culture' | 'Event' | 'Hiring' | 'General';
  createdAt: string;
}

