import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";
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
      toast({
        title: "Gagal",
        description: "Ukuran file terlalu besar. Maksimal 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      const uploadData = new FormData();
      uploadData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      const data = await res.json();

      if (data.success) {
        setFormData({ ...formData, profileImageUrl: data.data.url });
        toast({
          title: "Berhasil",
          description: "Foto profil berhasil diunggah",
        });
      } else {
        throw new Error(data.error || "Gagal mengunggah foto");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Gagal",
        description:
          error instanceof Error
            ? error.message
            : "Gagal mengunggah foto profil",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4 pt-2 border-t mt-4">
      <h3 className="font-semibold text-slate-800">
        Profil Tambahan (Opsional)
      </h3>

      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16 rounded-md">
          <AvatarImage
            src={formData.profileImageUrl || ""}
            alt="Profile Preview"
          />
          <AvatarFallback className="rounded-md bg-slate-100 text-slate-400">
            IMG
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2 flex-1">
          <Label htmlFor="profileImage">Foto Profil</Label>
          <div className="flex items-center gap-2">
            <Input
              id="profileImage"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              onChange={handleImageUpload}
              disabled={isUploading}
            />
            {isUploading && (
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            )}
          </div>
          <p className="text-xs text-slate-500">
            Atau masukkan URL gambar secara manual:
          </p>
          <Input
            id="profileImageUrl"
            value={formData.profileImageUrl || ""}
            onChange={(e) =>
              setFormData({ ...formData, profileImageUrl: e.target.value })
            }
            placeholder="https://example.com/photo.jpg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="positionTitle">Jabatan</Label>
          <Input
            id="positionTitle"
            value={formData.positionTitle || ""}
            onChange={(e) =>
              setFormData({ ...formData, positionTitle: e.target.value })
            }
            placeholder="Mis. Guru BK Kelas X"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Nomor Telepon</Label>
          <Input
            id="phone"
            value={formData.phone || ""}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            placeholder="Mis. 08123456789"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="shortBio">Bio Singkat (Max 160 Karakter)</Label>
        <Input
          id="shortBio"
          maxLength={160}
          value={formData.shortBio || ""}
          onChange={(e) =>
            setFormData({ ...formData, shortBio: e.target.value })
          }
          placeholder="Ringkasan profil..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio Lengkap</Label>
        <Textarea
          id="bio"
          maxLength={2000}
          value={formData.bio || ""}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="Deskripsi lengkap diri..."
          className="resize-none"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="education">Pendidikan</Label>
          <Input
            id="education"
            value={formData.education || ""}
            onChange={(e) =>
              setFormData({ ...formData, education: e.target.value })
            }
            placeholder="S1 Bimbingan Konseling"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expertise">Keahlian</Label>
          <Input
            id="expertise"
            value={formData.expertise || ""}
            onChange={(e) =>
              setFormData({ ...formData, expertise: e.target.value })
            }
            placeholder="Konseling Karir"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="officeLocation">Lokasi Ruang</Label>
          <Input
            id="officeLocation"
            value={formData.officeLocation || ""}
            onChange={(e) =>
              setFormData({ ...formData, officeLocation: e.target.value })
            }
            placeholder="Ruang BK 1, Lantai 1"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="officeHours">Jam Layanan</Label>
          <Input
            id="officeHours"
            value={formData.officeHours || ""}
            onChange={(e) =>
              setFormData({ ...formData, officeHours: e.target.value })
            }
            placeholder="Senin - Jumat, 08:00 - 15:00"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="emailPublic">Email Publik</Label>
        <Input
          id="emailPublic"
          type="email"
          value={formData.emailPublic || ""}
          onChange={(e) =>
            setFormData({ ...formData, emailPublic: e.target.value })
          }
          placeholder="guru@sekolah.id"
        />
      </div>
    </div>
  );
}
