"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, UserCircle } from "lucide-react";
import { AdminProfileFormFields } from "@/components/dashboard/AdminProfileFormFields";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

interface AdminProfile {
  id: string;
  name: string;
  username: string;
  role: "ADMIN" | "SUPER_ADMIN";
  profileImageUrl: string | null;
  shortBio: string | null;
  bio: string | null;
  positionTitle: string | null;
  education: string | null;
  expertise: string | null;
  phone: string | null;
  emailPublic: string | null;
  officeLocation: string | null;
  officeHours: string | null;
  socialLinks: string | null;
}

interface ProfileFormData {
  name: string;
  username: string;
  role: "ADMIN" | "SUPER_ADMIN" | "";
  profileImageUrl: string;
  shortBio: string;
  bio: string;
  positionTitle: string;
  education: string;
  expertise: string;
  phone: string;
  emailPublic: string;
  officeLocation: string;
  officeHours: string;
  socialLinks: string;
}

const emptyFormData: ProfileFormData = {
  name: "",
  username: "",
  role: "",
  profileImageUrl: "",
  shortBio: "",
  bio: "",
  positionTitle: "",
  education: "",
  expertise: "",
  phone: "",
  emailPublic: "",
  officeLocation: "",
  officeHours: "",
  socialLinks: "",
};

const mapProfileToFormData = (profile: AdminProfile): ProfileFormData => ({
  ...emptyFormData,
  name: profile.name ?? "",
  username: profile.username ?? "",
  role: profile.role ?? "",
  profileImageUrl: profile.profileImageUrl ?? "",
  shortBio: profile.shortBio ?? "",
  bio: profile.bio ?? "",
  positionTitle: profile.positionTitle ?? "",
  education: profile.education ?? "",
  expertise: profile.expertise ?? "",
  phone: profile.phone ?? "",
  emailPublic: profile.emailPublic ?? "",
  officeLocation: profile.officeLocation ?? "",
  officeHours: profile.officeHours ?? "",
  socialLinks: profile.socialLinks ?? "",
});

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState<ProfileFormData>(emptyFormData);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const roleLabel = useMemo(() => {
    if (!profile?.role) return "";
    return profile.role === "SUPER_ADMIN" ? "Koordinator" : "Guru BK";
  }, [profile?.role]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("adminToken");
        const headers: HeadersInit = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch("/api/admins/me", {
          headers,
          credentials: "include",
        });
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            toast({
              title: "Akses ditolak",
              description: "Silakan login terlebih dahulu.",
              variant: "destructive",
            });
            router.push("/login");
            return;
          }

          throw new Error(data?.error || "Gagal memuat profil");
        }

        setProfile(data.data);
        setFormData(mapProfileToFormData(data.data));
      } catch (error) {
        console.error("Error loading profile:", error);
        toast({
          title: "Gagal memuat profil",
          description:
            error instanceof Error ? error.message : "Terjadi kesalahan",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [router, toast]);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const token = localStorage.getItem("adminToken");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const payload = {
        name: formData.name,
        profileImageUrl: formData.profileImageUrl,
        shortBio: formData.shortBio,
        bio: formData.bio,
        positionTitle: formData.positionTitle,
        education: formData.education,
        expertise: formData.expertise,
        phone: formData.phone,
        emailPublic: formData.emailPublic,
        officeLocation: formData.officeLocation,
        officeHours: formData.officeHours,
        socialLinks: formData.socialLinks,
      };

      const response = await fetch("/api/admins/me", {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Gagal menyimpan profil");
      }

      setProfile(data.data);
      setFormData(mapProfileToFormData(data.data));

      const storedAdmin = localStorage.getItem("adminData");
      if (storedAdmin) {
        try {
          const parsedAdmin = JSON.parse(storedAdmin);
          localStorage.setItem(
            "adminData",
            JSON.stringify({
              ...parsedAdmin,
              name: data.data.name,
              username: data.data.username,
              role: data.data.role,
            })
          );
        } catch {
          // ignore parse errors
        }
      }

      toast({
        title: "Profil tersimpan",
        description: "Perubahan berhasil disimpan.",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Gagal menyimpan profil",
        description:
          error instanceof Error ? error.message : "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900">Profil Saya</h1>
            <p className="text-sm text-slate-500">
              Kelola informasi profil Anda sebagai guru BK.
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Dashboard
            </Button>
          </Link>
        </div>

        <Card className="mt-6 border-none shadow-lg">
          <CardHeader className="border-b bg-white/70">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <UserCircle className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl text-slate-900">
                  Informasi Akun
                </CardTitle>
                <CardDescription className="text-slate-500">
                  Data login tidak bisa diubah di halaman ini.
                </CardDescription>
              </div>
              {roleLabel ? (
                <Badge
                  variant="outline"
                  className="ml-auto bg-slate-50 text-slate-600"
                >
                  {roleLabel}
                </Badge>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      disabled
                      placeholder="Username"
                    />
                  </div>
                </div>

                <AdminProfileFormFields
                  formData={formData}
                  setFormData={setFormData}
                />

                <div className="space-y-2">
                  <Label htmlFor="socialLinks">Tautan Sosial (Opsional)</Label>
                  <Input
                    id="socialLinks"
                    type="url"
                    value={formData.socialLinks}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: e.target.value,
                      })
                    }
                    placeholder="https://linktr.ee/namaguru"
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="min-w-[180px]"
                  >
                    {isSaving ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Menyimpan...
                      </span>
                    ) : (
                      "Simpan Perubahan"
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
