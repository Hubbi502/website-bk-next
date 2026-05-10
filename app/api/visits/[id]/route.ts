import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Mengambil kunjungan berdasarkan ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const visitId = id;

    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        approver: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        targetTeacher: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        delegatedToTeacher: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        assignedAdmin: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        class: true,
        visitNotesTimeline: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!visit) {
      return NextResponse.json(
        {
          success: false,
          error: "Kunjungan tidak ditemukan",
        },
        { status: 404 }
      );
    }

    const formattedVisit = {
      id: visit.id,
      studentName: visit.studentName,
      class: visit.class?.name || "Tidak ada kelas",
      email: visit.email,
      phone: visit.phone,
      visitDate: visit.visitDate.toISOString().split("T")[0],
      visitTime: visit.visitTime,
      reason: visit.reason,
      status: visit.status.toLowerCase(),
      notes: visit.notes,
      approvedBy: visit.approver?.name || null,
      targetTeacherId: visit.targetTeacherId,
      targetTeacher: visit.targetTeacher ? {
        id: visit.targetTeacher.id,
        name: visit.targetTeacher.name,
        role: visit.targetTeacher.role,
      } : null,
      forwardedToCoordinator: visit.forwardedToCoordinator,
      forwardReason: visit.forwardReason,
      delegatedToTeacherId: visit.delegatedToTeacherId,
      delegatedToTeacher: visit.delegatedToTeacher ? {
        id: visit.delegatedToTeacher.id,
        name: visit.delegatedToTeacher.name,
        role: visit.delegatedToTeacher.role,
      } : null,
      delegationStatus: visit.delegationStatus?.toLowerCase() || null,
      delegationNotes: visit.delegationNotes,
      assignedAdminId: visit.assignedAdminId,
      assignedAdmin: visit.assignedAdmin ? {
        id: visit.assignedAdmin.id,
        name: visit.assignedAdmin.name,
        role: visit.assignedAdmin.role,
      } : null,
      rejectedAdminIds: visit.rejectedAdminIds || [],
      delegationStep: visit.delegationStep || 0,
      proposedVisitDate: visit.proposedVisitDate ? visit.proposedVisitDate.toISOString().split("T")[0] : null,
      proposedVisitTime: visit.proposedVisitTime || null,
      timeNegotiationStep: visit.timeNegotiationStep || 0,
      timeNegotiationNotes: visit.timeNegotiationNotes || null,
      waitDurationMinutes: visit.waitDurationMinutes || null,
      waitExpiredAt: visit.waitExpiredAt ? visit.waitExpiredAt.toISOString() : null,
      visitNotesTimeline: visit.visitNotesTimeline || [],
      createdAt: visit.createdAt.toISOString(),
      updatedAt: visit.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: formattedVisit,
    });
  } catch (error) {
    console.error("Error fetching visit:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal mengambil data kunjungan",
      },
      { status: 500 }
    );
  }
}

