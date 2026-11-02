"use client";

import React, { useState, useEffect } from "react";
import { useInfakt } from "@/lib/infakt/context";
import { InfaktEnvironment } from "@/lib/infakt/types";
import {
  X,
  Key,
  Shield,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Loader2,
  HelpCircle,
  Sparkles,
} from "lucide-react";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const {
    apiKey,
    setApiKey,
    environment,
    setEnvironment,
    refreshStatus,
    isEnvConfigured,
  } = useInfakt();

  const [inputKey, setInputKey] = useState(apiKey);
  const [selectedEnv, setSelectedEnv] = useState<InfaktEnvironment>(environment);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setInputKey(apiKey || "DEMO_SANDBOX_KEY");
      setSelectedEnv(environment);
      setTestResult(null);
    }
  }, [isOpen, apiKey, environment]);

  if (!isOpen) return null;

  const handleApplyDemo = () => {
    setInputKey("DEMO_SANDBOX_KEY");
    setSelectedEnv("sandbox");
    setApiKey("DEMO_SANDBOX_KEY");
    setEnvironment("sandbox");
    setTestResult({
      success: true,
      message: "Aktywowano symulator Sandbox (Tryb Demo). Wszystkie funkcje działają od ręki!",
    });
    setTimeout(() => {
      refreshStatus();
      onClose();
    }, 1000);
  };

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    try {
      const headers: Record<string, string> = {
        "x-infakt-environment": selectedEnv,
      };
      if (inputKey.trim()) {
        headers["x-infakt-api-key"] = inputKey.trim();
      }

      const res = await fetch("/api/infakt/status", { headers });
      const data = await res.json();

      if (data.success) {
        setTestResult({
          success: true,
          message: data.message || "Klucz poprawny! Połączono z API.",
        });
        setApiKey(inputKey.trim());
        setEnvironment(selectedEnv);
        setTimeout(() => {
          refreshStatus();
          onClose();
        }, 1200);
      } else {
        setTestResult({
          success: false,
          message: data.message || "Błąd weryfikacji klucza. Sprawdź poprawność klucza i środowisko.",
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Błąd sieci: ${err.message}`,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleClear = () => {
    setInputKey("");
    setApiKey("");
    setTestResult(null);
    refreshStatus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Konfiguracja API inFakt
              </h2>
              <p className="text-xs text-slate-500">
                Podaj klucz API lub skorzystaj z symulatora Sandbox
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleTestAndSave} className="p-6 space-y-5">
          {/* Szybki przycisk trybu Demo bez konta */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-blue-600 text-white rounded-lg">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-blue-900">
                  Nie masz jeszcze konta inFakt?
                </div>
                <div className="text-[11px] text-blue-700">
                  Uruchom pełny symulator Sandbox jednym kliknięciem
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleApplyDemo}
              className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg shadow-sm transition-colors shrink-0"
            >
              Włącz Demo
            </button>
          </div>

          {/* Wybór środowiska */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Wybierz środowisko:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex flex-col p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedEnv === "sandbox"
                    ? "border-blue-600 bg-blue-50/50 shadow-sm"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-slate-800">
                    Sandbox (Testowe)
                  </span>
                  <input
                    type="radio"
                    name="env"
                    value="sandbox"
                    checked={selectedEnv === "sandbox"}
                    onChange={() => setSelectedEnv("sandbox")}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <span className="text-xs text-slate-500">
                  api.sandbox-infakt.pl
                </span>
                <span className="text-[11px] text-amber-700 mt-1 font-medium">
                  Bezpieczne testy bez US
                </span>
              </label>

              <label
                className={`flex flex-col p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedEnv === "production"
                    ? "border-emerald-600 bg-emerald-50/50 shadow-sm"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-slate-800">
                    Produkcja
                  </span>
                  <input
                    type="radio"
                    name="env"
                    value="production"
                    checked={selectedEnv === "production"}
                    onChange={() => setSelectedEnv("production")}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                </div>
                <span className="text-xs text-slate-500">api.infakt.pl</span>
                <span className="text-[11px] text-emerald-700 mt-1 font-medium">
                  Rzeczywiste księgowanie
                </span>
              </label>
            </div>
          </div>

          {/* Pole klucza API */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label
                htmlFor="apiKeyInput"
                className="text-xs font-semibold uppercase tracking-wider text-slate-600"
              >
                Klucz API (X-inFakt-ApiKey):
              </label>
              {isEnvConfigured && (
                <span className="text-[11px] text-slate-500">
                  (Wykryto w .env.local)
                </span>
              )}
            </div>
            <div className="relative">
              <input
                id="apiKeyInput"
                type="text"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="np. DEMO_SANDBOX_KEY lub klucz z inFaktu"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              Wpisz <code>DEMO_SANDBOX_KEY</code> lub swój unikalny klucz z inFakt Sandbox.
            </p>
          </div>

          {/* Komunikat testu */}
          {testResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                testResult.success
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
            >
              {testResult.success ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Gdzie zdobyć prawdziwy klucz testowy? */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span>Chcesz połączyć się z prawdziwym inFaktem?</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-600">
              <li>
                Zarejestruj darmowe konto na{" "}
                <a
                  href="https://konto.sandbox-infakt.pl/rejestracja"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline hover:text-blue-800 inline-flex items-center gap-0.5"
                >
                  konto.sandbox-infakt.pl
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>Przejdź do: <strong>Ustawienia &rarr; Inne &rarr; API</strong></li>
              <li>Wygeneruj klucz i wklej go tutaj w miejsce klucza demo</li>
            </ol>
          </div>

          {/* Przyciski */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            {apiKey ? (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-rose-600 hover:text-rose-800 hover:underline"
              >
                Wyczyść klucz
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium rounded-lg hover:bg-slate-100 transition-colors"
              >
                Zamknij
              </button>
              <button
                type="submit"
                disabled={testing}
                className="px-5 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {testing && <Loader2 className="w-4 h-4 animate-spin" />}
                {testing ? "Weryfikacja..." : "Zapisz i Przetestuj"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
