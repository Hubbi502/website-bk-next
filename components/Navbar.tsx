"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Calendar, Info, LayoutDashboard, LogIn, LogOut, GraduationCap, User, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import Logo from "../assets/logo.png";
import Image from "next/image";

const Navbar = () => {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isStudentLoggedIn, setIsStudentLoggedIn] = useState(false);
  const [studentData, setStudentData] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const adminData = localStorage.getItem("adminData");
      const studentDataLocal = localStorage.getItem("studentData");
      setIsLoggedIn(!!adminData);
      setIsStudentLoggedIn(!!studentDataLocal);
      if (studentDataLocal) {
        const parsed = JSON.parse(studentDataLocal);
        // Normalize class to string (may be object from old API response)
        if (parsed.class && typeof parsed.class === "object") {
          parsed.class = parsed.class.name || "Tidak ada kelas";
          localStorage.setItem("studentData", JSON.stringify(parsed));
        }
        setStudentData(parsed);
      }
    };

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);

  const handleLogout = async () => {
    try {
      // Hapus cookie JWT di server
      await fetch("/api/auth/student/logout", { method: "POST" });
    } catch (e) {
      // abaikan error jaringan
    }
    localStorage.removeItem("studentData");
    localStorage.removeItem("studentToken");
    setIsStudentLoggedIn(false);
    setStudentData(null);
    window.location.href = "/";
  };

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { path: "/", label: "Beranda", icon: Home },
    { path: "/articles", label: "Artikel", icon: BookOpen },
    { path: "/schedule", label: "Jadwal Konseling", icon: Calendar },
    { path: "/about", label: "Tentang", icon: Info },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md border-b shadow-md"
          : "bg-white/80 backdrop-blur-sm border-b border-gray-100"
      }`}
    >
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src={Logo}
              alt="Sahabat BK"
              className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl object-contain transition-transform hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <Button
                  variant="ghost"
                  className={`gap-2 h-10 px-4 font-medium transition-all ${
                    isActive(item.path)
                      ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}

            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  className={`gap-2 h-10 px-4 font-medium ml-2 ${
                    isActive("/dashboard")
                      ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            ) : isStudentLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="gap-2 h-11 px-6 ml-2 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all">
                    <User className="h-4 w-4" />
                    {studentData?.name || "Murid"}
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 p-3 bg-white border-2 border-gray-100 shadow-2xl"
                >
                  <DropdownMenuLabel className="text-base font-bold text-gray-900 mb-2">
                    <div className="flex flex-col">
                      <span>{studentData?.name}</span>
                      <span className="text-xs font-normal text-gray-500">
                        NISN: {studentData?.nisn}
                      </span>
                      <span className="text-xs font-normal text-gray-500">
                        {typeof studentData?.class === "object"
                          ? studentData?.class?.name
                          : studentData?.class}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-200 mb-2" />

                  <DropdownMenuItem asChild className="p-0">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 cursor-pointer p-4 rounded-xl bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border-2 border-red-200 hover:border-red-300 transition-all w-full"
                    >
                      <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center shadow-md">
                        <LogOut className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex flex-col flex-1 text-left">
                        <span className="font-bold text-gray-900 text-base">
                          Logout
                        </span>
                        <span className="text-sm text-gray-600 font-medium">
                          Keluar dari akun
                        </span>
                      </div>
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button className="gap-2 h-11 px-6 ml-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-all">
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="lg:hidden flex items-center gap-2">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button size="sm" variant="ghost" className="font-semibold">
                  <LayoutDashboard className="h-4 w-4 mr-1" />
                  Dashboard
                </Button>
              </Link>
            ) : isStudentLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-semibold shadow-lg"
                  >
                    <User className="h-4 w-4 mr-1" />
                    {studentData?.name?.split(" ")[0] || "Murid"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-72 p-3 bg-white border-2 border-gray-100 shadow-2xl"
                >
                  <DropdownMenuLabel className="text-base font-bold text-gray-900 mb-2">
                    <div className="flex flex-col">
                      <span>{studentData?.name}</span>
                      <span className="text-xs font-normal text-gray-500">
                        NISN: {studentData?.nisn}
                      </span>
                      <span className="text-xs font-normal text-gray-500">
                        {typeof studentData?.class === "object"
                          ? studentData?.class?.name
                          : studentData?.class}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-200 mb-2" />

                  <DropdownMenuItem asChild className="p-0">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-4 cursor-pointer p-4 rounded-xl bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border-2 border-red-200 hover:border-red-300 transition-all w-full"
                    >
                      <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center shadow-md">
                        <LogOut className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex flex-col flex-1 text-left">
                        <span className="font-bold text-gray-900">Logout</span>
                        <span className="text-sm text-gray-600 font-medium">
                          Keluar dari akun
                        </span>
                      </div>
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
                >
                  <LogIn className="h-4 w-4 mr-1" />
                  Login
                </Button>
              </Link>
            )}

            <DropdownMenu
              open={isMobileMenuOpen}
              onOpenChange={setIsMobileMenuOpen}
            >
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  {isMobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-[280px] sm:w-[320px] p-2 bg-white border border-gray-100 shadow-xl rounded-xl"
              >
                <DropdownMenuLabel className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                    BK
                  </div>
                  <span className="font-bold text-lg">Sahabat BK</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="flex flex-col space-y-1 mt-2">
                  {navItems.map((item) => (
                    <DropdownMenuItem asChild key={item.path} className="p-0">
                      <Link
                        href={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-full"
                      >
                        <Button
                          variant="ghost"
                          className={`w-full justify-start gap-3 h-12 ${
                            isActive(item.path)
                              ? "bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold"
                              : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                          }`}
                        >
                          <item.icon className="h-5 w-5" />
                          {item.label}
                        </Button>
                      </Link>
                    </DropdownMenuItem>
                  ))}

                  {isLoggedIn && (
                    <DropdownMenuItem asChild className="p-0 mt-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-full"
                      >
                        <Button
                          variant="ghost"
                          className={`w-full justify-start gap-3 h-12 ${
                            isActive("/dashboard")
                              ? "bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold"
                              : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                          }`}
                        >
                          <LayoutDashboard className="h-5 w-5" />
                          Dashboard
                        </Button>
                      </Link>
                    </DropdownMenuItem>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
