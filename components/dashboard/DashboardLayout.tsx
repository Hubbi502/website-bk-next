"use client";

import { useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  ShieldCheck,
  GraduationCap,
  UserCircle,
  Library,
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
  adminData: any;
  activeTab:
    | "overview"
    | "articles"
    | "visits"
    | "admins"
    | "students"
    | "majors"
    | "classes";
  setActiveTab: (
    tab:
      | "overview"
      | "articles"
      | "visits"
      | "admins"
      | "students"
      | "majors"
      | "classes",
  ) => void;
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
  currentPageTitle,
}: DashboardLayoutProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      // Hapus cookie JWT di server
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      // abaikan error jaringan
    }
    localStorage.removeItem("adminData");
    localStorage.removeItem("adminToken");
    toast({
      title: "Logout Berhasil",
      description: "Anda telah keluar dari sistem",
    });
    router.push("/");
  };

  const baseMenuItems = [
    { id: "overview", icon: LayoutDashboard, label: "Overview", badge: null },
    {
      id: "articles",
      icon: FileText,
      label: "Kelola Artikel",
      badge: articlesCount,
    },
    {
      id: "visits",
      icon: Users,
      label: "Kunjungan Murid",
      badge: pendingVisitsCount,
    },
    { id: "students", icon: GraduationCap, label: "Kelola Siswa", badge: null },
  ];

  // Add admin management menu only for super admin
  const menuItems = isSuperAdmin(adminData)
    ? [
        ...baseMenuItems,
        { id: "majors", icon: Library, label: "Kelola Jurusan", badge: null },
        { id: "classes", icon: Library, label: "Kelola Kelas", badge: null },
        { id: "admins", icon: ShieldCheck, label: "Kelola Admin", badge: null },
      ]
    : baseMenuItems;

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } bg-slate-900 text-white transition-all duration-300 overflow-hidden flex-col hidden md:flex`}
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
              <AvatarImage
                src={adminData.profileImageUrl || undefined}
                alt={adminData.name}
                className="object-cover"
              />
              <AvatarFallback className="bg-blue-600 text-white flex items-center justify-center">
                <UserCircle className="h-7 w-7" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{adminData.name}</p>
              <Badge
                variant={isSuperAdmin(adminData) ? "default" : "secondary"}
                className="text-xs mt-1"
              >
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
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="flex-1 text-left font-medium">
                  {item.label}
                </span>
                {item.badge !== null && item.badge > 0 && (
                  <Badge
                    variant={isActive ? "secondary" : "outline"}
                    className="ml-auto"
                  >
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link href="/dashboard/profile">
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <UserCircle className="h-5 w-5 mr-3" />
              Profil Saya
            </Button>
          </Link>
          <Link href="/">
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
            >
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
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 flex items-center justify-between z-20 relative shadow-sm">
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-600 hidden md:flex"
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-600 md:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-slate-900 truncate max-w-[150px] sm:max-w-xs md:max-w-none">
                {currentPageTitle}
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Kelola sistem bimbingan dan konseling
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <Badge
              variant="outline"
              className="text-[10px] md:text-xs px-2 py-1"
            >
              <Clock className="h-3 w-3 mr-1 md:mr-2" />
              <span className="hidden sm:inline">
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span className="sm:hidden">
                {new Date().toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </Badge>
          </div>
        </header>

        {/* Mobile Dropdown Menu (Overlay) */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-[73px] left-0 right-0 z-30 bg-slate-900 text-white shadow-xl border-t border-slate-700 animate-in slide-in-from-top-2">
            <div className="p-4 border-b border-slate-800 flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-blue-500">
                <AvatarImage
                  src={adminData.profileImageUrl || undefined}
                  alt={adminData.name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-blue-600 text-white flex items-center justify-center">
                  <UserCircle className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">
                  {adminData.name}
                </p>
                <Badge
                  variant={isSuperAdmin(adminData) ? "default" : "secondary"}
                  className="text-[10px] mt-0.5 py-0 px-2"
                >
                  {isSuperAdmin(adminData) ? "Super Admin" : "Admin"}
                </Badge>
              </div>
            </div>
            <nav className="p-2 space-y-1 max-h-[50vh] overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="flex-1 text-left text-sm font-medium">
                      {item.label}
                    </span>
                    {item.badge !== null && item.badge > 0 && (
                      <Badge
                        variant={isActive ? "secondary" : "outline"}
                        className="ml-auto text-xs py-0"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </nav>
            <div className="p-2 border-t border-slate-800 space-y-1">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800 text-sm py-2 h-auto"
                >
                  <Home className="h-4 w-4 mr-3" />
                  Kembali ke Home
                </Button>
              </Link>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950 text-sm py-2 h-auto"
              >
                <LogOut className="h-4 w-4 mr-3" />
                Logout
              </Button>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
