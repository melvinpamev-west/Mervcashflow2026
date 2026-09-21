import React from 'react';
import { Budget, Currency, Transaction } from '../types';
import { formatCurrency, getDaysRemainingInMonth } from '../utils/formatters';
import { ShieldCheck, Plus, AlertCircle, Calendar, Sparkles } from 'lucide-react';

interface AnggaranViewProps {
  budgets: Budget[];
  transactions: Transaction[];
  currency: Currency;
  onOpenAddBudget: () => void;
  onEditBudget: (budget: Budget) => void;
}

export const AnggaranView: React.FC<AnggaranViewProps> = ({
  budgets,
  transactions,
  currency,
  onOpenAddBudget,
  onEditBudget,
}) => {
  const daysLeft = getDaysRemainingInMonth();

  // Calculate actual spending per category from transactions
  const categorySpendingMap: Record<string, number> = {};
  transactions.forEach((tx) => {
    if (tx.type === 'expense') {
      categorySpendingMap[tx.category] = (categorySpendingMap[tx.category] || 0) + tx.amount;
    }
  });

  const totalLimit = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const totalSpent = Object.values(categorySpendingMap).reduce((sum, v) => sum + v, 0);
  const remainingBudget = totalLimit - totalSpent;
  const overallPercentage = Math.min(100, Math.round((totalSpent / (totalLimit || 1)) * 100));

  return (
    <div id="view-anggaran" className="space-y-8">
      {/* Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[12px] font-[480] uppercase tracking-wider text-[#c3c3cc]">
            Batas & Disiplin Belanja
          </span>
          <h2 className="text-[28px] font-[480] text-[#ededf3] tracking-[0.015em]">
            Anggaran Bulanan
          </h2>
        </div>

        <button
          onClick={onOpenAddBudget}
          className="pill-button-primary text-xs py-2 px-4 flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Atur Anggaran Baru</span>
        </button>
      </div>

      {/* Main Budget Summary Graphite Card */}
      <div className="graphite-card grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-[480] uppercase tracking-wider text-[#c3c3cc]">
              Total Alokasi Anggaran
            </span>
            <span className="text-xs text-[#c3c3cc] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#5266eb]" />
              Sisa {daysLeft} hari di bulan ini
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <h3 className="text-[36px] font-[480] text-[#ededf3] tracking-[0.01em]">
              {formatCurrency(totalSpent, currency)}
            </h3>
            <span className="text-[16px] text-[#c3c3cc]">
              / {formatCurrency(totalLimit, currency)}
            </span>
          </div>

          {/* Master Progress Bar */}
          <div className="w-full h-3 bg-[#171721] rounded-full overflow-hidden border border-[#272735]">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                overallPercentage > 90 ? 'bg-[#c3c3cc]' : 'bg-[#5266eb]'
              }`}
              style={{ width: `${overallPercentage}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-[#c3c3cc]">
            <span>{overallPercentage}% terpakai</span>
            <span>
              Sisa kuota:{' '}
              <strong className="text-[#ededf3] font-[480]">
                {formatCurrency(Math.max(0, remainingBudget), currency)}
              </strong>
            </span>
          </div>
        </div>

        {/* 50/30/20 Alpine Recommendation Box */}
        <div className="bg-[#171721] rounded-[12px] p-5 border border-[#272735] space-y-3">
          <div className="flex items-center gap-2 text-xs font-[480] text-[#ededf3]">
            <Sparkles className="w-3.5 h-3.5 text-[#5266eb]" />
            <span>Kaidah Finansial 50/30/20</span>
          </div>
          <p className="text-[12px] text-[#c3c3cc] leading-relaxed">
            Idealnya: 50% untuk kebutuhan pokok, 30% untuk gaya hidup/keinginan, dan 20% untuk tabungan & investasi masa depan.
          </p>
          <div className="text-[11px] text-[#70707d] pt-1">
            Status Anda: Pengeluaran terjaga dengan sehat di bawah limit.
          </div>
        </div>
      </div>

      {/* Category Budgets Grid */}
      {budgets.length === 0 ? (
        <div className="graphite-card text-center py-16 px-6 space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#272735] flex items-center justify-center mx-auto text-[#5266eb]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-[480] text-[#ededf3]">Belum Ada Anggaran Dibuat</h3>
          <p className="text-xs text-[#c3c3cc] max-w-md mx-auto leading-relaxed">
            Tetapkan batas pengeluaran bulanan per kategori (seperti Makanan & Minuman, Belanja, Transportasi) untuk menjaga kesehatan finansial Anda.
          </p>
          <button
            onClick={onOpenAddBudget}
            className="pill-button-primary text-xs py-2.5 px-6 inline-flex items-center gap-1.5 mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Anggaran Pertama</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgets.map((b) => {
            const spent = categorySpendingMap[b.category] || 0;
            const percentage = Math.min(100, Math.round((spent / b.monthlyLimit) * 100));
            const isOver = spent > b.monthlyLimit;
            const remaining = b.monthlyLimit - spent;

            return (
              <div
                key={b.id}
                className="graphite-card flex flex-col justify-between group hover:border-[#70707d]/30 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-[17px] font-[480] text-[#ededf3]">
                        {b.category}
                      </h4>
                      <span className="text-[12px] text-[#c3c3cc]">
                        Batas: {formatCurrency(b.monthlyLimit, currency)} / bulan
                      </span>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-[40px] text-xs font-[450] ${
                        isOver
                          ? 'bg-[#272735] text-[#ededf3] border border-[#70707d]'
                          : 'bg-[#171721] text-[#ededf3] border border-[#272735]'
                      }`}
                    >
                      {percentage}%
                    </span>
                  </div>

                  <div className="py-2">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-[#c3c3cc]">Terpakai</span>
                      <span className="text-[#ededf3] font-[480]">
                        {formatCurrency(spent, currency)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-[#171721] rounded-full overflow-hidden border border-[#272735]">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          isOver ? 'bg-[#c3c3cc]' : 'bg-[#5266eb]'
                        }`}
                        style={{ width: `${Math.min(100, percentage)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[12px] pt-1">
                    {isOver ? (
                      <span className="text-[#ededf3] flex items-center gap-1 font-[480]">
                        <AlertCircle className="w-3.5 h-3.5 text-[#c3c3cc]" />
                        Melebihi batas {formatCurrency(spent - b.monthlyLimit, currency)}
                      </span>
                    ) : (
                      <span className="text-[#c3c3cc]">
                        Tersisa {formatCurrency(remaining, currency)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-[#272735]/60 flex justify-end">
                  <button
                    onClick={() => onEditBudget(b)}
                    className="text-xs text-[#c3c3cc] hover:text-[#ededf3] transition-colors cursor-pointer"
                  >
                    Sesuaikan Batas Limit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
