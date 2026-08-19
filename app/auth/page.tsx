"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  User,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AuthPage() {
  // Shared state
  const [activeTab, setActiveTab] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showUnauthorized, setShowUnauthorized] = useState(false);
  const [unauthorizedMessage, setUnauthorizedMessage] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  // Student state
  const [studentNisn, setStudentNisn] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Admin/Teacher state
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = isRegisterMode ? "/api/auth/student/register" : "/api/auth/student/login";
      const body = isRegisterMode
        ? { name: studentName, nisn: studentNisn, password: studentPassword }
        : { nisn: studentNisn, password: studentPassword };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: isRegisterMode ? "Registrasi Berhasil" : "Login Berhasil",
          description: isRegisterMode
            ? "Akun Anda telah dibuat. Silakan login."
            : `Selamat datang, ${data.student.name}!`,
        });

        if (!isRegisterMode) {
          localStorage.setItem("studentData", JSON.stringify(data.student));
          router.push("/schedule");
        } else {
          setIsRegisterMode(false);
          setStudentName("");
          setStudentPassword("");
        }
      } else {
        if (response.status === 401) {
          setUnauthorizedMessage(
            isRegisterMode
              ? "Maaf, pendaftaran Anda tidak dapat diproses. Pastikan data pendaftaran Anda valid dan belum terdaftar di sistem."
              : "Maaf, NISN atau kata sandi yang Anda masukkan salah. Mohon periksa kembali kredensial Anda."
          );
          setShowUnauthorized(true);
        } else {
          toast({
            title: isRegisterMode ? "Registrasi Gagal" : "Login Gagal",
            description: data.error || "Terjadi kesalahan. Silakan coba lagi.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: adminUsername, password: adminPassword }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Login Berhasil",
          description: `Selamat datang, ${data.admin.name}! (${data.admin.role})`,
        });

        localStorage.setItem("adminData", JSON.stringify(data.admin));
        localStorage.setItem("adminToken", data.token);
        router.push("/dashboard");
      } else {
        if (response.status === 401) {
          setUnauthorizedMessage(
            "Maaf, username atau kata sandi yang Anda masukkan salah. Mohon periksa kembali dan pastikan Anda memiliki akses sebagai Guru."
          );
          setShowUnauthorized(true);
        } else {
          toast({
            title: "Login Gagal",
            description: data.error || "Username atau password tidak valid.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat login. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-600 p-4 sm:p-8">
      <Link href="/" className="self-start mb-8 z-20">
        <Button variant="ghost" className="gap-2 text-white hover:bg-white/10 hover:text-white px-0 sm:px-4">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-base font-medium">Kembali ke Beranda</span>
        </Button>
      </Link>

      <div className="w-full max-w-[420px] flex-1 flex flex-col justify-center relative z-10">
        <Card className="shadow-2xl border-0 bg-white rounded-2xl overflow-hidden">
          <CardHeader className="space-y-6 pt-8 pb-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-center space-y-1">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Sahabat BK
                </CardTitle>
                <CardDescription className="text-sm font-medium text-gray-500">
                  Masuk untuk melanjutkan
                </CardDescription>
              </div>
            </div>
            
            <div className="px-1">
              <Tabs defaultValue="student" className="w-full" onValueChange={(v) => {
                setActiveTab(v);
                setIsRegisterMode(false); // Reset to login mode when switching tabs
              }}>
                <TabsList className="grid w-full grid-cols-2 p-1 bg-gray-100 rounded-xl h-12">
                  <TabsTrigger 
                    value="student" 
                    className="rounded-lg text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all"
                  >
                    Siswa
                  </TabsTrigger>
                  <TabsTrigger 
                    value="admin" 
                    className="rounded-lg text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all"
                  >
                    Guru / Admin
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>

        <CardContent className="px-6 pb-8 text-gray-800">
          {activeTab === "student" ? (
            // Form Siswa
            <form onSubmit={handleStudentSubmit} className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              {isRegisterMode && (
                <div className="space-y-1.5">
                  <Label htmlFor="studentName" className="text-sm font-semibold text-gray-700">Nama Lengkap</Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="studentName"
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pl-11 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-900 font-medium rounded-xl"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="studentNisn" className="text-sm font-semibold text-gray-700">NISN</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="studentNisn"
                    type="text"
                    placeholder="Masukkan NISN"
                    value={studentNisn}
                    onChange={(e) => setStudentNisn(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-11 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-900 font-medium rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="studentPassword" className="text-sm font-semibold text-gray-700">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="studentPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password"
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-11 pr-11 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-900 font-medium rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] text-base"
                  disabled={isLoading}
                >
                  {isLoading ? "Memproses..." : isRegisterMode ? "Daftar Akun" : "Masuk"}
                </Button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(!isRegisterMode)}
                  className="text-sm text-gray-500 hover:text-blue-600 font-medium transition-colors"
                >
                  {isRegisterMode ? "Sudah punya akun? Masuk" : "Belum punya akun? Daftar"}
                </button>
              </div>
            </form>
          ) : (
            // Form Admin/Guru
            <form onSubmit={handleAdminSubmit} className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="space-y-1.5">
                <Label htmlFor="adminUsername" className="text-sm font-semibold text-gray-700">Username</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="adminUsername"
                    type="text"
                    placeholder="Masukkan username"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-11 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-900 font-medium rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="adminPassword" className="text-sm font-semibold text-gray-700">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="adminPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-11 pr-11 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-900 font-medium rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] text-base"
                  disabled={isLoading}
                >
                  {isLoading ? "Memproses..." : "Masuk"}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-8 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-xs font-bold">i</span>
              </div>
              <div className="text-sm">
                <p className="font-semibold text-gray-900 mb-0.5">Info Login</p>
                <p className="text-gray-600 leading-relaxed">
                  {activeTab === "student" 
                    ? "Gunakan NISN untuk login. Jika belum punya akun, silakan daftar terlebih dahulu."
                    : "Gunakan kredensial admin/guru yang terdaftar."}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>

      <div className="mt-8 text-center text-white/80 text-sm font-medium">
        <p>© 2025 Sistem Bimbingan dan Konseling</p>
      </div>

      <AlertDialog open={showUnauthorized} onOpenChange={setShowUnauthorized}>
        <AlertDialogContent className="bg-white border-red-200 shadow-2xl rounded-2xl w-[90vw] max-w-md sm:rounded-2xl p-6">
          <AlertDialogHeader className="flex flex-col items-center gap-3 space-y-0">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-2">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <AlertDialogTitle className="text-xl font-bold text-gray-900 text-center">
              Akses Ditolak
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 text-[15px] leading-relaxed text-center">
              {unauthorizedMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center mt-6">
            <AlertDialogAction
              onClick={() => setShowUnauthorized(false)}
              className="w-full sm:w-auto px-10 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium h-11 transition-colors"
            >
              Coba Lagi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
