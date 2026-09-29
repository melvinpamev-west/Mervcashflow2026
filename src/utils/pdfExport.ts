import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Account, Budget, Currency, PdfExportScope, RabProject, SavingsGoal, Transaction } from '../types';
import { formatCurrency, formatDate } from './formatters';

export type PdfReportTheme = 'light' | 'dark';

export interface ExportPdfParams {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  currency: Currency;
  userEmail?: string | null;
  userName?: string | null;
  theme?: PdfReportTheme;
  maxTransactions?: number;
  scope?: PdfExportScope;
}

export function generateFinancialPdfReport({
  accounts,
  transactions,
  budgets,
  goals: _goals,
  currency,
  userEmail,
  userName,
  theme = 'light',
  maxTransactions = 50,
  scope = 'keuangan',
}: ExportPdfParams) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const isDark = theme === 'dark';

  // Palette definitions:
  // Light mode (default) provides high-contrast, crystal-clear readability and print-readiness.
  // Dark mode (Alpen Dark) provides an observatory dark theme with guaranteed background layering.
  const COLORS = isDark
    ? {
        bgPage: [23, 23, 33] as const, // #171721
        bgCard: [32, 32, 46] as const, // #20202e
        bgCardBorder: [50, 50, 70] as const, // #323246
        textPrimary: [255, 255, 255] as const, // Pure white
        textSecondary: [203, 213, 225] as const, // Slate-300
        textMuted: [148, 163, 184] as const, // Slate-400
        accentBrand: [99, 102, 241] as const, // Indigo-500
        accentGreen: [52, 211, 153] as const, // Emerald-400
        accentGreenBg: [20, 50, 40] as const,
        accentRed: [248, 113, 113] as const, // Rose-400
        accentRedBg: [60, 25, 30] as const,
        tableHeadBg: [40, 40, 58] as const,
        tableHeadText: [255, 255, 255] as const,
        tableRowBg: [27, 27, 38] as const,
        tableRowAltBg: [34, 34, 48] as const,
        tableRowText: [255, 255, 255] as const,
        tableBorder: [46, 46, 66] as const,
        divider: [46, 46, 66] as const,
      }
    : {
        bgPage: [255, 255, 255] as const, // Pure white
        bgCard: [248, 250, 252] as const, // Slate-50
        bgCardBorder: [226, 232, 240] as const, // Slate-200
        textPrimary: [15, 23, 42] as const, // Slate-900 (ultra sharp, high contrast)
        textSecondary: [51, 65, 85] as const, // Slate-700
        textMuted: [100, 116, 139] as const, // Slate-500
        accentBrand: [79, 70, 229] as const, // Indigo-600
        accentGreen: [5, 150, 105] as const, // Emerald-600
        accentGreenBg: [236, 253, 245] as const, // Emerald-50
        accentRed: [220, 38, 38] as const, // Red-600
        accentRedBg: [254, 242, 242] as const, // Red-50
        tableHeadBg: [30, 41, 59] as const, // Slate-800
        tableHeadText: [255, 255, 255] as const, // White
        tableRowBg: [255, 255, 255] as const, // White
        tableRowAltBg: [248, 250, 252] as const, // Slate-50
        tableRowText: [15, 23, 42] as const, // Slate-900
        tableBorder: [226, 232, 240] as const, // Slate-200
        divider: [226, 232, 240] as const, // Slate-200
      };

  // Helper to paint page background strictly BEFORE any content
  const paintBackground = () => {
    if (isDark) {
      doc.setFillColor(COLORS.bgPage[0], COLORS.bgPage[1], COLORS.bgPage[2]);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
    }
  };

  // Paint background for page 1
  paintBackground();

  // Financial Calculations
  const totalNetWorth = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const netCashFlow = totalIncome - totalExpense;

  let currentY = 16;

  // Header Brand & Logo Mark
  const logoCenterX = 21;
  const logoCenterY = currentY + 4;

  // Outer logo circle
  doc.setDrawColor(COLORS.textPrimary[0], COLORS.textPrimary[1], COLORS.textPrimary[2]);
  doc.setLineWidth(0.4);
  doc.circle(logoCenterX, logoCenterY, 5, 'S');

  // Middle logo circle
  doc.setDrawColor(COLORS.accentBrand[0], COLORS.accentBrand[1], COLORS.accentBrand[2]);
  doc.circle(logoCenterX, logoCenterY, 2.8, 'S');

  // Center logo core
  doc.setFillColor(COLORS.accentBrand[0], COLORS.accentBrand[1], COLORS.accentBrand[2]);
  doc.circle(logoCenterX, logoCenterY, 1.2, 'F');

  // Brand Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(COLORS.textPrimary[0], COLORS.textPrimary[1], COLORS.textPrimary[2]);
  doc.text('MERVFLOW MONEY', 30, currentY + 3.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text('LAPORAN KEUANGAN KONSOLIDASI & ARUS KAS RESMI', 30, currentY + 8);

  // Right-aligned report status
  const printDateStr = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(COLORS.accentBrand[0], COLORS.accentBrand[1], COLORS.accentBrand[2]);
  doc.text('DOKUMEN RESMI TERVERIFIKASI', pageWidth - 16, currentY + 2, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(COLORS.textSecondary[0], COLORS.textSecondary[1], COLORS.textSecondary[2]);
  doc.text(`Dicetak: ${printDateStr}`, pageWidth - 16, currentY + 6.5, { align: 'right' });

  const ownerLabel = userName || userEmail || 'Pengguna Terdaftar';
  doc.text(`Akun: ${ownerLabel}`, pageWidth - 16, currentY + 10.5, { align: 'right' });

  currentY += 16;

  // Header Divider Line
  doc.setDrawColor(COLORS.divider[0], COLORS.divider[1], COLORS.divider[2]);
  doc.setLineWidth(0.4);
  doc.line(16, currentY, pageWidth - 16, currentY);
  currentY += 6;

  // Summary Metrics Bento Grid (4 Cards)
  const marginX = 16;
  const availableWidth = pageWidth - marginX * 2;
  const gap = 3;
  const cardWidth = (availableWidth - gap * 3) / 4;
  const cardHeight = 22;

  const metrics = [
    {
      title: 'TOTAL KEKAYAAN',
      value: formatCurrency(totalNetWorth, currency),
      topAccent: COLORS.accentBrand,
      bg: COLORS.bgCard,
      border: COLORS.bgCardBorder,
      valueColor: COLORS.textPrimary,
    },
    {
      title: 'TOTAL PEMASUKAN',
      value: `+${formatCurrency(totalIncome, currency)}`,
      topAccent: COLORS.accentGreen,
      bg: isDark ? COLORS.accentGreenBg : COLORS.accentGreenBg,
      border: isDark ? COLORS.bgCardBorder : [187, 247, 208] as const,
      valueColor: isDark ? COLORS.accentGreen : COLORS.accentGreen,
    },
    {
      title: 'TOTAL PENGELUARAN',
      value: `-${formatCurrency(totalExpense, currency)}`,
      topAccent: COLORS.accentRed,
      bg: isDark ? COLORS.accentRedBg : COLORS.accentRedBg,
      border: isDark ? COLORS.bgCardBorder : [254, 202, 202] as const,
      valueColor: isDark ? COLORS.accentRed : COLORS.accentRed,
    },
    {
      title: 'ARUS KAS BERSIH',
      value: `${netCashFlow >= 0 ? '+' : ''}${formatCurrency(netCashFlow, currency)}`,
      topAccent: netCashFlow >= 0 ? COLORS.accentGreen : COLORS.accentRed,
      bg: COLORS.bgCard,
      border: COLORS.bgCardBorder,
      valueColor: netCashFlow >= 0 ? COLORS.accentGreen : COLORS.accentRed,
    },
  ];

  metrics.forEach((m, idx) => {
    const x = marginX + idx * (cardWidth + gap);

    // Card background
    doc.setFillColor(m.bg[0], m.bg[1], m.bg[2]);
    doc.roundedRect(x, currentY, cardWidth, cardHeight, 1.8, 1.8, 'F');

    // Card border
    doc.setDrawColor(m.border[0], m.border[1], m.border[2]);
    doc.setLineWidth(0.2);
    doc.roundedRect(x, currentY, cardWidth, cardHeight, 1.8, 1.8, 'S');

    // Top border accent line
    doc.setFillColor(m.topAccent[0], m.topAccent[1], m.topAccent[2]);
    doc.rect(x + 2, currentY, cardWidth - 4, 0.9, 'F');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    doc.text(m.title, x + 3.5, currentY + 6.5);

    // Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(m.valueColor[0], m.valueColor[1], m.valueColor[2]);
    doc.text(m.value, x + 3.5, currentY + 15);
  });

  currentY += cardHeight + 8;

  const showAccounts = scope === 'keuangan' || scope === 'rekening';
  const showBudgets = (scope === 'keuangan' || scope === 'anggaran') && (budgets.length > 0 || scope === 'anggaran');
  const showTransactions = scope === 'keuangan' || scope === 'transaksi';

  // SECTION 1: DAFTAR REKENING & SALDO AKTIF
  if (showAccounts) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(COLORS.textPrimary[0], COLORS.textPrimary[1], COLORS.textPrimary[2]);
    doc.text('Observatorium Rekening & Saldo E-Wallet', 16, currentY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    doc.text(
      `Terdaftar ${accounts.length} rekening & e-wallet aktif dengan total likuiditas ${formatCurrency(totalNetWorth, currency)}`,
      16,
      currentY + 4
    );
    currentY += 6;

    const accountRows =
      accounts.length > 0
        ? accounts.map((acc, i) => [
            (i + 1).toString(),
            acc.name,
            acc.type.toUpperCase(),
            acc.institution || '-',
            acc.accountNumber || '-',
            formatCurrency(acc.balance, currency),
          ])
        : [['-', 'Belum ada rekening tercatat', '-', '-', '-', formatCurrency(0, currency)]];

    autoTable(doc, {
      startY: currentY,
      head: [['No', 'Nama Rekening / E-Wallet', 'Tipe', 'Institusi', 'No. Akun', 'Saldo Terkini']],
      body: accountRows,
      theme: 'plain',
      margin: { left: 16, right: 16 },
      styles: {
        fontSize: 8,
        cellPadding: 2.4,
        textColor: [COLORS.tableRowText[0], COLORS.tableRowText[1], COLORS.tableRowText[2]],
        fillColor: [COLORS.tableRowBg[0], COLORS.tableRowBg[1], COLORS.tableRowBg[2]],
        lineColor: [COLORS.tableBorder[0], COLORS.tableBorder[1], COLORS.tableBorder[2]],
        lineWidth: 0.2,
        font: 'helvetica',
      },
      headStyles: {
        fillColor: [COLORS.tableHeadBg[0], COLORS.tableHeadBg[1], COLORS.tableHeadBg[2]],
        textColor: [COLORS.tableHeadText[0], COLORS.tableHeadText[1], COLORS.tableHeadText[2]],
        fontStyle: 'bold',
        fontSize: 8,
      },
      alternateRowStyles: {
        fillColor: [COLORS.tableRowAltBg[0], COLORS.tableRowAltBg[1], COLORS.tableRowAltBg[2]],
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 48, fontStyle: 'bold' },
        2: { cellWidth: 26 },
        3: { cellWidth: 34 },
        4: { cellWidth: 28 },
        5: { halign: 'right', fontStyle: 'bold' },
      },
      willDrawPage: () => {
        paintBackground();
      },
    });

    // @ts-ignore
    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // SECTION 2: ANGGARAN BULANAN
  if (showBudgets) {
    if (currentY > pageHeight - 55) {
      doc.addPage();
      paintBackground();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(COLORS.textPrimary[0], COLORS.textPrimary[1], COLORS.textPrimary[2]);
    doc.text('Alokasi Anggaran & Batas Pengeluaran Bulanan', 16, currentY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    doc.text('Pemantauan realisasi pengeluaran terhadap pagu batas yang direncanakan', 16, currentY + 4);
    currentY += 6;

    const budgetRows =
      budgets.length > 0
        ? budgets.map((b, i) => {
            const spent = transactions
              .filter((t) => t.type === 'expense' && t.category === b.category)
              .reduce((sum, t) => sum + t.amount, 0);
            const remaining = b.monthlyLimit - spent;
            const pct = Math.min(Math.round((spent / b.monthlyLimit) * 100) || 0, 999);
            return [
              (i + 1).toString(),
              b.category,
              formatCurrency(b.monthlyLimit, currency),
              formatCurrency(spent, currency),
              formatCurrency(remaining, currency),
              `${pct}%`,
            ];
          })
        : [['-', 'Belum ada kategori anggaran ditetapkan', '-', '-', '-', '-']];

    autoTable(doc, {
      startY: currentY,
      head: [['No', 'Kategori Pengeluaran', 'Batas Anggaran', 'Realisasi Terpakai', 'Sisa Anggaran', 'Status %']],
      body: budgetRows,
      theme: 'plain',
      margin: { left: 16, right: 16 },
      styles: {
        fontSize: 8,
        cellPadding: 2.4,
        textColor: [COLORS.tableRowText[0], COLORS.tableRowText[1], COLORS.tableRowText[2]],
        fillColor: [COLORS.tableRowBg[0], COLORS.tableRowBg[1], COLORS.tableRowBg[2]],
        lineColor: [COLORS.tableBorder[0], COLORS.tableBorder[1], COLORS.tableBorder[2]],
        lineWidth: 0.2,
        font: 'helvetica',
      },
      headStyles: {
        fillColor: [COLORS.tableHeadBg[0], COLORS.tableHeadBg[1], COLORS.tableHeadBg[2]],
        textColor: [COLORS.tableHeadText[0], COLORS.tableHeadText[1], COLORS.tableHeadText[2]],
        fontStyle: 'bold',
        fontSize: 8,
      },
      alternateRowStyles: {
        fillColor: [COLORS.tableRowAltBg[0], COLORS.tableRowAltBg[1], COLORS.tableRowAltBg[2]],
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 48, fontStyle: 'bold' },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'center', fontStyle: 'bold' },
      },
      willDrawPage: () => {
        paintBackground();
      },
    });

    // @ts-ignore
    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // SECTION 3: RIWAYAT TRANSAKSI TERAKHIR
  if (showTransactions) {
    if (currentY > pageHeight - 55) {
      doc.addPage();
      paintBackground();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(COLORS.textPrimary[0], COLORS.textPrimary[1], COLORS.textPrimary[2]);
    doc.text('Riwayat Transaksi Arus Kas', 16, currentY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    doc.text(
      `Menampilkan ${Math.min(transactions.length, maxTransactions)} dari ${transactions.length} total transaksi tercatat`,
      16,
      currentY + 4
    );
    currentY += 6;

    const txRows =
      transactions.length > 0
        ? transactions.slice(0, maxTransactions).map((t, i) => {
            const acc = accounts.find((a) => a.id === t.accountId);
            const targetAcc = accounts.find((a) => a.id === t.targetAccountId);
            const accLabel =
              t.type === 'transfer' && targetAcc
                ? `${acc?.name || 'Rekening'} -> ${targetAcc.name}`
                : acc?.name || '-';
            const sign = t.type === 'income' ? '+' : t.type === 'expense' ? '-' : '';
            return [
              (i + 1).toString(),
              formatDate(t.date),
              t.category,
              accLabel,
              t.notes || '-',
              `${sign}${formatCurrency(t.amount, currency)}`,
            ];
          })
        : [['-', '-', 'Belum ada transaksi', '-', '-', '-']];

    autoTable(doc, {
      startY: currentY,
      head: [['No', 'Tanggal', 'Kategori', 'Rekening', 'Catatan / Deskripsi', 'Jumlah']],
      body: txRows,
      theme: 'plain',
      margin: { left: 16, right: 16 },
      styles: {
        fontSize: 7.5,
        cellPadding: 2.2,
        textColor: [COLORS.tableRowText[0], COLORS.tableRowText[1], COLORS.tableRowText[2]],
        fillColor: [COLORS.tableRowBg[0], COLORS.tableRowBg[1], COLORS.tableRowBg[2]],
        lineColor: [COLORS.tableBorder[0], COLORS.tableBorder[1], COLORS.tableBorder[2]],
        lineWidth: 0.2,
        font: 'helvetica',
      },
      headStyles: {
        fillColor: [COLORS.tableHeadBg[0], COLORS.tableHeadBg[1], COLORS.tableHeadBg[2]],
        textColor: [COLORS.tableHeadText[0], COLORS.tableHeadText[1], COLORS.tableHeadText[2]],
        fontStyle: 'bold',
        fontSize: 7.5,
      },
      alternateRowStyles: {
        fillColor: [COLORS.tableRowAltBg[0], COLORS.tableRowAltBg[1], COLORS.tableRowAltBg[2]],
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 24 },
        2: { cellWidth: 36, fontStyle: 'bold' },
        3: { cellWidth: 38 },
        4: { cellWidth: 42 },
        5: { halign: 'right', fontStyle: 'bold' },
      },
      willDrawPage: () => {
        paintBackground();
      },
    });
  }

  // Footer for all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    // Footer divider line
    doc.setDrawColor(COLORS.divider[0], COLORS.divider[1], COLORS.divider[2]);
    doc.setLineWidth(0.3);
    doc.line(16, pageHeight - 12, pageWidth - 16, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    doc.text(
      'MervFlow Money • Laporan Keuangan Pribadi Resmi • Tersinkronisasi dengan Firebase Cloud',
      16,
      pageHeight - 7
    );
    doc.text(`Halaman ${p} dari ${totalPages}`, pageWidth - 16, pageHeight - 7, {
      align: 'right',
    });
  }

  // Save the document with scope-specific filename
  const themeSuffix = isDark ? '_Dark' : '';
  const scopeLabel =
    scope === 'rekening'
      ? 'Khusus_Rekening_EWallet'
      : scope === 'transaksi'
      ? 'Khusus_Transaksi'
      : scope === 'anggaran'
      ? 'Khusus_Anggaran'
      : 'Keuangan_Utama';
  const fileName = `Laporan_${scopeLabel}_MervFlow${themeSuffix}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}

export function generateRabPdfReport(
  project: RabProject,
  currency: Currency,
  userEmail?: string | null,
  userName?: string | null,
  theme: PdfReportTheme = 'light'
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const isDark = theme === 'dark';

  const COLORS = isDark
    ? {
        bgPage: [23, 23, 33] as const,
        bgCard: [32, 32, 46] as const,
        bgCardBorder: [50, 50, 70] as const,
        textPrimary: [255, 255, 255] as const,
        textSecondary: [203, 213, 225] as const,
        textMuted: [148, 163, 184] as const,
        accentBrand: [99, 102, 241] as const,
        accentGreen: [52, 211, 153] as const,
        accentRed: [248, 113, 113] as const,
        tableHeadBg: [40, 40, 58] as const,
        tableHeadText: [255, 255, 255] as const,
        tableRowBg: [27, 27, 38] as const,
        tableRowAltBg: [34, 34, 48] as const,
        tableRowText: [255, 255, 255] as const,
        tableBorder: [46, 46, 66] as const,
        divider: [46, 46, 66] as const,
      }
    : {
        bgPage: [255, 255, 255] as const,
        bgCard: [248, 250, 252] as const,
        bgCardBorder: [226, 232, 240] as const,
        textPrimary: [15, 23, 42] as const,
        textSecondary: [51, 65, 85] as const,
        textMuted: [100, 116, 139] as const,
        accentBrand: [79, 70, 229] as const,
        accentGreen: [5, 150, 105] as const,
        accentRed: [220, 38, 38] as const,
        tableHeadBg: [30, 41, 59] as const,
        tableHeadText: [255, 255, 255] as const,
        tableRowBg: [255, 255, 255] as const,
        tableRowAltBg: [248, 250, 252] as const,
        tableRowText: [15, 23, 42] as const,
        tableBorder: [226, 232, 240] as const,
        divider: [226, 232, 240] as const,
      };

  const paintBackground = () => {
    if (isDark) {
      doc.setFillColor(COLORS.bgPage[0], COLORS.bgPage[1], COLORS.bgPage[2]);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
    }
  };

  paintBackground();

  const totalEstimated = project.items.reduce((sum, item) => sum + item.totalEstimated, 0);
  const contingencyAmount = Math.round(totalEstimated * ((project.contingencyPercent || 0) / 100));
  const grandTotalEstimated = totalEstimated + contingencyAmount;
  const totalActual = project.items.reduce((sum, item) => sum + item.actualCost, 0);
  const budgetDiff = project.allocatedBudget - grandTotalEstimated;

  let currentY = 16;

  // Header Brand
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(COLORS.textPrimary[0], COLORS.textPrimary[1], COLORS.textPrimary[2]);
  doc.text('DOKUMEN RENCANA ANGGARAN BIAYA (RAB)', 16, currentY + 3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text(`MERVFLOW MONEY • ${project.projectType.toUpperCase()}`, 16, currentY + 8);

  const printDateStr = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(COLORS.accentBrand[0], COLORS.accentBrand[1], COLORS.accentBrand[2]);
  doc.text(`STATUS: ${project.status.toUpperCase()}`, pageWidth - 16, currentY + 2, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(COLORS.textSecondary[0], COLORS.textSecondary[1], COLORS.textSecondary[2]);
  doc.text(`Tanggal Cetak: ${printDateStr}`, pageWidth - 16, currentY + 6.5, { align: 'right' });
  doc.text(`Penyusun: ${userName || userEmail || 'Pemilik Proyek'}`, pageWidth - 16, currentY + 10.5, { align: 'right' });

  currentY += 15;

  doc.setDrawColor(COLORS.divider[0], COLORS.divider[1], COLORS.divider[2]);
  doc.setLineWidth(0.4);
  doc.line(16, currentY, pageWidth - 16, currentY);
  currentY += 6;

  // Project Title & Description Box
  doc.setFillColor(COLORS.bgCard[0], COLORS.bgCard[1], COLORS.bgCard[2]);
  doc.setDrawColor(COLORS.bgCardBorder[0], COLORS.bgCardBorder[1], COLORS.bgCardBorder[2]);
  doc.roundedRect(16, currentY, pageWidth - 32, 18, 1.8, 1.8, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(COLORS.textPrimary[0], COLORS.textPrimary[1], COLORS.textPrimary[2]);
  doc.text(project.title, 20, currentY + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(COLORS.textSecondary[0], COLORS.textSecondary[1], COLORS.textSecondary[2]);
  const descText = project.description || 'Perencanaan rincian kebutuhan material, jasa, dan perlengkapan proyek.';
  doc.text(descText.slice(0, 115), 20, currentY + 12);

  doc.setFontSize(7.5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text(
    `Mulai: ${formatDate(project.startDate)}${project.targetDate ? ` • Target Selesai: ${formatDate(project.targetDate)}` : ''} • Jumlah Komponen: ${project.items.length} item`,
    20,
    currentY + 16
  );

  currentY += 23;

  // 4 Metric Cards
  const marginX = 16;
  const availableWidth = pageWidth - marginX * 2;
  const gap = 3;
  const cardWidth = (availableWidth - gap * 3) / 4;
  const cardHeight = 20;

  const rabMetrics = [
    {
      title: 'ESTIMASI MURNI + CADANGAN',
      value: formatCurrency(grandTotalEstimated, currency),
      sub: `Cadangan ${project.contingencyPercent || 0}%: ${formatCurrency(contingencyAmount, currency)}`,
      color: COLORS.textPrimary,
    },
    {
      title: 'PAGU DANA TERSEDIA',
      value: formatCurrency(project.allocatedBudget, currency),
      sub: budgetDiff >= 0 ? `Surplus: +${formatCurrency(budgetDiff, currency)}` : `Kurang: ${formatCurrency(budgetDiff, currency)}`,
      color: budgetDiff >= 0 ? COLORS.accentGreen : COLORS.accentRed,
    },
    {
      title: 'REALISASI TERPAKAI',
      value: formatCurrency(totalActual, currency),
      sub: `${grandTotalEstimated > 0 ? Math.round((totalActual / grandTotalEstimated) * 100) : 0}% dari total RAB`,
      color: COLORS.accentBrand,
    },
    {
      title: 'PROGRES ITEM SELESAI',
      value: `${project.items.filter((i) => i.status === 'selesai').length} / ${project.items.length} Item`,
      sub: `${project.items.filter((i) => i.priority === 'utama').length} Item Prioritas Utama`,
      color: COLORS.textPrimary,
    },
  ];

  rabMetrics.forEach((m, idx) => {
    const x = marginX + idx * (cardWidth + gap);
    doc.setFillColor(COLORS.bgCard[0], COLORS.bgCard[1], COLORS.bgCard[2]);
    doc.setDrawColor(COLORS.bgCardBorder[0], COLORS.bgCardBorder[1], COLORS.bgCardBorder[2]);
    doc.roundedRect(x, currentY, cardWidth, cardHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    doc.text(m.title, x + 3, currentY + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(m.color[0], m.color[1], m.color[2]);
    doc.text(m.value, x + 3, currentY + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(COLORS.textSecondary[0], COLORS.textSecondary[1], COLORS.textSecondary[2]);
    doc.text(m.sub, x + 3, currentY + 17);
  });

  currentY += cardHeight + 8;

  // Rincian Item Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(COLORS.textPrimary[0], COLORS.textPrimary[1], COLORS.textPrimary[2]);
  doc.text('1. Rincian Komponen & Keperluan Anggaran Biaya (RAB)', 16, currentY);
  currentY += 4;

  const itemRows =
    project.items.length > 0
      ? project.items.map((item, idx) => [
          (idx + 1).toString(),
          item.name + (item.notes ? `\n(${item.notes})` : ''),
          item.category,
          `${item.volume} ${item.unit}`,
          formatCurrency(item.unitPrice, currency),
          formatCurrency(item.totalEstimated, currency),
          formatCurrency(item.actualCost, currency),
          item.status === 'selesai' ? 'Selesai' : item.status === 'proses' ? 'Proses' : 'Rencana',
        ])
      : [['-', 'Belum ada item keperluan', '-', '-', '-', '-', '-', '-']];

  // Append summary rows at bottom of table
  itemRows.push([
    '',
    'SUBTOTAL ESTIMASI BIAYA MURNI',
    '',
    '',
    '',
    formatCurrency(totalEstimated, currency),
    formatCurrency(totalActual, currency),
    '',
  ]);

  if (project.contingencyPercent > 0) {
    itemRows.push([
      '',
      `DANA CADANGAN TAK TERDUGA (${project.contingencyPercent}%)`,
      '',
      '',
      '',
      formatCurrency(contingencyAmount, currency),
      '-',
      '',
    ]);
  }

  itemRows.push([
    '',
    'TOTAL KESELURUHAN RAB (GRAND TOTAL)',
    '',
    '',
    '',
    formatCurrency(grandTotalEstimated, currency),
    formatCurrency(totalActual, currency),
    '',
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['No', 'Uraian Keperluan / Barang / Jasa', 'Kategori', 'Volume', 'Harga Satuan', 'Total Estimasi', 'Realisasi', 'Status']],
    body: itemRows,
    theme: 'plain',
    margin: { left: 16, right: 16 },
    styles: {
      fontSize: 7.5,
      cellPadding: 2.2,
      textColor: [COLORS.tableRowText[0], COLORS.tableRowText[1], COLORS.tableRowText[2]],
      fillColor: [COLORS.tableRowBg[0], COLORS.tableRowBg[1], COLORS.tableRowBg[2]],
      lineColor: [COLORS.tableBorder[0], COLORS.tableBorder[1], COLORS.tableBorder[2]],
      lineWidth: 0.2,
      font: 'helvetica',
    },
    headStyles: {
      fillColor: [COLORS.tableHeadBg[0], COLORS.tableHeadBg[1], COLORS.tableHeadBg[2]],
      textColor: [COLORS.tableHeadText[0], COLORS.tableHeadText[1], COLORS.tableHeadText[2]],
      fontStyle: 'bold',
      fontSize: 7.5,
    },
    alternateRowStyles: {
      fillColor: [COLORS.tableRowAltBg[0], COLORS.tableRowAltBg[1], COLORS.tableRowAltBg[2]],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 48, fontStyle: 'bold' },
      2: { cellWidth: 26 },
      3: { cellWidth: 18, halign: 'center' },
      4: { cellWidth: 24, halign: 'right' },
      5: { cellWidth: 24, halign: 'right', fontStyle: 'bold' },
      6: { cellWidth: 22, halign: 'right' },
      7: { cellWidth: 14, halign: 'center' },
    },
    willDrawPage: () => {
      paintBackground();
    },
  });

  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(COLORS.divider[0], COLORS.divider[1], COLORS.divider[2]);
    doc.setLineWidth(0.3);
    doc.line(16, pageHeight - 12, pageWidth - 16, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    doc.text(
      `MervFlow Money • Dokumen RAB: ${project.title} • Dicetak Resmi`,
      16,
      pageHeight - 7
    );
    doc.text(`Halaman ${p} dari ${totalPages}`, pageWidth - 16, pageHeight - 7, {
      align: 'right',
    });
  }

  const safeTitle = project.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
  doc.save(`RAB_${safeTitle}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

