import React, { useState, useMemo } from 'react';
import {
  Account,
  Currency,
  RabItem,
  RabItemPriority,
  RabItemStatus,
  RabProject,
  RabProjectStatus,
  Transaction,
} from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { RAB_TEMPLATES } from '../data/initialData';
import { generateRabPdfReport } from '../utils/pdfExport';
import {
  Plus,
  FileDown,
  Hammer,
  CheckCircle2,
  Clock,
  Edit3,
  Trash2,
  Search,
  Layers,
  Calculator,
  Sparkles,
  ArrowUpRight,
  Copy,
  FolderPlus,
  Check,
  X,
  Building2,
  Wrench,
  Briefcase,
} from 'lucide-react';

interface RabViewProps {
  rabProjects: RabProject[];
  onSaveProjects: (projects: RabProject[]) => void;
  accounts: Account[];
  currency: Currency;
  userEmail?: string | null;
  userName?: string | null;
  onRecordExpenseToTransaction?: (tx: Omit<Transaction, 'id'>) => void;
  onShowToast: (msg: string) => void;
}

const DEFAULT_CATEGORIES = [
  'Material Bangunan',
  'Struktur & Pondasi',
  'Upah Tukang & Jasa',
  'Finishing & Interior',
  'Mekanikal & Elektrikal',
  'Peralatan & Mesin',
  'Bahan Baku & Stok',
  'Perizinan & Operasional',
  'Lainnya',
];

const DEFAULT_UNITS = [
  'Sak',
  'm²',
  'm³',
  'Batang',
  'Pcs',
  'Unit',
  'Dus',
  'Pail',
  'Truk',
  'HOK (Hari Orang)',
  'Paket',
  'Set',
  'Meter',
  'Kg',
  'Liter',
  'Roll',
  'Lembar',
];

const PROJECT_TYPES = [
  'Bangun Rumah & Konstruksi',
  'Renovasi Rumah / Ruangan',
  'Pembuatan Usaha & Bisnis',
  'Pengadaan Barang & Studio',
  'Acara / Pernikahan / Event',
  'Keperluan Umum Lainnya',
];

