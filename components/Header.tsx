"use client";

import React, { useState } from "react";
import { useInfakt } from "@/lib/infakt/context";
import {
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { ApiKeyModal } from "./ApiKeyModal";

export function Header() {
  const { apiKey, environment, status, refreshStatus } = useInfakt();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isDemo = apiKey.toLowerCase().includes("demo");

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshStatus();
    setIsRefreshing(false);
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo i Nazwa */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-blue-500/20">
                iF
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                    inFakt Connect
                  </h1>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isDemo
                        ? "bg-purple-100 text-purple-800 border border-purple-300"
                        : environment === "sandbox"
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    }`}
                  >
                    {isDemo
                      ? "Symulator Demo"
                      : environment === "sandbox"
                      ? "Sandbox"
                      : "Produkcja"}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Panel integracji API v3 z inFakt
                </p>
              </div>
            </div>

            {/* Status i akcje */}
            <div className="flex items-center gap-3">
              {/* Status połączenia */}
              <div
                onClick={() => setIsModalOpen(true)}
                className="cursor-pointer transition-colors"
                title="Kliknij, aby zmienić konfigurację klucza API"
              >
                {status === "connected" && (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isDemo ? "Symulator Aktywny" : "API Połączone"}</span>
                  </div>
                )}
                {status === "checking" && (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    <span>Sprawdzanie...</span>
                  </div>
                )}
                {status === "unconfigured" && (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 hover:bg-amber-100">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Brak klucza API</span>
                  </div>
                )}
                {status === "error" && (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-100">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Błąd połączenia</span>
                  </div>
                )}
              </div>

              {/* Przycisk odświeżenia */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                title="Odśwież stan połączenia"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />
              </button>

              {/* Przycisk konfiguracji klucza */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 rounded-lg border border-slate-300 transition-colors"
              >
                <KeyRound className="w-4 h-4 text-slate-600" />
                <span className="hidden sm:inline">Konfiguracja API</span>
              </button>

              {/* Link do Sandbox inFakt */}
              <a
                href="https://konto.sandbox-infakt.pl/rejestracja"
                target="_blank"
                rel="noreferrer"
                className="hidden md:flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Konto inFakt Sandbox</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            </div>
          </div>
        </div>
      </header>

      <ApiKeyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
