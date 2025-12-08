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
  FileEdit
} from "lucide-react";
interface Visit {
  id: string;
  studentName: string;
  class: string;
  email?: string;
  phone?: string;
  visitDate: string;
  visitTime: string;
  reason: string;
  status: "pending" | "approved" | "completed" | "cancelled";
  notes?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

interface VisitManagementProps {
  visits: Visit[];
  loadVisits: () => void;
  getStatusBadge: (status: Visit["status"]) => JSX.Element;
}

export function VisitManagement({ visits, loadVisits, getStatusBadge }: VisitManagementProps) {
  const { toast } = useToast();
  const [filteredVisits, setFilteredVisits] = useState<Visit[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [visitNotes, setVisitNotes] = useState("");

  useEffect(() => {
    let result = [...visits];

    // Filter berdasarkan status
    if (filterStatus !== "all") {
      result = result.filter(v => v.status === filterStatus);
    }

    // Search berdasarkan nama atau kelas
    if (searchQuery) {
      result = result.filter(v =>
        v.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.class.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort berdasarkan tanggal terbaru
    result.sort((a, b) => {
      const dateA = new Date(a.visitDate + ' ' + a.visitTime);
      const dateB = new Date(b.visitDate + ' ' + b.visitTime);
      return dateB.getTime() - dateA.getTime();
    });

    setFilteredVisits(result);
  }, [visits, filterStatus, searchQuery]);

  const handleUpdateVisitStatus = async (id: string, status: Visit["status"]) => {
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

      const statusText = {
        pending: "Pending",
        approved: "Disetujui",
        completed: "Selesai",
        cancelled: "Dibatalkan"
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

  const handleViewDetail = (visit: Visit) => {
    setSelectedVisit(visit);
    setVisitNotes(visit.notes || "");
    setIsDetailOpen(true);
  };

  const handleSaveNotes = async () => {
    if (!selectedVisit) return;

    try {
      const response = await fetch(`/api/visits/${selectedVisit.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes: visitNotes }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Gagal menyimpan catatan");
      }

      await loadVisits();
      setIsDetailOpen(false);
      toast({
        title: "Berhasil",
        description: "Catatan berhasil disimpan",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menyimpan catatan",
        variant: "destructive",
      });
    }
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
                  <SelectItem value="completed">Selesai</SelectItem>
                  <SelectItem value="cancelled">Dibatalkan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Statistics Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-700">Pending</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600 mt-2">
                {visits.filter(v => v.status === "pending").length}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-700">Disetujui</span>
              </div>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {visits.filter(v => v.status === "approved").length}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">Selesai</span>
              </div>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {visits.filter(v => v.status === "completed").length}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-700">Dibatalkan</span>
              </div>
              <p className="text-2xl font-bold text-red-600 mt-2">
                {visits.filter(v => v.status === "cancelled").length}
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold">Nama Murid</TableHead>
                  <TableHead className="font-semibold">Kelas</TableHead>
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
                    <TableCell colSpan={7} className="text-center text-slate-500 py-8">
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
                              {visit.studentName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {visit.studentName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{visit.class}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          {new Date(visit.visitDate).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
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
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetail(visit)}
                            title="Lihat Detail"
                          >
                            <FileEdit className="h-4 w-4" />
                          </Button>
                          {visit.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleUpdateVisitStatus(visit.id, "approved")}
                                className="bg-green-600 hover:bg-green-700"
                                title="Setujui"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleUpdateVisitStatus(visit.id, "cancelled")}
                                title="Tolak"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {visit.status === "approved" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateVisitStatus(visit.id, "completed")}
                              className="border-green-600 text-green-600 hover:bg-green-50"
                              title="Tandai Selesai"
                            >
                              Selesai
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Result Count */}
          {filteredVisits.length > 0 && (
            <div className="mt-4 text-sm text-slate-600">
              Menampilkan {filteredVisits.length} dari {visits.length} data kunjungan
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
                  <Label className="text-sm font-medium text-slate-600">Nama Murid</Label>
                  <p className="text-base font-semibold">{selectedVisit.studentName}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-600">Kelas</Label>
                  <p className="text-base font-semibold">{selectedVisit.class}</p>
                </div>
              </div>

              {(selectedVisit.email || selectedVisit.phone) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedVisit.email && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-600">Email</Label>
                      <p className="text-sm">{selectedVisit.email}</p>
                    </div>
                  )}
                  {selectedVisit.phone && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-600">No. Telepon</Label>
                      <p className="text-sm">{selectedVisit.phone}</p>
                    </div>
                  )}
                </div>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-600">Tanggal Kunjungan</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <p className="text-base">
                      {new Date(selectedVisit.visitDate).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-600">Waktu</Label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <p className="text-base">{selectedVisit.visitTime} WIB</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-600">Status</Label>
                <div>{getStatusBadge(selectedVisit.status)}</div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-600">Keperluan/Tujuan Kunjungan</Label>
                <p className="text-base p-3 bg-slate-50 rounded-lg">{selectedVisit.reason}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Catatan Guru BK</Label>
                <Textarea
                  id="notes"
                  placeholder="Tambahkan catatan tentang kunjungan ini..."
                  value={visitNotes}
                  onChange={(e) => setVisitNotes(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-600">Dibuat pada</Label>
                <p className="text-sm text-slate-500">
                  {new Date(selectedVisit.createdAt).toLocaleString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailOpen(false)}
            >
              Tutup
            </Button>
            <Button onClick={handleSaveNotes}>
              Simpan Catatan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
