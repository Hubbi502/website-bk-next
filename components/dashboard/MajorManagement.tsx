"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Pencil, Trash2, Library, BookOpen, Hash, AlertTriangle, Search } from "lucide-react";

interface Major {
    id: string;
    name: string;
    code: string;
    _count?: {
        classes: number;
    };
    createdAt: string;
    updatedAt: string;
}

export function MajorManagement() {
    const { toast } = useToast();
    const [majors, setMajors] = useState<Major[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedMajor, setSelectedMajor] = useState<Major | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        code: "",
    });

    const loadMajors = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/majors`);
            const data = await res.json();

            if (data.success) {
                setMajors(data.data);
            } else {
                toast({
                    title: "Error",
                    description: "Gagal memuat data jurusan",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error loading majors:", error);
            toast({
                title: "Error",
                description: "Gagal memuat data jurusan",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadMajors();
    }, [loadMajors]);

    const handleCreateMajor = async () => {
        try {
            if (!formData.name || !formData.code) {
                toast({
                    title: "Error",
                    description: "Nama dan Kode Jurusan wajib diisi",
                    variant: "destructive",
                });
                return;
            }

            const response = await fetch("/api/majors", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Gagal menambahkan jurusan");
            }

            toast({
                title: "Berhasil",
                description: "Jurusan baru berhasil ditambahkan",
            });

            setIsCreateDialogOpen(false);
            setFormData({ name: "", code: "" });
            loadMajors();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Gagal menambahkan jurusan";
            console.error("Error creating major:", error);
            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });
        }
    };

    const handleUpdateMajor = async () => {
        if (!selectedMajor) return;

        try {
            if (!formData.name || !formData.code) {
                toast({
                    title: "Error",
                    description: "Nama dan Kode Jurusan wajib diisi",
                    variant: "destructive",
                });
                return;
            }

            const response = await fetch(`/api/majors/${selectedMajor.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Gagal memperbarui data jurusan");
            }

            toast({
                title: "Berhasil",
                description: "Data jurusan berhasil diperbarui",
            });

            setIsEditDialogOpen(false);
            setSelectedMajor(null);
            setFormData({ name: "", code: "" });
            loadMajors();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Gagal memperbarui jurusan";
            console.error("Error updating major:", error);
            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });
        }
    };

    const handleDeleteMajor = async () => {
        if (!selectedMajor) return;

        try {
            const response = await fetch(`/api/majors/${selectedMajor.id}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Gagal menghapus jurusan");
            }

            toast({
                title: "Berhasil",
                description: "Jurusan berhasil dihapus",
            });

            setIsDeleteDialogOpen(false);
            setSelectedMajor(null);
            loadMajors();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Gagal menghapus jurusan";
            console.error("Error deleting major:", error);
            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });
        }
    };

    const openEditDialog = (major: Major) => {
        setSelectedMajor(major);
        setFormData({
            name: major.name,
            code: major.code,
        });
        setIsEditDialogOpen(true);
    };

    const openDeleteDialog = (major: Major) => {
        setSelectedMajor(major);
        setIsDeleteDialogOpen(true);
    };

    const filteredMajors = majors.filter((m) => 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="space-y-6">
        <Card className="border-none shadow-lg overflow-hidden bg-white/50 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b px-6 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Library className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-800">
                    Manajemen Jurusan
                  </CardTitle>
                  <CardDescription className="text-slate-500">
                    Kelola data jurusan akademik sekolah
                  </CardDescription>
                </div>
              </div>
              <Button
                onClick={() => {
                  setFormData({ name: "", code: "" });
                  setIsCreateDialogOpen(true);
                }}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all hover:scale-105"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Jurusan
              </Button>
            </div>

            {/* Search Bar */}
            <div className="flex mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Cari nama atau kode jurusan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 max-w-md"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p>Memuat data jurusan...</p>
              </div>
            ) : filteredMajors.length === 0 ? (
              <div className="text-center py-16 text-slate-500 flex flex-col items-center gap-3">
                <div className="p-4 bg-slate-50 rounded-full">
                  <Library className="h-8 w-8 text-slate-300" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">
                    Belum ada data jurusan
                  </p>
                  <p className="text-sm">
                    Silakan tambahkan jurusan baru untuk memulai
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="pl-4 sm:pl-6">Nama Jurusan</TableHead>
                      <TableHead>Kode</TableHead>
                      <TableHead>Jumlah Kelas</TableHead>
                      <TableHead className="text-right pr-4 sm:pr-6">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMajors.map((major) => (
                      <TableRow
                        key={major.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <TableCell className="font-medium pl-4 sm:pl-6">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-md bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-700 border border-indigo-200 shrink-0">
                              {major.code}
                            </div>
                            <span>{major.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600 font-mono text-sm">
                          {major.code}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                            {major._count?.classes || 0} Kelas
                          </span>
                        </TableCell>
                        <TableCell className="text-right pr-4 sm:pr-6">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              onClick={() => openEditDialog(major)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:text-red-600 hover:bg-red-50 transition-colors"
                              onClick={() => openDeleteDialog(major)}
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

        {/* Create Major Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="w-[95%] max-w-[400px] p-0 overflow-hidden border-none shadow-xl bg-white rounded-xl">
            <DialogHeader className="p-4 sm:p-6 pb-2 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center">
                  <Library className="h-5 w-5 text-indigo-600" />
                </div>
                <DialogTitle>Tambah Jurusan</DialogTitle>
              </div>
              <DialogDescription>
                Masukkan data jurusan baru ke dalam sistem.
              </DialogDescription>
            </DialogHeader>

            <div className="p-4 sm:p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Jurusan</Label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Rekayasa Perangkat Lunak"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Kode Jurusan</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="Contoh: RPL"
                    className="pl-10"
                    maxLength={10}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="p-4 sm:p-6 pt-2 bg-slate-50 flex-shrink-0">
              <div className="flex w-full justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleCreateMajor} className="bg-indigo-600 hover:bg-indigo-700">
                  Simpan
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Major Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="w-[95%] max-w-[400px] p-0 overflow-hidden border-none shadow-xl bg-white rounded-xl">
            <DialogHeader className="p-4 sm:p-6 pb-2 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <Pencil className="h-5 w-5 text-blue-600" />
                </div>
                <DialogTitle>Edit Jurusan</DialogTitle>
              </div>
              <DialogDescription>
                Perbarui data jurusan.
              </DialogDescription>
            </DialogHeader>

            <div className="p-4 sm:p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nama Jurusan</Label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Rekayasa Perangkat Lunak"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-code">Kode Jurusan</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="edit-code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="Contoh: RPL"
                    className="pl-10"
                    maxLength={10}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="p-4 sm:p-6 pt-2 bg-slate-50 flex-shrink-0">
              <div className="flex w-full justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleUpdateMajor} className="bg-blue-600 hover:bg-blue-700 text-white">
                  Simpan Perubahan
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="w-[95%] sm:max-w-[425px] bg-white rounded-xl">
            <AlertDialogHeader className="flex flex-col items-center text-center">
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <AlertDialogTitle>Hapus Jurusan?</AlertDialogTitle>
              <AlertDialogDescription className="pt-2">
                Anda akan menghapus jurusan <span className="font-semibold text-slate-900">{selectedMajor?.name}</span> ({selectedMajor?.code}).
                <br />
                <span className="text-sm text-slate-500 mt-2 block">
                  Tindakan ini tidak dapat dibatalkan.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:justify-center flex-row gap-2">
              <AlertDialogCancel className="mt-0 flex-1">Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteMajor} className="bg-red-600 hover:bg-red-700 flex-1">
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
}
