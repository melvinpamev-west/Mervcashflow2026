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
}

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

export type ActiveTab = 'ringkasan' | 'transaksi' | 'rekening' | 'anggaran' | 'analisis';
