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

console.log("\n========================================");
console.log("   inFakt API Connection Test (Node.js) ");
console.log("========================================\n");
console.log(`Środowisko:  ${environment.toUpperCase()}`);
console.log(`Adres API:    ${baseUrl}`);

if (!apiKey || apiKey.trim().length === 0) {
  console.log("\n❌ BŁĄD: Brak klucza API!");
  console.log("Ustaw zmienną INFAKT_API_KEY w pliku .env.local lub przekaż w terminalu:");
  console.log("INFAKT_API_KEY=twoj_klucz npm run test-connection\n");
  console.log("Klucz testowy wygenerujesz na: https://konto.sandbox-infakt.pl/rejestracja\n");
  process.exit(1);
}

console.log(`Klucz API:    ${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`);
console.log("\nTrwa wysyłanie zapytania testowego do inFaktu...");

try {
  const startTime = Date.now();
  const response = await fetch(`${baseUrl}/clients.json?limit=1`, {
    method: "GET",
    headers: {
      "X-inFakt-ApiKey": apiKey.trim(),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  const duration = Date.now() - startTime;

  if (!response.ok) {
    let errorDetails = "";
    try {
      const errJson = await response.json();
      errorDetails = JSON.stringify(errJson, null, 2);
    } catch {
      errorDetails = await response.text();
    }

    console.log(`\n❌ Błąd autoryzacji inFakt (HTTP ${response.status} ${response.statusText}):`);
    console.log(errorDetails);
    process.exit(1);
  }

  const data = await response.json();
  console.log(`\n✅ SUKCES! Połączono pomyślnie z inFakt API! (czas: ${duration}ms)`);
  console.log(`Liczba kontrahentów w bazie: ${data.metainfo?.total_count ?? 0}`);
  console.log("\nGotowe do pracy! Możesz teraz uruchomić aplikację webową poleceniem:");
  console.log("  npm run dev\n");
} catch (error) {
  console.log(`\n❌ Błąd sieciowy: ${error.message}\n`);
  process.exit(1);
}
