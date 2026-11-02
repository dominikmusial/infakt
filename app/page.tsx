"use client";

import React, { useState, useEffect } from "react";
import { InfaktProvider, useInfakt } from "@/lib/infakt/context";
import { Header } from "@/components/Header";
import { InvoicesList } from "@/components/InvoicesList";
import { ClientsList } from "@/components/ClientsList";
import { ApiDiagnostics } from "@/components/ApiDiagnostics";
import { SandboxGuide } from "@/components/SandboxGuide";
import { Client } from "@/lib/infakt/types";
import {
  FileText,
  Users,
  Terminal,
  BookOpen,
  AlertCircle,
  KeyRound,
  ArrowRight,
} from "lucide-react";
import { ApiKeyModal } from "@/components/ApiKeyModal";

function DashboardContent() {
  const { status, statusMessage, authHeaders } = useInfakt();
  const [activeTab, setActiveTab] = useState<"invoices" | "clients" | "diagnostics" | "guide">("invoices");
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  const fetchClients = async () => {
    if (status !== "connected") return;
    setClientsLoading(true);
    try {
      const res = await fetch("/api/infakt/clients?limit=100", {
        headers: authHeaders,
      });
      const data = await res.json();
      if (res.ok) {
        setClients(data.entities || []);
      }
    } catch {
      // ignore
    } finally {
      setClientsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "connected") {
      fetchClients();
    }
  }, [status]);

  return (
    <div className="flex-1 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner ostrzegawczy jeśli brak klucza lub błąd */}
        {status === "unconfigured" && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-xl text-amber-700 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-amber-900">
                  Wymagana konfiguracja klucza API inFakt
                </h3>
                <p className="text-xs text-amber-700 mt-0.5">
                  Aby przeglądać i wystawiać faktury testowe w Sandboxie, dodaj klucz API.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => setActiveTab("guide")}
                className="text-xs font-medium text-amber-800 hover:text-amber-950 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors"
              >
                Instrukcja Sandbox
              </button>
              <button
                onClick={() => setIsKeyModalOpen(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 px-3.5 py-1.5 rounded-lg shadow-sm transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Wprowadź klucz API</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-100 rounded-xl text-rose-700">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-rose-900">
                  Błąd autoryzacji inFakt API
                </h3>
                <p className="text-xs text-rose-700 mt-0.5">{statusMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setIsKeyModalOpen(true)}
              className="text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 px-3.5 py-1.5 rounded-lg shadow-sm transition-colors"
            >
              Zmień klucz
            </button>
          </div>
        )}

        {/* Zakładki nawigacyjne */}
        <div className="flex border-b border-slate-200 gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab("invoices")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === "invoices"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Faktury</span>
          </button>

          <button
            onClick={() => setActiveTab("clients")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === "clients"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Kontrahenci</span>
            {clients.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {clients.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("diagnostics")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === "diagnostics"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Diagnostyka API</span>
          </button>

          <button
            onClick={() => setActiveTab("guide")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === "guide"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Przewodnik Sandbox</span>
          </button>
        </div>

        {/* Zawartość zakładek */}
        <div>
          {activeTab === "invoices" && (
            <InvoicesList
              clients={clients}
              onRefreshClients={fetchClients}
            />
          )}

          {activeTab === "clients" && (
            <ClientsList
              clients={clients}
              loading={clientsLoading}
              onRefresh={fetchClients}
            />
          )}

          {activeTab === "diagnostics" && <ApiDiagnostics />}

          {activeTab === "guide" && <SandboxGuide />}
        </div>
      </main>

      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-2">
          <div>
            inFakt REST API v3 Integration &bull; Środowisko testowe Sandbox
          </div>
          <div>
            Dokumentacja API:{" "}
            <a
              href="https://docs.infakt.pl"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline"
            >
              docs.infakt.pl
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <InfaktProvider>
      <DashboardContent />
    </InfaktProvider>
  );
}
