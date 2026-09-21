import React, { useMemo } from 'react';
import { Currency, Transaction } from '../types';
import { formatCurrency } from '../utils/formatters';
import { TrendingUp, PieChart, ArrowUpRight, ArrowDownRight, Compass } from 'lucide-react';

interface AnalisisViewProps {
  transactions: Transaction[];
  currency: Currency;
}

export const AnalisisView: React.FC<AnalisisViewProps> = ({ transactions, currency }) => {
  // Compute totals
  const totalIncome = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalExpense = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netSavings / totalIncome) * 100)) : 0;

  // Category breakdown for expenses
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    transactions.forEach((tx) => {
      if (tx.type === 'expense') {
        if (!map[tx.category]) {
          map[tx.category] = { total: 0, count: 0 };
        }
        map[tx.category].total += tx.amount;
        map[tx.category].count += 1;
      }
    });

    return Object.entries(map)
      .map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
        percentage: totalExpense > 0 ? Math.round((data.total / totalExpense) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [transactions, totalExpense]);

  return (
    <div id="view-analisis" className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-[12px] font-[480] uppercase tracking-wider text-[#c3c3cc]">
          Observatorium Analitik
        </span>
        <h2 className="text-[28px] font-[480] text-[#ededf3] tracking-[0.015em]">
          Analisis Arus Kas & Pengeluaran
        </h2>
      </div>

      {/* Top 3 Stat Cards in Graphite */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="graphite-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-[480] uppercase tracking-wider text-[#c3c3cc]">
              Total Pemasukan
            </span>
            <ArrowUpRight className="w-4 h-4 text-[#ededf3]" />
          </div>
          <p className="text-[28px] font-[480] text-[#ededf3] tracking-[0.01em]">
            +{formatCurrency(totalIncome, currency)}
          </p>
          <p className="text-[12px] text-[#c3c3cc] mt-1">
            Dari {transactions.filter((t) => t.type === 'income').length} transaksi masuk
          </p>
        </div>

        <div className="graphite-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-[480] uppercase tracking-wider text-[#c3c3cc]">
              Total Pengeluaran
            </span>
            <ArrowDownRight className="w-4 h-4 text-[#c3c3cc]" />
          </div>
          <p className="text-[28px] font-[480] text-[#ededf3] tracking-[0.01em]">
            -{formatCurrency(totalExpense, currency)}
          </p>
          <p className="text-[12px] text-[#c3c3cc] mt-1">
            Dari {transactions.filter((t) => t.type === 'expense').length} pengeluaran tercatat
          </p>
        </div>

        <div className="graphite-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-[480] uppercase tracking-wider text-[#c3c3cc]">
              Tingkat Tabungan (Savings Rate)
            </span>
            <TrendingUp className="w-4 h-4 text-[#5266eb]" />
          </div>
          <p className="text-[28px] font-[480] text-[#ededf3] tracking-[0.01em]">
            {savingsRate}%
          </p>
          <p className="text-[12px] text-[#c3c3cc] mt-1">
            Surplus bersih {formatCurrency(netSavings, currency)}
          </p>
        </div>
      </div>

      {/* Category Breakdown Breakdown Graphite Card */}
      <div className="graphite-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[12px] font-[480] uppercase tracking-wider text-[#c3c3cc]">
              Distribusi Kategori
            </span>
            <h3 className="text-[20px] font-[480] text-[#ededf3]">
              Komposisi Pengeluaran
            </h3>
          </div>
          <span className="text-xs text-[#c3c3cc]">
            Total terdistribusi: {formatCurrency(totalExpense, currency)}
          </span>
        </div>

        {/* Stacked Visual Bar Chart in monochrome + Cobalt */}
        {categoryBreakdown.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <p className="text-sm font-[450] text-[#ededf3]">Belum ada pengeluaran tercatat</p>
            <p className="text-xs text-[#c3c3cc] max-w-sm mx-auto">
              Visualisasi distribusi kategori pengeluaran akan otomatis terbentuk saat Anda mencatat pengeluaran.
            </p>
          </div>
        ) : (
          <>
            <div className="w-full h-4 bg-[#171721] rounded-[32px] overflow-hidden flex border border-[#272735]">
              {categoryBreakdown.map((item, index) => {
                const colors = [
                  '#5266eb',
                  '#ededf3',
                  '#c3c3cc',
                  '#70707d',
                  '#3e3e52',
                  '#2b2b3a',
                ];
                const color = colors[index % colors.length];

                return (
                  <div
                    key={item.category}
                    title={`${item.category}: ${item.percentage}% (${formatCurrency(item.total, currency)})`}
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: color,
                    }}
                    className="h-full transition-all hover:opacity-80 cursor-pointer"
                  />
                );
              })}
            </div>

            {/* Breakdown Items List */}
            <div className="divide-y divide-[#272735]/70 pt-2">
              {categoryBreakdown.map((item, index) => {
                const colors = [
                  '#5266eb',
                  '#ededf3',
                  '#c3c3cc',
                  '#70707d',
                  '#3e3e52',
                  '#2b2b3a',
                ];
                const color = colors[index % colors.length];

                return (
                  <div key={item.category} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-[14px] font-[450] text-[#ededf3]">
                        {item.category}
                      </span>
                      <span className="text-[12px] text-[#70707d]">
                        ({item.count} transaksi)
                      </span>
                    </div>

                    <div className="text-right flex items-baseline gap-3">
                      <span className="text-[14px] font-[480] text-[#ededf3]">
                        {formatCurrency(item.total, currency)}
                      </span>
                      <span className="text-xs text-[#c3c3cc] w-10 text-right">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Financial Health Commentary in Alpine Style */}
      <div className="graphite-card flex flex-col md:flex-row items-start gap-6">
        <div className="w-12 h-12 rounded-full bg-[#272735] flex items-center justify-center shrink-0">
          <Compass className="w-6 h-6 text-[#5266eb]" />
        </div>
        <div className="space-y-2">
          <h4 className="text-[18px] font-[480] text-[#ededf3]">
            Catatan Observatorium Finansial
          </h4>
          <p className="text-[14px] text-[#c3c3cc] leading-relaxed">
            Arus kas bulanan Anda saat ini berada dalam rasio surplus positif ({savingsRate}% tabungan). Pengeluaran terbesar didominasi oleh Tempat Tinggal dan Belanja Bahan Pangan Utama. Disiplin likuiditas terjaga dengan sangat baik untuk mendukung pencapaian sasaran tabungan jangka menengah.
          </p>
        </div>
      </div>
    </div>
  );
};
