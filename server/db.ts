import fs from 'fs';
import path from 'path';
import { Company, Job, JobSeekerProfile, Application, ChatSession, User, CompanyAnnouncement } from '../src/types';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Ensure DB directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

interface DBState {
  users: User[];
  companies: Company[];
  jobs: Job[];
  seekerProfiles: Record<string, JobSeekerProfile>;
  applications: Application[];
  chats: ChatSession[];
  announcements: CompanyAnnouncement[];
}


const DEFAULT_COMPANIES: Company[] = [
  {
    id: 'co-1',
    name: 'Google Cloud Platform',
    logo: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=100&auto=format&fit=crop&q=60',
    description: 'Leading global cloud computing technology suite by Google.',
    industry: 'Technology',
    location: 'Mountain View, CA',
    website: 'https://cloud.google.com',
    isVerified: true
  },
  {
    id: 'co-2',
    name: 'Finverge Labs',
    logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&auto=format&fit=crop&q=60',
    description: 'Next-generation banking tech solutions and open-finance ledgers.',
    industry: 'Financial Technology',
    location: 'Singapore, SG',
    website: 'https://finverge.io',
    isVerified: true
  },
  {
    id: 'co-3',
    name: 'Veritas Analytics',
    logo: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=100&auto=format&fit=crop&q=60',
    description: 'Big data consultancy with focus on predictive modeling and health analytics.',
    industry: 'Data Science',
    location: 'Jakarta, ID',
    website: 'https://veritasanalytica.id',
    isVerified: true
  },
  {
    id: 'co-4',
    name: 'CryptoApex Global Inc. (SUSPICIOUS)',
    logo: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=100&auto=format&fit=crop&q=60',
    description: 'Web3 and Bitcoin growth optimization agency. Direct bank wire is required for software tooling integration training setup fees.',
    industry: 'Web3 & Marketing',
    location: 'Offshore Office',
    website: 'http://cryptoapex-pay-scam.com',
    isVerified: false
  },
  {
    id: 'co-5',
    name: 'Tokopedia',
    logo: 'https://images.unsplash.com/photo-1563013544-824ae1d704d3?w=100&auto=format&fit=crop&q=60',
    description: 'Leading Indonesian e-commerce platform empowering millions of small businesses.',
    industry: 'E-commerce',
    location: 'Jakarta, ID',
    website: 'https://www.tokopedia.com',
    isVerified: true
  },
  {
    id: 'co-6',
    name: 'GoTo Group',
    logo: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=100&auto=format&fit=crop&q=60',
    description: 'The largest technology group in Indonesia, combining on-demand services, e-commerce, and financial services.',
    industry: 'Technology',
    location: 'Jakarta, ID',
    website: 'https://www.gotocompany.com',
    isVerified: true
  },
  {
    id: 'co-7',
    name: 'Traveloka',
    logo: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=100&auto=format&fit=crop&q=60',
    description: 'Southeast Asia\'s leading lifestyle superapp providing travel, local services, and financial products.',
    industry: 'Travel & Lifestyle',
    location: 'Jakarta, ID',
    website: 'https://www.traveloka.com',
    isVerified: true
  },
  {
    id: 'co-8',
    name: 'Bank Mandiri',
    logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&auto=format&fit=crop&q=60',
    description: 'Largest state-owned bank in Indonesia with top tier corporate financing and digital retail products.',
    industry: 'Banking & Financial',
    location: 'Jakarta, ID',
    website: 'https://www.bankmandiri.co.id',
    isVerified: true
  },
  {
    id: 'co-9',
    name: 'Shopee Indonesia',
    logo: 'https://images.unsplash.com/photo-1472851294608-062f824d296e?w=100&auto=format&fit=crop&q=60',
    description: 'Vibrant online mobile-first retail ecosystem driving digitisation throughout Southeast Asia.',
    industry: 'E-commerce',
    location: 'Jakarta, ID',
    website: 'https://shopee.co.id',
    isVerified: true
  },
  {
    id: 'co-10',
    name: 'Bukalapak',
    logo: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=100&auto=format&fit=crop&q=60',
    description: 'Supporting MSMEs and local neighborhood groceries (warungs) in Indonesia through digital retail services.',
    industry: 'E-commerce / FinTech',
    location: 'Bandung, ID',
    website: 'https://www.bukalapak.com',
    isVerified: true
  },
  {
    id: 'co-11',
    name: 'Vidio',
    logo: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=100&auto=format&fit=crop&q=60',
    description: 'Leading Indonesian over-the-top streaming service airing local soap operas, premium league matches, and movies.',
    industry: 'Media & Streaming',
    location: 'Jakarta, ID',
    website: 'https://www.vidio.com',
    isVerified: true
  },
  {
    id: 'co-12',
    name: 'Kopi Kenangan',
    logo: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=100&auto=format&fit=crop&q=60',
    description: 'Top fast-casual coffee chain in Indonesia operating a tech-led smart ordering retail network.',
    industry: 'Retail Tech / F&B',
    location: 'Jakarta, ID',
    website: 'https://kopikenangan.com',
    isVerified: true
  }
];

const DEFAULT_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Feri Irawan',
    email: 'seeker@talenta.io',
    role: 'seeker',
    password: 'talenta123',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-2',
    name: 'Sarah Connor',
    email: 'recruiter@talenta.io',
    role: 'recruiter',
    companyId: 'co-2',
    password: 'talenta123',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-3',
    name: 'Rian Aditia (Platform Admin)',
    email: 'admin@talenta.io',
    role: 'admin',
    password: 'talenta123',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-rec-1',
    name: 'Michael Scott',
    email: 'gcp.recruiter@talenta.io',
    role: 'recruiter',
    companyId: 'co-1',
    password: 'gcp123',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-rec-3',
    name: 'Aulia Rahman',
    email: 'veritas.recruiter@talenta.io',
    role: 'recruiter',
    companyId: 'co-3',
    password: 'veritas123',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-rec-4',
    name: 'Slick Rick',
    email: 'cryptoapex.recruiter@talenta.io',
    role: 'recruiter',
    companyId: 'co-4',
    password: 'cryptoapex123',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-rec-5',
    name: 'Budi Hartono',
    email: 'tokopedia.recruiter@talenta.io',
    role: 'recruiter',
    companyId: 'co-5',
    password: 'tokped123',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-rec-6',
    name: 'Aditya Wira',
    email: 'goto.recruiter@talenta.io',
    role: 'recruiter',
    companyId: 'co-6',
    password: 'goto123',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-rec-7',
    name: 'Citra Lestari',
    email: 'traveloka.recruiter@talenta.io',
    role: 'recruiter',
    companyId: 'co-7',
    password: 'traveloka123',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-rec-8',
    name: 'Eko Prasetyo',
    email: 'mandiri.recruiter@talenta.io',
    role: 'recruiter',
    companyId: 'co-8',
    password: 'mandiri123',
    avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-rec-9',
    name: 'Dewi Sartika',
    email: 'shopee.recruiter@talenta.io',
    role: 'recruiter',
    companyId: 'co-9',
    password: 'shopee123',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-rec-10',
    name: 'Hendra Wijaya',
    email: 'bukalapak.recruiter@talenta.io',
    role: 'recruiter',
    companyId: 'co-10',
    password: 'bukalapak123',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-rec-11',
    name: 'Indah Permata',
    email: 'vidio.recruiter@talenta.io',
    role: 'recruiter',
    companyId: 'co-11',
    password: 'vidio123',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-rec-12',
    name: 'Joko Widodo',
    email: 'kopikenangan.recruiter@talenta.io',
    role: 'recruiter',
    companyId: 'co-12',
    password: 'kopken123',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'
  }
];

