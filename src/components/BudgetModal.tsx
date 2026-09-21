import React, { useState } from 'react';
import { Budget, Currency, ExpenseCategory } from '../types';
import { formatCurrency } from '../utils/formatters';
import { X, ShieldCheck } from 'lucide-react';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: ExpenseCategory, monthlyLimit: number, id?: string) => void;
  currency: Currency;
  initialBudget?: Budget | null;
}

const ALL_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Makanan & Minuman',
  'Tempat Tinggal & Tagihan',
  'Transportasi',
  'Belanja & Gaya Hidup',
  'Kesehatan & Asuransi',
  'Hiburan & Hobi',
  'Pendidikan',
  'Lainnya',
];

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currency,
  initialBudget,
}) => {
  const [category, setCategory] = useState<ExpenseCategory>(
    initialBudget?.category || 'Makanan & Minuman'
  );
  const [limitStr, setLimitStr] = useState<string>(
    initialBudget?.monthlyLimit ? initialBudget.monthlyLimit.toString() : ''
  );

  if (!isOpen) return null;

  const parsedLimit = parseFloat(limitStr) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedLimit <= 0) return;
    onSave(category, parsedLimit, initialBudget?.id);
    onClose();
  };

  return (
    <div
      id="modal-backdrop-budget"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171721]/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        id="modal-content-budget"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[440px] bg-[#1e1e2a] border border-[#272735] rounded-[16px] p-6 sm:p-8 space-y-6"
      >
        <div className="flex items-center justify-between border-b border-[#272735] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#272735] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#5266eb]" />
            </div>
            <div>
              <span className="text-[11px] font-[480] uppercase tracking-wider text-[#c3c3cc]">
                Perencanaan Pengeluaran
              </span>
              <h3 className="text-[18px] font-[480] text-[#ededf3]">
                {initialBudget ? 'Sesuaikan Limit Anggaran' : 'Atur Batas Anggaran'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#272735] text-[#c3c3cc] hover:text-[#ededf3]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-[480] text-[#c3c3cc] mb-1.5 uppercase tracking-wider">
              Kategori Pengeluaran
            </label>
            <select
              value={category}
              disabled={!!initialBudget}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full bg-[#171721] border border-[#272735] text-[#ededf3] text-xs rounded-[32px] px-4 py-2.5 focus:outline-none focus:border-[#ededf3]/60 cursor-pointer disabled:opacity-60"
            >
              {ALL_EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-1.5">
              <label className="text-xs font-[480] text-[#c3c3cc] uppercase tracking-wider">
                Batas Maksimal per Bulan
              </label>
              {parsedLimit > 0 && (
                <span className="text-xs text-[#ededf3] font-[480]">
                  {formatCurrency(parsedLimit, currency)}
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
                value={limitStr}
                onChange={(e) => setLimitStr(e.target.value)}
                placeholder="0"
                className="w-full bg-[#171721] border border-[#272735] text-[#ededf3] text-[18px] font-[480] rounded-[32px] pl-12 pr-4 py-2.5 placeholder-[#70707d] focus:outline-none focus:border-[#ededf3]/60"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#272735]">
            <button
              type="button"
              onClick={onClose}
              className="pill-button-ghost text-xs py-2 px-4"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={parsedLimit <= 0}
              className="pill-button-primary text-xs py-2 px-5 disabled:opacity-50 cursor-pointer"
            >
              Simpan Anggaran
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
