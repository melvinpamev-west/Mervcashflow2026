import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Account,
  ActiveTab,
  AppTheme,
  Budget,
  Currency,
  PdfExportScope,
  RabProject,
  SavingsGoal,
  Transaction,
} from './types';
import {
  INITIAL_ACCOUNTS,
  INITIAL_BUDGETS,
  INITIAL_GOALS,
  INITIAL_RAB_PROJECTS,
  INITIAL_TRANSACTIONS,
} from './data/initialData';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { RingkasanView } from './components/RingkasanView';
import { TransaksiView } from './components/TransaksiView';
import { RekeningView } from './components/RekeningView';
import { AnggaranView } from './components/AnggaranView';
import { RabView } from './components/RabView';
import { AnalisisView } from './components/AnalisisView';
import { LiquidFinanceStage } from './components/LiquidFinanceStage';
import { TransactionModal } from './components/TransactionModal';
import { TransferModal } from './components/TransferModal';
import { AccountModal } from './components/AccountModal';
import { BudgetModal } from './components/BudgetModal';
import { DisclaimerFooter } from './components/DisclaimerFooter';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { PdfExportModal } from './components/PdfExportModal';
import { useAuth } from './contexts/AuthContext';
import { db, doc, setDoc, onSnapshot } from './lib/firebase';
import { CheckCircle, ArrowLeft, Calculator, Sparkles, LayoutGrid } from 'lucide-react';

