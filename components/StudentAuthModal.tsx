"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Mail, Lock, GraduationCap, Eye, EyeOff } from "lucide-react";

interface StudentAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (studentData: any) => void;
}

export default function StudentAuthModal({
  isOpen,
  onClose,
  onSuccess,
}: StudentAuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginForm.email || !loginForm.password) {
      toast({
        title: "Error",
        description: "Email dan password harus diisi",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/student/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Save to localStorage
      localStorage.setItem("studentData", JSON.stringify(data.data));

      toast({
        title: "Berhasil",
        description: "Login berhasil!",
      });

      onSuccess(data.data);
      onClose();
      setLoginForm({ email: "", password: "" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Login gagal",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
        {/* Header dengan Gradient */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 p-6 text-white">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <GraduationCap className="w-6 h-6" />
              </div>
              <DialogTitle className="text-2xl font-bold text-white">
                Portal Siswa
              </DialogTitle>
            </div>
            <DialogDescription className="text-blue-50">
              Masuk atau daftar untuk mengakses fitur lengkap
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mt-2">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-sm font-medium text-slate-700">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="nama@email.com"
                      className="pl-11 h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      value={loginForm.email}
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, email: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-sm font-medium text-slate-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan password"
                      className="pl-11 pr-11 h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      value={loginForm.password}
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, password: e.target.value })
                      }
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-md hover:shadow-lg transition-all" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Memproses...</span>
                    </div>
                  ) : (
                    "Masuk"
                  )}
                </Button>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                  <p className="text-sm text-slate-600 text-center">
                    <span className="font-medium text-blue-700">Info:</span> Akun siswa dibuat oleh admin sekolah. Jika belum memiliki akun, hubungi admin untuk registrasi.
                  </p>
                </div>
              </form>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
