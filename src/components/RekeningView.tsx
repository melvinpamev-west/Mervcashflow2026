import React, { useState } from 'react';
import { Account, Currency } from '../types';
import { formatCurrency } from '../utils/formatters';
import {
  Landmark,
  Smartphone,
  TrendingUp,
  Banknote,
  Plus,
  ArrowRightLeft,
  Edit3,
  Trash2,
  RefreshCw,
  CheckCircle2,
  FileDown,
  Zap,
} from 'lucide-react';

interface RekeningViewProps {
  accounts: Account[];
  currency: Currency;
  onOpenAddAccount: () => void;
  onOpenTransfer: () => void;
  onEditAccount: (account: Account) => void;
  onDeleteAccount: (id: string) => void;
  onQuickConnectProvider?: (provider: {
    name: string;
    institution: string;
    type: Account['type'];
    balance: number;
  }) => void;
  onAutoSyncAll?: () => void;
  isSyncing?: boolean;
  onDownloadRekeningPdf?: () => void;
}

const POPULAR_PROVIDERS: {
  name: string;
  institution: string;
  type: Account['type'];
  badge: string;
}[] = [
  { name: 'GoPay Utama', institution: 'GoPay (GoTo)', type: 'wallet', badge: 'E-Wallet' },
  { name: 'OVO Cash', institution: 'OVO Digital', type: 'wallet', badge: 'E-Wallet' },
  { name: 'DANA Dompet Digital', institution: 'DANA Indonesia', type: 'wallet', badge: 'E-Wallet' },
  { name: 'ShopeePay', institution: 'SeaMoney ShopeePay', type: 'wallet', badge: 'E-Wallet' },
  { name: 'Rekening BCA Utama', institution: 'Bank Central Asia (BCA)', type: 'bank', badge: 'Bank' },
  { name: 'Livin by Mandiri', institution: 'Bank Mandiri', type: 'bank', badge: 'Bank' },
  { name: 'BRImo Rekening BRI', institution: 'Bank Rakyat Indonesia', type: 'bank', badge: 'Bank' },
  { name: 'Kantong Bank Jago', institution: 'Bank Jago', type: 'bank', badge: 'Bank Digital' },
  { name: 'SeaBank Tabungan', institution: 'SeaBank Indonesia', type: 'bank', badge: 'Bank Digital' },
  { name: 'Portofolio Bibit', institution: 'Bibit Reksadana & SBN', type: 'investment', badge: 'Investasi' },
];

