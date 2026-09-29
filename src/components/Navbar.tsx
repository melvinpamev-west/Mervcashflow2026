import React, { useState, useEffect } from 'react';
import { ActiveTab, AppTheme, Currency, PdfExportScope } from '../types';
import {
  Plus,
  FileDown,
  LogIn,
  LogOut,
  Home,
  CheckCircle2,
  Sun,
  Moon,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  theme?: AppTheme;
  onToggleTheme?: () => void;
  onOpenNewTransaction: () => void;
  onDownloadPdf?: (scope?: PdfExportScope) => void;
  onGoToLanding?: () => void;
  onOpenAuth?: () => void;
  isCloudSynced?: boolean;
  onAutoSync?: () => void;
}

const NAV_LINKS: { id: ActiveTab; label: string; href: string }[] = [
  { id: 'ringkasan', label: 'Ringkasan', href: '#ringkasan' },
  { id: 'transaksi', label: 'Transaksi', href: '#transaksi' },
  { id: 'rekening', label: 'Rekening & E-Wallet', href: '#rekening' },
  { id: 'anggaran', label: 'Anggaran', href: '#anggaran' },
  { id: 'rab', label: 'Pembuatan RAB', href: '#rab' },
  { id: 'analisis', label: 'Analisis', href: '#analisis' },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  theme = 'dark',
  onToggleTheme,
  onOpenNewTransaction,
  onDownloadPdf,
  onGoToLanding,
  onOpenAuth,
  onAutoSync,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, tab: ActiveTab) => {
    e.preventDefault();
    setActiveTab(tab);
    window.history.replaceState(null, '', `#${tab}`);
    setTimeout(() => {
      const target = document.getElementById(tab);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 30);
  };

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    if (onGoToLanding) onGoToLanding();
  };

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#171721]/95 backdrop-blur-md border-b border-[#272735]/60 py-2.5'
          : 'bg-[#171721]/80 backdrop-blur-md border-b border-[#272735]/40 py-3.5'
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-2">
        {/* Brand Mark */}
        <a
          id="brand-logo"
          href="#ringkasan"
          onClick={(e) => handleNavClick(e, 'ringkasan')}
          className="flex items-center gap-3 cursor-pointer group shrink-0 no-underline"
        >
          <div className="relative w-8 h-8 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-[#ededf3]/60 group-hover:border-[#ededf3] transition-colors" />
            <div className="w-4 h-4 rounded-full border border-[#ededf3]/80" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#5266eb]" />
          </div>
          <div className="flex flex-col">
            <span className="font-['Inter'] tracking-[0.16em] text-[14px] font-[600] text-[#ededf3] uppercase">
              MERVFLOW
            </span>
            <span className="text-[10px] text-[#c3c3cc] tracking-wider uppercase -mt-0.5">
              Finance Assistant
            </span>
          </div>
        </a>

        {/* Center Nav Pill Links with Direct href="#id" */}
        <nav
          id="desktop-navigation"
          className="hidden lg:flex items-center gap-1 bg-[#1e1e2a]/90 p-1.5 rounded-[40px] border border-[#272735]"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              id={`nav-tab-${link.id}`}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.id)}
              className={`pill-nav-item ${activeTab === link.id ? 'active' : ''}`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Direct Landing Page / Login Page Button */}
          {onGoToLanding && (
            <button
              onClick={onGoToLanding}
              title="Buka Halaman Landing Page & Login"
              className="pill-button-secondary flex items-center gap-1.5 text-xs py-1.5 px-3 border border-[#5266eb]/40 hover:border-[#5266eb] cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 text-[#5266eb]" />
              <span className="hidden md:inline">Landing &amp; Login</span>
            </button>
          )}

          {/* Light / Dark Mode Toggle */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Ubah ke Tampilan Terang' : 'Ubah ke Tampilan Gelap'}
              className="pill-button-secondary flex items-center gap-1.5 text-xs py-1.5 px-3 border border-[#272735] cursor-pointer"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden xl:inline">Terang</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#5266eb]" />
                  <span className="hidden xl:inline">Gelap</span>
                </>
              )}
            </button>
          )}

          {/* PDF Download Button (Scoped to current active section!) */}
          {onDownloadPdf && (
            <button
              id="btn-download-pdf-nav"
              onClick={() =>
                onDownloadPdf(
                  activeTab === 'rab'
                    ? 'rab'
                    : activeTab === 'rekening'
                    ? 'rekening'
                    : activeTab === 'transaksi'
                    ? 'transaksi'
                    : activeTab === 'anggaran'
                    ? 'anggaran'
                    : 'keuangan'
                )
              }
              title="Unduh Laporan PDF Sesuai Halaman Aktif"
              className="pill-button-secondary hidden sm:flex items-center gap-1.5 text-xs py-1.5 px-3 border border-[#272735] hover:border-[#5266eb]/50 cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5 text-[#5266eb]" />
              <span className="hidden xl:inline">
                {activeTab === 'rab' ? 'PDF RAB' : 'Unduh PDF'}
              </span>
            </button>
          )}

          {/* Currency Toggle */}
          <div
            id="currency-toggle"
            className="flex items-center bg-[#1e1e2a] rounded-[40px] p-0.5 border border-[#272735]"
          >
            <button
              id="currency-idr"
              onClick={() => setCurrency('IDR')}
              className={`px-2 py-1 text-xs font-[500] rounded-[40px] transition-colors cursor-pointer ${
                currency === 'IDR'
                  ? 'bg-[#5266eb] text-white'
                  : 'text-[#c3c3cc] hover:text-[#ededf3]'
              }`}
            >
              IDR
            </button>
            <button
              id="currency-usd"
              onClick={() => setCurrency('USD')}
              className={`px-2 py-1 text-xs font-[500] rounded-[40px] transition-colors cursor-pointer ${
                currency === 'USD'
                  ? 'bg-[#5266eb] text-white'
                  : 'text-[#c3c3cc] hover:text-[#ededf3]'
              }`}
            >
              USD
            </button>
          </div>

          {/* Primary Action Button */}
          <button
            id="btn-new-transaction"
            onClick={onOpenNewTransaction}
            className="pill-button-primary flex items-center gap-1.5 text-xs py-1.5 px-3.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Catat</span>
          </button>

          {/* User Auth Profile / Login Menu */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 pl-2.5 pr-1 rounded-[40px] bg-[#1e1e2a] border border-[#272735] hover:border-[#5266eb]/60 transition-colors cursor-pointer"
                title={currentUser.email || 'Akun Pengguna'}
              >
                <div className="w-2 h-2 rounded-full bg-[#10b981]" title="Realtime Sync Aktif" />
                <span className="text-[11px] text-[#ededf3] font-[500] max-w-[90px] truncate hidden md:inline">
                  {currentUser.displayName || currentUser.email?.split('@')[0]}
                </span>
                <div className="w-6 h-6 rounded-full overflow-hidden bg-[#272735] flex items-center justify-center text-[#ededf3] text-xs font-[600]">
                  <img
                    src="/images/mervin.jpg"
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-60 rounded-[16px] bg-[#1e1e2a] border border-[#272735] shadow-2xl p-2 z-50 space-y-1 text-xs animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-[#272735] mb-1">
                    <p className="text-[10px] text-[#70707d] uppercase tracking-wider">Login Sebagai</p>
                    <p className="text-[#ededf3] font-[500] truncate mt-0.5">{currentUser.email}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-[#10b981] mt-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Realtime Cloud &amp; E-Wallet Sync</span>
                    </div>
                  </div>

                  {onAutoSync && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onAutoSync();
                      }}
                      className="w-full text-left px-3 py-2 rounded-[8px] text-[#ededf3] hover:bg-[#272735] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-[#10b981]" />
                      <span>Sinkronisasi Rekening &amp; E-Wallet</span>
                    </button>
                  )}

                  {onDownloadPdf && (
                    <>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onDownloadPdf('keuangan');
                        }}
                        className="w-full text-left px-3 py-2 rounded-[8px] text-[#ededf3] hover:bg-[#272735] flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <FileDown className="w-3.5 h-3.5 text-[#5266eb]" />
                        <span>Unduh PDF Khusus Keuangan</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onDownloadPdf('rab');
                        }}
                        className="w-full text-left px-3 py-2 rounded-[8px] text-[#ededf3] hover:bg-[#272735] flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <FileDown className="w-3.5 h-3.5 text-[#10b981]" />
                        <span>Unduh PDF Khusus RAB</span>
                      </button>
                    </>
                  )}

                  {onGoToLanding && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onGoToLanding();
                      }}
                      className="w-full text-left px-3 py-2 rounded-[8px] text-[#ededf3] hover:bg-[#272735] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Home className="w-3.5 h-3.5 text-[#c3c3cc]" />
                      <span>Halaman Depan</span>
                    </button>
                  )}

                  <div className="pt-1 border-t border-[#272735]">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-[8px] text-[#ef4444] hover:bg-[#ef4444]/10 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="pill-button-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-[#5266eb]" />
              <span>Masuk</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile nav pills bar with href="#id" */}
      <div className="flex lg:hidden overflow-x-auto px-4 pt-2 pb-1 gap-1 border-t border-[#272735]/40 mt-2 scrollbar-none">
        {NAV_LINKS.map((link) => (
          <a
            key={link.id}
            href={link.href}
            onClick={(e) => handleNavClick(e, link.id)}
            className={`pill-nav-item text-xs py-1.5 px-3 whitespace-nowrap ${
              activeTab === link.id ? 'active' : ''
            }`}
          >
            {link.label}
          </a>
        ))}
      </div>
    </header>
  );
};
