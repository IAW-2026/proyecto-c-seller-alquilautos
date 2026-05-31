import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlquilAutos - Seller App",
  description: "Panel del propietario - AlquilAutos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="es" className="h-full antialiased">
        <body className="min-h-full">{children}</body>
      </html>
    </ClerkProvider>
  );
}