const DEFAULT_JOBS: Job[] = [
  {
    id: 'job-1',
    title: 'Senior Fullstack TypeScript Engineer',
    companyId: 'co-1',
    companyName: 'Google Cloud Platform',
    companyLogo: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=100&auto=format&fit=crop&q=60',
    location: 'Remote (APAC)',
    salaryRange: '$8,000 - $13,000 / month',
    jobType: 'Remote',
    experienceLevel: 'Senior Level',
    description: 'We are looking for a remote developer to build high-scale cloud platforms using React, Node.js, and server-side TypeScript. In this role, you will implement modular microservices and real-time collaboration engines.',
    requirements: [
      '5+ years programming experience in React and Node.js',
      'Proven expertise with modern build systems and bundlers (Vite/Rspack)',
      'Excellent system design capability and database performance optimization skills'
    ],
    skillsRequired: ['React', 'TypeScript', 'Node.js', 'Vite', 'PostgreSQL', 'Tailwind CSS'],
    status: 'approved',
    isSuspicious: false,
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString() // 3 days ago
  },
  {
    id: 'job-2',
    title: 'Frontend Developer (React & Tailwind)',
    companyId: 'co-2',
    companyName: 'Finverge Labs',
    companyLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&auto=format&fit=crop&q=60',
    location: 'Singapore / Hybrid',
    salaryRange: '$4,500 - $6,000 / month',
    jobType: 'Full-time',
    experienceLevel: 'Mid Level',
    description: 'Join Finverge to design and build transactional web dashboards for multi-asset wallets and ledger analytics. You will work in a fast-paced environment with a core stack of React 19, Tailwind CSS, and Framer Motion.',
    requirements: [
      '3+ years experience with React Hook form optimization',
      'Demonstrated high visual styling fidelity with Tailwind CSS',
      'Knowledge of state management such as Zustand or React Context'
    ],
    skillsRequired: ['React', 'Tailwind CSS', 'Framer Motion', 'Zustand', 'CSS'],
    status: 'approved',
    isSuspicious: false,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString() // 12 hours ago
  },
  {
    id: 'job-3',
    title: 'Urgent Remote Assistant - Weekly High Pay Payout',
    companyId: 'co-4',
    companyName: 'CryptoApex Global Inc.',
    companyLogo: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=100&auto=format&fit=crop&q=60',
    location: 'Offshore Office / Immediate Start',
    salaryRange: '$1,000 - $2,500 / week',
    jobType: 'Part-time',
    experienceLevel: 'Entry Level',
    description: 'Immediate hiring for virtual marketing assistants. No prior skillset is required! Training fee of $50 must be wired to our platform wallet to unlock premium task dashboard instructions. High commission payouts daily.',
    requirements: [
      'Must have stable internet and a bank account',
      'Willing to pay $50 training/tooling unlock package up front',
      'Work only 1 hour per day and earn thousands'
    ],
    skillsRequired: ['Marketing', 'Data Entry', 'Telegram'],
    status: 'pending', // Pending approval by Admin
    isSuspicious: true,
    suspiciousReason: 'Requires upfront payment ($50 training fee) to unlock working portal, promises unrealistically high entry-level compensation with no skill requirements, and operates via suspect offshore billing patterns.',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString() // 8 hours ago
  },
  {
    id: 'job-4',
    title: 'Software Engineer - Backend Go & gRPC',
    companyId: 'co-6',
    companyName: 'GoTo Group',
    companyLogo: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=100&auto=format&fit=crop&q=60',
    location: 'Jakarta, ID',
    salaryRange: 'Rp 18.000.000 - Rp 30.000.000 / month',
    jobType: 'Full-time',
    experienceLevel: 'Mid Level',
    description: 'Kami sedang mencari Backend Go Developer untuk mengoptimalkan layanan on-demand kami, merawat request throughput tinggi, gRPC api endpoints, dan database SQL/NoSQL berskala besar.',
    requirements: [
      '2+ tahun pengalaman kerja dengan Golang',
      'Memahami REST API, gRPC, serta protocol buffers',
      'Berpengalaman dengan relational database seperti PostgreSQL dan message broker seperti Kafka'
    ],
    skillsRequired: ['Go', 'gRPC', 'PostgreSQL', 'Kafka', 'Redis', 'Docker'],
    status: 'approved',
    isSuspicious: false,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
  },
  {
    id: 'job-5',
    title: 'Senior Frontend Engineer (React/NextJS)',
    companyId: 'co-5',
    companyName: 'Tokopedia',
    companyLogo: 'https://images.unsplash.com/photo-1563013544-824ae1d704d3?w=100&auto=format&fit=crop&q=60',
    location: 'Jakarta, ID / Hybrid',
    salaryRange: 'Rp 25.000.000 - Rp 45.000.000 / month',
    jobType: 'Full-time',
    experienceLevel: 'Senior Level',
    description: 'Pimpin pengembangan arsitektur website pembeli Tokopedia menggunakan Next.js dan optimasi Core Web Vitals untuk meningkatkan konversi pengguna dan performa SEO.',
    requirements: [
      '5+ tahun pengalaman dalam ekosistem frontend JavaScript',
      'Keahlian mendalam mengenai SSR, SSG, heritansi modul Next.js, dan optimasi CSS',
      'Leadership yang matang untuk mentoring junior developers'
    ],
    skillsRequired: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'GraphQL', 'Lighthouse'],
    status: 'approved',
    isSuspicious: false,
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString()
  },
  {
    id: 'job-6',
    title: 'Mobile Developer - Flutter',
    companyId: 'co-7',
    companyName: 'Traveloka',
    companyLogo: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=100&auto=format&fit=crop&q=60',
    location: 'Jakarta, ID',
    salaryRange: 'Rp 14.000.000 - Rp 22.000.000 / month',
    jobType: 'Full-time',
    experienceLevel: 'Mid Level',
    description: 'Membangun fungsionalitas pencarian hotel dan pemesanan aktivitas tiket liburan secara dinamis menggunakan Flutter untuk platform Android dan iOS.',
    requirements: [
      'Minimal 2 tahun pengalaman komparatif menggunakan Flutter dan Dart',
      'Familiar dengan state management Bloc atau Provider',
      'Pernah merilis minimal 1 aplikasi ke Play Store atau App Store'
    ],
    skillsRequired: ['Flutter', 'Dart', 'Android', 'iOS', 'Bloc', 'REST API'],
    status: 'approved',
    isSuspicious: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'job-7',
    title: 'Junior Data Analyst',
    companyId: 'co-3',
    companyName: 'Veritas Analytics',
    companyLogo: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=100&auto=format&fit=crop&q=60',
    location: 'Jakarta, ID',
    salaryRange: 'Rp 7.500.000 - Rp 11.000.000 / month',
    jobType: 'Full-time',
    experienceLevel: 'Entry Level',
    description: 'Melakukan pembersihan data mentah, mengekstrak metrik performa operasional berkala, serta menyusun dashboard visualisasi menggunakan Tableau atau PowerBI.',
    requirements: [
      'Pendidikan minimal S1 Statistika, Matematika, atau Sistem Informasi',
      'Lancer dalam menulis query SQL kompleks (JOIN, Subqueries, CTEs)',
      'Familiaritas dasar berkomunikasi statistik dalam bahasa Python atau R'
    ],
    skillsRequired: ['SQL', 'Python', 'Tableau', 'Excel', 'Pandas'],
    status: 'approved',
    isSuspicious: false,
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    id: 'job-8',
    title: 'Cloud DevOps Practitioner',
    companyId: 'co-6',
    companyName: 'GoTo Group',
    companyLogo: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=100&auto=format&fit=crop&q=60',
    location: 'Remote (Indonesia)',
    salaryRange: 'Rp 22.000.000 - Rp 38.000.000 / month',
    jobType: 'Remote',
    experienceLevel: 'Senior Level',
    description: 'Bertanggung jawab atas otomatisasi pipeline CI/CD, mengawasi klaster orkestrasi Kubernetes di Google Cloud, serta memantau keandalan sistem berskala jutaan user.',
    requirements: [
      'Pemahaman luar biasa tentang Terraform, Ansible, dan Docker',
      'Sertifikasi GCP Professional Cloud Architect lebih disukai',
      'Terbiasa dengan monitoring tools seperti Prometheus dan Grafana'
    ],
    skillsRequired: ['Kubernetes', 'Docker', 'Terraform', 'GCP', 'GitHub Actions', 'Prometheus'],
    status: 'approved',
    isSuspicious: false,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'job-9',
    title: 'Web Developer (PHP & Laravel)',
    companyId: 'co-10',
    companyName: 'Bukalapak',
    companyLogo: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=100&auto=format&fit=crop&q=60',
    location: 'Bandung, ID / Remote',
    salaryRange: 'Rp 10.000.000 - Rp 16.000.000 / month',
    jobType: 'Full-time',
    experienceLevel: 'Mid Level',
    description: 'Mengembangkan sistem operasional merchant dan inventori logistik penunjang warung-warung menggunakan framework Laravel 11 terintegrasi.',
    requirements: [
      'Paham OOP PHP dengan baik dan standar kepatuhan PSR',
      'Minimal 2 tahun pengalaman aktif memproduksi modul fungsional di Laravel',
      'Terbiasa dengan database MySQL/MariaDB dan integrasi REST backend'
    ],
    skillsRequired: ['PHP', 'Laravel', 'MySQL', 'JavaScript', 'HTML', 'Git'],
    status: 'approved',
    isSuspicious: false,
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString()
  },
  {
    id: 'job-10',
    title: 'UI/UX Designer Expert',
    companyId: 'co-11',
    companyName: 'Vidio',
    companyLogo: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=100&auto=format&fit=crop&q=60',
    location: 'Jakarta, ID',
    salaryRange: 'Rp 12.000.000 - Rp 20.000.000 / month',
    jobType: 'Full-time',
    experienceLevel: 'Mid Level',
    description: 'Merancang wireframe, user flow interaktif, serta visual aset modern untuk platform streaming video kami di Web, Mobile App, dan Smart TV web kit.',
    requirements: [
      'Portofolio desain UI/UX solid di Figma atau Sketch',
      'Mahir melakukan user research dan usability testing pada produk hiburan digital',
      'Memahami basic CSS/HTML untuk koordinasi lancar dengan frontend developers'
    ],
    skillsRequired: ['Figma', 'UI Design', 'Wireframing', 'User Research', 'Prototyping'],
    status: 'approved',
    isSuspicious: false,
    createdAt: new Date(Date.now() - 3600000 * 150).toISOString()
  },
  {
    id: 'job-11',
    title: 'IT Corporate Security Lead',
    companyId: 'co-8',
    companyName: 'Bank Mandiri',
    companyLogo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&auto=format&fit=crop&q=60',
    location: 'Jakarta, ID',
    salaryRange: 'Rp 30.000.000 - Rp 50.000.000 / month',
    jobType: 'Full-time',
    experienceLevel: 'Senior Level',
    description: 'Mengawasi audit postur keamanan jaringan, kepatuhan infrastruktur perbankan digital Mandiri, serta mengamankan gateway transaksi keuangan dari eksploitasi siber.',
    requirements: [
      'Pendidikan S1 Informatika keamanan siber atau kompetensi setara',
      'Sertifikasi Certified Information Systems Auditor (CISA) atau CISSP',
      'Berpengalaman dengan regulasi perbankan OJK dan kepatuhan ISO 27001'
    ],
    skillsRequired: ['Cybersecurity', 'Risk Assessment', 'ISO 27001', 'Network Auditing', 'Firewalls'],
    status: 'approved',
    isSuspicious: false,
    createdAt: new Date(Date.now() - 3600000 * 240).toISOString()
  },
  {
    id: 'job-12',
    title: 'Mobile Developer React Native',
    companyId: 'co-9',
    companyName: 'Shopee Indonesia',
    companyLogo: 'https://images.unsplash.com/photo-1472851294608-062f824d296e?w=100&auto=format&fit=crop&q=60',
    location: 'Jakarta, ID / Hybrid',
    salaryRange: 'Rp 16.000.000 - Rp 27.000.000 / month',
    jobType: 'Full-time',
    experienceLevel: 'Mid Level',
    description: 'Bergabunglah di tim inti Shopee Pay untuk memoles komponen interface pembayaran e-wallet menggunakan React Native dengan optimalisasi runtime memory rendering.',
    requirements: [
      'Keahlian mendalam dalam TypeScript dan React Native Native Bridges',
      'Familiar dengan Redux Saga atau Toolkit untuk state synchronisation',
      'Kemampuan andal mematangkan visual layout responsif multi-device screen'
    ],
    skillsRequired: ['React Native', 'TypeScript', 'Redux', 'iOS', 'Android', 'Jest'],
    status: 'approved',
    isSuspicious: false,
    createdAt: new Date(Date.now() - 3600000 * 30).toISOString()
  },
  {
    id: 'job-13',
    title: 'Android Developer (Java/Kotlin)',
    companyId: 'co-5',
    companyName: 'Tokopedia',
    companyLogo: 'https://images.unsplash.com/photo-1563013544-824ae1d704d3?w=100&auto=format&fit=crop&q=60',
    location: 'Jakarta, ID',
    salaryRange: 'Rp 15.000.000 - Rp 25.000.000 / month',
    jobType: 'Full-time',
    experienceLevel: 'Mid Level',
    description: 'Ciptakan fitur interaksi produk instan, ulasan gambar, serta tracking ekspedisi logistik kurir real-time pada aplikasi native Android Tokopedia.',
    requirements: [
      'Minimal 3 tahun mengemban development native Android Kotlin',
      'Memahami Android Jetpack Components dan pola arsitektur MVVM',
      'Terbiasa melakukan profiling memori menggunakan Android Studio tools'
    ],
    skillsRequired: ['Kotlin', 'Android SDK', 'Java', 'MVVM', 'Retrofit', 'Coroutines'],
    status: 'approved',
    isSuspicious: false,
    createdAt: new Date(Date.now() - 3600000 * 14).toISOString()
  },
  {
    id: 'job-14',
    title: 'iOS Platform Engineer',
    companyId: 'co-6',
    companyName: 'GoTo Group',
    companyLogo: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=100&auto=format&fit=crop&q=60',
    location: 'Jakarta, ID',
    salaryRange: 'Rp 18.000.000 - Rp 32.000.000 / month',
    jobType: 'Full-time',
    experienceLevel: 'Senior Level',
    description: 'Pahat kode tangguh untuk aplikasi Gojek pelanggan di ekosistem iOS menggunakan Swift modern, SwiftUI, serta struktur concurrency modern (async/await).',
    requirements: [
      '4+ tahun menulis program iOS native komersial',
      'Pemahaman kuat atas memory leaks management (retain cycles, ARC)',
      'Pengalaman rilis TestFlight dan App Store submission'
    ],
    skillsRequired: ['Swift', 'SwiftUI', 'XCode', 'Combine', 'iOS SDK', 'Cocoapods'],
    status: 'approved',
    isSuspicious: false,
    createdAt: new Date(Date.now() - 3600000 * 100).toISOString()
  },
  {
    id: 'job-15',
    title: 'Machine Learning Deep Learning Specialist',
    companyId: 'co-3',
    companyName: 'Veritas Analytics',
    companyLogo: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=100&auto=format&fit=crop&q=60',
    location: 'Remote (Indonesia)',
    salaryRange: 'Rp 20.000.000 - Rp 35.000.000 / month',
    jobType: 'Remote',
    experienceLevel: 'Senior Level',
    description: 'Latih model prediksi risiko kredit perbankan, deteksi fraud transaksi keuangan, serta model NLP teks berkas dengan Python, PyTorch, dan Docker.',
    requirements: [
      'Gelar S2/S3 bidang Ilmu Komputer, Matematika, Data Science atau setara',
      'Pengalaman hands-on melatih model deep learning dan machine learning klasik',
      'Keahlian mumpuni memicu deployment model ke AWS SageMaker atau GCP Vertex AI'
    ],
    skillsRequired: ['Python', 'PyTorch', 'TensorFlow', 'Scikit-Learn', 'Docker', 'Machine Learning'],
    status: 'approved',
    isSuspicious: false,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'job-16',
    title: 'Cloud Solutions Architect',
    companyId: 'co-1',
    companyName: 'Google Cloud Platform',
    companyLogo: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=100&auto=format&fit=crop&q=60',
    location: 'Singapore / Jakarta (Hybrid)',
    salaryRange: '$6,500 - $11,000 / month',
    jobType: 'Full-time',
    experienceLevel: 'Senior Level',
    description: 'Help global tier-1 enterprise clients architecture secure, reliable, and scalable applications over GCP platform infrastructure, focusing on serverless migrations.',
    requirements: [
      '8+ years cloud implementation consulting experience',
      'Active GCP Professional Cloud Security or Solutions Architect Certification',
      'Highly technical in complex networking topology, Kubernetes cluster federations, and IAM setups'
    ],
    skillsRequired: ['GCP', 'Cloud Architecture', 'Terraform', 'Kubernetes', 'BGP', 'IAM'],
    status: 'approved',
    isSuspicious: false,
    createdAt: new Date(Date.now() - 3600000 * 120).toISOString()
  },
  {
    id: 'job-17',
    title: 'Fullstack Laravel Developer (Kopi Kenangan App)',
    companyId: 'co-12',
    companyName: 'Kopi Kenangan',
    companyLogo: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=100&auto=format&fit=crop&q=60',
    location: 'Jakarta, ID',
    salaryRange: 'Rp 11.000.000 - Rp 18.000.000 / month',
    jobType: 'Full-time',
    experienceLevel: 'Mid Level',
    description: 'Mengembangkan sistem loyalty member, digital vouchers order backend, serta integrasi pemesanan point of sales (POS) Kopi Kenangan seluruh Indonesia.',
    requirements: [
      'Minimal 3 tahun berkecimpung mengembangkan Fullstack PHP Laravel dan VueJS',
      'Pengalaman matang integrasi payment gateway MIDTRANS atau XENDIT',
      'Familiar dengan Redis queue worker untuk asynchronous transactional jobs'
    ],
    skillsRequired: ['Laravel', 'Vue.js', 'PHP', 'Midtrans', 'Redis', 'MySQL'],
    status: 'approved',
    isSuspicious: false,
    createdAt: new Date(Date.now() - 3600000 * 96).toISOString()
  },
  {
    id: 'job-18',
    title: 'QA Automation Engineer',
    companyId: 'co-9',
    companyName: 'Shopee Indonesia',
    companyLogo: 'https://images.unsplash.com/photo-1472851294608-062f824d296e?w=100&auto=format&fit=crop&q=60',
    location: 'Jakarta, ID',
    salaryRange: 'Rp 12.000.000 - Rp 21.000.000 / month',
    jobType: 'Full-time',
    experienceLevel: 'Mid Level',
    description: 'Menulis skrip uji otomatisasi komprehensif (E2E) menggunakan Cypress atau Selenium untuk memastikan kestabilan web checkout dari aneka bug.',
    requirements: [
      '2+ tahun pengalaman bekerja sebagai QA Engineer fokus otomatisasi uji',
      'Kemampuan coding andal menggunakan JavaScript, TypeScript, atau Python',
      'Pernah merancang integration test plan terhubung dengan Jenkins / CI pipeline'
    ],
    skillsRequired: ['Cypress', 'JavaScript', 'Selenium', 'Jenkins', 'Appium', 'Integration Testing'],
    status: 'approved',
    isSuspicious: false,
    createdAt: new Date(Date.now() - 3600000 * 45).toISOString()
  },
  {
    id: 'job-19',
    title: 'Lead Product Manager - Core Transactions',
    companyId: 'co-5',
    companyName: 'Tokopedia',
    companyLogo: 'https://images.unsplash.com/photo-1563013544-824ae1d704d3?w=100&auto=format&fit=crop&q=60',
    location: 'Jakarta, ID',
    salaryRange: 'Rp 30.000.000 - Rp 52.000.000 / month',
    jobType: 'Full-time',
    experienceLevel: 'Senior Level',
    description: 'Nakhodai visi produk, strategi rilis, serta kordinasi lintas fungsional (Engineering, Business, Design) untuk checkout cart core Tokopedia merchant transactions.',
    requirements: [
      '5+ tahun rekam jejak sukses sebagai Product Manager di sektor Fintech / E-commerce',
      'Kemampuan analitis data (SQL, Google Analytics, Amplitude) tingkat lanjut',
      'Komunikasi diplomatis andal melobi business requirements menjadi functional design'
    ],
    skillsRequired: ['Product Strategy', 'Amplitude', 'SQL', 'Agile', 'User Research', 'Wireframes'],
    status: 'approved',
    isSuspicious: false,
    createdAt: new Date(Date.now() - 3600000 * 16).toISOString()
  },
  {
    id: 'job-20',
    title: 'Database Administrator DBA Specialist',
    companyId: 'co-8',
    companyName: 'Bank Mandiri',
    companyLogo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&auto=format&fit=crop&q=60',
    location: 'Jakarta, ID / On-site',
    salaryRange: 'Rp 14.000.000 - Rp 23.000.000 / month',
    jobType: 'Full-time',
    experienceLevel: 'Mid Level',
    description: 'Bertanggung jawab melakukan backup database Mandiri, replikasi data high-availability, optimasi query lambat, serta instalasi patch keamanan Oracle/Postgres db.',
    requirements: [
      'S1 Teknik Informatika/Sistem Informasi',
      'Menguasai setup server Oracle Database, Microsoft SQL Server, atau PostgreSQL',
      'Memahami arsitektur failover cluster, partisi tabel besar, serta optimasi indeks'
    ],
    skillsRequired: ['Oracle DB', 'PostgreSQL', 'SQL Server', 'Database Indexing', 'Backup & Recovery'],
    status: 'approved',
    isSuspicious: false,
    createdAt: new Date(Date.now() - 3600000 * 80).toISOString()
  },
  {
    id: 'job-21',
    title: 'Frontend Developer (Angular / Vue)',
    companyId: 'co-2',
    companyName: 'Finverge Labs',
    companyLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&auto=format&fit=crop&q=60',
    location: 'Singapore / Hybrid',
    salaryRange: '$4,000 - $6,500 / month',
    jobType: 'Contract',
    experienceLevel: 'Mid Level',
    description: 'Contract base developer to collaborate with back office ledger migration dashboard UI using Angular 17. Maintain high performance grid rendering.',
    requirements: [
      'At least 3 years commercial Angular experience',
      'Great implementation of RXJS, state management, and unit testing using Jasmine/Karma',
      'Fluency in English team discussions is mandatory'
    ],
    skillsRequired: ['Angular', 'RxJS', 'TypeScript', 'Karma', 'Ngrx', 'Tailwind CSS'],
    status: 'approved',
    isSuspicious: false,
    createdAt: new Date(Date.now() - 3600000 * 110).toISOString()
  },
  {
    id: 'job-22',
    title: 'Developer Technical Writer Specialist',
    companyId: 'co-1',
    companyName: 'Google Cloud Platform',
    companyLogo: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=100&auto=format&fit=crop&q=60',
    location: 'Remote (APAC)',
    salaryRange: '$4,500 - $7,000 / month',
    jobType: 'Contract',
    experienceLevel: 'Mid Level',
    description: 'Draft, polish, and synthesize developer-facing tutorial guides, API schemas, and installation guides for Google Cloud Platform SDK integration plugins.',
    requirements: [
      'Outstanding technical writing portfolio in English (Markdown format)',
      'Basic capabilities of reading multi-programming language snippets (Java, Go, Python, TypeScript)',
      'Passionate about translating complex architectural systems into friendly clear tutorials'
    ],
    skillsRequired: ['Technical Writing', 'Markdown', 'Git', 'API Documentation', 'Docusaurus', 'Technical Translation'],
    status: 'approved',
    isSuspicious: false,
    createdAt: new Date(Date.now() - 3600000 * 180).toISOString()
  },
  {
    id: 'job-23',
    title: 'Senior Live Streaming Systems Engineer',
    companyId: 'co-11',
    companyName: 'Vidio',
    companyLogo: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=100&auto=format&fit=crop&q=60',
    location: 'Jakarta, ID',
    salaryRange: 'Rp 28.000.000 - Rp 45.000.000 / month',
    jobType: 'Full-time',
    experienceLevel: 'Senior Level',
    description: 'Kembangkan video delivery pipeline latensi super rendah untuk saluran siaran sepak bola nasional Vidio, memanfaatkan protokol WebRTC, HLS, rtmp, serta CDN scaling.',
    requirements: [
      '5+ tahun rekam jejak solid di ranah video encoding / streaming systems',
      'Paham mendalam atas FFmpeg, H.264/H.265 codecs, DASH, dan WebRTC protocols',
      'Familiar dengan Go, C++, Rust atau Java untuk optimalisasi media server backend'
    ],
    skillsRequired: ['WebRTC', 'HLS', 'FFmpeg', 'Go', 'CDN', 'C++'],
    status: 'approved',
    isSuspicious: false,
    createdAt: new Date(Date.now() - 3600000 * 7).toISOString()
  },
  {
    id: 'job-24',
    title: 'Social Media & Content Creator Lead',
    companyId: 'co-12',
    companyName: 'Kopi Kenangan',
    companyLogo: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=100&auto=format&fit=crop&q=60',
    location: 'Jakarta, ID / On-site',
    salaryRange: 'Rp 8.000.000 - Rp 13.000.000 / month',
    jobType: 'Full-time',
    experienceLevel: 'Mid Level',
    description: 'Buat ide-ide kampanye digital kreatif yang viral untuk mempromosikan menu baru Kopi Kenangan, membuat video TikTok/Instagram reels interaktif, dan berkolaborasi bersama influencer.',
    requirements: [
      'Min S1 Jurusan Komunikasi/Marketing/DKV atau pengalaman setara',
      'Portofolio video TikTok/Reels kreatif dengan tingkat interaksi tinggi',
      'Kemampuan editing video cepat di handphone / Adobe Premiere'
    ],
    skillsRequired: ['Video Editing', 'Social Media', 'Creative Direction', 'Copywriting', 'TikTok Marketing'],
    status: 'approved',
    isSuspicious: false,
    createdAt: new Date(Date.now() - 3600000 * 300).toISOString()
  },
  {
    id: 'job-25',
    title: 'Scrum Master / Technical Delivery Agile Lead',
    companyId: 'co-7',
    companyName: 'Traveloka',
    companyLogo: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=100&auto=format&fit=crop&q=60',
    location: 'Jakarta, ID',
    salaryRange: 'Rp 14.000.000 - Rp 23.000.000 / month',
    jobType: 'Full-time',
    experienceLevel: 'Mid Level',
    description: 'Fasilitasi sprint planning, standups harian, membuang hambatan developer, serta memoles komunikasi tim agar delivery siklus fitur hotel & akomodasi berjalan tepat waktu.',
    requirements: [
      'Sertifikasi Scrum Alliance (CSM / PSM I) adalah nilai tambah besar',
      'Pernah mengarsiteki delivery timeline produk berdurasi minimal 2 tahun',
      'Sangat fasih menggunakan JIRA, Confluence, dan tools pelacak defect'
    ],
    skillsRequired: ['Scrum', 'Agile', 'Jira', 'Confluence', 'Sprint Management', 'Defect Tracking'],
    status: 'approved',
    isSuspicious: false,
    createdAt: new Date(Date.now() - 3600000 * 200).toISOString()
  },
  {
    id: 'job-26',
    title: 'Group HR Talent Acquisition Lead',
    companyId: 'co-6',
    companyName: 'GoTo Group',
    companyLogo: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=100&auto=format&fit=crop&q=60',
    location: 'Jakarta, ID',
    salaryRange: 'Rp 20.000.000 - Rp 35.000.000 / month',
    jobType: 'Full-time',
    experienceLevel: 'Senior Level',
    description: 'Nakhodai program talenta rekrutmen teknologi strategis (Engineering & Product) skala nasional GoTo. Kembangkan kemitraan universitas dan program magang global.',
    requirements: [
      '5+ tahun pengalaman memimpin tim rekruter di regional skala besar / hypergrowth',
      'Kemampuan menjalin talent pipeline andal di ranah Software Engineering',
      'Terbiasa dengan tools Applicant Tracking System (ATS) mutakhir seperti Greenhouse'
    ],
    skillsRequired: ['Recruitment', 'Greenhouse', 'Applicant Tracking System', 'Negotiation', 'Talent Pipeline'],
    status: 'approved',
    isSuspicious: false,
    createdAt: new Date(Date.now() - 3600005 * 50).toISOString()
  },
  {
    id: 'job-27',
    title: 'Senior Golang Backend Platform Engineer',
    companyId: 'co-9',
    companyName: 'Shopee Indonesia',
    companyLogo: 'https://images.unsplash.com/photo-1472851294608-062f824d296e?w=100&auto=format&fit=crop&q=60',
    location: 'Jakarta, ID',
    salaryRange: 'Rp 28.000.000 - Rp 48.000.000 / month',
    jobType: 'Full-time',
    experienceLevel: 'Senior Level',
    description: 'Pahat sistem backend voucher kampanye puncak bulanan Shopee yang andal menelan trafik ratusan ribu QPS, mengedepankan efisiensi konkurensi di Golang.',
    requirements: [
      '5+ tahun keahlian backend komersial di Golang / C++',
      'Pemahaman mumpuni sistem terdistribusi, load balancer, partisi database SQL dan caching Redis',
      'Tangguh memecahkan masalah concurrency race condition menggunakan goroutines Profiling'
    ],
    skillsRequired: ['Go', 'Redis', 'PostgreSQL', 'Microservices', 'Docker', 'Profiling'],
    status: 'approved',
    isSuspicious: false,
    createdAt: new Date(Date.now() - 3600000 * 15).toISOString()
  },
  {
    id: 'job-28',
    title: 'Data & ETL Integration Infrastructure Engineer',
    companyId: 'co-3',
    companyName: 'Veritas Analytics',
    companyLogo: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=100&auto=format&fit=crop&q=60',
    location: 'Jakarta, ID',
    salaryRange: 'Rp 16.000.000 - Rp 26.000.000 / month',
    jobType: 'Full-time',
    experienceLevel: 'Senior Level',
    description: 'Membangun pipeline ETL/ELT pengolahan sekunder big data bernilai puluhan terabyte dengan Apache Spark, Airflow, Kafka, dan data warehouse Snowflake.',
    requirements: [
      '3+ tahun bekerja di ranah Data Engineering / ETL',
      'Keahlian mumpuni menulis transform logic dengan Apache Spark, Python atau Scala',
      'Familiar merangkai dag penjadwalan data pipeline di Apache Airflow'
    ],
    skillsRequired: ['Python', 'Apache Spark', 'Kafka', 'Apache Airflow', 'Snowflake', 'SQL'],
    status: 'approved',
    isSuspicious: false,
    createdAt: new Date(Date.now() - 3600000 * 10).toISOString()
  },
  {
    id: 'job-29',
    title: 'Admin Executive & Office Intern',
    companyId: 'co-5',
    companyName: 'Tokopedia',
    companyLogo: 'https://images.unsplash.com/photo-1563013544-824ae1d704d3?w=100&auto=format&fit=crop&q=60',
    location: 'Jakarta, ID',
    salaryRange: 'Rp 4.000.000 - Rp 5.500.000 / month',
    jobType: 'Internship',
    experienceLevel: 'Entry Level',
    description: 'Segarkan kecakapan organisasimu! Bantu menyusun berkas administratif kantor, mengkoordinir inventaris fasilitas, serta akomodasi kebutuhan umum tim regional.',
    requirements: [
      'Mahasiswa aktif / Fresh Graduate dari semua jurusan (Administrasi / Komunikasi lebih disukai)',
      'Teliti, rapi dalam penataan folder digital, mahir Google Docs / Google Sheets',
      'Memiliki interpersonal asertif yang sopan dan ramah'
    ],
    skillsRequired: ['Google Sheets', 'Google Docs', 'Administration', 'Scheduling', 'Communication'],
    status: 'approved',
    isSuspicious: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'job-30',
    title: 'Digital Marketing & SEO Coordinator',
    companyId: 'co-12',
    companyName: 'Kopi Kenangan',
    companyLogo: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=100&auto=format&fit=crop&q=60',
    location: 'Jakarta, ID',
    salaryRange: 'Rp 8.000.000 - Rp 12.000.000 / month',
    jobType: 'Full-time',
    experienceLevel: 'Mid Level',
    description: 'Tingkatkan kunjungan pencarian organik website Kopi Kenangan, kelola kampanye digital marketing ads berbayar (Google Ads, Meta Ads) untuk mendongkrak unduh aplikasi mobile.',
    requirements: [
      '2+ tahun berkarier mengelola SEO Off-page/On-page & performance marketing',
      'Mahir menganalisa Google Search Console, SEMrush, dan Google Analytics GA4',
      'Kemampuan andal riset keyword kuliner potensial dengan ROI iklan positif'
    ],
    skillsRequired: ['SEO', 'Google Ads', 'Meta Ads', 'Google Analytics', 'Keyword Research'],
    status: 'approved',
    isSuspicious: false,
    createdAt: new Date(Date.now() - 3600000 * 11).toISOString()
  }
];

