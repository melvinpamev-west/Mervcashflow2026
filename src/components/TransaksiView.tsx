import React, { useState, useMemo } from 'react';
import { Account, Currency, Transaction, TransactionType } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Search, Filter, Trash2, ArrowUpRight, ArrowDownRight, ArrowRightLeft, Download, Plus } from 'lucide-react';

interface TransaksiViewProps {
  transactions: Transaction[];
  accounts: Account[];
  currency: Currency;
  onOpenNewTransaction: () => void;
  onDeleteTransaction: (id: string) => void;
}

export const TransaksiView: React.FC<TransaksiViewProps> = ({
  transactions,
  accounts,
  currency,
  onOpenNewTransaction,
  onDeleteTransaction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<TransactionType | 'all'>('all');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((tx) => set.add(tx.category));
    return Array.from(set);
  }, [transactions]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Type filter
      if (selectedType !== 'all' && tx.type !== selectedType) return false;

      // Account filter
      if (selectedAccountId !== 'all' && tx.accountId !== selectedAccountId && tx.targetAccountId !== selectedAccountId) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && tx.category !== selectedCategory) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchNotes = tx.notes.toLowerCase().includes(query);
        const matchCategory = tx.category.toLowerCase().includes(query);
        const matchMerchant = tx.merchant?.toLowerCase().includes(query);
        return matchNotes || matchCategory || matchMerchant;
      }

      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedType, selectedAccountId, selectedCategory, searchQuery]);

  // Totals for filtered view
  const totalExpense = filteredTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalIncome = filteredTransactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Tanggal', 'Tipe', 'Kategori', 'Rekening', 'Nominal', 'Catatan', 'Pihak/Merchant'];
    const rows = filteredTransactions.map((tx) => {
      const acc = accounts.find((a) => a.id === tx.accountId);
      return [
        tx.id,
        tx.date,
        tx.type,
        tx.category,
        acc ? acc.name : tx.accountId,
        tx.amount,
        `"${tx.notes.replace(/"/g, '""')}"`,
        `"${(tx.merchant || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `transaksi-keuangan-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="view-transaksi" className="space-y-8">
      {/* Top Header & Quick Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[12px] font-[480] uppercase tracking-wider text-[#c3c3cc]">
            Buku Kas Terperinci
          </span>
          <h2 className="text-[28px] font-[480] text-[#ededf3] tracking-[0.015em]">
            Riwayat Transaksi
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="pill-button-ghost text-xs py-2 px-4 flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={onOpenNewTransaction}
            className="pill-button-primary text-xs py-2 px-4 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Transaksi</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar Graphite Card */}
      <div className="graphite-card !p-6 space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#c3c3cc] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari transaksi, toko, atau catatan..."
              className="w-full bg-[#171721] border border-[#272735] text-[#ededf3] text-sm rounded-[32px] pl-10 pr-4 py-2.5 placeholder-[#70707d] focus:outline-none focus:border-[#ededf3]/50 transition-colors"
            />
          </div>

          {/* Type Segmented Control */}
          <div className="flex items-center bg-[#171721] rounded-[40px] p-1 border border-[#272735] self-start lg:self-auto overflow-x-auto">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 text-xs font-[450] rounded-[40px] transition-colors ${
                selectedType === 'all'
                  ? 'bg-[#272735] text-[#ededf3]'
                  : 'text-[#c3c3cc] hover:text-[#ededf3]'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setSelectedType('expense')}
              className={`px-3 py-1.5 text-xs font-[450] rounded-[40px] transition-colors ${
                selectedType === 'expense'
                  ? 'bg-[#272735] text-[#ededf3]'
                  : 'text-[#c3c3cc] hover:text-[#ededf3]'
              }`}
            >
              Pengeluaran
            </button>
            <button
              onClick={() => setSelectedType('income')}
              className={`px-3 py-1.5 text-xs font-[450] rounded-[40px] transition-colors ${
                selectedType === 'income'
                  ? 'bg-[#272735] text-[#ededf3]'
                  : 'text-[#c3c3cc] hover:text-[#ededf3]'
              }`}
            >
              Pemasukan
            </button>
            <button
              onClick={() => setSelectedType('transfer')}
              className={`px-3 py-1.5 text-xs font-[450] rounded-[40px] transition-colors ${
                selectedType === 'transfer'
                  ? 'bg-[#272735] text-[#ededf3]'
                  : 'text-[#c3c3cc] hover:text-[#ededf3]'
              }`}
            >
              Transfer
            </button>
          </div>

          {/* Account Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#c3c3cc] shrink-0" />
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="bg-[#171721] border border-[#272735] text-[#ededf3] text-xs rounded-[32px] px-3.5 py-2 focus:outline-none focus:border-[#ededf3]/50 cursor-pointer"
            >
              <option value="all">Semua Rekening</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#171721] border border-[#272735] text-[#ededf3] text-xs rounded-[32px] px-3.5 py-2 focus:outline-none focus:border-[#ededf3]/50 cursor-pointer"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Metric Pills */}
        <div className="pt-2 flex flex-wrap items-center gap-3 border-t border-[#272735]/40 text-xs text-[#c3c3cc]">
          <span>Ditemukan: <strong className="text-[#ededf3] font-[480]">{filteredTransactions.length} transaksi</strong></span>
          <span className="text-[#70707d]">•</span>
          <span>Total Keluar: <strong className="text-[#ededf3] font-[480]">{formatCurrency(totalExpense, currency)}</strong></span>
          <span className="text-[#70707d]">•</span>
          <span>Total Masuk: <strong className="text-[#ededf3] font-[480]">{formatCurrency(totalIncome, currency)}</strong></span>
        </div>
      </div>

      {/* Transactions Table / List Graphite Card */}
      <div className="graphite-card !p-6">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <p className="text-[16px] text-[#ededf3] font-[450]">
              Tidak ada transaksi yang cocok
            </p>
            <p className="text-xs text-[#c3c3cc] max-w-sm mx-auto">
              Cobalah ubah kata kunci pencarian atau sesuaikan filter tipe dan rekening di atas.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
                setSelectedAccountId('all');
                setSelectedCategory('all');
              }}
              className="pill-button-secondary text-xs mt-2"
            >
              Reset Semua Filter
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#272735]/70">
            {filteredTransactions.map((tx) => {
              const acc = accounts.find((a) => a.id === tx.accountId);
              const targetAcc = tx.targetAccountId ? accounts.find((a) => a.id === tx.targetAccountId) : null;
              const isExpense = tx.type === 'expense';
              const isIncome = tx.type === 'income';
              const isTransfer = tx.type === 'transfer';

              return (
                <div
                  key={tx.id}
                  className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 group hover:bg-[#272735]/20 -mx-3 px-3 rounded-lg transition-colors"
                >
                  <div className="flex items-start md:items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-[#272735] flex items-center justify-center shrink-0 mt-0.5 md:mt-0">
                      {isIncome ? (
                        <ArrowUpRight className="w-4 h-4 text-[#ededf3]" />
                      ) : isExpense ? (
                        <ArrowDownRight className="w-4 h-4 text-[#c3c3cc]" />
                      ) : (
                        <ArrowRightLeft className="w-4 h-4 text-[#5266eb]" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <p className="text-[15px] font-[480] text-[#ededf3] leading-snug">
                          {tx.notes || tx.category}
                        </p>
                        {tx.merchant && (
                          <span className="text-[12px] text-[#c3c3cc]">
                            @{tx.merchant}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-[12px] text-[#c3c3cc]">
                          {formatDate(tx.date)}
                        </span>
                        <span className="text-[11px] text-[#70707d]">•</span>
                        <span className="text-[12px] text-[#c3c3cc]">
                          {isTransfer && targetAcc ? `${acc?.name} → ${targetAcc.name}` : acc?.name || 'Rekening'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-3 self-end md:self-center">
                    <span className="px-3 py-1 rounded-[40px] bg-[#272735] text-[12px] font-[400] text-[#ededf3]">
                      {tx.category}
                    </span>

                    <span
                      className={`text-[16px] font-[480] text-right min-w-[120px] ${
                        isIncome ? 'text-[#ededf3]' : 'text-[#ededf3]'
                      }`}
                    >
                      {isIncome ? '+' : isExpense ? '-' : ''}
                      {formatCurrency(tx.amount, currency)}
                    </span>

                    {/* Delete action */}
                    <button
                      onClick={() => onDeleteTransaction(tx.id)}
                      title="Hapus transaksi"
                      className="p-1.5 rounded-full hover:bg-[#272735] text-[#70707d] hover:text-[#c3c3cc] transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
