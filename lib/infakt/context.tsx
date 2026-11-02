"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { InfaktEnvironment } from "./types";

interface InfaktContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
  environment: InfaktEnvironment;
  setEnvironment: (env: InfaktEnvironment) => void;
  status: "idle" | "checking" | "connected" | "error" | "unconfigured";
  statusMessage: string;
  isEnvConfigured: boolean;
  refreshStatus: () => Promise<void>;
  authHeaders: Record<string, string>;
}

const InfaktContext = createContext<InfaktContextType | undefined>(undefined);

export function InfaktProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKeyState] = useState<string>("");
  const [environment, setEnvState] = useState<InfaktEnvironment>("sandbox");
  const [status, setStatus] = useState<"idle" | "checking" | "connected" | "error" | "unconfigured">("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [isEnvConfigured, setIsEnvConfigured] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<boolean>(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem("infakt_api_key") || "";
    const savedEnv = (localStorage.getItem("infakt_environment") as InfaktEnvironment) || "sandbox";
    setApiKeyState(savedKey);
    setEnvState(savedEnv);
    setInitialized(true);
  }, []);

  const setApiKey = (key: string) => {
    setApiKeyState(key);
    if (key) {
      localStorage.setItem("infakt_api_key", key);
    } else {
      localStorage.removeItem("infakt_api_key");
    }
  };

  const setEnvironment = (env: InfaktEnvironment) => {
    setEnvState(env);
    localStorage.setItem("infakt_environment", env);
  };

  const authHeaders: Record<string, string> = {
    "x-infakt-environment": environment,
    ...(apiKey ? { "x-infakt-api-key": apiKey } : {}),
  };

  const refreshStatus = async () => {
    setStatus("checking");
    setStatusMessage("Sprawdzanie połączenia z inFakt...");

    try {
      const res = await fetch("/api/infakt/status", {
        headers: authHeaders,
      });
      const data = await res.json();

      setIsEnvConfigured(Boolean(data.isEnvConfigured));

      if (data.success) {
        setStatus("connected");
        setStatusMessage(data.message || "Połączono pomyślnie z inFakt API!");
      } else {
        if (!apiKey && !data.isEnvConfigured) {
          setStatus("unconfigured");
          setStatusMessage("Brak klucza API. Wprowadź klucz z konta testowego Sandbox.");
        } else {
          setStatus("error");
          setStatusMessage(data.message || "Błąd uwierzytelniania w inFakt API.");
        }
      }
    } catch (err: any) {
      setStatus("error");
      setStatusMessage(`Błąd sieci: ${err.message}`);
    }
  };

  useEffect(() => {
    if (initialized) {
      refreshStatus();
    }
  }, [initialized, apiKey, environment]);

  return (
    <InfaktContext.Provider
      value={{
        apiKey,
        setApiKey,
        environment,
        setEnvironment,
        status,
        statusMessage,
        isEnvConfigured,
        refreshStatus,
        authHeaders,
      }}
    >
      {children}
    </InfaktContext.Provider>
  );
}

export function useInfakt() {
  const context = useContext(InfaktContext);
  if (!context) {
    throw new Error("useInfakt must be used within an InfaktProvider");
  }
  return context;
}
