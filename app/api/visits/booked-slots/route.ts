import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Mengambil slot waktu yang sudah terisi untuk guru & tanggal tertentu
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get("teacherId");
    const date = searchParams.get("date");

    if (!teacherId || !date) {
      return NextResponse.json(
        {
          success: false,
          error: "teacherId dan date wajib diisi",
        },
        { status: 400 }
      );
    }

    // Cari semua kunjungan yang aktif (pending/approved/forwarded) pada guru & tanggal tersebut
    const bookedVisits = await prisma.visit.findMany({
      where: {
        targetTeacherId: teacherId,
        visitDate: new Date(date),
        status: {
          in: ["PENDING", "APPROVED", "FORWARDED"],
        },
      },
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
