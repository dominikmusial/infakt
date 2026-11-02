"use client";

import React from "react";
import {
  ExternalLink,
  Shield,
  Key,
  FileCheck,
  Terminal,
  CheckCircle,
  HelpCircle,
  Sparkles,
} from "lucide-react";

export function SandboxGuide() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Banner wstępny */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/10">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <Sparkles className="w-6 h-6 text-blue-200" />
          </div>
          <div>
            <h2 className="text-xl font-bold">
              Środowisko testowe inFakt API Sandbox
            </h2>
            <p className="text-blue-100 text-sm mt-1 leading-relaxed">
              Sandbox to w pełni funkcjonalna, bezpieczna piaskownica inFaktu.
              Możesz w niej wystawiać faktury, dodawać kontrahentów i pobierać pliki PDF
              bez ryzyka wysłania czegokolwiek do urzędu skarbowego lub prawdziwych klientów.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Kroki uruchomienia */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Krok 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
              1
            </span>
            <h3 className="font-semibold text-slate-900 text-sm">
              Zarejestruj konto w Sandboxie
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed pl-10 mb-3">
            Konto w inFakt Sandbox jest <strong>oddzielne</strong> od normalnego konta produkcyjnego inFakt.
          </p>
          <div className="pl-10">
            <a
              href="https://konto.sandbox-infakt.pl/rejestracja"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              <span>konto.sandbox-infakt.pl/rejestracja</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Krok 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
              2
            </span>
            <h3 className="font-semibold text-slate-900 text-sm">
              Wygeneruj testowy klucz API
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed pl-10">
            Po zalogowaniu w panelu testowym przejdź do:
            <br />
            <strong>Ustawienia &rarr; Inne &rarr; API</strong>, a następnie kliknij <strong>Wygeneruj klucz API</strong>.
          </p>
        </div>

        {/* Krok 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
              3
            </span>
            <h3 className="font-semibold text-slate-900 text-sm">
              Skonfiguruj klucz w aplikacji
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed pl-10">
            Wklej wygenerowany klucz w aplikacji w oknie <strong>Konfiguracja API</strong> (przycisk w prawym górnym rogu) lub w pliku <code>.env.local</code> jako <code>INFAKT_API_KEY</code>.
          </p>
        </div>

        {/* Krok 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
              4
            </span>
            <h3 className="font-semibold text-slate-900 text-sm">
              Wystawiaj faktury i pobieraj PDF
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed pl-10">
            Przejdź do zakładki <strong>Faktury</strong> i kliknij <em>Wystaw fakturę</em>. Po zapisaniu możesz od razu pobrać wygenerowany oryginał PDF jednym kliknięciem!
          </p>
        </div>
      </div>

      {/* Skrypty Node.js */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">
              Uruchamianie przez czysty Node.js (CLI)
            </h3>
            <p className="text-xs text-slate-500">
              W projekcie przygotowane są również gotowe skrypty Node.js
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="text-xs font-medium text-slate-700 mb-1">
              1. Szybki test połączenia przez terminal:
            </div>
            <pre className="bg-slate-900 text-emerald-400 p-3 rounded-lg text-xs font-mono">
              npm run test-connection
            </pre>
          </div>

          <div>
            <div className="text-xs font-medium text-slate-700 mb-1">
              2. Utworzenie przykładowej faktury z poziomu skryptu Node:
            </div>
            <pre className="bg-slate-900 text-emerald-400 p-3 rounded-lg text-xs font-mono">
              npm run create-test-invoice
            </pre>
          </div>
        </div>
      </div>

      {/* Różnice i limity */}
      <div className="bg-slate-100/70 p-5 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-blue-600" />
          <span>Ważne informacje o inFakt Sandbox:</span>
        </div>
        <ul className="list-disc list-inside space-y-1 pl-1">
          <li>Limit dokumentów: do 2500 wystawionych dokumentów miesięcznie.</li>
          <li>Adres bazowy API Sandbox: <code>https://api.sandbox-infakt.pl/api/v3</code></li>
          <li>Adres bazowy API Produkcja: <code>https://api.infakt.pl/api/v3</code></li>
          <li>Kwoty w API przekazywane są jako liczby całkowite w groszach (np. 100 zł = 10000). Aplikacja automatycznie dba o tę konwersję!</li>
        </ul>
      </div>
    </div>
  );
}
