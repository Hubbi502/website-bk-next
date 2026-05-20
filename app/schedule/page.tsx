"use client"
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  LogOut,
  AlertTriangle,
  RefreshCw,
  UserCheck,
  Timer,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import {
  getPusherClient,
  VISIT_CHANNEL,
  VISIT_BOOKED_EVENT,
} from "@/lib/pusher";
interface Visit {
  id: string;
  studentName: string;
  class: string;
  email?: string;
  phone?: string;
  visitDate: string;
  visitTime: string;
  reason: string;
  status:
  | "pending"
  | "approved"
  | "forwarded"
  | "completed"
  | "cancelled"
  | "awaiting_student"
  | "pending_delegation"
  | "pending_time_negotiation"
  | "waiting";
  proposedVisitDate?: string;
  proposedVisitTime?: string;
  timeNegotiationStep?: number;
  timeNegotiationNotes?: string;
  waitDurationMinutes?: number;
  waitExpiredAt?: string;
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
  assignedAdminId?: string;
  assignedAdmin?: {
    id: string;
    name: string;
    role: string;
  };
  rejectedAdminIds?: string[];
  delegationStep?: number;
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

  // WaitCountdownBar component
  const WaitCountdownBar = ({ waitDurationMinutes, waitExpiredAt, onExpired }: {
    waitDurationMinutes: number;
    waitExpiredAt: string;
    onExpired: () => void;
  }) => {
    const [timeLeft, setTimeLeft] = useState(
      new Date(waitExpiredAt).getTime() - Date.now()
    );

    useEffect(() => {
      if (timeLeft <= 0) {
        onExpired();
        return;
      }

      const interval = setInterval(() => {
        const newTimeLeft = new Date(waitExpiredAt).getTime() - Date.now();
        setTimeLeft(newTimeLeft);

        if (newTimeLeft <= 0) {
          clearInterval(interval);
          onExpired();
        }
      }, 1000);

      return () => clearInterval(interval);
    }, [waitExpiredAt, onExpired]);

    const totalWaitMs = waitDurationMinutes * 60 * 1000;
    const percentage = Math.max(0, Math.min(100, (timeLeft / totalWaitMs) * 100));
    const minutes = Math.max(0, Math.floor(timeLeft / 60000));
    const seconds = Math.max(0, Math.floor((timeLeft % 60000) / 1000));

    return (
      <div className="w-full mt-4">
        <div className="flex justify-between items-center mb-1 text-sm font-medium text-amber-600">
          <span className="flex items-center gap-1">
            <Timer className="h-3.5 w-3.5" />
            Mohon tunggu konfirmasi guru...
          </span>
          <span>{minutes}:{seconds.toString().padStart(2, '0')}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className="bg-amber-500 h-2.5 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [studentData, setStudentData] = useState<any>(null);
  const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  // Delegation flow state
  const [awaitingVisit, setAwaitingVisit] = useState<Visit | null>(null);
  const [isUnavailableAlertOpen, setIsUnavailableAlertOpen] = useState(false);
  const [isTeacherSelectionOpen, setIsTeacherSelectionOpen] = useState(false);
  const [availableDelegateTeachers, setAvailableDelegateTeachers] = useState<
    Teacher[]
  >([]);
  const [selectedDelegateTeacherId, setSelectedDelegateTeacherId] =
    useState<string>("");
  const [isDelegating, setIsDelegating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Time negotiation state
  const [isTimeNegotiationOpen, setIsTimeNegotiationOpen] = useState(false);
  const [negotiationDate, setNegotiationDate] = useState("");
  const [negotiationTime, setNegotiationTime] = useState("");
  const [negotiationBookedSlots, setNegotiationBookedSlots] = useState<string[]>([]);
  const [isProposingTime, setIsProposingTime] = useState(false);

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
      // Normalize class to string (may be object from old API response)
      if (data.class && typeof data.class === 'object') {
        data.class = data.class.name || "Tidak ada kelas";
        localStorage.setItem("studentData", JSON.stringify(data));
      }
      setStudentData(data);
    }
  }, []);

