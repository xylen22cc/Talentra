import { Job } from '../types';

export interface LocalizedJobFields {
  title: string;
  location: string;
  description: string;
  requirements: string[];
}

// Translations dictionary for the standard 1-30 jobs
const exactJobTranslations: Record<string, Record<'id' | 'en', LocalizedJobFields>> = {
  'job-1': {
    en: {
      title: "Senior Fullstack TypeScript Engineer",
      location: "Remote (APAC)",
      description: "We are looking for a remote developer to build high-scale cloud platforms using React, Node.js, and server-side TypeScript. In this role, you will implement modular microservices and real-time collaboration engines.",
      requirements: [
        "5+ years programming experience in React and Node.js",
        "Proven expertise with modern build systems and bundlers (Vite/Rspack)",
        "Excellent system design capability and database performance optimization skills"
      ]
    },
    id: {
      title: "Insinyur TypeScript Fullstack Senior",
      location: "Remote (APAC)",
      description: "Kami sedang mencari pengembang remote untuk membangun platform cloud berskala besar menggunakan React, Node.js, dan TypeScript sisi server. Dalam peran ini, Anda akan mengimplementasikan mikroservis modular dan mesin kolaborasi real-time.",
      requirements: [
        "5+ tahun pengalaman pemrograman di React dan Node.js",
        "Keahlian terbukti dengan sistem build modern dan bundler (Vite/Rspack)",
        "Kemampuan desain sistem yang sangat baik dan keterampilan optimasi kinerja database"
      ]
    }
  },
  'job-2': {
    en: {
      title: "Frontend Developer (React & Tailwind)",
      location: "Singapore / Hybrid",
      description: "Join Finverge to design and build transactional web dashboards for multi-asset wallets and ledger analytics. You will work in a fast-paced environment with a core stack of React 19, Tailwind CSS, and Framer Motion.",
      requirements: [
        "3+ years experience with React Hook form optimization",
        "Demonstrated high visual styling fidelity with Tailwind CSS",
        "Knowledge of state management such as Zustand or React Context"
      ]
    },
    id: {
      title: "Pengembang Frontend (React & Tailwind)",
      location: "Singapura / Hibrida",
      description: "Bergabunglah dengan Finverge untuk merancang dan membangun dasbor web transaksional untuk dompet multi-aset dan analitik buku besar. Anda akan bekerja di lingkungan yang serba cepat dengan teknologi utama React 19, Tailwind CSS, dan Framer Motion.",
      requirements: [
        "3+ tahun pengalaman dengan optimasi formulir React Hook",
        "Menunjukkan ketelitian tinggi dalam gaya visual menggunakan Tailwind CSS",
        "Pengetahuan tentang manajemen status seperti Zustand atau React Context"
      ]
    }
  },
  'job-3': {
    en: {
      title: "Urgent Remote Assistant - Weekly High Pay Payout",
      location: "Offshore Office / Immediate Start",
      description: "Immediate hiring for virtual marketing assistants. No prior skillset is required! Training fee of $50 must be wired to our platform wallet to unlock premium task dashboard instructions. High commission payouts daily.",
      requirements: [
        "Must have stable internet and a bank account",
        "Willing to pay $50 training/tooling unlock package up front",
        "Work only 1 hour per day and earn thousands"
      ]
    },
    id: {
      title: "Asisten Jarak Jauh Mendesak - Pembayaran Mingguan Tinggi",
      location: "Kantor Lepas Pantai / Mulai Segera",
      description: "Perekrutan segera untuk asisten pemasaran virtual. Tidak diperlukan keahlian sebelumnya! Biaya pelatihan sebesar $50 harus ditransfer ke dompet platform kami untuk membuka instruksi dasbor tugas premium. Pembayaran komisi tinggi setiap hari.",
      requirements: [
        "Harus memiliki internet stabil dan rekening bank",
        "Bersedia membayar $50 paket pembukaan pelatihan/alat di muka",
        "Bekerja hanya 1 jam per hari dan menghasilkan ribuan"
      ]
    }
  },
  'job-4': {
    en: {
      title: "Software Engineer - Backend Go & gRPC",
      location: "Jakarta, ID",
      description: "We are looking for a Backend Go Developer to optimize our on-demand services, maintain high request throughput, gRPC api endpoints, and large-scale SQL/NoSQL databases.",
      requirements: [
        "2+ years of work experience with Golang",
        "Understand REST API, gRPC, and protocol buffers",
        "Experienced with relational databases such as PostgreSQL and message brokers like Kafka"
      ]
    },
    id: {
      title: "Software Engineer - Backend Go & gRPC",
      location: "Jakarta, ID",
      description: "Kami sedang mencari Backend Go Developer untuk mengoptimalkan layanan on-demand kami, merawat request throughput tinggi, gRPC api endpoints, dan database SQL/NoSQL berskala besar.",
      requirements: [
        "2+ tahun pengalaman kerja dengan Golang",
        "Memahami REST API, gRPC, serta protocol buffers",
        "Berpengalaman dengan relational database seperti PostgreSQL dan message broker seperti Kafka"
      ]
    }
  },
  'job-5': {
    en: {
      title: "Senior Frontend Engineer (React/NextJS)",
      location: "Jakarta, ID / Hybrid",
      description: "Lead the development of Tokopedia's buyer website architecture using Next.js and optimize Core Web Vitals to increase user conversion and SEO performance.",
      requirements: [
        "5+ years experience in the JavaScript frontend ecosystem",
        "Deep expertise in SSR, SSG, Next.js module inheritance, and CSS optimization",
        "Mature leadership for mentoring junior developers"
      ]
    },
    id: {
      title: "Senior Frontend Engineer (React/NextJS)",
      location: "Jakarta, ID / Hibrida",
      description: "Pimpin pengembangan arsitektur website pembeli Tokopedia menggunakan Next.js dan optimasi Core Web Vitals untuk meningkatkan konversi pengguna dan performa SEO.",
      requirements: [
        "5+ tahun pengalaman dalam ekosistem frontend JavaScript",
        "Keahlian mendalam mengenai SSR, SSG, heritansi modul Next.js, dan optimasi CSS",
        "Leadership yang matang untuk mentoring junior developers"
      ]
    }
  },
  'job-6': {
    en: {
      title: "Mobile Developer - Flutter",
      location: "Jakarta, ID",
      description: "Build hotel search functionality and dynamic vacation ticket booking activities using Flutter for Android and iOS platforms.",
      requirements: [
        "Minimum of 2 years comparative experience using Flutter and Dart",
        "Familiar with Bloc or Provider state management",
        "Has released at least 1 app to the Play Store or App Store"
      ]
    },
    id: {
      title: "Mobile Developer - Flutter",
      location: "Jakarta, ID",
      description: "Membangun fungsionalitas pencarian hotel dan pemesanan aktivitas tiket liburan secara dinamis menggunakan Flutter untuk platform Android dan iOS.",
      requirements: [
        "Minimal 2 tahun pengalaman komparatif menggunakan Flutter dan Dart",
        "Familiar dengan state management Bloc atau Provider",
        "Pernah merilis minimal 1 aplikasi ke Play Store atau App Store"
      ]
    }
  },
  'job-7': {
    en: {
      title: "Junior Data Analyst",
      location: "Jakarta, ID",
      description: "Perform raw data cleaning, extract periodic operational performance metrics, and build visualization dashboards using Tableau or PowerBI.",
      requirements: [
        "Minimum Bachelor's degree (S1) in Statistics, Mathematics, or Information Systems",
        "Fluent in writing complex SQL queries (JOIN, Subqueries, CTEs)",
        "Basic familiarity with statistical communication in Python or R"
      ]
    },
    id: {
      title: "Junior Data Analyst",
      location: "Jakarta, ID",
      description: "Melakukan pembersihan data mentah, mengekstrak metrik performa operasional berkala, serta menyusun dashboard visualisasi menggunakan Tableau atau PowerBI.",
      requirements: [
        "Pendidikan minimal S1 Statistika, Matematika, atau Sistem Informasi",
        "Lancar dalam menulis query SQL kompleks (JOIN, Subqueries, CTEs)",
        "Familiaritas dasar berkomunikasi statistik dalam bahasa Python atau R"
      ]
    }
  },
  'job-8': {
    en: {
      title: "Cloud DevOps Practitioner",
      location: "Remote (Indonesia)",
      description: "Responsible for CI/CD pipeline automation, supervising Kubernetes orchestration clusters on Google Cloud, and monitoring system reliability for millions of users.",
      requirements: [
        "Outstanding understanding of Terraform, Ansible, and Docker",
        "GCP Professional Cloud Architect Certification is preferred",
        "Familiar with monitoring tools such as Prometheus and Grafana"
      ]
    },
    id: {
      title: "Cloud DevOps Practitioner",
      location: "Remote (Indonesia)",
      description: "Bertanggung jawab atas otomatisasi pipeline CI/CD, mengawasi klaster orkestrasi Kubernetes di Google Cloud, serta memantau keandalan sistem berskala jutaan user.",
      requirements: [
        "Pemahaman luar biasa tentang Terraform, Ansible, dan Docker",
        "Sertifikasi GCP Professional Cloud Architect lebih disukai",
        "Terbiasa dengan monitoring tools seperti Prometheus dan Grafana"
      ]
    }
  },
  'job-9': {
    en: {
      title: "Web Developer (PHP & Laravel)",
      location: "Bandung, ID / Remote",
      description: "Develop integrated Laravel 11 merchant operational systems and logistics inventory supporting neighborhood groceries (warungs).",
      requirements: [
        "Good understanding of OOP PHP and PSR compliance standards",
        "Minimum of 2 years active experience producing functional modules in Laravel",
        "Familiar with MySQL/MariaDB databases and REST backend integration"
      ]
    },
    id: {
      title: "Web Developer (PHP & Laravel)",
      location: "Bandung, ID / Remote",
      description: "Mengembangkan sistem operasional merchant dan inventori logistik penunjang warung-warung menggunakan framework Laravel 11 terintegrasi.",
      requirements: [
        "Paham OOP PHP dengan baik dan standar kepatuhan PSR",
        "Minimal 2 tahun pengalaman aktif memproduksi modul fungsional di Laravel",
        "Terbiasa dengan database MySQL/MariaDB dan integrasi REST backend"
      ]
    }
  },
  'job-10': {
    en: {
      title: "UI/UX Designer Expert",
      location: "Jakarta, ID",
      description: "Design wireframes, interactive user flows, and modern visual assets for our video streaming platform across Web, Mobile App, and Smart TV web kits.",
      requirements: [
        "Solid UI/UX design portfolio in Figma or Sketch",
        "Proficient in user research and usability testing on digital entertainment products",
        "Understand basic CSS/HTML for smooth coordination with frontend developers"
      ]
    },
    id: {
      title: "UI/UX Designer Expert",
      location: "Jakarta, ID",
      description: "Merancang wireframe, user flow interaktif, serta visual aset modern untuk platform streaming video kami di Web, Mobile App, dan Smart TV web kit.",
      requirements: [
        "Portofolio desain UI/UX solid di Figma atau Sketch",
        "Mahir melakukan user research dan usability testing pada produk hiburan digital",
        "Memahami basic CSS/HTML untuk koordinasi lancar dengan frontend developers"
      ]
    }
  },
  'job-11': {
    en: {
      title: "IT Corporate Security Lead",
      location: "Jakarta, ID",
      description: "Oversee network security posture audits, Mandiri digital banking infrastructure compliance, and secure financial transaction gateways from cyber exploits.",
      requirements: [
        "Bachelor's degree in Cybersecurity, Computer Science or equivalent competence",
        "Certified Information Systems Auditor (CISA) or CISSP certification",
        "Experienced with OJK banking regulations and ISO 27001 compliance"
      ]
    },
    id: {
      title: "IT Corporate Security Lead",
      location: "Jakarta, ID",
      description: "Mengawasi audit postur keamanan jaringan, kepatuhan infrastruktur perbankan digital Mandiri, serta mengamankan gateway transaksi keuangan dari eksploitasi siber.",
      requirements: [
        "Pendidikan S1 Informatika keamanan siber atau kompetensi setara",
        "Sertifikasi Certified Information Systems Auditor (CISA) atau CISSP",
        "Berpengalaman dengan regulasi perbankan OJK dan kepatuhan ISO 27001"
      ]
    }
  },
  'job-12': {
    en: {
      title: "Mobile Developer React Native",
      location: "Jakarta, ID / Hybrid",
      description: "Join the Shopee Pay core team to refine e-wallet payment interface components using React Native with run-time memory rendering optimization.",
      requirements: [
        "Deep expertise in TypeScript and React Native Native Bridges",
        "Familiar with Redux Saga or Toolkit for state synchronization",
        "Strong capability to craft responsive layouts across multi-device screens"
      ]
    },
    id: {
      title: "Mobile Developer React Native",
      location: "Jakarta, ID / Hibrida",
      description: "Bergabunglah di tim inti Shopee Pay untuk memoles komponen interface pembayaran e-wallet menggunakan React Native dengan optimalisasi runtime memory rendering.",
      requirements: [
        "Keahlian mendalam dalam TypeScript dan React Native Native Bridges",
        "Familiar dengan Redux Saga atau Toolkit untuk state synchronisation",
        "Kemampuan andal mematangkan visual layout responsif multi-device screen"
      ]
    }
  },
  'job-13': {
    en: {
      title: "Android Developer (Java/Kotlin)",
      location: "Jakarta, ID",
      description: "Create instant product interaction features, image reviews, and real-time logistics tracking on Tokopedia's native Android application.",
      requirements: [
        "Minimum 3 years of experience in native Android Kotlin development",
        "Understand Android Jetpack Components and MVVM architectural pattern",
        "Familiar with memory profiling using Android Studio tools"
      ]
    },
    id: {
      title: "Android Developer (Java/Kotlin)",
      location: "Jakarta, ID",
      description: "Ciptakan fitur interaksi produk instan, ulasan gambar, serta tracking ekspedisi logistik kurir real-time pada aplikasi native Android Tokopedia.",
      requirements: [
        "Minimal 3 tahun mengemban development native Android Kotlin",
        "Memahami Android Jetpack Components dan pola arsitektur MVVM",
        "Terbiasa melakukan profiling memori menggunakan Android Studio tools"
      ]
    }
  },
  'job-14': {
    en: {
      title: "iOS Platform Engineer",
      location: "Jakarta, ID",
      description: "Write robust code for the customer Gojek application in the iOS ecosystem using modern Swift, SwiftUI, and modern concurrency structures (async/await).",
      requirements: [
        "4+ years of writing native commercial iOS software",
        "Strong understanding of memory leaks management (retain cycles, ARC)",
        "Experience in TestFlight releases and App Store submissions"
      ]
    },
    id: {
      title: "iOS Platform Engineer",
      location: "Jakarta, ID",
      description: "Pahat kode tangguh untuk aplikasi Gojek pelanggan di ekosistem iOS menggunakan Swift modern, SwiftUI, serta struktur concurrency modern (async/await).",
      requirements: [
        "4+ tahun menulis program iOS native komersial",
        "Pemahaman kuat atas memory leaks management (retain cycles, ARC)",
        "Pengalaman rilis TestFlight dan App Store submission"
      ]
    }
  },
  'job-15': {
    en: {
      title: "Machine Learning Deep Learning Specialist",
      location: "Remote (Indonesia)",
      description: "Train banking credit risk prediction models, find financial transaction fraud, and NLP text document models with Python, PyTorch, and Docker.",
      requirements: [
        "Master's or PhD degree in Computer Science, Mathematics, Data Science or equivalent",
        "Hands-on experience training deep learning and classic machine learning models",
        "Proven skills deploying models to AWS SageMaker or GCP Vertex AI"
      ]
    },
    id: {
      title: "Machine Learning Deep Learning Specialist",
      location: "Remote (Indonesia)",
      description: "Latih model prediksi risiko kredit perbankan, deteksi fraud transaksi keuangan, serta model NLP teks berkas dengan Python, PyTorch, dan Docker.",
      requirements: [
        "Gelar S2/S3 bidang Ilmu Komputer, Matematika, Data Science atau setara",
        "Pengalaman hands-on melatih model deep learning dan machine learning klasik",
        "Keahlian mumpuni memicu deployment model ke AWS SageMaker atau GCP Vertex AI"
      ]
    }
  },
  'job-16': {
    en: {
      title: "Cloud Solutions Architect",
      location: "Singapore / Jakarta (Hybrid)",
      description: "Help global tier-1 enterprise clients architecture secure, reliable, and scalable applications over GCP platform infrastructure, focusing on serverless migrations.",
      requirements: [
        "8+ years cloud implementation consulting experience",
        "Active GCP Professional Cloud Security or Solutions Architect Certification",
        "Highly technical in complex networking topology, Kubernetes cluster federations, and IAM setups"
      ]
    },
    id: {
      title: "Cloud Solutions Architect",
      location: "Singapura / Jakarta (Hibrida)",
      description: "Bantu arsitektur klien perusahaan global tier-1 merancang aplikasi yang aman, andal, dan skalabel di atas infrastruktur platform GCP, dengan fokus pada migrasi serverless.",
      requirements: [
        "8+ tahun pengalaman konsultasi implementasi cloud",
        "Sertifikasi GCP Professional Cloud Security atau Solutions Architect yang Aktif",
        "Sangat teknis dalam topologi jaringan kompleks, federasi klaster Kubernetes, dan penyiapan IAM"
      ]
    }
  },
  'job-17': {
    en: {
      title: "Fullstack Laravel Developer (Kopi Kenangan App)",
      location: "Jakarta, ID",
      description: "Develop loyalty member systems, digital voucher ordering backends, and Kopi Kenangan point of sale (POS) ordering integrations across Indonesia.",
      requirements: [
        "Minimum 3 years experience developing Fullstack PHP Laravel and VueJS",
        "Mature experience with payment gateway integrations like MIDTRANS or XENDIT",
        "Familiar with Redis queue workers for asynchronous transactional jobs"
      ]
    },
    id: {
      title: "Fullstack Laravel Developer (Kopi Kenangan App)",
      location: "Jakarta, ID",
      description: "Mengembangkan sistem loyalty member, digital vouchers order backend, serta integrasi pemesanan point of sales (POS) Kopi Kenangan seluruh Indonesia.",
      requirements: [
        "Minimal 3 tahun berkecimpung mengembangkan Fullstack PHP Laravel dan VueJS",
        "Pengalaman matang integrasi payment gateway MIDTRANS atau XENDIT",
        "Familiar dengan Redis queue worker untuk asynchronous transactional jobs"
      ]
    }
  },
  'job-18': {
    en: {
      title: "QA Automation Engineer",
      location: "Jakarta, ID",
      description: "Write comprehensive end-to-end (E2E) automated testing scripts using Cypress or Selenium to secure the checkout web performance from any bugs.",
      requirements: [
        "2+ years experience working as a QA Engineer focusing on automated testing",
        "Strong coding capability using JavaScript, TypeScript, or Python",
        "Has designed integration test plans connected with Jenkins / CI-CD pipeline"
      ]
    },
    id: {
      title: "QA Automation Engineer",
      location: "Jakarta, ID",
      description: "Menulis skrip uji otomatisasi komprehensif (E2E) menggunakan Cypress atau Selenium untuk memastikan kestabilan web checkout dari aneka bug.",
      requirements: [
        "2+ tahun pengalaman bekerja sebagai QA Engineer fokus otomatisasi uji",
        "Kemampuan coding andal menggunakan JavaScript, TypeScript, atau Python",
        "Pernah merancang integration test plan terhubung dengan Jenkins / CI pipeline"
      ]
    }
  },
  'job-19': {
    en: {
      title: "Lead Product Manager - Core Transactions",
      location: "Jakarta, ID",
      description: "Steer product vision, release strategy, and cross-functional coordination (Engineering, Business, Design) for checkout cart core Tokopedia merchant transactions.",
      requirements: [
        "5+ years of successful track record as a Product Manager in Fintech / E-commerce sectors",
        "Advanced data analytical skills (SQL, Google Analytics, Amplitude)",
        "Strong diplomatic communication to lobby business requirements into functional designs"
      ]
    },
    id: {
      title: "Lead Product Manager - Core Transactions",
      location: "Jakarta, ID",
      description: "Nakhodai visi produk, strategi rilis, serta kordinasi lintas fungsional (Engineering, Business, Design) untuk checkout cart core Tokopedia merchant transactions.",
      requirements: [
        "5+ tahun rekam jejak sukses sebagai Product Manager di sektor Fintech / E-commerce",
        "Kemampuan analitis data (SQL, Google Analytics, Amplitude) tingkat lanjut",
        "Komunikasi diplomatis andal melobi business requirements menjadi functional design"
      ]
    }
  },
  'job-20': {
    en: {
      title: "Database Administrator DBA Specialist",
      location: "Jakarta, ID / On-site",
      description: "Responsible for Mandiri database backups, high-availability data replication, slow query optimization, and installing Oracle/Postgres database security patches.",
      requirements: [
        "Bachelor's degree in Informatics Engineering or Information Systems",
        "Mastering server setups for Oracle Database, Microsoft SQL Server, or PostgreSQL",
        "Understand failover cluster architectures, large table partitioning, and index optimization"
      ]
    },
    id: {
      title: "Database Administrator DBA Specialist",
      location: "Jakarta, ID / On-site",
      description: "Bertanggung jawab melakukan backup database Mandiri, replikasi data high-availability, optimasi query lambat, serta instalasi patch keamanan Oracle/Postgres db.",
      requirements: [
        "S1 Teknik Informatika/Sistem Informasi",
        "Menguasai setup server Oracle Database, Microsoft SQL Server, atau PostgreSQL",
        "Memahami arsitektur failover cluster, partisi tabel besar, serta optimasi indeks"
      ]
    }
  },
  'job-21': {
    en: {
      title: "Frontend Developer (Angular / Vue)",
      location: "Singapore / Hybrid",
      description: "Contract base developer to collaborate with back office ledger migration dashboard UI using Angular 17. Maintain high performance grid rendering.",
      requirements: [
        "At least 3 years commercial Angular experience",
        "Great implementation of RXJS, state management, and unit testing using Jasmine/Karma",
        "Fluency in English team discussions is mandatory"
      ]
    },
    id: {
      title: "Frontend Developer (Angular / Vue)",
      location: "Singapura / Hibrida",
      description: "Pengembang berbasis kontrak untuk berkolaborasi dengan dasbor migrasi buku besar kantor belakang menggunakan Angular 17. Pertahankan rendering grid performa tinggi.",
      requirements: [
        "Minimal 3 tahun pengalaman Angular komersial",
        "Implementasi RXJS, manajemen status, dan pengujian unit yang hebat menggunakan Jasmine/Karma",
        "Kefasihan dalam diskusi tim bahasa Inggris adalah wajib"
      ]
    }
  },
  'job-22': {
    en: {
      title: "Developer Technical Writer Specialist",
      location: "Remote (APAC)",
      description: "Draft, polish, and synthesize developer-facing tutorial guides, API schemas, and installation guides for Google Cloud Platform SDK integration plugins.",
      requirements: [
        "Outstanding technical writing portfolio in English (Markdown format)",
        "Basic capabilities of reading multi-programming language snippets (Java, Go, Python, TypeScript)",
        "Passionate about translating complex architectural systems into friendly clear tutorials"
      ]
    },
    id: {
      title: "Developer Technical Writer Specialist",
      location: "Remote (APAC)",
      description: "Buat, perbaiki, dan sintesis panduan tutorial ramah pengembang, skema API, dan panduan instalasi untuk plugin integrasi Google Cloud Platform SDK.",
      requirements: [
        "Portofolio penulisan teknis yang luar biasa dalam bahasa Inggris (format Markdown)",
        "Kemampuan dasar membaca cuplikan kode multi-bahasa pemrograman (Java, Go, Python, TypeScript)",
        "Sangat bersemangat menerjemahkan sistem arsitektur kompleks menjadi tutorial yang ramah dan jelas"
      ]
    }
  },
  'job-23': {
    en: {
      title: "Senior Live Streaming Systems Engineer",
      location: "Jakarta, ID",
      description: "Develop ultra-low latency video delivery pipeline for national football broadcasts on Vidio, utilizing WebRTC, HLS, RTMP, and CDN scaling protocols.",
      requirements: [
        "5+ years of solid track record in video encoding / streaming systems pipeline",
        "Deep understanding of FFmpeg, H.264/H.265 codecs, DASH, and WebRTC protocols",
        "Familiar with Go, C++, Rust or Java for media server backend optimization"
      ]
    },
    id: {
      title: "Senior Live Streaming Systems Engineer",
      location: "Jakarta, ID",
      description: "Kembangkan video delivery pipeline latensi super rendah untuk saluran siaran sepak bola nasional Vidio, memanfaatkan protokol WebRTC, HLS, rtmp, serta CDN scaling.",
      requirements: [
        "5+ tahun rekam jejak solid di ranah video encoding / streaming systems",
        "Paham mendalam atas FFmpeg, H.264/H.265 codecs, DASH, dan WebRTC protocols",
        "Familiar dengan Go, C++, Rust atau Java untuk optimalisasi media server backend"
      ]
    }
  },
  'job-24': {
    en: {
      title: "Social Media & Content Creator Lead",
      location: "Jakarta, ID / On-site",
      description: "Create creative viral digital campaign ideas to promote Kopi Kenangan's new menu, make interactive TikTok/Instagram reels videos, and collaborate with influencers.",
      requirements: [
        "Bachelor's degree in Communication/Marketing/DKV or equivalent experience",
        "Creative TikTok/Reels video portfolio with high engagement rates",
        "Strong phone editing skills or fast video editing in Adobe Premiere"
      ]
    },
    id: {
      title: "Social Media & Content Creator Lead",
      location: "Jakarta, ID / On-site",
      description: "Buat ide-ide kampanye digital kreatif yang viral untuk mempromosikan menu baru Kopi Kenangan, membuat video TikTok/Instagram reels interaktif, dan berkolaborasi bersama influencer.",
      requirements: [
        "Min S1 Jurusan Komunikasi/Marketing/DKV atau pengalaman setara",
        "Portofolio video TikTok/Reels kreatif dengan tingkat interaksi tinggi",
        "Kemampuan editing video cepat di handphone / Adobe Premiere"
      ]
    }
  },
  'job-25': {
    en: {
      title: "Scrum Master / Technical Delivery Agile Lead",
      location: "Jakarta, ID",
      description: "Facilitate sprint planning, daily standups, unblocking developers, and polishing team communications to deliver accommodations & hotel features on schedule.",
      requirements: [
        "Scrum Alliance certification (CSM / PSM I) is a big plus",
        "Experience architecting product delivery timelines spans at least 2 years",
        "Highly fluent using JIRA, Confluence, and defect tracking systems"
      ]
    },
    id: {
      title: "Scrum Master / Technical Delivery Agile Lead",
      location: "Jakarta, ID",
      description: "Fasilitasi sprint planning, standups harian, membuang hambatan developer, serta memoles komunikasi tim agar delivery siklus fitur hotel & akomodasi berjalan tepat waktu.",
      requirements: [
        "Sertifikasi Scrum Alliance (CSM / PSM I) adalah nilai tambah besar",
        "Pernah mengarsiteki delivery timeline produk berdurasi minimal 2 tahun",
        "Sangat fasih menggunakan JIRA, Confluence, dan tools pelacak defect"
      ]
    }
  },
  'job-26': {
    en: {
      title: "Group HR Talent Acquisition Lead",
      location: "Jakarta, ID",
      description: "Steer GoTo's strategic national tech recruitment talent program (Engineering & Product). Develop university partnerships and global internship programs.",
      requirements: [
        "5+ years experience leading recruiter teams in hypergrowth or giant entities",
        "Sufficient network to build stable talent pipelines in Software Engineering",
        "Familiar with ultra-modern Applicant Tracking System (ATS) tools like Greenhouse"
      ]
    },
    id: {
      title: "Group HR Talent Acquisition Lead",
      location: "Jakarta, ID",
      description: "Nakhodai program talenta rekrutmen teknologi strategis (Engineering & Product) skala nasional GoTo. Kembangkan kemitraan universitas dan program magang global.",
      requirements: [
        "5+ tahun pengalaman memimpin tim rekruter di regional skala besar / hypergrowth",
        "Kemampuan menjalin talent pipeline andal di ranah Software Engineering",
        "Terbiasa dengan tools Applicant Tracking System (ATS) mutakhir seperti Greenhouse"
      ]
    }
  },
  'job-27': {
    en: {
      title: "Senior Golang Backend Platform Engineer",
      location: "Jakarta, ID",
      description: "Craft robust backend coupon systems for Shopee monthly double-day campaigns capable of swallowing hundreds of thousands of QPS, using Golang concurrency patterns.",
      requirements: [
        "5+ years of backend commercial software expertise in Golang / C++",
        "Excellent grasp of distributed systems, load balancers, SQL db partitions, and Redis caching",
        "Tough at solving concurrency race conditions utilizing deep profiling goroutines"
      ]
    },
    id: {
      title: "Senior Golang Backend Platform Engineer",
      location: "Jakarta, ID",
      description: "Pahat sistem backend voucher kampanye puncak bulanan Shopee yang andal menelan trafik ratusan ribu QPS, mengedepankan efisiensi konkurensi di Golang.",
      requirements: [
        "5+ tahun keahlian backend komersial di Golang / C++",
        "Pemahaman mumpuni sistem terdistribusi, load balancer, partisi database SQL dan caching Redis",
        "Tangguh memecahkan masalah concurrency race condition menggunakan goroutines Profiling"
      ]
    }
  },
  'job-28': {
    en: {
      title: "Data & ETL Integration Infrastructure Engineer",
      location: "Jakarta, ID",
      description: "Build secondary ETL/ELT big data processing pipeline worth tens of terabytes with Apache Spark, Airflow, Kafka, and Snowflake data warehouse.",
      requirements: [
        "3+ years experience working in Data Engineering / ETL sectors",
        "Great expertise compiling transform logic with Apache Spark, Python or Scala",
        "Familiar compiling DAG scheduler data pipelines in Apache Airflow"
      ]
    },
    id: {
      title: "Data & ETL Integration Infrastructure Engineer",
      location: "Jakarta, ID",
      description: "Membangun pipeline ETL/ELT pengolahan sekunder big data bernilai puluhan terabyte dengan Apache Spark, Airflow, Kafka, dan data warehouse Snowflake.",
      requirements: [
        "3+ tahun bekerja di ranah Data Engineering / ETL",
        "Keahlian mumpuni menulis transform logic dengan Apache Spark, Python atau Scala",
        "Familiar merangkai dag penjadwalan data pipeline di Apache Airflow"
      ]
    }
  },
  'job-29': {
    en: {
      title: "Admin Executive & Office Intern",
      location: "Jakarta, ID",
      description: "Refresh your organizational competencies! Help file office administrative records, coordinate facility inventories, and accommodate regional team general necessities.",
      requirements: [
        "Active student or fresh graduate from any major (Administration / PR preferred)",
        "Meticulous, neat arrangement of digital files, proficient in Google Docs / Google Sheets",
        "Has assertive interpersonal skills that are polite, welcoming, and helpful"
      ]
    },
    id: {
      title: "Admin Executive & Office Intern",
      location: "Jakarta, ID",
      description: "Segarkan kecakapan organisasimu! Bantu menyusun berkas administratif kantor, mengkoordinir inventaris fasilitas, serta akomodasi kebutuhan umum tim regional.",
      requirements: [
        "Mahasiswa aktif / Fresh Graduate dari semua jurusan (Administrasi / Komunikasi lebih disukai)",
        "Teliti, rapi dalam penataan folder digital, mahir Google Docs / Google Sheets",
        "Memiliki interpersonal asertif yang sopan dan ramah"
      ]
    }
  },
  'job-30': {
    en: {
      title: "Digital Marketing & SEO Coordinator",
      location: "Jakarta, ID",
      description: "Boost organic search engagement of Kopi Kenangan website, manage paid digital search ads campaigns (Google Ads, Meta Ads) to boost mobile application downloads.",
      requirements: [
        "2+ years scaling SEO Off-page/On-page & performance marketing",
        "Proficient analyzing Google Search Console, SEMrush, and Google Analytics GA4",
        "Strong capability compiling potential culinary keyword research with positive ROI"
      ]
    },
    id: {
      title: "Digital Marketing & SEO Coordinator",
      location: "Jakarta, ID",
      description: "Tingkatkan kunjungan pencarian organik website Kopi Kenangan, kelola kampanye digital marketing ads berbayar (Google Ads, Meta Ads) untuk mendongkrak unduh aplikasi mobile.",
      requirements: [
        "2+ tahun berkarier mengelola SEO Off-page/On-page & performance marketing",
        "Mahir menganalisa Google Search Console, SEMrush, dan Google Analytics GA4",
        "Kemampuan andal riset keyword kuliner potensial dengan ROI iklan positif"
      ]
    }
  },
  'job-31': {
    en: {
      title: "Senior Graphic Designer",
      location: "Jakarta, ID (WFO)",
      description: "Lead the design of creative graphic assets for Kopi Kenangan brand, retail menus, social media visuals, and national seasonal campaign activations.",
      requirements: [
        "Minimum 5 years working as a Graphic Designer/Art Director in creative agencies or F&B brands",
        "Strong skill mastering Adobe Illustrator, Photoshop, and print layouting softwares",
        "Possess visual communication skills that align with modern product visual guidelines"
      ]
    },
    id: {
      title: "Senior Graphic Designer",
      location: "Jakarta, ID (WFO)",
      description: "Pimpin perancangan aset grafis kreatif untuk brand Kopi Kenangan, menu retail, visual media sosial, serta aktivasi kampanye musiman berskala nasional.",
      requirements: [
        "Minimal 5 tahun bekerja sebagai Graphic Designer/Art Director di agensi kreatif atau brand F&B",
        "Kemampuan mumpuni menguasai Adobe Illustrator, Photoshop, dan software layouting cetak",
        "Memiliki keahlian komunikasi visual yang selaras dengan panduan identitas visual produk modern"
      ]
    }
  },
  'job-32': {
    en: {
      title: "Video Editor & Animator",
      location: "Remote (Indonesia)",
      description: "Edit original content footages, interesting movie trailers, and release animated promotional promo micro-videos on Vidio streaming platform to attract hundreds of thousands of active viewers.",
      requirements: [
        "3+ years experience editing commercial or broadcasting video formats",
        "Proficient using Adobe Premiere Pro, After Effects, or DaVinci Resolve",
        "Has dynamic video portfolio demonstrating high quality transition systems and sound design"
      ]
    },
    id: {
      title: "Video Editor & Animator",
      location: "Remote (Indonesia)",
      description: "Edit cuplikan konten original, trailer film menarik, serta rilis animasi promo micro-video di Vidio platform streaming untuk menarik minat ratusan ribu penonton aktif.",
      requirements: [
        "3+ tahun pengalaman mengedit video komersil atau penyiaran (broadcasting)",
        "Mahir menggunakan Adobe Premiere Pro, After Effects, atau DaVinci Resolve",
        "Memiliki portfolio video dinamis dengan teknik transisi dan sound design berkualitas"
      ]
    }
  },
  'job-33': {
    en: {
      title: "Creative Copywriter",
      location: "Remote (Indonesia)",
      description: "Write creative promotional copies for Tokopedia banners, promo landing pages, and email subjects to drive daily transactions engagement.",
      requirements: [
        "Minimum 2 years as a copywriter in top e-commerce industries or advertising agencies",
        "Expertise crafting persuasive copy that is user-friendly, both formal and informal",
        "Understand basic digital consumer psychology and click-through metrics"
      ]
    },
    id: {
      title: "Copywriter Kreatif",
      location: "Remote (Indonesia)",
      description: "Buat teks promosi kreatif (copywriting) untuk kampanye banner Tokopedia, landing pages promo bulanan, serta subject email guna mendorong interaksi transaksi harian.",
      requirements: [
        "Minimal 2 tahun sebagai copywriter di industri e-commerce atau agensi pengiklan papan atas",
        "Keahlian mumpuni meramu bahasa persuasif yang ramah pengguna, baik formal maupun informal",
        "Faham dasar psikologi konsumen digital dan metrik rasio klik tayang iklan berkala"
      ]
    }
  },
  'job-34': {
    en: {
      title: "UI/UX Motion Illustrator",
      location: "Jakarta, ID / Hybrid",
      description: "Design micro interactive illustrations and functional interface animations for Traveloka platform to enrich hotel reservations and flight tickets booking transactions.",
      requirements: [
        "3+ years experience in digital product illustration or vector animation roles",
        "Mastering Lottie format, After Effects, SVG animation, and visual design with Figma",
        "Provide a link to interactive interface illustrations portfolio"
      ]
    },
    id: {
      title: "UI/UX Motion Illustrator",
      location: "Jakarta, ID / Hibrida",
      description: "Desain ilustrasi interaktif mikro dan animasi fungsional antarmuka platform Traveloka guna memperkaya keindahan bertransaksi tiket liburan dan reservasi hotel.",
      requirements: [
        "3+ tahun pengalaman berkarier di bidang ilustrasi produk digital atau vector animation",
        "Menguasai format Lottie, After Effects, SVG animation, dan visual design dengan Figma",
        "Menyertakan link portfolio ilustrasi interaktif antarmuka yang modern"
      ]
    }
  },
  'job-35': {
    en: {
      title: "Creative Director",
      location: "Jakarta, ID (WFO)",
      description: "Steer full creative vision for Vidio original series productions, supervising scripts, cinematography, aesthetics, and graphic designers team.",
      requirements: [
        "8+ years of track record in television broadcasting, cinema, or global advertising agencies",
        "Strong leadership coordinating cross-functional teams (creative, production, styling)",
        "Incredibly sharp visual instinct, award-winning in creative industry is a huge plus"
      ]
    },
    id: {
      title: "Creative Director",
      location: "Jakarta, ID (WFO)",
      description: "Nakhodai visi kreatif menyeluruh untuk produksi video serial orisinal Vidio, mengawasi naskah drama, sinematografi, estetika, serta pimpinan tim desainer grafis.",
      requirements: [
        "8+ tahun rekam jejak industri televisi, perfilman, atau agensi periklanan global",
        "Kepemimpinan kuat mengoordinasikan tim lintas fungsional (creative, production, styling)",
        "Insting visual yang sangat tajam dan pemenang penghargaan industri kreatif adalah nilai tambah"
      ]
    }
  }
};

