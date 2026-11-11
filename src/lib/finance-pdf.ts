/**
 * PDF exports for the Finance & Administration Command Centre (replaces the old CSV export).
 * Every PDF has the MSP heading, the report title, the reporting period, when and by whom it
 * was generated, tables with totals in rand, and "Page x of y" on every page. Tables continue
 * across pages with their headings repeated.
 */
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { randText } from "@/lib/finance-format";

export type FinInvoice = { id: string; invoiceNumber: string; client: string; package?: string | null; monthlyServiceFeeZar: number; paymentStatus: string; dueDate: string; verifiedAt?: string | null; verifiedBy?: string | null; created_at?: string };
export type FinExpense = { id: string; category: string; vendor: string; amountZar: number; date: string; status: string; approvedBy?: string | null };
export type FinApproval = { id: string; title: string; department: string; requestedBy: string; amountZar: number; category: string; status: string; date: string; notes?: string | null };
export type FinBudget = { id: string; dept: string; budget: number; actual: number };
export type FinAudit = { id: string; time: string; actor: string; action: string; detail: string };
export type FinanceData = { invoices: FinInvoice[]; expenses: FinExpense[]; approvals: FinApproval[]; budgets: FinBudget[]; audit: FinAudit[] };
export type Period = { label: string; month?: string }; // month = "YYYY-MM" or undefined for all records

const NAVY: [number, number, number] = [15, 23, 42];
const ACCENT: [number, number, number] = [5, 150, 105];
const MUTED: [number, number, number] = [100, 116, 139];
const sum = (xs: number[]) => xs.reduce((a, b) => a + (Number(b) || 0), 0);
const slug = (s: string) => s.replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "");

/** Records that fall in the reporting period (invoices by due date, expenses/approvals by date). */
export function inPeriod(data: FinanceData, p: Period): FinanceData {
  if (!p.month) return data;
  const m = (d?: string | null) => String(d || "").startsWith(p.month!);
  return {
    invoices: data.invoices.filter((i) => m(i.dueDate)),
    expenses: data.expenses.filter((e) => m(e.date)),
    approvals: data.approvals.filter((a) => m(a.date)),
    budgets: data.budgets,
    audit: data.audit.filter((a) => m(a.time)),
  };
}

function header(doc: jsPDF, title: string, period: Period, generatedBy?: string) {
  const now = new Date();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...NAVY);
  doc.text("MAVIS STRATEGIC PARTNERS", 14, 17);
  doc.setFontSize(12);
  doc.setTextColor(...ACCENT);
  doc.text(title.toUpperCase(), 14, 24);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(`Reporting period: ${period.label}`, 14, 30);
  doc.text(
    `Generated ${now.toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })} at ${now.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })} SAST${generatedBy ? ` by ${generatedBy}` : ""}`,
    14,
    35,
  );
  doc.text("All amounts in South African Rand (ZAR). Agency fees only; client ad spend is paid to the platforms directly.", 14, 40);
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 43, doc.internal.pageSize.getWidth() - 14, 43);
  return 49;
}

function footer(doc: jsPDF) {
  const pages = doc.getNumberOfPages();
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text("MSP Finance & Administration — confidential", 14, h - 8);
    doc.text(`Page ${i} of ${pages}`, w - 14, h - 8, { align: "right" });
  }
}

function heading(doc: jsPDF, y: number, text: string) {
  if (y > doc.internal.pageSize.getHeight() - 40) {
    doc.addPage();
    y = 18;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  doc.text(text, 14, y);
  return y + 3;
}

function table(doc: jsPDF, y: number, head: string[], body: (string | number)[][], foot?: (string | number)[], money: number[] = []) {
  autoTable(doc, {
    startY: y,
    head: [head],
    body: body.length ? body : [[{ content: "No records in this period.", colSpan: head.length, styles: { halign: "center", textColor: MUTED } } as any]],
    foot: foot && body.length ? [foot] : undefined,
    theme: "striped",
    margin: { left: 14, right: 14, bottom: 16 },
    styles: { font: "helvetica", fontSize: 8, cellPadding: 1.8, overflow: "linebreak" },
    headStyles: { fillColor: NAVY, textColor: 255, fontStyle: "bold" },
    footStyles: { fillColor: [241, 245, 249], textColor: NAVY, fontStyle: "bold" },
    columnStyles: Object.fromEntries(money.map((i) => [i, { halign: "right" }])),
    showHead: "everyPage",
    showFoot: "lastPage",
  });
  return ((doc as any).lastAutoTable?.finalY ?? y) + 8;
}

function summary(doc: jsPDF, y: number, items: [string, string][]) {
  const w = doc.internal.pageSize.getWidth() - 28;
  const cols = Math.min(items.length, 3);
  const rows = Math.ceil(items.length / cols);
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, w, rows * 13 + 3, 2, 2, "FD");
  items.forEach(([label, value], i) => {
    const x = 18 + (i % cols) * (w / cols);
    const yy = y + 6 + Math.floor(i / cols) * 13;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text(label.toUpperCase(), x, yy);
    doc.setFontSize(11);
    doc.setTextColor(...NAVY);
    doc.text(value, x, yy + 6);
  });
  return y + rows * 13 + 10;
}

