"use client";

import { useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { isSuperAdmin } from "@/lib/permissions";
import {
  LayoutDashboard,
  FileText,
  Users,
  LogOut,
  Menu,
  X,
  Home,
  Clock,
  ShieldCheck
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
  adminData: any;
  activeTab: "overview" | "articles" | "visits" | "admins";
  setActiveTab: (tab: "overview" | "articles" | "visits" | "admins") => void;
  articlesCount: number;
  pendingVisitsCount: number;
  currentPageTitle: string;
}

export function DashboardLayout({
  children,
  adminData,
  activeTab,
  setActiveTab,
  articlesCount,
  pendingVisitsCount,
  currentPageTitle
}: DashboardLayoutProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("adminData");
    toast({
      title: "Logout Berhasil",
      description: "Anda telah keluar dari sistem",
    });
    router.push("/login");
  };

  const baseMenuItems = [
    { id: "overview", icon: LayoutDashboard, label: "Overview", badge: null },
    { id: "articles", icon: FileText, label: "Kelola Artikel", badge: articlesCount },
    { id: "visits", icon: Users, label: "Kunjungan Murid", badge: pendingVisitsCount },
  ];

  // Add admin management menu only for super admin
  const menuItems = isSuperAdmin(adminData)
    ? [
        ...baseMenuItems,
        { id: "admins", icon: ShieldCheck, label: "Kelola Admin", badge: null },
      ]
    : baseMenuItems;

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } bg-slate-900 text-white transition-all duration-300 overflow-hidden flex flex-col`}
      >
        {/* Logo & Brand */}
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-lg">
              BK
            </div>
            <div>
              <h2 className="font-bold text-lg">Admin Panel</h2>
              <p className="text-xs text-slate-400">Sahabat BK</p>
            </div>
          </div>
        </div>

        {/* Admin Info */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-blue-500">
              <AvatarFallback className="bg-blue-600 text-white font-semibold">
                {adminData.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{adminData.name}</p>
              <Badge variant={isSuperAdmin(adminData) ? "default" : "secondary"} className="text-xs mt-1">
                {isSuperAdmin(adminData) ? "Super Admin" : "Admin"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="flex-1 text-left font-medium">{item.label}</span>
                {item.badge !== null && item.badge > 0 && (
                  <Badge variant={isActive ? "secondary" : "outline"} className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
              <Home className="h-5 w-5 mr-3" />
              Kembali ke Home
            </Button>
          </Link>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-600"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {currentPageTitle}
              </h1>
              <p className="text-sm text-slate-500">
                Kelola sistem bimbingan dan konseling
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {new Date().toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Badge>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
