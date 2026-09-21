import React, { useState } from 'react';
import { Account, Currency } from '../types';
import { formatCurrency } from '../utils/formatters';
import { Landmark, Smartphone, TrendingUp, Banknote, Plus, ArrowRightLeft, Edit3, Trash2 } from 'lucide-react';

interface RekeningViewProps {
  accounts: Account[];
  currency: Currency;
  onOpenAddAccount: () => void;
  onOpenTransfer: () => void;
  onEditAccount: (account: Account) => void;
  onDeleteAccount: (id: string) => void;
}

export const RekeningView: React.FC<RekeningViewProps> = ({
  accounts,
  currency,
  onOpenAddAccount,
  onOpenTransfer,
  onEditAccount,
  onDeleteAccount,
}) => {
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const getAccountIcon = (type: Account['type']) => {
    switch (type) {
      case 'bank':
        return <Landmark className="w-5 h-5 text-[#ededf3]" />;
      case 'wallet':
        return <Smartphone className="w-5 h-5 text-[#ededf3]" />;
      case 'investment':
        return <TrendingUp className="w-5 h-5 text-[#5266eb]" />;
      case 'cash':
        return <Banknote className="w-5 h-5 text-[#ededf3]" />;
    }
  };

  const getTypeLabel = (type: Account['type']) => {
    switch (type) {
      case 'bank':
        return 'Perbankan';
      case 'wallet':
        return 'Dompet Digital';
      case 'investment':
        return 'Portofolio Investasi';
      case 'cash':
        return 'Uang Tunai';
    }
  };

  return (
    <div id="view-rekening" className="space-y-8">
      {/* Header & Main Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[12px] font-[480] uppercase tracking-wider text-[#c3c3cc]">
            Struktur Likuiditas & Portofolio
          </span>
          <h2 className="text-[28px] font-[480] text-[#ededf3] tracking-[0.015em]">
            Rekening & Dompet
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenTransfer}
            className="pill-button-ghost text-xs py-2 px-4 flex items-center gap-2"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Transfer Saldo</span>
          </button>
          <button
            onClick={onOpenAddAccount}
            className="pill-button-primary text-xs py-2 px-4 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Rekening</span>
          </button>
        </div>
      </div>

      {/* Overview Balance Card */}
      <div className="graphite-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[12px] font-[480] uppercase tracking-wider text-[#c3c3cc]">
            Total Likuiditas Terkonsolidasi
          </span>
          <h3 className="text-[36px] font-[480] text-[#ededf3] tracking-[0.01em] mt-1">
            {formatCurrency(totalBalance, currency)}
          </h3>
          <p className="text-[13px] text-[#c3c3cc] mt-1">
            Tersebar di {accounts.length} sumber dana (rekening bank, investasi, dan dompet)
          </p>
        </div>

        {/* Breakdown by type pills */}
        <div className="flex flex-wrap gap-2">
          {(['bank', 'investment', 'wallet', 'cash'] as const).map((t) => {
            const count = accounts.filter((a) => a.type === t).length;
            const subtotal = accounts
              .filter((a) => a.type === t)
              .reduce((sum, a) => sum + a.balance, 0);
            if (count === 0) return null;
            return (
              <div key={t} className="px-3.5 py-2 rounded-[12px] bg-[#171721] border border-[#272735] text-xs">
                <p className="text-[#c3c3cc]">{getTypeLabel(t)} ({count})</p>
                <p className="text-[#ededf3] font-[480] mt-0.5">{formatCurrency(subtotal, currency)}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid of Accounts (Graphite Cards, 12px radius, 32px padding) */}
      {accounts.length === 0 ? (
        <div className="graphite-card text-center py-16 px-6 space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#272735] flex items-center justify-center mx-auto text-[#5266eb]">
            <Landmark className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-[480] text-[#ededf3]">Belum Ada Rekening Tercatat</h3>
          <p className="text-xs text-[#c3c3cc] max-w-md mx-auto leading-relaxed">
            Mulai mencatat arus kas permanen Anda dengan menambahkan rekening bank (BCA, Mandiri, dll.), dompet digital (GoPay, OVO), atau kas tunai pertama Anda.
          </p>
          <button
            onClick={onOpenAddAccount}
            className="pill-button-primary text-xs py-2.5 px-6 inline-flex items-center gap-1.5 mt-2"
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
              className="graphite-card flex flex-col justify-between group hover:border-[#70707d]/30 transition-all relative"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#272735] flex items-center justify-center">
                    {getAccountIcon(acc.type)}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="px-3 py-1 rounded-[40px] bg-[#171721] border border-[#272735] text-[11px] font-[400] text-[#c3c3cc]">
                      {getTypeLabel(acc.type)}
                    </span>
                  </div>
                </div>

                <h4 className="text-[18px] font-[480] text-[#ededf3] leading-snug mb-1">
                  {acc.name}
                </h4>
                <p className="text-[13px] text-[#c3c3cc] mb-4">
                  {acc.institution} {acc.accountNumber && `• ${acc.accountNumber}`}
                </p>

                <div className="py-2">
                  <span className="text-[11px] text-[#70707d] uppercase tracking-wider block">
                    Saldo Tersedia
                  </span>
                  <span className="text-[24px] font-[480] text-[#ededf3] tracking-[0.01em]">
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
                  <span>Ubah Saldo</span>
                </button>

                {accounts.length > 1 && (
                  <button
                    onClick={() => onDeleteAccount(acc.id)}
                    className="text-xs text-[#70707d] hover:text-[#c3c3cc] transition-colors flex items-center gap-1 cursor-pointer"
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
    </div>
  );
};
