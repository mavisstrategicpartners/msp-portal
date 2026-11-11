/** Rand amounts for finance records and PDFs: R45 000 or R45 000.50 (plain spaces, PDF-safe). */
export function randText(n: number | string | null | undefined): string {
  const v = Number(n) || 0;
  const [i, d] = Math.abs(v).toFixed(2).split(".");
  return `${v < 0 ? "-" : ""}R${i.replace(/\B(?=(\d{3})+(?!\d))/g, " ")}${d !== "00" ? `.${d}` : ""}`;
}
