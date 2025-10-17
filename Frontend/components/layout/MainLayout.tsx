"use client";

import { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
  showBack?: boolean;
  onBackClick?: () => void;
  rightAction?: React.ReactNode;
}

export function MainLayout({
  children,
  title,
  showBack,
  onBackClick,
  rightAction,
}: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col">
        <Header
          title={title}
          onMenuClick={() => setSidebarOpen(true)}
          showBack={showBack}
          onBackClick={onBackClick}
          rightAction={rightAction}
        />

        <main className="flex-1 container max-w-4xl mx-auto px-4 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
