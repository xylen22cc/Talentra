import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User as UserIcon, Upload, Trash2, Link2, Camera, Phone, CheckCircle, Linkedin, Github, Twitter, Instagram, Sparkles } from 'lucide-react';
import { User } from '../types';
import { useLanguage } from '../LanguageContext';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSave: (updates: Partial<User>) => Promise<void>;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', // Prof Woman
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', // Modern Man
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', // Smiling Woman
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', // Tech Man
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', // Confident Business
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80', // Creative Male
];

export default function UserProfileModal({ isOpen, onClose, user, onSave }: UserProfileModalProps) {
  const { lang, t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile fields state
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [gender, setGender] = useState<User['gender']>(user.gender || 'Laki-laki');
  const [bio, setBio] = useState(user.bio || '');
  const [phone, setPhone] = useState(user.phone || '');
  
  // Medsos/Social link fields state
  const [linkedin, setLinkedin] = useState(user.socialLinks?.linkedin || '');
  const [github, setGithub] = useState(user.socialLinks?.github || '');
  const [twitter, setTwitter] = useState(user.socialLinks?.twitter || '');
  const [instagram, setInstagram] = useState(user.socialLinks?.instagram || '');

  const [saving, setSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Sync profile details when user prop shifts (e.g. user switcher triggers)
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setAvatar(user.avatar || '');
      setGender(user.gender || 'Laki-laki');
      setBio(user.bio || '');
      setPhone(user.phone || '');
      setLinkedin(user.socialLinks?.linkedin || '');
      setGithub(user.socialLinks?.github || '');
      setTwitter(user.socialLinks?.twitter || '');
      setInstagram(user.socialLinks?.instagram || '');
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setIsSuccess(false);

    try {
      const updates: Partial<User> = {
        name,
        email,
        avatar,
        gender,
        bio,
        phone,
        socialLinks: {
          linkedin,
          github,
          twitter,
          instagram,
        },
      };
      await onSave(updates);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error saving user profile details:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-2xl bg-white dark:bg-[#070913] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-left z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200/80 dark:border-slate-800/80">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 font-mono">
                {user.role === 'seeker' ? (lang === 'id' ? 'Profil Kandidat' : 'Candidate Profile') : (lang === 'id' ? 'Profil Perekrut' : 'Recruiter Account')}
              </span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                {lang === 'id' ? 'Edit Profil Akun' : 'Edit Account Profile'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body - Scrollable */}
          <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Row 1: Profile Photo Editing */}
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                {lang === 'id' ? 'Foto Profil' : 'Profile Photo'}
              </label>
              
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-900/60">
                <div className="relative group cursor-pointer" onClick={triggerFilePicker}>
                  <img
                    src={avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                    alt="Current Avatar"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500/20 shadow-inner group-hover:opacity-75 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                    {lang === 'id' 
                      ? 'Unggah foto kustom Anda (PNG/JPG) atau pilih salah satu avatar profesional populer di bawah:'
                      : 'Upload your custom image (PNG/JPG) or select one of our premium pre-configured avatars below:'}
                  </p>
                  
                  <div className="flex items-center justify-center sm:justify-start gap-3">
                    <button
                      type="button"
                      onClick={triggerFilePicker}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-950 text-indigo-600 dark:text-indigo-400 transition-all cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {lang === 'id' ? 'Unggah Foto' : 'Upload Image'}
                    </button>
                    {avatar && (
                      <button
                        type="button"
                        onClick={() => setAvatar('')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {lang === 'id' ? 'Hapus' : 'Remove'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Preset avatars selection */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-medium">
                  {lang === 'id' ? 'Klik avatar premium instan:' : 'Choose a premium identity pre-set:'}
                </span>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_AVATARS.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAvatar(url)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${
                        avatar === url 
                          ? 'border-indigo-500 ring-2 ring-indigo-500/10' 
                          : 'border-slate-200 dark:border-slate-800/80 hover:border-slate-400 dark:hover:border-slate-650'
                      }`}
                    >
                      <img src={url} alt={`Preset ${i+1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 2: Standard Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
                  {lang === 'id' ? 'NAMA LENGKAP (USERNAME)' : 'FULL NAME (USERNAME)'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
                  {lang === 'id' ? 'ALAMAT EMAIL (UNIK)' : 'EMAIL ADDRESS (UNIQUE)'}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  disabled
                  title="Email cannot be modified as it represents your primary identity"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-250 dark:border-slate-850 bg-slate-100 dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400 outline-none cursor-not-allowed opacity-80"
                />
              </div>
            </div>

            {/* Row 3: Gender & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
                  {lang === 'id' ? 'JENIS KELAMIN' : 'GENDER'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 'Laki-laki', label: lang === 'id' ? 'Laki-Laki' : 'Male' },
                    { val: 'Perempuan', label: lang === 'id' ? 'Perempuan' : 'Female' },
                    { val: 'Other', label: lang === 'id' ? 'Lainnya' : 'Other' }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setGender(opt.val as User['gender'])}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        gender === opt.val
                          ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-extrabold'
                          : 'border-slate-200 dark:border-slate-850 hover:border-slate-300 dark:hover:border-slate-750 text-slate-600 dark:text-slate-305'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
                  {lang === 'id' ? 'NOMOR TELEPON' : 'PHONE NUMBER'}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="+62 812-XXXX-XXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Row 4: Short Bio */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
                {lang === 'id' ? 'BIO / RINGKASAN INTEGRATIF' : 'BIOGRAPHY / CORE SUMMARY'}
              </label>
              <textarea
                rows={3}
                placeholder={lang === 'id' ? 'Tuliskan deskripsi profesional singkat tentang diri Anda...' : 'Write a short professional details bio summary...'}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:border-indigo-500 outline-none"
              />
            </div>

            {/* Row 5: Social Medias */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                {lang === 'id' ? 'AKUN MEDIA SOSIAL' : 'SOCIAL MEDIA INTEGRATIONS'}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* LinkedIn */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Linkedin className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-[9.5px] font-bold text-slate-405 font-mono">LINKEDIN URL</span>
                  </div>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white placeholder-slate-450 focus:border-indigo-500 outline-none"
                  />
                </div>

                {/* GitHub */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Github className="w-3.5 h-3.5 text-slate-800 dark:text-white" />
                    <span className="text-[9.5px] font-bold text-slate-405 font-mono">GITHUB PROFILE</span>
                  </div>
                  <input
                    type="url"
                    placeholder="https://github.com/username"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white placeholder-slate-450 focus:border-indigo-500 outline-none"
                  />
                </div>

                {/* Twitter / X */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Twitter className="w-3.5 h-3.5 text-sky-400" />
                    <span className="text-[9.5px] font-bold text-slate-405 font-mono">TWITTER / X</span>
                  </div>
                  <input
                    type="url"
                    placeholder="https://x.com/username"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white placeholder-slate-450 focus:border-indigo-500 outline-none"
                  />
                </div>

                {/* Instagram */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Instagram className="w-3.5 h-3.5 text-pink-500" />
                    <span className="text-[9.5px] font-bold text-slate-405 font-mono">INSTAGRAM</span>
                  </div>
                  <input
                    type="url"
                    placeholder="https://instagram.com/username"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white placeholder-slate-450 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>

          </form>

          {/* Footer action buttons */}
          <div className="p-6 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-end gap-3.5">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="px-4.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 text-xs font-bold transition-all cursor-pointer"
            >
              {lang === 'id' ? 'Batal' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleFormSubmit}
              disabled={saving || isSuccess}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer ${
                isSuccess 
                  ? 'bg-emerald-550 hover:bg-emerald-600' 
                  : 'bg-indigo-600 hover:bg-indigo-705'
              }`}
            >
              {isSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 animate-bounce" />
                  {lang === 'id' ? 'Profil Tersimpan!' : 'Profile Saved!'}
                </>
              ) : saving ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {lang === 'id' ? 'Menyimpan...' : 'Saving Details...'}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {lang === 'id' ? 'Simpan Perubahan' : 'Save Changes'}
                </>
              )}
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
