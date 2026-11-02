"use client";

import React, { useState, useEffect } from "react";
import { useInfakt } from "@/lib/infakt/context";
import { Invoice, Client } from "@/lib/infakt/types";
import { formatGroszeToPLN, formatDate } from "@/lib/utils";
import {
  FileText,
  Download,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  Building,
  Loader2,
} from "lucide-react";
import { CreateInvoiceModal } from "./CreateInvoiceModal";

interface InvoicesListProps {
  clients: Client[];
  onRefreshClients: () => void;
}

export function InvoicesList({ clients, onRefreshClients }: InvoicesListProps) {
  const { authHeaders, status } = useInfakt();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = async () => {
    if (status !== "connected") return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/infakt/invoices?limit=50", {
        headers: authHeaders,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Błąd pobierania listy faktur");
      }

      setInvoices(data.entities || []);
    } catch (err: any) {
      setError(err.message || "Błąd połączenia");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "connected") {
      fetchInvoices();
    }
  }, [status]);

  const handleDownloadPdf = async (invoice: Invoice) => {
    const idToUse = invoice.uuid || invoice.id;
    if (!idToUse) return;

    setDownloadingId(String(idToUse));

    try {
      const res = await fetch(`/api/infakt/invoices/${idToUse}/pdf`, {
        headers: authHeaders,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Nie udało się pobrać pliku PDF.");
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `Faktura_${invoice.number ? invoice.number.replace(/\//g, "-") : idToUse}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(`Błąd pobierania PDF: ${err.message}`);
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const q = searchQuery.toLowerCase();
    const num = (inv.number || "").toLowerCase();
    const client = (inv.client_company_name || "").toLowerCase();
    const nip = (inv.client_tax_code || "").toLowerCase();
    return num.includes(q) || client.includes(q) || nip.includes(q);
  });

  const getStatusBadge = (invoiceStatus?: string) => {
    switch (invoiceStatus) {
      case "paid":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> Opłacona
          </span>
        );
      case "sent":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3" /> Wysłana
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            Szkic
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {invoiceStatus || "Nowa"}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Pasek akcji i wyszukiwarka */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Szukaj po numerze, kontrahencie, NIP..."
            className="w-full pl-9 pr-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchInvoices}
            disabled={loading || status !== "connected"}
            className="p-2 text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            title="Odśwież listę faktur"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            disabled={status !== "connected"}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Wystaw fakturę</span>
          </button>
        </div>
      </div>

      {/* Komunikat o błędzie */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-800 flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabela faktur */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading && invoices.length === 0 ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-sm font-medium">Ładowanie listy faktur z inFakt...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
              <FileText className="w-6 h-6" />
            </div>
            <div className="max-w-sm">
              <h3 className="font-semibold text-slate-800 text-base mb-1">
                Brak faktur do wyświetlenia
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                {status !== "connected"
                  ? "Skonfiguruj poprawny klucz API inFakt, aby pobrać faktury."
                  : searchQuery
                  ? "Żadna faktura nie spełnia kryteriów wyszukiwania."
                  : "Nie wystawiono jeszcze żadnych faktur na tym koncie Sandbox. Kliknij poniżej, aby wystawić pierwszą fakturę testową!"}
              </p>
              {status === "connected" && !searchQuery && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Wystaw pierwszą fakturę
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Dokument</th>
                  <th className="px-5 py-3.5">Nabywca</th>
                  <th className="px-5 py-3.5">Data wystawienia</th>
                  <th className="px-5 py-3.5">Termin płatności</th>
                  <th className="px-5 py-3.5 text-right">Kwota brutto</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => {
                  const idStr = String(inv.uuid || inv.id);
                  const isDownloading = downloadingId === idStr;

                  return (
                    <tr
                      key={idStr}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Numer i ID */}
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <FileCheck className="w-4 h-4 text-blue-600" />
                          <span>{inv.number || `ID #${inv.id}`}</span>
                        </div>
                        <span className="text-xs text-slate-400 font-mono">
                          UUID: {inv.uuid ? inv.uuid.slice(0, 8) + "..." : inv.id}
                        </span>
                      </td>

                      {/* Kontrahent */}
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-slate-800">
                          {inv.client_company_name || "-"}
                        </div>
                        {inv.client_tax_code && (
                          <div className="text-xs text-slate-500 font-mono">
                            NIP: {inv.client_tax_code}
                          </div>
                        )}
                      </td>

                      {/* Data wystawienia */}
                      <td className="px-5 py-3.5 text-slate-600 text-xs">
                        {formatDate(inv.invoice_date)}
                      </td>

                      {/* Termin płatności */}
                      <td className="px-5 py-3.5 text-slate-600 text-xs">
                        {formatDate(inv.payment_date)}
                      </td>

                      {/* Kwota brutto */}
                      <td className="px-5 py-3.5 text-right font-semibold font-mono text-slate-900">
                        {formatGroszeToPLN(inv.gross_price)}
                        <div className="text-[11px] text-slate-400 font-normal">
                          netto: {formatGroszeToPLN(inv.net_price)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5 text-center">
                        {getStatusBadge(inv.status)}
                      </td>

                      {/* Akcje: Pobierz PDF */}
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleDownloadPdf(inv)}
                          disabled={isDownloading}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors disabled:opacity-50"
                          title="Pobierz oryginał PDF z inFaktu"
                        >
                          {isDownloading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                          <span>{isDownloading ? "Pobieranie..." : "PDF"}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateInvoiceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          fetchInvoices();
          onRefreshClients();
        }}
        clients={clients}
      />
    </div>
  );
}