export const RekeningView: React.FC<RekeningViewProps> = ({
  accounts,
  currency,
  onOpenAddAccount,
  onOpenTransfer,
  onEditAccount,
  onDeleteAccount,
  onQuickConnectProvider,
  onAutoSyncAll,
  isSyncing = false,
  onDownloadRekeningPdf,
}) => {
  const [quickConnectTarget, setQuickConnectTarget] = useState<(typeof POPULAR_PROVIDERS)[0] | null>(null);
  const [quickBalanceInput, setQuickBalanceInput] = useState('');

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const getAccountIcon = (type: Account['type']) => {
    switch (type) {
      case 'bank':
        return <Landmark className="w-5 h-5 text-[#5266eb]" />;
      case 'wallet':
        return <Smartphone className="w-5 h-5 text-[#10b981]" />;
      case 'investment':
        return <TrendingUp className="w-5 h-5 text-[#f59e0b]" />;
      case 'cash':
        return <Banknote className="w-5 h-5 text-[#ededf3]" />;
    }
  };

  const getTypeLabel = (type: Account['type']) => {
    switch (type) {
      case 'bank':
        return 'Perbankan';
      case 'wallet':
        return 'E-Wallet Digital';
      case 'investment':
        return 'Portofolio Investasi';
      case 'cash':
        return 'Uang Tunai';
    }
  };

  const handleConfirmQuickConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickConnectTarget || !onQuickConnectProvider) return;
    const bal = parseFloat(quickBalanceInput.replace(/[^0-9.]/g, '')) || 0;
    onQuickConnectProvider({
      name: quickConnectTarget.name,
      institution: quickConnectTarget.institution,
      type: quickConnectTarget.type,
      balance: bal,
    });
    setQuickConnectTarget(null);
    setQuickBalanceInput('');
  };

  return (
    <div id="view-rekening" className="space-y-8">
      {/* Header & Main Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-[12px] font-[500] uppercase tracking-wider text-[#5266eb]">
            SINKRONISASI REALTIME BANK &amp; E-WALLET
          </span>
          <h2 className="text-[28px] font-[480] text-[#ededf3] tracking-[0.015em]">
            Rekening &amp; Dompet Digital
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onAutoSyncAll && (
            <button
              onClick={onAutoSyncAll}
              className="pill-button-secondary text-xs py-2 px-4 flex items-center gap-2 border border-[#10b981]/40 hover:border-[#10b981] cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#10b981] ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronisasi Otomatis'}</span>
            </button>
          )}

          {onDownloadRekeningPdf && (
            <button
              onClick={onDownloadRekeningPdf}
              className="pill-button-secondary text-xs py-2 px-4 flex items-center gap-1.5 border border-[#272735] hover:border-[#5266eb] cursor-pointer"
              title="Unduh Laporan PDF Khusus Rekening & E-Wallet Saja"
            >
              <FileDown className="w-3.5 h-3.5 text-[#5266eb]" />
              <span>PDF Rekening Saja</span>
            </button>
          )}

          <button
            onClick={onOpenTransfer}
            className="pill-button-ghost text-xs py-2 px-4 flex items-center gap-2 cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Transfer Saldo</span>
          </button>

          <button
            onClick={onOpenAddAccount}
            className="pill-button-primary text-xs py-2 px-4 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Manual</span>
          </button>
        </div>
      </div>

      {/* Quick Connect Auto-Sync Hub for Indonesian Banks & E-Wallets */}
      <div className="graphite-card border border-[#5266eb]/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#10b981]" />
            <h3 className="text-sm font-[500] text-[#ededf3]">
              Hubungkan Cepat &amp; Sinkronisasi Otomatis Bank / E-Wallet
            </h3>
          </div>
          <span className="text-[11px] text-[#10b981] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            Terhubung dengan Buku Kas &amp; Cloud Realtime
          </span>
        </div>

        <p className="text-xs text-[#c3c3cc]">
          Klik salah satu Bank atau E-Wallet di bawah ini untuk langsung mengaktifkan sinkronisasi saldo otomatis ketika terjadi transaksi masuk, keluar, transfer, maupun pengeluaran RAB:
        </p>

        <div className="flex flex-wrap gap-2">
          {POPULAR_PROVIDERS.map((prov) => {
            const alreadyAdded = accounts.some(
              (a) => a.institution.toLowerCase() === prov.institution.toLowerCase() || a.name === prov.name
            );
            return (
              <button
                key={prov.name}
                onClick={() => {
                  setQuickConnectTarget(prov);
                  setQuickBalanceInput('');
                }}
                className={`px-3.5 py-2 rounded-[12px] text-xs flex items-center gap-2 transition-all cursor-pointer border ${
                  alreadyAdded
                    ? 'bg-[#10b981]/15 border-[#10b981]/40 text-[#ededf3]'
                    : 'bg-[#171721] border-[#272735] hover:border-[#5266eb] text-[#ededf3]'
                }`}
              >
                {alreadyAdded ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-[#5266eb] shrink-0" />
                )}
                <span className="font-[480]">{prov.name}</span>
                <span className="text-[10px] text-[#c3c3cc] opacity-80">· {prov.badge}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Overview Balance Card */}
      <div className="graphite-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[12px] font-[480] uppercase tracking-wider text-[#c3c3cc]">
            Total Likuiditas Terkonsolidasi (Realtime)
          </span>
          <h3 className="text-[36px] font-[500] text-[#ededf3] tracking-[0.01em] mt-1 font-mono tabular-nums">
            {formatCurrency(totalBalance, currency)}
          </h3>
          <p className="text-[13px] text-[#c3c3cc] mt-1">
            Tersebar di {accounts.length} sumber dana aktif (otomatis terupdate setiap ada mutasi)
          </p>
        </div>

        {/* Breakdown by type */}
        <div className="flex flex-wrap gap-2">
          {(['bank', 'wallet', 'investment', 'cash'] as const).map((t) => {
            const count = accounts.filter((a) => a.type === t).length;
            const subtotal = accounts
              .filter((a) => a.type === t)
              .reduce((sum, a) => sum + a.balance, 0);
            if (count === 0) return null;
            return (
              <div key={t} className="px-3.5 py-2.5 rounded-[12px] bg-[#171721] border border-[#272735] text-xs">
                <p className="text-[#c3c3cc]">
                  {getTypeLabel(t)} ({count})
                </p>
                <p className="text-[#ededf3] font-[500] font-mono tabular-nums mt-0.5">
                  {formatCurrency(subtotal, currency)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid of Accounts */}
      {accounts.length === 0 ? (
        <div className="graphite-card text-center py-16 px-6 space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#272735] flex items-center justify-center mx-auto text-[#5266eb]">
            <Landmark className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-[480] text-[#ededf3]">Belum Ada Rekening atau E-Wallet Terhubung</h3>
          <p className="text-xs text-[#c3c3cc] max-w-md mx-auto leading-relaxed">
            Klik salah satu tombol cepat di atas (GoPay, OVO, DANA, BCA, Mandiri, BRI) atau tambahkan rekening manual untuk mengaktifkan sinkronisasi saldo realtime.
          </p>
          <button
            onClick={onOpenAddAccount}
            className="pill-button-primary text-xs py-2.5 px-6 inline-flex items-center gap-1.5 mt-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Rekening Pertama</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="graphite-card flex flex-col justify-between group hover:border-[#5266eb]/50 transition-all relative"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#272735] flex items-center justify-center">
                    {getAccountIcon(acc.type)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#10b981]/15 border border-[#10b981]/30 text-[10px] font-[500] text-[#10b981]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                      Auto-Sync
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-[#171721] border border-[#272735] text-[10px] text-[#c3c3cc]">
                      {getTypeLabel(acc.type)}
                    </span>
                  </div>
                </div>

                <h4 className="text-[18px] font-[500] text-[#ededf3] leading-snug mb-1">
                  {acc.name}
                </h4>
                <p className="text-[12px] text-[#c3c3cc] mb-4">
                  {acc.institution} {acc.accountNumber && `• ${acc.accountNumber}`}
                </p>

                <div className="py-2">
                  <span className="text-[11px] text-[#70707d] uppercase tracking-wider block">
                    Saldo Realtime Tersedia
                  </span>
                  <span className="text-[24px] font-[500] font-mono tabular-nums text-[#ededf3] tracking-[0.01em]">
                    {formatCurrency(acc.balance, currency)}
                  </span>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-[#272735]/60 flex items-center justify-between">
                <button
                  onClick={() => onEditAccount(acc)}
                  className="text-xs text-[#c3c3cc] hover:text-[#ededf3] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Sesuaikan Saldo</span>
                </button>

                {accounts.length > 1 && (
                  <button
                    onClick={() => onDeleteAccount(acc.id)}
                    className="text-xs text-[#70707d] hover:text-[#ef4444] transition-colors flex items-center gap-1 cursor-pointer"
                    title="Hapus rekening"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Connect Modal */}
      {quickConnectTarget && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e1e2a] border border-[#272735] rounded-[20px] max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-[#272735] pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#10b981] font-[600]">
                  SINKRONISASI OTOMATIS
                </span>
                <h3 className="text-base font-[500] text-[#ededf3]">
                  Hubungkan {quickConnectTarget.name}
                </h3>
              </div>
              <button
                onClick={() => setQuickConnectTarget(null)}
                className="text-[#c3c3cc] hover:text-[#ededf3]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmQuickConnect} className="space-y-4">
              <p className="text-[#c3c3cc] leading-relaxed">
                Masukkan saldo saat ini pada <strong>{quickConnectTarget.institution}</strong>. Setelah terhubung, saldo akan otomatis bertambah/berkurang secara realtime setiap kali Anda mencatat transaksi atau pengeluaran RAB.
              </p>

              <div>
                <label className="block text-[#c3c3cc] mb-1.5">
                  Saldo Awal / Saat Ini ({currency}) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  autoFocus
                  value={quickBalanceInput}
                  onChange={(e) => setQuickBalanceInput(e.target.value)}
                  placeholder="Contoh: 2500000"
                  className="w-full bg-[#171721] border border-[#272735] rounded-[10px] px-3.5 py-2.5 text-[#ededf3] font-mono tabular-nums focus:outline-none focus:border-[#5266eb]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#272735]">
                <button
                  type="button"
                  onClick={() => setQuickConnectTarget(null)}
                  className="pill-button-secondary px-4 py-2 text-xs"
                >
                  Batal
                </button>
                <button type="submit" className="pill-button-primary px-5 py-2 text-xs">
                  Hubungkan &amp; Aktifkan Realtime
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
