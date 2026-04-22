import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { pusherServer, VISIT_CHANNEL, VISIT_BOOKED_EVENT } from "@/lib/pusher";

// GET - Mengambil kunjungan (filter berdasarkan studentId atau teacherId)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const teacherId = searchParams.get("teacherId");
    const role = searchParams.get("role");

    // Build where clause berdasarkan role dan parameter
    let whereClause: Record<string, unknown> = {};

    if (studentId) {
      // Filter untuk student melihat kunjungan mereka sendiri
      whereClause.studentId = studentId;
    } else if (teacherId && role === "SUPER_ADMIN") {
      // Koordinator bisa melihat:
      // 1. Visits yang ditujukan ke mereka sendiri
      // 2. Visits yang di-forward ke koordinator (forwardedToCoordinator = true)
      whereClause.OR = [
        { targetTeacherId: teacherId },
        { forwardedToCoordinator: true },
      ];
    } else if (teacherId) {
      // Admin biasa bisa melihat:
      // 1. Visits yang ditujukan kepada mereka
      // 2. Visits yang didelegasikan ke mereka (legacy)
      // 3. Visits yang di-assign ke mereka (delegasi baru)
      whereClause.OR = [
        { targetTeacherId: teacherId },
        { delegatedToTeacherId: teacherId },
        { assignedAdminId: teacherId },
      ];
    }

    const visits = await prisma.visit.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
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
        visitNotesTimeline: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Auto-cancel expired WAITING visits
    const now = new Date();
    for (const visit of visits) {
      if (visit.status === "WAITING" && visit.waitExpiredAt && now > visit.waitExpiredAt) {
        await prisma.visit.update({
          where: { id: visit.id },
          data: {
            status: "CANCELLED",
            notes: "Dibatalkan otomatis: waktu tunggu habis.",
          },
        });
        visit.status = "CANCELLED";
        visit.notes = "Dibatalkan otomatis: waktu tunggu habis.";
      }
    }

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
    const { studentName, class: studentClass, email, phone, visitDate, visitTime, reason, studentId, targetTeacherId } = body;

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

    // If studentId is provided, fetch student data first
    let studentData = null;
    if (studentId) {
      studentData = await prisma.student.findUnique({
        where: { id: studentId },
        select: {
          id: true,
          name: true,
          nisn: true,
          class: true,
          phone: true,
        },
      });

      if (!studentData) {
        return NextResponse.json(
          {
            success: false,
            error: "Data siswa tidak ditemukan",
          },
          { status: 404 }
        );
      }
    }

    const visit = await prisma.visit.create({
      data: {
        visitDate: new Date(visitDate),
        visitTime,
        reason,
        status: "PENDING",
        studentId: studentId || null,
        targetTeacherId: targetTeacherId || null,
        // Always populate these fields - use student data if logged in, or form data if anonymous
        studentName: studentData ? studentData.name : studentName,
        class: studentData ? studentData.class : studentClass,
        email: studentData ? null : email,
        phone: studentData ? studentData.phone : phone,
      },
    });

    // Trigger Pusher event agar user lain tahu slot ini sudah terisi
    if (targetTeacherId) {
      await pusherServer.trigger(VISIT_CHANNEL, VISIT_BOOKED_EVENT, {
        teacherId: targetTeacherId,
        visitDate,
        visitTime,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Kunjungan berhasil dijadwalkan",
      data: {
        id: visit.id,
        studentName: visit.studentName,
        class: visit.class,
        email: visit.email,
        phone: visit.phone,
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