const DEFAULT_PROFILE: JobSeekerProfile = {
  id: 'usr-1',
  title: 'Full Stack Web Developer',
  bio: 'Passionate software developer focusing on modern web interfaces, React 19, and cloud-native Node.js architectures. Love building AI micro-services.',
  skills: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'PostgreSQL'],
  experience: [
    {
      role: 'Junior Frontend Developer',
      company: 'Digital Karya Tech',
      duration: '2024 - 2025',
      description: 'Coded high-fidelity designs in React with Tailwind CSS. Collaborated on RESTful product APIs.'
    }
  ],
  education: [
    {
      school: 'Universitas Indonesia',
      degree: 'Bachelor of Computer Science',
      year: '2020 - 2024'
    }
  ],
  portfolio: [
    {
      title: 'DevCollab - Realtime Canvas',
      url: 'https://github.com/developer/devcollab'
    }
  ],
  cvText: `Feri Irawan
  Email: seeker@talenta.io
  Phone: +62 812-3456-7890
  
  SUMMARY:
  Front End Specialist transitioning into Full Stack Web Development. Proficient in React, Tailwind CSS, TypeScript, and Node.js. Enthusiastic about creating sleek responsive UI layouts with performance optimization.
  
  SKILLS:
  - Frontend: React, Redux, Tailwind CSS, Framer Motion, HTML, CSS
  - Backend: Node.js, Express, REST APIs, SQL (PostgreSQL/MySQL)
  - Tooling: Git, Vite, esbuild, Docker
  
  EXPERIENCE:
  - Junior Frontend Developer at Digital Karya Tech (2024 - 2025)
    Improved bundle download times by 30% using Vite tree-shaking and dynamic layouts.
    Developed 15+ micro interfaces for enterprise SaaS dash.
  
  EDUCATION:
  - Universitas Indonesia, Computer Science (GPA 3.82 / 4.0)`
};

