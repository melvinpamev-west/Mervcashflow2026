import React, { useState } from 'react';
import { Currency } from '../types';
import { formatCurrency } from '../utils/formatters';
import { ArrowUpRight, ArrowDownRight, Wallet, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  totalNetWorth: number;
  totalIncomeMonth: number;
  totalExpenseMonth: number;
  currency: Currency;
  onQuickAdd: (text: string) => void;
  onOpenNewTransaction: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  totalNetWorth,
  totalIncomeMonth,
  totalExpenseMonth,
  currency,
  onQuickAdd,
  onOpenNewTransaction,
}) => {
  const [quickInput, setQuickInput] = useState('');
  const netCashflow = totalIncomeMonth - totalExpenseMonth;

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) {
      onOpenNewTransaction();
      return;
    }
    onQuickAdd(quickInput.trim());
    setQuickInput('');
  };

  return (
    <section
      id="hero-observatory"
      className="relative w-full min-h-[580px] lg:min-h-[640px] flex items-center justify-center pt-24 pb-16 overflow-hidden border-b border-[#272735]/40"
    >
      {/* Photographic Alpine Background at blue hour with dark overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 transform scale-105 transition-transform duration-1000"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop')`,
        }}
      >
        {/* Subtle dark overlay from design tokens: #171721 */}
        <div className="absolute inset-0 bg-[#171721]/80 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#171721]/70 via-[#171721]/85 to-[#171721]" />
      </div>

      {/* Atmospheric blue hour glow vignette */}
      <div className="absolute w-[600px] h-[300px] rounded-full bg-[#5266eb]/10 blur-[120px] pointer-events-none -top-10 left-1/2 -translate-x-1/2 z-0" />

      {/* Centered Content Stack (Max-width ~640px per design2.md) */}
      <div className="relative z-10 max-w-[680px] w-full mx-auto px-6 text-center flex flex-col items-center">
        {/* Subtitle / Eyebrow in arcadia weight 400 */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[40px] bg-[#1e1e2a]/70 border border-[#272735] text-[#c3c3cc] text-[13px] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5266eb]" />
          <span>Kekayaan Bersih Terkini</span>
        </div>

        {/* Display Typography (arcadiaDisplay 65px equivalent, weight 480) */}
        <h1
          id="hero-net-worth-display"
          className="text-[44px] sm:text-[58px] md:text-[65px] font-[480] text-[#ffffff] tracking-[0.01em] leading-[1.1] mb-3 select-all"
        >
          {formatCurrency(totalNetWorth, currency)}
        </h1>

        {/* Subtext in arcadia at 18px weight 480 */}
        <p className="text-[17px] sm:text-[18px] font-[400] text-[#ededf3]/90 leading-[1.45] max-w-[540px] mb-8">
          Observatorium keuangan pribadi. Mengatur saldo multi-rekening, arus kas harian, dan sasaran masa depan dengan ketenangan alpine.
        </p>

        {/* Metric Pill Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 mb-8">
          <div className="flex items-center gap-2 px-4 py-2 rounded-[40px] bg-[#1e1e2a]/90 border border-[#272735]">
            <ArrowUpRight className="w-4 h-4 text-[#ededf3]" />
            <span className="text-xs text-[#c3c3cc]">Masuk:</span>
            <span className="text-sm font-[480] text-[#ededf3]">
              +{formatCurrency(totalIncomeMonth, currency)}
            </span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-[40px] bg-[#1e1e2a]/90 border border-[#272735]">
            <ArrowDownRight className="w-4 h-4 text-[#c3c3cc]" />
            <span className="text-xs text-[#c3c3cc]">Keluar:</span>
            <span className="text-sm font-[480] text-[#ededf3]">
              -{formatCurrency(totalExpenseMonth, currency)}
            </span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-[40px] bg-[#1e1e2a]/90 border border-[#272735]">
            <Wallet className="w-4 h-4 text-[#5266eb]" />
            <span className="text-xs text-[#c3c3cc]">Arus Kas Bersih:</span>
            <span
              className={`text-sm font-[480] ${
                netCashflow >= 0 ? 'text-[#ededf3]' : 'text-[#ededf3]'
              }`}
            >
              {netCashflow >= 0 ? '+' : ''}
              {formatCurrency(netCashflow, currency)}
            </span>
          </div>
        </div>

        {/* Mercury Attached Input Capture (Pill Left-Half + Cobalt Button Right-Half) */}
        <form
          id="hero-quick-capture"
          onSubmit={handleQuickSubmit}
          className="flex w-full max-w-[500px] items-stretch shadow-none"
        >
          <input
            id="hero-quick-input"
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            placeholder="Catat cepat (contoh: Kopi 35000 atau Makan 50k)..."
            className="flex-1 bg-[#171721]/80 backdrop-blur-md border border-[#ededf3]/70 border-r-0 rounded-l-[32px] px-5 py-3.5 text-[15px] font-[400] text-[#ededf3] placeholder-[#c3c3cc] focus:outline-none focus:border-[#ededf3] transition-colors"
          />
          <button
            id="hero-quick-submit-btn"
            type="submit"
            className="bg-[#5266eb] hover:bg-[#5266eb]/90 text-white rounded-r-[32px] px-6 py-3.5 text-[15px] font-[480] transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer select-none"
          >
            <Sparkles className="w-4 h-4" />
            <span>Catat Cepat</span>
          </button>
        </form>

        <p className="text-[12px] text-[#c3c3cc] mt-2.5">
          Atau klik <button type="button" onClick={onOpenNewTransaction} className="underline text-[#ededf3] hover:text-[#5266eb] cursor-pointer">Catat Transaksi Lengkap</button> untuk detail kategori & rekening.
        </p>
      </div>
    </section>
  );
};
