import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Honey Chain — Blockchain Honey Traceability",
  description:
    "Blockchain-based honey traceability and smart beekeeping management system with QR-code consumer verification, AI-IoT analytics, and supply chain transparency.",
  keywords: [
    "honey",
    "blockchain",
    "traceability",
    "beekeeping",
    "IoT",
    "AI",
    "KVIC",
    "smart agriculture",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased bg-amber-50/30 text-gray-800 min-h-screen`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
