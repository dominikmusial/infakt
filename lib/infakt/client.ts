import {
  InfaktConfig,
  InfaktEnvironment,
  Client,
  Invoice,
  CreateInvoicePayload,
  CreateClientPayload,
  Metainfo,
} from "./types";
import {
  getDemoClients,
  addDemoClient,
  getDemoInvoices,
  addDemoInvoice,
  createDemoInvoicePdf,
} from "./mock-store";

export class InfaktClient {
  private apiKey: string;
  private environment: InfaktEnvironment;
  private baseUrl: string;

  constructor(config?: InfaktConfig) {
    this.apiKey = config?.apiKey || process.env.INFAKT_API_KEY || "";
    this.environment =
      config?.environment ||
      (process.env.INFAKT_ENVIRONMENT as InfaktEnvironment) ||
      "sandbox";

    this.baseUrl =
      this.environment === "production"
        ? "https://api.infakt.pl/api/v3"
        : "https://api.sandbox-infakt.pl/api/v3";
  }

  isDemo(): boolean {
    const key = (this.apiKey || "").trim().toLowerCase();
    return (
      key === "demo" ||
      key === "demo_sandbox_key" ||
      key.includes("demo") ||
      process.env.INFAKT_DEMO_MODE === "true"
    );
  }

  getEnvironment(): InfaktEnvironment {
    return this.environment;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  isKeyConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  private getHeaders(): Record<string, string> {
    if (!this.isKeyConfigured() && !this.isDemo()) {
      throw new Error("Klucz API inFakt nie został skonfigurowany.");
    }
    return {
      "X-inFakt-ApiKey": this.apiKey.trim(),
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  /**
   * Sprawdza poprawność połączenia z API inFakt
   */
  async testConnection(): Promise<{
    success: boolean;
    environment: InfaktEnvironment;
    baseUrl: string;
    message: string;
    isDemo?: boolean;
    details?: any;
  }> {
    if (this.isDemo()) {
      return {
        success: true,
        environment: "sandbox",
        baseUrl: "https://api.sandbox-infakt.pl/api/v3 (Symulator Demo)",
        message: "Aktywny tryb Symulatora Sandbox (bez wymaganego konta inFakt)!",
        isDemo: true,
        details: {
          totalClients: getDemoClients().length,
          totalInvoices: getDemoInvoices().length,
        },
      };
    }

    if (!this.isKeyConfigured()) {
      return {
        success: false,
        environment: this.environment,
        baseUrl: this.baseUrl,
        message: "Brak skonfigurowanego klucza API (INFAKT_API_KEY).",
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/clients.json?limit=1`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        let errBody: any = {};
        try {
          errBody = await response.json();
        } catch {
          // ignore
        }
        const errorMsg =
          errBody.error ||
          errBody.message ||
          `Błąd API inFakt: HTTP ${response.status} ${response.statusText}`;

        return {
          success: false,
          environment: this.environment,
          baseUrl: this.baseUrl,
          message: errorMsg,
          details: errBody,
        };
      }

      const data = await response.json();
      return {
        success: true,
        environment: this.environment,
        baseUrl: this.baseUrl,
        message: "Połączenie z API inFakt nawiązane pomyślnie!",
        details: {
          totalClients: data.metainfo?.total_count ?? 0,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        environment: this.environment,
        baseUrl: this.baseUrl,
        message: `Błąd sieci: ${err.message}`,
      };
    }
  }

  /**
   * Pobiera listę faktur
   */
  async getInvoices(params?: {
    limit?: number;
    offset?: number;
    order?: string;
  }): Promise<{ entities: Invoice[]; metainfo: Metainfo; isDemo?: boolean }> {
    if (this.isDemo()) {
      const all = getDemoInvoices();
      return {
        entities: all,
        metainfo: { count: all.length, total_count: all.length },
        isDemo: true,
      };
    }

    const url = new URL(`${this.baseUrl}/invoices.json`);
    if (params?.limit) url.searchParams.set("limit", String(params.limit));
    if (params?.offset) url.searchParams.set("offset", String(params.offset));
    if (params?.order) url.searchParams.set("order", params.order);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(
        err.error ||
          `Nie udało się pobrać faktur (HTTP ${response.status}): ${JSON.stringify(err)}`
      );
    }

    const data = await response.json();
    return {
      entities: data.entities || [],
      metainfo: data.metainfo || { count: 0, total_count: 0 },
    };
  }

  /**
   * Pobiera pojedynczą fakturę po ID lub UUID
   */
  async getInvoice(idOrUuid: string | number): Promise<Invoice> {
    if (this.isDemo()) {
      const found = getDemoInvoices().find(
        (i) => i.uuid === idOrUuid || String(i.id) === String(idOrUuid)
      );
      if (found) return found;
      return getDemoInvoices()[0];
    }

    const response = await fetch(`${this.baseUrl}/invoices/${idOrUuid}.json`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(
        err.error || `Nie udało się pobrać faktury (HTTP ${response.status})`
      );
    }

    return await response.json();
  }

  /**
   * Tworzy nową fakturę w inFakt
   */
  async createInvoice(payload: CreateInvoicePayload): Promise<Invoice> {
    if (this.isDemo()) {
      return addDemoInvoice(payload);
    }

    const response = await fetch(`${this.baseUrl}/invoices.json`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ invoice: payload }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      let msg = err.error || err.message;
      if (err.errors) {
        msg += " Szczegóły: " + JSON.stringify(err.errors);
      }
      throw new Error(
        msg || `Nie udało się wystawić faktury (HTTP ${response.status})`
      );
    }

    return await response.json();
  }

  /**
   * Pobiera binarną zawartość faktury PDF (oryginał)
   */
  async getInvoicePdf(
    uuid: string,
    documentType: string = "original"
  ): Promise<ArrayBuffer> {
    if (this.isDemo() || uuid.startsWith("demo-")) {
      return createDemoInvoicePdf(uuid);
    }

    const url = `${this.baseUrl}/invoices/${uuid}/pdf.json?document_type=${documentType}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-inFakt-ApiKey": this.apiKey.trim(),
        Accept: "application/pdf, application/json",
      },
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(
        `Nie udało się pobrać PDF faktury (HTTP ${response.status}): ${errText}`
      );
    }

    return await response.arrayBuffer();
  }

  /**
   * Pobiera listę klientów / kontrahentów
   */
  async getClients(params?: {
    limit?: number;
    offset?: number;
  }): Promise<{ entities: Client[]; metainfo: Metainfo; isDemo?: boolean }> {
    if (this.isDemo()) {
      const all = getDemoClients();
      return {
        entities: all,
        metainfo: { count: all.length, total_count: all.length },
        isDemo: true,
      };
    }

    const url = new URL(`${this.baseUrl}/clients.json`);
    if (params?.limit) url.searchParams.set("limit", String(params.limit));
    if (params?.offset) url.searchParams.set("offset", String(params.offset));

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(
        err.error || `Nie udało się pobrać klientów (HTTP ${response.status})`
      );
    }

    const data = await response.json();
    return {
      entities: data.entities || [],
      metainfo: data.metainfo || { count: 0, total_count: 0 },
    };
  }

  /**
   * Tworzy nowego klienta / kontrahenta
   */
  async createClient(payload: CreateClientPayload): Promise<Client> {
    if (this.isDemo()) {
      return addDemoClient(payload);
    }

    const response = await fetch(`${this.baseUrl}/clients.json`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ client: payload }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      let msg = err.error || err.message;
      if (err.errors) {
        msg += " Szczegóły: " + JSON.stringify(err.errors);
      }
      throw new Error(
        msg || `Nie udało się utworzyć klienta (HTTP ${response.status})`
      );
    }

    return await response.json();
  }
}
