import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { X, Mail, Lock, User as UserIcon, Eye, EyeOff, Sparkles, CheckCircle2, AlertCircle, Copy, Check, ExternalLink } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'login',
  onSuccess,
}) => {
  const { loginWithEmail, registerWithEmail, loginWithGoogle, resetPassword } = useAuth();

  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDomainError, setIsDomainError] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';

  const getIndonesianErrorMessage = (err: any): string => {
    const raw = typeof err === 'string' ? err : `${err?.code || ''} ${err?.message || ''}`;
    const errCode = raw.toLowerCase();

    if (errCode.includes('auth/unauthorized-domain')) {
      setIsDomainError(true);
      return 'Domain web ini belum didaftarkan di Firebase Console. Buka Firebase Console > Authentication > Settings > Authorized domains, lalu tambahkan domain ini.';
    }
    setIsDomainError(false);

    if (errCode.includes('auth/operation-not-allowed')) {
      return 'Metode masuk (Email/Password atau Google) belum diaktifkan di Firebase Console. Buka menu Authentication > Sign-in method di console.firebase.google.com, lalu aktifkan (Enable) Email/Password atau Google.';
    }
    if (errCode.includes('auth/invalid-credential') || errCode.includes('auth/wrong-password') || errCode.includes('auth/user-not-found')) {
      return 'Email atau kata sandi salah. Silakan periksa kembali.';
    }
    if (errCode.includes('auth/email-already-in-use')) {
      return 'Email ini sudah terdaftar. Silakan pilih tab "Masuk" atau gunakan Lupa Sandi.';
    }
    if (errCode.includes('auth/weak-password')) {
      return 'Kata sandi minimal harus terdiri dari 6 karakter.';
    }
    if (errCode.includes('auth/invalid-email')) {
      return 'Format alamat email tidak valid.';
    }
    if (errCode.includes('auth/popup-closed-by-user')) {
      return 'Proses masuk dengan Google dibatalkan.';
    }
    if (errCode.includes('auth/popup-blocked')) {
      return 'Jendela popup login diblokir oleh browser. Izinkan popup untuk situs ini.';
    }
    if (errCode.includes('auth/network-request-failed')) {
      return 'Gagal menghubungi server Firebase. Periksa koneksi internet Anda.';
    }
    if (errCode.includes('auth/too-many-requests')) {
      return 'Terlalu banyak percobaan gagal. Akses dibatasi sementara demi keamanan, coba sesaat lagi.';
    }
    if (errCode.includes('permission-denied')) {
      return 'Izin database Firestore ditolak oleh Security Rules. Perbarui rules di Firestore Console.';
    }
    return `Kendala autentikasi: ${err?.message || 'Silakan coba sesaat lagi.'}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        await loginWithEmail(email, password);
        onClose();
        if (onSuccess) onSuccess();
      } else if (tab === 'register') {
        if (password.length < 6) {
          throw new Error('Kata sandi minimal 6 karakter');
        }
        await registerWithEmail(email, password, name.trim());
        onClose();
        if (onSuccess) onSuccess();
      } else if (tab === 'forgot') {
        await resetPassword(email);
        setSuccessMessage('Tautan pemulihan kata sandi telah dikirim ke email Anda.');
      }
    } catch (err: any) {
      console.error(err);
      setError(getIndonesianErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(getIndonesianErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171721]/80 backdrop-blur-sm animate-fade-in">
      <div
        id="auth-modal-card"
        className="w-full max-w-[460px] bg-[#1e1e2a] border border-[#272735] rounded-[24px] p-7 md:p-8 relative shadow-2xl text-[#ededf3]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-1.5 rounded-full text-[#c3c3cc] hover:text-[#ededf3] hover:bg-[#272735] transition-colors"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative w-10 h-10 flex items-center justify-center mb-3">
            <div className="absolute inset-0 rounded-full border border-[#ededf3]/50" />
            <div className="w-5 h-5 rounded-full border border-[#ededf3]/70" />
            <div className="w-2 h-2 rounded-full bg-[#5266eb]" />
          </div>
          <h2 className="font-['Inter'] tracking-[0.14em] text-[15px] font-[500] text-[#ededf3] uppercase">
            MERVFLOW MONEY
          </h2>
          <p className="text-xs text-[#c3c3cc] mt-1">
            {tab === 'login' && 'Masuk ke observatorium keuangan pribadi Anda'}
            {tab === 'register' && 'Daftar akun baru untuk akses data permanen'}
            {tab === 'forgot' && 'Pulihkan akses akun Anda'}
          </p>
        </div>

        {/* Tab Switcher (Masuk / Daftar) */}
        {tab !== 'forgot' && (
          <div className="flex p-1 bg-[#171721] rounded-[32px] border border-[#272735] mb-6">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-[480] rounded-[28px] transition-all ${
                tab === 'login'
                  ? 'bg-[#272735] text-[#ededf3] shadow-sm'
                  : 'text-[#c3c3cc] hover:text-[#ededf3]'
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-[480] rounded-[28px] transition-all ${
                tab === 'register'
                  ? 'bg-[#272735] text-[#ededf3] shadow-sm'
                  : 'text-[#c3c3cc] hover:text-[#ededf3]'
              }`}
            >
              Daftar Akun
            </button>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="mb-5 space-y-3">
            <div className="p-3 rounded-[12px] bg-[#ef4444]/10 border border-[#ef4444]/30 flex items-start gap-2.5 text-xs text-[#ef4444]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>

            {isDomainError && currentDomain && (
              <div className="p-3.5 rounded-[14px] bg-[#171721] border border-[#3e3e56] text-xs space-y-2.5">
                <div className="flex items-center justify-between text-[#c3c3cc]">
                  <span className="text-[11px] font-[500] uppercase tracking-wider text-[#a0a0b2]">
                    Domain yang Perlu Didaftarkan:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(currentDomain);
                      setCopiedDomain(true);
                      setTimeout(() => setCopiedDomain(false), 2500);
                    }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#5266eb]/20 text-[#818cf8] hover:bg-[#5266eb]/30 transition-colors text-[11px] font-[500]"
                  >
                    {copiedDomain ? (
                      <>
                        <Check className="w-3 h-3 text-[#34d399]" />
                        <span className="text-[#34d399]">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Salin Domain</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-2 rounded-[8px] bg-[#111119] border border-[#272735] font-mono text-[11px] text-[#ededf3] break-all select-all">
                  {currentDomain}
                </div>

                <div className="text-[11px] text-[#a0a0b2] space-y-1">
                  <p className="font-[500] text-[#ededf3]">Cara menambahkan di Firebase Console:</p>
                  <ol className="list-decimal list-inside space-y-0.5 text-[#c3c3cc]">
                    <li>Buka Firebase Console &rarr; menu <strong>Authentication</strong>.</li>
                    <li>Pilih tab <strong>Settings</strong> &rarr; <strong>Authorized domains</strong>.</li>
                    <li>Klik <strong>Add domain</strong>, tempel domain di atas, lalu <strong>Save</strong>.</li>
                  </ol>
                </div>

                <a
                  href="https://console.firebase.google.com/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 text-[11px] text-[#5266eb] hover:text-[#818cf8] font-[500] pt-1"
                >
                  <span>Buka Firebase Console sekarang</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* Success Notification */}
        {successMessage && (
          <div className="mb-5 p-3 rounded-[12px] bg-[#10b981]/10 border border-[#10b981]/30 flex items-start gap-2.5 text-xs text-[#10b981]">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <div>
              <label className="block text-[11px] font-[480] text-[#c3c3cc] uppercase tracking-wider mb-1.5">
                Nama Lengkap
              </label>
              <div className="relative flex items-center">
                <UserIcon className="w-4 h-4 absolute left-3.5 text-[#70707d]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Anda"
                  className="w-full bg-[#171721] border border-[#272735] rounded-[12px] pl-10 pr-4 py-2.5 text-sm text-[#ededf3] placeholder-[#70707d] focus:border-[#5266eb] focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-[480] text-[#c3c3cc] uppercase tracking-wider mb-1.5">
              Alamat Email
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 absolute left-3.5 text-[#70707d]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@domain.com"
                className="w-full bg-[#171721] border border-[#272735] rounded-[12px] pl-10 pr-4 py-2.5 text-sm text-[#ededf3] placeholder-[#70707d] focus:border-[#5266eb] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {tab !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-[480] text-[#c3c3cc] uppercase tracking-wider">
                  Kata Sandi
                </label>
                {tab === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setTab('forgot');
                      setError(null);
                    }}
                    className="text-[11px] text-[#5266eb] hover:underline"
                  >
                    Lupa sandi?
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 absolute left-3.5 text-[#70707d]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full bg-[#171721] border border-[#272735] rounded-[12px] pl-10 pr-10 py-2.5 text-sm text-[#ededf3] placeholder-[#70707d] focus:border-[#5266eb] focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[#70707d] hover:text-[#ededf3]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 pill-button-primary py-3 font-[500] text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {tab === 'login' && 'Masuk Sekarang'}
                  {tab === 'register' && 'Buat Akun & Masuk'}
                  {tab === 'forgot' && 'Kirim Tautan Pemulihan'}
                </span>
              </>
            )}
          </button>
        </form>

        {/* Back to login if in forgot tab */}
        {tab === 'forgot' && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setError(null);
              }}
              className="text-xs text-[#c3c3cc] hover:text-[#ededf3] transition-colors"
            >
              ← Kembali ke halaman Masuk
            </button>
          </div>
        )}

        {/* Divider and Google Sign-In */}
        {tab !== 'forgot' && (
          <>
            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#272735]" />
              </div>
              <span className="relative bg-[#1e1e2a] px-3 text-[11px] text-[#70707d] uppercase tracking-wider">
                Atau lanjutkan dengan
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-[12px] bg-[#171721] border border-[#272735] hover:border-[#70707d] text-xs font-[480] text-[#ededf3] flex items-center justify-center gap-2.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.29 21.36 7.36 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.29 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Lanjutkan dengan Akun Google</span>
            </button>
          </>
        )}

        {/* Security badge note */}
        <div className="mt-6 pt-4 border-t border-[#272735]/60 flex items-center justify-center gap-1.5 text-[11px] text-[#70707d]">
          <Sparkles className="w-3 h-3 text-[#5266eb]" />
          <span>Terlindungi enkripsi Firebase Cloud mervflowmoney</span>
        </div>
      </div>
    </div>
  );
};
