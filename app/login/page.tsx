"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
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

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showUnauthorized, setShowUnauthorized] = useState(false);
  const [unauthorizedMessage, setUnauthorizedMessage] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Kirim request ke API
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Login berhasil
        toast({
          title: "Login Berhasil",
          description: `Selamat datang, ${data.admin.name}! (${data.admin.role})`,
        });

        // Simpan data admin & token ke localStorage (cookie httpOnly sudah di-set server)
        localStorage.setItem("adminData", JSON.stringify(data.admin));
        localStorage.setItem("adminToken", data.token);

        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        if (response.status === 401) {
          setUnauthorizedMessage(
            "Maaf, username atau kata sandi yang Anda masukkan salah. Mohon periksa kembali dan pastikan Anda memiliki akses sebagai Guru.",
          );
          setShowUnauthorized(true);
        } else {
          // Login gagal
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-4 relative overflow-hidden">
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

      <Card className="w-full max-w-md shadow-2xl relative z-10 border-0 bg-white">
        <CardHeader className="space-y-4 pb-6">
          {/* Logo/Icon Section */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold text-center text-gray-900">
              Portal Guru BK
            </CardTitle>
            <CardDescription className="text-center text-base text-gray-700 font-medium">
              Sistem Informasi Bimbingan dan Konseling
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pb-8 text-gray-800">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-sm font-semibold text-gray-800"
              >
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Masukkan username Anda"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900 font-medium placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-semibold text-gray-800"
              >
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
                  className="pl-10 pr-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900 font-medium placeholder:text-gray-400"
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

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Memproses...
                </div>
              ) : (
                "Masuk ke Dashboard"
              )}
            </Button>

            {/* Info Section */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">i</span>
                </div>
                <div className="text-sm text-gray-800">
                  <p className="font-bold mb-1 text-gray-900">
                    Informasi Login
                  </p>
                  <p className="text-xs text-gray-700 leading-relaxed font-medium">
                    Gunakan kredensial yang telah terdaftar dalam sistem untuk
                    mengakses dashboard guru BK.
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

      <AlertDialog open={showUnauthorized} onOpenChange={setShowUnauthorized}>
        <AlertDialogContent className="bg-white border-red-200 shadow-2xl rounded-2xl w-[90vw] max-w-md sm:rounded-2xl p-6">
          <AlertDialogHeader className="flex flex-col items-center gap-3 space-y-0">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-2">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <AlertDialogTitle className="text-xl font-bold text-gray-900 text-center">
              Login Gagal
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
};

export default Login;
