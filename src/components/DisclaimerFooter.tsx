import React from 'react';
import { RotateCcw, Download, Shield, FileDown } from 'lucide-react';

interface DisclaimerFooterProps {
  onResetData: () => void;
  onExportJson: () => void;
  onDownloadPdf?: () => void;
}

export const DisclaimerFooter: React.FC<DisclaimerFooterProps> = ({
  onResetData,
  onExportJson,
  onDownloadPdf,
}) => {
  return (
    <footer
      id="main-disclaimer-footer"
      className="w-full bg-[#171721] border-t border-[#272735]/60 pt-16 pb-12 mt-20"
    >
      <div className="max-w-[1200px] mx-auto px-6 space-y-8">
        {/* Top summary row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="relative w-6 h-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-[#ededf3]/50" />
              <div className="w-3 h-3 rounded-full border border-[#ededf3]/70" />
              <div className="w-1 h-1 rounded-full bg-[#5266eb]" />
            </div>
            <span className="font-['Inter'] tracking-[0.16em] text-[14px] font-[480] text-[#ededf3] uppercase">
              MERVFLOW
            </span>
            <span className="text-[12px] text-[#c3c3cc]">
              • Observatorium Finansial Pribadi
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onDownloadPdf && (
              <button
                onClick={onDownloadPdf}
                className="pill-button-secondary text-xs py-1.5 px-3.5 flex items-center gap-1.5 text-[#ededf3] border border-[#5266eb]/40 hover:bg-[#5266eb]/10"
              >
                <FileDown className="w-3.5 h-3.5 text-[#5266eb]" />
                <span>Unduh Laporan (PDF)</span>
              </button>
            )}
            <button
              onClick={onExportJson}
              className="pill-button-secondary text-xs py-1.5 px-3.5 flex items-center gap-1.5 text-[#c3c3cc] hover:text-[#ededf3]"
            >
              <Download className="w-3 h-3" />
              <span>Cadangkan Data (JSON)</span>
            </button>
            <button
              onClick={onResetData}
              className="pill-button-secondary text-xs py-1.5 px-3.5 flex items-center gap-1.5 text-[#c3c3cc] hover:text-[#ededf3]"
              title="Kosongkan seluruh data untuk memulai lembaran baru"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Bersihkan Data</span>
            </button>
          </div>
        </div>

        {/* Disclaimer Banner */}
        <div className="pt-6 border-t border-[#272735]/40 space-y-3">
          <p className="text-[12px] font-[480] text-[#c3c3cc]/80 tracking-[0.01em] leading-relaxed">
            Kedaulatan Finansial & Keamanan Firebase: MervFlow Money menyimpan data Anda secara aman menggunakan Firebase Auth & Firestore, dengan cadangan offline otomatis pada peramban. Anda memiliki kontrol penuh atas seluruh saldo, riwayat transaksi, serta ekspor dokumen PDF.
          </p>
          <p className="text-[12px] font-[480] text-[#70707d] tracking-[0.01em]">
            © {new Date().getFullYear()} MERVFLOW Financial Architecture. Dirancang mengikuti kaidah visual Alpine Banking at Blue Hour.
          </p>
        </div>
      </div>
    </footer>
  );
};