const invoiceRows = (xs: FinInvoice[]) =>
  xs.map((i) => [i.invoiceNumber, i.client, i.package || "—", i.dueDate, i.paymentStatus, i.verifiedAt ? `${i.verifiedAt}${i.verifiedBy ? ` (${i.verifiedBy})` : ""}` : "—", randText(i.monthlyServiceFeeZar)]);
const expenseRows = (xs: FinExpense[]) => xs.map((e) => [e.date, e.vendor, e.category, e.status, e.approvedBy || "—", randText(e.amountZar)]);
const approvalRows = (xs: FinApproval[]) => xs.map((a) => [a.date, a.title, a.department, a.requestedBy, a.category, a.status, randText(a.amountZar)]);
const budgetRows = (xs: FinBudget[]) =>
  xs.map((b) => [b.dept, randText(b.budget), randText(b.actual), randText(b.budget - b.actual), b.budget ? `${Math.round((b.actual / b.budget) * 100)}%` : "—"]);

function addInvoices(doc: jsPDF, y: number, xs: FinInvoice[]) {
  y = heading(doc, y, `Invoices & payment verification (${xs.length})`);
  return table(doc, y, ["Invoice #", "Client", "Package", "Due", "Status", "Verified", "Agency fee"], invoiceRows(xs), ["Total", "", "", "", "", "", randText(sum(xs.map((i) => i.monthlyServiceFeeZar)))], [6]);
}
function addExpenses(doc: jsPDF, y: number, xs: FinExpense[]) {
  y = heading(doc, y, `Operating expenses (${xs.length})`);
  return table(doc, y, ["Date", "Vendor / payee", "Category", "Status", "Recorded by", "Amount"], expenseRows(xs), ["Total", "", "", "", "", randText(sum(xs.map((e) => e.amountZar)))], [5]);
}
function addApprovals(doc: jsPDF, y: number, xs: FinApproval[]) {
  y = heading(doc, y, `Financial approval requests (${xs.length})`);
  return table(doc, y, ["Date", "Request", "Department", "Requested by", "Category", "Status", "Amount"], approvalRows(xs), ["Total", "", "", "", "", "", randText(sum(xs.map((a) => a.amountZar)))], [6]);
}
function addBudgets(doc: jsPDF, y: number, xs: FinBudget[]) {
  y = heading(doc, y, `Budgets vs actual (${xs.length})`);
  const b = sum(xs.map((x) => x.budget));
  const a = sum(xs.map((x) => x.actual));
  return table(doc, y, ["Department", "Budget", "Actual", "Remaining", "Used"], budgetRows(xs), ["Total", randText(b), randText(a), randText(b - a), b ? `${Math.round((a / b) * 100)}%` : "—"], [1, 2, 3, 4]);
}

