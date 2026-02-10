"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Pencil, Trash2, ShieldCheck, Shield, User, Lock, Key, AlertTriangle, Search } from "lucide-react";

interface Admin {
  id: string;
  name: string;
  username: string;
  role: "ADMIN" | "SUPER_ADMIN";
  createdAt: string;
  updatedAt: string;
  _count?: {
    articles: number;
    visits: number;
  };
}

interface AdminManagementProps {
  currentAdminId: string;
}

export function AdminManagement({ currentAdminId }: AdminManagementProps) {
  const { toast } = useToast();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    role: "ADMIN" as "ADMIN" | "SUPER_ADMIN",
  });

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admins", {
        headers: {
          Authorization: `Bearer ${currentAdminId}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch admins");
      }

      const data = await response.json();
      setAdmins(data.data);
    } catch (error) {
      console.error("Error loading admins:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data admin",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    try {
      if (!formData.name || !formData.username || !formData.password) {
        toast({
          title: "Error",
          description: "Semua field harus diisi",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("/api/admins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentAdminId}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create admin");
      }

      toast({
        title: "Berhasil",
        description: "Admin baru berhasil ditambahkan",
      });

      setIsCreateDialogOpen(false);
      setFormData({ name: "", username: "", password: "", role: "ADMIN" });
      loadAdmins();
    } catch (error: any) {
      console.error("Error creating admin:", error);
      toast({
        title: "Error",
        description: error.message || "Gagal menambahkan admin",
        variant: "destructive",
      });
    }
  };

  const handleUpdateAdmin = async () => {
    if (!selectedAdmin) return;

    try {
      const updateData: any = {
        name: formData.name,
        username: formData.username,
        role: formData.role,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch(`/api/admins/${selectedAdmin.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentAdminId}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update admin");
      }

      toast({
        title: "Berhasil",
        description: "Data admin berhasil diperbarui",
      });

      setIsEditDialogOpen(false);
      setSelectedAdmin(null);
      setFormData({ name: "", username: "", password: "", role: "ADMIN" });
      loadAdmins();
    } catch (error: any) {
      console.error("Error updating admin:", error);
      toast({
        title: "Error",
        description: error.message || "Gagal memperbarui admin",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return;

    try {
      const response = await fetch(`/api/admins/${selectedAdmin.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${currentAdminId}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete admin");
      }

      toast({
        title: "Berhasil",
        description: "Admin berhasil dihapus",
      });

      setIsDeleteDialogOpen(false);
      setSelectedAdmin(null);
      loadAdmins();
    } catch (error: any) {
      console.error("Error deleting admin:", error);
      toast({
        title: "Error",
        description: error.message || "Gagal menghapus admin",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (admin: Admin) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name,
      username: admin.username,
      password: "",
      role: admin.role,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (admin: Admin) => {
    setSelectedAdmin(admin);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-lg overflow-hidden bg-white/50 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-800">Manajemen Admin</CardTitle>
                <CardDescription className="text-slate-500">
                  Kelola akun admin dan hak akses sistem
                </CardDescription>
              </div>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="w-full sm:w-auto bg-primary hover:bg-primary/90 shadow-md transition-all hover:scale-105">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Admin
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p>Memuat data admin...</p>
            </div>
          ) : admins.length === 0 ? (
            <div className="text-center py-16 text-slate-500 flex flex-col items-center gap-3">
              <div className="p-4 bg-slate-50 rounded-full">
                <Shield className="h-8 w-8 text-slate-300" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Belum ada data admin</p>
                <p className="text-sm">Silakan tambahkan admin baru untuk memulai</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="w-[200px] pl-4 sm:pl-6">Nama</TableHead>
                    <TableHead className="hidden md:table-cell">Username</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-center hidden lg:table-cell">Artikel</TableHead>
                    <TableHead className="text-center hidden lg:table-cell">Kunjungan</TableHead>
                    <TableHead className="hidden xl:table-cell">Bergabung</TableHead>
                    <TableHead className="text-right pr-4 sm:pr-6">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((admin) => (
                    <TableRow key={admin.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-medium pl-4 sm:pl-6">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-200 shrink-0">
                            {admin.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span>{admin.name}</span>
                            <span className="text-xs text-slate-500 md:hidden">@{admin.username}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 hidden md:table-cell">@{admin.username}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            admin.role === "SUPER_ADMIN" ? "default" : "secondary"
                          }
                          className={`gap-1.5 pl-1.5 pr-2.5 py-0.5 border ${admin.role === "SUPER_ADMIN"
                              ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200"
                            }`}
                        >
                          {admin.role === "SUPER_ADMIN" ? (
                            <ShieldCheck className="h-3.5 w-3.5" />
                          ) : (
                            <Shield className="h-3.5 w-3.5" />
                          )}
                          <span className="hidden sm:inline">{admin.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}</span>
                          <span className="sm:hidden">{admin.role === "SUPER_ADMIN" ? "SA" : "Adm"}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center hidden lg:table-cell">
                        <Badge variant="outline" className="font-normal">
                          {admin._count?.articles || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center hidden lg:table-cell">
                        <Badge variant="outline" className="font-normal">
                          {admin._count?.visits || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm hidden xl:table-cell">
                        {new Date(admin.createdAt).toLocaleDateString("id-ID", {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell className="text-right pr-4 sm:pr-6">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            onClick={() => openEditDialog(admin)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:text-red-600 hover:bg-red-50 transition-colors"
                            onClick={() => openDeleteDialog(admin)}
                            disabled={admin.id === currentAdminId}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Admin Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-xl">
          <DialogHeader className="p-6 pb-2 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <DialogTitle className="text-xl">Tambah Admin Baru</DialogTitle>
            </div>
            <DialogDescription>
              Buat akun admin baru untuk mengakses sistem dashboard.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-slate-700">Nama Lengkap</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Masukkan nama lengkap"
                  className="pl-10 focus-visible:ring-primary/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-slate-700">Username</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 flex items-center justify-center text-slate-400 font-bold text-xs">@</div>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    placeholder="Username"
                    className="pl-9 focus-visible:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium text-slate-700">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: "ADMIN" | "SUPER_ADMIN") =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger className="focus:ring-primary/20">
                    <div className="flex items-center gap-2">
                      {formData.role === "SUPER_ADMIN" ? (
                        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <Shield className="h-3.5 w-3.5 text-slate-500" />
                      )}
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">
                      <div className="flex items-center gap-2">
                        <Shield className="h-3.5 w-3.5 text-slate-500" />
                        <span>Admin</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="SUPER_ADMIN">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                        <span>Super Admin</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Buat password yang kuat"
                  className="pl-10 focus-visible:ring-primary/20"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 pt-2 bg-slate-50/50">
            <div className="flex w-full justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                className="hover:bg-slate-100"
              >
                Batal
              </Button>
              <Button
                onClick={handleCreateAdmin}
                className="bg-primary hover:bg-primary/90 shadow-sm"
              >
                Simpan Admin
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Admin Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-xl">
          <DialogHeader className="p-6 pb-2 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Pencil className="h-5 w-5 text-blue-600" />
              </div>
              <DialogTitle className="text-xl">Edit Data Admin</DialogTitle>
            </div>
            <DialogDescription>
              Perbarui informasi untuk <span className="font-medium text-slate-800">{selectedAdmin?.name}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-sm font-medium text-slate-700">Nama Lengkap</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Masukkan nama lengkap"
                  className="pl-10 focus-visible:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-username" className="text-sm font-medium text-slate-700">Username</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 flex items-center justify-center text-slate-400 font-bold text-xs">@</div>
                  <Input
                    id="edit-username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    placeholder="Username"
                    className="pl-9 focus-visible:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-role" className="text-sm font-medium text-slate-700">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: "ADMIN" | "SUPER_ADMIN") =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger className="focus:ring-blue-500/20">
                    <div className="flex items-center gap-2">
                      {formData.role === "SUPER_ADMIN" ? (
                        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <Shield className="h-3.5 w-3.5 text-slate-500" />
                      )}
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">
                      <div className="flex items-center gap-2">
                        <Shield className="h-3.5 w-3.5 text-slate-500" />
                        <span>Admin</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="SUPER_ADMIN">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                        <span>Super Admin</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-password" className="text-sm font-medium text-slate-700">
                Password Baru <span className="text-slate-400 font-normal text-xs ml-1">(Opsional)</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="edit-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Kosongkan jika tidak ubah"
                  className="pl-10 focus-visible:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 pt-2 bg-slate-50/50">
            <div className="flex w-full justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="hover:bg-slate-100"
              >
                Batal
              </Button>
              <Button
                onClick={handleUpdateAdmin}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                Simpan Perubahan
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-[425px] bg-white">
          <AlertDialogHeader className="flex flex-col items-center justify-center text-center sm:text-center">
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-xl">Hapus Admin?</AlertDialogTitle>
            <AlertDialogDescription className="text-center pt-2">
              Anda akan menghapus admin <span className="font-semibold text-slate-900">{selectedAdmin?.name}</span>.
              <br />
              <span className="text-sm text-slate-500 mt-2 block">
                Tindakan ini tidak dapat dibatalkan. Data yang dihapus tidak dapat dipulihkan kembali.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="sm:justify-center gap-2 pt-4">
            <AlertDialogCancel className="w-full sm:w-auto">Batalkan</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAdmin}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
