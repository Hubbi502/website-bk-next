import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Mengambil semua kunjungan
export async function GET(request: NextRequest) {
  try {
    const visits = await prisma.visit.findMany({
      include: {
        approver: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedVisits = visits.map((visit) => ({
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
    }));

    return NextResponse.json({
      success: true,
      data: formattedVisits,
    });
  } catch (error) {
    console.error("Error fetching visits:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal mengambil data kunjungan",
      },
      { status: 500 }
    );
  }
}

// POST - Menambah kunjungan baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentName, class: studentClass, email, phone, visitDate, visitTime, reason, studentId } = body;

    // Validasi input
    if (!visitDate || !visitTime || !reason) {
      return NextResponse.json(
        {
          success: false,
          error: "Tanggal, waktu, dan alasan wajib diisi",
        },
        { status: 400 }
      );
    }

    // If not authenticated, require manual fields
    if (!studentId && (!studentName || !studentClass)) {
      return NextResponse.json(
        {
          success: false,
          error: "Nama dan kelas wajib diisi",
        },
        { status: 400 }
      );
    }

    const visit = await prisma.visit.create({
      data: {
        visitDate: new Date(visitDate),
        visitTime,
        reason,
        status: "PENDING",
        studentId: studentId || null,
        studentName: !studentId ? studentName : null,
        class: !studentId ? studentClass : null,
        email: !studentId ? email : null,
        phone: !studentId ? phone : null,
      },
      include: {
        student: studentId ? {
          select: {
            id: true,
            name: true,
            nisn: true,
            class: true,
            phone: true,
          },
        } : false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Kunjungan berhasil dijadwalkan",
      data: {
        id: visit.id,
        studentName: visit.student ? visit.student.name : visit.studentName,
        class: visit.student ? visit.student.class : visit.class,
        email: visit.email, // email untuk anonymous, kosong untuk logged in student
        phone: visit.student ? visit.student.phone : visit.phone,
        visitDate: visit.visitDate.toISOString().split("T")[0],
        visitTime: visit.visitTime,
        reason: visit.reason,
        status: visit.status.toLowerCase(),
        createdAt: visit.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error creating visit:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal menjadwalkan kunjungan",
      },
      { status: 500 }
    );
  }
}
