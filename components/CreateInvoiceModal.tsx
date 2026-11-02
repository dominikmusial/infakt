"use client";

import React, { useState } from "react";
import { useInfakt } from "@/lib/infakt/context";
import { Client, PaymentMethod } from "@/lib/infakt/types";
import { plnToGrosze, formatGroszeToPLN } from "@/lib/utils";
import {
  X,
  Plus,
  Trash2,
  FileText,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Building2,
} from "lucide-react";

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clients: Client[];
}

interface ServiceItemState {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitNetPln: string; // user input in PLN string
  taxSymbol: string;
}

export function CreateInvoiceModal({
  isOpen,
  onClose,
  onSuccess,
  clients,
}: CreateInvoiceModalProps) {
  const { authHeaders } = useInfakt();

  const todayStr = new Date().toISOString().slice(0, 10);
  const dueStr = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);

  // Form state
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [clientCompanyName, setClientCompanyName] = useState("");
  const [clientTaxCode, setClientTaxCode] = useState("");
  const [clientStreet, setClientStreet] = useState("");
  const [clientBuildingNumber, setClientBuildingNumber] = useState("");
  const [clientPostCode, setClientPostCode] = useState("");
  const [clientCity, setClientCity] = useState("");

  const [invoiceDate, setInvoiceDate] = useState(todayStr);
  const [saleDate, setSaleDate] = useState(todayStr);
  const [paymentDate, setPaymentDate] = useState(dueStr);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("transfer");
  const [notes, setNotes] = useState("");

  const [services, setServices] = useState<ServiceItemState[]>([
    {
      id: "1",
      name: "Usługi programistyczne",
      quantity: 1,
      unit: "godz.",
      unitNetPln: "150.00",
      taxSymbol: "23",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Obsługa wyboru klienta z istniejącej bazy inFaktu
  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    if (!clientId) return;

    const found = clients.find((c) => String(c.id) === clientId);
    if (found) {
      setClientCompanyName(found.company_name || "");
      setClientTaxCode(found.tax_id || "");
      setClientStreet(found.street || "");
      setClientBuildingNumber(found.building_number || "");
      setClientPostCode(found.post_code || "");
      setClientCity(found.city || "");
    }
  };

  const addServiceRow = () => {
    setServices((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        name: "",
        quantity: 1,
        unit: "szt.",
        unitNetPln: "0.00",
        taxSymbol: "23",
      },
    ]);
  };

  const removeServiceRow = (id: string) => {
    if (services.length <= 1) return;
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  const updateService = (id: string, field: keyof ServiceItemState, val: any) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: val } : s))
    );
  };

  // Wyliczenia finansowe
  const calculatedItems = services.map((s) => {
    const qty = Number(s.quantity) || 0;
    const unitNetGrosze = plnToGrosze(s.unitNetPln);
    const totalNetGrosze = Math.round(unitNetGrosze * qty);

    let taxRateNum = 0;
    if (s.taxSymbol === "23") taxRateNum = 0.23;
    else if (s.taxSymbol === "8") taxRateNum = 0.08;
    else if (s.taxSymbol === "5") taxRateNum = 0.05;
    else taxRateNum = 0;

    const taxGrosze = Math.round(totalNetGrosze * taxRateNum);
    const grossGrosze = totalNetGrosze + taxGrosze;

    return {
      ...s,
      unitNetGrosze,
      totalNetGrosze,
      taxGrosze,
      grossGrosze,
    };
  });

  const grandNetGrosze = calculatedItems.reduce((acc, curr) => acc + curr.totalNetGrosze, 0);
  const grandTaxGrosze = calculatedItems.reduce((acc, curr) => acc + curr.taxGrosze, 0);
  const grandGrossGrosze = calculatedItems.reduce((acc, curr) => acc + curr.grossGrosze, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!clientCompanyName.trim()) {
      setErrorMsg("Nazwa kontrahenta jest wymagana.");
      return;
    }

    if (services.some((s) => !s.name.trim())) {
      setErrorMsg("Wszystkie pozycje faktury muszą mieć wpisaną nazwę.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        payment_method: paymentMethod,
        invoice_date: invoiceDate,
        sale_date: saleDate,
        payment_date: paymentDate,
        client_company_name: clientCompanyName.trim(),
        client_tax_code: clientTaxCode.trim() || undefined,
        client_street: clientStreet.trim() || undefined,
        client_building_number: clientBuildingNumber.trim() || undefined,
        client_post_code: clientPostCode.trim() || undefined,
        client_city: clientCity.trim() || undefined,
        client_country: "PL",
        notes: notes.trim() || undefined,
        services: calculatedItems.map((item) => ({
          name: item.name.trim(),
          quantity: item.quantity,
          unit: item.unit,
          unit_net_price: item.unitNetGrosze,
          net_price: item.totalNetGrosze,
          tax_price: item.taxGrosze,
          gross_price: item.grossGrosze,
          tax_symbol: item.taxSymbol,
        })),
      };

      const res = await fetch("/api/infakt/invoices", {
        method: "POST",
        headers: {
          ...authHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Wystąpił błąd podczas wystawiania faktury.");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Błąd połączenia z API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Wystaw nową fakturę VAT
              </h2>
              <p className="text-xs text-slate-500">
                Dokument zostanie natychmiast zarejestrowany w API inFakt
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Sekcja: Dane Kontrahenta */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Nabywca / Kontrahent</span>
              </div>
              {clients.length > 0 && (
                <select
                  value={selectedClientId}
                  onChange={(e) => handleClientSelect(e.target.value)}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- Wybierz z bazy kontrahentów --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.company_name} {c.tax_id ? `(NIP: ${c.tax_id})` : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nazwa firmy / Klienta <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={clientCompanyName}
                  onChange={(e) => setClientCompanyName(e.target.value)}
                  placeholder="np. Testowa Spółka z o.o."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Numer NIP
                </label>
                <input
                  type="text"
                  value={clientTaxCode}
                  onChange={(e) => setClientTaxCode(e.target.value)}
                  placeholder="np. 5252445767"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="col-span-2 sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Ulica
                </label>
                <input
                  type="text"
                  value={clientStreet}
                  onChange={(e) => setClientStreet(e.target.value)}
                  placeholder="np. Szewska"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nr budynku/lokalu
                </label>
                <input
                  type="text"
                  value={clientBuildingNumber}
                  onChange={(e) => setClientBuildingNumber(e.target.value)}
                  placeholder="np. 6 / 2"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Kod pocztowy
                </label>
                <input
                  type="text"
                  value={clientPostCode}
                  onChange={(e) => setClientPostCode(e.target.value)}
                  placeholder="np. 31-009"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Miejscowość
              </label>
              <input
                type="text"
                value={clientCity}
                onChange={(e) => setClientCity(e.target.value)}
                placeholder="np. Kraków"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          {/* Sekcja: Daty i Płatności */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50/80 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Data wystawienia
              </label>
              <input
                type="date"
                required
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Data sprzedaży
              </label>
              <input
                type="date"
                required
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Termin płatności
              </label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Forma płatności
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="transfer">Przelew bankowy</option>
                <option value="cash">Gotówka</option>
                <option value="card">Karta płatnicza</option>
                <option value="blik">BLIK</option>
                <option value="payu">PayU</option>
              </select>
            </div>
          </div>

          {/* Sekcja: Pozycje faktury */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">
                Pozycje na fakturze
              </h3>
              <button
                type="button"
                onClick={addServiceRow}
                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Dodaj pozycję
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100/80 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2.5">Nazwa towaru / usługi</th>
                    <th className="px-2 py-2.5 w-16 text-center">Ilość</th>
                    <th className="px-2 py-2.5 w-20 text-center">Jedn.</th>
                    <th className="px-3 py-2.5 w-28 text-right">Cena netto (PLN)</th>
                    <th className="px-2 py-2.5 w-20 text-center">VAT</th>
                    <th className="px-3 py-2.5 w-28 text-right">Brutto (PLN)</th>
                    <th className="px-2 py-2.5 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {calculatedItems.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="p-2">
                        <input
                          type="text"
                          required
                          value={item.name}
                          onChange={(e) => updateService(item.id, "name", e.target.value)}
                          placeholder="np. Usługi doradcze IT"
                          className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          required
                          value={item.quantity}
                          onChange={(e) => updateService(item.id, "quantity", e.target.value)}
                          className="w-full text-center px-1 py-1.5 rounded border border-slate-300 focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => updateService(item.id, "unit", e.target.value)}
                          className="w-full text-center px-1 py-1.5 rounded border border-slate-300 focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          required
                          value={item.unitNetPln}
                          onChange={(e) => updateService(item.id, "unitNetPln", e.target.value)}
                          placeholder="0.00"
                          className="w-full text-right px-2 py-1.5 rounded border border-slate-300 focus:ring-1 focus:ring-blue-500 font-mono"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={item.taxSymbol}
                          onChange={(e) => updateService(item.id, "taxSymbol", e.target.value)}
                          className="w-full text-center px-1 py-1.5 rounded border border-slate-300 focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="23">23%</option>
                          <option value="8">8%</option>
                          <option value="5">5%</option>
                          <option value="0">0%</option>
                          <option value="zw">zw.</option>
                        </select>
                      </td>
                      <td className="p-2 text-right font-medium text-slate-800 font-mono">
                        {formatGroszeToPLN(item.grossGrosze)}
                      </td>
                      <td className="p-2 text-center">
                        {services.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeServiceRow(item.id)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                            title="Usuń wiersz"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Podsumowanie kwot */}
            <div className="flex justify-end">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 w-72 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Razem netto:</span>
                  <span className="font-mono font-medium">{formatGroszeToPLN(grandNetGrosze)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Razem VAT:</span>
                  <span className="font-mono font-medium">{formatGroszeToPLN(grandTaxGrosze)}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold text-sm pt-1.5 border-t border-slate-200">
                  <span>Do zapłaty:</span>
                  <span className="font-mono text-blue-700">{formatGroszeToPLN(grandGrossGrosze)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Uwagi */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Uwagi na dokumencie (opcjonalnie)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="np. Zapłacono z góry / Zgodnie z umową nr 12/2026"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-1 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Wystawianie..." : "Wystaw fakturę w inFakt"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

