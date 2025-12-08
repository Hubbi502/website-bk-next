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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

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
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    class: "",
    phone: "",
  });
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !registerForm.name ||
      !registerForm.email ||
      !registerForm.password ||
      !registerForm.class
    ) {
      toast({
        title: "Error",
        description: "Semua field wajib diisi kecuali nomor HP",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/student/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Save to localStorage
      localStorage.setItem("studentData", JSON.stringify(data.data));

      toast({
        title: "Berhasil",
        description: "Registrasi berhasil! Anda sudah login.",
      });

      onSuccess(data.data);
      onClose();
      setRegisterForm({
        name: "",
        email: "",
        password: "",
        class: "",
        phone: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Registrasi gagal",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Autentikasi Murid</DialogTitle>
          <DialogDescription>
            Login atau daftar untuk melanjutkan
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Daftar</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="email@contoh.com"
                  value={loginForm.email}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, email: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="******"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Loading..." : "Login"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="register-name">Nama Lengkap *</Label>
                <Input
                  id="register-name"
                  type="text"
                  placeholder="Nama Anda"
                  value={registerForm.name}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="register-email">Email *</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="email@contoh.com"
                  value={registerForm.email}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, email: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="register-password">Password *</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="******"
                  value={registerForm.password}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      password: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="register-class">Kelas *</Label>
                <Input
                  id="register-class"
                  type="text"
                  placeholder="Contoh: XII IPA 1"
                  value={registerForm.class}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, class: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="register-phone">Nomor HP</Label>
                <Input
                  id="register-phone"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={registerForm.phone}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, phone: e.target.value })
                  }
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Loading..." : "Daftar"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
