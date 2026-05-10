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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Pencil, Trash2, Library, BookOpen, Hash, AlertTriangle, Search, School } from "lucide-react";

interface Major {
    id: string;
    name: string;
    code: string;
}

interface ClassModel {
    id: string;
    name: string;
    majorId: string;
    major?: Major;
    _count?: {
        students: number;
    };
    createdAt: string;
    updatedAt: string;
}

export function ClassManagement() {
    const { toast } = useToast();
    const [classes, setClasses] = useState<ClassModel[]>([]);
    const [majors, setMajors] = useState<Major[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState<ClassModel | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        majorId: "",
    });

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [classRes, majorRes] = await Promise.all([
                fetch(`/api/classes`),
                fetch(`/api/majors`)
            ]);
            
            const classData = await classRes.json();
            const majorData = await majorRes.json();

            if (classData.success) {
                setClasses(classData.data);
            }
            if (majorData.success) {
                setMajors(majorData.data);
            }
        } catch (error) {
            console.error("Error loading data:", error);
            toast({
                title: "Error",
                description: "Gagal memuat data kelas atau jurusan",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleCreateClass = async () => {
        try {
            if (!formData.name || !formData.majorId) {
                toast({
                    title: "Error",
                    description: "Nama Kelas dan Jurusan wajib diisi",
                    variant: "destructive",
                });
                return;
            }

            const response = await fetch("/api/classes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Gagal menambahkan kelas");
            }

            toast({
                title: "Berhasil",
                description: "Kelas baru berhasil ditambahkan",
            });

            setIsCreateDialogOpen(false);
            setFormData({ name: "", majorId: "" });
            loadData();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Gagal menambahkan kelas";
            console.error("Error creating class:", error);
            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });
        }
    };

    const handleUpdateClass = async () => {
        if (!selectedClass) return;

        try {
            if (!formData.name || !formData.majorId) {
                toast({
                    title: "Error",
                    description: "Nama Kelas dan Jurusan wajib diisi",
                    variant: "destructive",
                });
                return;
            }

            const response = await fetch(`/api/classes/${selectedClass.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Gagal memperbarui data kelas");
            }

            toast({
                title: "Berhasil",
                description: "Data kelas berhasil diperbarui",
            });

            setIsEditDialogOpen(false);
            setSelectedClass(null);
            setFormData({ name: "", majorId: "" });
            loadData();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Gagal memperbarui kelas";
            console.error("Error updating class:", error);
            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });
        }
    };

    const handleDeleteClass = async () => {
        if (!selectedClass) return;

        try {
            const response = await fetch(`/api/classes/${selectedClass.id}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Gagal menghapus kelas");
            }

            toast({
                title: "Berhasil",
                description: "Kelas berhasil dihapus",
            });

            setIsDeleteDialogOpen(false);
            setSelectedClass(null);
            loadData();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Gagal menghapus kelas";
            console.error("Error deleting class:", error);
            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });
        }
    };

    const openEditDialog = (cls: ClassModel) => {
        setSelectedClass(cls);
        setFormData({
            name: cls.name,
            majorId: cls.majorId,
        });
        setIsEditDialogOpen(true);
    };

    const openDeleteDialog = (cls: ClassModel) => {
        setSelectedClass(cls);
        setIsDeleteDialogOpen(true);
    };

    const filteredClasses = classes.filter((c) => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.major?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="space-y-6">
        <Card className="border-none shadow-lg overflow-hidden bg-white/50 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b px-6 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <School className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-800">
                    Manajemen Kelas
                  </CardTitle>
                  <CardDescription className="text-slate-500">
                    Kelola data kelas akademik sekolah
                  </CardDescription>
                </div>
              </div>
              <Button
                onClick={() => {
                  setFormData({ name: "", majorId: "" });
                  setIsCreateDialogOpen(true);
                }}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all hover:scale-105"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Kelas
              </Button>
            </div>

            {/* Search Bar */}
            <div className="flex mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Cari nama kelas atau jurusan..."
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
                <p>Memuat data kelas...</p>
              </div>
            ) : filteredClasses.length === 0 ? (
              <div className="text-center py-16 text-slate-500 flex flex-col items-center gap-3">
                <div className="p-4 bg-slate-50 rounded-full">
                  <School className="h-8 w-8 text-slate-300" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">
                    Belum ada data kelas
                  </p>
                  <p className="text-sm">
                    Silakan tambahkan kelas baru untuk memulai
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="pl-4 sm:pl-6">Nama Kelas</TableHead>
                      <TableHead>Jurusan</TableHead>
                      <TableHead>Jumlah Siswa</TableHead>
                      <TableHead className="text-right pr-4 sm:pr-6">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClasses.map((cls) => (
                      <TableRow
                        key={cls.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <TableCell className="font-medium pl-4 sm:pl-6">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-md bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-700 border border-indigo-200 shrink-0">
                              <BookOpen className="h-4 w-4" />
                            </div>
                            <span>{cls.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                             <span className="text-slate-600 text-sm">
                               {cls.major?.name || "-"}
                             </span>
                             {cls.major && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700">
                                    {cls.major.code}
                                </span>
                             )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                            {cls._count?.students || 0} Siswa
                          </span>
                        </TableCell>
                        <TableCell className="text-right pr-4 sm:pr-6">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              onClick={() => openEditDialog(cls)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:text-red-600 hover:bg-red-50 transition-colors"
                              onClick={() => openDeleteDialog(cls)}
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

        {/* Create Class Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="w-[95%] max-w-[400px] p-0 overflow-hidden border-none shadow-xl bg-white rounded-xl">
            <DialogHeader className="p-4 sm:p-6 pb-2 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center">
                  <School className="h-5 w-5 text-indigo-600" />
                </div>
                <DialogTitle>Tambah Kelas</DialogTitle>
              </div>
              <DialogDescription>
                Masukkan data kelas baru ke dalam sistem.
              </DialogDescription>
            </DialogHeader>

            <div className="p-4 sm:p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Kelas</Label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: XII RPL 1"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="major">Jurusan</Label>
                <Select value={formData.majorId} onValueChange={(val) => setFormData({ ...formData, majorId: val })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Jurusan" />
                  </SelectTrigger>
                  <SelectContent>
                    {majors.map((major) => (
                        <SelectItem key={major.id} value={major.id}>{major.name} ({major.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="p-4 sm:p-6 pt-2 bg-slate-50 flex-shrink-0">
              <div className="flex w-full justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleCreateClass} className="bg-indigo-600 hover:bg-indigo-700">
                  Simpan
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Class Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="w-[95%] max-w-[400px] p-0 overflow-hidden border-none shadow-xl bg-white rounded-xl">
            <DialogHeader className="p-4 sm:p-6 pb-2 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <Pencil className="h-5 w-5 text-blue-600" />
                </div>
                <DialogTitle>Edit Kelas</DialogTitle>
              </div>
              <DialogDescription>
                Perbarui data kelas.
              </DialogDescription>
            </DialogHeader>

            <div className="p-4 sm:p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nama Kelas</Label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: XII RPL 1"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-major">Jurusan</Label>
                <Select value={formData.majorId} onValueChange={(val) => setFormData({ ...formData, majorId: val })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Jurusan" />
                  </SelectTrigger>
                  <SelectContent>
                    {majors.map((major) => (
                        <SelectItem key={major.id} value={major.id}>{major.name} ({major.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="p-4 sm:p-6 pt-2 bg-slate-50 flex-shrink-0">
              <div className="flex w-full justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleUpdateClass} className="bg-blue-600 hover:bg-blue-700 text-white">
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
              <AlertDialogTitle>Hapus Kelas?</AlertDialogTitle>
              <AlertDialogDescription className="pt-2">
                Anda akan menghapus kelas <span className="font-semibold text-slate-900">{selectedClass?.name}</span>.
                <br />
                <span className="text-sm text-slate-500 mt-2 block">
                  Tindakan ini tidak dapat dibatalkan.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:justify-center flex-row gap-2">
              <AlertDialogCancel className="mt-0 flex-1">Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteClass} className="bg-red-600 hover:bg-red-700 flex-1">
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
}
