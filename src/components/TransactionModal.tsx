import React, { useState } from 'react';
import { Account, Currency, ExpenseCategory, IncomeCategory, Transaction, TransactionType } from '../types';
import { formatCurrency } from '../utils/formatters';
import { X, ArrowRight } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id'>) => void;
  accounts: Account[];
  currency: Currency;
  initialData?: Partial<Transaction>;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Makanan & Minuman',
  'Tempat Tinggal & Tagihan',
  'Transportasi',
  'Belanja & Gaya Hidup',
  'Kesehatan & Asuransi',
  'Hiburan & Hobi',
  'Pendidikan',
  'Lainnya',
];

const INCOME_CATEGORIES: IncomeCategory[] = [
  'Gaji Utama',
  'Freelance / Bisnis',
  'Dividen & Investasi',
  'Bonus & THR',
  'Hadiah & Transfer',
  'Pendapatan Lain',
];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  accounts,
  currency,
  initialData,
}) => {
  const [type, setType] = useState<TransactionType>(initialData?.type || 'expense');
  const [amountStr, setAmountStr] = useState<string>(initialData?.amount ? initialData.amount.toString() : '');
  const [category, setCategory] = useState<string>(
    initialData?.category || (type === 'income' ? 'Gaji Utama' : 'Makanan & Minuman')
  );
  const [accountId, setAccountId] = useState<string>(initialData?.accountId || accounts[0]?.id || '');
  const [targetAccountId, setTargetAccountId] = useState<string>(initialData?.targetAccountId || accounts[1]?.id || '');
  const [date, setDate] = useState<string>(
    initialData?.date || new Date().toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState<string>(initialData?.notes || '');
  const [merchant, setMerchant] = useState<string>(initialData?.merchant || '');

  if (!isOpen) return null;

  const parsedAmount = parseFloat(amountStr) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0) return;

    onSave({
      type,
      amount: parsedAmount,
      category: (type === 'transfer' ? 'Transfer Rekening' : category) as any,
      accountId,
      targetAccountId: type === 'transfer' ? targetAccountId : undefined,
      date,
      notes: notes.trim() || (type === 'transfer' ? 'Transfer dana antar rekening' : category),
      merchant: merchant.trim() || undefined,
    });
    onClose();
  };

  return (
    <div
      id="modal-backdrop-transaction"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171721]/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        id="modal-content-transaction"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[540px] bg-[#1e1e2a] border border-[#272735] rounded-[16px] p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#272735] pb-4">
          <div>
            <span className="text-[11px] font-[480] uppercase tracking-wider text-[#c3c3cc]">
              Observatorium Kas
            </span>
            <h3 className="text-[20px] font-[480] text-[#ededf3]">
              Catat Transaksi Finansial
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#272735] text-[#c3c3cc] hover:text-[#ededf3] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type Segmented Pill */}
          <div>
            <label className="block text-xs font-[480] text-[#c3c3cc] mb-2 uppercase tracking-wider">
              Tipe Transaksi
            </label>
            <div className="grid grid-cols-3 gap-1 bg-[#171721] p-1 rounded-[32px] border border-[#272735]">
              <button
                type="button"
                onClick={() => {
                  setType('expense');
                  setCategory('Makanan & Minuman');
                }}
                className={`py-2 text-xs font-[480] rounded-[32px] transition-colors cursor-pointer ${
                  type === 'expense'
                    ? 'bg-[#272735] text-[#ededf3]'
                    : 'text-[#c3c3cc] hover:text-[#ededf3]'
                }`}
              >
                Pengeluaran
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('income');
                  setCategory('Gaji Utama');
                }}
                className={`py-2 text-xs font-[480] rounded-[32px] transition-colors cursor-pointer ${
                  type === 'income'
                    ? 'bg-[#272735] text-[#ededf3]'
                    : 'text-[#c3c3cc] hover:text-[#ededf3]'
                }`}
              >
                Pemasukan
              </button>
              <button
                type="button"
                onClick={() => setType('transfer')}
                className={`py-2 text-xs font-[480] rounded-[32px] transition-colors cursor-pointer ${
                  type === 'transfer'
                    ? 'bg-[#272735] text-[#ededf3]'
                    : 'text-[#c3c3cc] hover:text-[#ededf3]'
                }`}
              >
                Transfer
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <div className="flex justify-between items-baseline mb-2">
              <label className="text-xs font-[480] text-[#c3c3cc] uppercase tracking-wider">
                Nominal
              </label>
              {parsedAmount > 0 && (
                <span className="text-xs text-[#ededf3] font-[480]">
                  {formatCurrency(parsedAmount, currency)}
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-[480] text-[#c3c3cc]">
                {currency === 'USD' ? '$' : 'Rp'}
              </span>
              <input
                type="number"
                step="any"
                required
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="0"
                className="w-full bg-[#171721] border border-[#272735] text-[#ededf3] text-[20px] font-[480] rounded-[32px] pl-12 pr-4 py-3 placeholder-[#70707d] focus:outline-none focus:border-[#ededf3]/60 transition-colors"
              />
            </div>
          </div>

          {/* Category Chips (if not transfer) */}
          {type !== 'transfer' && (
            <div>
              <label className="block text-xs font-[480] text-[#c3c3cc] mb-2 uppercase tracking-wider">
                Pilih Kategori
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                {(type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-[40px] text-xs transition-colors cursor-pointer ${
                      category === cat
                        ? 'bg-[#5266eb] text-white font-[480]'
                        : 'bg-[#171721] border border-[#272735] text-[#c3c3cc] hover:text-[#ededf3]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Account Selection */}
          {accounts.length === 0 ? (
            <div className="p-4 bg-[#171721] rounded-[16px] border border-[#5266eb]/30 text-center space-y-1.5">
              <p className="text-xs text-[#ededf3] font-[480]">Belum ada rekening aktif</p>
              <p className="text-[11px] text-[#c3c3cc]">
                Silakan tambahkan rekening bank atau dompet terlebih dahulu melalui menu Rekening sebelum mencatat transaksi.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-[480] text-[#c3c3cc] mb-1.5 uppercase tracking-wider">
                  {type === 'transfer' ? 'Dari Rekening' : 'Sumber Rekening'}
                </label>
                <select
                  value={accountId || accounts[0]?.id}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full bg-[#171721] border border-[#272735] text-[#ededf3] text-xs rounded-[32px] px-4 py-2.5 focus:outline-none focus:border-[#ededf3]/60 cursor-pointer"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({formatCurrency(acc.balance, currency)})
                    </option>
                  ))}
                </select>
              </div>

              {type === 'transfer' && (
                <div>
                  <label className="block text-xs font-[480] text-[#c3c3cc] mb-1.5 uppercase tracking-wider">
                    Tujuan Rekening
                  </label>
                  <select
                    value={targetAccountId}
                    onChange={(e) => setTargetAccountId(e.target.value)}
                    className="w-full bg-[#171721] border border-[#272735] text-[#ededf3] text-xs rounded-[32px] px-4 py-2.5 focus:outline-none focus:border-[#ededf3]/60 cursor-pointer"
                  >
                    {accounts
                      .filter((a) => a.id !== accountId)
                      .map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-[480] text-[#c3c3cc] mb-1.5 uppercase tracking-wider">
                  Tanggal
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#171721] border border-[#272735] text-[#ededf3] text-xs rounded-[32px] px-4 py-2.5 focus:outline-none focus:border-[#ededf3]/60"
                />
              </div>
            </div>
          )}

          {/* Notes & Merchant */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-[480] text-[#c3c3cc] mb-1.5 uppercase tracking-wider">
                Catatan / Keterangan
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Belanja mingguan di toko..."
                className="w-full bg-[#171721] border border-[#272735] text-[#ededf3] text-xs rounded-[32px] px-4 py-2.5 placeholder-[#70707d] focus:outline-none focus:border-[#ededf3]/60"
              />
            </div>

            <div>
              <label className="block text-xs font-[480] text-[#c3c3cc] mb-1.5 uppercase tracking-wider">
                Pihak / Toko / Merchant (Opsional)
              </label>
              <input
                type="text"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                placeholder="Contoh: Starbucks, Tokopedia..."
                className="w-full bg-[#171721] border border-[#272735] text-[#ededf3] text-xs rounded-[32px] px-4 py-2.5 placeholder-[#70707d] focus:outline-none focus:border-[#ededf3]/60"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#272735]">
            <button
              type="button"
              onClick={onClose}
              className="pill-button-ghost text-xs py-2 px-5"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={parsedAmount <= 0}
              className="pill-button-primary text-xs py-2.5 px-6 disabled:opacity-50 cursor-pointer"
            >
              Simpan Transaksi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
