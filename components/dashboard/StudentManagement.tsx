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
import {
    Plus,
    Pencil,
    Trash2,
    GraduationCap,
    User,
    Key,
    AlertTriangle,
    Search,
    Phone,
    Hash,
} from "lucide-react";

interface Student {
    id: string;
    name: string;
    nisn: string;
    class: string;
    phone: string | null;
    createdAt: string;
    updatedAt: string;
}

interface StudentManagementProps {
    adminData: {
        id: string;
        role: "ADMIN" | "SUPER_ADMIN";
        assignedClasses: string[];
    };
}

// Generate all class names
const grades = ["X", "XI", "XII", "XIII"];
const majors = ["RPL", "DKV", "SIJA"];
const classNumbers = [1, 2];
const ALL_CLASSES: string[] = [];
for (const grade of grades) {
    for (const major of majors) {
        for (const num of classNumbers) {
            ALL_CLASSES.push(`${grade} ${major} ${num}`);
        }
    }
}

export function StudentManagement({ adminData }: StudentManagementProps) {
    const { toast } = useToast();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [classFilter, setClassFilter] = useState("all");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        nisn: "",
        password: "",
        class: "",
        phone: "",
    });

    const availableClasses =
        adminData.role === "SUPER_ADMIN" ? ALL_CLASSES : (adminData.assignedClasses || []);

    const loadStudents = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                teacherId: adminData.id,
                role: adminData.role,
            });
            if (searchQuery) params.set("search", searchQuery);
            if (classFilter !== "all") params.set("class", classFilter);

            const res = await fetch(`/api/students?${params}`);
            const data = await res.json();

            if (data.success) {
                setStudents(data.data);
            } else {
                toast({
                    title: "Error",
                    description: "Gagal memuat data siswa",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error loading students:", error);
            toast({
                title: "Error",
                description: "Gagal memuat data siswa",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [adminData.id, adminData.role, searchQuery, classFilter, toast]);

    useEffect(() => {
        loadStudents();
    }, [loadStudents]);

    const handleCreateStudent = async () => {
        try {
            if (!formData.name || !formData.nisn || !formData.password || !formData.class) {
                toast({
                    title: "Error",
                    description: "Nama, NISN, Password, dan Kelas wajib diisi",
                    variant: "destructive",
                });
                return;
            }

            const response = await fetch("/api/students", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    class: formData.class,
                    teacherId: adminData.id,
                    role: adminData.role,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Gagal menambahkan siswa");
            }

            toast({
                title: "Berhasil",
                description: "Siswa baru berhasil ditambahkan",
            });

            setIsCreateDialogOpen(false);
            setFormData({ name: "", nisn: "", password: "", class: "", phone: "" });
            loadStudents();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Gagal menambahkan siswa";
            console.error("Error creating student:", error);
            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });
        }
    };

    const handleUpdateStudent = async () => {
        if (!selectedStudent) return;

        try {
            const response = await fetch(`/api/students/${selectedStudent.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    class: formData.class,
                    teacherId: adminData.id,
                    role: adminData.role,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Gagal memperbarui data siswa");
            }

            toast({
                title: "Berhasil",
                description: "Data siswa berhasil diperbarui",
            });

            setIsEditDialogOpen(false);
            setSelectedStudent(null);
            setFormData({ name: "", nisn: "", password: "", class: "", phone: "" });
            loadStudents();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Gagal memperbarui siswa";
            console.error("Error updating student:", error);
            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });
        }
    };

    const handleDeleteStudent = async () => {
        if (!selectedStudent) return;

        try {
            const params = new URLSearchParams({
                teacherId: adminData.id,
                role: adminData.role,
            });

            const response = await fetch(
                `/api/students/${selectedStudent.id}?${params}`,
                { method: "DELETE" }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Gagal menghapus siswa");
            }

            toast({
                title: "Berhasil",
                description: "Siswa berhasil dihapus",
            });

            setIsDeleteDialogOpen(false);
            setSelectedStudent(null);
            loadStudents();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Gagal menghapus siswa";
            console.error("Error deleting student:", error);
            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });
        }
    };

    const openEditDialog = (student: Student) => {
        setSelectedStudent(student);
        setFormData({
            name: student.name,
            nisn: student.nisn,
            password: "",
            class: typeof student.class === 'object' ? (student.class as any).name : student.class,
            phone: student.phone || "",
        });
        setIsEditDialogOpen(true);
    };

    const openDeleteDialog = (student: Student) => {
        setSelectedStudent(student);
        setIsDeleteDialogOpen(true);
    };

    return (
      <div className="space-y-6">
        <Card className="border-none shadow-lg overflow-hidden bg-white/50 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b px-6 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-800">
                    Manajemen Siswa
                  </CardTitle>
                  <CardDescription className="text-slate-500">
                    Kelola data siswa{" "}
                    {adminData.role === "ADMIN"
                      ? "di kelas Anda"
                      : "seluruh sekolah"}
                  </CardDescription>
                </div>
              </div>
              <Button
                onClick={() => {
                  setFormData({
                    name: "",
                    nisn: "",
                    password: "",
                    class: "",
                    phone: "",
                  });
                  setIsCreateDialogOpen(true);
                }}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all hover:scale-105"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Siswa
              </Button>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Cari nama atau NISN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Semua Kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kelas</SelectItem>
                  {availableClasses.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                <p>Memuat data siswa...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-16 text-slate-500 flex flex-col items-center gap-3">
                <div className="p-4 bg-slate-50 rounded-full">
                  <GraduationCap className="h-8 w-8 text-slate-300" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">
                    Belum ada data siswa
                  </p>
                  <p className="text-sm">
                    Silakan tambahkan siswa baru untuk memulai
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="w-[200px] pl-4 sm:pl-6">
                        Nama
                      </TableHead>
                      <TableHead>NISN</TableHead>
                      <TableHead>Kelas</TableHead>
                      <TableHead className="hidden md:table-cell">
                        No. HP
                      </TableHead>
                      <TableHead className="text-right pr-4 sm:pr-6">
                        Aksi
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow
                        key={student.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <TableCell className="font-medium pl-4 sm:pl-6">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-xs font-bold text-emerald-700 border border-emerald-200 shrink-0">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span>{student.name}</span>
                              <span className="text-xs text-slate-500 md:hidden">
                                {student.phone || "-"}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600 font-mono text-sm">
                          {student.nisn}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            {typeof student.class === 'object' ? (student.class as any).name : student.class}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-600 hidden md:table-cell">
                          {student.phone || "-"}
                        </TableCell>
                        <TableCell className="text-right pr-4 sm:pr-6">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              onClick={() => openEditDialog(student)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:text-red-600 hover:bg-red-50 transition-colors"
                              onClick={() => openDeleteDialog(student)}
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

        {/* Create Student Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="w-[95%] max-w-[500px] p-0 max-h-[90vh] flex flex-col overflow-hidden border-none shadow-xl bg-white rounded-xl">
            <DialogHeader className="p-4 sm:p-6 pb-2 bg-slate-50 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center">
                  <User className="h-5 w-5 text-emerald-600" />
                </div>
                <DialogTitle className="text-lg sm:text-xl">
                  Tambah Siswa Baru
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs sm:text-sm">
                Masukkan data siswa baru untuk mendaftarkan ke dalam sistem.
              </DialogDescription>
            </DialogHeader>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto w-full">
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-slate-900 dark:text-slate-900"
                >
                  Nama Lengkap
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Masukkan nama lengkap"
                    className="pl-10 focus-visible:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="nisn"
                    className="text-sm font-medium text-slate-900 dark:text-slate-900"
                  >
                    NISN
                  </Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="nisn"
                      value={formData.nisn}
                      onChange={(e) =>
                        setFormData({ ...formData, nisn: e.target.value })
                      }
                      placeholder="Nomor NISN"
                      className="pl-10 focus-visible:ring-emerald-500/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="class"
                    className="text-sm font-medium text-slate-900 dark:text-slate-900"
                  >
                    Kelas
                  </Label>
                  <Select
                    value={formData.class}
                    onValueChange={(val) =>
                      setFormData({ ...formData, class: val })
                    }
                  >
                    <SelectTrigger
                      id="class"
                      className="pl-10 relative focus:ring-emerald-500/20"
                    >
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <SelectValue placeholder="Pilih kelas" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableClasses.map((cls) => (
                        <SelectItem key={cls} value={cls}>
                          {cls}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-900 dark:text-slate-900"
                >
                  Password
                </Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Buat password"
                    className="pl-10 focus-visible:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-sm font-medium text-slate-900 dark:text-slate-900"
                >
                  No. HP{" "}
                  <span className="text-slate-400 font-normal text-xs ml-1">
                    (Opsional)
                  </span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="08xxxxxxxxxx"
                    className="pl-10 focus-visible:ring-emerald-500/20"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="p-4 sm:p-6 pt-2 pb-4 bg-slate-50/50 flex-shrink-0">
              <div className="flex w-full justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="hover:bg-slate-100 flex-1 sm:flex-none"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleCreateStudent}
                  className="bg-emerald-600 hover:bg-emerald-700 shadow-sm flex-1 sm:flex-none"
                >
                  Simpan Siswa
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Student Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="w-[95%] max-w-[500px] p-0 max-h-[90vh] flex flex-col overflow-hidden border-none shadow-xl bg-white rounded-xl">
            <DialogHeader className="p-4 sm:p-6 pb-2 bg-slate-50 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <Pencil className="h-5 w-5 text-blue-600" />
                </div>
                <DialogTitle className="text-lg sm:text-xl">
                  Edit Data Siswa
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs sm:text-sm">
                Perbarui informasi untuk{" "}
                <span className="font-medium text-slate-800">
                  {selectedStudent?.name}
                </span>
                .
              </DialogDescription>
            </DialogHeader>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto w-full">
              <div className="space-y-2">
                <Label
                  htmlFor="edit-name"
                  className="text-sm font-medium text-slate-900 dark:text-slate-900"
                >
                  Nama Lengkap
                </Label>
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
                  <Label
                    htmlFor="edit-nisn"
                    className="text-sm font-medium text-slate-900 dark:text-slate-900"
                  >
                    NISN
                  </Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="edit-nisn"
                      value={formData.nisn}
                      onChange={(e) =>
                        setFormData({ ...formData, nisn: e.target.value })
                      }
                      placeholder="Nomor NISN"
                      className="pl-10 focus-visible:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="edit-class"
                    className="text-sm font-medium text-slate-900 dark:text-slate-900"
                  >
                    Kelas
                  </Label>
                  <Select
                    value={formData.class}
                    onValueChange={(val) =>
                      setFormData({ ...formData, class: val })
                    }
                  >
                    <SelectTrigger
                      id="edit-class"
                      className="pl-10 relative focus:ring-blue-500/20"
                    >
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <SelectValue placeholder="Pilih kelas" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableClasses.map((cls) => (
                        <SelectItem key={cls} value={cls}>
                          {cls}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="edit-password"
                  className="text-sm font-medium text-slate-900 dark:text-slate-900"
                >
                  Password Baru{" "}
                  <span className="text-slate-400 font-normal text-xs ml-1">
                    (Opsional)
                  </span>
                </Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
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

              <div className="space-y-2">
                <Label
                  htmlFor="edit-phone"
                  className="text-sm font-medium text-slate-900 dark:text-slate-900"
                >
                  No. HP{" "}
                  <span className="text-slate-400 font-normal text-xs ml-1">
                    (Opsional)
                  </span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="edit-phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="08xxxxxxxxxx"
                    className="pl-10 focus-visible:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="p-4 sm:p-6 pt-2 pb-4 bg-slate-50/50 flex-shrink-0">
              <div className="flex w-full justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="hover:bg-slate-100 flex-1 sm:flex-none"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleUpdateStudent}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex-1 sm:flex-none"
                >
                  Simpan Perubahan
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent className="w-[95%] sm:max-w-[425px] bg-white rounded-xl">
            <AlertDialogHeader className="flex flex-col items-center justify-center text-center sm:text-center">
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <AlertDialogTitle className="text-xl">
                Hapus Siswa?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center pt-2">
                Anda akan menghapus siswa{" "}
                <span className="font-semibold text-slate-900">
                  {selectedStudent?.name}
                </span>{" "}
                (NISN: {selectedStudent?.nisn}).
                <br />
                <span className="text-sm text-slate-500 mt-2 block">
                  Tindakan ini tidak dapat dibatalkan. Data yang dihapus tidak
                  dapat dipulihkan kembali.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="sm:justify-center gap-2 pt-4">
              <AlertDialogCancel className="w-full sm:w-auto">
                Batalkan
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteStudent}
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