function save(doc: jsPDF, name: string) {
  footer(doc);
  doc.save(`${name}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

/** Complete Finance & Administration report for a period. */
export function exportFinanceReportPdf(all: FinanceData, period: Period, generatedBy?: string) {
  const d = inPeriod(all, period);
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  let y = header(doc, "Finance & Administration Report", period, generatedBy);
  const invoiced = sum(d.invoices.map((i) => i.monthlyServiceFeeZar));
  const verified = sum(d.invoices.filter((i) => i.paymentStatus === "Paid & Verified").map((i) => i.monthlyServiceFeeZar));
  const awaiting = sum(d.invoices.filter((i) => i.paymentStatus === "Awaiting Payment").map((i) => i.monthlyServiceFeeZar));
  const overdue = sum(d.invoices.filter((i) => i.paymentStatus === "Overdue").map((i) => i.monthlyServiceFeeZar));
  const spent = sum(d.expenses.map((e) => e.amountZar));
  y = summary(doc, y, [
    ["Invoiced agency fees", randText(invoiced)],
    ["Verified cash collected", randText(verified)],
    ["Collection rate", invoiced ? `${Math.round((verified / invoiced) * 100)}%` : "—"],
    ["Awaiting payment", randText(awaiting)],
    ["Overdue receivables", randText(overdue)],
    ["Operating expenses", randText(spent)],
    ["Net operating cash flow", randText(verified - spent)],
    ["Pending approvals", String(d.approvals.filter((a) => a.status === "Pending").length)],
  ]);
  y = addInvoices(doc, y, d.invoices);
  y = addExpenses(doc, y, d.expenses);
  y = addApprovals(doc, y, d.approvals);
  addBudgets(doc, y, d.budgets);
  save(doc, `MSP_Finance_Report_${slug(period.label)}`);
}

/** One section (the list as shown, e.g. filtered invoices). */
export function exportSectionPdf(kind: "invoices" | "expenses" | "approvals" | "budgets" | "audit", all: FinanceData, period: Period, generatedBy?: string) {
  const d = inPeriod(all, period);
  const titles = { invoices: "Invoices & Payment Verification", expenses: "Operating Expenses", approvals: "Financial Approval Requests", budgets: "Budgets vs Actual", audit: "Financial Audit Trail" };
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const y = header(doc, titles[kind], period, generatedBy);
  if (kind === "invoices") addInvoices(doc, y, d.invoices);
  else if (kind === "expenses") addExpenses(doc, y, d.expenses);
  else if (kind === "approvals") addApprovals(doc, y, d.approvals);
  else if (kind === "budgets") addBudgets(doc, y, d.budgets);
  else table(doc, heading(doc, y, `Audit entries (${d.audit.length})`), ["Time (SAST)", "Action", "Detail", "By"], d.audit.map((a) => [a.time, a.action, a.detail, a.actor]));
  save(doc, `MSP_${slug(titles[kind])}_${slug(period.label)}`);
}

/** A single record as a one-page document. */
export function exportRecordPdf(kind: "invoices" | "expenses" | "approvals" | "budgets", rec: any, generatedBy?: string) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const titles = { invoices: `Invoice ${rec.invoiceNumber}`, expenses: "Expense record", approvals: "Financial approval request", budgets: `Budget — ${rec.dept}` };
  let y = header(doc, titles[kind], { label: kind === "invoices" ? `Due ${rec.dueDate}` : kind === "budgets" ? "Current budget" : rec.date }, generatedBy);
  const rows: [string, string][] =
    kind === "invoices"
      ? [["Invoice number", rec.invoiceNumber], ["Client", rec.client], ["Service package", rec.package || "—"], ["Due date", rec.dueDate], ["Payment status", rec.paymentStatus], ["Verified", rec.verifiedAt ? `${rec.verifiedAt}${rec.verifiedBy ? ` by ${rec.verifiedBy}` : ""}` : "Not yet verified"], ["Monthly agency fee", randText(rec.monthlyServiceFeeZar)]]
      : kind === "expenses"
        ? [["Vendor / payee", rec.vendor], ["Category", rec.category], ["Date", rec.date], ["Status", rec.status], ["Recorded by", rec.approvedBy || "—"], ["Amount", randText(rec.amountZar)]]
        : kind === "approvals"
          ? [["Request", rec.title], ["Department", rec.department], ["Requested by", rec.requestedBy], ["Category", rec.category], ["Date", rec.date], ["Status", rec.status], ["Notes", rec.notes || "—"], ["Amount", randText(rec.amountZar)]]
          : [["Department", rec.dept], ["Budget", randText(rec.budget)], ["Actual spend", randText(rec.actual)], ["Remaining", randText(rec.budget - rec.actual)], ["Used", rec.budget ? `${Math.round((rec.actual / rec.budget) * 100)}%` : "—"]];
  autoTable(doc, {
    startY: y,
    body: rows,
    theme: "grid",
    margin: { left: 14, right: 14, bottom: 16 },
    styles: { font: "helvetica", fontSize: 10, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 55, textColor: NAVY, fillColor: [248, 250, 252] }, 1: { cellWidth: "auto" } },
  });
  y = ((doc as any).lastAutoTable?.finalY ?? y) + 8;
  save(doc, `MSP_${slug(titles[kind])}`);
}
