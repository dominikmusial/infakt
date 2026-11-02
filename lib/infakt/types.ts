export type InfaktEnvironment = "sandbox" | "production";

export interface InfaktConfig {
  apiKey?: string;
  environment?: InfaktEnvironment;
}

export interface Metainfo {
  count: number;
  total_count: number;
  next?: string | null;
  previous?: string | null;
}

export interface ApiResponse<T> {
  metainfo?: Metainfo;
  entities?: T[];
  entity?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface Client {
  id?: number;
  company_name: string;
  tax_id?: string;
  street?: string;
  building_number?: string;
  door_number?: string;
  post_code?: string;
  city?: string;
  country_code?: string;
  email?: string;
  phone?: string;
  note?: string;
  created_at?: string;
}

export type PaymentMethod = "transfer" | "cash" | "card" | "barter" | "compensation" | "payu" | "blik";

export type InvoiceStatus = "draft" | "sent" | "paid" | "partial" | "undelivered" | "printed";

export interface InvoiceService {
  id?: number;
  name: string;
  quantity: number;
  unit?: string;
  unit_net_price: number; // in grosze (100 = 1.00 PLN)
  net_price: number;      // in grosze
  tax_price: number;      // in grosze
  gross_price: number;    // in grosze
  tax_symbol: string | number; // e.g. "23", "8", "5", "0", "zw", "oo"
  flat_rate_tax_symbol?: string;
}

export interface Invoice {
  id?: number;
  uuid?: string;
  number?: string;
  currency?: string;
  status?: InvoiceStatus;
  payment_method?: PaymentMethod;
  invoice_date?: string;
  sale_date?: string;
  payment_date?: string;
  paid_date?: string | null;
  net_price?: number;   // in grosze
  tax_price?: number;   // in grosze
  gross_price?: number; // in grosze
  client_id?: number;
  client_company_name?: string;
  client_tax_code?: string;
  client_street?: string;
  client_building_number?: string;
  client_post_code?: string;
  client_city?: string;
  client_country?: string;
  notes?: string;
  services?: InvoiceService[];
  created_at?: string;
}

export interface CreateInvoicePayload {
  payment_method: PaymentMethod;
  invoice_date: string;
  sale_date: string;
  payment_date: string;
  client_company_name: string;
  client_tax_code?: string;
  client_street?: string;
  client_building_number?: string;
  client_post_code?: string;
  client_city?: string;
  client_country?: string;
  notes?: string;
  services: Array<{
    name: string;
    quantity: number;
    unit: string;
    unit_net_price: number; // in grosze
    net_price: number;      // in grosze
    tax_price: number;      // in grosze
    gross_price: number;    // in grosze
    tax_symbol: string | number;
  }>;
}

export interface CreateClientPayload {
  company_name: string;
  tax_id?: string;
  street?: string;
  building_number?: string;
  door_number?: string;
  post_code?: string;
  city?: string;
  country_code?: string;
  email?: string;
  phone?: string;
}
