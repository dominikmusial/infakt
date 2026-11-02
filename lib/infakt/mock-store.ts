import { Client, Invoice } from "./types";

// In-memory demo store
let demoClients: Client[] = [
  {
    id: 101,
    company_name: "Acme Polska Sp. z o.o.",
    tax_id: "5252445767",
    street: "Marszałkowska",
    building_number: "140",
    door_number: "5",
    post_code: "00-061",
    city: "Warszawa",
    country_code: "PL",
    email: "biuro@acmepolska.pl",
    phone: "+48 22 123 45 67",
  },
  {
    id: 102,
    company_name: "Software Studio Jan Kowalski",
    tax_id: "1234567890",
    street: "Floriańska",
    building_number: "12",
    door_number: "",
    post_code: "31-019",
    city: "Kraków",
    country_code: "PL",
    email: "jan@softwarestudio.pl",
    phone: "+48 600 700 800",
  },
  {
    id: 103,
    company_name: "Tech Solutions S.A.",
    tax_id: "9876543210",
    street: "Piotrkowska",
    building_number: "85",
    door_number: "12",
    post_code: "90-423",
    city: "Łódź",
    country_code: "PL",
    email: "kontakt@techsolutions.pl",
    phone: "+48 42 678 90 12",
  },
];

let demoInvoices: Invoice[] = [
  {
    id: 1001,
    uuid: "demo-uuid-inv-001",
    number: "FV/1/11/2026",
    currency: "PLN",
    status: "paid",
    payment_method: "transfer",
    invoice_date: "2026-11-01",
    sale_date: "2026-11-01",
    payment_date: "2026-11-15",
    net_price: 500000,   // 5 000.00 PLN
    tax_price: 115000,   // 1 150.00 PLN
    gross_price: 615000, // 6 150.00 PLN
    client_id: 101,
    client_company_name: "Acme Polska Sp. z o.o.",
    client_tax_code: "5252445767",
    client_street: "Marszałkowska",
    client_building_number: "140",
    client_post_code: "00-061",
    client_city: "Warszawa",
    client_country: "PL",
    services: [
      {
        id: 1,
        name: "Wdrożenie integracji API inFakt",
        quantity: 1,
        unit: "usł.",
        unit_net_price: 500000,
        net_price: 500000,
        tax_price: 115000,
        gross_price: 615000,
        tax_symbol: "23",
      },
    ],
  },
  {
    id: 1002,
    uuid: "demo-uuid-inv-002",
    number: "FV/2/11/2026",
    currency: "PLN",
    status: "sent",
    payment_method: "transfer",
    invoice_date: "2026-11-02",
    sale_date: "2026-11-02",
    payment_date: "2026-11-16",
    net_price: 200000,   // 2 000.00 PLN
    tax_price: 46000,    // 460.00 PLN
    gross_price: 246000, // 2 460.00 PLN
    client_id: 102,
    client_company_name: "Software Studio Jan Kowalski",
    client_tax_code: "1234567890",
    client_street: "Floriańska",
    client_building_number: "12",
    client_post_code: "31-019",
    client_city: "Kraków",
    client_country: "PL",
    services: [
      {
        id: 2,
        name: "Konsultacje architektoniczne Next.js",
        quantity: 10,
        unit: "godz.",
        unit_net_price: 20000,
        net_price: 200000,
        tax_price: 46000,
        gross_price: 246000,
        tax_symbol: "23",
      },
    ],
  },
];

export function getDemoClients() {
  return [...demoClients];
}

export function addDemoClient(clientData: any): Client {
  const newClient: Client = {
    id: 100 + demoClients.length + 1,
    company_name: clientData.company_name,
    tax_id: clientData.tax_id,
    street: clientData.street,
    building_number: clientData.building_number,
    door_number: clientData.door_number,
    post_code: clientData.post_code,
    city: clientData.city,
    country_code: clientData.country_code || "PL",
    email: clientData.email,
    phone: clientData.phone,
    created_at: new Date().toISOString(),
  };
  demoClients.unshift(newClient);
  return newClient;
}

