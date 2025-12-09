"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, User, Lock, GraduationCap, ArrowLeft } from "lucide-react";
import Link from "next/link";

const StudentLogin = () => {
  const [name, setName] = useState("");
  const [nisn, setNisn] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = isRegisterMode ? "/api/auth/student/register" : "/api/auth/student/login";
      const body = isRegisterMode 
        ? { name, nisn, password }
        : { nisn, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
          setName("");
          setPassword("");
        }
      } else {
        toast({
          title: isRegisterMode ? "Registrasi Gagal" : "Login Gagal",
          description: data.error || "Terjadi kesalahan. Silakan coba lagi.",
          variant: "destructive",
        });
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* Back button */}
      <Link href="/" className="absolute top-4 left-4 z-20">
        <Button variant="ghost" className="gap-2 text-white hover:bg-white/10">
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
      </Link>

      <Card className="w-full max-w-md shadow-2xl relative z-10 border-0">
        <CardHeader className="space-y-4 pb-6">
          {/* Logo/Icon Section */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold text-center text-gray-900">
              {isRegisterMode ? "Registrasi Murid" : "Portal Murid"}
            </CardTitle>
            <CardDescription className="text-center text-base text-gray-700 font-medium">
              {isRegisterMode 
                ? "Buat akun untuk mengakses layanan konseling"
                : "Akses jadwal konseling dan layanan BK"
              }
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field - Only for Register */}
            {isRegisterMode && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-gray-800">
                  Nama Lengkap
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500 text-gray-900 font-medium placeholder:text-gray-400"
                  />
                </div>
              </div>
            )}

            {/* NISN Field */}
            <div className="space-y-2">
              <Label htmlFor="nisn" className="text-sm font-semibold text-gray-800">
                NISN
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="nisn"
                  type="text"
                  placeholder="Masukkan NISN Anda"
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500 text-gray-900 font-medium placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-800">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10 pr-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500 text-gray-900 font-medium placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Memproses...
                </div>
              ) : (
                isRegisterMode ? "Daftar Akun" : "Masuk"
              )}
            </Button>


            
            {/* Info Section */}
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">i</span>
                </div>
                <div className="text-sm text-gray-800">
                  <p className="font-bold mb-1 text-gray-900">Informasi Login Murid</p>
                  <p className="text-xs text-gray-700 leading-relaxed font-medium">
                    {isRegisterMode 
                      ? "Daftar dengan NISN dan password untuk mengakses layanan konseling."
                      : "Gunakan NISN dan password yang telah didaftarkan untuk mengakses jadwal konseling."
                    }
                  </p>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-white/80 text-sm z-10">
        <p>© 2025 Sistem Bimbingan dan Konseling</p>
      </div>
    </div>
  );
};

export default StudentLogin;
