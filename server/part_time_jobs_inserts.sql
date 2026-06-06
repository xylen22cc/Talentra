-- =========================================================================
-- SEED DATA BARU (5 LOWONGAN KERJA PART-TIME SESUAI FILTER KATEGORI)
-- Sektor: Non-IT Business, Operations, Admin, Support, Creative & Multimedia
-- Format: JSONB arrays untuk kolom 'requirements' dan 'skills_required'
-- Generated at: 2026-05-21T03:10:20.725Z
-- =========================================================================

-- BERIKUT ADALAH QUERY SQL UNTUK SUPABASE SQL EDITOR:
-- -------------------------------------------------------------------------
INSERT INTO public.jobs (id, title, company_id, company_name, company_logo, location, salary_range, job_type, experience_level, description, requirements, skills_required, status, is_suspicious, suspicious_reason, created_at) VALUES
('job-86', 'Part-time Graphic Designer & Illustrator', 'co-5', 'Tokopedia', 'https://images.unsplash.com/photo-1563013544-824ae1d704d3?w=100&auto=format&fit=crop&q=60', 'Jakarta, ID / Hybrid', 'Rp 4.500.000 - Rp 6.500.000 / month', 'Part-time', 'Entry Level', 'Bantu tim kreatif Tokopedia dalam merancang aset visual banner promosi, dekorasi merchant, serta ilustrasi media sosial berkualitas tinggi untuk kampanye musiman resmi.', '["Mahasiswa aktif tingkat akhir atau fresh-graduate Jurusan Desain Komunikasi Visual (DKV) / Seni Rupa","Menguasai Adobe Illustrator, Photoshop, dan software vector editing lainnya secara piawai","Portofolio ilustrasi kreatif dengan skema estetika yang modern, minimalis, dan harmonis"]'::jsonb, '["Graphic Design","Adobe Illustrator","Vector Illustration","Creative Design","Brand Identity"]'::jsonb, 'approved', false, NULL, '2026-05-21T03:10:00.000Z'),
('job-87', 'Part-time Customer Support (Weekend Shift)', 'co-9', 'Shopee Indonesia', 'https://images.unsplash.com/photo-1472851294608-062f824d296e?w=100&auto=format&fit=crop&q=60', 'Remote (Indonesia)', 'Rp 3.500.000 - Rp 5.000.000 / month', 'Part-time', 'Entry Level', 'Menjawab pertanyaan serta membantu penanganan kendala transaksi pengguna Shopee secara sopan, cepat, dan solutif pada hari Sabtu dan Minggu (jam kerja fleksibel).', '["Memiliki kemampuan komunikasi tertulis yang berempati, adaptif, serta ramah pengguna","Memiliki perangkat laptop pribadi yang memadai dan koneksi jaringan internet mandiri yang stabil","Mampu bekerja di bawah target kepuasan pelanggan serta cepat mempelajari menu aplikasi internal"]'::jsonb, '["Customer Support","Empathy & Active Listening","Fast Typing","Problem Solving","Zendesk Basics"]'::jsonb, 'approved', false, NULL, '2026-05-21T03:12:00.000Z'),
('job-88', 'Part-time Social Media Content & Barista', 'co-12', 'Kopi Kenangan', 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=100&auto=format&fit=crop&q=60', 'Jakarta, ID (WFO)', 'Rp 3.000.000 - Rp 4.500.000 / month', 'Part-time', 'Entry Level', 'Gabungkan hasrat kopimu dengan kreasi digital! Layani pesanan retail Kopi Kenangan di kedai sembari memproduksi konten micro-video aesthetic untuk kanal media sosial toko.', '["Sangat menyukai interaksi langsung dengan pelanggan (F&B hospitality) & pembuatan konten visual TikTok/Reels","Memiliki akun media sosial menarik dan mengerti cara mengedit transisi video pendek di smartphone","Disiplin waktu yang tinggi, komunikatif, percaya diri tampil di depan kamera"]'::jsonb, '["Barista Craftsmanship","Video Editing (CapCut)","Social Media Content Creation","Customer Engagement","F&B Service"]'::jsonb, 'approved', false, NULL, '2026-05-21T03:14:00.000Z'),
('job-89', 'Part-time Office Administration Assistant', 'co-10', 'Bukalapak', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=100&auto=format&fit=crop&q=60', 'Bandung, ID (WFO)', 'Rp 3.500.000 - Rp 5.000.000 / month', 'Part-time', 'Entry Level', 'Bantu koordinasi operasional tim HR & Admin mitra Bukalapak Bandung untuk pengarsipan lembaran invoice fisik, input presensi harian karyawan, serta pengaturan stok inventaris pantry.', '["Pendidikan minimal Diploma (D3) atau Sarjana (S1) yang sedang menempuh masa akhir studi","Lancar menggunakan Google Suite terkhusus Google Docs, Sheets, serta formulir digital","Sangat rapi, teliti mengorganisasi berkas, serta proaktif menerima tugas-tugas administratif"]'::jsonb, '["Google Sheets & Docs","Data Entry","Archiving","Office Administration Support","Highly Organized"]'::jsonb, 'approved', false, NULL, '2026-05-21T03:16:00.000Z'),
('job-90', 'Part-time Video Editor for Original Content', 'co-11', 'Vidio', 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=100&auto=format&fit=crop&q=60', 'Remote (Indonesia)', 'Rp 4.000.000 - Rp 6.000.000 / month', 'Part-time', 'Mid Level', 'Sunting klip promosi film berseri, cuts klip highlight sepak bola, serta materi visual kampanye original content platform streaming Vidio agar menarik jutaan penonton.', '["Min. 2 tahun pengalaman secara mandiri sebagai freelance or part-time Video Editor","Menguasai software industri seperti Adobe Premiere Pro, After Effects, dan audio mixing dasar","Paham ritme editing (pacing) aksi, olahraga, drama, serta menyertakan link portofolio terbaik"]'::jsonb, '["Video Editing","Adobe Premiere Pro","After Effects","Editing Pacing","Promo Content Cuts"]'::jsonb, 'approved', false, NULL, '2026-05-21T03:18:00.000Z')
ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title, 
  company_id = EXCLUDED.company_id, 
  company_name = EXCLUDED.company_name, 
  company_logo = EXCLUDED.company_logo, 
  location = EXCLUDED.location, 
  salary_range = EXCLUDED.salary_range, 
  job_type = EXCLUDED.job_type, 
  experience_level = EXCLUDED.experience_level, 
  description = EXCLUDED.description, 
  requirements = EXCLUDED.requirements, 
  skills_required = EXCLUDED.skills_required, 
  status = EXCLUDED.status, 
  is_suspicious = EXCLUDED.is_suspicious, 
  suspicious_reason = EXCLUDED.suspicious_reason, 
  created_at = EXCLUDED.created_at;