"use client";
import { useState } from "react";
import { Sidebar } from "@/components/features/layout/Sidebar";
import { Header } from "@/components/features/layout/Header";

export default function PropietarioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isAdmin={false}
      />
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", minWidth: 0 }}>
        <Header onMenu={() => setSidebarOpen(true)} />
        <main className="page">{children}</main>
      </div>
    </div>
  );
}