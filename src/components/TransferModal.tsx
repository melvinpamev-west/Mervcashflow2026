import React, { useState } from 'react';
import { Account, Currency } from '../types';
import { formatCurrency } from '../utils/formatters';
import { X, ArrowRightLeft } from 'lucide-react';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  currency: Currency;
  onTransfer: (sourceId: string, targetId: string, amount: number, notes: string) => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  accounts,
  currency,
  onTransfer,
}) => {
  const [sourceId, setSourceId] = useState<string>(accounts[0]?.id || '');
  const [targetId, setTargetId] = useState<string>(accounts[1]?.id || accounts[0]?.id || '');
  const [amountStr, setAmountStr] = useState<string>('');
  const [notes, setNotes] = useState<string>('Transfer antar rekening pribadi');

  if (!isOpen) return null;

  const parsedAmount = parseFloat(amountStr) || 0;
  const sourceAccount = accounts.find((a) => a.id === sourceId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0 || sourceId === targetId) return;
    onTransfer(sourceId, targetId, parsedAmount, notes);
    onClose();
  };

  return (
    <div
      id="modal-backdrop-transfer"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171721]/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        id="modal-content-transfer"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[460px] bg-[#1e1e2a] border border-[#272735] rounded-[16px] p-6 sm:p-8 space-y-6"
      >
        <div className="flex items-center justify-between border-b border-[#272735] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#272735] flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4 text-[#5266eb]" />
            </div>
            <div>
              <span className="text-[11px] font-[480] uppercase tracking-wider text-[#c3c3cc]">
                Realokasi Likuiditas
              </span>
              <h3 className="text-[18px] font-[480] text-[#ededf3]">
                Transfer Antar Rekening
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
              Dari Rekening Asal
            </label>
            <select
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              className="w-full bg-[#171721] border border-[#272735] text-[#ededf3] text-xs rounded-[32px] px-4 py-2.5 focus:outline-none focus:border-[#ededf3]/60 cursor-pointer"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} — {formatCurrency(acc.balance, currency)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-[480] text-[#c3c3cc] mb-1.5 uppercase tracking-wider">
              Ke Rekening Tujuan
            </label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full bg-[#171721] border border-[#272735] text-[#ededf3] text-xs rounded-[32px] px-4 py-2.5 focus:outline-none focus:border-[#ededf3]/60 cursor-pointer"
            >
              {accounts
                .filter((a) => a.id !== sourceId)
                .map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({formatCurrency(acc.balance, currency)})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-1.5">
              <label className="text-xs font-[480] text-[#c3c3cc] uppercase tracking-wider">
                Nominal Transfer
              </label>
              {sourceAccount && (
                <span className="text-[11px] text-[#c3c3cc]">
                  Tersedia: {formatCurrency(sourceAccount.balance, currency)}
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
                className="w-full bg-[#171721] border border-[#272735] text-[#ededf3] text-[18px] font-[480] rounded-[32px] pl-12 pr-4 py-2.5 placeholder-[#70707d] focus:outline-none focus:border-[#ededf3]/60"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-[480] text-[#c3c3cc] mb-1.5 uppercase tracking-wider">
              Keterangan
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#171721] border border-[#272735] text-[#ededf3] text-xs rounded-[32px] px-4 py-2.5 placeholder-[#70707d] focus:outline-none focus:border-[#ededf3]/60"
            />
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
              disabled={parsedAmount <= 0 || sourceId === targetId}
              className="pill-button-primary text-xs py-2 px-5 disabled:opacity-50 cursor-pointer"
            >
              Kirim Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