const DEFAULT_APPLICATIONS: Application[] = [
  {
    id: 'app-1',
    jobId: 'job-2',
    applicantId: 'usr-1',
    applicantName: 'Feri Irawan',
    applicantTitle: 'Full Stack Web Developer',
    applicantSkills: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'PostgreSQL'],
    cvSummary: 'Feri displays robust frontend performance, particularly with Vite bundle tuning and Tailwind custom layout components. He matches several Mid-level requirements well.',
    status: 'pending',
    appliedAt: new Date(Date.now() - 3600000 * 24 * 1.5).toISOString(), // 36 hours ago
    anonymousMode: false,
    matchPercent: 78
  }
];

const DEFAULT_ANNOUNCEMENTS: CompanyAnnouncement[] = [
  {
    id: 'ann-1',
    companyId: 'co-2',
    companyName: 'Finverge Labs',
    title: 'Finverge Labs Closes $12M Series A Funding!',
    content: 'We are thrilled to announce that Finverge Labs has successfully secured $12M in Series A funding led by Sequoia India! This capital will accelerate our production of open-finance blockchain infrastructure, multi-signature corporate wallets, and expand our engineering hub in Singapore and Jakarta. We are actively hiring senior developers, UX specialists, and financial product managers to join our hybrid environment.',
    category: 'Milestone',
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString()
  },
  {
    id: 'ann-2',
    companyId: 'co-2',
    companyName: 'Finverge Labs',
    title: 'Our Clean Tech Initiative: Zero Carbon Transactions',
    content: 'At Finverge, we believe technology should empower both people and the planet. Starting this quarter, we are offsetting 100% of the computing charges for all our multi-asset wallet microservices. Our team is writing elegant, low-complexity algorithm architectures in Node and Rust to minimize ledger computation overhead. Join our development team to build modern banking systems that respect ecological limits!',
    category: 'Culture',
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  }
];