// PUT/PATCH - Update kunjungan (untuk approve/reject/forward/delegate)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const visitId = id;

    const body = await request.json();
    const { action, status, notes, approvedBy, delegatedToTeacherId, delegationNotes, forwardReason, waitDurationMinutes } = body;

    // Check if visit exists
    const existingVisit = await prisma.visit.findUnique({
      where: { id: visitId },
    });

    if (!existingVisit) {
      return NextResponse.json(
        {
          success: false,
          error: "Kunjungan tidak ditemukan",
        },
        { status: 404 }
      );
    }

    let updateData: Record<string, unknown> = {};

    switch (action) {
      case "forward":
        // Guru menyerahkan ke koordinator
        updateData = {
          status: "FORWARDED",
          forwardedToCoordinator: true,
          forwardReason: forwardReason || notes || null,
          notes: notes || existingVisit.notes,
        };
        break;

      case "delegate":
        // Koordinator mendelegasikan ke guru lain
        if (!delegatedToTeacherId) {
          return NextResponse.json(
            { success: false, error: "Harus memilih guru untuk didelegasikan" },
            { status: 400 }
          );
        }
        updateData = {
          delegatedToTeacherId,
          delegationStatus: "PENDING",
          delegationNotes: delegationNotes || null,
        };
        break;

      case "accept_delegation":
        // Guru menerima delegasi
        updateData = {
          status: "APPROVED",
          delegationStatus: "ACCEPTED",
          approvedBy: approvedBy || null,
          // Update targetTeacher ke guru yang menerima delegasi
          targetTeacherId: existingVisit.delegatedToTeacherId,
        };
        break;

      case "reject_delegation":
        // Guru menolak delegasi - kembali ke FORWARDED agar koordinator bisa re-delegate
        updateData = {
          delegatedToTeacherId: null,
          delegationStatus: null,
          delegationNotes: null,
          // Status tetap FORWARDED agar koordinator bisa pilih guru lain
        };
        break;

      case "wait":
        // Guru meminta siswa menunggu dengan durasi tertentu
        const duration = parseInt(waitDurationMinutes) || 15;
        const waitExpiredAt = new Date(Date.now() + duration * 60000);
        updateData = {
          status: "WAITING",
          waitDurationMinutes: duration,
          waitExpiredAt: waitExpiredAt,
          approvedBy: approvedBy || null,
        };
        break;

      default:
        // Legacy behavior: update status/notes/approvedBy langsung
        updateData = {
          ...(status && { status: status.toUpperCase() }),
          ...(notes !== undefined && { notes }),
          ...(approvedBy && { approvedBy }),
        };
        break;
    }

    // Update visit
    const updatedVisit = await prisma.visit.update({
      where: { id: visitId },
      data: updateData,
      include: {
        approver: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        targetTeacher: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        delegatedToTeacher: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        assignedAdmin: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        class: true,
      },
    });

    const actionMessages: Record<string, string> = {
      forward: "Kunjungan berhasil diserahkan ke koordinator",
      delegate: "Kunjungan berhasil didelegasikan ke guru lain",
      accept_delegation: "Delegasi berhasil diterima",
      reject_delegation: "Delegasi berhasil ditolak",
      wait: "Siswa diminta menunggu",
    };

    const formattedVisit = {
      id: updatedVisit.id,
      studentName: updatedVisit.studentName,
      class: updatedVisit.class?.name || "Tidak ada kelas",
      email: updatedVisit.email,
      phone: updatedVisit.phone,
      visitDate: updatedVisit.visitDate.toISOString().split("T")[0],
      visitTime: updatedVisit.visitTime,
      reason: updatedVisit.reason,
      status: updatedVisit.status.toLowerCase(),
      notes: updatedVisit.notes,
      approvedBy: updatedVisit.approver?.name || null,
      targetTeacherId: updatedVisit.targetTeacherId,
      targetTeacher: updatedVisit.targetTeacher ? {
        id: updatedVisit.targetTeacher.id,
        name: updatedVisit.targetTeacher.name,
        role: updatedVisit.targetTeacher.role,
      } : null,
      forwardedToCoordinator: updatedVisit.forwardedToCoordinator,
      forwardReason: updatedVisit.forwardReason,
      delegatedToTeacherId: updatedVisit.delegatedToTeacherId,
      delegatedToTeacher: updatedVisit.delegatedToTeacher ? {
        id: updatedVisit.delegatedToTeacher.id,
        name: updatedVisit.delegatedToTeacher.name,
        role: updatedVisit.delegatedToTeacher.role,
      } : null,
      delegationStatus: updatedVisit.delegationStatus?.toLowerCase() || null,
      delegationNotes: updatedVisit.delegationNotes,
      assignedAdminId: updatedVisit.assignedAdminId,
      assignedAdmin: updatedVisit.assignedAdmin ? {
        id: updatedVisit.assignedAdmin.id,
        name: updatedVisit.assignedAdmin.name,
        role: updatedVisit.assignedAdmin.role,
      } : null,
      rejectedAdminIds: updatedVisit.rejectedAdminIds || [],
      delegationStep: updatedVisit.delegationStep || 0,
      proposedVisitDate: updatedVisit.proposedVisitDate ? updatedVisit.proposedVisitDate.toISOString().split("T")[0] : null,
      proposedVisitTime: updatedVisit.proposedVisitTime || null,
      timeNegotiationStep: updatedVisit.timeNegotiationStep || 0,
      timeNegotiationNotes: updatedVisit.timeNegotiationNotes || null,
      waitDurationMinutes: updatedVisit.waitDurationMinutes || null,
      waitExpiredAt: updatedVisit.waitExpiredAt ? updatedVisit.waitExpiredAt.toISOString() : null,
      createdAt: updatedVisit.createdAt.toISOString(),
      updatedAt: updatedVisit.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: action ? actionMessages[action] || "Status kunjungan berhasil diperbarui" : "Status kunjungan berhasil diperbarui",
      data: formattedVisit,
    });
  } catch (error) {
    console.error("Error updating visit:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal memperbarui status kunjungan",
      },
      { status: 500 }
    );
  }
}

// DELETE - Hapus kunjungan
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const visitId = id;

    // Check if visit exists
    const existingVisit = await prisma.visit.findUnique({
      where: { id: visitId },
    });

    if (!existingVisit) {
      return NextResponse.json(
        {
          success: false,
          error: "Kunjungan tidak ditemukan",
        },
        { status: 404 }
      );
    }

    // Delete visit
    await prisma.visit.delete({
      where: { id: visitId },
    });

    return NextResponse.json({
      success: true,
      message: "Kunjungan berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting visit:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal menghapus kunjungan",
      },
      { status: 500 }
    );
  }
}

// PATCH - Alias untuk PUT
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return PUT(request, { params });
}
