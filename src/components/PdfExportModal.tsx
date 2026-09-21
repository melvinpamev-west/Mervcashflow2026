import React, { useState } from 'react';
import { Account, Budget, Currency, SavingsGoal, Transaction } from '../types';
import { generateFinancialPdfReport, PdfReportTheme } from '../utils/pdfExport';
import { FileDown, X, Check, Printer, Moon, Sun, Sparkles } from 'lucide-react';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  currency: Currency;
  userEmail?: string | null;
  userName?: string | null;
  onSuccessToast?: (msg: string) => void;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  accounts,
  transactions,
  budgets,
  goals,
  currency,
  userEmail,
  userName,
  onSuccessToast,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<PdfReportTheme>('light');
  const [includeAllTx, setIncludeAllTx] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleExport = () => {
    setIsExporting(true);
    try {
      generateFinancialPdfReport({
        accounts,
        transactions,
        budgets,
        goals,
        currency,
        userEmail,
        userName,
        theme: selectedTheme,
        maxTransactions: includeAllTx ? Math.max(transactions.length, 100) : 30,
      });

      if (onSuccessToast) {
        onSuccessToast(
          selectedTheme === 'light'
            ? 'Laporan PDF Eksekutif (Format Bersih) berhasil diunduh'
            : 'Laporan PDF Alpen (Format Gelap) berhasil diunduh'
        );
      }
      onClose();
    } catch (err) {
      console.error('PDF export error:', err);
      if (onSuccessToast) {
        onSuccessToast('Terjadi kesalahan saat memproses laporan PDF');
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      id="pdf-export-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="pdf-export-modal-dialog"
        className="w-full max-w-[480px] bg-[#1a1a26] border border-[#2e2e42] rounded-[24px] shadow-2xl p-6 text-[#ededf3] space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#5266eb]/15 border border-[#5266eb]/40 flex items-center justify-center text-[#5266eb]">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[17px] font-[500] text-[#ededf3]">Unduh Laporan PDF</h3>
              <p className="text-xs text-[#a0a0b2]">Laporan keuangan konsolidasi resmi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#70707d] hover:text-[#ededf3] hover:bg-[#272735] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Theme Format Selection */}
        <div className="space-y-3">
          <label className="text-xs font-[480] uppercase tracking-wider text-[#a0a0b2] block">
            Pilih Format Visual Dokumen
          </label>

          {/* Option 1: Standar Eksekutif (White - Recommended) */}
          <div
            onClick={() => setSelectedTheme('light')}
            className={`p-3.5 rounded-[16px] border cursor-pointer transition-all flex items-start gap-3.5 ${
              selectedTheme === 'light'
                ? 'bg-[#222233] border-[#5266eb] shadow-lg ring-1 ring-[#5266eb]'
                : 'bg-[#1e1e2c] border-[#2b2b3d] hover:border-[#3e3e56]'
            }`}
          >
            <div className="w-9 h-9 rounded-[10px] bg-white text-[#0f172a] flex items-center justify-center shrink-0 shadow-sm border border-slate-300">
              <Sun className="w-4 h-4 text-[#4f46e5]" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-[500] text-white">Format Standar Eksekutif</span>
                <span className="text-[10px] uppercase font-[600] px-2 py-0.5 rounded-full bg-[#10b981]/20 text-[#34d399] border border-[#10b981]/30">
                  Rekomendasi
                </span>
              </div>
              <p className="text-[12px] text-[#c3c3cc] mt-1 leading-relaxed">
                Latar putih bersih dengan teks kontras tinggi (Slate-900). Seluruh angka dan tabel terbaca jelas, tajam, serta siap dicetak.
              </p>
            </div>

            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${
                selectedTheme === 'light'
                  ? 'bg-[#5266eb] border-[#5266eb] text-white'
                  : 'border-[#4e4e68]'
              }`}
            >
              {selectedTheme === 'light' && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
          </div>

          {/* Option 2: Alpen Dark */}
          <div
            onClick={() => setSelectedTheme('dark')}
            className={`p-3.5 rounded-[16px] border cursor-pointer transition-all flex items-start gap-3.5 ${
              selectedTheme === 'dark'
                ? 'bg-[#222233] border-[#5266eb] shadow-lg ring-1 ring-[#5266eb]'
                : 'bg-[#1e1e2c] border-[#2b2b3d] hover:border-[#3e3e56]'
            }`}
          >
            <div className="w-9 h-9 rounded-[10px] bg-[#171721] text-white flex items-center justify-center shrink-0 border border-[#3e3e56]">
              <Moon className="w-4 h-4 text-[#818cf8]" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-[500] text-white">Format Alpen Gelap</span>
                <span className="text-[10px] font-[480] px-2 py-0.5 rounded-full bg-[#3e3e56]/40 text-[#c3c3cc]">
                  Dark Mode
                </span>
              </div>
              <p className="text-[12px] text-[#c3c3cc] mt-1 leading-relaxed">
                Latar kanvas onyx gelap dengan tipografi putih terang. Dilengkapi perbaikan agar background tidak menutupi tulisan.
              </p>
            </div>

            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${
                selectedTheme === 'dark'
                  ? 'bg-[#5266eb] border-[#5266eb] text-white'
                  : 'border-[#4e4e68]'
              }`}
            >
              {selectedTheme === 'dark' && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
          </div>
        </div>

        {/* Options checklist */}
        <div className="p-3 bg-[#1e1e2c] border border-[#2b2b3d] rounded-[14px] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Printer className="w-4 h-4 text-[#5266eb]" />
            <span className="text-xs text-[#ededf3] font-[450]">
              Sertakan seluruh riwayat transaksi ({transactions.length} transaksi)
            </span>
          </div>
          <input
            type="checkbox"
            checked={includeAllTx}
            onChange={(e) => setIncludeAllTx(e.target.checked)}
            className="w-4 h-4 accent-[#5266eb] rounded cursor-pointer"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#2b2b3d]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-[40px] text-xs font-[480] text-[#c3c3cc] hover:text-[#ededf3] hover:bg-[#272735] transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="pill-button-primary flex items-center gap-2 text-xs py-2 px-5 font-[500]"
          >
            {isExporting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Membuat PDF...</span>
              </>
            ) : (
              <>
                <FileDown className="w-3.5 h-3.5" />
                <span>Unduh PDF Sekarang</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
