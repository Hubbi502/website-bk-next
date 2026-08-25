"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  UserCircle,
  User,
  BookOpen,
  MapPin,
  Mail,
  Link as LinkIcon,
  ShieldCheck,
  Save,
} from "lucide-react";
import { AdminProfileFormFields } from "@/components/dashboard/AdminProfileFormFields";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  name: "", username: "", role: "", profileImageUrl: "",
  shortBio: "", bio: "", positionTitle: "", education: "",
  expertise: "", phone: "", emailPublic: "", officeLocation: "",
  officeHours: "", socialLinks: "",
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

export function ProfileManagement() {
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

  const isSuperAdmin = profile?.role === "SUPER_ADMIN";

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("adminToken");
        const headers: HeadersInit = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const response = await fetch("/api/admins/me", { headers, credentials: "include" });
        const data = await response.json();
        if (!response.ok) {
          if (response.status === 401) { router.push("/login"); return; }
          throw new Error(data?.error || "Gagal memuat profil");
        }
        setProfile(data.data);
        setFormData(mapProfileToFormData(data.data));
      } catch (error) {
        toast({
          title: "Gagal memuat profil",
          description: error instanceof Error ? error.message : "Terjadi kesalahan",
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
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;
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
        method: "PATCH", headers, credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Gagal menyimpan profil");
      setProfile(data.data);
      setFormData(mapProfileToFormData(data.data));
      const storedAdmin = localStorage.getItem("adminData");
      if (storedAdmin) {
        try {
          const parsedAdmin = JSON.parse(storedAdmin);
          localStorage.setItem("adminData", JSON.stringify({
            ...parsedAdmin, name: data.data.name,
            username: data.data.username, role: data.data.role,
          }));
        } catch { /* ignore */ }
      }
      toast({ title: "Profil tersimpan", description: "Perubahan berhasil disimpan." });
    } catch (error) {
      toast({
        title: "Gagal menyimpan profil",
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <Skeleton className="h-52 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-8">

      {/* Hero Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-xl">
        {/* decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

        <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-end gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-white/30 shadow-2xl">
              <AvatarImage src={formData.profileImageUrl || undefined} alt={formData.name} className="object-cover" />
              <AvatarFallback className="bg-blue-500 text-white text-3xl font-bold">
                {formData.name ? formData.name.substring(0, 2).toUpperCase() : <UserCircle className="h-12 w-12" />}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-green-400 border-2 border-white shadow" title="Aktif" />
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left text-white min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold truncate">{formData.name || "—"}</h1>
            <p className="text-blue-200 mt-1 text-sm">{formData.positionTitle || "Guru Bimbingan & Konseling"}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
              <Badge className={`text-xs font-semibold px-3 py-1 ${isSuperAdmin ? "bg-amber-400 text-amber-900 hover:bg-amber-400" : "bg-white/20 text-white hover:bg-white/20"}`}>
                {isSuperAdmin ? "Koordinator" : "Guru BK"}
              </Badge>
              <Badge className="bg-white/20 text-white hover:bg-white/20 text-xs px-3 py-1">
                @{formData.username}
              </Badge>
              {formData.officeLocation && (
                <Badge className="bg-white/20 text-white hover:bg-white/20 text-xs px-3 py-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {formData.officeLocation}
                </Badge>
              )}
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="shrink-0 bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-lg px-6"
          >
            {isSaving ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Menyimpan...</>
            ) : (
              <><Save className="h-4 w-4 mr-2" />Simpan</>
            )}
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — 2 cols */}
        <div className="lg:col-span-2 space-y-5">

          {/* Informasi Akun */}
          <Card className="border-0 shadow-md overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 py-4 px-5">
              <CardTitle className="text-white flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4" />
                Informasi Akun
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <p className="text-xs text-slate-500 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Username tidak dapat diubah melalui halaman ini.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-semibold text-slate-700">Nama Lengkap</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Masukkan nama lengkap"
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="username" className="text-sm font-semibold text-slate-700">Username</Label>
                  <Input id="username" value={formData.username} disabled className="h-10 bg-slate-50 text-slate-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          <Card className="border-0 shadow-md overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 py-4 px-5">
              <CardTitle className="text-white flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Profil & Bio
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <AdminProfileFormFields formData={formData} setFormData={setFormData} />
            </CardContent>
          </Card>

        </div>

        {/* Right — 1 col */}
        <div className="space-y-5">

          {/* Kontak */}
          <Card className="border-0 shadow-md overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 py-4 px-5">
              <CardTitle className="text-white flex items-center gap-2 text-base">
                <Mail className="h-4 w-4" />
                Kontak
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="emailPublic" className="text-sm font-semibold text-slate-700">Email Publik</Label>
                <Input
                  id="emailPublic"
                  type="email"
                  value={formData.emailPublic}
                  onChange={(e) => setFormData({ ...formData, emailPublic: e.target.value })}
                  placeholder="guru@sekolah.id"
                  className="h-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Ruangan */}
          <Card className="border-0 shadow-md overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-violet-600 to-purple-600 py-4 px-5">
              <CardTitle className="text-white flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4" />
                Lokasi & Jam Layanan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="officeLocation" className="text-sm font-semibold text-slate-700">Lokasi Ruang</Label>
                <Input
                  id="officeLocation"
                  value={formData.officeLocation}
                  onChange={(e) => setFormData({ ...formData, officeLocation: e.target.value })}
                  placeholder="Ruang BK 1, Lantai 1"
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="officeHours" className="text-sm font-semibold text-slate-700">Jam Layanan</Label>
                <Input
                  id="officeHours"
                  value={formData.officeHours}
                  onChange={(e) => setFormData({ ...formData, officeHours: e.target.value })}
                  placeholder="Senin - Jumat, 08:00 - 15:00"
                  className="h-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Tautan */}
          <Card className="border-0 shadow-md overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-600 py-4 px-5">
              <CardTitle className="text-white flex items-center gap-2 text-base">
                <LinkIcon className="h-4 w-4" />
                Tautan Sosial
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-1.5">
                <Label htmlFor="socialLinks" className="text-sm font-semibold text-slate-700">URL Profil / Linktree</Label>
                <Input
                  id="socialLinks"
                  type="url"
                  value={formData.socialLinks}
                  onChange={(e) => setFormData({ ...formData, socialLinks: e.target.value })}
                  placeholder="https://linktr.ee/namaguru"
                  className="h-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Save sticky bottom on mobile */}
          <div className="lg:hidden">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-12 shadow-lg"
            >
              {isSaving ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Menyimpan...</>
              ) : (
                <><Save className="h-4 w-4 mr-2" />Simpan Perubahan</>
              )}
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