export const RabView: React.FC<RabViewProps> = ({
  rabProjects,
  onSaveProjects,
  accounts,
  currency,
  userEmail,
  userName,
  onRecordExpenseToTransaction,
  onShowToast,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    return rabProjects[0]?.id || '';
  });

  // Ensure valid selectedProjectId when rabProjects changes
  const activeProject = useMemo(() => {
    if (rabProjects.length === 0) return null;
    const found = rabProjects.find((p) => p.id === selectedProjectId);
    return found || rabProjects[0];
  }, [rabProjects, selectedProjectId]);

  // Filter & Search states for items
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Project Modal State (Create / Edit Project)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<RabProject | null>(null);
  const [projTitle, setProjTitle] = useState('');
  const [projType, setProjType] = useState(PROJECT_TYPES[0]);
  const [projDesc, setProjDesc] = useState('');
  const [projBudget, setProjBudget] = useState('');
  const [projContingency, setProjContingency] = useState('10');
  const [projStatus, setProjStatus] = useState<RabProjectStatus>('perencanaan');
  const [projStartDate, setProjStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [projTargetDate, setProjTargetDate] = useState('');

  // Item Modal State (Create / Edit RAB Item)
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RabItem | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [itemVolume, setItemVolume] = useState('1');
  const [itemUnit, setItemUnit] = useState('Sak');
  const [customUnit, setCustomUnit] = useState('');
  const [itemUnitPrice, setItemUnitPrice] = useState('');
  const [itemActualCost, setItemActualCost] = useState('');
  const [itemStatus, setItemStatus] = useState<RabItemStatus>('rencana');
  const [itemPriority, setItemPriority] = useState<RabItemPriority>('utama');
  const [itemNotes, setItemNotes] = useState('');

  // Record to Transaction Modal State
  const [recordingItem, setRecordingItem] = useState<RabItem | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id || '');

  // Open Project Modal
  const handleOpenCreateProject = () => {
    setEditingProject(null);
    setProjTitle('');
    setProjType(PROJECT_TYPES[0]);
    setProjDesc('');
    setProjBudget('');
    setProjContingency('10');
    setProjStatus('perencanaan');
    setProjStartDate(new Date().toISOString().slice(0, 10));
    setProjTargetDate('');
    setIsProjectModalOpen(true);
  };

  const handleOpenEditProject = (project: RabProject) => {
    setEditingProject(project);
    setProjTitle(project.title);
    setProjType(project.projectType);
    setProjDesc(project.description);
    setProjBudget(project.allocatedBudget.toString());
    setProjContingency(project.contingencyPercent.toString());
    setProjStatus(project.status);
    setProjStartDate(project.startDate);
    setProjTargetDate(project.targetDate || '');
    setIsProjectModalOpen(true);
  };

  const handleSaveProjectForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim()) {
      onShowToast('Nama proyek RAB wajib diisi');
      return;
    }

    const allocated = parseFloat(projBudget.replace(/[^0-9.]/g, '')) || 0;
    const contingency = Math.min(100, Math.max(0, parseFloat(projContingency) || 0));
    const now = new Date().toISOString();

    if (editingProject) {
      const updated = rabProjects.map((p) =>
        p.id === editingProject.id
          ? {
              ...p,
              title: projTitle.trim(),
              projectType: projType,
              description: projDesc.trim(),
              allocatedBudget: allocated,
              contingencyPercent: contingency,
              status: projStatus,
              startDate: projStartDate,
              targetDate: projTargetDate || undefined,
              updatedAt: now,
            }
          : p
      );
      onSaveProjects(updated);
      onShowToast(`Proyek RAB "${projTitle.trim()}" berhasil diperbarui`);
    } else {
      const newProj: RabProject = {
        id: 'rab-' + Date.now(),
        title: projTitle.trim(),
        projectType: projType,
        description: projDesc.trim(),
        allocatedBudget: allocated,
        contingencyPercent: contingency,
        status: projStatus,
        startDate: projStartDate,
        targetDate: projTargetDate || undefined,
        createdAt: now,
        updatedAt: now,
        items: [],
      };
      onSaveProjects([newProj, ...rabProjects]);
      setSelectedProjectId(newProj.id);
      onShowToast(`Proyek RAB "${newProj.title}" berhasil dibuat`);
    }

    setIsProjectModalOpen(false);
  };

  // Load Quick Template
  const handleCreateFromTemplate = (tplIndex: number) => {
    const tpl = RAB_TEMPLATES[tplIndex];
    if (!tpl) return;
    const now = new Date().toISOString();
    const newProj: RabProject = {
      ...tpl,
      id: 'rab-' + Date.now(),
      createdAt: now,
      updatedAt: now,
      items: tpl.items.map((item, idx) => ({
        ...item,
        id: `rab-item-${Date.now()}-${idx}`,
      })),
    };
    onSaveProjects([newProj, ...rabProjects]);
    setSelectedProjectId(newProj.id);
    onShowToast(`Template "${newProj.title}" berhasil dimuat. Anda dapat menyesuaikan setiap itemnya.`);
  };

  const handleDeleteProject = (id: string) => {
    const target = rabProjects.find((p) => p.id === id);
    if (!target) return;
    const remaining = rabProjects.filter((p) => p.id !== id);
    onSaveProjects(remaining);
    if (remaining.length > 0) {
      setSelectedProjectId(remaining[0].id);
    } else {
      setSelectedProjectId('');
    }
    onShowToast(`Proyek RAB "${target.title}" telah dihapus`);
  };

  const handleDuplicateProject = (project: RabProject) => {
    const now = new Date().toISOString();
    const copy: RabProject = {
      ...project,
      id: 'rab-' + Date.now(),
      title: `${project.title} (Salinan)`,
      createdAt: now,
      updatedAt: now,
      items: project.items.map((item, i) => ({
        ...item,
        id: `rab-item-${Date.now()}-${i}`,
      })),
    };
    onSaveProjects([copy, ...rabProjects]);
    setSelectedProjectId(copy.id);
    onShowToast(`Salinan proyek "${copy.title}" berhasil dibuat`);
  };

  // Open Item Modal
  const handleOpenAddItem = () => {
    if (!activeProject) return;
    setEditingItem(null);
    setItemName('');
    setItemCategory(DEFAULT_CATEGORIES[0]);
    setCustomCategory('');
    setItemVolume('1');
    setItemUnit('Sak');
    setCustomUnit('');
    setItemUnitPrice('');
    setItemActualCost('');
    setItemStatus('rencana');
    setItemPriority('utama');
    setItemNotes('');
    setIsItemModalOpen(true);
  };

  const handleOpenEditItem = (item: RabItem) => {
    setEditingItem(item);
    setItemName(item.name);
    if (DEFAULT_CATEGORIES.includes(item.category)) {
      setItemCategory(item.category);
      setCustomCategory('');
    } else {
      setItemCategory('CUSTOM');
      setCustomCategory(item.category);
    }
    setItemVolume(item.volume.toString());
    if (DEFAULT_UNITS.includes(item.unit)) {
      setItemUnit(item.unit);
      setCustomUnit('');
    } else {
      setItemUnit('CUSTOM');
      setCustomUnit(item.unit);
    }
    setItemUnitPrice(item.unitPrice.toString());
    setItemActualCost(item.actualCost > 0 ? item.actualCost.toString() : '');
    setItemStatus(item.status);
    setItemPriority(item.priority);
    setItemNotes(item.notes || '');
    setIsItemModalOpen(true);
  };

  const handleSaveItemForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject) return;
    if (!itemName.trim()) {
      onShowToast('Nama keperluan / barang / pekerjaan wajib diisi');
      return;
    }

    const vol = Math.max(0.01, parseFloat(itemVolume) || 1);
    const uPrice = Math.max(0, parseFloat(itemUnitPrice.replace(/[^0-9.]/g, '')) || 0);
    const totalEst = Math.round(vol * uPrice);
    const rawActual = parseFloat(itemActualCost.replace(/[^0-9.]/g, '')) || 0;
    const finalActual = itemStatus === 'selesai' && rawActual === 0 ? totalEst : rawActual;
    const finalCategory = itemCategory === 'CUSTOM' ? customCategory.trim() || 'Lainnya' : itemCategory;
    const finalUnit = itemUnit === 'CUSTOM' ? customUnit.trim() || 'Unit' : itemUnit;

    const newItemData: RabItem = {
      id: editingItem ? editingItem.id : 'rab-item-' + Date.now(),
      name: itemName.trim(),
      category: finalCategory,
      volume: vol,
      unit: finalUnit,
      unitPrice: uPrice,
      totalEstimated: totalEst,
      actualCost: finalActual,
      status: itemStatus,
      priority: itemPriority,
      notes: itemNotes.trim() || undefined,
    };

    const updatedItems = editingItem
      ? activeProject.items.map((i) => (i.id === editingItem.id ? newItemData : i))
      : [...activeProject.items, newItemData];

    const updatedProjects = rabProjects.map((p) =>
      p.id === activeProject.id
        ? { ...p, items: updatedItems, updatedAt: new Date().toISOString() }
        : p
    );

    onSaveProjects(updatedProjects);
    setIsItemModalOpen(false);
    onShowToast(
      editingItem
        ? `Komponen "${newItemData.name}" diperbarui`
        : `Komponen "${newItemData.name}" ditambahkan ke RAB`
    );
  };

  const handleDeleteItem = (itemId: string) => {
    if (!activeProject) return;
    const updatedItems = activeProject.items.filter((i) => i.id !== itemId);
    const updatedProjects = rabProjects.map((p) =>
      p.id === activeProject.id
        ? { ...p, items: updatedItems, updatedAt: new Date().toISOString() }
        : p
    );
    onSaveProjects(updatedProjects);
    onShowToast('Item keperluan dihapus dari RAB');
  };

  const handleCycleItemStatus = (item: RabItem) => {
    if (!activeProject) return;
    const nextStatus: RabItemStatus =
      item.status === 'rencana' ? 'proses' : item.status === 'proses' ? 'selesai' : 'rencana';
    const nextActual =
      nextStatus === 'selesai' && item.actualCost === 0
        ? item.totalEstimated
        : nextStatus === 'rencana'
        ? 0
        : item.actualCost;

    const updatedItems = activeProject.items.map((i) =>
      i.id === item.id ? { ...i, status: nextStatus, actualCost: nextActual } : i
    );
    const updatedProjects = rabProjects.map((p) =>
      p.id === activeProject.id
        ? { ...p, items: updatedItems, updatedAt: new Date().toISOString() }
        : p
    );
    onSaveProjects(updatedProjects);
  };

  const handleConfirmRecordExpense = () => {
    if (!recordingItem || !activeProject || !onRecordExpenseToTransaction) return;
    const targetAccId = selectedAccountId || accounts[0]?.id;
    if (!targetAccId) {
      onShowToast('Tambahkan minimal 1 rekening terlebih dahulu di menu Rekening');
      setRecordingItem(null);
      return;
    }

    const amountToRecord =
      recordingItem.actualCost > 0 ? recordingItem.actualCost : recordingItem.totalEstimated;

    onRecordExpenseToTransaction({
      type: 'expense',
      amount: amountToRecord,
      category: 'Tempat Tinggal & Tagihan',
      accountId: targetAccId,
      date: new Date().toISOString().slice(0, 10),
      notes: `[RAB: ${activeProject.title}] ${recordingItem.name} (${recordingItem.volume} ${recordingItem.unit})`,
    });

    // Also mark item as selesai if not already
    const updatedItems = activeProject.items.map((i) =>
      i.id === recordingItem.id
        ? { ...i, status: 'selesai' as RabItemStatus, actualCost: amountToRecord }
        : i
    );
    const updatedProjects = rabProjects.map((p) =>
      p.id === activeProject.id
        ? { ...p, items: updatedItems, updatedAt: new Date().toISOString() }
        : p
    );
    onSaveProjects(updatedProjects);
    setRecordingItem(null);
  };

  // Calculations for Active Project
  const metrics = useMemo(() => {
    if (!activeProject) {
      return {
        subtotalEstimated: 0,
        contingencyAmount: 0,
        grandTotalEstimated: 0,
        totalActual: 0,
        budgetRemaining: 0,
        completedCount: 0,
        inProgressCount: 0,
        plannedCount: 0,
        progressPct: 0,
        categoryBreakdown: [] as { category: string; estimated: number; actual: number; count: number; pct: number }[],
      };
    }

    const subtotalEstimated = activeProject.items.reduce((sum, i) => sum + i.totalEstimated, 0);
    const contingencyAmount = Math.round(
      subtotalEstimated * ((activeProject.contingencyPercent || 0) / 100)
    );
    const grandTotalEstimated = subtotalEstimated + contingencyAmount;
    const totalActual = activeProject.items.reduce((sum, i) => sum + i.actualCost, 0);
    const budgetRemaining = activeProject.allocatedBudget - grandTotalEstimated;

    const completedCount = activeProject.items.filter((i) => i.status === 'selesai').length;
    const inProgressCount = activeProject.items.filter((i) => i.status === 'proses').length;
    const plannedCount = activeProject.items.filter((i) => i.status === 'rencana').length;
    const progressPct =
      activeProject.items.length > 0
        ? Math.round((completedCount / activeProject.items.length) * 100)
        : 0;

    const catMap: Record<string, { estimated: number; actual: number; count: number }> = {};
    activeProject.items.forEach((item) => {
      if (!catMap[item.category]) {
        catMap[item.category] = { estimated: 0, actual: 0, count: 0 };
      }
      catMap[item.category].estimated += item.totalEstimated;
      catMap[item.category].actual += item.actualCost;
      catMap[item.category].count += 1;
    });

    const categoryBreakdown = Object.entries(catMap)
      .map(([category, vals]) => ({
        category,
        ...vals,
        pct: subtotalEstimated > 0 ? Math.round((vals.estimated / subtotalEstimated) * 100) : 0,
      }))
      .sort((a, b) => b.estimated - a.estimated);

    return {
      subtotalEstimated,
      contingencyAmount,
      grandTotalEstimated,
      totalActual,
      budgetRemaining,
      completedCount,
      inProgressCount,
      plannedCount,
      progressPct,
      categoryBreakdown,
    };
  }, [activeProject]);

  // Filtered items
  const filteredItems = useMemo(() => {
    if (!activeProject) return [];
    return activeProject.items.filter((item) => {
      const matchesSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [activeProject, searchQuery, categoryFilter, statusFilter]);

  const availableCategories = useMemo(() => {
    if (!activeProject) return [];
    const set = new Set<string>();
    activeProject.items.forEach((i) => set.add(i.category));
    return Array.from(set);
  }, [activeProject]);

  const liveModalTotalEstimate = useMemo(() => {
    const v = Math.max(0, parseFloat(itemVolume) || 0);
    const p = Math.max(0, parseFloat(itemUnitPrice.replace(/[^0-9.]/g, '')) || 0);
    return Math.round(v * p);
  }, [itemVolume, itemUnitPrice]);

  return (
    <div id="view-rab" className="space-y-8">
      {/* Top Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#272735]/80">
        <div>
          <span className="text-[11px] font-[500] uppercase tracking-[0.14em] text-[#5266eb]">
            PERENCANAAN PROYEK &amp; KONSTRUKSI
          </span>
          <h2 className="text-[26px] sm:text-[28px] font-[480] text-[#ededf3] tracking-[0.01em]">
            Pembuatan RAB (Rencana Anggaran Biaya)
          </h2>
          <p className="text-xs text-[#c3c3cc] mt-1 max-w-2xl">
            Susun rincian biaya untuk bangun rumah, renovasi ruangan, modal usaha, pengadaan alat, maupun keperluan proyek apa saja secara terstruktur dan presisi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {activeProject && (
            <button
              onClick={() => {
                generateRabPdfReport(activeProject, currency, userEmail, userName, 'light');
                onShowToast(`Dokumen PDF RAB "${activeProject.title}" berhasil diunduh`);
              }}
              className="pill-button-secondary text-xs py-2.5 px-4 flex items-center gap-1.5 border border-[#272735] hover:border-[#5266eb]/60 cursor-pointer"
              title="Cetak / Unduh Tabel RAB Format PDF Siap Baca"
            >
              <FileDown className="w-4 h-4 text-[#5266eb]" />
              <span>Unduh PDF RAB</span>
            </button>
          )}

          <button
            onClick={handleOpenCreateProject}
            className="pill-button-primary text-xs py-2.5 px-5 flex items-center gap-1.5 cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Buat Proyek RAB Baru</span>
          </button>
        </div>
      </div>

      {/* Empty State if No Projects Exist Yet */}
      {rabProjects.length === 0 ? (
        <div className="space-y-6">
          <div className="graphite-card border border-[#5266eb]/30 p-8 text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-[#5266eb]/15 border border-[#5266eb]/30 flex items-center justify-center mx-auto text-[#5266eb]">
              <Calculator className="w-7 h-7" />
            </div>
            <div className="space-y-2 max-w-xl mx-auto">
              <h3 className="text-xl font-[480] text-[#ededf3]">
                Mulai Susun Rencana Anggaran Biaya (RAB) Pertama Anda
              </h3>
              <p className="text-xs text-[#c3c3cc] leading-relaxed">
                Buat perencanaan biaya dari nol sesuai kebutuhan Anda, atau gunakan salah satu template siap pakai di bawah ini (Renovasi Rumah, Bangun Rumah Baru, atau Modal Usaha) yang bisa diedit sepenuhnya.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handleOpenCreateProject}
                className="pill-button-primary text-xs py-2.5 px-6 flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Buat RAB Kosong Sesuai Keinginan</span>
              </button>
            </div>
          </div>

          {/* Quick Templates Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-[480] uppercase tracking-wider text-[#c3c3cc]">
                Atau Pilih Template RAB Siap Pakai (Bisa Diedit)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {RAB_TEMPLATES.map((tpl, idx) => {
                const estTotal = tpl.items.reduce((s, i) => s + i.totalEstimated, 0);
                return (
                  <div
                    key={idx}
                    className="graphite-card flex flex-col justify-between border border-[#272735] hover:border-[#5266eb]/50 transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-[#c3c3cc]">
                        <span className="text-[#5266eb] font-[500]">{tpl.projectType}</span>
                        <span>•</span>
                        <span>{tpl.items.length} Komponen</span>
                      </div>

                      <h4 className="text-[17px] font-[480] text-[#ededf3]">{tpl.title}</h4>
                      <p className="text-xs text-[#c3c3cc] leading-relaxed">{tpl.description}</p>

                      <div className="pt-2 border-t border-[#272735]/80 flex items-baseline justify-between text-xs">
                        <span className="text-[#70707d]">Estimasi Awal:</span>
                        <span className="text-[#ededf3] font-mono tabular-nums font-[500]">
                          {formatCurrency(estTotal, currency)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCreateFromTemplate(idx)}
                      className="pill-button-secondary w-full mt-5 py-2 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#5266eb]" />
                      <span>Gunakan Template Ini</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Project Selector Bar & Quick Template Loader */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1e1e2a] p-3 rounded-[16px] border border-[#272735]">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {rabProjects.map((proj) => {
                const isSelected = activeProject?.id === proj.id;
                return (
                  <button
                    key={proj.id}
                    onClick={() => setSelectedProjectId(proj.id)}
                    className={`px-3.5 py-2 rounded-[12px] text-xs font-[480] whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-[#5266eb] text-white shadow-sm'
                        : 'bg-[#171721] text-[#c3c3cc] hover:text-[#ededf3] border border-[#272735]'
                    }`}
                  >
                    <Hammer className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate max-w-[180px]">{proj.title}</span>
                    <span
                      className={`text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-[#272735] text-[#c3c3cc]'
                      }`}
                    >
                      {proj.items.length}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  if (val !== '') {
                    handleCreateFromTemplate(parseInt(val, 10));
                    e.target.value = '';
                  }
                }}
                defaultValue=""
                className="bg-[#171721] border border-[#272735] rounded-[10px] px-3 py-1.5 text-xs text-[#c3c3cc] focus:outline-none focus:border-[#5266eb]"
              >
                <option value="" disabled>
                  + Muat Template Cepat...
                </option>
                {RAB_TEMPLATES.map((t, i) => (
                  <option key={i} value={i}>
                    Template: {t.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {activeProject && (
            <>
              {/* Active Project Banner & Controls */}
              <div className="graphite-card border border-[#272735] space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 border-b border-[#272735]/80 pb-5">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#c3c3cc]">
                      <span className="text-[#5266eb] font-[500]">{activeProject.projectType}</span>
                      <span>·</span>
                      <span>
                        Status:{' '}
                        <strong className="text-[#ededf3] capitalize">{activeProject.status}</strong>
                      </span>
                      <span>·</span>
                      <span>Mulai {formatDate(activeProject.startDate)}</span>
                      {activeProject.targetDate && (
                        <>
                          <span>·</span>
                          <span>Target {formatDate(activeProject.targetDate)}</span>
                        </>
                      )}
                    </div>
                    <h3 className="text-2xl font-[480] text-[#ededf3]">{activeProject.title}</h3>
                    {activeProject.description && (
                      <p className="text-xs text-[#c3c3cc] max-w-3xl leading-relaxed">
                        {activeProject.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenEditProject(activeProject)}
                      className="px-3 py-1.5 rounded-[10px] bg-[#171721] border border-[#272735] hover:border-[#5266eb]/50 text-xs text-[#ededf3] flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#5266eb]" />
                      <span>Edit Info &amp; Pagu</span>
                    </button>
                    <button
                      onClick={() => handleDuplicateProject(activeProject)}
                      className="px-3 py-1.5 rounded-[10px] bg-[#171721] border border-[#272735] hover:border-[#5266eb]/50 text-xs text-[#c3c3cc] hover:text-[#ededf3] flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Gandakan Proyek RAB ini"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Duplikat</span>
                    </button>
                    <button
                      onClick={() => handleDeleteProject(activeProject.id)}
                      className="px-3 py-1.5 rounded-[10px] bg-[#171721] border border-[#272735] hover:border-[#ef4444]/60 text-xs text-[#ef4444] flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Hapus Proyek RAB"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>

                {/* 4 Executive RAB Metric Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Metric 1: Total Estimasi + Cadangan */}
                  <div className="bg-[#171721] p-4 rounded-[14px] border border-[#272735] space-y-1.5">
                    <span className="text-[11px] text-[#c3c3cc] uppercase tracking-wider">
                      Total Rencana RAB (+Cadangan)
                    </span>
                    <p className="text-xl font-[500] text-[#ededf3] font-mono tabular-nums">
                      {formatCurrency(metrics.grandTotalEstimated, currency)}
                    </p>
                    <div className="text-[11px] text-[#70707d] flex items-center justify-between pt-1">
                      <span>Murni: {formatCurrency(metrics.subtotalEstimated, currency)}</span>
                      <span>+{activeProject.contingencyPercent}% Cadangan</span>
                    </div>
                  </div>

                  {/* Metric 2: Pagu Dana Tersedia & Selisih */}
                  <div className="bg-[#171721] p-4 rounded-[14px] border border-[#272735] space-y-1.5">
                    <span className="text-[11px] text-[#c3c3cc] uppercase tracking-wider">
                      Pagu Anggaran Disiapkan
                    </span>
                    <p className="text-xl font-[500] text-[#ededf3] font-mono tabular-nums">
                      {formatCurrency(activeProject.allocatedBudget, currency)}
                    </p>
                    <div className="text-[11px] pt-1">
                      {activeProject.allocatedBudget === 0 ? (
                        <span className="text-[#c3c3cc]">Pagu dana belum ditentukan</span>
                      ) : metrics.budgetRemaining >= 0 ? (
                        <span className="text-[#10b981] font-mono tabular-nums">
                          Surplus / Sisa Pagu: +{formatCurrency(metrics.budgetRemaining, currency)}
                        </span>
                      ) : (
                        <span className="text-[#ef4444] font-mono tabular-nums">
                          Kekurangan Dana: {formatCurrency(metrics.budgetRemaining, currency)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metric 3: Realisasi Pengeluaran Aktual */}
                  <div className="bg-[#171721] p-4 rounded-[14px] border border-[#272735] space-y-1.5">
                    <span className="text-[11px] text-[#c3c3cc] uppercase tracking-wider">
                      Realisasi Biaya Terpakai
                    </span>
                    <p className="text-xl font-[500] text-[#5266eb] font-mono tabular-nums">
                      {formatCurrency(metrics.totalActual, currency)}
                    </p>
                    <div className="text-[11px] text-[#c3c3cc] pt-1 flex items-center justify-between">
                      <span>
                        {metrics.grandTotalEstimated > 0
                          ? `${Math.round((metrics.totalActual / metrics.grandTotalEstimated) * 100)}% dari rencana`
                          : '0% terpakai'}
                      </span>
                      <span className="font-mono tabular-nums text-[#70707d]">
                        Sisa: {formatCurrency(Math.max(0, metrics.grandTotalEstimated - metrics.totalActual), currency)}
                      </span>
                    </div>
                  </div>

                  {/* Metric 4: Status Komponen Pekerjaan */}
                  <div className="bg-[#171721] p-4 rounded-[14px] border border-[#272735] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[#c3c3cc] uppercase tracking-wider">
                        Progres Keperluan
                      </span>
                      <span className="text-xs font-mono tabular-nums text-[#ededf3]">
                        {metrics.progressPct}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#272735] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#10b981] transition-all duration-300"
                        style={{ width: `${metrics.progressPct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#c3c3cc] pt-0.5">
                      <span>{metrics.completedCount} Selesai</span>
                      <span>·</span>
                      <span>{metrics.inProgressCount} Proses</span>
                      <span>·</span>
                      <span>{metrics.plannedCount} Rencana</span>
                    </div>
                  </div>
                </div>

                {/* Category Allocation Breakdown */}
                {metrics.categoryBreakdown.length > 0 && (
                  <div className="pt-2 border-t border-[#272735]/60">
                    <p className="text-[11px] font-[500] uppercase tracking-wider text-[#c3c3cc] mb-3">
                      Proporsi Biaya per Tahap / Kategori Keperluan
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {metrics.categoryBreakdown.map((cat) => (
                        <div
                          key={cat.category}
                          className="bg-[#171721]/70 px-3.5 py-2.5 rounded-[10px] border border-[#272735]/80 flex items-center justify-between text-xs"
                        >
                          <div className="truncate pr-2">
                            <p className="text-[#ededf3] font-[480] truncate">{cat.category}</p>
                            <p className="text-[11px] text-[#70707d]">
                              {cat.count} item · {cat.pct}% dari RAB
                            </p>
                          </div>
                          <div className="text-right shrink-0 font-mono tabular-nums">
                            <p className="text-[#ededf3] font-[480]">
                              {formatCurrency(cat.estimated, currency)}
                            </p>
                            {cat.actual > 0 && (
                              <p className="text-[10px] text-[#10b981]">
                                Realisasi: {formatCurrency(cat.actual, currency)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* RAB Items Table Card */}
              <div className="graphite-card border border-[#272735] space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-[480] text-[#ededf3]">
                      Daftar Rincian Komponen &amp; Keperluan RAB
                    </h3>
                    <p className="text-xs text-[#c3c3cc]">
                      Klik pada status item untuk mengubah progres (Rencana → Proses → Selesai), atau catat langsung ke pengeluaran rekening.
                    </p>
                  </div>

                  <button
                    onClick={handleOpenAddItem}
                    className="pill-button-primary text-xs py-2.5 px-4 flex items-center gap-1.5 self-start md:self-auto shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Keperluan / Item RAB</span>
                  </button>
                </div>

                {/* Search & Filter Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-[#70707d] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari material, jasa, tukang, spesifikasi..."
                      className="w-full bg-[#171721] border border-[#272735] rounded-[10px] pl-9 pr-3 py-2 text-xs text-[#ededf3] placeholder-[#70707d] focus:outline-none focus:border-[#5266eb]"
                    />
                  </div>

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-[#171721] border border-[#272735] rounded-[10px] px-3 py-2 text-xs text-[#ededf3] focus:outline-none focus:border-[#5266eb]"
                  >
                    <option value="ALL">Semua Kategori Tahapan ({activeProject.items.length})</option>
                    {availableCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1 bg-[#171721] p-1 rounded-[10px] border border-[#272735]">
                    {(['ALL', 'rencana', 'proses', 'selesai'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`flex-1 py-1.5 px-2 rounded-[7px] text-[11px] font-[480] capitalize transition-colors cursor-pointer ${
                          statusFilter === st
                            ? 'bg-[#272735] text-[#ededf3]'
                            : 'text-[#70707d] hover:text-[#c3c3cc]'
                        }`}
                      >
                        {st === 'ALL' ? 'Semua' : st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* High-Density RAB Data Table */}
                {filteredItems.length === 0 ? (
                  <div className="py-12 text-center space-y-3 border border-dashed border-[#272735] rounded-[14px]">
                    <p className="text-sm font-[480] text-[#ededf3]">
                      Belum ada komponen keperluan pada tampilan ini
                    </p>
                    <p className="text-xs text-[#c3c3cc] max-w-md mx-auto">
                      Tambahkan item seperti Semen, Pasir, Keramik, Upah Tukang, Peralatan Usaha, atau kebutuhan lainnya beserta jumlah dan harga satuannya.
                    </p>
                    <button
                      onClick={handleOpenAddItem}
                      className="pill-button-secondary text-xs py-2 px-4 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#5266eb]" />
                      <span>Tambah Item Pertama</span>
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-6 px-6">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#272735] text-[11px] text-[#70707d] uppercase tracking-wider">
                          <th className="py-3 pr-3 font-[500]">No</th>
                          <th className="py-3 px-3 font-[500]">Uraian Keperluan / Pekerjaan</th>
                          <th className="py-3 px-3 font-[500]">Kategori</th>
                          <th className="py-3 px-3 font-[500] text-right">Volume</th>
                          <th className="py-3 px-3 font-[500] text-right">Harga Satuan</th>
                          <th className="py-3 px-3 font-[500] text-right">Total Estimasi</th>
                          <th className="py-3 px-3 font-[500] text-right">Realisasi</th>
                          <th className="py-3 px-3 font-[500] text-center">Status</th>
                          <th className="py-3 pl-3 font-[500] text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#272735]/60 text-xs">
                        {filteredItems.map((item, index) => {
                          const isDone = item.status === 'selesai';
                          const isProcess = item.status === 'proses';
                          return (
                            <tr
                              key={item.id}
                              className="hover:bg-[#272735]/25 transition-colors group"
                            >
                              <td className="py-3.5 pr-3 font-mono tabular-nums text-[#70707d]">
                                {index + 1}
                              </td>
                              <td className="py-3.5 px-3">
                                <div className="font-[480] text-[#ededf3]">{item.name}</div>
                                <div className="flex items-center gap-2 text-[11px] text-[#70707d] mt-0.5">
                                  <span className="capitalize">Prioritas {item.priority}</span>
                                  {item.notes && (
                                    <>
                                      <span>·</span>
                                      <span className="text-[#c3c3cc]">{item.notes}</span>
                                    </>
                                  )}
                                </div>
                              </td>
                              <td className="py-3.5 px-3 text-[#c3c3cc] whitespace-nowrap">
                                {item.category}
                              </td>
                              <td className="py-3.5 px-3 text-right font-mono tabular-nums text-[#ededf3] whitespace-nowrap">
                                {item.volume} <span className="text-[#c3c3cc] font-sans">{item.unit}</span>
                              </td>
                              <td className="py-3.5 px-3 text-right font-mono tabular-nums text-[#c3c3cc] whitespace-nowrap">
                                {formatCurrency(item.unitPrice, currency)}
                              </td>
                              <td className="py-3.5 px-3 text-right font-mono tabular-nums font-[500] text-[#ededf3] whitespace-nowrap">
                                {formatCurrency(item.totalEstimated, currency)}
                              </td>
                              <td className="py-3.5 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                                {item.actualCost > 0 ? (
                                  <span className="text-[#10b981] font-[480]">
                                    {formatCurrency(item.actualCost, currency)}
                                  </span>
                                ) : (
                                  <span className="text-[#70707d]">-</span>
                                )}
                              </td>
                              <td className="py-3.5 px-3 text-center whitespace-nowrap">
                                <button
                                  onClick={() => handleCycleItemStatus(item)}
                                  title="Klik untuk mengganti status (Rencana -> Proses -> Selesai)"
                                  className={`px-2.5 py-1 rounded-[8px] text-[11px] font-[480] inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                                    isDone
                                      ? 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30'
                                      : isProcess
                                      ? 'bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30'
                                      : 'bg-[#171721] text-[#c3c3cc] border border-[#272735] hover:border-[#5266eb]'
                                  }`}
                                >
                                  {isDone ? (
                                    <CheckCircle2 className="w-3 h-3" />
                                  ) : (
                                    <Clock className="w-3 h-3" />
                                  )}
                                  <span className="capitalize">{item.status}</span>
                                </button>
                              </td>
                              <td className="py-3.5 pl-3 text-right whitespace-nowrap">
                                <div className="inline-flex items-center gap-1">
                                  {onRecordExpenseToTransaction && (
                                    <button
                                      onClick={() => {
                                        setRecordingItem(item);
                                        if (accounts[0]) setSelectedAccountId(accounts[0].id);
                                      }}
                                      title="Catat biaya item ini ke Transaksi & Potong Saldo Rekening"
                                      className="p-1.5 rounded-[8px] text-[#c3c3cc] hover:text-[#5266eb] hover:bg-[#272735] transition-colors cursor-pointer"
                                    >
                                      <ArrowUpRight className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleOpenEditItem(item)}
                                    title="Edit Item RAB"
                                    className="p-1.5 rounded-[8px] text-[#c3c3cc] hover:text-[#ededf3] hover:bg-[#272735] transition-colors cursor-pointer"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteItem(item.id)}
                                    title="Hapus Item RAB"
                                    className="p-1.5 rounded-[8px] text-[#c3c3cc] hover:text-[#ef4444] hover:bg-[#272735] transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>

                      {/* Table Footer Totals */}
                      <tfoot className="border-t-2 border-[#272735] text-xs bg-[#171721]/60">
                        <tr>
                          <td colSpan={5} className="py-3 px-3 text-right text-[#c3c3cc] font-[480]">
                            Subtotal Estimasi Biaya Murni
                          </td>
                          <td className="py-3 px-3 text-right font-mono tabular-nums font-[500] text-[#ededf3]">
                            {formatCurrency(metrics.subtotalEstimated, currency)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono tabular-nums font-[500] text-[#10b981]">
                            {formatCurrency(metrics.totalActual, currency)}
                          </td>
                          <td colSpan={2} />
                        </tr>
                        {activeProject.contingencyPercent > 0 && (
                          <tr>
                            <td colSpan={5} className="py-2.5 px-3 text-right text-[#c3c3cc]">
                              Dana Cadangan Tak Terduga ({activeProject.contingencyPercent}%)
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono tabular-nums text-[#c3c3cc]">
                              +{formatCurrency(metrics.contingencyAmount, currency)}
                            </td>
                            <td colSpan={3} />
                          </tr>
                        )}
                        <tr className="border-t border-[#272735]">
                          <td colSpan={5} className="py-3.5 px-3 text-right text-[#ededf3] font-[600]">
                            TOTAL KESELURUHAN RAB (GRAND TOTAL)
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono tabular-nums text-sm font-[600] text-[#5266eb]">
                            {formatCurrency(metrics.grandTotalEstimated, currency)}
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono tabular-nums text-sm font-[600] text-[#10b981]">
                            {formatCurrency(metrics.totalActual, currency)}
                          </td>
                          <td colSpan={2} />
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* Modal 1: Create / Edit RAB Project */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e1e2a] border border-[#272735] rounded-[20px] max-w-lg w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#272735] pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#5266eb] font-[500]">
                  KONFIGURASI PROYEK RAB
                </span>
                <h3 className="text-lg font-[480] text-[#ededf3]">
                  {editingProject ? 'Edit Informasi Proyek RAB' : 'Buat Proyek RAB Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsProjectModalOpen(false)}
                className="p-1.5 rounded-lg text-[#c3c3cc] hover:text-[#ededf3] hover:bg-[#272735]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProjectForm} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#c3c3cc] mb-1.5">
                  Nama Proyek / Keperluan RAB *
                </label>
                <input
                  type="text"
                  required
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  placeholder="Contoh: Bangun Rumah Tipe 45, Renovasi Dapur, Modal Kafe..."
                  className="w-full bg-[#171721] border border-[#272735] rounded-[10px] px-3.5 py-2.5 text-[#ededf3] focus:outline-none focus:border-[#5266eb]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#c3c3cc] mb-1.5">Kategori Keperluan</label>
                  <select
                    value={projType}
                    onChange={(e) => setProjType(e.target.value)}
                    className="w-full bg-[#171721] border border-[#272735] rounded-[10px] px-3 py-2.5 text-[#ededf3] focus:outline-none focus:border-[#5266eb]"
                  >
                    {PROJECT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#c3c3cc] mb-1.5">Status Proyek</label>
                  <select
                    value={projStatus}
                    onChange={(e) => setProjStatus(e.target.value as RabProjectStatus)}
                    className="w-full bg-[#171721] border border-[#272735] rounded-[10px] px-3 py-2.5 text-[#ededf3] focus:outline-none focus:border-[#5266eb]"
                  >
                    <option value="perencanaan">Perencanaan</option>
                    <option value="berjalan">Sedang Berjalan</option>
                    <option value="selesai">Selesai</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#c3c3cc] mb-1.5">
                    Pagu Dana Tersedia ({currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={projBudget}
                    onChange={(e) => setProjBudget(e.target.value)}
                    placeholder="Contoh: 50000000"
                    className="w-full bg-[#171721] border border-[#272735] rounded-[10px] px-3.5 py-2.5 text-[#ededf3] font-mono tabular-nums focus:outline-none focus:border-[#5266eb]"
                  />
                </div>

                <div>
                  <label className="block text-[#c3c3cc] mb-1.5">
                    Dana Cadangan Tak Terduga (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={projContingency}
                    onChange={(e) => setProjContingency(e.target.value)}
                    placeholder="Contoh: 10"
                    className="w-full bg-[#171721] border border-[#272735] rounded-[10px] px-3.5 py-2.5 text-[#ededf3] font-mono tabular-nums focus:outline-none focus:border-[#5266eb]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#c3c3cc] mb-1.5">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={projStartDate}
                    onChange={(e) => setProjStartDate(e.target.value)}
                    className="w-full bg-[#171721] border border-[#272735] rounded-[10px] px-3 py-2.5 text-[#ededf3] focus:outline-none focus:border-[#5266eb]"
                  />
                </div>
                <div>
                  <label className="block text-[#c3c3cc] mb-1.5">Target Selesai (Opsional)</label>
                  <input
                    type="date"
                    value={projTargetDate}
                    onChange={(e) => setProjTargetDate(e.target.value)}
                    className="w-full bg-[#171721] border border-[#272735] rounded-[10px] px-3 py-2.5 text-[#ededf3] focus:outline-none focus:border-[#5266eb]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#c3c3cc] mb-1.5">Catatan / Deskripsi Proyek</label>
                <textarea
                  rows={2}
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  placeholder="Rincian singkat tujuan pembangunan, ukuran luas, lokasi, atau catatan penting..."
                  className="w-full bg-[#171721] border border-[#272735] rounded-[10px] px-3.5 py-2 text-[#ededf3] focus:outline-none focus:border-[#5266eb]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#272735]">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="pill-button-secondary px-4 py-2 text-xs"
                >
                  Batal
                </button>
                <button type="submit" className="pill-button-primary px-5 py-2 text-xs">
                  {editingProject ? 'Simpan Perubahan' : 'Buat Proyek RAB'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add / Edit RAB Item */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e1e2a] border border-[#272735] rounded-[20px] max-w-lg w-full p-6 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#272735] pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#5266eb] font-[500]">
                  KOMPONEN KEPERLUAN RAB
                </span>
                <h3 className="text-lg font-[480] text-[#ededf3]">
                  {editingItem ? 'Edit Komponen Keperluan' : 'Tambah Keperluan / Barang / Jasa'}
                </h3>
              </div>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="p-1.5 rounded-lg text-[#c3c3cc] hover:text-[#ededf3] hover:bg-[#272735]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItemForm} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#c3c3cc] mb-1.5">
                  Nama Keperluan / Material / Upah Pekerjaan *
                </label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="Contoh: Semen 50kg, Keramik 60x60, Upah Tukang, Besi 10mm..."
                  className="w-full bg-[#171721] border border-[#272735] rounded-[10px] px-3.5 py-2.5 text-[#ededf3] focus:outline-none focus:border-[#5266eb]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#c3c3cc] mb-1.5">Kategori / Tahap</label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value)}
                    className="w-full bg-[#171721] border border-[#272735] rounded-[10px] px-3 py-2.5 text-[#ededf3] focus:outline-none focus:border-[#5266eb]"
                  >
                    {DEFAULT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="CUSTOM">+ Ketik Kategori Sendiri...</option>
                  </select>
                </div>

                {itemCategory === 'CUSTOM' ? (
                  <div>
                    <label className="block text-[#c3c3cc] mb-1.5">Nama Kategori Baru</label>
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Contoh: Pekerjaan Atap"
                      className="w-full bg-[#171721] border border-[#272735] rounded-[10px] px-3.5 py-2.5 text-[#ededf3] focus:outline-none focus:border-[#5266eb]"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[#c3c3cc] mb-1.5">Tingkat Prioritas</label>
                    <select
                      value={itemPriority}
                      onChange={(e) => setItemPriority(e.target.value as RabItemPriority)}
                      className="w-full bg-[#171721] border border-[#272735] rounded-[10px] px-3 py-2.5 text-[#ededf3] focus:outline-none focus:border-[#5266eb]"
                    >
                      <option value="utama">Utama / Wajib</option>
                      <option value="menengah">Menengah</option>
                      <option value="opsional">Opsional / Tambahan</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#c3c3cc] mb-1.5">Volume / Jumlah *</label>
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    required
                    value={itemVolume}
                    onChange={(e) => setItemVolume(e.target.value)}
                    className="w-full bg-[#171721] border border-[#272735] rounded-[10px] px-3 py-2.5 text-[#ededf3] font-mono tabular-nums focus:outline-none focus:border-[#5266eb]"
                  />
                </div>

                <div>
                  <label className="block text-[#c3c3cc] mb-1.5">Satuan</label>
                  <select
                    value={itemUnit}
                    onChange={(e) => setItemUnit(e.target.value)}
                    className="w-full bg-[#171721] border border-[#272735] rounded-[10px] px-3 py-2.5 text-[#ededf3] focus:outline-none focus:border-[#5266eb]"
                  >
                    {DEFAULT_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                    <option value="CUSTOM">+ Satuan Lain...</option>
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[#c3c3cc] mb-1.5">
                    Harga Satuan ({currency}) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={itemUnitPrice}
                    onChange={(e) => setItemUnitPrice(e.target.value)}
                    placeholder="Contoh: 68000"
                    className="w-full bg-[#171721] border border-[#272735] rounded-[10px] px-3 py-2.5 text-[#ededf3] font-mono tabular-nums focus:outline-none focus:border-[#5266eb]"
                  />
                </div>
              </div>

              {itemUnit === 'CUSTOM' && (
                <div>
                  <label className="block text-[#c3c3cc] mb-1.5">Ketik Satuan Kustom</label>
                  <input
                    type="text"
                    value={customUnit}
                    onChange={(e) => setCustomUnit(e.target.value)}
                    placeholder="Contoh: Borongan, Titik, Kali..."
                    className="w-full bg-[#171721] border border-[#272735] rounded-[10px] px-3.5 py-2 text-[#ededf3] focus:outline-none focus:border-[#5266eb]"
                  />
                </div>
              )}

              {/* Live Calculation Preview Box */}
              <div className="bg-[#171721] p-3.5 rounded-[12px] border border-[#5266eb]/30 flex items-center justify-between">
                <span className="text-[#c3c3cc]">Total Estimasi (Volume × Harga Satuan):</span>
                <span className="text-sm font-mono tabular-nums font-[600] text-[#5266eb]">
                  {formatCurrency(liveModalTotalEstimate, currency)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#c3c3cc] mb-1.5">Status Pelaksanaan</label>
                  <select
                    value={itemStatus}
                    onChange={(e) => setItemStatus(e.target.value as RabItemStatus)}
                    className="w-full bg-[#171721] border border-[#272735] rounded-[10px] px-3 py-2.5 text-[#ededf3] focus:outline-none focus:border-[#5266eb]"
                  >
                    <option value="rencana">Masih Rencana</option>
                    <option value="proses">Sedang Dikerjakan / Dibeli</option>
                    <option value="selesai">Selesai / Sudah Lunas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#c3c3cc] mb-1.5">
                    Realisasi Biaya Aktual (Opsional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={itemActualCost}
                    onChange={(e) => setItemActualCost(e.target.value)}
                    placeholder="Kosongkan jika belum dibayar"
                    className="w-full bg-[#171721] border border-[#272735] rounded-[10px] px-3.5 py-2.5 text-[#ededf3] font-mono tabular-nums focus:outline-none focus:border-[#5266eb]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#c3c3cc] mb-1.5">
                  Spesifikasi / Merk / Nama Toko / Catatan
                </label>
                <input
                  type="text"
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  placeholder="Contoh: Merk Tiga Roda, Toko Bangunan Maju Jaya..."
                  className="w-full bg-[#171721] border border-[#272735] rounded-[10px] px-3.5 py-2.5 text-[#ededf3] focus:outline-none focus:border-[#5266eb]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#272735]">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="pill-button-secondary px-4 py-2 text-xs"
                >
                  Batal
                </button>
                <button type="submit" className="pill-button-primary px-5 py-2 text-xs">
                  {editingItem ? 'Simpan Perubahan' : 'Tambahkan ke RAB'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Record RAB Item to Real Transaction */}
      {recordingItem && activeProject && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e1e2a] border border-[#272735] rounded-[20px] max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-[#272735] pb-3">
              <h3 className="text-base font-[480] text-[#ededf3]">
                Catat Pengeluaran RAB ke Rekening
              </h3>
              <button
                onClick={() => setRecordingItem(null)}
                className="p-1 text-[#c3c3cc] hover:text-[#ededf3]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[#c3c3cc] leading-relaxed">
              Item <strong className="text-[#ededf3]">{recordingItem.name}</strong> sebesar{' '}
              <strong className="text-[#10b981] font-mono tabular-nums">
                {formatCurrency(
                  recordingItem.actualCost > 0
                    ? recordingItem.actualCost
                    : recordingItem.totalEstimated,
                  currency
                )}
              </strong>{' '}
              akan dicatat sebagai transaksi pengeluaran dan memotong saldo rekening pilihan Anda.
            </p>

            <div>
              <label className="block text-[#c3c3cc] mb-1.5">Pilih Sumber Rekening Pembayaran</label>
              {accounts.length > 0 ? (
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full bg-[#171721] border border-[#272735] rounded-[10px] px-3 py-2.5 text-[#ededf3]"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({formatCurrency(acc.balance, currency)})
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-[#ef4444]">
                  Anda belum memiliki rekening aktif. Tambahkan rekening di menu Rekening terlebih dahulu.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#272735]">
              <button
                onClick={() => setRecordingItem(null)}
                className="pill-button-secondary px-4 py-2 text-xs"
              >
                Batal
              </button>
              <button
                disabled={accounts.length === 0}
                onClick={handleConfirmRecordExpense}
                className="pill-button-primary px-4 py-2 text-xs disabled:opacity-40"
              >
                Catat &amp; Potong Saldo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
