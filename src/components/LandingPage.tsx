import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  ShieldCheck,
  FileDown,
  TrendingUp,
  Wallet,
  ArrowRight,
  Layers,
  Lock,
  PieChart,
  CheckCircle2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Currency } from '../types';
import { formatCurrency } from '../utils/formatters';

interface LandingPageProps {
  onOpenAuth: (tab: 'login' | 'register') => void;
  onEnterDashboard: () => void;
  onDownloadSamplePdf: () => void;
  currency: Currency;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onEnterDashboard,
  onDownloadSamplePdf,
  currency,
}) => {
  const { currentUser, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#171721] text-[#ededf3] flex flex-col selection:bg-[#5266eb] selection:text-white">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#171721]/90 backdrop-blur-md border-b border-[#272735]/60 py-4 transition-all">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-[#ededf3]/60" />
              <div className="w-4 h-4 rounded-full border border-[#ededf3]/80" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#5266eb]" />
            </div>
            <div className="flex flex-col">
              <span className="font-['Inter'] tracking-[0.16em] text-[15px] font-[500] text-[#ededf3] uppercase">
                MERVFLOW MONEY
              </span>
              <span className="text-[10px] text-[#c3c3cc] tracking-wider uppercase -mt-0.5">
                Alpen Financial Architecture
              </span>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-[480] text-[#c3c3cc]">
            <a href="#fitur" className="hover:text-[#ededf3] transition-colors">
              Fitur Unggulan
            </a>
            <a href="#keamanan" className="hover:text-[#ededf3] transition-colors">
              Keamanan Firebase
            </a>
            <a href="#laporan-pdf" className="hover:text-[#ededf3] transition-colors">
              Laporan PDF
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-xs text-[#c3c3cc] bg-[#1e1e2a] px-3 py-1.5 rounded-[32px] border border-[#272735]">
                  {currentUser.email}
                </span>
                <button
                  onClick={onEnterDashboard}
                  className="pill-button-primary text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  <span>Buka Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => logout()}
                  className="pill-button-ghost text-xs py-1.5 px-3 text-[#c3c3cc] hover:text-[#ededf3]"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="pill-button-ghost text-xs py-2 px-4"
                >
                  Masuk
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="pill-button-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-md shadow-[#5266eb]/20"
                >
                  <span>Daftar Akun</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Atmospheric Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden border-b border-[#272735]/60 flex items-center justify-center">
        {/* Background Image with Dark Blue-Hour Tint */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 opacity-40 scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#171721]/60 via-[#171721]/90 to-[#171721] z-0" />
        <div className="absolute w-[650px] h-[350px] rounded-full bg-[#5266eb]/15 blur-[140px] pointer-events-none -top-10 left-1/2 -translate-x-1/2 z-0" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-[800px] mx-auto px-6 text-center flex flex-col items-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[40px] bg-[#1e1e2a]/90 border border-[#272735] text-[#c3c3cc] text-[12px] mb-8">
            <span className="w-2 h-2 rounded-full bg-[#5266eb] animate-pulse" />
            <span>Observatorium Finansial Pribadi Terintegrasi Cloud</span>
          </div>

          <h1 className="text-[40px] sm:text-[54px] md:text-[62px] font-[500] text-[#ffffff] tracking-[0.01em] leading-[1.1] mb-6">
            Kedaulatan Finansial &amp; Manajemen Kekayaan Presisi
          </h1>

          <p className="text-[16px] sm:text-[18px] text-[#ededf3]/85 font-[400] leading-relaxed max-w-[620px] mb-10">
            Kelola multi-rekening bank, e-wallet, dan arus kas harian Anda secara mandiri.
            Tersimpan aman di cloud Firebase untuk penggunaan permanen, lengkap dengan laporan PDF eksekutif siap cetak.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
            {currentUser ? (
              <button
                onClick={onEnterDashboard}
                className="pill-button-primary text-[15px] py-3.5 px-8 flex items-center gap-2 shadow-lg shadow-[#5266eb]/30"
              >
                <span>Lanjutkan ke Dashboard Anda</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="pill-button-primary text-[15px] py-3.5 px-8 flex items-center gap-2 shadow-lg shadow-[#5266eb]/30"
                >
                  <span>Mulai Sekarang — Buat Akun</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onOpenAuth('login')}
                  className="pill-button-ghost text-[15px] py-3.5 px-7"
                >
                  Masuk ke Akun
                </button>
              </>
            )}
            <button
              onClick={onDownloadSamplePdf}
              className="pill-button-secondary text-[14px] py-3 px-5 flex items-center gap-2 border border-[#272735]"
            >
              <FileDown className="w-4 h-4 text-[#5266eb]" />
              <span>Unduh Contoh Laporan PDF</span>
            </button>
          </div>

          {/* Quick trust metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-[680px] pt-8 border-t border-[#272735]/40 text-left">
            <div className="p-3 bg-[#1e1e2a]/50 rounded-[12px] border border-[#272735]/40">
              <span className="block text-[11px] text-[#c3c3cc]">Penyimpanan</span>
              <span className="text-sm font-[480] text-[#ededf3]">Firebase Firestore</span>
            </div>
            <div className="p-3 bg-[#1e1e2a]/50 rounded-[12px] border border-[#272735]/40">
              <span className="block text-[11px] text-[#c3c3cc]">Format Laporan</span>
              <span className="text-sm font-[480] text-[#ededf3]">Eksekutif PDF</span>
            </div>
            <div className="p-3 bg-[#1e1e2a]/50 rounded-[12px] border border-[#272735]/40">
              <span className="block text-[11px] text-[#c3c3cc]">Kategori Arus Kas</span>
              <span className="text-sm font-[480] text-[#ededf3]">Multi-Rekening</span>
            </div>
            <div className="p-3 bg-[#1e1e2a]/50 rounded-[12px] border border-[#272735]/40">
              <span className="block text-[11px] text-[#c3c3cc]">Status Penggunaan</span>
              <span className="text-sm font-[480] text-[#10b981]">Permanen &amp; Bersih</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section: 4 Bento Cards */}
      <section id="fitur" className="py-24 max-w-[1200px] mx-auto px-6 w-full">
        <div className="text-center max-w-[600px] mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.16em] text-[#5266eb] font-[500]">
            ARSITEKTUR FINANSIAL
          </span>
          <h2 className="text-[32px] md:text-[40px] font-[480] text-[#ededf3] mt-2 mb-4 leading-tight">
            Dirancang untuk Pengambilan Keputusan yang Tenang
          </h2>
          <p className="text-sm text-[#c3c3cc] leading-relaxed">
            Menghilangkan kebisingan grafis yang berlebihan. Setiap modul berfokus pada ketepatan saldo,
            kedisiplinan anggaran, dan kedaulatan data finansial pribadi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="graphite-card p-8 border border-[#272735] relative overflow-hidden group">
            <div className="w-12 h-12 rounded-[14px] bg-[#272735] flex items-center justify-center text-[#5266eb] mb-6">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-[480] text-[#ededf3] mb-3">
              Konsolidasi Multi-Rekening &amp; Aset
            </h3>
            <p className="text-sm text-[#c3c3cc] leading-relaxed">
              Catat rekening bank konvensional, dompet digital (GoPay, OVO, ShopeePay), kas fisik,
              serta portofolio investasi dalam satu dashboard terpusat tanpa batasan.
            </p>
          </div>

          {/* Card 2 */}
          <div className="graphite-card p-8 border border-[#272735] relative overflow-hidden group">
            <div className="w-12 h-12 rounded-[14px] bg-[#272735] flex items-center justify-center text-[#10b981] mb-6">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-[480] text-[#ededf3] mb-3">
              Pencatatan Arus Kas &amp; Transfer Otomatis
            </h3>
            <p className="text-sm text-[#c3c3cc] leading-relaxed">
              Pencatatan cepat arus kas masuk, keluar, dan transfer antar-rekening yang otomatis
              memperbarui saldo sumber dan target secara matematis seketika.
            </p>
          </div>

          {/* Card 3 */}
          <div className="graphite-card p-8 border border-[#272735] relative overflow-hidden group">
            <div className="w-12 h-12 rounded-[14px] bg-[#272735] flex items-center justify-center text-[#eab308] mb-6">
              <PieChart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-[480] text-[#ededf3] mb-3">
              Kendali Batas Anggaran Bulanan
            </h3>
            <p className="text-sm text-[#c3c3cc] leading-relaxed">
              Tetapkan batas belanja untuk setiap kategori. Sistem menghitung sisa pagu dan memberikan
              peringatan visual saat pemakaian mendekati atau melampaui limit.
            </p>
          </div>

          {/* Card 4 */}
          <div className="graphite-card p-8 border border-[#272735] relative overflow-hidden group">
            <div className="w-12 h-12 rounded-[14px] bg-[#272735] flex items-center justify-center text-[#5266eb] mb-6">
              <FileDown className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-[480] text-[#ededf3] mb-3">
              Laporan PDF Eksekutif Tajam &amp; Terbaca Jelas
            </h3>
            <p className="text-sm text-[#c3c3cc] leading-relaxed">
              Ekspor laporan posisi keuangan dan riwayat transaksi dalam dokumen PDF resmi dengan kontras tinggi,
              tersusun rapi, teks tajam terbaca sempurna, serta siap dicetak atau disimpan.
            </p>
          </div>
        </div>
      </section>

      {/* Cloud & Security Section */}
      <section id="keamanan" className="py-20 bg-[#1e1e2a]/40 border-y border-[#272735]/60">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[32px] bg-[#1e1e2a] border border-[#272735] text-xs text-[#5266eb]">
              <Lock className="w-3.5 h-3.5" />
              <span>Firebase Cloud Authentication &amp; Storage</span>
            </div>
            <h2 className="text-[30px] md:text-[38px] font-[480] text-[#ededf3] leading-tight">
              Data Anda Permanen, Aman, &amp; Terisolasi Per Akun
            </h2>
            <p className="text-sm text-[#c3c3cc] leading-relaxed">
              MervFlow Money menggunakan infrastruktur Google Cloud Firebase (<code className="text-[#5266eb]">mervflowmoney</code>).
              Setiap catatan rekening, transaksi, dan anggaran ditautkan langsung dengan kredensial akun Anda.
            </p>
            <ul className="space-y-3 pt-2 text-sm text-[#ededf3]/90">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0" />
                <span>Pencatatan dimulai dari data bersih (kosong) untuk penggunaan permanen jangka panjang</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0" />
                <span>Dukungan masuk dengan Email/Password atau Akun Google secara langsung</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0" />
                <span>Sinkronisasi otomatis ke cloud Firestore sehingga data tidak hilang saat membersihkan peramban</span>
              </li>
            </ul>
          </div>

          {/* Security Visual Box */}
          <div className="p-8 bg-[#171721] rounded-[20px] border border-[#272735] space-y-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#272735]">
              <span className="text-xs text-[#c3c3cc] font-mono">STATUS KONEKSI FIREBASE</span>
              <span className="inline-flex items-center gap-1.5 text-xs text-[#10b981]">
                <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                Aktif &amp; Terhubung
              </span>
            </div>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#272735]/40 text-[#c3c3cc]">
                <span>Project ID</span>
                <span className="text-[#ededf3]">mervflowmoney</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#272735]/40 text-[#c3c3cc]">
                <span>Auth Domain</span>
                <span className="text-[#ededf3]">mervflowmoney.firebaseapp.com</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#272735]/40 text-[#c3c3cc]">
                <span>Isolasi Data</span>
                <span className="text-[#10b981]">User UID Scoped (Firestore)</span>
              </div>
              <div className="flex justify-between py-1.5 text-[#c3c3cc]">
                <span>Enkripsi Penyimpanan</span>
                <span className="text-[#ededf3]">Google Cloud AES-256</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PDF Export Highlight Section */}
      <section id="laporan-pdf" className="py-24 max-w-[1200px] mx-auto px-6 w-full">
        <div className="bg-[#1e1e2a] border border-[#272735] rounded-[24px] p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="space-y-4 max-w-[560px]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[32px] bg-[#171721] border border-[#272735] text-xs text-[#5266eb]">
              <FileDown className="w-3.5 h-3.5" />
              <span>Format Laporan Resmi Siap Cetak</span>
            </div>
            <h2 className="text-[28px] md:text-[34px] font-[480] text-[#ededf3] leading-tight">
              Unduh Laporan Keuangan dengan Estetika Gelap Alpine
            </h2>
            <p className="text-sm text-[#c3c3cc] leading-relaxed">
              Kompilasi ringkasan kekayaan bersih, status penggunaan anggaran per kategori,
              serta tabel transaksi detail dalam format PDF berlatar gelap yang rapi dan elegan.
            </p>
            <div className="pt-2">
              <button
                onClick={onDownloadSamplePdf}
                className="pill-button-primary py-3 px-6 text-sm flex items-center gap-2"
              >
                <FileDown className="w-4 h-4" />
                <span>Download Laporan PDF Sekarang</span>
              </button>
            </div>
          </div>

          {/* PDF Visual Mockup */}
          <div className="w-full lg:w-[420px] bg-[#171721] p-6 rounded-[16px] border border-[#272735] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#272735]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#5266eb]" />
                <span className="text-[11px] font-mono text-[#ededf3]">LAPORAN KEUANGAN.PDF</span>
              </div>
              <span className="text-[10px] text-[#c3c3cc]">Tema Alpine Gelap</span>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-[#272735] rounded w-3/4" />
              <div className="h-2 bg-[#272735]/60 rounded w-1/2" />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="p-2.5 bg-[#1e1e2a] rounded-[8px] border border-[#272735]/60">
                <div className="text-[9px] text-[#c3c3cc]">Total Kekayaan</div>
                <div className="text-xs font-[480] text-[#ededf3] mt-1">Rp 0,-</div>
              </div>
              <div className="p-2.5 bg-[#1e1e2a] rounded-[8px] border border-[#272735]/60">
                <div className="text-[9px] text-[#c3c3cc]">Arus Kas Bersih</div>
                <div className="text-xs font-[480] text-[#10b981] mt-1">+Rp 0,-</div>
              </div>
            </div>
            <div className="p-2 bg-[#1e1e2a] rounded-[8px] border border-[#272735]/60 space-y-1">
              <div className="h-2 bg-[#272735] rounded w-full" />
              <div className="h-2 bg-[#272735]/60 rounded w-5/6" />
            </div>
          </div>
        </div>
      </section>

      {/* Call to action section */}
      <section className="py-20 border-t border-[#272735]/60 text-center">
        <div className="max-w-[700px] mx-auto px-6 space-y-6">
          <h2 className="text-[30px] md:text-[36px] font-[480] text-[#ededf3]">
            Siap Memulai Kedaulatan Finansial Anda?
          </h2>
          <p className="text-sm text-[#c3c3cc]">
            Masuk atau buat akun gratis untuk mengakses dashboard manajemen keuangan permanen Anda.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            {currentUser ? (
              <button
                onClick={onEnterDashboard}
                className="pill-button-primary text-sm py-3 px-8 flex items-center gap-2"
              >
                <span>Buka Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => onOpenAuth('register')}
                className="pill-button-primary text-sm py-3 px-8 flex items-center gap-2"
              >
                <span>Daftar Akun Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-[#272735]/60 bg-[#171721] text-xs text-[#70707d] text-center">
        <p>© {new Date().getFullYear()} MERVFLOW MONEY • ALPEN FINANCIAL ARCHITECTURE</p>
        <p className="mt-1 text-[11px]">Terhubung dengan Firebase Cloud Security (mervflowmoney)</p>
      </footer>
    </div>
  );
};
