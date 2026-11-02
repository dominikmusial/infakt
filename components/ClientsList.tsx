"use client";

import React, { useState } from "react";
import { useInfakt } from "@/lib/infakt/context";
import { Client } from "@/lib/infakt/types";
import {
  Building,
  Plus,
  RefreshCw,
  Search,
  Mail,
  Phone,
  MapPin,
  Loader2,
} from "lucide-react";
import { CreateClientModal } from "./CreateClientModal";

interface ClientsListProps {
  clients: Client[];
  loading: boolean;
  onRefresh: () => void;
}

export function ClientsList({ clients, loading, onRefresh }: ClientsListProps) {
  const { status } = useInfakt();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredClients = clients.filter((c) => {
    const q = searchQuery.toLowerCase();
    const name = (c.company_name || "").toLowerCase();
    const nip = (c.tax_id || "").toLowerCase();
    const city = (c.city || "").toLowerCase();
    return name.includes(q) || nip.includes(q) || city.includes(q);
  });

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
            placeholder="Szukaj po nazwie firmy, NIP, mieście..."
            className="w-full pl-9 pr-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={loading || status !== "connected"}
            className="p-2 text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            title="Odśwież listę kontrahentów"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            disabled={status !== "connected"}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Dodaj kontrahenta</span>
          </button>
        </div>
      </div>

      {/* Tabela kontrahentów */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading && clients.length === 0 ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-sm font-medium">Ładowanie kontrahentów z inFakt...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
              <Building className="w-6 h-6" />
            </div>
            <div className="max-w-sm">
              <h3 className="font-semibold text-slate-800 text-base mb-1">
                Brak kontrahentów
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                {status !== "connected"
                  ? "Połącz się z API inFakt, aby pobrać listę kontrahentów."
                  : searchQuery
                  ? "Brak wyników pasujących do wyszukiwania."
                  : "Nie masz jeszcze dodanych kontrahentów na tym koncie Sandbox."}
              </p>
              {status === "connected" && !searchQuery && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Dodaj pierwszego kontrahenta
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Firma / Nazwisko</th>
                  <th className="px-5 py-3.5">NIP</th>
                  <th className="px-5 py-3.5">Adres</th>
                  <th className="px-5 py-3.5">Kontakt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClients.map((client) => (
                  <tr
                    key={client.id || client.tax_id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">
                        {client.company_name}
                      </div>
                      <div className="text-xs text-slate-400">
                        ID: #{client.id}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {client.tax_id ? (
                        <span className="font-mono text-slate-700 font-medium">
                          {client.tax_id}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">brak NIP</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {[
                            client.street
                              ? `${client.street} ${client.building_number || ""}`
                              : null,
                            client.post_code && client.city
                              ? `${client.post_code} ${client.city}`
                              : client.city,
                          ]
                            .filter(Boolean)
                            .join(", ") || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600">
                      <div className="space-y-0.5">
                        {client.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{client.email}</span>
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                        {!client.email && !client.phone && (
                          <span className="text-slate-400">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={onRefresh}
      />
    </div>
  );
}

