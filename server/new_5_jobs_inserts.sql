-- =========================================================================
-- SEED DATA BARU (5 LOWONGAN KERJA FULL-TIME SESUAI FILTER KATEGORI)
-- Sektor: Non-IT Business, Operations, Corporate Admin, Finance & Customer Support
-- Format: JSONB arrays untuk kolom 'requirements' dan 'skills_required'
-- Generated at: 2026-05-21T03:08:11.898Z
-- =========================================================================

-- BERIKUT ADALAH QUERY SQL UNTUK SUPABASE SQL EDITOR:
-- -------------------------------------------------------------------------
INSERT INTO public.jobs (id, title, company_id, company_name, company_logo, location, salary_range, job_type, experience_level, description, requirements, skills_required, status, is_suspicious, suspicious_reason, created_at) VALUES
('job-81', 'Senior General Ledger Accountant', 'co-8', 'Bank Mandiri', 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&auto=format&fit=crop&q=60', 'Jakarta, ID (WFO)', 'Rp 15.000.000 - Rp 22.000.000 / month', 'Full-time', 'Senior Level', 'Kelola keseluruhan siklus penutupan buku General Ledger (GL) bulanan, rekonsiliasi akun antar-cabang, serta penyusunan laporan keuangan konsolidasi untuk Bank Mandiri pusat.', '["Min. 5 tahun pengalaman di bidang Finance & Accounting korporat atau Kantor Akuntan Publik terkemuka","Mahir mengoperasikan ERP SAP FICO secara detail untuk modul GL dan Konsolidasi","Memahami regulasi perpajakan Indonesia terbaru serta standar pelaporan PSAK 71/73"]'::jsonb, '["General Ledger","SAP FICO","Financial Consolidation","Balance Sheet Reconciliations","PSAK Compliance"]'::jsonb, 'approved', false, NULL, '2026-05-21T03:00:25.000Z'),
('job-82', 'Area Operations Manager', 'co-12', 'Kopi Kenangan', 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=100&auto=format&fit=crop&q=60', 'Bandung, ID (WFO)', 'Rp 12.000.000 - Rp 18.000.000 / month', 'Full-time', 'Senior Level', 'Pimpin dan kendalikan kinerja puluhan outlet gerai Kopi Kenangan di area Bandung, pastikan standar pelayanan, kepatuhan kebersihan, serta pencapaian target penjualan area.', '["Min. 4 tahun posisi Area Manager/Multi-Unit Supervisor di industri F&B, Retail, atau Hospitality","Memiliki kemampuan kepemimpinan yang luar biasa dan interpersonal yang ramah","Fokus kuat pada efisiensi operasional harian, kepuasan konsumen, dan audit stok inventaris"]'::jsonb, '["Multi-unit Operations","F&B Quality Standard","Inventory Supervision","P&L Management","Staff Training & Development"]'::jsonb, 'approved', false, NULL, '2026-05-21T03:02:25.000Z'),
('job-83', 'Corporate Secretary Specialist', 'co-6', 'GoTo Group', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=100&auto=format&fit=crop&q=60', 'Jakarta, ID / Hybrid', 'Rp 14.000.000 - Rp 21.000.000 / month', 'Full-time', 'Mid Level', 'Kelola administrasi kepatuhan tata kelola perusahaan (Corporate Governance), jadwalkan Rapat Umum Pemegang Saham (RUPS), serta koordinasi pengarsipan laporan tahunan IDX.', '["Minimal 3 tahun pengalaman sebagai legal officer atau sekretaris korporasi di perusahaan Tbk / Publik","Memahami Undang-Undang Perseroan Terbatas dan aturan pasar modal OJK secara komperehensif","Kemampuan bahasa Inggris korporat lisan maupun tertulis yang sangat prima"]'::jsonb, '["Corporate Governance","OJK Regulations Compliance","Board Meeting Preparation","Legal Drafting Assistance","IDX Archiving"]'::jsonb, 'approved', false, NULL, '2026-05-21T03:04:25.000Z'),
('job-84', 'Senior Procurement Specialist', 'co-7', 'Traveloka', 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=100&auto=format&fit=crop&q=60', 'Jakarta, ID / Hybrid', 'Rp 11.000.000 - Rp 16.500.000 / month', 'Full-time', 'Senior Level', 'Nakhodai proses pengadaan aset perangkat keras, lisensi software korporat, serta negosiasi kontrak strategis dengan vendor internasional untuk mengoptimalkan anggaran Traveloka.', '["Min. 5 tahun pengalaman di bidang Purchasing & Sourcing perusahaan hospitality / teknologi global","Keahlian negosiasi komersial yang kuat dengan rekam jejak penghematan anggaran (saving costs)","Terbiasa mengelola siklus tender (PR to PO) dan hubungan strategis bersama sub-kontraktor utama"]'::jsonb, '["Strategic Sourcing","Vendor Contracting","Supply Chain Optimization","Negotiation","Contract Audit Support"]'::jsonb, 'approved', false, NULL, '2026-05-21T03:06:25.000Z'),
('job-85', 'Customer Experience Team Lead', 'co-9', 'Shopee Indonesia', 'https://images.unsplash.com/photo-1472851294608-062f824d296e?w=100&auto=format&fit=crop&q=60', 'Jakarta, ID (WFO)', 'Rp 10.000.000 - Rp 15.000.000 / month', 'Full-time', 'Mid Level', 'Supervisi unit tim Customer Experience Shopee, rancang metrik performa standar operasional CS (SLA & CSAT), serta pimpin resolusi keluhan eskalasi kelas atas.', '["Min. 3 tahun memimpin tim Customer Support, Help Desk, atau CX Analyst di perusahaan e-commerce","Mahir mengolah data kepuasan pelanggan (NPS/CSAT) untuk diterjemahkan sebagai peluang perbaikan sistem","Lancer berkomunikasi asertif, persuasif, serta cakap melakukan resolusi konflik secara tenang"]'::jsonb, '["Client Escalation Management","CSAT/NPS Tracking","Performance Management","Zendesk CRM Suite","Team Leadership"]'::jsonb, 'approved', false, NULL, '2026-05-21T03:08:25.000Z')
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