import React, { useState, useEffect } from 'react';
import {
  Account,
  Budget,
  Currency,
  PdfExportScope,
  RabProject,
  SavingsGoal,
  Transaction,
} from '../types';
import {
  generateFinancialPdfReport,
  generateRabPdfReport,
  PdfReportTheme,
} from '../utils/pdfExport';
import {
  FileDown,
  X,
  Check,
  Printer,
  Moon,
  Sun,
  Calculator,
  Wallet,
  ArrowRightLeft,
  ShieldCheck,
  Layers,
} from 'lucide-react';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  rabProjects?: RabProject[];
  defaultScope?: PdfExportScope;
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
  rabProjects = [],
  defaultScope = 'keuangan',
  currency,
  userEmail,
  userName,
  onSuccessToast,
}) => {
  const [selectedScope, setSelectedScope] = useState<PdfExportScope>(defaultScope);
  const [selectedRabId, setSelectedRabId] = useState<string>('');
  const [selectedTheme, setSelectedTheme] = useState<PdfReportTheme>('light');
  const [includeAllTx, setIncludeAllTx] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedScope(defaultScope);
      if (rabProjects.length > 0 && !selectedRabId) {
        setSelectedRabId(rabProjects[0].id);
      }
    }
  }, [isOpen, defaultScope, rabProjects, selectedRabId]);

  if (!isOpen) return null;

  const handleExport = () => {
    setIsExporting(true);
    try {
      if (selectedScope === 'rab') {
        const targetProject =
          rabProjects.find((p) => p.id === selectedRabId) || rabProjects[0];

        if (!targetProject) {
          if (onSuccessToast) {
            onSuccessToast('Belum ada proyek RAB untuk diunduh. Silakan buat proyek RAB terlebih dahulu.');
          }
          setIsExporting(false);
          return;
        }

        generateRabPdfReport(
          targetProject,
          currency,
          userEmail,
          userName,
          selectedTheme
        );

        if (onSuccessToast) {
          onSuccessToast(`Laporan PDF Khusus RAB "${targetProject.title}" berhasil diunduh`);
        }
      } else {
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
          scope: selectedScope,
        });

        const scopeTitle =
          selectedScope === 'rekening'
            ? 'Khusus Rekening & E-Wallet'
            : selectedScope === 'transaksi'
            ? 'Khusus Transaksi'
            : selectedScope === 'anggaran'
            ? 'Khusus Anggaran Bulanan'
            : 'Khusus Keuangan Utama';

        if (onSuccessToast) {
          onSuccessToast(`Laporan PDF ${scopeTitle} berhasil diunduh`);
        }
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

  const scopeOptions: {
    id: PdfExportScope;
    title: string;
    desc: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'keuangan',
      title: 'Khusus Laporan Keuangan Saja',
      desc: 'Ringkasan kekayaan, rekening, anggaran & riwayat transaksi (tanpa RAB).',
      icon: <Layers className="w-4 h-4 text-[#5266eb]" />,
    },
    {
      id: 'rab',
      title: 'Khusus Laporan RAB (Proyek) Saja',
      desc: 'Hanya mencetak tabel Rencana Anggaran Biaya (Bangun Rumah / Renovasi / Usaha).',
      icon: <Calculator className="w-4 h-4 text-[#10b981]" />,
    },
    {
      id: 'rekening',
      title: 'Khusus Saldo Rekening & E-Wallet Saja',
      desc: 'Hanya mencetak daftar posisi saldo Bank, GoPay, OVO, DANA & Investasi.',
      icon: <Wallet className="w-4 h-4 text-[#f59e0b]" />,
    },
    {
      id: 'transaksi',
      title: 'Khusus Riwayat Transaksi Saja',
      desc: 'Hanya mencetak tabel mutasi pemasukan, pengeluaran & transfer.',
      icon: <ArrowRightLeft className="w-4 h-4 text-[#38bdf8]" />,
    },
    {
      id: 'anggaran',
      title: 'Khusus Anggaran Bulanan Saja',
      desc: 'Hanya mencetak tabel batas pagu anggaran bulanan vs pemakaian.',
      icon: <ShieldCheck className="w-4 h-4 text-[#a855f7]" />,
    },
  ];

  return (
    <div
      id="pdf-export-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="pdf-export-modal-dialog"
        className="w-full max-w-[540px] bg-[#1a1a26] border border-[#2e2e42] rounded-[24px] shadow-2xl p-6 text-[#ededf3] space-y-5 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#5266eb]/15 border border-[#5266eb]/40 flex items-center justify-center text-[#5266eb]">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[17px] font-[500] text-[#ededf3]">
                Unduh Laporan PDF Sesuai Keperluan
              </h3>
              <p className="text-xs text-[#a0a0b2]">
                Pilih jenis dokumen spesifik agar tidak tercampur satu sama lain
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#70707d] hover:text-[#ededf3] hover:bg-[#272735] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Scope Selection (Per Keperluan) */}
        <div className="space-y-2">
          <label className="text-xs font-[500] uppercase tracking-wider text-[#a0a0b2] block">
            1. Pilih Jenis Dokumen Laporan yang Diinginkan
          </label>
          <div className="grid grid-cols-1 gap-2">
            {scopeOptions.map((opt) => {
              const isSelected = selectedScope === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedScope(opt.id)}
                  className={`p-3 rounded-[14px] border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#222233] border-[#5266eb] ring-1 ring-[#5266eb]'
                      : 'bg-[#1e1e2c] border-[#2b2b3d] hover:border-[#3e3e56]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-[10px] bg-[#171721] border border-[#2b2b3d] flex items-center justify-center shrink-0">
                      {opt.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-[600] text-[#ededf3]">{opt.title}</div>
                      <div className="text-[11px] text-[#c3c3cc] truncate">{opt.desc}</div>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                      isSelected
                        ? 'bg-[#5266eb] border-[#5266eb] text-white'
                        : 'border-[#4e4e68]'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* If RAB is selected, allow picking specific RAB Project */}
        {selectedScope === 'rab' && (
          <div className="p-3.5 rounded-[14px] bg-[#1e1e2c] border border-[#10b981]/40 space-y-2">
            <label className="text-xs font-[500] text-[#ededf3] block">
              Pilih Proyek RAB yang Akan Dicetak ke PDF:
            </label>
            {rabProjects.length > 0 ? (
              <select
                value={selectedRabId}
                onChange={(e) => setSelectedRabId(e.target.value)}
                className="w-full bg-[#171721] border border-[#2b2b3d] rounded-[10px] px-3 py-2 text-xs text-[#ededf3] focus:outline-none focus:border-[#5266eb]"
              >
                {rabProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.items.length} item keperluan)
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-amber-400">
                Anda belum memiliki proyek RAB. Buka menu &quot;Pembuatan RAB&quot; untuk membuat RAB terlebih dahulu.
              </p>
            )}
          </div>
        )}

        {/* 2. Theme Format Selection */}
        <div className="space-y-2">
          <label className="text-xs font-[500] uppercase tracking-wider text-[#a0a0b2] block">
            2. Pilih Tampilan Warna Kertas PDF
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <div
              onClick={() => setSelectedTheme('light')}
              className={`p-3 rounded-[14px] border cursor-pointer transition-all flex items-center gap-2.5 ${
                selectedTheme === 'light'
                  ? 'bg-[#222233] border-[#5266eb] ring-1 ring-[#5266eb]'
                  : 'bg-[#1e1e2c] border-[#2b2b3d]'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-[600] text-[#ededf3]">Terang (Siap Cetak)</div>
                <div className="text-[10px] text-[#c3c3cc]">Latar putih, teks hitam tajam</div>
              </div>
            </div>

            <div
              onClick={() => setSelectedTheme('dark')}
              className={`p-3 rounded-[14px] border cursor-pointer transition-all flex items-center gap-2.5 ${
                selectedTheme === 'dark'
                  ? 'bg-[#222233] border-[#5266eb] ring-1 ring-[#5266eb]'
                  : 'bg-[#1e1e2c] border-[#2b2b3d]'
              }`}
            >
              <Moon className="w-4 h-4 text-indigo-400 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-[600] text-[#ededf3]">Gelap (Observatory)</div>
                <div className="text-[10px] text-[#c3c3cc]">Latar gelap, teks putih terang</div>
              </div>
            </div>
          </div>
        </div>

        {/* Options checklist for Transaction count when applicable */}
        {(selectedScope === 'keuangan' || selectedScope === 'transaksi') && (
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
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#2b2b3d]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-[40px] text-xs font-[480] text-[#c3c3cc] hover:text-[#ededf3] hover:bg-[#272735] transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting || (selectedScope === 'rab' && rabProjects.length === 0)}
            className="pill-button-primary flex items-center gap-2 text-xs py-2.5 px-5 font-[500] disabled:opacity-40 cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>
              {selectedScope === 'rab'
                ? 'Unduh PDF RAB Saja'
                : selectedScope === 'rekening'
                ? 'Unduh PDF Rekening Saja'
                : selectedScope === 'transaksi'
                ? 'Unduh PDF Transaksi Saja'
                : selectedScope === 'anggaran'
                ? 'Unduh PDF Anggaran Saja'
                : 'Unduh PDF Keuangan Saja'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