class DBManager {
  private state: DBState;

  constructor() {
    this.state = this.load();
  }

  private load(): DBState {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        let modified = false;
        // Ensure announcements exists (resilience migration guard)
        if (!parsed.announcements || !Array.isArray(parsed.announcements)) {
          parsed.announcements = DEFAULT_ANNOUNCEMENTS;
          modified = true;
        }
        // Ensure all default users exist and have correct passwords updated in the database
        if (!parsed.users) {
          parsed.users = [];
        }
        
        let hasFixedPasswords = false;
        parsed.users = parsed.users.map((u: any) => {
          const defaultUser = DEFAULT_USERS.find(du => du.id === u.id);
          if (defaultUser && defaultUser.password && u.password !== defaultUser.password) {
            hasFixedPasswords = true;
            return { ...u, password: defaultUser.password };
          }
          return u;
        });

        if (hasFixedPasswords) {
          modified = true;
        }

        if (parsed.users.length < DEFAULT_USERS.length) {
          const existingIds = new Set(parsed.users.map((u: any) => u.id));
          const toAdd = DEFAULT_USERS.filter(u => !existingIds.has(u.id));
          parsed.users = [...parsed.users, ...toAdd];
          modified = true;
        }
        // Ensure all 30 preloaded jobs + matching companies are merged/populated
        if (!parsed.jobs || parsed.jobs.length < 30) {
          parsed.jobs = DEFAULT_JOBS;
          parsed.companies = DEFAULT_COMPANIES;
          modified = true;
        }
        // Ensure chats exists and is robustly migrated with participant fields
        if (!parsed.chats || !Array.isArray(parsed.chats)) {
          parsed.chats = [];
          modified = true;
        } else {
          parsed.chats = parsed.chats.map((c: any) => {
            let chatModified = false;
            if (!c.seekerId) {
              c.seekerId = 'usr-1';
              chatModified = true;
            }
            if (!c.recruiterId) {
              c.recruiterId = 'usr-2';
              chatModified = true;
            }
            if (chatModified) {
              modified = true;
            }
            return c;
          });
        }
        if (modified) {
          this.saveState(parsed);
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load database. Restoring pre-seeded data...', e);
    }

    const defaultState: DBState = {
      users: DEFAULT_USERS,
      companies: DEFAULT_COMPANIES,
      jobs: DEFAULT_JOBS,
      seekerProfiles: {
        'usr-1': DEFAULT_PROFILE
      },
      applications: DEFAULT_APPLICATIONS,
      chats: [],
      announcements: DEFAULT_ANNOUNCEMENTS
    };
    this.saveState(defaultState);
    return defaultState;
  }