// General fallback vocab mappings for words/phrases matching
const phraseDictENtoID: Array<{ search: RegExp | string; replace: string }> = [
  { search: /We are looking for/gi, replace: "Kami sedang mencari" },
  { search: /Join our team/gi, replace: "Bergabunglah dengan tim kami" },
  { search: /experience of/gi, replace: "pengalaman" },
  { search: /experience in/gi, replace: "pengalaman dalam" },
  { search: /years experience/gi, replace: "tahun pengalaman" },
  { search: /years of experience/gi, replace: "tahun pengalaman" },
  { search: /Bachelor's degree/gi, replace: "Gelar S1" },
  { search: /Master's degree/gi, replace: "Gelar S2" },
  { search: /Strong understanding of/gi, replace: "Pemahaman kuat tentang" },
  { search: /Excellent communication/gi, replace: "Komunikasi luar biasa" },
  { search: /Remote \(Indonesia\)/gi, replace: "Remote (Indonesia)" },
  { search: /Remote/gi, replace: "Remote" },
  { search: /Hybrid/gi, replace: "Hibrida" },
  { search: /On-site/gi, replace: "Di tempat (On-site)" },
  { search: /Singapore/gi, replace: "Singapura" }
];

const phraseDictIDtoEN: Array<{ search: RegExp | string; replace: string }> = [
  { search: /Kami sedang mencari/gi, replace: "We are looking for" },
  { search: /Bergabunglah dengan tim/gi, replace: "Join the team" },
  { search: /pengalaman kerja/gi, replace: "work experience" },
  { search: /pengalaman dalam/gi, replace: "experience in" },
  { search: /tahun pengalaman/gi, replace: "years experience" },
  { search: /Pendidikan minimal S1/gi, replace: "Minimum Bachelor's degree (S1)" },
  { search: /Pendidikan S1/gi, replace: "Bachelor's degree (S1)" },
  { search: /Pemahaman kuat atas/gi, replace: "Strong understanding of" },
  { search: /Keahlian dalam/gi, replace: "Expertise in" },
  { search: /Jarak Jauh/gi, replace: "Remote" },
  { search: /Jarak jauh \(Indonesia\)/gi, replace: "Remote (Indonesia)" },
  { search: /Hibrida/gi, replace: "Hybrid" },
  { search: /Singapura/gi, replace: "Singapore" }
];

// Heuristics to analyze text language
function isIndonesian(text: string): boolean {
  const commonID = /\b(kami|dengan|untuk|yang|adalah|dalam|pengalaman|tahun|serta|pimpin|kerja|memiliki|bisa|atau|dan)\b/i;
  return commonID.test(text);
}

// Fallback dynamic text translator using mappings
function translateTextFallback(text: string, targetLang: 'id' | 'en'): string {
  if (!text) return "";
  const sourceIsID = isIndonesian(text);

  if (targetLang === 'id' && !sourceIsID) {
    // EN -> ID
    let translated = text;
    for (const rule of phraseDictENtoID) {
      translated = translated.replace(rule.search, rule.replace);
    }
    return translated;
  } else if (targetLang === 'en' && sourceIsID) {
    // ID -> EN
    let translated = text;
    for (const rule of phraseDictIDtoEN) {
      translated = translated.replace(rule.search, rule.replace);
    }
    return translated;
  }
  return text;
}

/**
 * Localizes a Job model on-the-fly dynamically
 */
export function localizeJob(job: Job, lang: 'id' | 'en'): Job {
  if (!job) return job;

  // 1. Check if we have exact handcoded translations
  const exact = exactJobTranslations[job.id];
  if (exact && exact[lang]) {
    return {
      ...job,
      title: exact[lang].title,
      location: exact[lang].location,
      description: exact[lang].description,
      requirements: exact[lang].requirements
    };
  }

  // 2. Otherwise apply smart heuristics / fallbacks
  // Translate title
  let localizedTitle = job.title;
  if (lang === 'id') {
    if (job.title.includes('Senior')) {
      localizedTitle = job.title.replace('Senior', '').trim() + ' Senior';
    }
    localizedTitle = localizedTitle
      .replace('Engineer', 'Insinyur')
      .replace('Developer', 'Pengembang')
      .replace('Practitioner', 'Praktisi')
      .replace('Director', 'Direktur')
      .replace('Specialist', 'Spesialis')
      .trim();
  } else {
    localizedTitle = localizedTitle
      .replace('Kreatif', 'Creative')
      .replace('Pengembang', 'Developer')
      .replace('Insinyur', 'Engineer')
      .replace('Praktisi', 'Practitioner')
      .replace('Direktur', 'Director')
      .replace('Spesialis', 'Specialist')
      .trim();
  }

  // Location translation
  let localizedLocation = job.location;
  if (lang === 'id') {
    localizedLocation = localizedLocation
      .replace('Singapore', 'Singapura')
      .replace('Remote', 'Remote')
      .replace('Hybrid', 'Hibrida')
      .replace('On-site', 'Di tempat');
  } else {
    localizedLocation = localizedLocation
      .replace('Singapura', 'Singapore')
      .replace('Hibrida', 'Hybrid')
      .replace('Di tempat', 'On-site');
  }

  // Fallback sentence translation for description and requirements
  const localizedDescription = translateTextFallback(job.description, lang);
  const localizedRequirements = (job.requirements || []).map(req => translateTextFallback(req, lang));

  return {
    ...job,
    title: localizedTitle,
    location: localizedLocation,
    description: localizedDescription,
    requirements: localizedRequirements
  };
}
