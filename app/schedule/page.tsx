"use client"
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, CheckCircle2, XCircle, AlertCircle, Send, LogOut } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Link from "next/link";
interface Visit {
  id: string;
  studentName: string;
  class: string;
  email?: string;
  phone?: string;
  visitDate: string;
  visitTime: string;
  reason: string;
  status: "pending" | "approved" | "forwarded" | "completed" | "cancelled";
  notes?: string;
  approvedBy?: string;
  targetTeacherId?: string;
  targetTeacher?: {
    id: string;
    name: string;
    role: string;
  };
  forwardedToCoordinator?: boolean;
  delegatedToTeacherId?: string;
  delegatedToTeacher?: {
    id: string;
    name: string;
    role: string;
  };
  delegationStatus?: string | null;
  createdAt: string;
  updatedAt?: string;
}

interface Teacher {
  id: string;
  name: string;
  role: string;
  assignedClasses: string[];
}

const Schedule = () => {
  const [myVisits, setMyVisits] = useState<Visit[]>([]);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [studentData, setStudentData] = useState<any>(null);
  const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");

  // Form state untuk kunjungan baru
  const [visitForm, setVisitForm] = useState({
    studentName: "",
    class: "",
    email: "",
    phone: "",
    visitDate: "",
    visitTime: "",
    reason: "",
  });

  // Check if student is logged in
  useEffect(() => {
    const savedStudent = localStorage.getItem("studentData");
    if (savedStudent) {
      const data = JSON.parse(savedStudent);
      setStudentData(data);
    }
  }, []);

  // Auto-fill form when dialog opens or studentData changes
  useEffect(() => {
    if (isBookingOpen && studentData) {
      setVisitForm(prev => ({
        ...prev,
        studentName: studentData.name || "",
        class: studentData.class || "",
        email: "", // Student tidak punya email, menggunakan NISN
        phone: studentData.phone || "",
      }));

      // Fetch available teachers for student's class
      const fetchTeachers = async () => {
        try {
          const response = await fetch(`/api/teachers?class=${encodeURIComponent(studentData.class)}`);
          const data = await response.json();
          if (data.success) {
            setAvailableTeachers(data.data);
          }
        } catch (error) {
          console.error("Error fetching teachers:", error);
        }
      };
      fetchTeachers();
    }
  }, [isBookingOpen, studentData]);

  // Load visits saat komponen dimount atau saat studentData berubah
  useEffect(() => {
    loadVisits();
  }, [studentData]);

  const loadVisits = async () => {
    try {
      // Hanya fetch kunjungan milik user jika sudah login
      const savedStudent = localStorage.getItem("studentData");
      let url = "/api/visits";

      if (savedStudent) {
        const data = JSON.parse(savedStudent);
        url = `/api/visits?studentId=${data.id}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setMyVisits(data.data);
      }
    } catch (error) {
      console.error("Error loading visits:", error);
    }
  };

  // Available time slots
  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00",
    "13:00", "14:00", "15:00", "16:00"
  ];

  const classes = [
    "X RPL 1", "X RPL 2", "X SIJA 1", "X SIJA 2",
    "XI RPL 1", "XI RPL 2", "XI SIJA 1", "XI SIJA 2",
    "XII RPL 1", "XII RPL 2", "XII SIJA 1", "XII SIJA 2"
  ];

  const handleSubmitVisit = async () => {
    // Seharusnya tidak akan dipanggil karena tombol hanya muncul saat sudah login
    if (!studentData) {
      toast.error("Login Diperlukan", {
        description: "Anda harus login terlebih dahulu untuk mengajukan kunjungan",
      });
      setIsBookingOpen(false);
      window.location.href = "/student-login";
      return;
    }

    if (!visitForm.visitDate || !visitForm.visitTime || !visitForm.reason) {
      toast.error("Gagal!", {
        description: "Tanggal, waktu, dan alasan harus diisi",
      });
      return;
    }

    if (!selectedTeacherId) {
      toast.error("Gagal!", {
        description: "Pilih guru BK yang ingin Anda temui",
      });
      return;
    }

    try {
      const payload = studentData
        ? {
          visitDate: visitForm.visitDate,
          visitTime: visitForm.visitTime,
          reason: visitForm.reason,
          studentId: studentData.id,
          targetTeacherId: selectedTeacherId,
        }
        : { ...visitForm, targetTeacherId: selectedTeacherId };

      const response = await fetch("/api/visits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Gagal menjadwalkan kunjungan");
      }

      // Reset form
      if (studentData) {
        // Keep student info if logged in
        setVisitForm({
          studentName: studentData.name,
          class: studentData.class,
          email: "",
          phone: studentData.phone || "",
          visitDate: "",
          visitTime: "",
          reason: "",
        });
        setSelectedTeacherId("");
      } else {
        setVisitForm({
          studentName: "",
          class: "",
          email: "",
          phone: "",
          visitDate: "",
          visitTime: "",
          reason: "",
        });
      }

      // Reload visits dan tutup dialog
      await loadVisits();
      setIsBookingOpen(false);

      toast.success("Berhasil!", {
        description: "Permintaan kunjungan Anda telah dikirim. Tunggu konfirmasi dari Guru BK.",
      });
    } catch (error: any) {
      toast.error("Gagal!", {
        description: error.message || "Terjadi kesalahan saat menjadwalkan kunjungan",
      });
    }
  };

  const upcomingAppointments = myVisits
    .filter(
      (v) =>
        v.status === "approved" ||
        v.status === "pending" ||
        v.status === "forwarded",
    )
    .slice(0, 5);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
      case "approved":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "pending":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "forwarded":
        return <Send className="h-5 w-5 text-blue-600" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      confirmed: "bg-green-100 text-green-800 hover:bg-green-100",
      approved: "bg-green-100 text-green-800 hover:bg-green-100",
      pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      forwarded: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      cancelled: "bg-red-100 text-red-800 hover:bg-red-100",
    };
    return variants[status] || "";
  };

  const getStatusText = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Menunggu Persetujuan",
      approved: "Disetujui",
      forwarded: "Sedang Diproses",
      completed: "Selesai",
      cancelled: "Dibatalkan",
    };
    return labels[status] || status;
  };

  const handleLogout = () => {
    localStorage.removeItem("studentData");
    setStudentData(null);
    setVisitForm({
      studentName: "",
      class: "",
      email: "",
      phone: "",
      visitDate: "",
      visitTime: "",
      reason: "",
    });
    toast.success("Berhasil logout");
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Jadwal Kunjungan BK
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ajukan jadwal kunjungan ke Guru BK untuk konsultasi akademik, karir,
            atau pribadi
          </p>
        </div>

        {/* Student Auth Section */}
        <div className="flex justify-center mb-8">
          {studentData ? (
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 px-6 py-3 rounded-lg border text-white">
              <User className="h-5 w-5 text-white" />
              <div className="text-sm">
                <p className="font-semibold text-white">{studentData.name}</p>
                <p className="text-white dark:text-slate-400">
                  {studentData.class}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="ml-4 gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          ) : (
            <Link href="/student-login">
              <Button variant="outline" className="gap-2">
                <User className="h-4 w-4" />
                Login untuk Auto-fill Data
              </Button>
            </Link>
          )}
        </div>


        {/* Form Kunjungan Baru */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Buat Jadwal Kunjungan</h2>
            {studentData ? (
              <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-transform duration-300 ease-out
                    transform hover:scale-105 px-6 py-3 focus-visible:ring-2 focus-visible:ring-blue-400"
                  >
                    <Send className="h-5 w-5" />
                    Ajukan Kunjungan Baru
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      Form Pengajuan Kunjungan ke Guru BK
                    </DialogTitle>
                    <DialogDescription>
                      Lengkapi formulir di bawah untuk mengajukan jadwal
                      kunjungan ke Guru BK
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    {/* Informasi Pribadi */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm text-slate-700 border-b pb-2">
                        Informasi Pribadi
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700">
                        <div className="space-y-2">
                          <Label
                            htmlFor="studentName"
                            className="!text-gray-900"
                          >
                            Nama Lengkap
                          </Label>
                          <Input
                            id="studentName"
                            placeholder="Contoh: Ahmad Fauzi"
                            value={
                              studentData
                                ? studentData.name
                                : visitForm.studentName
                            }
                            onChange={(e) =>
                              setVisitForm({
                                ...visitForm,
                                studentName: e.target.value,
                              })
                            }
                            disabled={!!studentData}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="class" className="!text-gray-900">
                            Kelas
                          </Label>
                          <Select
                            value={
                              studentData ? studentData.class : visitForm.class
                            }
                            onValueChange={(value) =>
                              setVisitForm({ ...visitForm, class: value })
                            }
                            disabled={!!studentData}
                          >
                            <SelectTrigger id="class">
                              <SelectValue placeholder="Pilih kelas">
                                {studentData ? studentData.class : undefined}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {classes.map((cls) => (
                                <SelectItem key={cls} value={cls}>
                                  {cls}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          {studentData ? (
                            <>
                              <Label htmlFor="nisn" className="!text-gray-900">
                                NISN
                              </Label>
                              <Input
                                disabled
                                id="nisn"
                                type="text"
                                value={studentData.nisn || ""}
                              />
                            </>
                          ) : (
                            <>
                              <Label htmlFor="email" className="!text-gray-900">
                                Email (opsional)
                              </Label>
                              <Input
                                id="email"
                                type="email"
                                placeholder="email@contoh.com"
                                value={visitForm.email}
                                onChange={(e) =>
                                  setVisitForm({
                                    ...visitForm,
                                    email: e.target.value,
                                  })
                                }
                              />
                            </>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone" className="!text-gray-900">
                            No. Telepon (opsional)
                          </Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="081234567890"
                            value={
                              studentData
                                ? studentData.phone || ""
                                : visitForm.phone
                            }
                            onChange={(e) =>
                              setVisitForm({
                                ...visitForm,
                                phone: e.target.value,
                              })
                            }
                            disabled={!!studentData}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Jadwal Kunjungan */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm text-slate-700 border-b pb-2">
                        Jadwal Kunjungan
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="visitDate" className="!text-gray-900">
                            Tanggal Kunjungan
                          </Label>
                          <Input
                            id="visitDate"
                            type="date"
                            min={new Date().toISOString().split("T")[0]}
                            value={visitForm.visitDate}
                            onChange={(e) =>
                              setVisitForm({
                                ...visitForm,
                                visitDate: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="visitTime" className="!text-gray-900">
                            Waktu Kunjungan
                          </Label>
                          <Select
                            value={visitForm.visitTime}
                            onValueChange={(value) =>
                              setVisitForm({ ...visitForm, visitTime: value })
                            }
                          >
                            <SelectTrigger id="visitTime">
                              <SelectValue placeholder="Pilih waktu" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time} WIB
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Pilihan Guru BK */}
                      <div className="space-y-2 mt-4">
                        <Label
                          htmlFor="targetTeacher"
                          className="!text-gray-900"
                        >
                          Pilih Guru BK
                        </Label>
                        <Select
                          value={selectedTeacherId}
                          onValueChange={setSelectedTeacherId}
                        >
                          <SelectTrigger id="targetTeacher">
                            <SelectValue placeholder="Pilih guru BK yang ingin ditemui" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTeachers.length === 0 ? (
                              <div className="px-2 py-3 text-sm text-muted-foreground text-center">
                                Tidak ada guru tersedia untuk kelas Anda
                              </div>
                            ) : (
                              availableTeachers.map((teacher) => (
                                <SelectItem key={teacher.id} value={teacher.id}>
                                  <span>{teacher.name}</span>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-slate-500">
                          Pilih guru BK yang ingin Anda temui untuk konsultasi.
                        </p>
                      </div>
                    </div>

                    {/* Keperluan */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm text-slate-700 border-b pb-2">
                        Keperluan Kunjungan
                      </h3>

                      <div className="space-y-2">
                        <Label htmlFor="reason" className="!text-gray-900">
                          Tujuan/Keperluan Kunjungan
                        </Label>
                        <Textarea
                          id="reason"
                          placeholder="Jelaskan keperluan atau tujuan kunjungan Anda ke Guru BK. Contoh: Konsultasi masalah akademik, bimbingan karir, konseling pribadi, dll."
                          value={visitForm.reason}
                          onChange={(e) =>
                            setVisitForm({
                              ...visitForm,
                              reason: e.target.value,
                            })
                          }
                          rows={5}
                        />
                        <p className="text-xs text-slate-500">
                          Jelaskan dengan jelas agar Guru BK dapat mempersiapkan
                          sesi konsultasi dengan baik.
                        </p>
                      </div>
                    </div>

                    {/* Info Box */}
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="pt-4">
                        <div className="flex gap-3">
                          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="space-y-1 text-sm text-blue-900">
                            <p className="font-medium">Catatan Penting:</p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                              <li>Pengajuan akan ditinjau oleh Guru BK</li>
                              <li>
                                Anda akan mendapat notifikasi status pengajuan
                              </li>
                              <li>
                                Harap datang tepat waktu sesuai jadwal yang
                                disetujui
                              </li>
                              <li>Hubungi BK jika ada perubahan jadwal</li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsBookingOpen(false);
                        setSelectedTeacherId("");
                        // Preserve student data if logged in
                        if (studentData) {
                          setVisitForm({
                            studentName: studentData.name,
                            class: studentData.class,
                            email: "",
                            phone: studentData.phone || "",
                            visitDate: "",
                            visitTime: "",
                            reason: "",
                          });
                        } else {
                          setVisitForm({
                            studentName: "",
                            class: "",
                            email: "",
                            phone: "",
                            visitDate: "",
                            visitTime: "",
                            reason: "",
                          });
                        }
                      }}
                    >
                      Batal
                    </Button>
                    <Button onClick={handleSubmitVisit} className="gap-2">
                      <Send className="h-4 w-4" />
                      Kirim Pengajuan
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : (
              <Link href="/student-login">
                <Button size="lg" className="gap-2" variant="outline">
                  <User className="h-4 w-4" />
                  Login untuk Mengajukan Kunjungan
                </Button>
              </Link>
            )}
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="shadow-card hover:shadow-elevated transition-all">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Pilih Jadwal</CardTitle>
                <CardDescription>
                  Tentukan tanggal dan waktu yang sesuai untuk kunjungan Anda
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-card hover:shadow-elevated transition-all">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Tunggu Konfirmasi</CardTitle>
                <CardDescription>
                  Guru BK akan meninjau dan mengkonfirmasi pengajuan Anda
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-card hover:shadow-elevated transition-all">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Konsultasi</CardTitle>
                <CardDescription>
                  Hadiri sesi konsultasi sesuai jadwal yang telah disetujui
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Information Card */}
        <Card className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              Panduan Kunjungan ke BK
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-slate-900">
                  Langkah-langkah:
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-slate-700">
                  <li>Klik tombol "Ajukan Kunjungan Baru"</li>
                  <li>Lengkapi formulir dengan data yang akurat</li>
                  <li>Pilih tanggal dan waktu yang sesuai</li>
                  <li>Jelaskan keperluan kunjungan Anda</li>
                  <li>Tunggu konfirmasi dari Guru BK</li>
                  <li>Hadiri sesi sesuai jadwal yang disetujui</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-slate-900">
                  Waktu Layanan BK:
                </h4>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span>
                      <strong>Senin - Jumat:</strong> 08:00 - 16:00 WIB
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span>
                      <strong>Sabtu:</strong> 08:00 - 12:00 WIB
                    </span>
                  </li>
                </ul>
                <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                  <p className="text-sm text-slate-600">
                    <strong>Catatan:</strong> Untuk keperluan mendesak, silakan
                    hubungi ruang BK secara langsung atau melalui telepon
                    sekolah.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Schedule;