  private saveState(state: DBState) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  getUsers() { return this.state.users; }
  getCompanies() { return this.state.companies; }
  getJobs() { return this.state.jobs; }
  getApplications() { return this.state.applications; }
  getProfiles() { return this.state.seekerProfiles; }
  getChats() { return this.state.chats; }
  getAnnouncements() { return this.state.announcements || []; }

  save() {
    this.saveState(this.state);
  }

  // Setters & CRUD

  // --- Users CRUD ---
  addUser(user: User) {
    this.state.users.push(user);
    this.save();
  }

  updateUser(id: string, updates: Partial<User>) {
    const user = this.state.users.find(u => u.id === id);
    if (user) {
      const cleaned = Object.fromEntries(
        Object.entries(updates).filter(([_, v]) => v !== undefined)
      );
      Object.assign(user, cleaned);
      if (updates.companyId === "" || updates.companyId === null) {
        delete user.companyId;
      }
      this.save();
    }
  }

  deleteUser(id: string) {
    this.state.users = this.state.users.filter(u => u.id !== id);
    this.save();
  }

  updateProfile(userId: string, profile: JobSeekerProfile) {
    this.state.seekerProfiles[userId] = profile;
    this.save();
  }

  // --- Jobs CRUD ---
  addJob(job: Job) {
    this.state.jobs.push(job);
    this.save();
  }

