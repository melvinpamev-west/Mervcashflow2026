import { Account, Budget, SavingsGoal, Transaction } from '../types';

// Initial state is empty for real, permanent user usage
export const INITIAL_ACCOUNTS: Account[] = [];

export const INITIAL_BUDGETS: Budget[] = [];

export const INITIAL_GOALS: SavingsGoal[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

// Optional sample data template if user specifically wants demo simulation
export const SAMPLE_ACCOUNTS: Account[] = [
  {
    id: 'acc-1',
    name: 'BCA Utama (Gaji & Harian)',
    type: 'bank',
    institution: 'Bank Central Asia',
    balance: 38500000,
    accountNumber: '•••• 8921',
  },
  {
    id: 'acc-2',
    name: 'Kantong Dana Darurat',
    type: 'bank',
    institution: 'Bank Jago',
    balance: 50000000,
    accountNumber: '•••• 4102',
  },
  {
    id: 'acc-3',
    name: 'Bibit Portofolio Reksadana & SBN',
    type: 'investment',
    institution: 'Bibit Reksadana',
    balance: 65400000,
    accountNumber: 'Portofolio Utama',
  },
  {
    id: 'acc-4',
    name: 'GoPay & Dompet Digital',
    type: 'wallet',
    institution: 'GoPay / OVO',
    balance: 3250000,
    accountNumber: '0812-••••-9011',
  },
  {
    id: 'acc-5',
    name: 'Kas Tunai Dompet Fisik',
    type: 'cash',
    institution: 'Uang Fisik',
    balance: 1500000,
  },
];

export const SAMPLE_BUDGETS: Budget[] = [
  {
    id: 'bud-1',
    category: 'Makanan & Minuman',
    monthlyLimit: 4500000,
  },
  {
    id: 'bud-2',
    category: 'Tempat Tinggal & Tagihan',
    monthlyLimit: 6000000,
  },
  {
    id: 'bud-3',
    category: 'Belanja & Gaya Hidup',
    monthlyLimit: 3500000,
  },
  {
    id: 'bud-4',
    category: 'Transportasi',
    monthlyLimit: 1500000,
  },
  {
    id: 'bud-5',
    category: 'Hiburan & Hobi',
    monthlyLimit: 2000000,
  },
  {
    id: 'bud-6',
    category: 'Kesehatan & Asuransi',
    monthlyLimit: 1800000,
  },
];

export const SAMPLE_GOALS: SavingsGoal[] = [
  {
    id: 'goal-1',
    title: 'Dana Darurat 6 Bulan',
    targetAmount: 60000000,
    currentAmount: 50000000,
    targetDate: '2026-12-31',
  },
];

export const SAMPLE_TRANSACTIONS: Transaction[] = [];
