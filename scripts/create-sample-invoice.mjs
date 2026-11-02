import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Wczytaj plik .env.local jeśli istnieje
const envLocalPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (key && !process.env[key.trim()]) {
      process.env[key.trim()] = rest.join("=").trim();
    }
  }
}

const apiKey = process.env.INFAKT_API_KEY;
const environment = process.env.INFAKT_ENVIRONMENT || "sandbox";
const baseUrl =
  environment === "production"
    ? "https://api.infakt.pl/api/v3"
    : "https://api.sandbox-infakt.pl/api/v3";

if (!apiKey || apiKey.trim().length === 0) {
  console.log("\n❌ BŁĄD: Brak klucza API!");
  console.log("Ustaw zmienną INFAKT_API_KEY w pliku .env.local lub przekaż w terminalu:");
  console.log("INFAKT_API_KEY=twoj_klucz npm run create-test-invoice\n");
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const due = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);

// Kwoty w groszach (100 = 1.00 PLN)
const unitNetPrice = 150000; // 1500.00 PLN
const netPrice = 150000;
const taxPrice = 34500;      // 23% VAT = 345.00 PLN
const grossPrice = 184500;   // 1845.00 PLN

const payload = {
  invoice: {
    payment_method: "transfer",
    invoice_date: today,
    sale_date: today,
    payment_date: due,
    client_company_name: "Testowy Klient Sandbox Sp. z o.o.",
    client_tax_code: "5252445767",
    client_street: "Przykładowa",
    client_building_number: "10",
    client_post_code: "00-001",
    client_city: "Warszawa",
    client_country: "PL",
    notes: "Faktura wygenerowana automatycznie przez skrypt Node.js",
    services: [
      {
        name: "Usługa programistyczna i integracja API",
        quantity: 1,
        unit: "usł.",
        unit_net_price: unitNetPrice,
        net_price: netPrice,
        tax_price: taxPrice,
        gross_price: grossPrice,
        tax_symbol: "23",
      },
    ],
  },
};

console.log("\n=========================================");
console.log("   Wystawianie faktury testowej inFakt   ");
console.log("=========================================\n");
console.log(`Środowisko: ${environment.toUpperCase()} (${baseUrl})`);
console.log(`Nabywca:    ${payload.invoice.client_company_name}`);
console.log(`Kwota:      1 845,00 PLN brutto (1 500,00 PLN netto + 23% VAT)\n`);
console.log("Wysyłanie zapytania POST do inFaktu...");

try {
  const response = await fetch(`${baseUrl}/invoices.json`, {
    method: "POST",
    headers: {
      "X-inFakt-ApiKey": apiKey.trim(),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    console.log(`\n❌ Błąd wystawiania faktury (HTTP ${response.status}):`);
    console.log(JSON.stringify(err, null, 2));
    process.exit(1);
  }

  const invoice = await response.json();
  console.log("\n✅ Faktura została pomyślnie wystawiona!");
  console.log(`Numer dokumentu: ${invoice.number || "nadany w inFakt"}`);
  console.log(`ID faktury:      ${invoice.id}`);
  console.log(`UUID faktury:    ${invoice.uuid}`);
  console.log(`Status:          ${invoice.status}`);
  console.log(`Data wystawienia:${invoice.invoice_date}`);
  console.log("\nMożesz teraz przejść do panelu Sandbox lub aplikacji webowej i pobrać PDF.");
} catch (error) {
  console.log(`\n❌ Błąd sieciowy: ${error.message}`);
  process.exit(1);
}