export function getDemoInvoices() {
  return [...demoInvoices];
}

export function addDemoInvoice(payload: any): Invoice {
  const count = demoInvoices.length + 1;
  const newInvoice: Invoice = {
    id: 1000 + count,
    uuid: `demo-uuid-inv-${String(count).padStart(3, "0")}`,
    number: `FV/${count}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
    currency: "PLN",
    status: "sent",
    payment_method: payload.payment_method || "transfer",
    invoice_date: payload.invoice_date,
    sale_date: payload.sale_date,
    payment_date: payload.payment_date,
    client_company_name: payload.client_company_name,
    client_tax_code: payload.client_tax_code,
    client_street: payload.client_street,
    client_building_number: payload.client_building_number,
    client_post_code: payload.client_post_code,
    client_city: payload.client_city,
    client_country: payload.client_country || "PL",
    notes: payload.notes,
    services: payload.services || [],
    net_price: payload.services.reduce((a: number, s: any) => a + (s.net_price || 0), 0),
    tax_price: payload.services.reduce((a: number, s: any) => a + (s.tax_price || 0), 0),
    gross_price: payload.services.reduce((a: number, s: any) => a + (s.gross_price || 0), 0),
    created_at: new Date().toISOString(),
  };
  demoInvoices.unshift(newInvoice);
  return newInvoice;
}

/**
 * Generuje poprawny binarny plik PDF dla faktury demo
 */
export function createDemoInvoicePdf(uuid: string): ArrayBuffer {
  const invoice = demoInvoices.find((i) => i.uuid === uuid || String(i.id) === uuid) || demoInvoices[0];
  const number = invoice?.number || "FV/DEMO/2026";
  const clientName = invoice?.client_company_name || "Klient Demo";
  const gross = ((invoice?.gross_price || 0) / 100).toFixed(2);
  const net = ((invoice?.net_price || 0) / 100).toFixed(2);
  const vat = ((invoice?.tax_price || 0) / 100).toFixed(2);

  const streamContent = `
BT
/F1 22 Tf
50 780 Td
(FAKTURA VAT - inFakt Sandbox Demo) Tj
ET
BT
/F1 14 Tf
50 740 Td
(Numer dokumentu: ${number}) Tj
ET
BT
/F1 11 Tf
50 700 Td
(Data wystawienia: ${invoice?.invoice_date || "2026-11-02"}) Tj
50 680 Td
(Termin platnosci: ${invoice?.payment_date || "2026-11-16"}) Tj
50 660 Td
(Metoda platnosci: Przelew bankowy) Tj
ET
BT
/F1 12 Tf
50 620 Td
(NABYWCA:) Tj
/F1 11 Tf
50 600 Td
(${clientName}) Tj
50 580 Td
(NIP: ${invoice?.client_tax_code || "brak"}) Tj
50 560 Td
(Adres: ${invoice?.client_street || ""} ${invoice?.client_building_number || ""}, ${invoice?.client_post_code || ""} ${invoice?.client_city || ""}) Tj
ET
BT
/F1 12 Tf
50 500 Td
(PODSUMOWANIE KWOT:) Tj
/F1 11 Tf
50 480 Td
(Razem netto: ${net} PLN) Tj
50 460 Td
(Razem VAT:   ${vat} PLN) Tj
/F1 13 Tf
50 430 Td
(DO ZAPLATY:  ${gross} PLN) Tj
ET
BT
/F1 10 Tf
50 350 Td
(Wygenerowano w trybie testowym inFakt Connect - Sandbox Simulator) Tj
ET
`;

  const streamLen = Buffer.byteLength(streamContent);

  const pdfString = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length ${streamLen} >>
stream${streamContent}endstream
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000244 00000 n 
0000000325 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${400 + streamLen}
%%EOF`;

  const buf = Buffer.from(pdfString, "utf-8");
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}
