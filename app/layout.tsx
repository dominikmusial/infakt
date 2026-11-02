import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "inFakt Connect | Integracja API Sandbox & Produkcja",
  description: "Aplikacja Next.js do komunikacji z API inFakt (wystawianie faktur, kontrahenci, PDF)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body className="antialiased min-h-screen flex flex-col bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