  updateJob(jobId: string, updates: Partial<Job>) {
    const job = this.state.jobs.find(j => j.id === jobId);
    if (job) {
      const cleaned = Object.fromEntries(
        Object.entries(updates).filter(([_, v]) => v !== undefined)
      );
      Object.assign(job, cleaned);
      this.save();
    }
  }

  deleteJob(jobId: string) {
    this.state.jobs = this.state.jobs.filter(j => j.id !== jobId);
    this.save();
  }

  // --- Companies CRUD ---
  addCompany(company: Company) {
    this.state.companies.push(company);
    this.save();
  }

  updateCompany(companyId: string, updates: Partial<Company>) {
    const company = this.state.companies.find(c => c.id === companyId);
    if (company) {
      const cleaned = Object.fromEntries(
        Object.entries(updates).filter(([_, v]) => v !== undefined)
      );
      Object.assign(company, cleaned);
      // Sync name & logo updates to published jobs
      this.state.jobs.forEach(j => {
        if (j.companyId === companyId) {
          if (updates.name) j.companyName = updates.name;
          if (updates.logo) j.companyLogo = updates.logo;
        }
      });
      this.save();
    }
  }

  deleteCompany(companyId: string) {
    this.state.companies = this.state.companies.filter(c => c.id !== companyId);
    // Cascade-delete jobs belonging to the deleted company
    this.state.jobs = this.state.jobs.filter(j => j.companyId !== companyId);
    this.save();
  }

