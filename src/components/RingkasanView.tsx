import React from 'react';
import { Account, Budget, Currency, RabProject, SavingsGoal, Transaction } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ArrowUpRight, ArrowDownRight, ArrowRight, ShieldCheck, Target, Layers, FileDown, Plus, Landmark, Calculator } from 'lucide-react';

interface RingkasanViewProps {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  rabProjects?: RabProject[];
  currency: Currency;
  onNavigateTab: (tab: 'transaksi' | 'rekening' | 'anggaran' | 'rab' | 'analisis') => void;
  onOpenNewTransaction: () => void;
  onOpenTransfer: () => void;
  onOpenAddAccount?: () => void;
  onDownloadPdf?: () => void;
}

export const RingkasanView: React.FC<RingkasanViewProps> = ({
  accounts,
  transactions,
  budgets,
  goals,
  rabProjects = [],
  currency,
  onNavigateTab,
  onOpenNewTransaction,
  onOpenTransfer,
  onOpenAddAccount,
  onDownloadPdf,
}) => {
  const currentMonthTransactions = transactions;

  // Calculate category spending
  const categorySpendingMap: Record<string, number> = {};
  currentMonthTransactions.forEach((tx) => {
    if (tx.type === 'expense') {
      categorySpendingMap[tx.category] = (categorySpendingMap[tx.category] || 0) + tx.amount;
    }
  });

  const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const totalBudgetSpent = Object.values(categorySpendingMap).reduce((sum, v) => sum + v, 0);
  const budgetPercentage = totalBudgetLimit > 0
    ? Math.min(100, Math.round((totalBudgetSpent / totalBudgetLimit) * 100))
    : 0;

  // Recent 5 transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div id="view-ringkasan" className="space-y-12">
      {/* Action Bar Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#272735]/60">
        <div>
          <span className="text-[11px] uppercase tracking-[0.14em] text-[#5266eb] font-[500]">
            IKHTISAR TERKONSOLIDASI
          </span>
          <h2 className="text-[26px] font-[480] text-[#ededf3] tracking-[0.01em]">
            Ringkasan Eksekutif
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigateTab('rab')}
            className="pill-button-primary text-xs py-2 px-4 flex items-center gap-2 cursor-pointer"
            title="Buka Halaman Pembuatan RAB (Bangun Rumah, Renovasi, Proyek, Usaha)"
          >
            <Calculator className="w-4 h-4" />
            <span>Pembuatan RAB ({rabProjects.length})</span>
          </button>

          {onDownloadPdf && (
            <button
              onClick={onDownloadPdf}
              className="pill-button-secondary text-xs py-2 px-4 flex items-center gap-2 border border-[#272735] hover:border-[#5266eb]/50"
              title="Download Laporan Format PDF"
            >
              <FileDown className="w-4 h-4 text-[#5266eb]" />
              <span>Unduh Laporan PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* Empty State Banner if user has no accounts yet */}
      {accounts.length === 0 && (
        <div className="graphite-card border border-[#5266eb]/30 bg-gradient-to-r from-[#1e1e2a] to-[#272735]/40 p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[32px] bg-[#5266eb]/20 text-[#5266eb] text-xs font-[480]">
              <Landmark className="w-3.5 h-3.5" />
              <span>Memulai Penggunaan Permanen</span>
            </div>
            <h3 className="text-xl font-[480] text-[#ededf3]">
              Observatorium Keuangan Anda Masih Bersih
            </h3>
            <p className="text-xs text-[#c3c3cc] max-w-xl leading-relaxed">
              Data Anda siap digunakan secara permanen. Tambahkan rekening bank, dompet digital, atau uang tunai pertama Anda untuk mulai mencatat arus kas dan mengendalikan anggaran.
            </p>
          </div>
          {onOpenAddAccount && (
            <button
              onClick={onOpenAddAccount}
              className="pill-button-primary text-xs py-2.5 px-5 shrink-0 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Rekening Pertama</span>
            </button>
          )}
        </div>
      )}

      {/* 3-Column Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Distribusi Rekening & Dompet */}
        <div className="graphite-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[12px] font-[480] uppercase tracking-wider text-[#c3c3cc] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#5266eb]" />
                Rekening &amp; Aset
              </span>
              <button
                onClick={() => onNavigateTab('rekening')}
                className="text-xs text-[#c3c3cc] hover:text-[#ededf3] transition-colors flex items-center gap-1 cursor-pointer"
              >
                Semua ({accounts.length}) <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <h2 className="text-[24px] font-[480] text-[#ededf3] tracking-[0.015em] mb-4">
              Likuiditas Aktif
            </h2>

            {accounts.length > 0 ? (
              <div className="space-y-3 mb-6">
                {accounts.slice(0, 3).map((acc) => (
                  <div key={acc.id} className="flex items-center justify-between py-1 border-b border-[#272735]/60 last:border-0">
                    <div>
                      <p className="text-[14px] font-[450] text-[#ededf3]">{acc.name}</p>
                      <p className="text-[12px] text-[#c3c3cc]">{acc.institution}</p>
                    </div>
                    <span className="text-[14px] font-[480] text-[#ededf3]">
                      {formatCurrency(acc.balance, currency)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center space-y-2 mb-4">
                <p className="text-xs text-[#c3c3cc]">Belum ada rekening aktif</p>
                <p className="text-[11px] text-[#70707d]">Daftarkan rekening bank atau dompet digital Anda.</p>
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center gap-2">
            {accounts.length >= 2 ? (
              <button
                onClick={onOpenTransfer}
                className="pill-button-secondary w-full text-center text-xs py-2"
              >
                Transfer Antar Rekening
              </button>
            ) : (
              <button
                onClick={() => onNavigateTab('rekening')}
                className="pill-button-secondary w-full text-center text-xs py-2"
              >
                Kelola Rekening
              </button>
            )}
          </div>
        </div>

        {/* Card 2: Penggunaan Anggaran Bulan Ini */}
        <div className="graphite-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[12px] font-[480] uppercase tracking-wider text-[#c3c3cc] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#5266eb]" />
                Kesehatan Anggaran
              </span>
              <span className="text-xs text-[#c3c3cc]">{budgetPercentage}% terpakai</span>
            </div>
            <h2 className="text-[24px] font-[480] text-[#ededf3] tracking-[0.015em] mb-2">
              {formatCurrency(totalBudgetSpent, currency)}
            </h2>
            <p className="text-[13px] text-[#c3c3cc] mb-4">
              Dari batas bulanan {formatCurrency(totalBudgetLimit, currency)}
            </p>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-[#272735] rounded-full overflow-hidden mb-5">
              <div
                className="h-full bg-[#5266eb] transition-all duration-500 rounded-full"
                style={{ width: `${budgetPercentage}%` }}
              />
            </div>

            {budgets.length > 0 ? (
              <div className="space-y-2.5">
                {budgets.slice(0, 2).map((b) => {
                  const spent = categorySpendingMap[b.category] || 0;
                  const pct = Math.min(100, Math.round((spent / b.monthlyLimit) * 100));
                  return (
                    <div key={b.id} className="text-xs">
                      <div className="flex justify-between text-[#c3c3cc] mb-1">
                        <span>{b.category}</span>
                        <span className="text-[#ededf3] font-[480]">{pct}%</span>
                      </div>
                      <div className="w-full h-1 bg-[#272735] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#ededf3]/80 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-[#70707d] py-2">Belum ada kategori anggaran ditentukan.</p>
            )}
          </div>

          <div className="pt-4">
            <button
              onClick={() => onNavigateTab('anggaran')}
              className="pill-button-secondary w-full text-center text-xs py-2"
            >
              Kelola Anggaran Detail
            </button>
          </div>
        </div>

        {/* Card 3: Sasaran Tabungan & Masa Depan */}
        <div className="graphite-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[12px] font-[480] uppercase tracking-wider text-[#c3c3cc] flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#5266eb]" />
                Target Tabungan
              </span>
              <span className="text-xs text-[#c3c3cc]">{goals.length} target</span>
            </div>
            <h2 className="text-[24px] font-[480] text-[#ededf3] tracking-[0.015em] mb-4">
              Dana &amp; Aspirasi
            </h2>

            {goals.length > 0 ? (
              <div className="space-y-4 mb-4">
                {goals.map((goal) => {
                  const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                  return (
                    <div key={goal.id} className="space-y-1.5">
                      <div className="flex justify-between items-baseline text-xs">
                        <span className="font-[450] text-[#ededf3]">{goal.title}</span>
                        <span className="text-[#c3c3cc] text-[11px]">
                          {formatCurrency(goal.currentAmount, currency)} / {formatCurrency(goal.targetAmount, currency)}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#272735] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#5266eb] rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-4 text-xs text-[#70707d]">
                Belum ada target tabungan aktif. Buat sasaran dana darurat atau impian masa depan.
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigateTab('analisis')}
              className="pill-button-secondary w-full text-center text-xs py-2"
            >
              Buka Analisis Arus Kas
            </button>
          </div>
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="graphite-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-[12px] font-[480] uppercase tracking-wider text-[#c3c3cc]">
              Aktivitas Finansial
            </span>
            <h3 className="text-[22px] font-[480] text-[#ededf3] tracking-[0.01em]">
              Transaksi Terkini
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenNewTransaction}
              className="pill-button-primary text-xs py-2 px-4 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Catat Transaksi</span>
            </button>
            <button
              onClick={() => onNavigateTab('transaksi')}
              className="pill-button-ghost text-xs py-2 px-4 flex items-center gap-1"
            >
              <span>Lihat Semua Transaksi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Transactions List */}
        {recentTransactions.length > 0 ? (
          <div className="divide-y divide-[#272735]/80">
            {recentTransactions.map((tx) => {
              const acc = accounts.find((a) => a.id === tx.accountId);
              const isExpense = tx.type === 'expense';
              const isIncome = tx.type === 'income';

              return (
                <div
                  key={tx.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-[#272735]/20 -mx-4 px-4 rounded-lg transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-9 h-9 rounded-full bg-[#272735] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                      {isIncome ? (
                        <ArrowUpRight className="w-4 h-4 text-[#10b981]" />
                      ) : isExpense ? (
                        <ArrowDownRight className="w-4 h-4 text-[#ef4444]" />
                      ) : (
                        <Layers className="w-4 h-4 text-[#5266eb]" />
                      )}
                    </div>
                    <div>
                      <p className="text-[14px] font-[480] text-[#ededf3]">{tx.notes || tx.category}</p>
                      <div className="flex items-center gap-2 text-[12px] text-[#c3c3cc]">
                        <span>{formatDate(tx.date)}</span>
                        <span>•</span>
                        <span>{tx.category}</span>
                        {acc && (
                          <>
                            <span>•</span>
                            <span className="text-[#ededf3]/80">{acc.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right pl-12 sm:pl-0">
                    <span
                      className={`text-[15px] font-[480] ${
                        isIncome ? 'text-[#10b981]' : isExpense ? 'text-[#ededf3]' : 'text-[#5266eb]'
                      }`}
                    >
                      {isIncome ? '+' : isExpense ? '-' : ''}
                      {formatCurrency(tx.amount, currency)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center space-y-3">
            <p className="text-sm font-[450] text-[#ededf3]">Belum ada transaksi tercatat</p>
            <p className="text-xs text-[#c3c3cc] max-w-sm mx-auto">
              Setiap transaksi masuk, keluar, atau transfer yang Anda catat akan otomatis dirangkum di sini.
            </p>
            <button
              onClick={onOpenNewTransaction}
              className="pill-button-secondary text-xs mt-2 inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-[#5266eb]" />
              <span>Mulai Catat Transaksi</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
