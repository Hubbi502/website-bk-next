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
        setStudentData(JSON.parse(studentDataLocal));
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

  const handleLogout = () => {
    localStorage.removeItem("studentData");
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
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? "bg-white/95 backdrop-blur-md border-b shadow-md" 
        : "bg-white/80 backdrop-blur-sm border-b border-gray-100"
    }`}>
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-xl transition-shadow">
              BK
            </div>
            <div className="flex flex-col">
              <span className="text-xl lg:text-2xl font-bold text-gray-900">Sahabat BK</span>
              <span className="text-xs text-gray-500 hidden sm:block">Bimbingan & Konseling</span>
            </div>
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
                  <Button
                    className="gap-2 h-11 px-6 ml-2 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    <User className="h-4 w-4" />
                    {studentData?.name || "Murid"}
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-3 bg-white border-2 border-gray-100 shadow-2xl">
                  <DropdownMenuLabel className="text-base font-bold text-gray-900 mb-2">
                    <div className="flex flex-col">
                      <span>{studentData?.name}</span>
                      <span className="text-xs font-normal text-gray-500">NISN: {studentData?.nisn}</span>
                      <span className="text-xs font-normal text-gray-500">{studentData?.class}</span>
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
                        <span className="font-bold text-gray-900 text-base">Logout</span>
                        <span className="text-sm text-gray-600 font-medium">Keluar dari akun</span>
                      </div>
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="gap-2 h-11 px-6 ml-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    <LogIn className="h-4 w-4" />
                    Login
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 p-3 bg-white border-2 border-gray-100 shadow-2xl">
                  <DropdownMenuLabel className="text-base font-bold text-gray-900 mb-2">Pilih Jenis Login</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-200 mb-2" />
                  
                  <DropdownMenuItem asChild className="p-0 mb-2">
                    <Link href="/login" className="flex items-center gap-4 cursor-pointer p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-200 hover:border-blue-300 transition-all shadow-sm hover:shadow-md">
                      <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
                        <GraduationCap className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="font-bold text-gray-900 text-base">Login Guru</span>
                        <span className="text-sm text-gray-600 font-medium">Akses dashboard guru BK</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild className="p-0">
                    <Link href="/student-login" className="flex items-center gap-4 cursor-pointer p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 hover:from-green-100 hover:to-emerald-200 border-2 border-green-200 hover:border-green-300 transition-all shadow-sm hover:shadow-md">
                      <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center shadow-md">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="font-bold text-gray-900 text-base">Login Murid</span>
                        <span className="text-sm text-gray-600 font-medium">Buat jadwal konseling</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          {/* Mobile Menu */}
          <div className="lg:hidden flex items-center gap-2">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button
                  size="sm"
                  variant="ghost"
                  className="font-semibold"
                >
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
                    {studentData?.name?.split(' ')[0] || "Murid"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 p-3 bg-white border-2 border-gray-100 shadow-2xl">
                  <DropdownMenuLabel className="text-base font-bold text-gray-900 mb-2">
                    <div className="flex flex-col">
                      <span>{studentData?.name}</span>
                      <span className="text-xs font-normal text-gray-500">NISN: {studentData?.nisn}</span>
                      <span className="text-xs font-normal text-gray-500">{studentData?.class}</span>
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
                        <span className="text-sm text-gray-600 font-medium">Keluar dari akun</span>
                      </div>
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg"
                  >
                    <LogIn className="h-4 w-4 mr-1" />
                    Login
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 p-3 bg-white border-2 border-gray-100 shadow-2xl">
                  <DropdownMenuLabel className="text-base font-bold text-gray-900 mb-2">Pilih Jenis Login</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-200 mb-2" />
                  
                  <DropdownMenuItem asChild className="p-0 mb-2">
                    <Link href="/login" className="flex items-center gap-4 cursor-pointer p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-200 hover:border-blue-300 transition-all shadow-sm">
                      <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
                        <GraduationCap className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="font-bold text-gray-900">Login Guru</span>
                        <span className="text-sm text-gray-600 font-medium">Dashboard guru BK</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild className="p-0">
                    <Link href="/student-login" className="flex items-center gap-4 cursor-pointer p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 hover:from-green-100 hover:to-emerald-200 border-2 border-green-200 hover:border-green-300 transition-all shadow-sm">
                      <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center shadow-md">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="font-bold text-gray-900">Login Murid</span>
                        <span className="text-sm text-gray-600 font-medium">Jadwal konseling</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                <SheetHeader className="mb-6">
                  <SheetTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                      BK
                    </div>
                    <span className="font-bold text-lg">Sahabat BK</span>
                  </SheetTitle>
                </SheetHeader>
                
                <div className="flex flex-col space-y-2">
                  {navItems.map((item) => (
                    <Link 
                      key={item.path} 
                      href={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
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
                  ))}
                  
                  {isLoggedIn && (
                    <Link 
                      href="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button
                        variant="ghost"
                        className={`w-full justify-start gap-3 h-12 mt-2 ${
                          isActive("/dashboard")
                            ? "bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold"
                            : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                        }`}
                      >
                        <LayoutDashboard className="h-5 w-5" />
                        Dashboard
                      </Button>
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
