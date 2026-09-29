export type TransactionType = 'expense' | 'income' | 'transfer';

export type ExpenseCategory =
  | 'Makanan & Minuman'
  | 'Tempat Tinggal & Tagihan'
  | 'Transportasi'
  | 'Belanja & Gaya Hidup'
  | 'Kesehatan & Asuransi'
  | 'Hiburan & Hobi'
  | 'Pendidikan'
  | 'Lainnya';

export type IncomeCategory =
  | 'Gaji Utama'
  | 'Freelance / Bisnis'
  | 'Dividen & Investasi'
  | 'Bonus & THR'
  | 'Hadiah & Transfer'
  | 'Pendapatan Lain';

export type TransactionCategory = ExpenseCategory | IncomeCategory | 'Transfer Rekening';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  accountId: string;
  targetAccountId?: string;
  date: string; // YYYY-MM-DD
  notes: string;
  merchant?: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'bank' | 'wallet' | 'investment' | 'cash';
  institution: string;
  balance: number;
  accountNumber?: string;
  isAutoSync?: boolean;
  lastSyncedAt?: string;
}

export type PdfExportScope = 'keuangan' | 'rab' | 'rekening' | 'transaksi' | 'anggaran';
export type AppTheme = 'dark' | 'light';

export interface Budget {
  id: string;
  category: ExpenseCategory;
  monthlyLimit: number;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
}

export type Currency = 'IDR' | 'USD';

export type ActiveTab = 'ringkasan' | 'transaksi' | 'rekening' | 'anggaran' | 'rab' | 'analisis';

export type RabProjectStatus = 'perencanaan' | 'berjalan' | 'selesai';
export type RabItemStatus = 'rencana' | 'proses' | 'selesai';
export type RabItemPriority = 'utama' | 'menengah' | 'opsional';

export interface RabItem {
  id: string;
  name: string;
  category: string;
  volume: number;
  unit: string;
  unitPrice: number;
  totalEstimated: number;
  actualCost: number;
  status: RabItemStatus;
  priority: RabItemPriority;
  notes?: string;
}

export interface RabProject {
  id: string;
  title: string;
  projectType: string;
  description: string;
  allocatedBudget: number;
  contingencyPercent: number;
  status: RabProjectStatus;
  startDate: string;
  targetDate?: string;
  createdAt: string;
  updatedAt: string;
  items: RabItem[];
}

