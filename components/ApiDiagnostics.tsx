"use client";

import React, { useState } from "react";
import { useInfakt } from "@/lib/infakt/context";
import {
  Activity,
  Terminal,
  Play,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Loader2,
  Shield,
  Server,
} from "lucide-react";

export function ApiDiagnostics() {
  const { apiKey, environment, authHeaders } = useInfakt();
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>("/clients.json?limit=5");
  const [method, setMethod] = useState<"GET" | "POST">("GET");
  const [loading, setLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<any>(null);
  const [responseBody, setResponseBody] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const baseUrl =
    environment === "production"
      ? "https://api.infakt.pl/api/v3"
      : "https://api.sandbox-infakt.pl/api/v3";

  const curlCommand = `curl -X ${method} \\
  -H "X-inFakt-ApiKey: ${apiKey || "TWÓJ_KLUCZ_API"}" \\
  -H "Content-Type: application/json" \\
  ${baseUrl}${selectedEndpoint}`;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunRequest = async () => {
    setLoading(true);
    setResponseStatus(null);
    setResponseHeaders(null);
    setResponseBody(null);

    try {
      const targetUrl =
        selectedEndpoint.startsWith("/invoices")
          ? "/api/infakt/invoices"
          : "/api/infakt/clients";

      const res = await fetch(targetUrl, {
        method: "GET",
        headers: authHeaders,
      });

      setResponseStatus(res.status);
      const headersObj: Record<string, string> = {};
      res.headers.forEach((val, key) => {
        headersObj[key] = val;
      });
      setResponseHeaders(headersObj);

      const json = await res.json();
      setResponseBody(JSON.stringify(json, null, 2));
    } catch (err: any) {
      setResponseBody(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Karta statusu i środowiska */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3.5">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs uppercase font-semibold text-slate-500 tracking-wider">
              Środowisko API
            </div>
            <div className="font-bold text-slate-900 mt-0.5">
              {environment === "sandbox" ? "inFakt Sandbox" : "inFakt Produkcja"}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-mono break-all">
              {baseUrl}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3.5">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs uppercase font-semibold text-slate-500 tracking-wider">
              Autoryzacja
            </div>
            <div className="font-bold text-slate-900 mt-0.5">
              {apiKey ? "Klucz aktywny" : "Brak klucza"}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-mono">
              Nagłówek: X-inFakt-ApiKey
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3.5">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs uppercase font-semibold text-slate-500 tracking-wider">
              Protokół
            </div>
            <div className="font-bold text-slate-900 mt-0.5">REST API v3</div>
            <div className="text-xs text-slate-500 mt-1">
              JSON payload & binary PDF
            </div>
          </div>
        </div>
      </div>

      {/* Interaktywny tester zapytań */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900 text-sm">
              Tester bezpośrednich zapytań API
            </h3>
          </div>

          <button
            onClick={handleCopyCurl}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copied ? "Skopiowano cURL!" : "Kopiuj jako cURL"}</span>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Wybór endpointu */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="w-28 shrink-0">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Metoda
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 font-mono font-bold bg-slate-50"
              >
                <option value="GET">GET</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Endpoint API
              </label>
              <select
                value={selectedEndpoint}
                onChange={(e) => setSelectedEndpoint(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 font-mono bg-white"
              >
                <option value="/clients.json?limit=5">/clients.json (Pobierz listę kontrahentów)</option>
                <option value="/invoices.json?limit=5">/invoices.json (Pobierz listę faktur)</option>
              </select>
            </div>

            <div className="sm:self-end">
              <button
                onClick={handleRunRequest}
                disabled={loading}
                className="w-full sm:w-auto px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 fill-white" />
                )}
                <span>Wykonaj test</span>
              </button>
            </div>
          </div>

          {/* Podgląd wygenerowanego cURL */}
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Komenda cURL:
            </div>
            <pre className="bg-slate-900 text-slate-200 text-xs p-3.5 rounded-xl font-mono overflow-x-auto">
              {curlCommand}
            </pre>
          </div>

          {/* Odpowiedź z API */}
          {responseStatus !== null && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Odpowiedź serwera:
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold ${
                    responseStatus >= 200 && responseStatus < 300
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  HTTP {responseStatus}
                </span>
              </div>

              <pre className="bg-slate-950 text-emerald-400 text-xs p-4 rounded-xl font-mono overflow-x-auto max-h-96">
                {responseBody}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