  verifyCompany(companyId: string, isVerified: boolean) {
    const company = this.state.companies.find(c => c.id === companyId);
    if (company) {
      company.isVerified = isVerified;
      this.save();
    }
  }

  // --- Announcements CRUD ---
  addAnnouncement(ann: CompanyAnnouncement) {
    if (!this.state.announcements) this.state.announcements = [];
    this.state.announcements.push(ann);
    this.save();
  }

  updateAnnouncement(id: string, updates: Partial<CompanyAnnouncement>) {
    if (!this.state.announcements) this.state.announcements = [];
    const item = this.state.announcements.find(a => a.id === id);
    if (item) {
      Object.assign(item, updates);
      this.save();
    }
  }

  deleteAnnouncement(id: string) {
    if (!this.state.announcements) this.state.announcements = [];
    this.state.announcements = this.state.announcements.filter(a => a.id !== id);
    this.save();
  }

  // --- Applications ---
  addApplication(app: Application) {
    this.state.applications.push(app);
    this.save();
  }

  updateApplicationStatus(appId: string, status: Application['status']) {
    const app = this.state.applications.find(a => a.id === appId);
    if (app) {
      app.status = status;
      this.save();
    }
  }

  addChatWebMessage(chatId: string, jobTitle: string, companyName: string, message: any) {
    let session = this.state.chats.find(c => c.id === chatId);
    if (!session) {
      // Find candidate and recruiter IDs dynamically to make user login state persistent
      const appId = chatId.startsWith('chat-accepted-') ? chatId.replace('chat-accepted-', '') : null;
      const application = appId ? this.state.applications.find(a => a.id === appId) : null;
      
      let candidateId = 'usr-1';
      let candidateName = 'Feri Irawan';
      let candidateAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
      
      if (application) {
        candidateId = application.applicantId;
        candidateName = application.applicantName;
        const u = this.state.users.find(usr => usr.id === candidateId);
        if (u) {
          candidateAvatar = u.avatar || candidateAvatar;
        }
      } else if (message.senderRole === 'seeker') {
        candidateId = message.senderId;
        candidateName = message.senderName;
        const u = this.state.users.find(usr => usr.id === candidateId);
        if (u) {
          candidateAvatar = u.avatar || candidateAvatar;
        }
      }

      let recruiterId = 'usr-2';
      let recruiterName = 'Sarah Connor';
      let recruiterAvatar = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80';

      if (message.senderRole === 'recruiter') {
        recruiterId = message.senderId;
        recruiterName = message.senderName;
        const u = this.state.users.find(usr => usr.id === recruiterId);
        if (u) {
          recruiterAvatar = u.avatar || recruiterAvatar;
        }
      } else {
        const job = application && this.state.jobs.find(j => j.id === application.jobId);
        const companyId = job ? job.companyId : null;
        const recUser = companyId ? this.state.users.find(usr => usr.role === 'recruiter' && usr.companyId === companyId) : null;
        if (recUser) {
          recruiterId = recUser.id;
          recruiterName = recUser.name;
          recruiterAvatar = recUser.avatar || recruiterAvatar;
        }
      }

      session = {
        id: chatId,
        jobTitle,
        companyName,
        otherPartyId: message.senderId === candidateId ? recruiterId : candidateId,
        otherPartyName: message.senderId === candidateId ? recruiterName : candidateName,
        otherPartyAvatar: message.senderId === candidateId ? recruiterAvatar : candidateAvatar,
        seekerId: candidateId,
        seekerName: candidateName,
        seekerAvatar: candidateAvatar,
        recruiterId: recruiterId,
        recruiterName: recruiterName,
        recruiterAvatar: recruiterAvatar,
        messages: []
      };
      this.state.chats.push(session);
    }
    session.messages.push(message);
    this.save();
    return session;
  }
}

export const db = new DBManager();
export { DEFAULT_PROFILE };

