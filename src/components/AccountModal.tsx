import React, { useState } from 'react';
import { Account, Currency } from '../types';
import { formatCurrency } from '../utils/formatters';
import { X, Landmark } from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (acc: Omit<Account, 'id'>, id?: string) => void;
  currency: Currency;
  initialAccount?: Account | null;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currency,
  initialAccount,
}) => {
  const [name, setName] = useState(initialAccount?.name || '');
  const [type, setType] = useState<Account['type']>(initialAccount?.type || 'bank');
  const [institution, setInstitution] = useState(initialAccount?.institution || '');
  const [balanceStr, setBalanceStr] = useState(initialAccount?.balance ? initialAccount.balance.toString() : '0');
  const [accountNumber, setAccountNumber] = useState(initialAccount?.accountNumber || '');

  if (!isOpen) return null;

  const parsedBalance = parseFloat(balanceStr) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave(
      {
        name: name.trim(),
        type,
        institution: institution.trim() || 'Pribadi',
        balance: parsedBalance,
        accountNumber: accountNumber.trim() || undefined,
      },
      initialAccount?.id
    );
    onClose();
  };

  return (
    <div
      id="modal-backdrop-account"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171721]/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        id="modal-content-account"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[460px] bg-[#1e1e2a] border border-[#272735] rounded-[16px] p-6 sm:p-8 space-y-6"
      >
        <div className="flex items-center justify-between border-b border-[#272735] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#272735] flex items-center justify-center">
              <Landmark className="w-4 h-4 text-[#5266eb]" />
            </div>
            <div>
              <span className="text-[11px] font-[480] uppercase tracking-wider text-[#c3c3cc]">
                Aset & Perbankan
              </span>
              <h3 className="text-[18px] font-[480] text-[#ededf3]">
                {initialAccount ? 'Ubah Saldo Rekening' : 'Tambah Rekening Baru'}
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
              Nama Rekening / Dompet
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: BCA Prioritas, Bibit Portofolio, GoPay..."
              className="w-full bg-[#171721] border border-[#272735] text-[#ededf3] text-xs rounded-[32px] px-4 py-2.5 placeholder-[#70707d] focus:outline-none focus:border-[#ededf3]/60"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-[480] text-[#c3c3cc] mb-1.5 uppercase tracking-wider">
                Jenis Akun
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-[#171721] border border-[#272735] text-[#ededf3] text-xs rounded-[32px] px-4 py-2.5 focus:outline-none focus:border-[#ededf3]/60 cursor-pointer"
              >
                <option value="bank">Bank / Tabungan</option>
                <option value="investment">Investasi / Reksadana</option>
                <option value="wallet">Dompet Digital / e-Wallet</option>
                <option value="cash">Uang Tunai / Cash</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-[480] text-[#c3c3cc] mb-1.5 uppercase tracking-wider">
                Institusi / Penyedia
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="BCA, Mandiri, Bibit, dll"
                className="w-full bg-[#171721] border border-[#272735] text-[#ededf3] text-xs rounded-[32px] px-4 py-2.5 placeholder-[#70707d] focus:outline-none focus:border-[#ededf3]/60"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-1.5">
              <label className="text-xs font-[480] text-[#c3c3cc] uppercase tracking-wider">
                Saldo Saat Ini
              </label>
              {parsedBalance >= 0 && (
                <span className="text-xs text-[#ededf3] font-[480]">
                  {formatCurrency(parsedBalance, currency)}
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
                value={balanceStr}
                onChange={(e) => setBalanceStr(e.target.value)}
                placeholder="0"
                className="w-full bg-[#171721] border border-[#272735] text-[#ededf3] text-[18px] font-[480] rounded-[32px] pl-12 pr-4 py-2.5 placeholder-[#70707d] focus:outline-none focus:border-[#ededf3]/60"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-[480] text-[#c3c3cc] mb-1.5 uppercase tracking-wider">
              Nomor Akun / Catatan Tambahan (Opsional)
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Contoh: •••• 8912"
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
              className="pill-button-primary text-xs py-2 px-5 cursor-pointer"
            >
              Simpan Rekening
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
