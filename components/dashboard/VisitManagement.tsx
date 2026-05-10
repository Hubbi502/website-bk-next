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

  // Helper: check if this visit is delegated TO the current admin and pending acceptance
  const isDelegatedToMe = (visit: Visit) =>
    visit.delegatedToTeacherId === adminData?.id &&
    visit.delegationStatus === "pending";

  // Render action buttons based on role and visit state
  const renderActionButtons = (visit: Visit) => {
    const buttons: JSX.Element[] = [];

    // Detail button always available
    buttons.push(
      <Button
        key="detail"
        size="sm"
        variant="outline"
        onClick={() => handleViewDetail(visit)}
        title="Lihat Detail"
      >
        <FileEdit className="h-4 w-4" />
      </Button>,
    );

    // CASE 1: Visit is delegated to me and pending my acceptance
    if (isDelegatedToMe(visit)) {
      buttons.push(
        <Button
          key="accept"
          size="sm"
          onClick={() => handleAcceptDelegation(visit)}
          className="bg-green-600 hover:bg-green-700"
          title="Terima Delegasi"
        >
          <UserCheck className="h-4 w-4" />
        </Button>,
        <Button
          key="reject"
          size="sm"
          variant="destructive"
          onClick={() => handleRejectDelegation(visit)}
          title="Tolak Delegasi"
        >
          <UserX className="h-4 w-4" />
        </Button>,
      );
      return <div className="flex gap-2">{buttons}</div>;
    }

    // CASE 2: Pending visit targeted to me (regular teacher)
    if (visit.status === "pending" && visit.targetTeacherId === adminData?.id) {
      buttons.push(
        <Button
          key="approve"
          size="sm"
          onClick={() => handleUpdateVisitStatus(visit.id, "approved")}
          className="bg-green-600 hover:bg-green-700"
          title="Setujui Pertemuan"
        >
          <CheckCircle className="h-4 w-4" />
        </Button>,
        <Button
          key="forward"
          size="sm"
          variant="outline"
          onClick={() => handleOpenForwardDialog(visit)}
          className="border-blue-600 text-blue-600 hover:bg-blue-50"
          title="Serahkan ke Koordinator"
        >
          <Forward className="h-4 w-4" />
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
            size="sm"
            onClick={() => handleOpenDelegateDialog(visit)}
            className="bg-indigo-600 hover:bg-indigo-700"
            title="Delegasikan ke Guru Lain"
          >
            <ArrowRightLeft className="h-4 w-4" />
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
          size="sm"
          variant="outline"
          onClick={() => handleUpdateVisitStatus(visit.id, "completed")}
          className="border-green-600 text-green-600 hover:bg-green-50"
          title="Tandai Selesai"
        >
          Selesai
        </Button>,
      );
    }

    // CASE 5: Completed/Cancelled — allow delete
    if (visit.status === "completed" || visit.status === "cancelled") {
      buttons.push(
        <Button
          key="delete"
          size="sm"
          variant="destructive"
          onClick={() => handleDeleteClick(visit)}
          title="Hapus Data"
        >
          <Trash2 className="h-4 w-4" />
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
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Data Kunjungan Murid</CardTitle>
              <CardDescription>
                Daftar murid yang akan atau sudah berkunjung ke BK
              </CardDescription>
            </div>

            {/* Filter dan Search */}
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Input
                placeholder="Cari nama atau kelas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64"
              />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Disetujui</SelectItem>
                  <SelectItem value="forwarded">Diserahkan</SelectItem>
                  <SelectItem value="completed">Selesai</SelectItem>
                  <SelectItem value="cancelled">Dibatalkan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Statistics Summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-700">Pending</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600 mt-2">
                {visits.filter((v) => v.status === "pending").length}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Forward className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-700">Diserahkan</span>
              </div>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {visits.filter((v) => v.status === "forwarded").length}
              </p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-indigo-600" />
                <span className="text-sm text-indigo-700">Disetujui</span>
              </div>
              <p className="text-2xl font-bold text-indigo-600 mt-2">
                {visits.filter((v) => v.status === "approved").length}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">Selesai</span>
              </div>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {visits.filter((v) => v.status === "completed").length}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-700">Dibatalkan</span>
              </div>
              <p className="text-2xl font-bold text-red-600 mt-2">
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
                  <div className="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <h3 className="font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                      <ArrowRightLeft className="h-5 w-5" />
                      Panel Delegasi Koordinator
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <div className="bg-white p-3 rounded-lg border">
                        <p className="text-sm text-slate-600">
                          Total Diserahkan
                        </p>
                        <p className="text-xl font-bold text-indigo-600">
                          {forwardedVisits.length}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border">
                        <p className="text-sm text-slate-600">
                          Menunggu Delegasi
                        </p>
                        <p className="text-xl font-bold text-orange-600">
                          {awaitingDelegation.length}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border">
                        <p className="text-sm text-slate-600">
                          Menunggu Persetujuan Guru
                        </p>
                        <p className="text-xl font-bold text-amber-600">
                          {pendingAcceptance.length}
                        </p>
                      </div>
                    </div>
                    {awaitingDelegation.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-indigo-700">
                          Perlu didelegasikan:
                        </p>
                        {awaitingDelegation.map((v) => (
                          <div
                            key={v.id}
                            className="flex items-center justify-between bg-white p-3 rounded-lg border"
                          >
                            <div className="flex-1">
                              <span className="font-medium text-sm">
                                {v.studentName}
                              </span>
                              <span className="text-slate-500 text-sm ml-2">
                                ({typeof v.class === 'object' ? (v.class as any).name : v.class})
                              </span>
                              <span className="text-slate-400 text-xs ml-2">
                                — {v.reason.substring(0, 60)}
                                {v.reason.length > 60 ? "..." : ""}
                              </span>
                              {v.targetTeacher && (
                                <span className="text-xs text-slate-400 ml-2">
                                  dari: {v.targetTeacher.name}
                                </span>
                              )}
                              {v.notes && (
                                <p className="text-xs text-orange-600 mt-1">
                                  Alasan penyerahan:{" "}
                                  {v.forwardReason || v.notes}
                                </p>
                              )}
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleOpenDelegateDialog(v)}
                              className="bg-indigo-600 hover:bg-indigo-700 ml-2"
                            >
                              <ArrowRightLeft className="h-4 w-4 mr-1" />
                              Delegasikan
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    {pendingAcceptance.length > 0 && (
                      <div className="space-y-2 mt-3">
                        <p className="text-sm font-medium text-amber-700">
                          Menunggu persetujuan guru:
                        </p>
                        {pendingAcceptance.map((v) => (
                          <div
                            key={v.id}
                            className="flex items-center justify-between bg-white p-3 rounded-lg border"
                          >
                            <div className="flex-1">
                              <span className="font-medium text-sm">
                                {v.studentName}
                              </span>
                              <span className="text-slate-500 text-sm ml-2">
                                ({typeof v.class === 'object' ? (v.class as any).name : v.class})
                              </span>
                              {v.delegatedToTeacher && (
                                <Badge
                                  variant="outline"
                                  className="ml-2 text-xs bg-amber-50 text-amber-700 border-amber-200"
                                >
                                  Didelegasikan ke {v.delegatedToTeacher.name}
                                </Badge>
                              )}
                            </div>
                            <Badge
                              variant="outline"
                              className="text-xs bg-yellow-50 text-yellow-700"
                            >
                              Menunggu
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
                  <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                      <UserCheck className="h-5 w-5" />
                      Delegasi Masuk — Perlu Persetujuan Anda
                    </h3>
                    <div className="space-y-2">
                      {delegatedToMe.map((v) => (
                        <div
                          key={v.id}
                          className="flex items-center justify-between bg-white p-3 rounded-lg border"
                        >
                          <div className="flex-1">
                            <span className="font-medium text-sm">
                              {v.studentName}
                            </span>
                            <span className="text-slate-500 text-sm ml-2">
                              ({typeof v.class === 'object' ? (v.class as any).name : v.class})
                            </span>
                            <p className="text-xs text-slate-500 mt-1">
                              {v.reason.substring(0, 80)}
                              {v.reason.length > 80 ? "..." : ""}
                            </p>
                            {v.targetTeacher && (
                              <p className="text-xs text-slate-400 mt-1">
                                Guru asal: {v.targetTeacher.name}
                              </p>
                            )}
                            {v.delegationNotes && (
                              <p className="text-xs text-indigo-600 mt-1">
                                Catatan koordinator: {v.delegationNotes}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(v.visitDate).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                              <Clock className="h-3 w-3 ml-1" />
                              {v.visitTime}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-2">
                            <Button
                              size="sm"
                              onClick={() => handleAcceptDelegation(v)}
                              className="bg-green-600 hover:bg-green-700"
                              title="Terima & Setujui"
                            >
                              <UserCheck className="h-4 w-4 mr-1" />
                              Terima
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectDelegation(v)}
                              title="Tolak Delegasi"
                            >
                              <UserX className="h-4 w-4 mr-1" />
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

          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold">Nama Murid</TableHead>
                  <TableHead className="font-semibold">Kelas</TableHead>
                  <TableHead className="font-semibold">Guru BK</TableHead>
                  <TableHead className="font-semibold">Tanggal</TableHead>
                  <TableHead className="font-semibold">Waktu</TableHead>
                  <TableHead className="font-semibold">Keperluan</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Aksi</TableHead>
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

      {/* Dialog untuk detail kunjungan */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Kunjungan</DialogTitle>
            <DialogDescription>
              Informasi lengkap tentang kunjungan murid
            </DialogDescription>
          </DialogHeader>
          {selectedVisit && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-600">
                    Nama Murid
                  </Label>
                  <p className="text-base font-semibold">
                    {selectedVisit.studentName}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-600">
                    Kelas
                  </Label>
                  <p className="text-base font-semibold">
                    {selectedVisit.class}
                  </p>
                </div>
              </div>

              {(selectedVisit.email || selectedVisit.phone) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedVisit.email && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-600">
                        Email
                      </Label>
                      <p className="text-sm">{selectedVisit.email}</p>
                    </div>
                  )}
                  {selectedVisit.phone && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-600">
                        No. Telepon
                      </Label>
                      <p className="text-sm">{selectedVisit.phone}</p>
                    </div>
                  )}
                </div>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-600">
                    Tanggal Kunjungan
                  </Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <p className="text-base">
                      {new Date(selectedVisit.visitDate).toLocaleDateString(
                        "id-ID",
                        {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        },
                      )}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-600">
                    Waktu
                  </Label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <p className="text-base">{selectedVisit.visitTime} WIB</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-600">
                  Status
                </Label>
                <div>{getStatusBadge(selectedVisit.status)}</div>
              </div>

              {selectedVisit.targetTeacher && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-600">
                    Guru BK yang Dipilih
                  </Label>
                  <p className="text-base font-semibold">
                    {selectedVisit.targetTeacher.name}
                  </p>
                </div>
              )}

              {/* Delegation info in detail */}
              {selectedVisit.forwardedToCoordinator && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-600">
                    Info Delegasi
                  </Label>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-2">
                    <p className="text-sm text-blue-800">
                      <strong>Status:</strong> Diserahkan ke koordinator
                    </p>
                    {selectedVisit.forwardReason && (
                      <p className="text-sm text-blue-800">
                        <strong>Alasan penyerahan:</strong>{" "}
                        {selectedVisit.forwardReason}
                      </p>
                    )}
                    {selectedVisit.delegatedToTeacher && (
                      <p className="text-sm text-blue-800">
                        <strong>Didelegasikan ke:</strong>{" "}
                        {selectedVisit.delegatedToTeacher.name}
                        {selectedVisit.delegationStatus && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {selectedVisit.delegationStatus === "pending"
                              ? "Menunggu Persetujuan"
                              : selectedVisit.delegationStatus === "accepted"
                                ? "Diterima"
                                : "Ditolak"}
                          </Badge>
                        )}
                      </p>
                    )}
                    {selectedVisit.delegationNotes && (
                      <p className="text-sm text-blue-800">
                        <strong>Catatan delegasi:</strong>{" "}
                        {selectedVisit.delegationNotes}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-600">
                  Keperluan/Tujuan Kunjungan
                </Label>
                <p className="text-base p-3 bg-slate-50 rounded-lg">
                  {selectedVisit.reason}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold text-slate-800">
                    Timeline Catatan Pertemuan
                  </Label>
                  <Badge variant={selectedVisit.status === "completed" ? "default" : "secondary"}>
                    {selectedVisit.status === "completed" ? "Selesai" : "Sedang Berlangsung"}
                  </Badge>
                </div>
                
                {/* Timeline Notes */}
                {selectedVisit.visitNotesTimeline && selectedVisit.visitNotesTimeline.length > 0 ? (
                  <div className="space-y-4 pl-4 border-l-2 border-slate-200">
                    {selectedVisit.visitNotesTimeline.map((note, idx) => (
                      <div key={note.id || idx} className="relative">
                        <div className={`absolute -left-[25px] mt-1 h-3 w-3 rounded-full border-2 ${note.isSolved ? 'bg-green-500 border-green-500' : 'bg-white border-slate-400'}`}></div>
                        <div className="bg-slate-50 border p-3 rounded-lg mb-2">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-semibold text-sm">Pertemuan {idx + 1}</span>
                            <span className="text-xs text-slate-500">
                              {new Date(note.createdAt).toLocaleString("id-ID", {
                                day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">{note.note}</p>
                          <div className="mt-2 text-xs font-medium">
                            Status: <span className={note.isSolved ? "text-green-600" : "text-amber-600"}>{note.isSolved ? "Masalah Selesai (Solved)" : "Belum Selesai"}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4 bg-slate-50 rounded-lg text-slate-500 text-sm italic">
                    Belum ada catatan pertemuan untuk kunjungan ini.
                  </div>
                )}
                
                {/* Add new note form */}
                {selectedVisit.status !== "completed" && (
                  <div className="mt-6 space-y-3 bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                    <Label htmlFor="newNote" className="font-semibold text-slate-800">Tambah Catatan Pertemuan Baru</Label>
                    <Textarea
                      id="newNote"
                      placeholder="Ketik catatan pertemuan kali ini..."
                      value={newMeetingNote}
                      onChange={(e) => setNewMeetingNote(e.target.value)}
                      rows={4}
                      className="bg-slate-50"
                    />
                    <div className="flex items-center space-x-2 mt-2">
                      <input 
                        type="checkbox" 
                        id="isSolved" 
                        checked={isMeetingSolved}
                        onChange={(e) => setIsMeetingSolved(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                      />
                      <Label htmlFor="isSolved" className="text-sm font-medium cursor-pointer">
                        Tandai masalah telah selesai (Solved)
                      </Label>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-600">
                  Dibuat pada
                </Label>
                <p className="text-sm text-slate-500">
                  {new Date(selectedVisit.createdAt).toLocaleString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Tutup
            </Button>
            {selectedVisit?.status !== "completed" && (
              <Button onClick={handleAddMeetingNote} disabled={isAddingNote || !newMeetingNote.trim()}>
                {isAddingNote ? "Menyimpan..." : "Simpan Catatan Baru"}
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
    </div>
  );
}