  // Auto-fill form when dialog opens or studentData changes
  useEffect(() => {
    if (isBookingOpen && studentData) {
      setVisitForm((prev) => ({
        ...prev,
        studentName: studentData.name || "",
        class: studentData.class || "",
        email: "", // Student tidak punya email, menggunakan NISN
        phone: studentData.phone || "",
      }));

      // Fetch available teachers for student's class
      const fetchTeachers = async () => {
        try {
          const response = await fetch(
            `/api/teachers?class=${encodeURIComponent(studentData.class)}`,
          );
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

  // Fetch booked slots ketika guru atau tanggal berubah
  const fetchBookedSlots = useCallback(
    async (teacherId: string, date: string) => {
      if (!teacherId || !date) {
        setBookedSlots([]);
        return;
      }
      try {
        const response = await fetch(
          `/api/visits/booked-slots?teacherId=${encodeURIComponent(teacherId)}&date=${encodeURIComponent(date)}`,
        );
        const data = await response.json();
        if (data.success) {
          setBookedSlots(data.data);
          // Jika waktu yang sudah dipilih ternyata sudah diambil, reset
          if (data.data.includes(visitForm.visitTime)) {
            setVisitForm((prev) => ({ ...prev, visitTime: "" }));
            toast.warning("Waktu yang Anda pilih sudah tidak tersedia", {
              description: "Silakan pilih waktu lain.",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching booked slots:", error);
      }
    },
    [visitForm.visitTime],
  );

  // Re-fetch booked slots ketika guru atau tanggal berubah
  useEffect(() => {
    fetchBookedSlots(selectedTeacherId, visitForm.visitDate);
  }, [selectedTeacherId, visitForm.visitDate, fetchBookedSlots]);

  // Subscribe ke Pusher untuk real-time update slot yang terisi
  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(VISIT_CHANNEL);

    channel.bind(
      VISIT_BOOKED_EVENT,
      (data: {
        teacherId: string;
        visitDate: string;
        visitTime: string;
        studentId?: string;
      }) => {
        // Jika event untuk guru & tanggal yang sedang dipilih, update bookedSlots
        if (
          data.teacherId === selectedTeacherId &&
          data.visitDate === visitForm.visitDate
        ) {
          setBookedSlots((prev) => {
            if (prev.includes(data.visitTime)) return prev;
            return [...prev, data.visitTime];
          });

          // Jika user sudah memilih waktu yang baru saja diambil user lain
          // Dan yang mengambil bukan user ini sendiri (dibedakan via studentId)
          if (
            data.visitTime === visitForm.visitTime &&
            data.studentId !== studentData?.id
          ) {
            setVisitForm((prev) => ({ ...prev, visitTime: "" }));
            toast.warning(
              "Waktu yang Anda pilih baru saja diambil oleh siswa lain",
              {
                description: "Silakan pilih waktu lain.",
              },
            );
          }
        }
      },
    );

    // Subscribe to visit status changes (delegation flow)
    channel.bind(
      "visit-status-changed",
      (data: {
        visitId: string;
        status: string;
        studentId?: string;
        teacherName?: string;
        reason?: string;
      }) => {
        // Reload visits to get latest data
        loadVisits();
      },
    );

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [
    selectedTeacherId,
    visitForm.visitDate,
    visitForm.visitTime,
    studentData?.id,
  ]);

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

        // Check if any visit is awaiting student decision
        const awVisit = data.data.find(
          (v: Visit) => v.status === "awaiting_student",
        );
        if (awVisit && !isTeacherSelectionOpen) {
          setAwaitingVisit(awVisit);
          setIsUnavailableAlertOpen(true);
        }
      }
    } catch (error) {
      console.error("Error loading visits:", error);
    }
  };

  // Available time slots
  const timeSlots = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
  ];

  const classes = [
    "X RPL 1",
    "X RPL 2",
    "X SIJA 1",
    "X SIJA 2",
    "XI RPL 1",
    "XI RPL 2",
    "XI SIJA 1",
    "XI SIJA 2",
    "XII RPL 1",
    "XII RPL 2",
    "XII SIJA 1",
    "XII SIJA 2",
  ];

  const handleSubmitVisit = async () => {
    // Seharusnya tidak akan dipanggil karena tombol hanya muncul saat sudah login
    if (!studentData) {
      toast.error("Login Diperlukan", {
        description:
          "Anda harus login terlebih dahulu untuk mengajukan kunjungan",
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

    setIsSubmitting(true);
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
        description:
          "Permintaan kunjungan Anda telah dikirim. Tunggu konfirmasi dari Guru BK.",
      });
    } catch (error: any) {
      toast.error("Gagal!", {
        description:
          error.message || "Terjadi kesalahan saat menjadwalkan kunjungan",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const upcomingAppointments = myVisits
    .filter(
      (v) =>
        v.status === "approved" ||
        v.status === "pending" ||
        v.status === "forwarded" ||
        v.status === "awaiting_student" ||
        v.status === "pending_delegation" ||
        v.status === "pending_time_negotiation" ||
        v.status === "waiting",
    )
    .slice(0, 5);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
      case "approved":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "pending":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "waiting":
        return <Timer className="h-5 w-5 text-amber-600" />;
      case "forwarded":
        return <Send className="h-5 w-5 text-blue-600" />;
      case "awaiting_student":
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case "pending_delegation":
        return <RefreshCw className="h-5 w-5 text-indigo-600" />;
      case "pending_time_negotiation":
        return <Clock className="h-5 w-5 text-purple-600" />;
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
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
      waiting: "bg-amber-100 text-amber-800 hover:bg-amber-100",
      forwarded: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      awaiting_student: "bg-orange-100 text-orange-800 hover:bg-orange-100",
      pending_delegation: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100",
      pending_time_negotiation: "bg-purple-100 text-purple-800 hover:bg-purple-100",
      completed: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
      cancelled: "bg-red-100 text-red-800 hover:bg-red-100",
    };
    return variants[status] || "";
  };

  const getStatusText = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Menunggu Persetujuan",
      waiting: "⏳ Menunggu (Hold)",
      approved: "Disetujui",
      forwarded: "Sedang Diproses",
      awaiting_student: "⏳ Menunggu Keputusanmu",
      pending_delegation: "🔄 Menunggu Konfirmasi Guru",
      pending_time_negotiation: "🕐 Menunggu Konfirmasi Waktu Guru",
      completed: "Selesai",
      cancelled: "Dibatalkan",
    };
    return labels[status] || status;
  };

  // --- Delegation Flow Handlers ---
  const handleStudentDecision = async (
    visitId: string,
    decision: "cancel" | "continue" | "confirm",
  ) => {
    try {
      const response = await fetch(`/api/visits/${visitId}/student-decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Gagal memproses keputusan");
      }

      setIsUnavailableAlertOpen(false);

      if (decision === "cancel") {
        toast.success("Kunjungan dibatalkan");
        await loadVisits();
      } else if (decision === "confirm") {
        toast.success("Kunjungan disetujui! 🎉", {
          description: "Guru dan Anda telah mengonfirmasi ketersediaan.",
        });
        await loadVisits();
      } else {
        // Open teacher selection modal
        await fetchDelegateTeachers(visitId);
        setIsTeacherSelectionOpen(true);
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal memproses keputusan");
    }
  };

  const fetchDelegateTeachers = async (visitId: string) => {
    try {
      const response = await fetch(`/api/admins/available?visitId=${visitId}`);
      const data = await response.json();
      if (data.success) {
        setAvailableDelegateTeachers(data.data);
      }
    } catch (error) {
      console.error("Error fetching delegate teachers:", error);
    }
  };

  const handleDelegateToTeacher = async () => {
    if (!awaitingVisit || !selectedDelegateTeacherId) return;
    setIsDelegating(true);
    try {
      const response = await fetch(`/api/visits/${awaitingVisit.id}/delegate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId: selectedDelegateTeacherId }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Gagal mendelegasikan");
      }

      setIsTeacherSelectionOpen(false);
      setAwaitingVisit(null);
      setSelectedDelegateTeacherId("");
      toast.success(
        data.message || "Berhasil memilih guru. Menunggu konfirmasi guru.",
      );
      await loadVisits();
    } catch (error: any) {
      toast.error(error.message || "Gagal mendelegasikan kunjungan");
    } finally {
      setIsDelegating(false);
    }
  };

  // --- Time Negotiation Handlers ---
  const fetchNegotiationBookedSlots = async (teacherId: string, date: string, visitId: string) => {
    if (!teacherId || !date) {
      setNegotiationBookedSlots([]);
      return;
    }
    try {
      const response = await fetch(
        `/api/visits/booked-slots?teacherId=${encodeURIComponent(teacherId)}&date=${encodeURIComponent(date)}&excludeVisitId=${encodeURIComponent(visitId)}`
      );
      const data = await response.json();
      if (data.success) {
        setNegotiationBookedSlots(data.data);
        if (data.data.includes(negotiationTime)) {
          setNegotiationTime("");
          toast.warning("Waktu yang Anda pilih sudah tidak tersedia", {
            description: "Silakan pilih waktu lain.",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching negotiation booked slots:", error);
    }
  };

  const handleProposeTime = async () => {
    if (!awaitingVisit || !studentData) return;
    if (!negotiationDate || !negotiationTime) {
      toast.error("Tanggal dan waktu harus dipilih terlebih dahulu");
      return;
    }
    setIsProposingTime(true);
    try {
      const response = await fetch(`/api/visits/${awaitingVisit.id}/propose-time`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: studentData.id,
          proposedVisitDate: negotiationDate,
          proposedVisitTime: negotiationTime,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Gagal mengirim usulan waktu");
      }

      setIsTimeNegotiationOpen(false);
      setAwaitingVisit(null);
      setNegotiationDate("");
      setNegotiationTime("");
      toast.success("Usulan waktu berhasil dikirim", {
        description: "Menunggu konfirmasi dari Guru BK.",
      });
      await loadVisits();
    } catch (error: any) {
      toast.error(error.message || "Gagal mengirim usulan waktu");
    } finally {
      setIsProposingTime(false);
    }
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

      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="text-center mb-6 md:mb-8 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-3 md:mb-4">
            Jadwal Kunjungan BK
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            Ajukan jadwal kunjungan ke Guru BK untuk konsultasi akademik, karir,
            atau pribadi
          </p>
        </div>

        {/* Student Auth Section */}
        <div className="flex justify-center mb-6 md:mb-8">
          {studentData ? (
            <div className="flex flex-wrap items-center gap-3 bg-slate-50 dark:bg-slate-900 px-4 sm:px-6 py-3 rounded-lg border text-white">
              <User className="h-5 w-5 text-white shrink-0" />
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
                className="ml-2 gap-2"
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

        {/* Form Kunjungan Baru & Kunjungan Aktif */}
        <section className="mb-10 md:mb-12">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold">
              {studentData
                ? "Jadwal & Kunjungan Saya"
                : "Buat Jadwal Kunjungan"}
            </h2>
            {studentData ? (
              <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-transform duration-300 ease-out
                    transform hover:scale-105 px-4 sm:px-6 py-3 focus-visible:ring-2 focus-visible:ring-blue-400 text-sm sm:text-base"
                  >
                    <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">
                      Ajukan Kunjungan Baru
                    </span>
                    <span className="sm:hidden">Ajukan</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
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
                              {timeSlots.map((time) => {
                                const isBooked = bookedSlots.includes(time);
                                return (
                                  <SelectItem
                                    key={time}
                                    value={time}
                                    disabled={isBooked}
                                    className={
                                      isBooked ? "opacity-50 line-through" : ""
                                    }
                                  >
                                    {time} WIB
                                    {isBooked ? " (Tidak Tersedia)" : ""}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          {bookedSlots.length > 0 && (
                            <p className="text-xs text-amber-600">
                              ⚠ Beberapa waktu sudah tidak tersedia untuk guru
                              dan tanggal ini.
                            </p>
                          )}
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
                    <Button
                      onClick={handleSubmitVisit}
                      disabled={isSubmitting}
                      className="gap-2"
                    >
                      {isSubmitting ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      {isSubmitting ? "Mengirim..." : "Kirim Pengajuan"}
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

          {/* Kunjungan Saya Section (Only visible if logged in) */}
          {studentData && (
            <div className="mb-8">
              {upcomingAppointments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingAppointments.map((visit) => (
                    <Card
                      key={visit.id}
                      className={`relative overflow-hidden group hover:shadow-md transition-all ${
                        visit.status === "awaiting_student"
                          ? "cursor-pointer ring-1 ring-orange-200 hover:ring-orange-400"
                          : ""
                      }`}
                      onClick={() => {
                        if (visit.status === "awaiting_student") {
                          setAwaitingVisit(visit);
                          setIsUnavailableAlertOpen(true);
                        }
                      }}
                    >
                      <div
                        className={`absolute top-0 left-0 w-1 h-full ${
                          visit.status === "approved" ||
                          visit.status === "completed"
                            ? "bg-green-500"
                            : visit.status === "pending" ||
                                visit.status === "awaiting_student" ||
                                visit.status === "pending_delegation" ||
                                visit.status === "pending_time_negotiation"
                              ? "bg-amber-500"
                              : visit.status === "waiting"
                                ? "bg-amber-400"
                                : visit.status === "cancelled"
                                  ? "bg-red-500"
                                  : "bg-blue-500"
                        }`}
                      />
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <Badge
                            className={getStatusBadge(visit.status)}
                            variant="outline"
                          >
                            <span className="flex items-center gap-1.5">
                              {getStatusIcon(visit.status)}
                              {getStatusText(visit.status)}
                            </span>
                          </Badge>
                          {visit.status === "awaiting_student" && (
                            <span className="text-xs text-orange-600 font-medium animate-pulse">
                              Klik untuk tindak lanjut
                            </span>
                          )}
                        </div>

                        <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                          {visit.reason}
                        </h3>

                        <div className="space-y-2 text-sm text-slate-600 mt-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-500" />
                            <span>
                              {new Date(visit.visitDate).toLocaleDateString(
                                "id-ID",
                                {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span>{visit.visitTime} WIB</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-purple-500" />
                            <span>
                              {visit.targetTeacher?.name ||
                                "Guru BK (Belum ditentukan)"}
                            </span>
                          </div>
                        </div>

                        {/* Countdown Bar for WAITING status */}
                        {visit.status === "waiting" &&
                          visit.waitDurationMinutes &&
                          visit.waitExpiredAt && (
                            <WaitCountdownBar
                              waitDurationMinutes={visit.waitDurationMinutes}
                              waitExpiredAt={visit.waitExpiredAt}
                              onExpired={() => {
                                // Reload visits to get updated AWAITING_STUDENT status
                                loadVisits();
                                // Show the decision modal so student can choose next action
                                setAwaitingVisit(visit);
                                setIsUnavailableAlertOpen(true);
                              }}
                            />
                          )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 bg-slate-50 rounded-xl border border-slate-200">
                  <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">
                    Belum ada jadwal kunjungan aktif
                  </p>
                  <p className="text-sm text-slate-400">
                    Silakan ajukan jadwal kunjungan baru jika diperlukan
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
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

        {/* === DELEGATION FLOW MODALS === */}

        {/* UnavailableTeacherAlert Modal */}
        <Dialog
          open={isUnavailableAlertOpen}
          onOpenChange={setIsUnavailableAlertOpen}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle
                className={`flex items-center gap-2 ${awaitingVisit?.notes?.includes("Guru BK tersedia") ? "text-green-700" : "text-orange-700"}`}
              >
                {awaitingVisit?.notes?.includes("Guru BK tersedia") ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                ) : (
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                )}
                {awaitingVisit?.notes?.includes("Guru BK tersedia")
                  ? "Guru BK Sekarang Tersedia! 🎉"
                  : awaitingVisit?.notes?.includes("Waktu tunggu habis")
                    ? "Waktu Tunggu Habis"
                    : "Guru BK Tidak Tersedia"}
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed">
                {awaitingVisit?.notes?.includes("Guru BK tersedia")
                  ? `${awaitingVisit?.targetTeacher?.name || "Guru BK"} sekarang tersedia dan siap menemui Anda. Apakah Anda masih bisa hadir?`
                  : awaitingVisit?.notes?.includes("Waktu tunggu habis")
                    ? `Waktu tunggu untuk kunjungan dengan ${awaitingVisit?.targetTeacher?.name || "Guru BK"} telah habis. Silakan pilih tindakan selanjutnya.`
                    : awaitingVisit?.targetTeacher
                      ? `Guru BK ${awaitingVisit.targetTeacher.name} sedang tidak tersedia untuk jadwal yang Anda ajukan.`
                      : "Guru BK yang Anda pilih sedang tidak tersedia."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              {/* Visit info */}
              {awaitingVisit && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-700 space-y-1">
                  <p>
                    <strong>Tanggal:</strong>{" "}
                    {new Date(awaitingVisit.visitDate).toLocaleDateString(
                      "id-ID",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </p>
                  <p>
                    <strong>Waktu:</strong> {awaitingVisit.visitTime} WIB
                  </p>
                  <p className="line-clamp-2">
                    <strong>Alasan:</strong> {awaitingVisit.reason}
                  </p>
                </div>
              )}

              {/* Options hint */}
              <div
                className={`${awaitingVisit?.notes?.includes("Guru BK tersedia") ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"} border rounded-lg p-3`}
              >
                <p
                  className={`text-sm font-medium ${awaitingVisit?.notes?.includes("Guru BK tersedia") ? "text-green-800" : "text-orange-800"}`}
                >
                  {awaitingVisit?.notes?.includes("Guru BK tersedia")
                    ? "Guru BK sekarang tersedia! Konfirmasi ketersediaan Anda:"
                    : "Pilih tindakan:"}
                </p>
              </div>

              {/* Action buttons — different for teacher-available vs unavailable */}
              <div className="flex flex-col gap-2 pt-1">
                {awaitingVisit?.notes?.includes("Guru BK tersedia") ? (
                  <>
                    {/* Teacher is available — student confirms or declines */}
                    <Button
                      onClick={() =>
                        awaitingVisit &&
                        handleStudentDecision(awaitingVisit.id, "confirm")
                      }
                      className="w-full justify-start bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2 shrink-0" />
                      Ya, Saya Masih Tersedia
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        awaitingVisit &&
                        handleStudentDecision(awaitingVisit.id, "cancel")
                      }
                      className="w-full justify-start border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-2 shrink-0" />
                      Tidak, Batalkan Kunjungan
                    </Button>
                  </>
                ) : (
                  <>
                    {/* Teacher unavailable / wait expired — pick another teacher or propose time */}
                    <Button
                      variant="outline"
                      onClick={() =>
                        awaitingVisit &&
                        handleStudentDecision(awaitingVisit.id, "cancel")
                      }
                      className="w-full justify-start border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-2 shrink-0" />
                      Batalkan Kunjungan
                    </Button>
                    <Button
                      onClick={() =>
                        awaitingVisit &&
                        handleStudentDecision(awaitingVisit.id, "continue")
                      }
                      className="w-full justify-start bg-blue-600 hover:bg-blue-700"
                    >
                      <UserCheck className="h-4 w-4 mr-2 shrink-0" />
                      Pilih Guru BK Lain
                    </Button>
                    <Button
                      onClick={() => {
                        setIsUnavailableAlertOpen(false);
                        setNegotiationDate("");
                        setNegotiationTime("");
                        setNegotiationBookedSlots([]);
                        setIsTimeNegotiationOpen(true);
                      }}
                      className="w-full justify-start bg-purple-600 hover:bg-purple-700"
                    >
                      <Clock className="h-4 w-4 mr-2 shrink-0" />
                      Usulkan Waktu Lain (Guru Sama)
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* TeacherSelectionModal */}
        <Dialog
          open={isTeacherSelectionOpen}
          onOpenChange={(open) => {
            setIsTeacherSelectionOpen(open);
            if (!open) {
              setSelectedDelegateTeacherId("");
            }
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-blue-600" />
                Pilih Guru BK Lain
              </DialogTitle>
              <DialogDescription>
                Pilih guru BK yang tersedia untuk melanjutkan kunjungan Anda.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              {availableDelegateTeachers.length === 0 ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800 flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    Tidak ada guru BK yang tersedia saat ini. Kunjungan Anda
                    akan dibatalkan.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableDelegateTeachers.map((teacher) => (
                    <div
                      key={teacher.id}
                      onClick={() => setSelectedDelegateTeacherId(teacher.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedDelegateTeacherId === teacher.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                          selectedDelegateTeacherId === teacher.id
                            ? "border-blue-500"
                            : "border-slate-300"
                        }`}
                      >
                        {selectedDelegateTeacherId === teacher.id && (
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{teacher.name}</p>
                        <p className="text-xs text-slate-500">
                          {teacher.role === "SUPER_ADMIN"
                            ? "Koordinator BK"
                            : "Guru BK"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-slate-500">
                Guru yang sudah menolak tidak ditampilkan dalam daftar ini.
              </p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsTeacherSelectionOpen(false);
                  setSelectedDelegateTeacherId("");
                }}
              >
                Batal
              </Button>
              <Button
                onClick={handleDelegateToTeacher}
                disabled={!selectedDelegateTeacherId || isDelegating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isDelegating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />{" "}
                    Memproses...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" /> Pilih Guru
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* TimeNegotiationModal */}
        <Dialog
          open={isTimeNegotiationOpen}
          onOpenChange={(open) => {
            setIsTimeNegotiationOpen(open);
            if (!open) {
              setNegotiationDate("");
              setNegotiationTime("");
              setNegotiationBookedSlots([]);
            }
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-purple-700">
                <Clock className="h-5 w-5" />
                Usulkan Waktu Baru
              </DialogTitle>
              <DialogDescription>
                Pilih tanggal dan waktu yang Anda inginkan untuk kunjungan
                dengan{" "}
                <strong>
                  {awaitingVisit?.targetTeacher?.name || "Guru BK"}
                </strong>
                .
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              {awaitingVisit && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm text-purple-800">
                  <p>
                    <strong>Guru BK:</strong>{" "}
                    {awaitingVisit.targetTeacher?.name}
                  </p>
                  <p>
                    <strong>Jadwal awal:</strong>{" "}
                    {new Date(awaitingVisit.visitDate).toLocaleDateString(
                      "id-ID",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}{" "}
                    {awaitingVisit.visitTime} WIB
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="negDate" className="!text-gray-900">
                  Tanggal Baru
                </Label>
                <Input
                  id="negDate"
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={negotiationDate}
                  onChange={(e) => {
                    setNegotiationDate(e.target.value);
                    setNegotiationTime("");
                    if (awaitingVisit?.targetTeacherId) {
                      fetchNegotiationBookedSlots(
                        awaitingVisit.targetTeacherId,
                        e.target.value,
                        awaitingVisit.id,
                      );
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="negTime" className="!text-gray-900">
                  Waktu Baru
                </Label>
                <Select
                  value={negotiationTime}
                  onValueChange={(value) => setNegotiationTime(value)}
                  disabled={!negotiationDate}
                >
                  <SelectTrigger id="negTime">
                    <SelectValue
                      placeholder={
                        negotiationDate ? "Pilih waktu" : "Pilih tanggal dahulu"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => {
                      const isBooked = negotiationBookedSlots.includes(time);
                      return (
                        <SelectItem
                          key={time}
                          value={time}
                          disabled={isBooked}
                          className={isBooked ? "opacity-50 line-through" : ""}
                        >
                          {time} WIB{isBooked ? " (Tidak Tersedia)" : ""}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {negotiationBookedSlots.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Waktu yang dicoret sudah terisi oleh siswa lain
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsTimeNegotiationOpen(false);
                  setNegotiationDate("");
                  setNegotiationTime("");
                }}
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleProposeTime}
                disabled={isProposingTime}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isProposingTime ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Kirim Usulan
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};;

export default Schedule;
