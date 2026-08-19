"use client";
import React from "react";
import { useState, useEffect, JSX } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  FileEdit,
  Trash2,
  AlertTriangle,
  ArrowRightLeft,
  Forward,
  UserCheck,
  UserX,
  Timer,
  Ban,
} from "lucide-react";

export interface VisitNote {
  id: string;
  visitId: string;
  note: string;
  isSolved: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Visit {
  id: string;
  studentName: string;
  class: string;
  email?: string;
  phone?: string;
  visitDate: string;
  visitTime: string;
  reason: string;
  status: "pending" | "approved" | "completed" | "cancelled" | "waiting" | "forwarded" | "awaiting_student" | "pending_delegation" | "pending_time_negotiation";
  notes?: string;
  visitNotesTimeline?: VisitNote[];
  approvedBy?: string;
  targetTeacherId?: string;
  targetTeacher?: {
    id: string;
    name: string;
    role: string;
  };
  forwardedToCoordinator?: boolean;
  forwardReason?: string | null;
  delegatedToTeacherId?: string;
  delegatedToTeacher?: {
    id: string;
    name: string;
    role: string;
  };
  delegationStatus?: string | null;
  delegationNotes?: string | null;
  assignedAdminId?: string;
  assignedAdmin?: {
    id: string;
    name: string;
    role: string;
  };
  rejectedAdminIds?: string[];
  delegationStep?: number;
  proposedVisitDate?: string;
  proposedVisitTime?: string;
  timeNegotiationStep?: number;
  timeNegotiationNotes?: string | null;
  waitDurationMinutes?: number;
  waitExpiredAt?: string;
  createdAt: string;
  updatedAt?: string;
}

interface Teacher {
  id: string;
  name: string;
  role: string;
  assignedClasses: string[];
}

interface VisitManagementProps {
  visits: Visit[];
  loadVisits: () => void;
  getStatusBadge: (status: Visit["status"]) => JSX.Element;
  adminData?: { id: string; name: string; role: string };
}

export function VisitManagement({
  visits,
  loadVisits,
  getStatusBadge,
  adminData,
}: VisitManagementProps) {
  const { toast } = useToast();
  const [filteredVisits, setFilteredVisits] = useState<Visit[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [visitNotes, setVisitNotes] = useState("");
  // States untuk timeline catatan
  const [newMeetingNote, setNewMeetingNote] = useState("");
  const [isMeetingSolved, setIsMeetingSolved] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [visitToDelete, setVisitToDelete] = useState<Visit | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Delegation state
  const [isDelegateDialogOpen, setIsDelegateDialogOpen] = useState(false);
  const [visitToDelegate, setVisitToDelegate] = useState<Visit | null>(null);
  const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([]);
  const [selectedDelegateTeacherId, setSelectedDelegateTeacherId] =
    useState("");
  const [delegationNotes, setDelegationNotes] = useState("");
  const [isDelegating, setIsDelegating] = useState(false);

  // Forward to coordinator state
  const [isForwardDialogOpen, setIsForwardDialogOpen] = useState(false);
  const [visitToForward, setVisitToForward] = useState<Visit | null>(null);
  const [forwardReason, setForwardReason] = useState("");
  const [isForwarding, setIsForwarding] = useState(false);

  // Wait/Hold state
  const [isWaitDialogOpen, setIsWaitDialogOpen] = useState(false);
  const [visitToWait, setVisitToWait] = useState<Visit | null>(null);
  const [waitDuration, setWaitDuration] = useState("15");
  const [isSettingWait, setIsSettingWait] = useState(false);

  // Time negotiation review state
  const [isTimeNegotiationReviewOpen, setIsTimeNegotiationReviewOpen] = useState(false);
  const [visitToReviewTime, setVisitToReviewTime] = useState<Visit | null>(null);
  const [isRespondingTime, setIsRespondingTime] = useState(false);

  const isCoordinator = adminData?.role === "SUPER_ADMIN";

  useEffect(() => {
    let result = [...visits];

    // Filter berdasarkan status
    if (filterStatus !== "all") {
      result = result.filter((v) => v.status === filterStatus);
    }

    // Search berdasarkan nama atau kelas
    if (searchQuery) {
      result = result.filter(
        (v) =>
          (v.studentName || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (typeof v.class === 'object' ? (v.class as any).name : v.class || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
    }

    // Sort berdasarkan tanggal terbaru
    result.sort((a, b) => {
      const dateA = new Date(a.visitDate + " " + a.visitTime);
      const dateB = new Date(b.visitDate + " " + b.visitTime);
      return dateB.getTime() - dateA.getTime();
    });

    setFilteredVisits(result);
  }, [visits, filterStatus, searchQuery]);

  // Fetch available teachers for delegation
  const fetchTeachersForDelegation = async () => {
    try {
      const response = await fetch("/api/teachers");
      const data = await response.json();
      if (data.success) {
        // Filter out the original target teacher and current admin
        setAvailableTeachers(
          data.data.filter(
            (t: Teacher) =>
              t.id !== visitToDelegate?.targetTeacherId &&
              t.id !== adminData?.id,
          ),
        );
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  const handleUpdateVisitStatus = async (
    id: string,
    status: Visit["status"],
  ) => {
    try {
      const response = await fetch(`/api/visits/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Gagal memperbarui status");
      }

      await loadVisits();

      const statusText: Record<string, string> = {
        pending: "Pending",
        approved: "Disetujui",
        forwarded: "Diserahkan",
        completed: "Selesai",
        cancelled: "Dibatalkan",
      };

      toast({
        title: "Status Diperbarui",
        description: `Status kunjungan berhasil diubah menjadi ${statusText[status]}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal memperbarui status",
        variant: "destructive",
      });
    }
  };

  // Open forward dialog
  const handleOpenForwardDialog = (visit: Visit) => {
    setVisitToForward(visit);
    setForwardReason("");
    setIsForwardDialogOpen(true);
  };

  // Forward visit to coordinator with reason
  const handleForwardToCoordinator = async () => {
    if (!visitToForward) return;

    setIsForwarding(true);
    try {
      const response = await fetch(`/api/visits/${visitToForward.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "forward",
          forwardReason: forwardReason || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Gagal menyerahkan ke koordinator");
      }

      await loadVisits();
      setIsForwardDialogOpen(false);
      setVisitToForward(null);
      toast({
        title: "Diserahkan ke Koordinator",
        description:
          "Kunjungan berhasil diserahkan ke koordinator untuk didelegasikan ke guru lain.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menyerahkan ke koordinator",
        variant: "destructive",
      });
    } finally {
      setIsForwarding(false);
    }
  };

  // Open delegation dialog (coordinator only)
  const handleOpenDelegateDialog = (visit: Visit) => {
    setVisitToDelegate(visit);
    setSelectedDelegateTeacherId("");
    setDelegationNotes("");
    setIsDelegateDialogOpen(true);
  };

  useEffect(() => {
    if (isDelegateDialogOpen && visitToDelegate) {
      fetchTeachersForDelegation();
    }
  }, [isDelegateDialogOpen, visitToDelegate]);

  // Delegate visit to another teacher (coordinator only)
  const handleDelegateVisit = async () => {
    if (!visitToDelegate || !selectedDelegateTeacherId) return;

    setIsDelegating(true);
    try {
      const response = await fetch(`/api/visits/${visitToDelegate.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delegate",
          delegatedToTeacherId: selectedDelegateTeacherId,
          delegationNotes,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Gagal mendelegasikan");
      }

      await loadVisits();
      setIsDelegateDialogOpen(false);
      setVisitToDelegate(null);
      toast({
        title: "Berhasil Didelegasikan",
        description:
          "Kunjungan berhasil didelegasikan ke guru lain. Menunggu persetujuan guru tersebut.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal mendelegasikan",
        variant: "destructive",
      });
    } finally {
      setIsDelegating(false);
    }
  };

  // Accept delegation (delegated teacher)
  const handleAcceptDelegation = async (visit: Visit) => {
    try {
      const response = await fetch(`/api/visits/${visit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "accept_delegation",
          approvedBy: adminData?.id,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Gagal menerima delegasi");
      }

      await loadVisits();
      toast({
        title: "Delegasi Diterima",
        description:
          "Anda telah menerima kunjungan ini. Status diubah menjadi Disetujui.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menerima delegasi",
        variant: "destructive",
      });
    }
  };

  // Reject delegation (delegated teacher)
  const handleRejectDelegation = async (visit: Visit) => {
    try {
      const response = await fetch(`/api/visits/${visit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject_delegation" }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Gagal menolak delegasi");
      }

      await loadVisits();
      toast({
        title: "Delegasi Ditolak",
        description: "Delegasi ditolak. Koordinator akan memilih guru lain.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menolak delegasi",
        variant: "destructive",
      });
    }
  };

  const handleViewDetail = (visit: Visit) => {
    setSelectedVisit(visit);
    setVisitNotes(visit.notes || "");
    setNewMeetingNote("");
    setIsMeetingSolved(false);
    setIsDetailOpen(true);
  };

  const handleAddMeetingNote = async () => {
    if (!selectedVisit) return;
    if (!newMeetingNote.trim()) {
      toast({
        title: "Perhatian",
        description: "Catatan tidak boleh kosong",
        variant: "destructive",
      });
      return;
    }

    setIsAddingNote(true);
    try {
      const response = await fetch(`/api/visits/${selectedVisit.id}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          note: newMeetingNote,
          isSolved: isMeetingSolved 
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Gagal menyimpan catatan");
      }

      // If solved, also update the main visit status
      if (isMeetingSolved && selectedVisit.status !== "completed") {
        await handleUpdateVisitStatus(selectedVisit.id, "completed");
      } else {
        await loadVisits();
      }
      
      // Update selectedVisit manually to show new note in UI instantly
      setSelectedVisit({
        ...selectedVisit,
        status: isMeetingSolved ? "completed" : selectedVisit.status,
        visitNotesTimeline: [...(selectedVisit.visitNotesTimeline || []), data.data]
      });

      setNewMeetingNote("");
      setIsMeetingSolved(false);
      
      toast({
        title: "Berhasil",
        description: "Catatan pertemuan berhasil ditambahkan",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menyimpan catatan",
        variant: "destructive",
      });
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleDeleteClick = (visit: Visit) => {
    setVisitToDelete(visit);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!visitToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/visits/${visitToDelete.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Gagal menghapus kunjungan");
      }

      await loadVisits();
      setIsDeleteDialogOpen(false);
      setVisitToDelete(null);
      toast({
        title: "Berhasil",
        description: "Data kunjungan berhasil dihapus",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menghapus kunjungan",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // === NEW HANDLERS ===

  // Mark unavailable — guru menandai tidak tersedia
  const handleMarkUnavailable = async (visit: Visit) => {
    if (!adminData?.id) return;
    try {
      const response = await fetch(`/api/visits/${visit.id}/unavailable`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: adminData.id }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Gagal menandai tidak tersedia");
      }
      await loadVisits();
      toast({
        title: "Ditandai Tidak Tersedia",
        description: "Siswa akan diberitahu untuk memilih guru lain atau mengusulkan waktu baru.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menandai tidak tersedia",
        variant: "destructive",
      });
    }
  };

  // Wait/Hold — guru meminta siswa menunggu
  const handleOpenWaitDialog = (visit: Visit) => {
    setVisitToWait(visit);
    setWaitDuration("15");
    setIsWaitDialogOpen(true);
  };

  const handleSubmitWait = async () => {
    if (!visitToWait || !adminData?.id) return;
    setIsSettingWait(true);
    try {
      const response = await fetch(`/api/visits/${visitToWait.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "wait",
          waitDurationMinutes: parseInt(waitDuration) || 15,
          approvedBy: adminData.id,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Gagal meminta siswa menunggu");
      }
      await loadVisits();
      setIsWaitDialogOpen(false);
      setVisitToWait(null);
      toast({
        title: "Siswa Diminta Menunggu",
        description: `Siswa akan menunggu selama ${waitDuration} menit.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal meminta siswa menunggu",
        variant: "destructive",
      });
    } finally {
      setIsSettingWait(false);
    }
  };

  // Delegation response — guru baru terima/tolak delegasi dari siswa
  const handleDelegationResponse = async (visit: Visit, response: "approve" | "reject") => {
    if (!adminData?.id) return;
    try {
      const res = await fetch(`/api/visits/${visit.id}/teacher-response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: adminData.id, response }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal memproses respons");
      }
      await loadVisits();
      toast({
        title: response === "approve" ? "Delegasi Diterima" : "Delegasi Ditolak",
        description: response === "approve"
          ? "Kunjungan disetujui. Siswa akan diberitahu."
          : "Delegasi ditolak. Siswa akan diminta memilih guru lain.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal memproses respons",
        variant: "destructive",
      });
    }
  };

  // Time negotiation response — guru terima/tolak usulan waktu dari siswa
  const handleOpenTimeNegotiationReview = (visit: Visit) => {
    setVisitToReviewTime(visit);
    setIsTimeNegotiationReviewOpen(true);
  };

  const handleTimeNegotiationResponse = async (response: "approve" | "reject") => {
    if (!visitToReviewTime || !adminData?.id) return;
    setIsRespondingTime(true);
    try {
      const res = await fetch(`/api/visits/${visitToReviewTime.id}/time-negotiation-response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: adminData.id, response }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal memproses respons waktu");
      }
      await loadVisits();
      setIsTimeNegotiationReviewOpen(false);
      setVisitToReviewTime(null);
      toast({
        title: response === "approve" ? "Waktu Disetujui" : "Waktu Ditolak",
        description: response === "approve"
          ? "Usulan waktu disetujui. Kunjungan dijadwalkan."
          : "Usulan waktu ditolak. Siswa akan diminta memilih opsi lain.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal memproses respons",
        variant: "destructive",
      });
    } finally {
      setIsRespondingTime(false);
    }
  };

  // Mark available — guru menandai diri tersedia di tengah waktu tunggu
  const handleMarkAvailable = async (visit: Visit) => {
    if (!adminData?.id) return;
    try {
      const response = await fetch(`/api/visits/${visit.id}/teacher-available`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: adminData.id }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Gagal menandai tersedia");
      }
      await loadVisits();
      toast({
        title: "Ditandai Tersedia",
        description: "Siswa akan diminta konfirmasi apakah masih tersedia.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menandai tersedia",
        variant: "destructive",
      });
    }
  };

  // Helper: check if this visit is delegated TO the current admin and pending acceptance
  const isDelegatedToMe = (visit: Visit) =>
    visit.delegatedToTeacherId === adminData?.id &&
    visit.delegationStatus === "pending";

  // Helper: check if this visit is delegated TO me via student delegation flow
  const isStudentDelegatedToMe = (visit: Visit) =>
    visit.status === "pending_delegation" &&
    visit.assignedAdminId === adminData?.id;

  // Render action buttons based on role and visit state
  const renderActionButtons = (visit: Visit) => {
    const buttons: JSX.Element[] = [];

    // Detail button always available
    buttons.push(
      <Button
        key="detail"
        size="default"
        variant="outline"
        onClick={() => handleViewDetail(visit)}
        title="Lihat Detail"
        className="font-medium bg-white hover:bg-slate-100"
      >
        <FileEdit className="h-4 w-4 mr-2" />
        Detail
      </Button>,
    );

    // CASE 1: Visit is delegated to me and pending my acceptance
    if (isDelegatedToMe(visit)) {
      buttons.push(
        <Button
          key="accept"
          size="default"
          onClick={() => handleAcceptDelegation(visit)}
          className="bg-green-600 hover:bg-green-700 font-medium"
          title="Terima Delegasi"
        >
          <UserCheck className="h-4 w-4 mr-2" />
          Terima
        </Button>,
        <Button
          key="reject"
          size="default"
          variant="destructive"
          onClick={() => handleRejectDelegation(visit)}
          title="Tolak Delegasi"
          className="font-medium"
        >
          <UserX className="h-4 w-4 mr-2" />
          Tolak
        </Button>,
      );
      return <div className="flex gap-2">{buttons}</div>;
    }

    // CASE 2: Pending visit targeted to me (regular teacher)
    if (visit.status === "pending" && visit.targetTeacherId === adminData?.id) {
      buttons.push(
        <Button
          key="approve"
          size="default"
          onClick={() => handleUpdateVisitStatus(visit.id, "approved")}
          className="bg-green-600 hover:bg-green-700 font-medium"
          title="Setujui Pertemuan"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Setujui
        </Button>,
        <Button
          key="unavailable"
          size="default"
          variant="outline"
          onClick={() => handleMarkUnavailable(visit)}
          className="border-red-400 text-red-600 hover:bg-red-50 font-medium"
          title="Tidak Tersedia"
        >
          <Ban className="h-4 w-4 mr-2" />
          Tolak
        </Button>,
        <Button
          key="wait"
          size="default"
          variant="outline"
          onClick={() => handleOpenWaitDialog(visit)}
          className="border-amber-400 text-amber-600 hover:bg-amber-50 font-medium hidden md:inline-flex"
          title="Minta Tunggu"
        >
          <Timer className="h-4 w-4 mr-2" />
          Tunda
        </Button>,
        <Button
          key="forward"
          size="default"
          variant="outline"
          onClick={() => handleOpenForwardDialog(visit)}
          className="border-blue-600 text-blue-600 hover:bg-blue-50 font-medium hidden md:inline-flex"
          title="Serahkan ke Koordinator"
        >
          <Forward className="h-4 w-4 mr-2" />
          Alihkan
        </Button>,
      );
    }

    // CASE 2b: Delegasi masuk dari siswa (PENDING_DELEGATION) — guru baru terima/tolak
    if (isStudentDelegatedToMe(visit)) {
      buttons.push(
        <Button
          key="accept-delegation"
          size="default"
          onClick={() => handleDelegationResponse(visit, "approve")}
          className="bg-green-600 hover:bg-green-700 font-medium"
          title="Terima Delegasi"
        >
          <UserCheck className="h-4 w-4 mr-2" />
          Terima
        </Button>,
        <Button
          key="reject-delegation"
          size="default"
          variant="destructive"
          onClick={() => handleDelegationResponse(visit, "reject")}
          title="Tolak Delegasi"
          className="font-medium"
        >
          <UserX className="h-4 w-4 mr-2" />
          Tolak
        </Button>,
      );
      return <div className="flex gap-2">{buttons}</div>;
    }

    // CASE 2c: Negosiasi waktu dari siswa (PENDING_TIME_NEGOTIATION)
    if (visit.status === "pending_time_negotiation" && visit.targetTeacherId === adminData?.id) {
      buttons.push(
        <Button
          key="review-time"
          size="default"
          onClick={() => handleOpenTimeNegotiationReview(visit)}
          className="bg-purple-600 hover:bg-purple-700 font-medium"
          title="Tinjau Usulan Waktu"
        >
          <Clock className="h-4 w-4 mr-2" />
          Tinjau Waktu
        </Button>,
      );
      return <div className="flex gap-2">{buttons}</div>;
    }

    // CASE 2d: WAITING visit — guru bisa tandai tersedia
    if (visit.status === "waiting" && visit.targetTeacherId === adminData?.id) {
      buttons.push(
        <Button
          key="available"
          size="default"
          onClick={() => handleMarkAvailable(visit)}
          className="bg-green-600 hover:bg-green-700 font-medium"
          title="Saya Tersedia — beritahu siswa"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Tandai Tersedia
        </Button>,
      );
    }

    // CASE 3: Forwarded visit — coordinator can delegate
    if (visit.status === "forwarded" && isCoordinator) {
      // Show delegate button if no delegation is pending
      if (!visit.delegationStatus || visit.delegationStatus === "rejected") {
        buttons.push(
          <Button
            key="delegate"
            size="default"
            onClick={() => handleOpenDelegateDialog(visit)}
            className="bg-indigo-600 hover:bg-indigo-700 font-medium"
            title="Delegasikan ke Guru Lain"
          >
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            Alihkan Guru
          </Button>,
        );
      }
    }

    // CASE 4: Approved visit — mark complete
    if (
      visit.status === "approved" &&
      (visit.targetTeacherId === adminData?.id || isCoordinator)
    ) {
      buttons.push(
        <Button
          key="complete"
          size="default"
          variant="outline"
          onClick={() => handleUpdateVisitStatus(visit.id, "completed")}
          className="border-green-600 text-green-600 hover:bg-green-50 font-medium"
          title="Tandai Selesai"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Selesaikan
        </Button>,
      );
    }

    // CASE 5: Completed/Cancelled — allow delete
    if (visit.status === "completed" || visit.status === "cancelled") {
      buttons.push(
        <Button
          key="delete"
          size="default"
          variant="destructive"
          onClick={() => handleDeleteClick(visit)}
          title="Hapus Data"
          className="font-medium"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Hapus
        </Button>,
      );
    }

    return <div className="flex gap-2">{buttons}</div>;
  };

  // Render delegation info badge for table
  const renderDelegationInfo = (visit: Visit) => {
    if (visit.status === "forwarded") {
      if (visit.delegationStatus === "pending" && visit.delegatedToTeacher) {
        return (
          <Badge
            variant="outline"
            className="text-xs bg-amber-50 text-amber-700 border-amber-200"
          >
            Delegasi → {visit.delegatedToTeacher.name} (Menunggu)
          </Badge>
        );
      }
      if (visit.delegationStatus === "rejected") {
        return (
          <Badge
            variant="outline"
            className="text-xs bg-red-50 text-red-700 border-red-200"
          >
            Delegasi ditolak - Pilih guru lain
          </Badge>
        );
      }
      return (
        <Badge
          variant="outline"
          className="text-xs bg-blue-50 text-blue-700 border-blue-200"
        >
          Menunggu delegasi koordinator
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="shadow-lg border-slate-200">
        <CardHeader className="bg-slate-50 border-b border-slate-100 rounded-t-xl pb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-slate-800">Daftar Kunjungan Murid</CardTitle>
              <CardDescription className="text-base text-slate-600 mt-1">
                Kelola jadwal pertemuan dan riwayat kunjungan murid Anda
              </CardDescription>
            </div>

            {/* Filter dan Search */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Input
                placeholder="🔍 Cari nama murid atau kelas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-72 h-11 text-base bg-white"
              />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-48 h-11 bg-white text-base">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Menunggu Anda</SelectItem>
                  <SelectItem value="approved">Disetujui</SelectItem>
                  <SelectItem value="completed">Selesai</SelectItem>
                  <SelectItem value="cancelled">Dibatalkan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Statistics Summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="font-semibold text-yellow-800">Menunggu Anda</span>
              </div>
              <p className="text-3xl font-black text-yellow-600 mt-3">
                {visits.filter((v) => v.status === "pending").length}
              </p>
            </div>
            <div className="bg-blue-50 p-5 rounded-xl border border-blue-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <Forward className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-800">Dialihkan</span>
              </div>
              <p className="text-3xl font-black text-blue-600 mt-3">
                {visits.filter((v) => v.status === "forwarded").length}
              </p>
            </div>
            <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-indigo-600" />
                <span className="font-semibold text-indigo-800">Disetujui</span>
              </div>
              <p className="text-3xl font-black text-indigo-600 mt-3">
                {visits.filter((v) => v.status === "approved").length}
              </p>
            </div>
            <div className="bg-green-50 p-5 rounded-xl border border-green-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-800">Selesai</span>
              </div>
              <p className="text-3xl font-black text-green-600 mt-3">
                {visits.filter((v) => v.status === "completed").length}
              </p>
            </div>
            <div className="bg-red-50 p-5 rounded-xl border border-red-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="font-semibold text-red-800">Dibatalkan</span>
              </div>
              <p className="text-3xl font-black text-red-600 mt-3">
                {visits.filter((v) => v.status === "cancelled").length}
              </p>
            </div>
          </div>

          {/* Coordinator: Forwarded Visits Panel */}
          {isCoordinator &&
            (() => {
              const forwardedVisits = visits.filter(
                (v) => v.status === "forwarded",
              );
              const awaitingDelegation = forwardedVisits.filter(
                (v) => !v.delegationStatus || v.delegationStatus === "rejected",
              );
              const pendingAcceptance = forwardedVisits.filter(
                (v) => v.delegationStatus === "pending",
              );

              if (forwardedVisits.length > 0)
                return (
                  <div className="mb-8 p-5 bg-indigo-50 rounded-xl border border-indigo-200 shadow-sm">
                    <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
                      <ArrowRightLeft className="h-6 w-6" />
                      Tugas Koordinator: Data yang Dialihkan ke Anda
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm flex flex-col justify-center items-center">
                        <p className="text-sm font-medium text-slate-500">
                          Total Dialihkan
                        </p>
                        <p className="text-3xl font-black text-indigo-600 mt-1">
                          {forwardedVisits.length}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm flex flex-col justify-center items-center">
                        <p className="text-sm font-medium text-slate-500">
                          Perlu Anda Pilihkan Guru
                        </p>
                        <p className="text-3xl font-black text-orange-600 mt-1">
                          {awaitingDelegation.length}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm flex flex-col justify-center items-center">
                        <p className="text-sm font-medium text-slate-500 text-center">
                          Menunggu Jawaban Guru Tujuan
                        </p>
                        <p className="text-3xl font-black text-amber-600 mt-1">
                          {pendingAcceptance.length}
                        </p>
                      </div>
                    </div>
                    
                    {awaitingDelegation.length > 0 && (
                      <div className="space-y-3 mt-6">
                        <p className="text-base font-bold text-indigo-800 border-b border-indigo-200 pb-2">
                          Segera Pilihkan Guru Baru Untuk:
                        </p>
                        {awaitingDelegation.map((v) => (
                          <div
                            key={v.id}
                            className="flex flex-col md:flex-row md:items-center justify-between bg-white p-4 rounded-lg border shadow-sm gap-4"
                          >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-lg text-slate-800">
                                    {v.studentName}
                                    </span>
                                    <Badge variant="secondary" className="text-xs">
                                    {typeof v.class === 'object' ? (v.class as any).name : v.class}
                                    </Badge>
                                </div>
                              
                              <p className="text-sm text-slate-700 bg-slate-50 p-2 inline-block rounded mt-1 border border-slate-100">
                                Keperluan: {v.reason}
                              </p>
                              
                              <div className="mt-2 flex flex-col gap-1">
                                {v.targetTeacher && (
                                    <span className="text-sm text-slate-600 font-medium flex items-center gap-1">
                                    <Ban className="w-3 h-3 text-red-500" /> Guru sebelumnya ({v.targetTeacher.name}) tidak bisa.
                                    </span>
                                )}
                                {v.notes && (
                                    <span className="text-sm text-red-600 font-medium">
                                    Alasan: "{v.forwardReason || v.notes}"
                                    </span>
                                )}
                              </div>
                            </div>
                            <Button
                              size="lg"
                              onClick={() => handleOpenDelegateDialog(v)}
                              className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto text-base shadow-sm"
                            >
                              <ArrowRightLeft className="h-5 w-5 mr-2" />
                              Pilih Guru Baru
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {pendingAcceptance.length > 0 && (
                      <div className="space-y-3 mt-6">
                        <p className="text-base font-bold text-amber-800 border-b border-amber-200 pb-2">
                          Menunggu Jawaban dari Guru yang Anda Tunjuk:
                        </p>
                        {pendingAcceptance.map((v) => (
                          <div
                            key={v.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-lg border border-amber-100 gap-3"
                          >
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-base text-slate-800">
                                        {v.studentName}
                                    </span>
                                    <span className="text-slate-500 text-sm">
                                        ({typeof v.class === 'object' ? (v.class as any).name : v.class})
                                    </span>
                                </div>
                              
                              {v.delegatedToTeacher && (
                                <div className="mt-2 flex items-center text-sm">
                                  <span className="text-slate-600 mr-2">Sudah dialihkan ke:</span>
                                  <Badge className="bg-amber-100 text-amber-800 border border-amber-300 font-semibold hover:bg-amber-100">
                                    {v.delegatedToTeacher.name}
                                  </Badge>
                                </div>
                              )}
                            </div>
                            <Badge
                              variant="outline"
                              className="text-sm bg-yellow-50 text-yellow-700 w-fit h-fit px-3 py-1"
                            >
                              <Timer className="w-3 h-3 mr-1" /> Sedang Menunggu Jawaban
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              return null;
            })()}

          {/* Delegation incoming panel for regular teachers */}
          {!isCoordinator &&
            (() => {
              const delegatedToMe = visits.filter((v) => isDelegatedToMe(v));
              if (delegatedToMe.length > 0)
                return (
                  <div className="mb-8 p-5 bg-amber-50 rounded-xl border border-amber-200 shadow-sm">
                    <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
                      <UserCheck className="h-6 w-6" />
                      Tugas Baru: Delegasi dari Guru Lain
                    </h3>
                    <div className="space-y-3">
                      {delegatedToMe.map((v) => (
                        <div
                          key={v.id}
                          className="flex flex-col md:flex-row md:items-center justify-between bg-white p-4 rounded-lg border border-amber-100 shadow-sm gap-4"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-lg text-slate-800">
                                {v.studentName}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                {typeof v.class === 'object' ? (v.class as any).name : v.class}
                                </Badge>
                            </div>
                            <p className="text-sm text-slate-700 font-medium bg-slate-50 p-2 rounded inline-block mt-1">
                              "{v.reason}"
                            </p>
                            <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                {v.targetTeacher && (
                                <p className="text-sm text-slate-600 flex items-center gap-1">
                                    <ArrowRightLeft className="h-4 w-4" /> Dari: <span className="font-semibold">{v.targetTeacher.name}</span>
                                </p>
                                )}
                                <div className="flex items-center gap-1.5 text-sm font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded">
                                <Calendar className="h-4 w-4" />
                                {new Date(v.visitDate).toLocaleDateString(
                                    "id-ID",
                                    { day: "numeric", month: "long", year: "numeric" }
                                )}
                                <Clock className="h-4 w-4 ml-1" />
                                {v.visitTime} WIB
                                </div>
                            </div>
                            {v.delegationNotes && (
                              <p className="text-sm text-indigo-700 bg-indigo-50 p-2 rounded mt-2 border border-indigo-100">
                                <strong>Catatan Koordinator:</strong> {v.delegationNotes}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 md:w-auto w-full">
                            <Button
                              size="lg"
                              onClick={() => handleAcceptDelegation(v)}
                              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto text-base"
                            >
                              <UserCheck className="h-5 w-5 mr-2" />
                              Terima Tugas Ini
                            </Button>
                            <Button
                              size="lg"
                              variant="outline"
                              onClick={() => handleRejectDelegation(v)}
                              className="border-red-200 text-red-700 hover:bg-red-50 w-full sm:w-auto text-base"
                            >
                              <UserX className="h-5 w-5 mr-2" />
                              Tolak
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              return null;
            })()}

          {/* Student delegation panel — guru baru menerima delegasi dari siswa */}
          {(() => {
            const studentDelegatedToMe = visits.filter((v) => isStudentDelegatedToMe(v));
            if (studentDelegatedToMe.length > 0)
              return (
                <div className="mb-8 p-5 bg-blue-50 rounded-xl border border-blue-200 shadow-sm">
                  <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <UserCheck className="h-6 w-6" />
                    Tugas Baru: Permintaan Langsung dari Siswa
                  </h3>
                  <div className="space-y-3">
                    {studentDelegatedToMe.map((v) => (
                      <div
                        key={v.id}
                        className="flex flex-col md:flex-row md:items-center justify-between bg-white p-4 rounded-lg border border-blue-100 shadow-sm gap-4"
                      >
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-lg text-slate-800">
                                {v.studentName}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                {typeof v.class === 'object' ? (v.class as any).name : v.class}
                                </Badge>
                            </div>
                          <p className="text-sm text-slate-700 font-medium bg-slate-50 p-2 rounded inline-block mt-1">
                            "{v.reason}"
                          </p>
                          <div className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded w-fit">
                            <Calendar className="h-4 w-4" />
                            {new Date(v.visitDate).toLocaleDateString("id-ID", {
                              day: "numeric", month: "long", year: "numeric",
                            })}
                            <Clock className="h-4 w-4 ml-2" />
                            {v.visitTime} WIB
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 md:w-auto w-full">
                          <Button
                            size="lg"
                            onClick={() => handleDelegationResponse(v, "approve")}
                            className="bg-green-600 hover:bg-green-700 w-full sm:w-auto text-base"
                          >
                            <UserCheck className="h-5 w-5 mr-2" />
                            Terima Jadwal
                          </Button>
                          <Button
                            size="lg"
                            variant="outline"
                            onClick={() => handleDelegationResponse(v, "reject")}
                            className="border-red-200 text-red-700 hover:bg-red-50 w-full sm:w-auto text-base"
                          >
                            <UserX className="h-5 w-5 mr-2" />
                            Tolak Permintaan
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            return null;
          })()}

          {/* Time negotiation panel — guru menerima usulan waktu dari siswa */}
          {(() => {
            const timeNegotiations = visits.filter(
              (v) => v.status === "pending_time_negotiation" && v.targetTeacherId === adminData?.id,
            );
            if (timeNegotiations.length > 0)
              return (
                <div className="mb-8 p-5 bg-purple-50 rounded-xl border border-purple-200 shadow-sm">
                  <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                    <Clock className="h-6 w-6" />
                    Tugas Baru: Ada Usulan Waktu Baru dari Siswa
                  </h3>
                  <div className="space-y-3">
                    {timeNegotiations.map((v) => (
                      <div
                        key={v.id}
                        className="flex flex-col md:flex-row md:items-center justify-between bg-white p-4 rounded-lg border border-purple-100 shadow-sm gap-4"
                      >
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="font-bold text-lg text-slate-800">
                                {v.studentName}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                {typeof v.class === 'object' ? (v.class as any).name : v.class}
                                </Badge>
                            </div>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 bg-purple-50/50 p-2 rounded-lg border border-purple-100 mt-2">
                            <div className="flex items-center gap-1.5 text-sm text-slate-500 line-through">
                              <Calendar className="h-4 w-4" />
                              {new Date(v.visitDate).toLocaleDateString("id-ID", {
                                day: "numeric", month: "short", year: "numeric"
                              })}{" "}{v.visitTime}
                            </div>
                            <span className="hidden sm:inline text-purple-400">➔</span>
                            <div className="flex items-center gap-1.5 text-base font-bold text-purple-700 bg-white px-2 py-1 rounded shadow-sm border border-purple-100">
                                <Clock className="h-4 w-4" />
                              {v.proposedVisitDate
                                ? new Date(v.proposedVisitDate).toLocaleDateString("id-ID", {
                                    day: "numeric", month: "long", year: "numeric"
                                  })
                                : "-"}{" "}
                              pukul {v.proposedVisitTime || "-"} WIB
                            </div>
                          </div>
                        </div>
                        <Button
                          size="lg"
                          onClick={() => handleOpenTimeNegotiationReview(v)}
                          className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto text-base shadow-sm"
                        >
                          <Clock className="h-5 w-5 mr-2" />
                          Tinjau Waktu Ini
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            return null;
          })()}

          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold text-base">Nama Murid</TableHead>
                  <TableHead className="font-semibold text-base">Jadwal</TableHead>
                  <TableHead className="font-semibold text-base">Keperluan</TableHead>
                  <TableHead className="font-semibold text-base">Status</TableHead>
                  <TableHead className="font-semibold text-base">Tindakan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVisits.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-slate-500 py-8"
                    >
                      {searchQuery || filterStatus !== "all"
                        ? "Tidak ada data yang sesuai dengan filter"
                        : "Belum ada data kunjungan"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVisits.map((visit) => (
                    <TableRow key={visit.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                              {(visit.studentName || "??")
                                .substring(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {visit.studentName || "Tidak ada nama"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{typeof visit.class === 'object' ? (visit.class as any).name : visit.class}</Badge>
                      </TableCell>
                      <TableCell>
                        {visit.targetTeacher ? (
                          <div className="flex flex-col gap-1">
                            <span className="text-sm">
                              {visit.targetTeacher.name}
                            </span>
                            {renderDelegationInfo(visit)}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          {new Date(visit.visitDate).toLocaleDateString(
                            "id-ID",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-slate-400" />
                          {visit.visitTime}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="truncate text-sm">{visit.reason}</p>
                      </TableCell>
                      <TableCell>{getStatusBadge(visit.status)}</TableCell>
                      <TableCell>{renderActionButtons(visit)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Result Count */}
          {filteredVisits.length > 0 && (
            <div className="mt-4 text-sm text-slate-600">
              Menampilkan {filteredVisits.length} dari {visits.length} data
              kunjungan
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl rounded-2xl overflow-hidden p-0 border-0 shadow-2xl">
          <DialogHeader className="bg-slate-50 px-6 py-5 border-b border-slate-100">
            <DialogTitle className="text-xl font-bold text-slate-800">Detail Kunjungan</DialogTitle>
            <DialogDescription className="text-slate-500">
              Informasi lengkap tentang kunjungan murid dan riwayat penanganan
            </DialogDescription>
          </DialogHeader>
          {selectedVisit && (
            <div className="p-6 max-h-[75vh] overflow-y-auto custom-scrollbar bg-white">
              
              <div className="flex flex-col md:flex-row gap-6 mb-8">
                  {/* Left Column: Student Info */}
                  <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16 border-2 border-slate-100">
                              <AvatarFallback className="bg-blue-50 text-blue-600 text-xl font-bold">
                                  {(selectedVisit.studentName || "??").substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                          </Avatar>
                          <div>
                              <h3 className="text-lg font-bold text-slate-900">{selectedVisit.studentName}</h3>
                              <Badge variant="secondary" className="mt-1 font-medium bg-slate-100 text-slate-600 hover:bg-slate-100 border-0">{typeof selectedVisit.class === 'object' ? (selectedVisit.class as any).name : selectedVisit.class}</Badge>
                          </div>
                      </div>

                      {(selectedVisit.email || selectedVisit.phone) && (
                        <div className="grid grid-cols-1 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                          {selectedVisit.email && (
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Email</p>
                              <p className="text-sm font-medium text-slate-700">{selectedVisit.email}</p>
                            </div>
                          )}
                          {selectedVisit.phone && (
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">No. Telepon</p>
                              <p className="text-sm font-medium text-slate-700">{selectedVisit.phone}</p>
                            </div>
                          )}
                        </div>
                      )}
                  </div>

                  {/* Right Column: Visit Info */}
                  <div className="flex-1 space-y-4">
                      <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-4">
                          <div>
                              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1.5">Jadwal Pertemuan</p>
                              <div className="flex flex-col gap-1.5">
                                  <div className="flex items-center text-slate-700 font-medium bg-white px-3 py-2 rounded-lg border border-slate-200/60 shadow-sm">
                                      <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                                      {new Date(selectedVisit.visitDate).toLocaleDateString("id-ID", {
                                          weekday: "long", day: "numeric", month: "long", year: "numeric",
                                      })}
                                  </div>
                                  <div className="flex items-center text-slate-700 font-medium bg-white px-3 py-2 rounded-lg border border-slate-200/60 shadow-sm w-fit">
                                      <Clock className="h-4 w-4 mr-2 text-blue-500" />
                                      {selectedVisit.visitTime} WIB
                                  </div>
                              </div>
                          </div>
                          
                          <div>
                              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1.5">Status Saat Ini</p>
                              <div>{getStatusBadge(selectedVisit.status)}</div>
                          </div>

                          {selectedVisit.targetTeacher && (
                              <div>
                                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1.5">Guru Tujuan</p>
                                  <div className="flex items-center gap-2">
                                      <UserCheck className="w-4 h-4 text-slate-400" />
                                      <span className="font-medium text-slate-700">{selectedVisit.targetTeacher.name}</span>
                                  </div>
                              </div>
                          )}
                      </div>
                  </div>
              </div>

              {/* Delegation Info */}
              {selectedVisit.forwardedToCoordinator && (
                <div className="mb-8 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                  <h4 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
                      <ArrowRightLeft className="w-4 h-4" /> Riwayat Pengalihan Tugas
                  </h4>
                  <div className="space-y-3 bg-white p-3 rounded-lg border border-indigo-50">
                    <div className="flex justify-between items-start">
                        <span className="text-sm text-slate-500 font-medium min-w-[120px]">Status</span>
                        <span className="text-sm font-semibold text-slate-800 text-right">Diserahkan ke koordinator</span>
                    </div>
                    {selectedVisit.forwardReason && (
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-slate-500 font-medium min-w-[120px]">Alasan Penyerahan</span>
                        <span className="text-sm font-medium text-red-600 bg-red-50 px-2 py-1 rounded text-right">{selectedVisit.forwardReason}</span>
                      </div>
                    )}
                    {selectedVisit.delegatedToTeacher && (
                      <div className="flex justify-between items-start pt-2 border-t border-slate-100 mt-2">
                        <span className="text-sm text-slate-500 font-medium min-w-[120px]">Dialihkan Ke</span>
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-sm font-bold text-indigo-700">{selectedVisit.delegatedToTeacher.name}</span>
                            {selectedVisit.delegationStatus && (
                                <Badge variant="outline" className={`text-xs ${selectedVisit.delegationStatus === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200' : selectedVisit.delegationStatus === 'accepted' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                    {selectedVisit.delegationStatus === "pending" ? "Menunggu Persetujuan" : selectedVisit.delegationStatus === "accepted" ? "Tugas Diterima" : "Tugas Ditolak"}
                                </Badge>
                            )}
                        </div>
                      </div>
                    )}
                    {selectedVisit.delegationNotes && (
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-slate-500 font-medium min-w-[120px]">Pesan Koordinator</span>
                        <span className="text-sm font-medium text-slate-700 text-right bg-slate-50 p-2 rounded">{selectedVisit.delegationNotes}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Reason */}
              <div className="mb-8">
                <Label className="text-base font-bold text-slate-800 mb-2 block">
                  Keperluan / Tujuan Kunjungan
                </Label>
                <div className="text-base p-4 bg-slate-50/80 rounded-xl border border-slate-100 text-slate-700 leading-relaxed font-medium">
                  {selectedVisit.reason}
                </div>
              </div>

              <Separator className="my-8" />

              {/* Timeline */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label className="text-xl font-bold text-slate-800">
                    Riwayat Penanganan
                  </Label>
                  <Badge variant={selectedVisit.status === "completed" ? "default" : "secondary"} className="px-3 py-1 text-sm font-semibold shadow-sm">
                    {selectedVisit.status === "completed" ? "Sudah Selesai" : "Sedang Berjalan"}
                  </Badge>
                </div>
                
                {selectedVisit.visitNotesTimeline && selectedVisit.visitNotesTimeline.length > 0 ? (
                  <div className="space-y-6 pl-4 border-l-2 border-blue-200 ml-2">
                    {selectedVisit.visitNotesTimeline.map((note, idx) => (
                      <div key={note.id || idx} className="relative">
                        <div className={`absolute -left-[23px] mt-1.5 h-4 w-4 rounded-full border-4 border-white shadow-sm ${note.isSolved ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                        <div className="bg-white border border-slate-200 shadow-sm p-5 rounded-xl transition-all hover:shadow-md">
                          <div className="flex justify-between items-start mb-3 border-b border-slate-100 pb-3">
                            <span className="font-bold text-base text-slate-800 flex items-center gap-2">
                                <FileEdit className="w-4 h-4 text-blue-500" /> Catatan Pertemuan {idx + 1}
                            </span>
                            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                              {new Date(note.createdAt).toLocaleString("id-ID", {
                                day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                              })} WIB
                            </span>
                          </div>
                          <p className="text-base text-slate-700 whitespace-pre-wrap leading-relaxed">{note.note}</p>
                          <div className="mt-4 flex items-center gap-2">
                              {note.isSolved ? (
                                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50"><CheckCircle className="w-3 h-3 mr-1"/> Masalah Terselesaikan</Badge>
                              ) : (
                                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50"><Timer className="w-3 h-3 mr-1"/> Belum Selesai</Badge>
                              )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-slate-400">
                    <FileEdit className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">Belum ada catatan penanganan untuk siswa ini.</p>
                  </div>
                )}
                
                {/* Add new note form */}
                {selectedVisit.status !== "completed" && (
                  <div className="mt-8 space-y-4 bg-blue-50/30 border border-blue-100 p-6 rounded-2xl shadow-sm">
                    <Label htmlFor="newNote" className="font-bold text-lg text-blue-900 flex items-center gap-2">
                        <FileEdit className="w-5 h-5 text-blue-600" />
                        Tambah Catatan Baru
                    </Label>
                    <p className="text-sm text-slate-500 mb-2">Tuliskan hasil pertemuan, perkembangan, atau tindakan selanjutnya.</p>
                    <Textarea
                      id="newNote"
                      placeholder="Ketik catatan di sini..."
                      value={newMeetingNote}
                      onChange={(e) => setNewMeetingNote(e.target.value)}
                      rows={5}
                      className="bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 resize-none text-base p-4"
                    />
                    <div className="flex items-center space-x-3 mt-4 bg-white p-3 rounded-xl border border-slate-200 w-fit">
                      <input 
                        type="checkbox" 
                        id="isSolved" 
                        checked={isMeetingSolved}
                        onChange={(e) => setIsMeetingSolved(e.target.checked)}
                        className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600 cursor-pointer"
                      />
                      <Label htmlFor="isSolved" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                        Tandai masalah ini sudah selesai (Tutup Kasus)
                      </Label>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-8 pt-4 border-t border-slate-100 text-right">
                  <p className="text-xs font-medium text-slate-400">
                      ID Laporan dibuat pada: {new Date(selectedVisit.createdAt).toLocaleString("id-ID", {
                          day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
                      })} WIB
                  </p>
              </div>

            </div>
          )}
          <DialogFooter className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex sm:justify-between items-center">
            <Button variant="ghost" onClick={() => setIsDetailOpen(false)} className="font-semibold text-slate-600 hover:text-slate-900">
              Tutup
            </Button>
            {selectedVisit?.status !== "completed" && (
              <Button 
                onClick={handleAddMeetingNote} 
                disabled={isAddingNote || !newMeetingNote.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md px-6"
              >
                {isAddingNote ? (
                    <><span className="animate-spin mr-2">⏳</span> Menyimpan...</>
                ) : (
                    <><CheckCircle className="w-4 h-4 mr-2" /> Simpan Catatan</>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Konfirmasi Hapus */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Konfirmasi Hapus
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus data kunjungan ini? Tindakan ini
              tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          {visitToDelete && (
            <div className="py-4 space-y-2">
              <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Nama Murid:</span>
                  <span className="font-medium">
                    {visitToDelete.studentName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Kelas:</span>
                  <span className="font-medium">{visitToDelete.class}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Tanggal:</span>
                  <span className="font-medium">
                    {new Date(visitToDelete.visitDate).toLocaleDateString(
                      "id-ID",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      },
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Status:</span>
                  {getStatusBadge(visitToDelete.status)}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setVisitToDelete(null);
              }}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Hapus
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Delegasi ke Guru Lain (Koordinator) */}
      <Dialog
        open={isDelegateDialogOpen}
        onOpenChange={setIsDelegateDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-indigo-600">
              <ArrowRightLeft className="h-5 w-5" />
              Delegasikan ke Guru Lain
            </DialogTitle>
            <DialogDescription>
              Pilih guru BK yang akan menangani kunjungan ini. Guru tersebut
              harus menyetujui sebelum kunjungan bisa dilanjutkan.
            </DialogDescription>
          </DialogHeader>
          {visitToDelegate && (
            <div className="space-y-4 py-4">
              {/* Visit info summary */}
              <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Murid:</span>
                  <span className="font-medium">
                    {visitToDelegate.studentName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Kelas:</span>
                  <span className="font-medium">{visitToDelegate.class}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Keperluan:</span>
                  <span className="font-medium text-right max-w-[200px] truncate">
                    {visitToDelegate.reason}
                  </span>
                </div>
                {visitToDelegate.targetTeacher && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Guru asal:</span>
                    <span className="font-medium">
                      {visitToDelegate.targetTeacher.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Teacher selection */}
              <div className="space-y-2">
                <Label>Pilih Guru BK Pengganti</Label>
                <Select
                  value={selectedDelegateTeacherId}
                  onValueChange={setSelectedDelegateTeacherId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih guru BK..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTeachers.length === 0 ? (
                      <div className="px-2 py-3 text-sm text-muted-foreground text-center">
                        Tidak ada guru tersedia
                      </div>
                    ) : (
                      availableTeachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Delegation notes */}
              <div className="space-y-2">
                <Label htmlFor="delegationNotes">
                  Catatan Delegasi (opsional)
                </Label>
                <Textarea
                  id="delegationNotes"
                  placeholder="Tambahkan catatan untuk guru yang ditunjuk..."
                  value={delegationNotes}
                  onChange={(e) => setDelegationNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDelegateDialogOpen(false);
                setVisitToDelegate(null);
              }}
              disabled={isDelegating}
            >
              Batal
            </Button>
            <Button
              onClick={handleDelegateVisit}
              disabled={isDelegating || !selectedDelegateTeacherId}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              {isDelegating ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Mendelegasikan...
                </>
              ) : (
                <>
                  <ArrowRightLeft className="h-4 w-4" />
                  Delegasikan
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Serahkan ke Koordinator */}
      <Dialog open={isForwardDialogOpen} onOpenChange={setIsForwardDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-600">
              <Forward className="h-5 w-5" />
              Serahkan ke Koordinator
            </DialogTitle>
            <DialogDescription>
              Kunjungan ini akan diserahkan ke koordinator untuk didelegasikan
              ke guru BK lain. Koordinator akan memilih guru pengganti yang
              sesuai.
            </DialogDescription>
          </DialogHeader>
          {visitToForward && (
            <div className="space-y-4 py-4">
              {/* Visit summary */}
              <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Murid:</span>
                  <span className="font-medium">
                    {visitToForward.studentName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Kelas:</span>
                  <span className="font-medium">{visitToForward.class}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Tanggal:</span>
                  <span className="font-medium">
                    {new Date(visitToForward.visitDate).toLocaleDateString(
                      "id-ID",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      },
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Keperluan:</span>
                  <span className="font-medium text-right max-w-[200px] truncate">
                    {visitToForward.reason}
                  </span>
                </div>
              </div>

              {/* Forward reason */}
              <div className="space-y-2">
                <Label htmlFor="forwardReason">
                  Alasan Penyerahan (opsional)
                </Label>
                <Textarea
                  id="forwardReason"
                  placeholder="Jelaskan alasan mengapa kunjungan ini perlu diserahkan ke koordinator, misalnya: tidak sesuai bidang keahlian, jadwal bentrok, dll."
                  value={forwardReason}
                  onChange={(e) => setForwardReason(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Info box */}
              <div className="flex gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <AlertTriangle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-800">
                  <p className="font-medium mb-1">
                    Apa yang terjadi selanjutnya?
                  </p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>Koordinator akan menerima laporan ini</li>
                    <li>Koordinator akan mendelegasikan ke guru BK lain</li>
                    <li>
                      Guru yang ditunjuk harus menyetujui sebelum kunjungan
                      dilanjutkan
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsForwardDialogOpen(false);
                setVisitToForward(null);
              }}
              disabled={isForwarding}
            >
              Batal
            </Button>
            <Button
              onClick={handleForwardToCoordinator}
              disabled={isForwarding}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {isForwarding ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Menyerahkan...
                </>
              ) : (
                <>
                  <Forward className="h-4 w-4" />
                  Serahkan ke Koordinator
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Dialog Minta Tunggu (Wait/Hold) */}
      <Dialog open={isWaitDialogOpen} onOpenChange={setIsWaitDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <Timer className="h-5 w-5" />
              Minta Siswa Menunggu
            </DialogTitle>
            <DialogDescription>
              Siswa akan diminta untuk menunggu selama durasi yang Anda tentukan.
              Setelah waktu habis, status kunjungan akan otomatis diperbarui.
            </DialogDescription>
          </DialogHeader>
          {visitToWait && (
            <div className="space-y-4 py-4">
              {/* Visit summary */}
              <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Murid:</span>
                  <span className="font-medium">{visitToWait.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Jadwal:</span>
                  <span className="font-medium">
                    {new Date(visitToWait.visitDate).toLocaleDateString("id-ID", {
                      day: "numeric", month: "short", year: "numeric",
                    })}{" "}{visitToWait.visitTime} WIB
                  </span>
                </div>
              </div>

              {/* Duration input */}
              <div className="space-y-2">
                <Label htmlFor="waitDuration">Durasi Tunggu (menit)</Label>
                <Select value={waitDuration} onValueChange={setWaitDuration}>
                  <SelectTrigger id="waitDuration">
                    <SelectValue placeholder="Pilih durasi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 menit</SelectItem>
                    <SelectItem value="10">10 menit</SelectItem>
                    <SelectItem value="15">15 menit</SelectItem>
                    <SelectItem value="30">30 menit</SelectItem>
                    <SelectItem value="45">45 menit</SelectItem>
                    <SelectItem value="60">60 menit (1 jam)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Info box */}
              <div className="flex gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800">
                  <p className="font-medium mb-1">Apa yang terjadi?</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>Siswa akan melihat countdown timer menunggu</li>
                    <li>Setelah waktu habis, status akan otomatis diperbarui</li>
                    <li>Anda tetap bisa mengubah status kunjungan kapan saja</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsWaitDialogOpen(false);
                setVisitToWait(null);
              }}
              disabled={isSettingWait}
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmitWait}
              disabled={isSettingWait}
              className="gap-2 bg-amber-600 hover:bg-amber-700"
            >
              {isSettingWait ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Memproses...
                </>
              ) : (
                <>
                  <Timer className="h-4 w-4" />
                  Minta Tunggu
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Tinjau Negosiasi Waktu */}
      <Dialog open={isTimeNegotiationReviewOpen} onOpenChange={setIsTimeNegotiationReviewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-purple-600">
              <Clock className="h-5 w-5" />
              Tinjau Usulan Waktu Baru
            </DialogTitle>
            <DialogDescription>
              Siswa telah mengusulkan waktu kunjungan baru. Tinjau dan putuskan apakah Anda menyetujui atau menolak.
            </DialogDescription>
          </DialogHeader>
          {visitToReviewTime && (
            <div className="space-y-4 py-4">
              {/* Visit info */}
              <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Murid:</span>
                  <span className="font-medium">{visitToReviewTime.studentName}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Jadwal Awal:</span>
                  <span className="font-medium text-slate-500 line-through">
                    {new Date(visitToReviewTime.visitDate).toLocaleDateString("id-ID", {
                      day: "numeric", month: "short", year: "numeric",
                    })}{" "}{visitToReviewTime.visitTime} WIB
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Usulan Baru:</span>
                  <span className="font-bold text-purple-700">
                    {visitToReviewTime.proposedVisitDate
                      ? new Date(visitToReviewTime.proposedVisitDate).toLocaleDateString("id-ID", {
                          day: "numeric", month: "short", year: "numeric",
                        })
                      : "-"}{" "}
                    {visitToReviewTime.proposedVisitTime || "-"} WIB
                  </span>
                </div>
              </div>

              {/* Alasan kunjungan */}
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <p className="text-xs text-purple-600 font-medium mb-1">Alasan Kunjungan:</p>
                <p className="text-sm text-purple-900">{visitToReviewTime.reason}</p>
              </div>

              {visitToReviewTime.timeNegotiationNotes && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-600 font-medium mb-1">Catatan Negosiasi:</p>
                  <p className="text-sm text-slate-900 whitespace-pre-wrap">{visitToReviewTime.timeNegotiationNotes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsTimeNegotiationReviewOpen(false);
                setVisitToReviewTime(null);
              }}
              disabled={isRespondingTime}
            >
              Tutup
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleTimeNegotiationResponse("reject")}
              disabled={isRespondingTime}
              className="gap-2"
            >
              {isRespondingTime ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              Tolak Waktu
            </Button>
            <Button
              onClick={() => handleTimeNegotiationResponse("approve")}
              disabled={isRespondingTime}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              {isRespondingTime ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Setujui Waktu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
