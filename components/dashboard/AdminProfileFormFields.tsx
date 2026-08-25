import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Briefcase, Phone, BookOpen, GraduationCap, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminProfileFormFieldsProps {
  formData: any;
  setFormData: (data: any) => void;
}

export function AdminProfileFormFields({
  formData,
  setFormData,
}: AdminProfileFormFieldsProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Gagal", description: "Ukuran file terlalu besar. Maksimal 5MB", variant: "destructive" });
      return;
    }

    try {
      setIsUploading(true);
      const uploadData = new FormData();
      uploadData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: uploadData });
      const data = await res.json();
      if (data.success) {
        setFormData({ ...formData, profileImageUrl: data.data.url });
        toast({ title: "Berhasil", description: "Foto profil berhasil diunggah" });
      } else {
        throw new Error(data.error || "Gagal mengunggah foto");
      }
    } catch (error) {
      toast({
        title: "Gagal",
        description: error instanceof Error ? error.message : "Gagal mengunggah foto profil",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Foto Profil */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Upload className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-semibold text-slate-700">Foto Profil</span>
        </div>
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20 rounded-xl border-2 border-slate-200 shadow-sm shrink-0">
            <AvatarImage src={formData.profileImageUrl || ""} alt="Preview" className="object-cover" />
            <AvatarFallback className="rounded-xl bg-blue-50 text-blue-400 text-lg font-bold">
              {formData.name ? formData.name.substring(0, 2).toUpperCase() : "BK"}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2 flex-1 min-w-0">
            <label
              htmlFor="profileImage"
              className={`flex items-center justify-center gap-2 w-full h-10 rounded-lg border-2 border-dashed cursor-pointer text-sm font-medium transition-colors
                ${isUploading
                  ? "border-blue-200 text-blue-300 bg-blue-50"
                  : "border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
                }`}
            >
              {isUploading ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Mengunggah...</>
              ) : (
                <><Upload className="h-4 w-4" />Pilih Foto</>
              )}
              <input
                id="profileImage"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
            <p className="text-xs text-slate-400">JPG, PNG, WEBP, GIF — maks. 5MB</p>
            <Input
              value={formData.profileImageUrl || ""}
              onChange={(e) => setFormData({ ...formData, profileImageUrl: e.target.value })}
              placeholder="Atau tempel URL gambar..."
              className="h-9 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Jabatan & Telepon */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Briefcase className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-semibold text-slate-700">Jabatan & Kontak</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="positionTitle" className="text-xs text-slate-600">Jabatan</Label>
            <Input
              id="positionTitle"
              value={formData.positionTitle || ""}
              onChange={(e) => setFormData({ ...formData, positionTitle: e.target.value })}
              placeholder="Guru BK Kelas X"
              className="h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs text-slate-600 flex items-center gap-1">
              <Phone className="h-3 w-3" /> Nomor Telepon
            </Label>
            <Input
              id="phone"
              value={formData.phone || ""}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="08123456789"
              className="h-10"
            />
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-semibold text-slate-700">Bio</span>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="shortBio" className="text-xs text-slate-600">
            Bio Singkat <span className="text-slate-400">({(formData.shortBio || "").length}/160)</span>
          </Label>
          <Input
            id="shortBio"
            maxLength={160}
            value={formData.shortBio || ""}
            onChange={(e) => setFormData({ ...formData, shortBio: e.target.value })}
            placeholder="Ringkasan profil singkat..."
            className="h-10"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bio" className="text-xs text-slate-600">
            Bio Lengkap <span className="text-slate-400">({(formData.bio || "").length}/2000)</span>
          </Label>
          <Textarea
            id="bio"
            maxLength={2000}
            value={formData.bio || ""}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Deskripsi lengkap tentang diri Anda..."
            className="resize-none min-h-[90px]"
            rows={3}
          />
        </div>
      </div>

      {/* Pendidikan & Keahlian */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-semibold text-slate-700">Pendidikan & Keahlian</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="education" className="text-xs text-slate-600">Pendidikan</Label>
            <Input
              id="education"
              value={formData.education || ""}
              onChange={(e) => setFormData({ ...formData, education: e.target.value })}
              placeholder="S1 Bimbingan Konseling"
              className="h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="expertise" className="text-xs text-slate-600 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Keahlian
            </Label>
            <Input
              id="expertise"
              value={formData.expertise || ""}
              onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
              placeholder="Konseling Karir, Mental Health"
              className="h-10"
            />
          </div>
        </div>
      </div>

    </div>
  );
}