export default function App() {
  const { currentUser, loading: authLoading, logout } = useAuth();

  // Navigation mode: 'landing' or 'dashboard'
  const [viewMode, setViewMode] = useState<'landing' | 'dashboard'>('landing');

  // UI Style inside dashboard: 'liquid' (Aurora Liquid-Glass Finance Assistant Stage) or 'classic' (Full Scrollable Sections)
  const [dashboardLayout, setDashboardLayout] = useState<'liquid' | 'classic'>('liquid');

  // Theme: 'dark' or 'light'
  const [theme, setTheme] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem('mervflow_theme');
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('mervflow_theme', theme);
      if (theme === 'light') {
        document.documentElement.classList.add('theme-light');
      } else {
        document.documentElement.classList.remove('theme-light');
      }
    } catch {
      // ignore
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

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

  // Persistence states
  const [accounts, setAccounts] = useState<Account[]>(() => {
    try {
      const saved = localStorage.getItem('mervflow_accounts');
      if (saved) {
        const parsed = JSON.parse(saved);
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

  const [rabProjects, setRabProjects] = useState<RabProject[]>(() => {
    try {
      const saved = localStorage.getItem('mervflow_rab_projects');
      if (saved) {
        return JSON.parse(saved);
      }
      return INITIAL_RAB_PROJECTS;
    } catch {
      return INITIAL_RAB_PROJECTS;
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
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Guard ref to prevent overwriting Firestore before initial snapshot loads
  const isInitialCloudLoadedRef = useRef<boolean>(false);
  const isApplyingRemoteSnapshotRef = useRef<boolean>(false);

  // Modal states
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfDefaultScope, setPdfDefaultScope] = useState<PdfExportScope>('keuangan');

  // Notification / Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Automatically sync URL hash (#ringkasan, #transaksi, #rekening, #anggaran, #rab, #analisis) to activeTab & scroll
  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.replace('#', '') as ActiveTab;
      const validTabs: ActiveTab[] = ['ringkasan', 'transaksi', 'rekening', 'anggaran', 'rab', 'analisis'];
      if (validTabs.includes(hash)) {
        setActiveTab(hash);
        setTimeout(() => {
          const el = document.getElementById(hash);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 40);
      }
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  // Realtime listener from Firestore (onSnapshot) for instant sync across devices & e-wallets
  useEffect(() => {
    if (!currentUser) {
      isInitialCloudLoadedRef.current = true;
      return;
    }

    isInitialCloudLoadedRef.current = false;
    const userDocRef = doc(db, 'users', currentUser.uid);

    const unsubscribe = onSnapshot(
      userDocRef,
      async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          isApplyingRemoteSnapshotRef.current = true;
          if (Array.isArray(data.accounts)) setAccounts(data.accounts);
          if (Array.isArray(data.transactions)) setTransactions(data.transactions);
          if (Array.isArray(data.budgets)) setBudgets(data.budgets);
          if (Array.isArray(data.goals)) setGoals(data.goals);
          if (Array.isArray(data.rabProjects)) setRabProjects(data.rabProjects);
          if (data.currency) setCurrency(data.currency);
          isInitialCloudLoadedRef.current = true;
          setIsCloudSynced(true);
          setTimeout(() => {
            isApplyingRemoteSnapshotRef.current = false;
          }, 60);
        } else {
          // Initialize cloud document for new user
          try {
            await setDoc(
              userDocRef,
              {
                accounts,
                transactions,
                budgets,
                goals,
                rabProjects,
                currency,
                email: currentUser.email,
                createdAt: new Date().toISOString(),
              },
              { merge: true }
            );
            isInitialCloudLoadedRef.current = true;
            setIsCloudSynced(true);
          } catch (err) {
            console.error('Failed to initialize Firestore doc:', err);
          }
        }
      },
      (err: any) => {
        console.error('Realtime Firestore listener error:', err);
        isInitialCloudLoadedRef.current = true;
        if (
          err?.code === 'permission-denied' ||
          String(err?.message || '').includes('permission-denied')
        ) {
          showToast('Firestore Rules menolak akses. Pastikan Security Rules sudah aktif.');
        }
      }
    );

    return () => unsubscribe();
  }, [currentUser, showToast]);

  // Save to localStorage & Firestore whenever state changes
  const syncToCloud = useCallback(
    async (
      newAccounts: Account[],
      newTransactions: Transaction[],
      newBudgets: Budget[],
      newGoals: SavingsGoal[],
      newRabProjects: RabProject[],
      newCurrency: Currency
    ) => {
      // Always save to localStorage immediately
      try {
        localStorage.setItem('mervflow_accounts', JSON.stringify(newAccounts));
        localStorage.setItem('mervflow_transactions', JSON.stringify(newTransactions));
        localStorage.setItem('mervflow_budgets', JSON.stringify(newBudgets));
        localStorage.setItem('mervflow_goals', JSON.stringify(newGoals));
        localStorage.setItem('mervflow_rab_projects', JSON.stringify(newRabProjects));
        localStorage.setItem('mervflow_currency', newCurrency);
      } catch {
        // ignore storage quota errors
      }

      // Only write to Firestore if initial cloud snapshot has loaded and we are not mid-snapshot
      if (currentUser && isInitialCloudLoadedRef.current && !isApplyingRemoteSnapshotRef.current) {
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
              rabProjects: newRabProjects,
              currency: newCurrency,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
          setIsCloudSynced(true);
        } catch (err: any) {
          console.error('Cloud sync error:', err);
          setIsCloudSynced(false);
        }
      }
    },
    [currentUser]
  );

  useEffect(() => {
    syncToCloud(accounts, transactions, budgets, goals, rabProjects, currency);
  }, [accounts, transactions, budgets, goals, rabProjects, currency, syncToCloud]);

  // Auto-Sync All Accounts & E-Wallets Handler
  const handleAutoSyncAll = useCallback(() => {
    setIsSyncing(true);
    const nowIso = new Date().toISOString();

    setAccounts((prev) =>
      prev.map((acc) => ({
        ...acc,
        isAutoSync: true,
        lastSyncedAt: nowIso,
      }))
    );

    setTimeout(() => {
      setIsSyncing(false);
      setIsCloudSynced(true);
      showToast('Seluruh Rekening Bank & E-Wallet berhasil disinkronkan secara realtime!');
    }, 600);
  }, [showToast]);

  // Quick Connect Provider (GoPay, OVO, DANA, BCA, Mandiri, BRI, etc.)
  const handleQuickConnectProvider = (provider: {
    name: string;
    institution: string;
    type: Account['type'];
    balance: number;
  }) => {
    const nowIso = new Date().toISOString();
    setAccounts((prev) => {
      const existingIdx = prev.findIndex(
        (a) =>
          a.institution.toLowerCase() === provider.institution.toLowerCase() ||
          a.name.toLowerCase() === provider.name.toLowerCase()
      );
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          balance: provider.balance,
          isAutoSync: true,
          lastSyncedAt: nowIso,
        };
        return updated;
      }
      return [
        ...prev,
        {
          id: 'acc-' + Date.now(),
          name: provider.name,
          institution: provider.institution,
          type: provider.type,
          balance: provider.balance,
          isAutoSync: true,
          lastSyncedAt: nowIso,
        },
      ];
    });
    showToast(`${provider.name} terhubung & sinkronisasi otomatis aktif!`);
  };

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

  // PDF Export Handler - opens scoped export modal (e.g., 'rab' or 'keuangan' or 'rekening')
  const handleDownloadPdf = (scope?: PdfExportScope) => {
    if (scope) {
      setPdfDefaultScope(scope);
    } else if (activeTab === 'rab') {
      setPdfDefaultScope('rab');
    } else if (activeTab === 'rekening') {
      setPdfDefaultScope('rekening');
    } else if (activeTab === 'transaksi') {
      setPdfDefaultScope('transaksi');
    } else if (activeTab === 'anggaran') {
      setPdfDefaultScope('anggaran');
    } else {
      setPdfDefaultScope('keuangan');
    }
    setIsPdfModalOpen(true);
  };

  // Transaction Handler (Realtime updates target Bank/E-Wallet balance)
  const handleSaveTransaction = (txData: Omit<Transaction, 'id'>) => {
    const newId = 'tx-' + Date.now();
    const newTx: Transaction = {
      ...txData,
      id: newId,
    };
    const nowIso = new Date().toISOString();

    setAccounts((prevAccounts) => {
      return prevAccounts.map((acc) => {
        if (txData.type === 'expense' && acc.id === txData.accountId) {
          return {
            ...acc,
            balance: acc.balance - txData.amount,
            isAutoSync: true,
            lastSyncedAt: nowIso,
          };
        }
        if (txData.type === 'income' && acc.id === txData.accountId) {
          return {
            ...acc,
            balance: acc.balance + txData.amount,
            isAutoSync: true,
            lastSyncedAt: nowIso,
          };
        }
        if (txData.type === 'transfer') {
          if (acc.id === txData.accountId) {
            return {
              ...acc,
              balance: acc.balance - txData.amount,
              isAutoSync: true,
              lastSyncedAt: nowIso,
            };
          }
          if (acc.id === txData.targetAccountId) {
            return {
              ...acc,
              balance: acc.balance + txData.amount,
              isAutoSync: true,
              lastSyncedAt: nowIso,
            };
          }
        }
        return acc;
      });
    });

    setTransactions((prev) => [newTx, ...prev]);
    showToast('Transaksi dicatat & saldo rekening/e-wallet otomatis diperbarui secara realtime');
  };

  // Quick parser from Hero input
  const handleQuickAdd = (input: string) => {
    const numbersOnly = input.replace(/[^0-9]/g, '');
    const amount = parseFloat(numbersOnly) || 0;
    if (amount === 0) {
      showToast('Ketik nominal yang jelas (misal: "Beli kopi 35000" atau "Gaji 10000000")');
      return;
    }

    const lower = input.toLowerCase();
    const isIncome =
      lower.includes('gaji') ||
      lower.includes('transfer masuk') ||
      lower.includes('bonus') ||
      lower.includes('freelance');

    let category = 'Lainnya';
    if (
      lower.includes('kopi') ||
      lower.includes('makan') ||
      lower.includes('resto') ||
      lower.includes('gojek') ||
      lower.includes('grab')
    ) {
      category = 'Makanan & Minuman';
    } else if (
      lower.includes('bensin') ||
      lower.includes('toll') ||
      lower.includes('parkir') ||
      lower.includes('kereta')
    ) {
      category = 'Transportasi';
    } else if (
      lower.includes('listrik') ||
      lower.includes('wifi') ||
      lower.includes('sewa') ||
      lower.includes('kontrakan')
    ) {
      category = 'Tempat Tinggal & Tagihan';
    } else if (lower.includes('belanja') || lower.includes('baju') || lower.includes('sepatu')) {
      category = 'Belanja & Gaya Hidup';
    } else if (isIncome) {
      category = 'Gaji Utama';
    }

    const targetAccount: Account = accounts[0] || {
      id: 'acc-default',
      name: 'Dompet Utama',
      type: 'wallet',
      balance: 0,
      institution: 'E-Wallet Digital',
      isAutoSync: true,
      lastSyncedAt: new Date().toISOString(),
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
    const nowIso = new Date().toISOString();
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === fromId)
          return { ...acc, balance: acc.balance - amount, isAutoSync: true, lastSyncedAt: nowIso };
        if (acc.id === toId)
          return { ...acc, balance: acc.balance + amount, isAutoSync: true, lastSyncedAt: nowIso };
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
    showToast(`Transfer dana sebesar ${amount.toLocaleString('id-ID')} berhasil diproses secara realtime`);
  };

  // Delete transaction
  const handleDeleteTransaction = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;

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
    showToast('Transaksi dihapus dan saldo rekening disesuaikan kembali');
  };

  // Add / Edit Account
  const handleSaveAccount = (accountData: Omit<Account, 'id'>, id?: string) => {
    const nowIso = new Date().toISOString();
    if (id) {
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === id ? { ...accountData, id, isAutoSync: true, lastSyncedAt: nowIso } : a
        )
      );
      showToast(`Rekening "${accountData.name}" diperbarui & disinkronkan`);
    } else {
      const newAcc: Account = {
        ...accountData,
        id: 'acc-' + Date.now(),
        isAutoSync: true,
        lastSyncedAt: nowIso,
      };
      setAccounts((prev) => [...prev, newAcc]);
      showToast(`Rekening "${accountData.name}" ditambahkan & Auto-Sync aktif`);
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
    const confirmed = window.confirm(
      'Apakah Anda yakin ingin mengosongkan seluruh data untuk memulai lembaran baru?'
    );
    if (!confirmed) return;

    setAccounts([]);
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    setRabProjects([]);
    localStorage.removeItem('mervflow_accounts');
    localStorage.removeItem('mervflow_transactions');
    localStorage.removeItem('mervflow_budgets');
    localStorage.removeItem('mervflow_goals');
    localStorage.removeItem('mervflow_rab_projects');
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
      rabProjects,
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

  // Navigate to tab and scroll to its anchor ID
  const handleNavigateAndScroll = (tab: ActiveTab) => {
    setActiveTab(tab);
    window.history.replaceState(null, '', `#${tab}`);
    setTimeout(() => {
      const el = document.getElementById(tab);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 30);
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
            Memuat Finance Assistant...
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
          onDownloadSamplePdf={() => handleDownloadPdf('keuangan')}
          currency={currency}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          defaultTab={authModalTab}
          onSuccess={() => {
            setViewMode('dashboard');
            showToast('Selamat datang di MervFlow Finance Assistant');
          }}
        />

        <PdfExportModal
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          accounts={accounts}
          transactions={transactions}
          budgets={budgets}
          goals={goals}
          rabProjects={rabProjects}
          defaultScope={pdfDefaultScope}
          currency={currency}
          userEmail={currentUser?.email}
          userName={currentUser?.displayName}
          onSuccessToast={showToast}
        />

        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#1e1e2a] border border-[#5266eb]/50 text-[#ededf3] px-4 py-3 rounded-[16px] shadow-2xl flex items-center gap-2.5 text-xs font-[450] animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle className="w-4 h-4 text-[#5266eb] shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </>
    );
  }

  // Shared active section content rendered inside either Liquid-Glass Stage Drawer or Classic View
  const renderActiveSectionContent = () => (
    <div id={activeTab} className="scroll-mt-24">
      {activeTab === 'ringkasan' && (
        <div id="ringkasan">
          <RingkasanView
            accounts={accounts}
            transactions={transactions}
            budgets={budgets}
            goals={goals}
            rabProjects={rabProjects}
            currency={currency}
            onNavigateTab={handleNavigateAndScroll}
            onOpenNewTransaction={() => setIsTransactionModalOpen(true)}
            onOpenTransfer={() => setIsTransferModalOpen(true)}
            onOpenAddAccount={() => {
              setEditingAccount(null);
              setIsAccountModalOpen(true);
            }}
            onDownloadPdf={() => handleDownloadPdf('keuangan')}
          />
        </div>
      )}

      {activeTab === 'transaksi' && (
        <div id="transaksi">
          <TransaksiView
            transactions={transactions}
            accounts={accounts}
            currency={currency}
            onOpenNewTransaction={() => setIsTransactionModalOpen(true)}
            onDeleteTransaction={handleDeleteTransaction}
          />
        </div>
      )}

      {activeTab === 'rekening' && (
        <div id="rekening">
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
            onQuickConnectProvider={handleQuickConnectProvider}
            onAutoSyncAll={handleAutoSyncAll}
            isSyncing={isSyncing}
            onDownloadRekeningPdf={() => handleDownloadPdf('rekening')}
          />
        </div>
      )}

      {activeTab === 'anggaran' && (
        <div id="anggaran">
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
        </div>
      )}

      {activeTab === 'rab' && (
        <div id="rab">
          <RabView
            rabProjects={rabProjects}
            onSaveProjects={setRabProjects}
            accounts={accounts}
            currency={currency}
            userEmail={currentUser?.email}
            userName={currentUser?.displayName}
            onRecordExpenseToTransaction={handleSaveTransaction}
            onShowToast={showToast}
          />
        </div>
      )}

      {activeTab === 'analisis' && (
        <div id="analisis">
          <AnalisisView transactions={transactions} currency={currency} />
        </div>
      )}
    </div>
  );

  return (
    <div
      className={`min-h-screen app-shell-bg bg-[#04121b] text-[#ededf3] flex flex-col selection:bg-[#5266eb] selection:text-white font-['Inter',sans-serif] pb-12 ${
        theme === 'light' ? 'theme-light' : ''
      }`}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[70] bg-[#1e1e2a] border border-[#5266eb]/50 text-[#ededf3] px-4 py-3 rounded-[16px] shadow-2xl flex items-center gap-2.5 text-xs font-[450] animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle className="w-4 h-4 text-[#5266eb] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Top Navbar (Always Visible with Direct #id Links + Landing/Login Button) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleNavigateAndScroll}
        currency={currency}
        setCurrency={setCurrency}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenNewTransaction={() => setIsTransactionModalOpen(true)}
        onDownloadPdf={handleDownloadPdf}
        onGoToLanding={() => setViewMode('landing')}
        onOpenAuth={() => {
          setAuthModalTab('login');
          setIsAuthModalOpen(true);
        }}
        isCloudSynced={isCloudSynced}
        onAutoSync={handleAutoSyncAll}
      />

      {/* Secondary Command Bar: Direct Access to Landing Page Login, RAB Builder & Financial Management */}
      <div className="pt-24 lg:pt-20 px-4 sm:px-6 max-w-[1320px] mx-auto w-full flex flex-wrap items-center justify-between gap-3 text-xs text-[#c3c3cc]">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setViewMode('landing')}
            className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-[10px] bg-[#1e1e2a] border border-[#5266eb]/50 text-[#ededf3] hover:border-[#5266eb] transition-colors cursor-pointer font-[500]"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#5266eb]" />
            <span>Halaman Landing Page &amp; Login</span>
          </button>

          <button
            onClick={() => {
              setAuthModalTab('login');
              setIsAuthModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-[10px] bg-[#1e1e2a] border border-[#10b981]/40 text-[#ededf3] hover:border-[#10b981] transition-colors cursor-pointer font-[500]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#10b981]" />
            <span>{currentUser ? 'Ganti Akun / Portal Login' : 'Masuk / Daftar Akun'}</span>
          </button>

          <a
            href="#manajemen-keuangan"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('manajemen-keuangan')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-[10px] bg-[#1e1e2a] border border-[#272735] text-[#ededf3] hover:border-[#5266eb] transition-colors cursor-pointer no-underline font-[500]"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-[#5266eb]" />
            <span>Tabel Manajemen Keuangan ↓</span>
          </a>

          <a
            href="#rab"
            onClick={(e) => {
              e.preventDefault();
              handleNavigateAndScroll('rab');
            }}
            className={`inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-[10px] transition-all cursor-pointer no-underline ${
              activeTab === 'rab'
                ? 'bg-[#5266eb] text-white font-[500]'
                : 'bg-[#1e1e2a] text-[#ededf3] border border-[#5266eb]/40 hover:border-[#5266eb]'
            }`}
          >
            <Calculator
              className="w-3.5 h-3.5 text-[#5266eb] shrink-0"
              style={activeTab === 'rab' ? { color: '#ffffff' } : undefined}
            />
            <span>Pembuatan RAB (Bangun Rumah / Renovasi / Proyek)</span>
          </a>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDashboardLayout((prev) => (prev === 'liquid' ? 'classic' : 'liquid'))}
            className="text-[11px] text-[#c3c3cc] hover:text-[#ededf3] underline cursor-pointer"
          >
            {dashboardLayout === 'liquid' ? 'Sembunyikan Hero Liquid-Glass' : 'Tampilkan Hero Liquid-Glass'}
          </button>
          {currentUser && (
            <span className="text-[11px] text-[#10b981] font-[480] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              Realtime Sync Cloud &amp; E-Wallet Aktif
            </span>
          )}
        </div>
      </div>

      {/* 1. LIQUID-GLASS FINANCE ASSISTANT STAGE (Aurora Weather Inspired) */}
      {dashboardLayout === 'liquid' ? (
        <section id="finance-assistant" className="max-w-[1320px] mx-auto px-4 sm:px-6 w-full mt-4">
          <LiquidFinanceStage
            activeTab={activeTab}
            onNavigateSection={handleNavigateAndScroll}
            totalNetWorth={totalNetWorth}
            totalIncomeMonth={totalIncomeMonth}
            totalExpenseMonth={totalExpenseMonth}
            accounts={accounts}
            transactions={transactions}
            budgets={budgets}
            rabProjects={rabProjects}
            currency={currency}
            setCurrency={setCurrency}
            theme={theme}
            onToggleTheme={handleToggleTheme}
            userName={currentUser?.displayName || 'Mervin Inas'}
            userEmail={currentUser?.email}
            onQuickAdd={handleQuickAdd}
            onOpenNewTransaction={() => setIsTransactionModalOpen(true)}
            onOpenPdfModal={handleDownloadPdf}
            onAutoSyncAccounts={handleAutoSyncAll}
            isSyncingAccounts={isSyncing}
            onGoToLanding={() => setViewMode('landing')}
            onOpenAuth={() => {
              setAuthModalTab('login');
              setIsAuthModalOpen(true);
            }}
            onLogout={async () => {
              await logout();
              setViewMode('landing');
            }}
          />
        </section>
      ) : (
        <HeroSection
          totalNetWorth={totalNetWorth}
          totalIncomeMonth={totalIncomeMonth}
          totalExpenseMonth={totalExpenseMonth}
          currency={currency}
          onQuickAdd={handleQuickAdd}
          onOpenNewTransaction={() => setIsTransactionModalOpen(true)}
        />
      )}

      {/* 2. HALAMAN MANAJEMEN KEUANGAN & RAB LENGKAP (Directly Visible Below!) */}
      <main id="manajemen-keuangan" className="max-w-[1320px] mx-auto px-4 sm:px-6 w-full flex-1 mt-8 scroll-mt-24">
        {/* Section Switcher Bar for Financial Management */}
        <div className="mb-6 p-3 rounded-[20px] bg-[#1e1e2a] border border-[#272735] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-[600] uppercase tracking-wider text-[#5266eb] block">
              PUSAT KENDALI &amp; MANAJEMEN KEUANGAN
            </span>
            <h2 className="text-base sm:text-lg font-[500] text-[#ededf3]">
              Kelola Ringkasan, Transaksi, Rekening &amp; E-Wallet, Anggaran, serta RAB Proyek
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'ringkasan', label: 'Ringkasan' },
                { id: 'transaksi', label: 'Transaksi' },
                { id: 'rekening', label: 'Rekening & E-Wallet' },
                { id: 'anggaran', label: 'Anggaran' },
                { id: 'rab', label: 'Pembuatan RAB' },
                { id: 'analisis', label: 'Analisis' },
              ] as { id: ActiveTab; label: string }[]
            ).map((t) => (
              <a
                key={t.id}
                href={`#${t.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigateAndScroll(t.id);
                }}
                className={`px-3.5 py-2 rounded-full text-xs font-[500] transition-all cursor-pointer no-underline ${
                  activeTab === t.id
                    ? 'bg-[#5266eb] text-white shadow-sm'
                    : 'bg-[#171721] text-[#c3c3cc] hover:text-[#ededf3] border border-[#272735]'
                }`}
              >
                {t.label}
              </a>
            ))}
          </div>
        </div>

        {/* Active Financial Management View */}
        {renderActiveSectionContent()}
      </main>

      {/* Disclaimer Banner Footer */}
      <DisclaimerFooter
        onResetData={handleResetData}
        onExportJson={handleExportJson}
        onDownloadPdf={() => handleDownloadPdf()}
      />

      {/* Modals (Accessible from both Liquid Glass Stage and Classic View) */}
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
        rabProjects={rabProjects}
        defaultScope={pdfDefaultScope}
        currency={currency}
        userEmail={currentUser?.email}
        userName={currentUser?.displayName}
        onSuccessToast={showToast}
      />
    </div>
  );
}
