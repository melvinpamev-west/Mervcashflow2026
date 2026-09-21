import React, { useState, useEffect } from 'react';
import { ActiveTab, Currency } from '../types';
import { Plus, FileDown, LogIn, LogOut, User, Home, CloudCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  onOpenNewTransaction: () => void;
  onDownloadPdf?: () => void;
  onGoToLanding?: () => void;
  onOpenAuth?: () => void;
  isCloudSynced?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  onOpenNewTransaction,
  onDownloadPdf,
  onGoToLanding,
  onOpenAuth,
  isCloudSynced = true,
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
          ? 'bg-[#171721]/95 backdrop-blur-md border-b border-[#272735]/60 py-3'
          : 'bg-[#171721]/60 backdrop-blur-sm py-4'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-2">
        {/* Brand Mark: Concentric circle icon + ALPEN / MERVFLOW text */}
        <div
          id="brand-logo"
          onClick={() => setActiveTab('ringkasan')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="relative w-8 h-8 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-[#ededf3]/60 group-hover:border-[#ededf3] transition-colors" />
            <div className="w-4 h-4 rounded-full border border-[#ededf3]/80" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#5266eb]" />
          </div>
          <div className="flex flex-col">
            <span className="font-['Inter'] tracking-[0.16em] text-[15px] font-[500] text-[#ededf3] uppercase">
              MERVFLOW
            </span>
            <span className="text-[10px] text-[#c3c3cc] tracking-wider uppercase -mt-0.5">
              Personal Wealth
            </span>
          </div>
        </div>

        {/* Center Nav Pill Links */}
        <nav id="desktop-navigation" className="hidden md:flex items-center gap-1 bg-[#1e1e2a]/80 p-1.5 rounded-[40px] border border-[#272735]">
          <button
            id="nav-tab-ringkasan"
            onClick={() => setActiveTab('ringkasan')}
            className={`pill-nav-item ${activeTab === 'ringkasan' ? 'active' : ''}`}
          >
            Ringkasan
          </button>
          <button
            id="nav-tab-transaksi"
            onClick={() => setActiveTab('transaksi')}
            className={`pill-nav-item ${activeTab === 'transaksi' ? 'active' : ''}`}
          >
            Transaksi
          </button>
          <button
            id="nav-tab-rekening"
            onClick={() => setActiveTab('rekening')}
            className={`pill-nav-item ${activeTab === 'rekening' ? 'active' : ''}`}
          >
            Rekening
          </button>
          <button
            id="nav-tab-anggaran"
            onClick={() => setActiveTab('anggaran')}
            className={`pill-nav-item ${activeTab === 'anggaran' ? 'active' : ''}`}
          >
            Anggaran
          </button>
          <button
            id="nav-tab-analisis"
            onClick={() => setActiveTab('analisis')}
            className={`pill-nav-item ${activeTab === 'analisis' ? 'active' : ''}`}
          >
            Analisis
          </button>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* PDF Download Button */}
          {onDownloadPdf && (
            <button
              id="btn-download-pdf-nav"
              onClick={onDownloadPdf}
              title="Unduh Laporan Keuangan Format PDF"
              className="pill-button-secondary hidden sm:flex items-center gap-1.5 text-xs py-1.5 px-3 border border-[#272735] hover:border-[#5266eb]/50"
            >
              <FileDown className="w-3.5 h-3.5 text-[#5266eb]" />
              <span className="hidden lg:inline">Unduh PDF</span>
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
              className={`px-2.5 py-1 text-xs font-[480] rounded-[40px] transition-colors ${
                currency === 'IDR'
                  ? 'bg-[#272735] text-[#ededf3]'
                  : 'text-[#c3c3cc] hover:text-[#ededf3]'
              }`}
            >
              IDR
            </button>
            <button
              id="currency-usd"
              onClick={() => setCurrency('USD')}
              className={`px-2.5 py-1 text-xs font-[480] rounded-[40px] transition-colors ${
                currency === 'USD'
                  ? 'bg-[#272735] text-[#ededf3]'
                  : 'text-[#c3c3cc] hover:text-[#ededf3]'
              }`}
            >
              USD
            </button>
          </div>

          {/* Primary Action Button (Cobalt) */}
          <button
            id="btn-new-transaction"
            onClick={onOpenNewTransaction}
            className="pill-button-primary flex items-center gap-1.5 text-xs py-1.5 px-3.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Catat Transaksi</span>
            <span className="sm:hidden">Catat</span>
          </button>

          {/* User Auth Profile / Login Menu */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 pl-2.5 pr-1 rounded-[40px] bg-[#1e1e2a] border border-[#272735] hover:border-[#5266eb]/60 transition-colors"
                title={currentUser.email || 'Akun Pengguna'}
              >
                <div className="w-2 h-2 rounded-full bg-[#10b981]" title="Tersambung Cloud" />
                <span className="text-[11px] text-[#ededf3] font-[480] max-w-[100px] truncate hidden sm:inline">
                  {currentUser.displayName || currentUser.email?.split('@')[0]}
                </span>
                <div className="w-6 h-6 rounded-full bg-[#272735] flex items-center justify-center text-[#ededf3] text-xs font-[500]">
                  {currentUser.email ? currentUser.email[0].toUpperCase() : 'U'}
                </div>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-[16px] bg-[#1e1e2a] border border-[#272735] shadow-2xl p-2 z-50 space-y-1 text-xs animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-[#272735] mb-1">
                    <p className="text-[11px] text-[#70707d] uppercase tracking-wider">Login Sebagai</p>
                    <p className="text-[#ededf3] font-[480] truncate mt-0.5">{currentUser.email}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-[#10b981] mt-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Firebase Sync Aktif</span>
                    </div>
                  </div>

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

                  {onDownloadPdf && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onDownloadPdf();
                      }}
                      className="w-full text-left px-3 py-2 rounded-[8px] text-[#ededf3] hover:bg-[#272735] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <FileDown className="w-3.5 h-3.5 text-[#5266eb]" />
                      <span>Unduh Laporan PDF</span>
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
              className="pill-button-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5 text-[#5266eb]" />
              <span>Masuk</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile nav pills bar */}
      <div className="flex md:hidden overflow-x-auto px-4 pt-2.5 pb-1 gap-1 border-t border-[#272735]/40 mt-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('ringkasan')}
          className={`pill-nav-item text-xs py-1.5 px-3 whitespace-nowrap ${activeTab === 'ringkasan' ? 'active' : ''}`}
        >
          Ringkasan
        </button>
        <button
          onClick={() => setActiveTab('transaksi')}
          className={`pill-nav-item text-xs py-1.5 px-3 whitespace-nowrap ${activeTab === 'transaksi' ? 'active' : ''}`}
        >
          Transaksi
        </button>
        <button
          onClick={() => setActiveTab('rekening')}
          className={`pill-nav-item text-xs py-1.5 px-3 whitespace-nowrap ${activeTab === 'rekening' ? 'active' : ''}`}
        >
          Rekening
        </button>
        <button
          onClick={() => setActiveTab('anggaran')}
          className={`pill-nav-item text-xs py-1.5 px-3 whitespace-nowrap ${activeTab === 'anggaran' ? 'active' : ''}`}
        >
          Anggaran
        </button>
        <button
          onClick={() => setActiveTab('analisis')}
          className={`pill-nav-item text-xs py-1.5 px-3 whitespace-nowrap ${activeTab === 'analisis' ? 'active' : ''}`}
        >
          Analisis
        </button>
        {onDownloadPdf && (
          <button
            onClick={onDownloadPdf}
            className="pill-nav-item text-xs py-1.5 px-3 whitespace-nowrap text-[#5266eb] flex items-center gap-1"
          >
            <FileDown className="w-3 h-3" />
            <span>PDF</span>
          </button>
        )}
      </div>
    </header>
  );
};
