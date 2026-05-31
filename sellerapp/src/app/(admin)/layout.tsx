"use client";
import { useState } from "react";
import { Sidebar } from "@/components/features/layout/Sidebar";
import { Header } from "@/components/features/layout/Header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="grid grid-cols-[240px_1fr] min-h-screen max-[900px]:grid-cols-1">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} isAdmin={true} />
      <div className="flex flex-col min-h-screen overflow-x-auto">
        <Header onMenu={() => setSidebarOpen(true)} />
        <main className="px-8 pt-7 pb-12 max-[900px]:p-[18px]">{children}</main>
      </div>
    </div>
  );
}