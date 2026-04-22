import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Mengambil slot waktu yang sudah terisi untuk guru & tanggal tertentu
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get("teacherId");
    const date = searchParams.get("date");
    const excludeVisitId = searchParams.get("excludeVisitId");

    if (!teacherId || !date) {
      return NextResponse.json(
        {
          success: false,
          error: "teacherId dan date wajib diisi",
        },
        { status: 400 }
      );
    }

    // Cari semua kunjungan yang aktif pada guru & tanggal tersebut
    const whereClause: Record<string, unknown> = {
      targetTeacherId: teacherId,
      visitDate: new Date(date),
      status: {
        in: [
          "PENDING",
          "AWAITING_STUDENT",
          "PENDING_DELEGATION",
          "PENDING_TIME_NEGOTIATION",
          "APPROVED",
          "FORWARDED",
        ],
      },
    };

    // Exclude visit ID jika diberikan (untuk negosiasi waktu agar tidak bentrok dengan diri sendiri)
    if (excludeVisitId) {
      whereClause.id = { not: excludeVisitId };
    }

    const bookedVisits = await prisma.visit.findMany({
      where: whereClause,
      select: {
        visitTime: true,
      },
    });

    const bookedSlots = bookedVisits.map((v) => v.visitTime);

    return NextResponse.json({
      success: true,
      data: bookedSlots,
    });
  } catch (error) {
    console.error("Error fetching booked slots:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal mengambil data slot waktu",
      },
      { status: 500 }
    );
  }
}

