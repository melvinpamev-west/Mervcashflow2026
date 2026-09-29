import React, { useState } from 'react';
import {
  Account,
  ActiveTab,
  AppTheme,
  Budget,
  Currency,
  PdfExportScope,
  RabProject,
  Transaction,
} from '../types';
import { formatCurrency } from '../utils/formatters';
import { Sun, Moon, RefreshCw, Sparkles, Send, FileDown, Calculator, Plus } from 'lucide-react';

interface LiquidFinanceStageProps {
  activeTab: ActiveTab;
  onNavigateSection: (tab: ActiveTab) => void;
  totalNetWorth: number;
  totalIncomeMonth: number;
  totalExpenseMonth: number;
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  rabProjects: RabProject[];
  currency: Currency;
  setCurrency: (c: Currency) => void;
  theme: AppTheme;
  onToggleTheme: () => void;
  userName?: string | null;
  userEmail?: string | null;
  onQuickAdd: (text: string) => void;
  onOpenNewTransaction: () => void;
  onOpenPdfModal: (scope: PdfExportScope) => void;
  onAutoSyncAccounts: () => void;
  isSyncingAccounts: boolean;
  onLogout: () => void;
  onGoToLanding?: () => void;
  onOpenAuth?: () => void;
}

export const LiquidFinanceStage: React.FC<LiquidFinanceStageProps> = ({
  activeTab,
  onNavigateSection,
  totalNetWorth = 0,
  totalIncomeMonth = 0,
  totalExpenseMonth = 0,
  accounts = [],
  transactions: _transactions = [],
  budgets: _budgets = [],
  rabProjects = [],
  currency,
  setCurrency,
  theme,
  onToggleTheme,
  userName,
  userEmail,
  onQuickAdd,
  onOpenNewTransaction,
  onOpenPdfModal,
  onAutoSyncAccounts,
  isSyncingAccounts,
  onLogout,
  onGoToLanding,
  onOpenAuth,
}) => {
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantReply, setAssistantReply] = useState<string | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(3);

  const netCashFlow = totalIncomeMonth - totalExpenseMonth;
  const savingsRate =
    totalIncomeMonth > 0
      ? Math.max(0, Math.round(((totalIncomeMonth - totalExpenseMonth) / totalIncomeMonth) * 100))
      : 0;
  const totalRabEstimated = rabProjects.reduce(
    (sum, p) => sum + p.items.reduce((s, i) => s + i.totalEstimated, 0),
    0
  );

  const bankTotal = accounts
    .filter((a) => a.type === 'bank')
    .reduce((s, a) => s + a.balance, 0);
  const walletTotal = accounts
    .filter((a) => a.type === 'wallet')
    .reduce((s, a) => s + a.balance, 0);

  const handleAssistantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = assistantInput.trim();
    if (!q) return;
    const lower = q.toLowerCase();

    if (lower.includes('rab') || lower.includes('rumah') || lower.includes('renovasi')) {
      setAssistantReply(
        `Membuka modul Pembuatan RAB. Saat ini Anda memiliki ${rabProjects.length} proyek RAB dengan total estimasi ${formatCurrency(totalRabEstimated, currency)}.`
      );
      onNavigateSection('rab');
    } else if (lower.includes('sinkron') || lower.includes('sync') || lower.includes('rekening') || lower.includes('wallet')) {
      onAutoSyncAccounts();
      setAssistantReply(
        `Sinkronisasi otomatis dijalankan untuk ${accounts.length} rekening & e-wallet. Total likuiditas: ${formatCurrency(totalNetWorth, currency)}.`
      );
    } else if (lower.includes('pdf') || lower.includes('laporan') || lower.includes('download')) {
      if (lower.includes('rab')) {
        onOpenPdfModal('rab');
      } else {
        onOpenPdfModal('keuangan');
      }
      setAssistantReply('Membuka jendela unduh PDF terpisah sesuai keperluan Anda.');
    } else if (/\d/.test(q)) {
      onQuickAdd(q);
      setAssistantReply(`Transaksi "${q}" berhasil dicatat otomatis ke buku kas & memperbarui saldo realtime.`);
    } else {
      setAssistantReply(
        `Status Keuangan: Kekayaan Bersih ${formatCurrency(totalNetWorth, currency)} | Arus Kas Bersih ${formatCurrency(netCashFlow, currency)} | Rasio Tabungan ${savingsRate}%.`
      );
    }
    setAssistantInput('');
  };

  const navItems: { id: ActiveTab; label: string; icon: string; href: string }[] = [
    { id: 'ringkasan', label: 'Dashboard Utama', icon: '#i-grid', href: '#ringkasan' },
    { id: 'transaksi', label: 'Arus Kas & Transaksi', icon: '#i-chart', href: '#transaksi' },
    { id: 'rekening', label: 'Rekening & E-Wallet', icon: '#i-globe', href: '#rekening' },
    { id: 'anggaran', label: 'Anggaran Bulanan', icon: '#i-cal', href: '#anggaran' },
    { id: 'rab', label: 'Pembuatan RAB Proyek', icon: '#i-gear', href: '#rab' },
    { id: 'analisis', label: 'Analisis Finansial', icon: '#i-wind', href: '#analisis' },
  ];

  const days = [
    { name: 'Sunday', label: 'Saldo Awal', val: formatCurrency(totalNetWorth * 0.85, currency), icon: '#i-cloud' },
    { name: 'Monday', label: 'Pemasukan', val: `+${formatCurrency(totalIncomeMonth, currency)}`, icon: '#i-sun' },
    { name: 'Tuesday', label: 'Pengeluaran', val: `-${formatCurrency(totalExpenseMonth, currency)}`, icon: '#i-cloud2' },
    { name: 'Wednesday', label: 'Arus Bersih', val: formatCurrency(netCashFlow, currency), icon: '#i-hail' },
    { name: 'Thursday', label: 'Proyek RAB', val: formatCurrency(totalRabEstimated, currency), icon: '#i-cloud2' },
    { name: 'Friday', label: 'Kekayaan Kini', val: formatCurrency(totalNetWorth, currency), icon: '#i-sun' },
  ];

  return (
    <div className="lg-stage p-4 sm:p-6 lg:p-7 select-none">
      {/* INLINE SVG SPRITE (Exact Aurora Weather / Liquid Glass Symbols) */}
      <svg width="0" height="0" className="absolute hidden" aria-hidden="true">
        <defs>
          <symbol id="i-grid" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="2" />
            <rect x="14" y="3" width="7" height="7" rx="2" />
            <rect x="14" y="14" width="7" height="7" rx="2" />
            <rect x="3" y="14" width="7" height="7" rx="2" />
          </symbol>
          <symbol id="i-chart" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18" />
            <path d="m7 14 4-4 4 4 5-6" />
          </symbol>
          <symbol id="i-globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="3" />
            <path d="M2 10h20" />
            <circle cx="17" cy="14.5" r="1.5" />
          </symbol>
          <symbol id="i-cal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="3" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </symbol>
          <symbol id="i-gear" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </symbol>
          <symbol id="i-out" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </symbol>
          <symbol id="i-plus" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </symbol>
          <symbol id="i-search" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </symbol>
          <symbol id="i-bell" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </symbol>
          <symbol id="i-pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </symbol>
          <symbol id="i-wind" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
            <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
          </symbol>
          <symbol id="i-drop" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          </symbol>
          <symbol id="i-gust" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
            <path d="M3 8h13a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h9" />
          </symbol>
          <symbol id="i-cloud" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
          </symbol>
          <symbol id="i-cloud2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v2m-7.07.93 1.41 1.41M20 12h2M17.66 6.34l1.41-1.41M17.5 19H9a5 5 0 1 1 4.9-6h3.6a3.5 3.5 0 1 1 0 7Z" />
          </symbol>
          <symbol id="i-hail" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 13v8m-8-8v8m4-6v8M17.5 15a4.5 4.5 0 0 0 0-9h-1.8A7 7 0 1 0 6 14.3" />
          </symbol>
          <symbol id="i-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </symbol>
        </defs>
      </svg>

      {/* MAIN LIQUID GLASS STAGE CONTAINER */}
      <div className="relative z-10 flex flex-col lg:flex-row gap-6">
        {/* 1) LEFT SIDEBAR (.lg-sidebar) */}
        <aside
          aria-label="Navigasi Utama Liquid Glass"
          className="lg-sidebar flex lg:flex-col items-center justify-between px-4 py-3 lg:py-6 lg:w-[74px] shrink-0"
        >
          {/* Wave-circle Logo SVG 40x40 */}
          <a
            href="#ringkasan"
            onClick={(e) => {
              e.preventDefault();
              onNavigateSection('ringkasan');
            }}
            className="relative w-10 h-10 flex items-center justify-center rounded-[12px] border border-white/40 bg-white/10 hover:bg-white/20 transition-all"
            title="MervFlow Money — Liquid Glass Observatory"
          >
            <svg viewBox="0 0 40 40" className="w-7 h-7 stroke-white fill-none" strokeWidth="1.8">
              <circle cx="20" cy="20" r="14" strokeOpacity="0.85" />
              <path d="M8 15c4-2 8 2 12 0s8-2 12 0" />
              <path d="M7 20c4-2 8 2 13 0s9-2 13 0" />
              <path d="M8 25c4-2 8 2 12 0s8-2 12 0" />
            </svg>
          </a>

          {/* Navigation Icons with Active White Pip */}
          <nav className="flex lg:flex-col items-center gap-4 sm:gap-6 lg:my-8">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateSection(item.id);
                    const el = document.getElementById(item.id);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`relative p-2.5 rounded-xl transition-all group ${
                    isActive
                      ? 'text-white bg-white/20 shadow-sm'
                      : 'text-white/70 hover:text-white hover:-translate-y-0.5'
                  }`}
                  title={item.label}
                >
                  {isActive && (
                    <span className="hidden lg:block lg-pip absolute -left-[15px] top-1/2 -translate-y-1/2" />
                  )}
                  <svg className="w-[22px] h-[22px]">
                    <use href={item.icon} />
                  </svg>
                </a>
              );
            })}
          </nav>

          {/* Logout at bottom */}
          <button
            onClick={onLogout}
            aria-label="Sign out"
            title="Keluar / Kembali ke Halaman Depan"
            className="p-2.5 rounded-xl text-white/75 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
          >
            <svg className="w-[22px] h-[22px]">
              <use href="#i-out" />
            </svg>
          </button>
        </aside>

        {/* CENTER + RIGHT CONTENT COLUMN */}
        <div className="flex-1 flex flex-col justify-between space-y-6 min-w-0">
          {/* 2) TOP HEADER (.lg-header) */}
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div className="lg-ink">
              <div className="flex items-center gap-2.5">
                <span className="text-[15px] font-[400] text-white/90">Welcome</span>
                <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-400/40 text-emerald-200 font-[500]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  Realtime Sync Aktif
                </span>
              </div>
              <h2 className="text-[20px] font-[700] tracking-[-0.02em] text-white mt-0.5">
                {userName || userEmail?.split('@')[0] || 'Calfin Danang • Mervin Inas'}
              </h2>
            </div>

            {/* Direct Anchor Navigation Bar (Href Connected to IDs) */}
            <nav
              aria-label="Tautan Cepat Halaman"
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/12 backdrop-blur-md border border-white/20"
            >
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateSection(item.id);
                    const targetEl = document.getElementById(item.id);
                    if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-[500] transition-all whitespace-nowrap ${
                    activeTab === item.id
                      ? 'bg-white text-[#04121b] shadow-sm font-[600]'
                      : 'text-white/85 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.id === 'rab' ? 'Pembuatan RAB' : item.label.split(' ')[0]}
                </a>
              ))}
            </nav>

            {/* Right Frosted Glass Tools (52x52 circles + Currency + Theme) */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Quick Add Transaction Tool (+) */}
              <button
                onClick={onOpenNewTransaction}
                title="Catat Transaksi Baru (+)"
                className="lg-tool w-11 h-11 sm:w-[48px] sm:h-[48px] rounded-full flex items-center justify-center text-white cursor-pointer"
              >
                <Plus className="w-5 h-5" />
              </button>

              {/* Quick RAB Builder Tool */}
              <a
                href="#rab"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateSection('rab');
                  document.getElementById('rab')?.scrollIntoView({ behavior: 'smooth' });
                }}
                title="Buka Halaman Pembuatan RAB (Bangun Rumah / Renovasi / Proyek)"
                className="lg-tool w-11 h-11 sm:w-[48px] sm:h-[48px] rounded-full flex items-center justify-center text-white cursor-pointer"
              >
                <Calculator className="w-4 h-4" />
              </a>

              {/* Auto-Sync Bank & E-Wallet Button */}
              <button
                onClick={onAutoSyncAccounts}
                title="Sinkronisasi Otomatis Rekening & E-Wallet Realtime"
                className="lg-tool w-11 h-11 sm:w-[48px] sm:h-[48px] rounded-full flex items-center justify-center text-white cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncingAccounts ? 'animate-spin text-emerald-300' : ''}`} />
              </button>

              {/* Modular PDF Download Tool */}
              <button
                onClick={() => onOpenPdfModal(activeTab === 'rab' ? 'rab' : 'keuangan')}
                title="Unduh Laporan PDF Sesuai Keperluan (RAB Saja / Keuangan Saja)"
                className="lg-tool w-11 h-11 sm:w-[48px] sm:h-[48px] rounded-full flex items-center justify-center text-white cursor-pointer"
              >
                <FileDown className="w-4 h-4" />
              </button>

              {/* Light / Dark Theme Toggle */}
              <button
                onClick={onToggleTheme}
                title={theme === 'dark' ? 'Aktifkan Tampilan Terang (Light Mode)' : 'Aktifkan Tampilan Gelap (Dark Mode)'}
                className="lg-tool px-3.5 h-11 sm:h-[48px] rounded-full flex items-center gap-1.5 text-xs font-[600] text-white cursor-pointer"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-300" />
                    <span className="hidden sm:inline">Terang</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-sky-200" />
                    <span className="hidden sm:inline">Gelap</span>
                  </>
                )}
              </button>

              {/* Currency Pill */}
              <button
                onClick={() => setCurrency(currency === 'IDR' ? 'USD' : 'IDR')}
                title="Ganti Mata Uang IDR / USD"
                className="lg-tool px-3 h-11 sm:h-[48px] rounded-full text-xs font-mono font-[600] text-white cursor-pointer"
              >
                {currency}
              </button>

              {/* Avatar 52x52 */}
              <div className="w-11 h-11 sm:w-[50px] sm:h-[50px] rounded-full overflow-hidden border-2 border-white/40 shrink-0 bg-white/20 flex items-center justify-center">
                <img
                  src="/images/mervin.jpg"
                  alt="Mervin Inas"
                  loading="eager"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
          </header>

          {/* MIDDLE & BOTTOM GRID: HERO + WAVE CHART ON LEFT, LIQUID GLASS RAIL ON RIGHT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            {/* LEFT 8 COLUMNS: HERO + INTERACTIVE FINANCE ASSISTANT + WAVE FORECAST STRIP */}
            <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
              {/* 3) HERO & FINANCE ASSISTANT (.lg-hero) */}
              <div className="space-y-4 max-w-[620px]">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 lg-chip text-xs font-[500] text-white">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Weather Forecast • Finance Assistant Observatory</span>
                </div>

                <h1 className="lg-headline text-[38px] sm:text-[52px] leading-[1.12] text-white">
                  <span className="lg-ln">
                    <span>Strom Wealth</span>
                  </span>
                  <span className="lg-ln ln-2">
                    <span>with Liquid Cashflow</span>
                  </span>
                </h1>

                <p className="lg-blurb text-[14.5px] leading-[23px] font-[500] text-white/95 max-w-[520px]">
                  Total kekayaan bersih terkonsolidasi{' '}
                  <strong className="underline decoration-white/50">
                    {formatCurrency(totalNetWorth, currency)}
                  </strong>
                  . Pemasukan bulan ini {formatCurrency(totalIncomeMonth, currency)} dengan pengeluaran{' '}
                  {formatCurrency(totalExpenseMonth, currency)}. Rasio tabungan berada di level{' '}
                  {savingsRate}%, serta {rabProjects.length} proyek RAB aktif terpantau secara realtime.
                </p>

                {/* Interactive Finance Assistant Command Bar */}
                <form
                  onSubmit={handleAssistantSubmit}
                  className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-[560px]"
                >
                  <div className="flex-1 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/16 backdrop-blur-xl border border-white/30 focus-within:border-white">
                    <Sparkles className="w-4 h-4 text-emerald-300 shrink-0" />
                    <input
                      type="text"
                      value={assistantInput}
                      onChange={(e) => setAssistantInput(e.target.value)}
                      placeholder='Asisten Keuangan: Ketik "Beli kopi 35000", "Buka RAB", atau "Sync Rekening"...'
                      className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-white/70 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-2xl bg-white text-[#04121b] font-[600] text-xs flex items-center justify-center gap-1.5 hover:bg-white/90 transition-all cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Proses</span>
                  </button>
                </form>

                {/* Quick Finance Assistant Action Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <a
                    href="#manajemen-keuangan"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigateSection('ringkasan');
                      document.getElementById('manajemen-keuangan')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-3.5 py-1.5 rounded-full bg-white text-[#04121b] font-[600] text-[11px] hover:bg-white/90 transition-all cursor-pointer no-underline shadow-sm"
                  >
                    ↓ Buka Panel Manajemen Keuangan Lengkap
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateSection('rab');
                      document.getElementById('manajemen-keuangan')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-3 py-1.5 rounded-full bg-white/16 hover:bg-white/25 border border-white/30 text-[11px] text-white transition-all cursor-pointer"
                  >
                    + Buat RAB Bangun Rumah / Renovasi
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenPdfModal('rab')}
                    className="px-3 py-1.5 rounded-full bg-white/14 hover:bg-white/25 border border-white/25 text-[11px] text-white transition-all cursor-pointer"
                  >
                    Unduh PDF Khusus RAB Saja
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenPdfModal('keuangan')}
                    className="px-3 py-1.5 rounded-full bg-white/14 hover:bg-white/25 border border-white/25 text-[11px] text-white transition-all cursor-pointer"
                  >
                    Unduh PDF Khusus Keuangan Saja
                  </button>
                  {onGoToLanding && (
                    <button
                      type="button"
                      onClick={onGoToLanding}
                      className="px-3 py-1.5 rounded-full bg-indigo-500/35 hover:bg-indigo-500/50 border border-indigo-300/40 text-[11px] text-white transition-all cursor-pointer"
                    >
                      Halaman Landing &amp; Login
                    </button>
                  )}
                  {onOpenAuth && !userEmail && (
                    <button
                      type="button"
                      onClick={onOpenAuth}
                      className="px-3 py-1.5 rounded-full bg-emerald-500/35 hover:bg-emerald-500/50 border border-emerald-300/40 text-[11px] text-white transition-all cursor-pointer"
                    >
                      Login / Daftar Akun
                    </button>
                  )}
                </div>

                {assistantReply && (
                  <div className="px-4 py-2.5 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-xs text-white flex items-center justify-between gap-2">
                    <span>{assistantReply}</span>
                    <button
                      onClick={() => setAssistantReply(null)}
                      className="text-white/70 hover:text-white text-[11px]"
                    >
                      Tutup
                    </button>
                  </div>
                )}
              </div>

              {/* 4) SELF-DRAWING WAVE CHART FORECAST STRIP (.lg-forecast) */}
              <div className="pt-2">
                {/* Checkpoints Row */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 mb-2">
                  {days.map((d, idx) => (
                    <div
                      key={d.name}
                      onClick={() => setSelectedDayIndex(idx)}
                      className={`p-2 rounded-xl transition-all cursor-pointer ${
                        selectedDayIndex === idx ? 'bg-white/20 border border-white/35' : 'hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-[11px] text-white/80">
                        <svg className="w-4 h-4 shrink-0">
                          <use href={d.icon} />
                        </svg>
                        <span className="truncate">{d.label}</span>
                      </div>
                      <div className="text-xs sm:text-sm font-[600] font-mono tabular-nums text-white mt-1 truncate">
                        {d.val}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Animated SVG Wave Chart (Exact Aurora Cubic Path + drawLine + wipeX) */}
                <div className="relative w-full h-[155px] sm:h-[185px] -mt-1">
                  <svg
                    viewBox="0 0 835 230"
                    preserveAspectRatio="none"
                    className="w-full h-full overflow-visible"
                  >
                    <defs>
                      <linearGradient id="wg" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
                        <stop offset="22%" stopColor="#ffffff" stopOpacity="0.95" />
                        <stop offset="78%" stopColor="#ffffff" stopOpacity="0.95" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.4" />
                      </linearGradient>
                      <linearGradient id="wf" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.42" />
                        <stop offset="65%" stopColor="#ffffff" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                      </linearGradient>
                      <clipPath id="wclip">
                        <rect
                          id="wclipr"
                          className="wclip-rect"
                          x="0"
                          y="0"
                          width="835"
                          height="230"
                        />
                      </clipPath>
                    </defs>

                    {/* Fill under cubic wave */}
                    <path
                      clipPath="url(#wclip)"
                      fill="url(#wf)"
                      d="M0,79 C85,79 115,38 195,42 C275,46 310,126 395,124 C480,122 520,24 610,28 C700,32 745,92 835,86 L835,230 L0,230 Z"
                    />

                    {/* 3 Stroked Outline Paths for Liquid Glow */}
                    <path
                      pathLength={1}
                      className="wline"
                      fill="none"
                      stroke="url(#wg)"
                      strokeWidth="6.2"
                      strokeOpacity="0.17"
                      d="M0,79 C85,79 115,38 195,42 C275,46 310,126 395,124 C480,122 520,24 610,28 C700,32 745,92 835,86"
                    />
                    <path
                      pathLength={1}
                      className="wline"
                      fill="none"
                      stroke="url(#wg)"
                      strokeWidth="4.6"
                      strokeOpacity="0.26"
                      d="M0,79 C85,79 115,38 195,42 C275,46 310,126 395,124 C480,122 520,24 610,28 C700,32 745,92 835,86"
                    />
                    <path
                      pathLength={1}
                      className="wline"
                      fill="none"
                      stroke="url(#wg)"
                      strokeWidth="3.4"
                      strokeLinecap="round"
                      d="M0,79 C85,79 115,38 195,42 C275,46 310,126 395,124 C480,122 520,24 610,28 C700,32 745,92 835,86"
                    />
                  </svg>
                </div>

                {/* Days / Period Row Under Chart */}
                <div className="flex items-center justify-between px-2 -mt-4 text-xs sm:text-[15px] text-white/85">
                  {days.map((d, idx) => (
                    <button
                      key={d.name}
                      onClick={() => setSelectedDayIndex(idx)}
                      className={`transition-all cursor-pointer ${
                        selectedDayIndex === idx
                          ? 'text-white font-[700] underline underline-offset-4'
                          : 'text-white/80 hover:text-white font-[500]'
                      }`}
                    >
                      {d.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 5) RIGHT RAIL LIQUID-GLASS CARDS (.lg-rail) */}
            <div className="lg:col-span-4 flex flex-col gap-3.5">
              {/* Card A (.lg-card.big): Central Jakarta / Total Kekayaan Bersih */}
              <div className="lg-card p-5 space-y-4">
                <div className="flex items-center justify-between text-xs text-white/90">
                  <span className="font-[600] flex items-center gap-1.5">
                    <svg className="w-4 h-4">
                      <use href="#i-pin" />
                    </svg>
                    Central Jakarta • Kekayaan Bersih
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/20">Live</span>
                </div>

                <div>
                  <div className="text-[11px] uppercase tracking-wider text-white/75">
                    Total Net Worth Terkonsolidasi
                  </div>
                  <div className="text-[28px] sm:text-[32px] font-[600] tracking-tight text-white font-mono tabular-nums mt-0.5">
                    {formatCurrency(totalNetWorth, currency)}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/25 text-[11px] text-white/95">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 shrink-0">
                      <use href="#i-wind" />
                    </svg>
                    <span className="truncate">{accounts.length} Akun</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 shrink-0">
                      <use href="#i-drop" />
                    </svg>
                    <span className="truncate">{savingsRate}% Hemat</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 shrink-0">
                      <use href="#i-gust" />
                    </svg>
                    <span className="truncate">{rabProjects.length} RAB</span>
                  </div>
                </div>
              </div>

              {/* Card B (.lg-card.row): Rekening Perbankan */}
              <a
                href="#rekening"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateSection('rekening');
                  document.getElementById('rekening')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="lg-card p-4 flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="min-w-0">
                  <span className="text-[11px] text-white/75 block">
                    Indonesia • Sinkronisasi Bank
                  </span>
                  <h4 className="text-[15px] font-[600] text-white truncate">
                    Rekening Bank ({accounts.filter((a) => a.type === 'bank').length})
                  </h4>
                  <span className="text-[11px] text-emerald-200">
                    BCA / Mandiri / BRI / Jago • Realtime
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center justify-end gap-1 text-white">
                    <svg className="w-4 h-4">
                      <use href="#i-cloud" />
                    </svg>
                    <span className="text-sm font-mono tabular-nums font-[600]">
                      {formatCurrency(bankTotal, currency)}
                    </span>
                  </div>
                </div>
              </a>

              {/* Card C (.lg-card.row): E-Wallet Digital */}
              <a
                href="#rekening"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateSection('rekening');
                  document.getElementById('rekening')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="lg-card p-4 flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="min-w-0">
                  <span className="text-[11px] text-white/75 block">
                    Indonesia • E-Wallet Otomatis
                  </span>
                  <h4 className="text-[15px] font-[600] text-white truncate">
                    GoPay, OVO, DANA, ShopeePay ({accounts.filter((a) => a.type === 'wallet').length})
                  </h4>
                  <span className="text-[11px] text-emerald-200">
                    Terhubung &amp; Terupdate Otomatis
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center justify-end gap-1 text-white">
                    <svg className="w-4 h-4">
                      <use href="#i-cloud2" />
                    </svg>
                    <span className="text-sm font-mono tabular-nums font-[600]">
                      {formatCurrency(walletTotal, currency)}
                    </span>
                  </div>
                </div>
              </a>

              {/* Card D (.lg-card.row): Proyek RAB (Bangun Rumah / Renovasi) */}
              <a
                href="#rab"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateSection('rab');
                  document.getElementById('rab')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="lg-card p-4 flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="min-w-0">
                  <span className="text-[11px] text-white/75 block">
                    Perencanaan • Rencana Anggaran Biaya
                  </span>
                  <h4 className="text-[15px] font-[600] text-white truncate">
                    Pembuatan RAB ({rabProjects.length} Proyek)
                  </h4>
                  <span className="text-[11px] text-white/85">
                    Bangun Rumah, Renovasi &amp; Keperluan
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center justify-end gap-1 text-white">
                    <svg className="w-4 h-4">
                      <use href="#i-sun" />
                    </svg>
                    <span className="text-sm font-mono tabular-nums font-[600]">
                      {formatCurrency(totalRabEstimated, currency)}
                    </span>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
