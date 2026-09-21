import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Account, ActiveTab, Budget, Currency, SavingsGoal, Transaction } from './types';
import {
  INITIAL_ACCOUNTS,
  INITIAL_BUDGETS,
  INITIAL_GOALS,
  INITIAL_TRANSACTIONS,
} from './data/initialData';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { RingkasanView } from './components/RingkasanView';
import { TransaksiView } from './components/TransaksiView';
import { RekeningView } from './components/RekeningView';
import { AnggaranView } from './components/AnggaranView';
import { AnalisisView } from './components/AnalisisView';
import { TransactionModal } from './components/TransactionModal';
import { TransferModal } from './components/TransferModal';
import { AccountModal } from './components/AccountModal';
import { BudgetModal } from './components/BudgetModal';
import { DisclaimerFooter } from './components/DisclaimerFooter';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { PdfExportModal } from './components/PdfExportModal';
import { useAuth } from './contexts/AuthContext';
import { generateFinancialPdfReport } from './utils/pdfExport';
import { db, doc, setDoc, getDoc } from './lib/firebase';
import { CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

export default function App() {
  const { currentUser, loading: authLoading } = useAuth();

  // Navigation mode: 'landing' or 'dashboard'
  const [viewMode, setViewMode] = useState<'landing' | 'dashboard'>('landing');

  // When auth state changes, set viewMode
  useEffect(() => {
    if (!authLoading) {
      if (currentUser) {
        setViewMode('dashboard');
      } else {
        setViewMode('landing');
      }
    }
  }, [currentUser, authLoading]);

  // Auth modal states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  // Persistence states - initialized cleanly for permanent usage
  const [accounts, setAccounts] = useState<Account[]>(() => {
    try {
      const saved = localStorage.getItem('mervflow_accounts');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Avoid lingering old mock sample data
        if (Array.isArray(parsed) && parsed.some((a) => a.id === 'acc-1')) {
          return INITIAL_ACCOUNTS;
        }
        return parsed;
      }
      return INITIAL_ACCOUNTS;
    } catch {
      return INITIAL_ACCOUNTS;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('mervflow_transactions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some((t) => t.id === 'tx-1')) {
          return INITIAL_TRANSACTIONS;
        }
        return parsed;
      }
      return INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    try {
      const saved = localStorage.getItem('mervflow_budgets');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some((b) => b.id === 'b-1')) {
          return INITIAL_BUDGETS;
        }
        return parsed;
      }
      return INITIAL_BUDGETS;
    } catch {
      return INITIAL_BUDGETS;
    }
  });

  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    try {
      const saved = localStorage.getItem('mervflow_goals');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some((g) => g.id === 'g-1')) {
          return INITIAL_GOALS;
        }
        return parsed;
      }
      return INITIAL_GOALS;
    } catch {
      return INITIAL_GOALS;
    }
  });

  const [currency, setCurrency] = useState<Currency>(() => {
    try {
      const saved = localStorage.getItem('mervflow_currency');
      return (saved as Currency) || 'IDR';
    } catch {
      return 'IDR';
    }
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('ringkasan');
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(true);

  // Modal states
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Notification / Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Load user data from Firestore on login
  useEffect(() => {
    if (!currentUser) return;

    let isMounted = true;
    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists() && isMounted) {
          const data = docSnap.data();
          if (data.accounts) setAccounts(data.accounts);
          if (data.transactions) setTransactions(data.transactions);
          if (data.budgets) setBudgets(data.budgets);
          if (data.goals) setGoals(data.goals);
          if (data.currency) setCurrency(data.currency);
          setIsCloudSynced(true);
        } else if (isMounted) {
          // New user: initialize cloud doc
          await setDoc(userDocRef, {
            accounts,
            transactions,
            budgets,
            goals,
            currency,
            email: currentUser.email,
            createdAt: new Date().toISOString(),
          }, { merge: true });
          setIsCloudSynced(true);
        }
      } catch (err: any) {
        console.error('Failed to sync from Firestore:', err);
        if (err?.code === 'permission-denied' || String(err?.message || '').includes('permission-denied')) {
          showToast('Firestore Rules menolak pembacaan data. Silakan perbarui Security Rules di Firebase Console.');
        }
      }
    };

    fetchUserData();
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  // Sync to Firestore & localStorage
  const syncToCloud = useCallback(
    async (
      newAccounts: Account[],
      newTransactions: Transaction[],
      newBudgets: Budget[],
      newGoals: SavingsGoal[],
      newCurrency: Currency
    ) => {
      // Local storage backup
      localStorage.setItem('mervflow_accounts', JSON.stringify(newAccounts));
      localStorage.setItem('mervflow_transactions', JSON.stringify(newTransactions));
      localStorage.setItem('mervflow_budgets', JSON.stringify(newBudgets));
      localStorage.setItem('mervflow_goals', JSON.stringify(newGoals));
      localStorage.setItem('mervflow_currency', newCurrency);

      // Firestore sync
      if (currentUser) {
        try {
          setIsCloudSynced(false);
          const userDocRef = doc(db, 'users', currentUser.uid);
          await setDoc(
            userDocRef,
            {
              accounts: newAccounts,
              transactions: newTransactions,
              budgets: newBudgets,
              goals: newGoals,
              currency: newCurrency,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
          setIsCloudSynced(true);
        } catch (err: any) {
          console.error('Cloud sync error:', err);
          setIsCloudSynced(false);
          if (err?.code === 'permission-denied' || String(err?.message || '').includes('permission-denied')) {
            showToast('Peringatan: Firestore Security Rules menolak penyimpanan. Perbarui rules di Firebase Console.');
          }
        }
      }
    },
    [currentUser]
  );

  // Trigger sync on state changes
  useEffect(() => {
    syncToCloud(accounts, transactions, budgets, goals, currency);
  }, [accounts, transactions, budgets, goals, currency, syncToCloud]);

  // Derived financial metrics
  const totalNetWorth = useMemo(() => {
    return accounts.reduce((sum, acc) => sum + acc.balance, 0);
  }, [accounts]);

  const totalIncomeMonth = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalExpenseMonth = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  // PDF Export Handler - opens format selection modal with instant crystal-clear download
  const handleDownloadPdf = () => {
    setIsPdfModalOpen(true);
  };

  // Transaction Handler
  const handleSaveTransaction = (txData: Omit<Transaction, 'id'>) => {
    const newId = 'tx-' + Date.now();
    const newTx: Transaction = {
      ...txData,
      id: newId,
    };

    // Update account balances
    setAccounts((prevAccounts) => {
      return prevAccounts.map((acc) => {
        if (txData.type === 'expense' && acc.id === txData.accountId) {
          return { ...acc, balance: acc.balance - txData.amount };
        }
        if (txData.type === 'income' && acc.id === txData.accountId) {
          return { ...acc, balance: acc.balance + txData.amount };
        }
        if (txData.type === 'transfer') {
          if (acc.id === txData.accountId) {
            return { ...acc, balance: acc.balance - txData.amount };
          }
          if (acc.id === txData.targetAccountId) {
            return { ...acc, balance: acc.balance + txData.amount };
          }
        }
        return acc;
      });
    });

    setTransactions((prev) => [newTx, ...prev]);
    showToast('Transaksi berhasil dicatat dan saldo diperbarui');
  };

  // Quick parser from Hero input
  const handleQuickAdd = (input: string) => {
    const numbersOnly = input.replace(/[^0-9]/g, '');
    let amount = parseFloat(numbersOnly) || 0;
    if (amount === 0) {
      showToast('Ketik nominal yang jelas (misal: "Beli kopi 35000" atau "Gaji 10000000")');
      return;
    }

    const lower = input.toLowerCase();
    const isIncome = lower.includes('gaji') || lower.includes('transfer masuk') || lower.includes('bonus') || lower.includes('freelance');

    let category = 'Lainnya';
    if (lower.includes('kopi') || lower.includes('makan') || lower.includes('resto') || lower.includes('gojek') || lower.includes('grab')) {
      category = 'Makanan & Minuman';
    } else if (lower.includes('bensin') || lower.includes('toll') || lower.includes('parkir') || lower.includes('kereta')) {
      category = 'Transportasi';
    } else if (lower.includes('listrik') || lower.includes('wifi') || lower.includes('sewa') || lower.includes('kontrakan')) {
      category = 'Tempat Tinggal & Tagihan';
    } else if (lower.includes('belanja') || lower.includes('baju') || lower.includes('sepatu')) {
      category = 'Belanja & Gaya Hidup';
    } else if (isIncome) {
      category = 'Gaji Utama';
    }

    const targetAccount = accounts[0] || {
      id: 'acc-default',
      name: 'Dompet Utama',
      type: 'wallet',
      balance: 0,
      currency: 'IDR',
      institution: 'Tunai',
    };

    if (accounts.length === 0) {
      setAccounts([targetAccount]);
    }

    handleSaveTransaction({
      type: isIncome ? 'income' : 'expense',
      amount,
      category: category as any,
      accountId: targetAccount.id,
      date: new Date().toISOString().slice(0, 10),
      notes: input,
    });
  };

  // Transfer Handler
  const handleTransfer = (fromId: string, toId: string, amount: number, notes?: string) => {
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === fromId) return { ...acc, balance: acc.balance - amount };
        if (acc.id === toId) return { ...acc, balance: acc.balance + amount };
        return acc;
      })
    );

    const fromAcc = accounts.find((a) => a.id === fromId);
    const toAcc = accounts.find((a) => a.id === toId);

    const newTx: Transaction = {
      id: 'tx-' + Date.now(),
      type: 'transfer',
      amount,
      category: 'Transfer Rekening',
      accountId: fromId,
      targetAccountId: toId,
      date: new Date().toISOString().slice(0, 10),
      notes: notes || `Transfer dari ${fromAcc?.name || 'Rekening'} ke ${toAcc?.name || 'Rekening'}`,
    };

    setTransactions((prev) => [newTx, ...prev]);
    showToast(`Transfer dana sebesar ${amount.toLocaleString('id-ID')} berhasil diproses`);
  };

  // Delete transaction
  const handleDeleteTransaction = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;

    // Rollback account balances
    setAccounts((prev) =>
      prev.map((acc) => {
        if (tx.type === 'expense' && acc.id === tx.accountId) {
          return { ...acc, balance: acc.balance + tx.amount };
        }
        if (tx.type === 'income' && acc.id === tx.accountId) {
          return { ...acc, balance: acc.balance - tx.amount };
        }
        if (tx.type === 'transfer') {
          if (acc.id === tx.accountId) {
            return { ...acc, balance: acc.balance + tx.amount };
          }
          if (acc.id === tx.targetAccountId) {
            return { ...acc, balance: acc.balance - tx.amount };
          }
        }
        return acc;
      })
    );

    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('Transaksi dihapus dan saldo rekening disesuaikan');
  };

  // Add / Edit Account
  const handleSaveAccount = (accountData: Omit<Account, 'id'>, id?: string) => {
    if (id) {
      setAccounts((prev) =>
        prev.map((a) => (a.id === id ? { ...accountData, id } : a))
      );
      showToast(`Rekening "${accountData.name}" berhasil diperbarui`);
    } else {
      const newAcc: Account = {
        ...accountData,
        id: 'acc-' + Date.now(),
      };
      setAccounts((prev) => [...prev, newAcc]);
      showToast(`Rekening "${accountData.name}" berhasil ditambahkan`);
    }
  };

  const handleDeleteAccount = (id: string) => {
    if (accounts.length <= 1) {
      showToast('Setidaknya harus memiliki minimal 1 rekening aktif');
      return;
    }
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    showToast('Rekening berhasil dihapus');
  };

  // Add / Edit Budget
  const handleSaveBudget = (category: any, monthlyLimit: number, id?: string) => {
    if (id) {
      setBudgets((prev) =>
        prev.map((b) => (b.id === id ? { ...b, category, monthlyLimit } : b))
      );
      showToast(`Batas limit "${category}" disesuaikan`);
    } else {
      const newBudget: Budget = {
        id: 'b-' + Date.now(),
        category,
        monthlyLimit,
      };
      setBudgets((prev) => [...prev, newBudget]);
      showToast(`Anggaran "${category}" berhasil dibuat`);
    }
  };

  // Clean / Reset Data
  const handleResetData = () => {
    const confirmed = window.confirm('Apakah Anda yakin ingin mengosongkan seluruh data untuk memulai lembaran baru?');
    if (!confirmed) return;

    setAccounts([]);
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    localStorage.removeItem('mervflow_accounts');
    localStorage.removeItem('mervflow_transactions');
    localStorage.removeItem('mervflow_budgets');
    localStorage.removeItem('mervflow_goals');
    showToast('Seluruh data berhasil dikosongkan untuk penggunaan permanen');
  };

  // Export JSON Backup
  const handleExportJson = () => {
    const data = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      user: currentUser?.email || 'guest',
      currency,
      accounts,
      transactions,
      budgets,
      goals,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mervflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Cadangan data JSON berhasil diunduh');
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#171721] text-[#ededf3] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12 flex items-center justify-center animate-spin">
            <div className="absolute inset-0 rounded-full border-2 border-[#5266eb]/20 border-t-[#5266eb]" />
          </div>
          <p className="text-xs text-[#c3c3cc] tracking-wider uppercase font-[480]">
            Memuat Arsitektur Finansial...
          </p>
        </div>
      </div>
    );
  }

  // If user is viewing Landing Page
  if (viewMode === 'landing') {
    return (
      <>
        <LandingPage
          onOpenAuth={(tab) => {
            setAuthModalTab(tab);
            setIsAuthModalOpen(true);
          }}
          onEnterDashboard={() => setViewMode('dashboard')}
          onDownloadSamplePdf={handleDownloadPdf}
          currency={currency}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          defaultTab={authModalTab}
          onSuccess={() => {
            setViewMode('dashboard');
            showToast('Selamat datang di MervFlow Money');
          }}
        />

        <PdfExportModal
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          accounts={accounts}
          transactions={transactions}
          budgets={budgets}
          goals={goals}
          currency={currency}
          userEmail={currentUser?.email}
          userName={currentUser?.displayName}
          onSuccessToast={showToast}
        />

        {/* Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#1e1e2a] border border-[#5266eb]/50 text-[#ededf3] px-4 py-3 rounded-[16px] shadow-2xl flex items-center gap-2.5 text-xs font-[450] animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle className="w-4 h-4 text-[#5266eb] shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </>
    );
  }

  // Dashboard View
  return (
    <div className="min-h-screen bg-[#171721] text-[#ededf3] flex flex-col selection:bg-[#5266eb] selection:text-white pb-12 font-['Inter',sans-serif]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1e1e2a] border border-[#5266eb]/50 text-[#ededf3] px-4 py-3 rounded-[16px] shadow-2xl flex items-center gap-2.5 text-xs font-[450] animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle className="w-4 h-4 text-[#5266eb] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currency={currency}
        setCurrency={setCurrency}
        onOpenNewTransaction={() => setIsTransactionModalOpen(true)}
        onDownloadPdf={handleDownloadPdf}
        onGoToLanding={() => setViewMode('landing')}
        onOpenAuth={() => {
          setAuthModalTab('login');
          setIsAuthModalOpen(true);
        }}
        isCloudSynced={isCloudSynced}
      />

      {/* Secondary Top Bar: Quick return to landing if logged in */}
      <div className="pt-20 px-6 max-w-[1200px] mx-auto w-full flex items-center justify-between text-xs text-[#c3c3cc]">
        <button
          onClick={() => setViewMode('landing')}
          className="inline-flex items-center gap-1.5 hover:text-[#ededf3] transition-colors cursor-pointer py-1"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#5266eb]" />
          <span>Halaman Beranda &amp; Informasi</span>
        </button>

        {currentUser && (
          <span className="text-[11px] text-[#10b981] font-[480] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            Tersimpan di Cloud Firebase
          </span>
        )}
      </div>

      {/* Hero Section (Net Worth, Metrics, & Quick Input) */}
      <HeroSection
        totalNetWorth={totalNetWorth}
        totalIncomeMonth={totalIncomeMonth}
        totalExpenseMonth={totalExpenseMonth}
        currency={currency}
        onQuickAdd={handleQuickAdd}
        onOpenNewTransaction={() => setIsTransactionModalOpen(true)}
      />

      {/* Main Container Views */}
      <main className="max-w-[1200px] mx-auto px-6 w-full flex-1 mt-4">
        {activeTab === 'ringkasan' && (
          <RingkasanView
            accounts={accounts}
            transactions={transactions}
            budgets={budgets}
            goals={goals}
            currency={currency}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenNewTransaction={() => setIsTransactionModalOpen(true)}
            onOpenTransfer={() => setIsTransferModalOpen(true)}
            onOpenAddAccount={() => {
              setEditingAccount(null);
              setIsAccountModalOpen(true);
            }}
            onDownloadPdf={handleDownloadPdf}
          />
        )}

        {activeTab === 'transaksi' && (
          <TransaksiView
            transactions={transactions}
            accounts={accounts}
            currency={currency}
            onOpenNewTransaction={() => setIsTransactionModalOpen(true)}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {activeTab === 'rekening' && (
          <RekeningView
            accounts={accounts}
            currency={currency}
            onOpenAddAccount={() => {
              setEditingAccount(null);
              setIsAccountModalOpen(true);
            }}
            onOpenTransfer={() => setIsTransferModalOpen(true)}
            onEditAccount={(acc) => {
              setEditingAccount(acc);
              setIsAccountModalOpen(true);
            }}
            onDeleteAccount={handleDeleteAccount}
          />
        )}

        {activeTab === 'anggaran' && (
          <AnggaranView
            budgets={budgets}
            transactions={transactions}
            currency={currency}
            onOpenAddBudget={() => {
              setEditingBudget(null);
              setIsBudgetModalOpen(true);
            }}
            onEditBudget={(budget) => {
              setEditingBudget(budget);
              setIsBudgetModalOpen(true);
            }}
          />
        )}

        {activeTab === 'analisis' && (
          <AnalisisView
            transactions={transactions}
            currency={currency}
          />
        )}
      </main>

      {/* Modals */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSave={handleSaveTransaction}
        accounts={accounts}
        currency={currency}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        accounts={accounts}
        currency={currency}
        onTransfer={handleTransfer}
      />

      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => {
          setIsAccountModalOpen(false);
          setEditingAccount(null);
        }}
        onSave={handleSaveAccount}
        currency={currency}
        initialAccount={editingAccount}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => {
          setIsBudgetModalOpen(false);
          setEditingBudget(null);
        }}
        onSave={handleSaveBudget}
        currency={currency}
        initialBudget={editingBudget}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab={authModalTab}
        onSuccess={() => {
          showToast('Autentikasi berhasil');
        }}
      />

      <PdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        accounts={accounts}
        transactions={transactions}
        budgets={budgets}
        goals={goals}
        currency={currency}
        userEmail={currentUser?.email}
        userName={currentUser?.displayName}
        onSuccessToast={showToast}
      />

      {/* Disclaimer Banner Footer with PDF download button */}
      <DisclaimerFooter
        onResetData={handleResetData}
        onExportJson={handleExportJson}
        onDownloadPdf={handleDownloadPdf}
      />
    </div>
  );
}
