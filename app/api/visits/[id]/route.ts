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
      class: visit.class,
      email: visit.email,
      phone: visit.phone,
      visitDate: visit.visitDate.toISOString().split("T")[0],
      visitTime: visit.visitTime,
      reason: visit.reason,
      status: visit.status.toLowerCase(),
      notes: visit.notes,
      approvedBy: visit.approver?.name || null,
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

// PUT/PATCH - Update kunjungan (untuk approve/reject/update status)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const visitId = id;



    const body = await request.json();
    const { status, notes, approvedBy } = body;

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

    // Update visit
    const updatedVisit = await prisma.visit.update({
      where: { id: visitId },
      data: {
        ...(status && { status: status.toUpperCase() }),
        ...(notes !== undefined && { notes }),
        ...(approvedBy && { approvedBy }),
      },
      include: {
        approver: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    const formattedVisit = {
      id: updatedVisit.id,
      studentName: updatedVisit.studentName,
      class: updatedVisit.class,
      email: updatedVisit.email,
      phone: updatedVisit.phone,
      visitDate: updatedVisit.visitDate.toISOString().split("T")[0],
      visitTime: updatedVisit.visitTime,
      reason: updatedVisit.reason,
      status: updatedVisit.status.toLowerCase(),
      notes: updatedVisit.notes,
      approvedBy: updatedVisit.approver?.name || null,
      createdAt: updatedVisit.createdAt.toISOString(),
      updatedAt: updatedVisit.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "Status kunjungan berhasil diperbarui",
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
