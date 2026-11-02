import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Konwertuje grosze (integer z inFakt API) na czytelną kwotę w PLN
 * np. 12345 -> "123,45 zł"
 */
export function formatGroszeToPLN(grosze?: number | null): string {
  if (grosze === undefined || grosze === null || isNaN(grosze)) {
    return "0,00 zł";
  }
  const pln = grosze / 100;
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(pln);
}

/**
 * Konwertuje kwotę w PLN na grosze dla API inFakt
 * np. 123.45 -> 12345
 */
export function plnToGrosze(val: number | string): number {
  const num = typeof val === "string" ? parseFloat(val.replace(",", ".")) : val;
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}

/**
 * Formatuje datę ISO do formatu YYYY-MM-DD
 */
export function formatDate(dateString?: string | null): string {
  if (!dateString) return "-";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return dateString;
  }
}

