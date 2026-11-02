# inFakt Connect - Aplikacja Next.js & Node.js do integracji z inFakt API

Kompletna aplikacja w **Next.js (App Router + TypeScript + Tailwind CSS)** oraz zestaw skryptów **Node.js** integrujących się z systemem księgowym **inFakt REST API v3**. Aplikacja domyślnie wspiera oficjalne środowisko testowe **inFakt Sandbox** (oraz produkcję).

---

## 🚀 Szybki start

### 1. Rejestracja w inFakt Sandbox i pobranie klucza API
Środowisko Sandbox inFakt wymaga osobnego konta testowego:
1. Zarejestruj darmowe konto testowe na: **[konto.sandbox-infakt.pl/rejestracja](https://konto.sandbox-infakt.pl/rejestracja)**.
2. Po zalogowaniu wejdź w: **Ustawienia &rarr; Inne &rarr; API**.
3. Kliknij **Wygeneruj klucz API** i skopiuj wygenerowany ciąg znaków.

---

### 2. Konfiguracja zmiennych środowiskowych
Skopiuj `.env.example` do `.env.local` i wklej swój klucz:
```bash
cp .env.example .env.local
```

W pliku `.env.local`:
```env
INFAKT_API_KEY=twoj_wygenerowany_klucz_api
INFAKT_ENVIRONMENT=sandbox
```
*(Uwaga: klucz możesz też podać lub zmienić w dowolnym momencie bezpośrednio w interfejsie graficznym aplikacji!)*

---

### 3. Uruchomienie aplikacji Next.js
W katalogu projektu uruchom serwer deweloperski:
```bash
npm run dev
```

Otwórz w przeglądarce: **[http://localhost:3000](http://localhost:3000)**.

---

## 🛠️ Funkcjonalności aplikacji

- **Zarządzanie środowiskiem:**
  - Przełącznik między **Sandbox** (`https://api.sandbox-infakt.pl/api/v3`) a **Produkcją** (`https://api.infakt.pl/api/v3`).
  - Sprawdzanie stanu połączenia w czasie rzeczywistym.
  - Możliwość testowania klucza bezpośrednio z poziomu interfejsu (lub z `.env.local`).

- **Faktury:**
  - Przeglądanie listy wystawionych faktur z numerami, kontrahentami, kwotami netto/brutto i statusami.
  - **Pobieranie oryginału faktury w formacie PDF** bezpośrednio z inFaktu jednym kliknięciem.
  - **Kreator wystawiania faktur:**
    - Wybór klienta z bazy lub wprowadzenie nowych danych kontrahenta (NIP, adres).
    - Dynamiczne dodawanie pozycji na fakturze (usługi/towary).
    - Stawki VAT: 23%, 8%, 5%, 0%, zwolnione.
    - Automatyczne przeliczanie kwot na grosze (zgodnie z wymogami specyfikacji API inFakt).
    - Formy płatności (Przelew, Gotówka, Karta, BLIK, PayU).

- **Kontrahenci (Klienci):**
  - Przegląd bazy klientów zapisanych w inFakcie.
  - Formularz dodawania nowego klienta z automatycznym zapisem w inFakt.

- **Diagnostyka API:**
  - Podgląd zapytań cURL dla programistów.
  - Wykonywanie bezpośrednich testów zapytań HTTP z podglądem nagłówków i odpowiedzi JSON.

- **Przewodnik po inFakt Sandbox:**
  - Kompendium wiedzy o limitach, adresach URL i specyfice środowiska testowego.

---

## 💻 Uruchamianie z poziomu Node.js (CLI)

Jeśli wolisz wykonać operacje bez uruchamiania przeglądarki, przygotowaliśmy dwa gotowe skrypty:

### 1. Test połączenia z API
```bash
npm run test-connection
```
LUB z podaniem klucza bezpośrednio w poleceniu:
```bash
INFAKT_API_KEY=twoj_klucz npm run test-connection
```

### 2. Wystawienie przykładowej faktury w Sandboxie
```bash
npm run create-test-invoice
```

---

## 📁 Struktura projektu

```text
├── app/
│   ├── api/infakt/
│   │   ├── clients/route.ts        # Endpoint GET / POST kontrahentów
│   │   ├── invoices/route.ts       # Endpoint GET / POST faktur
│   │   ├── invoices/[uuid]/pdf/    # Pobieranie binarnego PDF faktury
│   │   └── status/route.ts         # Test statusu połączenia
│   ├── globals.css                 # Style globalne Tailwind
│   ├── layout.tsx                  # Layout aplikacji
│   └── page.tsx                    # Główny panel aplikacji (Dashboard)
├── components/
│   ├── ApiDiagnostics.tsx          # Tester zapytań API i generator cURL
│   ├── ApiKeyModal.tsx             # Modal konfiguracji klucza API
│   ├── ClientsList.tsx             # Tabela i wyszukiwarka kontrahentów
│   ├── CreateClientModal.tsx       # Formularz dodawania kontrahenta
│   ├── CreateInvoiceModal.tsx      # Kreator nowej faktury VAT
│   ├── Header.tsx                  # Pasek nawigacyjny z podglądem statusu
│   ├── InvoicesList.tsx            # Lista faktur z pobieraniem PDF
│   └── SandboxGuide.tsx            # Instrukcja środowiska testowego
├── lib/
│   ├── infakt/
│   │   ├── client.ts               # Główna klasa klienta inFakt REST API
│   │   ├── context.tsx             # React Context dla stanu połączenia
│   │   ├── server-helper.ts        # Pomocnik ekstrakcji kluczy z requestu
│   │   └── types.ts                # Typy TypeScript modeli inFakt
│   └── utils.ts                    # Formatowanie walut PLN/grosze i dat
├── scripts/
│   ├── test-connection.mjs         # Skrypt Node.js testujący połączenie
│   └── create-sample-invoice.mjs   # Skrypt Node.js wystawiający fakturę
├── .env.example
├── .env.local
└── package.json
```

---

## ℹ️ Ważne uwagi techniczne o inFakt API v3
- **Waluta i grosze:** API inFakt przyjmuje ceny w groszach jako liczby całkowite (`unit_net_price: 10000` = `100.00 PLN`). Aplikacja oraz skrypty automatycznie wykonują to przeliczenie.
- **Pobieranie PDF:** Endpoint `/api/v3/invoices/{uuid}/pdf.json?document_type=original` zwraca bezpośrednio strumień binarny pliku PDF (`Content-Type: application/pdf`), który w aplikacji jest natychmiast przekierowywany do pobrania.
