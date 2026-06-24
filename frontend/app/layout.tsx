import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BankShield AI | Explainable Banking Intrusion Detection",
  description: "Explainable, Context-Aware Intrusion Detection and Threat Intelligence for Banking IoT Networks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-cyber-bg text-gray-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
